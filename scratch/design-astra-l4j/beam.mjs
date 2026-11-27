import { B, FLIP, SD, SIGN } from './world.mjs';

const logits = q => Math.log(q/(1-q));
const bound = z => Math.max(-4, Math.min(4,z));
const v = n => new Float64Array(n);
export const qs = [0,.06,.25,.5,.75,.94,1];
export const beams = [.08,.12,.18].flatMap(h=>qs.map(q=>({
  name:`BEAM_${h}_${q}`,kind:'beam',sub:'beam',h,q
})));
export const neutral = {name:'UNPRUNED',kind:'full',sub:'beam',q:.5,h:.12};
export const omni = {...neutral,name:'FULL_ORACLE',kind:'oracle',map:[1,0],full:true};
export const bshares = base => [.02,.15].flatMap(share=>[.06,.25].map(q0=>({
  ...base,name:`BSHARE_${share}_${q0}`,kind:'share',q0,share
})));
export const bevos = base => [0,.04,.2].map(pm=>({...base,name:`BEVO_${pm}`,kind:'evo',pm}));

function largest(z,k,offset,idx) {
  let n=0;
  for(let o=0;o<128;o++){
    const s=(o*37+offset)&127, x=z[s];
    if(!(x>0) || (n===k&&x<=z[idx[0]])) continue;
    if(n<k){
      let i=n++;
      while(i>0) {const j=(i-1)>>1;if(z[idx[j]]<=x)break; idx[i]=idx[j];i=j;}
      idx[i]=s;
    }else{
      let i=0;
      while(i*2+1<k){ let j=i*2+1;if(j+1<k&&z[idx[j+1]]<z[idx[j]])j++;
        if(z[idx[j]]>=x)break;idx[i]=idx[j];i=j; }
      idx[i]=s;
    }
  }
  return n;
}
function pack(z,offset,extra) {
  const idx=new Uint8Array(12), n=largest(z,12,offset,idx), out=v(B);
  for(let k=0;k<n;k++) {out[2*k]=idx[k];out[2*k+1]=z[idx[k]];}
  out[24]=extra;return out;
}
function beam(spec,st,r) {
  const full=spec.kind==='full'||spec.full, K=full?128:12;
  const z=v(128), weight=v(128), ids=new Uint8Array(128), heap=new Uint8Array(128);
  const offset=Math.floor(128*r()), track=['meta','sham'].includes(spec.kind);
  const wr=track?v(128):null,wc=track?v(128):null;
  let n=0, fresh=!st, tsite=-1, verify=false, writes=0, tested=0, bias=bound(logits(spec.q)), q=spec.q;
  if(st){
    let m=0;
    for(let j=0;j<24;j+=2) if(st[j+1]>0){ const s=st[j]; ids[n++]=s;weight[s]=st[j+1]; m+=st[j+1]; }
    if(full && n<128 && m<1){
      const rest=(1-m)/(128-n);
      for(let s=0;s<128;s++)if(!weight[s]){ids[n++]=s;weight[s]=rest;}
    }else for(let j=0;j<n;j++)weight[ids[j]]/=m;
    if(track||spec.kind==='evo')bias=st[24];
  }
  if(spec.kind==='evo') {
    if(!st)bias=bound(logits(qs[Math.floor(r()*qs.length)]));
    else if(r()<spec.pm)bias=bound(bias+(r()<.5?-2:2));
  }
  if(track||spec.kind==='evo')q=1/(1+Math.exp(-bias));
  let pr=0,pc=0;
  return {
    get weights(){return weight;},get writes(){return writes;},get tested(){return tested;},
    predict(i) {
      const sg=SIGN[i]; let e=0,ar=0,ac=0;
      if(fresh)return 0;
      for(let j=0;j<n;j++) {const s=ids[j];e+=sg[s]*weight[s];
        if(verify){ar+=sg[s]*wr[s];ac+=sg[s]*wc[s];}}
      pr=ar;pc=ac;return e;
    },
    observe(i,y,axis) {
      if(verify && i!==tsite && pr!==pc){
        const diff=(y-pc)**2-(y-pr)**2;
        const sign=spec.kind==='sham' ? (r()<.5?-1:1):Math.sign(diff);
        bias=bound(bias+.30*sign);q=1/(1+Math.exp(-bias));tested++;
      }
      if(spec.kind==='oracle')q=spec.map[axis];
      z.fill(0);if(track){wr.fill(0);wc.fill(0);}
      if(fresh)z.fill(1/128);
      else for(let j=0;j<n;j++){
        const s=ids[j],p=weight[s],row=p*spec.h*q/4,col=p*spec.h*(1-q)/4;
        z[s]+=p*(1-spec.h);
        for(let k=0;k<4;k++){
          const a=s^FLIP[k],b=s^FLIP[4+k]; z[a]+=row;z[b]+=col;
          if(track){wr[a]+=row;wc[b]+=col;}
        }
      }
      const sg=SIGN[i],l=Math.tanh(y/(SD*SD)),a=1+l,b=1-l;
      for(let s=0;s<128;s++)z[s]*=sg[s]>0?a:b;
      if(full){n=128;for(let s=0;s<128;s++)heap[s]=s;}
      else n=largest(z,K,offset,heap);
      let m=0,mr=0,mc=0; weight.fill(0);
      for(let j=0;j<n;j++){
        const s=ids[j]=heap[j];m+=z[s];
        if(track){let f=sg[s]>0?a:b; mr+=(wr[s]*=f);mc+=(wc[s]*=f);}
      }
      verify=track && mr>1e-10 && mc>1e-10;
      for(let j=0;j<n;j++){
        const s=ids[j];weight[s]=z[s]/m;
        if(verify){wr[s]/=mr;wc[s]/=mc;}
      }
      fresh=false;tsite=i;writes++;
    },
    inherit:()=>pack(weight,offset,bias),
  };
}
export function makeBeam(spec,st,r){
  if(spec.kind!=='share')return beam(spec,st,r);
  const lo=beam({...spec,kind:'beam',q:spec.q0},st,r),hi=beam({...spec,kind:'beam',q:1-spec.q0},st,r);
  let p=st?.[24]??.5,a=0,b=0;const mix=v(128);
  return {
    predict(i){ a=lo.predict(i);b=hi.predict(i);return p*a+(1-p)*b; },
    observe(i,y){
      // Marginal taste likelihood under a binary-valued map.
      const l=Math.tanh(y/(SD*SD)),phi=1-2*spec.h/4;
      const x=p*(1+l*phi*a),z=(1-p)*(1+l*phi*b);
      p=(1-spec.share)*x/(x+z)+spec.share/2;
      lo.observe(i,y);hi.observe(i,y);
    },
    inherit(){for(let s=0;s<128;s++)mix[s]=p*lo.weights[s]+(1-p)*hi.weights[s];return pack(mix,0,p);},
  };
}
