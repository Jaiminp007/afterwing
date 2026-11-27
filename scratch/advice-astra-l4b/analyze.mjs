import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { signflip } from '../../docs/paper/stats.mjs';
import { readRows, ledger, best, labels, l2, pairs, scalars } from './probe.mjs';

const rows=readRows(), seeds=Array.from({length:16},(_,i)=>2501+i), train=seeds.slice(0,8), held=seeds.slice(8);
const lock=best(l2,rows,train), pair=best(pairs,rows,train), scalar=best(scalars,rows,train);
const evoGrid=['E0','SV0','SV10','SV50'].map(k=>k+'|'+lock),evo=best(evoGrid,rows,train),arms=[...labels,...evoGrid];
assert.equal(rows.length,seeds.length*arms.length);
const byKey=new Map(rows.map(r=>[r.seed+' '+r.arm,r]));
const get=(s,a)=>{const r=byKey.get(s+' '+a);assert.ok(r);return r;};
for(const s of seeds){
  const rs=arms.map(a=>get(s,a));
  assert.ok(rs.every(r=>r.n===100&&Number.isInteger(r.popSum)&&r.popSum>=0&&r.popSum<=40000&&r.tel.bites>0));
  assert.equal(new Set(rs.map(r=>r.schedule)).size,1);
  assert.equal(get(s,'OFF').states,get(s,'FIXED').states);
  assert.ok(get(s,'OFF').tel.l2Updates>0 && get(s,'OFF').diag.attributed>0);
  assert.equal(get(s,'E0|'+lock).states,get(s,lock).states);
  assert.equal(get(s,'ORACLE').diag.oracleMass,get(s,'ORACLE').diag.reads);assert.ok(get(s,'ORACLE').diag.reads>0);
}
const sum=x=>x.reduce((a,b)=>a+b,0), mean=x=>sum(x)/x.length;
const numbers=(xs,unit)=>{
  const m=mean(xs),obs=sum(xs);let extreme=0;
  function walk(i,v){if(i===xs.length){extreme+=+(v>=obs);return;}walk(i+1,v+xs[i]);walk(i+1,v-xs[i]);}
  walk(0,0);const den=2**xs.length;assert.equal(signflip(xs,1),extreme/den);
  return {mean:m/unit,sd:Math.sqrt(sum(xs.map(x=>(x-m)**2))/(xs.length-1))/unit,
    pos:xs.filter(x=>x>0).length,ties:xs.filter(x=>x===0).length,n:xs.length,
    extreme,den,p:extreme/den,perSeed:xs.map(x=>x/unit)};
};
function scores(bank){
  const pops=Object.fromEntries(arms.map(a=>[a,mean(bank.map(s=>get(s,a).popSum))/100]));
  const d=(a,b)=>numbers(bank.map(s=>get(s,a).popSum-get(s,b).popSum),100);
  const d4=(a,b)=>numbers(bank.map(s=>2*get(s,a).popSum-3*get(s,b).popSum+get(s,'FIXED').popSum),200);
  const hindsight=best(l2,rows,bank);
  return {seeds:bank,pops,ratio:(pops.M3-pops.FIXED)/(pops[lock]-pops.FIXED),d4:d4('M3',lock),
    bestInThisBank:hindsight,d4InSample:d4('M3',hindsight),d4Oracle:d4('ORACLE',lock),
    d4VsPair:d4('M3',pair),factorial:d4('M3','POOL'),m3VsLocked:d('M3',lock),
    m3VsSham:d('M3','SHAM'),m3VsEvo:d('M3',evo),m3VsReset:d('M3','RESET'),
    l2VsFixed:d(lock,'FIXED'),fixedVsNorev:d('FIXED','NOREV'),
    m3Tickets:Object.fromEntries(Object.keys(get(bank[0],'M3').diag).map(k=>[k,sum(bank.map(s=>get(s,'M3').diag[k]))])),
    extinct:rows.filter(r=>bank.includes(r.seed)&&r.extinct).map(r=>[r.seed,r.arm])};
}
console.log(JSON.stringify({endpoint:'integer sum of 100 late populations / 100; d4=(M3-F)-1.5(L2-F)',
  ledgerSha256:createHash('sha256').update(readFileSync(ledger)).digest('hex'),digest:rows[0].digest,
  cellCount:rows.length,scalar,pair,lock,evo,train:scores(train),held:scores(held),all:scores(seeds)},null,1));
