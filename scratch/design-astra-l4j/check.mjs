import assert from 'node:assert/strict';
import { D, G, H, SD, SWITCH, SIGN, FLIP, LINES } from './world.mjs';
import { joint, make } from './arms.mjs';
import { makeBeam, omni } from './beam.mjs';

// Direct scatter of all transitions, independent of the filter's pull implementation.
for(let s=0;s<128;s++) for(let a=0;a<8;a++) for(let i=0;i<D;i++)
  assert.equal(SIGN[i][s^FLIP[a]],SIGN[i][s]*(LINES[a].includes(i)?-1:1));
assert.equal(new Set(Array.from({length:128},(_,s)=>SIGN.map(z=>z[s]).join(','))).size,128);
const initial=Float64Array.from({length:25},(_,j)=>(j*37)%256);
let p=new Float64Array(256); for(const s of initial)p[s]+=1/25;
const L=joint({method:'quantile'},initial);
for(let t=0;t<G;t++){
  const i=(t*11+Math.floor(t/3))%16,y=Math.sin(2*t+.23)*1.8;
  const q=new Float64Array(256);
  for(let k=0;k<256;k++) for(let a=0;a<2;a++) {
    const v=p[k]*(t===0 ? (a===k>>7 ? 1-SWITCH:SWITCH) : +(a===k>>7)), s=k%128;
    q[128*a+s]+=v*(1-H);
    for(const f of FLIP.slice(4*a,4*a+4))q[128*a+(s^f)]+=v*H/4;
  }
  const e=q.reduce((n,v,k)=>n+v*SIGN[i][k%128],0);
  assert(Math.abs(L.predict(i)-e)<1e-11);
  let mass=0; for(let k=0;k<256;k++)mass+=(q[k]*=Math.exp(-.5*((y-SIGN[i][k%128])/SD)**2));
  p=q.map(v=>v/mass); L.observe(i,y);
}
const a=make({kind:'edit',a:.25,h:1.5,b:1},null,()=>.25);
const o=make({kind:'oracle',a:.25,h:1.5,b:1,map:[1,1]},null,()=>.25);
for(let t=0;t<150;t++){
  const i=(t*7)%16,y=Math.sin(t)*3;
  assert.equal(a.predict(i),o.predict(i)); a.observe(i,y);o.observe(i,y,t%2);
}
assert.deepEqual(a.inherit(),o.inherit());assert(a.writes>0);
console.log('128 distinct maps; all 16,384 flip identities; all 40 exact-filter forecasts; constant-oracle identity passed.');
const full=makeBeam(omni,null,()=>.2), small=makeBeam({...omni,kind:'beam',full:false,q:.5},null,()=>.2);
let pp=new Float64Array(128).fill(1/128);
for(let t=0;t<2*G;t++){
  const i=t*7%16,axis=+(t>G),y=Math.sin(t+.3);
  const prior=new Float64Array(128);
  for(let k=0;k<128;k++) {
    prior[k]+=pp[k]*(1-H);
    for(const f of FLIP.slice(4*axis,4*axis+4))prior[k^f]+=pp[k]*H/4;
  }
  const m=prior.reduce((s,z,k)=>s+z*SIGN[i][k],0);
  assert(Math.abs((1-2*H/4)*full.predict(i)-m)<1e-10);
  full.observe(i,y,axis);small.observe(i,y);
  let z=0;
  for(let k=0;k<128;k++) z+=(pp[k]=prior[k]*Math.exp(-.5*((y-SIGN[i][k])/SD)**2));
  pp=pp.map(v=>v/z);
  assert(Math.max(...pp.map((v,k)=>Math.abs(v-full.weights[k])))<1e-10);
  assert(Math.abs(small.weights.reduce((s,x)=>s+x,0)-1)<1e-12);
  assert(small.weights.filter(x=>x>0).length<=12);
}
console.log('80 regime-conditioned map posteriors, 80 sparse-support checks passed.');
