import assert from 'node:assert/strict';
import { init, model, run, update } from './garden.mjs';

const spec = {k:'meta', a:.25, theta:1, span:8};
const fresh = k => init({...spec,k},0);
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-12, `${a} != ${b}`);
const f = fresh('meta');
update(f,1,0,spec);
near(f.w,.25); near(f.h,.25); near(f.score,0);
update(f,1,1,spec); near(f.score,0);
const priorL=f.predLow, priorH=f.predHigh;
update(f,-1,2,spec);
near(f.score,(priorL+1)**2-(priorH+1)**2);
const child=init(spec,0,f,0), reset=init({...spec,k:'reset'},0,f,0);
near(child.score,f.score); near(reset.score,0); near(reset.a,child.a);
assert(Number.isNaN(child.predLow)); near(child.w,0); near(child.h,0);

for (const g of [-.5,.5]) {
  const before = {...fresh('meta'),w:0,h:g,a:.25,score:.75,abs:.75};
  const rates = [1/8,1,8].map(theta=>Math.min(1,Math.max(1/128,.25*Math.exp(theta*g))));
  const sham={...before}, oracle={...before}, direct={...before};
  update(sham,1,1,{...spec,k:'sham'});
  near(sham.a,rates.reduce((a,b)=>a+b)/3);
  update(oracle,1,1,{...spec,k:'oracle'},.37);
  near(Math.abs(oracle.w-.37),Math.min(...rates.map(a=>Math.abs(a-.37))));
  update(direct,1,1,{...spec,k:'direct',low:1/16,high:1,soft:false});
  near(direct.a,g>0 ? 1 : 1/16);
}
const m=model(1);
for(let i=0;i<4;i++) {
  near(m.P.slice(4*i,4*i+4).reduce((a,b)=>a+b),1);
  near(m.at(5).slice(4*i,4*i+4).reduce((a,b)=>a+b),1);
}
assert(m.v[3]>m.v[1] && m.v[1]>0); near(m.v[0],-m.v[1]);
const b=init({k:'bayes',a:.25},0); update(b,1,0,{k:'bayes',model:m});
near(b.bel[0],.16); near(b.bel[1],.34); near(b.bel[2],.02); near(b.bel[3],.48);
near(b.w,b.bel.reduce((a,p,j)=>a+p*m.v[j],0));

// Short tuning-seed fixtures only. No late endpoint exists before tick 10100.
const short = c => run(3101,{...spec,...c},256);
const key = x => [x.births,x.deaths,x.end,x.schedule,x.popPath];
assert.deepEqual(key(short({k:'fixed',a:.5})),key(short({k:'off',fixed:.5})));
assert.deepEqual(key(short({k:'idbd'})),key(short({k:'evo',pm:-1})));
console.log('Passed: delayed-credit timing, inheritance/reset, post-clip sham, oracle projection, DIRECT polarity, Bayes filter, matched ecological controls.');
