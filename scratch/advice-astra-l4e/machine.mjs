import assert from 'node:assert/strict';

export const H = .0125, SLIP = .06, ERR = .07;
const trunc = (x,l,h) => Math.max(l,Math.min(h,x));
const ir = x => Math.sign(x)*Math.floor(Math.abs(x)+.5);
const round = (x,k) => trunc(ir(x*k),-k,k)/k;
const enc = (x,n) => x < 0 ? -x+(1<<(n-1)) : x;
const dec = (x,n) => { const m=1<<(n-1); return (x&m ? -1:1)*(x&(m-1)); };
const vcode = x => enc(ir(3*x),3);
const vget = (q,shift) => dec(q>>shift,3)/3;
const bytePrev = y => y<0 ? 1:2;
const prev = q => [0,-1,1,0][q&3];
export const wval = state => dec(state>>>12,4)/7;
const wcode = x => enc(ir(7*trunc(x,-1,1)),4);
const signBit = (i,b) => i&(1<<b) ? 1:-1;
export const reliability = (1-2*ERR)*(1-2*H)*(1-2*SLIP);
const goal = Array.from({length:8},(_,i)=>reliability*signBit(i,0)*signBit(i,1)*signBit(i,2));
const trans = Array.from({length:8},(_,i)=>Array.from({length:8},(_,j)=>{
  const [s,v,a]=[0,1,2].map(b=>signBit(i,b)), [sn,vn,an]=[0,1,2].map(b=>signBit(j,b));
  return sn!==s*vn ? 0 : (an===a?1-H:H)*(vn===v*an?1-SLIP:SLIP);
}));
for(const row of trans) assert(Math.abs(row.reduce((a,b)=>a+b)-1)<1e-12);
function observe(prior,y) {
  const p=prior.map((b,i)=>b*(signBit(i,0)===y?1-ERR:ERR)), z=p.reduce((a,b)=>a+b);
  const future=trans[0].map((_,j)=>p.reduce((sum,b,i)=>sum+b*trans[i][j],0)/z);
  return [future,p.reduce((sum,b,i)=>sum+b*goal[i],0)/z];
}
const uniform=Array(8).fill(1/8), cache=new Map();
function bayes(c) {
  const key=`${c.k}:${c.n}`;
  if(cache.has(key))return cache.get(key);
  const qnext=new Uint16Array(8192), forecast=new Float64Array(8192);
  let init=0;
  if(c.k==='window'){
    const mask=(1<<c.n)-1, lut=new Float64Array(mask+1);
    for(let h=0;h<=mask;h++){
      let p=uniform;
      for(let j=c.n-1;j>=0;j--) [p,lut[h]]=observe(p,signBit(h,j));
    }
    for(let i=0;i<8192;i++) {qnext[i]=i&mask;forecast[i]=lut[qnext[i]];}
  } else {
    const list=[];
    function compositions(prefix,left) {
      if(prefix.length===7) {list.push([...prefix,left]);return;}
      for(let v=0;v<=left;v++)compositions([...prefix,v],left-v);
    }
    compositions([],c.n);assert(list.length<=4096);
    const index=new Map(list.map((p,i)=>[p.join(),i]));
    function nearest(pr) {
      const p=pr.map(x=>x*c.n), counts=p.map(Math.floor), left=c.n-counts.reduce((a,b)=>a+b);
      const order=p.map((v,i)=>[v-counts[i],i]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]);
      for(let j=0;j<left;j++)counts[order[j][1]]++;
      return index.get(counts.join());
    }
    init=nearest(uniform);
    for(let i=0;i<8192;i++) {
      const p=list[i>>1]??uniform, [f,g]=observe(p,signBit(i,0));
      qnext[i]=nearest(f);forecast[i]=g;
    }
  }
  const result={init,qnext,forecast};cache.set(key,result);return result;
}

const rates=Array.from({length:8},(_,j)=>2**(j-7));
const rateCode = x => trunc(ir(Math.log2(x))+7,0,7);
const modes=new Set(['hard','soft','meta','reset','off','oracle','sham','evo']);
function step(c,q,y,bit,B) {
  if(B){const i=(q<<1)|(y>0);return {next:B.qnext[i],goal:B.forecast[i]};}
  if(c.k==='full')return {next:0,goal:bit?reliability:-reliability};
  if(c.k==='null'||c.k==='fixed')return {next:0,z:c.z??0};
  const last=prev(q), u=y*last, vel=vget(q,2), ori=c.ori??1;
  let b, v, aux=0;
  if(modes.has(c.k)){
    const oldB=vget(q,5), s=dec(q>>8,4);
    const score=c.k==='evo'?s:trunc(ir(c.leak*s+3*oldB*u),-7,7);
    b=last?round(vel+c.beta*(u-vel),3):0;
    const direction=Math.sign(score)||ori;
    if(c.k==='oracle'){
      const common=bytePrev(y)|(vcode(b)<<5)|(enc(score,4)<<8);
      return {base:b,common,goal:bit?reliability:-reliability};
    }
    if(c.k==='sham')v=0;
    else if(c.k==='soft')v=round(b*score/7,3);
    else if(c.k==='hard')v=score===0?ori*b:score>0?b:-b;
    else v=direction*b;
    aux=(vcode(b)<<5)|(enc(score,4)<<8);
  } else if(c.k==='constant') {
    b=last?round(vel+c.beta*(u-vel),3):0;v=ori*b;
  } else if(c.k==='rms'){
    const d=u-vel, norm=((q>>5)&15)*4/15;
    const updated=trunc(ir((c.decay*norm+(1-c.decay)*d*d)*15/4),0,15);
    const beta=trunc(c.scale/Math.sqrt(.01+4*updated/15),1/128,1);
    v=last?ori*round(vel+beta*d,3):0;
    aux=updated<<5;
  } else {
    assert(c.k==='idbd'||c.k==='autostep');
    const auto=c.k==='autostep';
    const ri=(q>>7)&7, trace=auto?dec(q>>5,2):dec(q>>5,3)/3;
    // IDBD's full three-bit trace uses 5..7 and its rate uses 8..10.
    const rate=auto?ri:(q>>8)&7, d=u-vel, g=d*trace;
    const norm=(q>>10)&3, nv=trunc(ir(Math.max(Math.abs(g),.875*norm+.125*Math.abs(g))),0,3);
    const r=last?trunc(ir(rate+c.theta*g/(auto?Math.max(1,nv):1)),0,7):rate;
    const beta=rates[r];
    v=last?ori*round(vel+beta*d,3):0;
    const tr=trunc(ori*((1-beta)*trace+beta*d),-1,1);
    aux=auto?(enc(ir(tr),2)<<5)|(r<<7)|(nv<<10):(vcode(tr)<<5)|(r<<8);
  }
  return {next:bytePrev(y)|(vcode(v)<<2)|aux,z:c.k==='off'?c.fixedZ:v};
}

export const BITE_WORDS=1<<18, BIRTH_WORDS=1<<20;
export const bite=(rom,word,taste,oracle)=>rom[(word<<2)|(taste<<1)|oracle];
export const inherit=(rom,word,token)=>rom[((word&4095)<<8)|token];
export function compile(c) {
  const B=c.k==='window'||c.k==='filter'?bayes(c):null;
  const next=new Uint16Array(BITE_WORDS), born=new Uint16Array(BIRTH_WORDS);
  const alpha=c.k==='off'?c.fixedAlpha:c.alpha;
  let init=B?.init??0;
  if(c.k==='idbd'||c.k==='autostep')init=rateCode(c.start)<<(c.k==='idbd'?8:7);
  for(let q=0;q<4096;q++){
    if(c.k==='evo'&&c.pm>=0) {
      for(let token=0;token<256;token++){
        // The spare sixteenth replacement code also denotes the neutral allele.
        const allele=(token&15)===15?0:(token&15)-7;
        born[(q<<8)|token]=(token>>4)<16*c.pm?(q&255)|(enc(allele,4)<<8):q;
      }
    } else born.fill(c.k==='reset'?q&255:q,q<<8,(q+1)<<8);
    for(let t=0;t<2;t++)for(let bit=0;bit<2;bit++){
      const y=2*t-1, s=step(c,q,y,bit,B);
      for(let h=0;h<16;h++){
        const w=dec(h,4)/7, write=z=>wcode(w+alpha*(y*z-w));
        let code, nq=s.next;
        if(c.k==='oracle'){
          const loss=z=>Math.abs(dec(write(z),4)/7-s.goal);
          const v=loss(s.base)<=loss(-s.base)?s.base:-s.base;
          code=write(v);nq=s.common|(vcode(v)<<2);
        } else if(c.k==='null')code=h;
        else if(s.goal!==undefined)code=write(trunc((s.goal-(1-alpha)*w)/(alpha*y),-1,1));
        else code=write(s.z);
        assert(nq>=0&&nq<4096);
        next[(h<<14)|(q<<2)|(t<<1)|bit]=(code<<12)|nq;
      }
    }
  }
  // Only the frozen tables and a scalar founder image cross the machine boundary.
  return {next,born,init,standing:c.k==='evo'&&c.pm>=0,oracle:c.k==='oracle'||c.k==='full'};
}
export function founder(image,i) {
  return image.standing ? (image.init&255)|(enc(i%15-7,4)<<8):image.init;
}
