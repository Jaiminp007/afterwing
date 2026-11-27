import assert from 'node:assert/strict';
import { World } from './world.mjs';
import { WorldV } from '../../microverse/l3v.mjs';

// Drive the unoptimized L3-V implementation with the prototype's exogenous
// odors/rules. Check the full ecology, not just the final population count.
for(const [a,ref] of [['U','FIXED_U'],['DECK','FIXED_DECK'],['LEGACY','META']]) {
  const p=new World(2101,a), r=new WorldV(2101,ref,{subEvery:Infinity,macroEvery:Infinity,shiftEvery:Infinity});
  for(let i=0;i<2400;i++) {
    p.step(); r.codes=p.codes; r.subset=p.subset; r.rule=p.rule; r.kindValence=p.kindValence; r.step();
    assert.equal(p.stateHash(),r.stateHash(),`physics mismatch ${a} tick ${i+1}`);
    assert.equal(p.exoHash(),r.exoHash(),`world mismatch ${a} tick ${i+1}`);
    if(ref==='META') for(let j=0;j<p.flies.length;j++) assert.deepEqual(p.flies[j].alpha,r.flies[j].alpha);
  }
  console.log(`2101 ${a} vs reference ${ref}: 2400/2400 tick hashes match`);
}
assert.throws(()=>new World(NaN,'U')); // The guard executes before ecology initialization.
