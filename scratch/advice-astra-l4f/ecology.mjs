import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { WorldV, BASE_CFG, ALL_PAIRS as pairs, rng32, mix } from '../../microverse/l3v.mjs';

const source = readFileSync(new URL('../../microverse/l3v.mjs', import.meta.url), 'utf8');
const insert = (s, needle, replacement) => {
  assert.equal(s.split(needle).length, 2);
  return s.replace(needle, replacement);
};
let hooked = insert(source, 'if (LEARNS_ALPHA.has(l2)) {', 'if (LEARNS_ALPHA.has(l2)) { this.beforeWrite(f);');
hooked = insert(hooked, "} else if (l2 === 'reuse') {", "this.afterWrite(f); } else if (l2 === 'reuse') {");
const { WorldV: Hooked } = await import(`data:text/javascript;base64,${Buffer.from(hooked).toString('base64')}`);
export const GRID = [.006,.06,.30].flatMap(delta => [4,20].map(beta => ({delta,beta})));
export const ARMS = [
  {name:'NOREV',family:'NOREV'}, ...['uniform','deck'].map(f => ({name:`FIXED:${f}`,family:'FIXED',f})),
  ...GRID.map((_,k) => ({name:`C:${k}`,family:'C',k})),
  ...[0,.03,.15,.4].map(pm => ({name:`EVO:${pm}`,family:'EVO',pm})),
  ...['SUR','IDBD'].flatMap(family => GRID.flatMap((_,k) => (family==='SUR'?[.5,1.5]:[.05,.5])
    .map(rate => ({name:`${family}:${k}:${rate}`,family,k,rate})))),
  ...[8,16,32].flatMap(H => [0,.1].map(u => ({name:`BAYES:${H}:${u}`,family:'BAYES',H,u}))),
  ...GRID.flatMap((_,s) => GRID.flatMap((_,f) => s===f?[]:[{name:`O:${s}:${f}`,family:'O',s,f}]))
];
const D=4,T=80,G=24,F=18, HAZ=[1/640,1/64];
const bv = Array.from({length:4096},(_,o) => Array.from({length:12},(_,j) => o>>j&1?1:-1));
const parity = bv.map(bits => Int8Array.from(pairs,p => bits[p.a]*bits[p.b]));
const logit = p => Math.log(p/(1-p));
const clockKey=(g,d,i,tag) => mix(Math.imul(g+1,0x9e3779b1)^Math.imul(d+1,0x85ebca77)^Math.imul(i+1,0xc2b2ae3d)^tag);
const stream=(seed,g,d,i,tag)=>rng32(mix(seed^clockKey(g,d,i,tag)));
const ix = (r,n) => Math.floor(r()*n);
const idByMask=new Map(pairs.map((p,i)=>[p.mask,i]));

export function garden(seed) {
  assert(Number.isInteger(seed)&&seed>=3301&&seed<=3332);
  const r=rng32(mix(seed^0xd86ad9b)), tempo=[ix(r,2),0,ix(r,2),0];
  tempo[1]=1-tempo[0];tempo[3]=1-tempo[2];
  const position=Array.from({length:D},()=>ix(r,66)),sign=Array.from({length:D},()=>ix(r,2));
  const plots=Array.from({length:D},()=>[]),draws=[0,0],pulses=[0,0],swaps=[0,0];
  const hash=createHash('sha256');
  for(let t=0;t<T*G;t++){
    if(t&&t%T===0)for(const d of [0,2])if(r()<.125){
      [tempo[d],tempo[d+1]]=[tempo[d+1],tempo[d]]; swaps[d>>1]++;
    }
    for(let d=0;d<D;d++){
      const h=tempo[d];pulses[h]++;
      if(t&&r()<HAZ[h]){position[d]=ix(r,66);sign[d]=ix(r,2);draws[h]++;}
      const o=ix(r,4096), y=+(parity[o][position[d]]===(sign[d]?1:-1));
      const pulse={o,y,label:y^+(r()<.05),price:r(),tempo:h,mask:pairs[position[d]].mask};
      plots[d].push(pulse);hash.update(JSON.stringify(pulse));
    }
  }
  return {plots,draws,pulses,swaps,hash:hash.digest('hex'),cache:new Map()};
}

// q[z,k,sign] at the last observation; probability of switching tempos at birth
// is independent of the subsequent probability of resampling the food rule.
function transition(q,birth) {
  if(birth)for(let i=0;i<132;i++){
    const a=q[i],b=q[132+i];q[i]=.875*a+.125*b;q[132+i]=.125*a+.875*b;
  }
  for(let z=0;z<2;z++){
    const j=z*132,h=HAZ[z];let sum=0;
    for(let i=0;i<132;i++)sum+=q[j+i];
    for(let i=0;i<132;i++)q[j+i]=q[j+i]*(1-h)+h*sum/132;
  }
}
export function posterior(plot,t,len) {
  const q=new Float64Array(264).fill(1/264);
  for(let j=t-len;j<t;j++){
    if(j>t-len)transition(q,j%T===0);
    const {o,label}=plot[j],ps=parity[o];let mass=0;
    for(let z=0;z<2;z++)for(let k=0;k<66;k++){
        const i=z*132+2*k,like=((ps[k]>0)===!!label) ? .95 : .05;
      mass+=(q[i]*=1-like)+(q[i+1]*=like);
    }
    for(let i=0;i<264;i++)q[i]/=mass;
  }
  if(len)transition(q,t%T===0);
  return Float64Array.from(pairs,(_,k)=>q[2*k]+q[2*k+1]+q[132+2*k]+q[133+2*k]);
}

class Learner extends Hooked {
  beforeWrite(f) {
    const a=this.policy;
    let k=a.family==='O'?(this.tempo?a.f:a.s):f.k;
    let fresh=-1;
    for(let j=1;j<f.masks.length;j++)if(f.maskAge[j]>=this.cfg.graceTastings&&Math.abs(f.w[j])>=this.cfg.valThresh){
      const m=f.masks[j], admitted=f.seen-f.maskAge[j];
      if(f.valid[m]!==admitted){f.valid[m]=admitted;this.tel.fresh++;if(fresh<0)fresh=idByMask.get(m);}
    }
    if(fresh>=0&&(a.family==='SUR'||a.family==='IDBD')){
      let Z=0,Zp=0,w=0,wp=0;
      for(let i=0;i<66;i++){
        const {a:x,b:y}=pairs[i],vx=f.alpha[x]+.02,vy=f.alpha[y]+.02;
        const prob=vx*vy,der=f.trace?f.trace[x]*vy+vx*f.trace[y]:0;
        Z+=prob;Zp+=der;if(i===fresh){w=prob;wp=der;}
      }
      if(a.family==='SUR'&&66*w/Z<a.rate){f.alpha.fill(1);this.tel.resets++;}
      if(a.family==='IDBD'){
        f.eta=Math.max(logit(.001),Math.min(logit(.6),f.eta+a.rate*(wp/w-Zp/Z)));
        this.tel.metaSteps++;
      }
    }
    const {delta,beta}=GRID[k], de=a.family==='IDBD'?1/(1+Math.exp(-f.eta)):delta;
    this.cfg.alphaDecay=de;this.cfg.alphaBoost=beta;
    if(f.trace)for(let b=0;b<12;b++)f.trace[b]=(1-de)*f.trace[b]-de*(1-de)*(f.alpha[b]-1);
  }
  afterWrite(f) {
    if(f.trace)for(let b=0;b<12;b++)if(f.alpha[b]>=this.cfg.alphaMax||f.alpha[b]<=.05)f.trace[b]=0;
  }
  drawCandidate(f,excl) {
    if(this.policy.family!=='BAYES')return super.drawCandidate(f,excl);
    const {H,u}=this.policy,len=Math.min(H,this.t-f.localSince),key=(this.t*4+this.d)*64+len;
    let p=this.env.cache.get(key);
    if(!p){p=posterior(this.env.plots[this.d],this.t,len);this.env.cache.set(key,p);}
    let z=0,last=-1;
    for(let i=0;i<66;i++)if(!excl.has(pairs[i].mask))z+=(1-u)*p[i]+u/66;
    let at=f.rProp()*z;
    for(let i=0;i<66;i++)if(!excl.has(pairs[i].mask)){
      last=pairs[i].mask;at-=(1-u)*p[i]+u/66;if(at<=0)return last;
    }
    return last;
  }
}
function host(seed,a,env) {
  const w=Object.create(Learner.prototype);
  w.cfg={...BASE_CFG};w.seed=seed;w.policy=a;w.env=env;
  const kind=a.family==='NOREV'||a.family==='BAYES'?'none':a.family==='FIXED'?(a.f==='deck'?'deck':'none'):'meta';
  w.arm={l1:a.family!=='NOREV',l2:kind};
  w.tel={fresh:0,l2Updates:0,correctAdm:0,inSubsetAdm:0,admissions:0,births:0,evBites:0,metaSteps:0,resets:0};
  w.subset=[];w.rule={target:[0]};
  return w;
}
function hatch(w,parent,g,d,i,local,genotype) {
  w.nextId=1+w.seed%65536+clockKey(g,d,i,0x1283);
  w.flies=[];
  const f=WorldV.prototype.spawn.call(w,parent,0,0,0,g);
  const r=stream(w.seed,g,d,i,0xb951);
  f.k=w.policy.family==='EVO'?(parent?(r()<w.policy.pm?ix(r,6):parent.k):genotype):w.policy.k??0;
  f.localSince=parent&&local?parent.localSince:g*T;f.valid={};f.profit=0;
  if(w.policy.family==='IDBD'){
    f.eta=parent?parent.eta:logit(GRID[f.k].delta);
    f.trace=parent?parent.trace.slice():new Float64Array(12);
  }
  return f;
}
export function run(seed,a,env) {
  const w=host(seed,a,env);
  let pops=Array.from({length:D},(_,d)=>{
    const ks=Array.from({length:F},(_,i)=>i%6),r=stream(seed,0,d,0,0xdec);
    for(let i=ks.length-1;i>0;i--){const j=ix(r,i+1);[ks[i],ks[j]]=[ks[j],ks[i]];}
    return ks.map((k,i)=>hatch(w,null,0,d,i,false,k));
  });
  let sum=0,births=0,deaths=0,migrants=0,bites=0,census=[],endKinds=[];
  for(let g=0;g<G;g++){
    const brood=Array.from({length:D},()=>[]);
    for(let d=0;d<D;d++) {
      w.d=d;
      for(let j=0;j<T;j++){
        const t=g*T+j,pulse=env.plots[d][t],bits=bv[pulse.o];w.t=t;w.tempo=pulse.tempo;w.rule.target[0]=pulse.mask;
        for(const f of pops[d]){
          if(w.tastePredict(f,bits)>pulse.price)f.profit+=pulse.y-pulse.price;
          w.tasteLearn(f,bits,pulse.label,t);bites++;
        }
      }
      const density=1+pops[d].length/12;
      for(let i=0;i<pops[d].length;i++){
        const f=pops[d][i],r=stream(seed,g,d,i,0x33d);
        const n=Math.floor(Math.max(0,.9+12*f.profit/T)/density+r());
        for(let j=0;j<n;j++)brood[d].push(f);
      }
    }
    const productivity=brood.map((b,d)=>b.length/(pops[d].length||1));
    const next=brood.map((b,d)=>b.map((parent,i)=>{
      const r=stream(seed,g,d,i,0xc115);let src=d;
      if(r()<.05){
        const options=[(d+1)%4,(d+2)%4,(d+3)%4],j=ix(r,3),k=(j+1+ix(r,2))%3;
        const dst=productivity[options[j]]>=productivity[options[k]]?options[j]:options[k];
        if(brood[dst].length){src=dst;parent=brood[src][ix(r,brood[src].length)];migrants++;}
      }
      return hatch(w,parent,g+1,d,i,src===d,0);
    }));
    const n=next.reduce((s,x)=>s+x.length,0);
    deaths+=pops.reduce((s,x)=>s+x.length,0);births+=n;pops=next;census.push(n);
    if(g>=G/2)sum+=n;
  }
  assert.equal(D*F+births-deaths,census.at(-1));assert.equal(deaths*T,bites);
  if(a.family==='EVO')endKinds=pops.map(p=>Array.from({length:6},(_,k)=>p.filter(f=>f.k===k).length));
  assert.equal(w.tel.births,births);
  return {seed,arm:a.name,sum,census,bites,births,deaths,migrants,endKinds,...w.tel,world:env.hash};
}

// Scripted non-ecological fixtures. No world scores, no other seed bank.
export function fixtures() {
  const seed=3301, a=ARMS.find(a=>a.name==='C:0');
  const hooked=host(seed,a,null), plain=host(seed,a,null);
  Object.setPrototypeOf(plain,WorldV.prototype);
  const f=hatch(hooked,null,0,0,0,false,0),v=hatch(plain,null,0,0,0,false,0);
  for(const x of [f,v]){x.masks.push(3);x.w.push(5);x.maskAge.push(10);}
  const r=rng32(seed);
  for(let j=0;j<160;j++){
    const o=ix(r,4096),bits=bv[o],label=+(bits[0]===bits[1]);
    hooked.tasteLearn(f,bits,label,j);plain.tasteLearn(v,bits,label,j);
    assert.deepEqual(f.alpha,v.alpha);assert.deepEqual(f.w,v.w);assert.deepEqual(f.masks,v.masks);
  }
  assert(hooked.tel.fresh>0&&hooked.tel.l2Updates>hooked.tel.fresh);
  const plot=[{o:0,label:1},{o:1,label:0}];
  const q0=posterior(plot,0,0),q1=posterior(plot,1,1),q2=posterior(plot,2,2);
  for(const x of [q0,q1,q2])assert(Math.abs(x.reduce((s,v)=>s+v,0)-1)<1e-10);
  assert(q1.every(x=>Math.abs(x-1/66)<1e-12));assert(q2[0]>q2[65]);
  assert.equal(ARMS.length,73);assert.equal(new Set(ARMS.map(a=>a.name)).size,73);
}
