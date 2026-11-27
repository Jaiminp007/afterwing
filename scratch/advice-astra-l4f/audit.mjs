import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { signflip } from '../../docs/paper/stats.mjs';

const read=n=>readFileSync(new URL(n,import.meta.url),'utf8');
const lines=n=>read(n).trim().split('\n').map(s=>JSON.parse(s));
const R=JSON.parse(read('result.json')), start=JSON.parse(read('started.json'));
const rows=lines('tuning.ndjson'),worlds=lines('worlds.ndjson'),sum=xs=>xs.reduce((x,y)=>x+y,0);
const sums=Object.fromEntries(start.arms.map(a=>[a.name,[]])),diff=[];
assert.equal(rows.length,73*16);assert.equal(worlds.length,16);
for(let seed=3301;seed<=3316;seed++){
  const block=rows.filter(x=>x.seed===seed), world=worlds.find(x=>x.seed===seed);
  assert.equal(block.length,73);assert.match(world.hash,/^[0-9a-f]{64}$/);
  assert.deepEqual(world.pulses,[3840,3840]);assert(block.every(x=>x.world===world.hash));
  const counts={};
  for(const {name} of start.arms){
    const r=block.find(x=>x.arm===name);
    counts[name]=sum(r.census.slice(12));assert.equal(counts[name],r.sum);sums[name].push(r.sum);
  }
  diff.push(2*counts[R.best.ORACLE.arm]-3*counts[R.best.L2best.arm]+counts[R.best.FIXED.arm]);
  assert.equal(diff.at(-1)/24,R.d4BySeed[seed-3301]);
}
for(const [name,v] of Object.entries(sums))assert.equal(sum(v)/192,R.familyMeans[name],name);
assert(Math.abs(R.d4-sum(diff)/384)<1e-12);assert.equal(signflip(diff,1),R.p);
const summary={dRange:[Math.min(...diff)/24,Math.max(...diff)/24],cells:rows.length,
  redraws:[0,1].map(i=>sum(worlds.map(e=>e.draws[i]))),swaps:sum(worlds.map(e=>sum(e.swaps))),
  extinct:rows.filter(e=>!e.census.at(-1)).length,oracleOverConstantGain:R.oracleGain/(R.best.C.mean-R.best.FIXED.mean)};
for(const {arm} of Object.values(R.best)){
  const rs=rows.filter(x=>x.arm===arm);
  summary[arm]=Object.fromEntries(['bites','migrants','fresh','l2Updates','admissions','correctAdm','resets','metaSteps'].map(k=>[k,sum(rs.map(x=>x[k]))]));
}
console.log(JSON.stringify(summary,null,1));
