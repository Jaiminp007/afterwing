import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mean, signflip } from '../../docs/paper/stats.mjs';
import { compile } from './machine.mjs';

const file=n=>new URL(n,import.meta.url),read=n=>readFileSync(file(n),'utf8');
const s=JSON.parse(read('screen.json')), manifest=JSON.parse(read('started.json'));
const data=read('tuning.ndjson').trim().split('\n').map(JSON.parse);
const {tune,specs}=manifest, index=new Map(data.map(r=>[`${r.seed}/${r.arm}`,r]));
assert.deepEqual(tune,Array.from({length:16},(_,i)=>3201+i));
assert.equal(index.size,data.length);assert.equal(index.size,tune.length*specs.length);
assert.equal(s.pass,false);
for(const n of ['locked.json','held.json','held.ndjson','evo.ndjson'])assert(!existsSync(file(n)));
const pick=(seed,c)=>index.get(`${seed}/${c.name}`);
for(const c of specs){
  const rs=tune.map(seed=>pick(seed,c));
  for(const r of rs){
    assert.equal(r.digest,manifest.digest);assert.equal(r.samples,100);
    assert.equal(r.end,64+r.eggs-r.deaths);assert(r.reads>0);
    assert.equal(r.world,pick(r.seed,s.winners.null).world);
  }
  assert.equal(mean(rs.map(r=>r.sum))/100,s.arms[c.name].mean);
}
const base=s.winners.constant;
const matching=specs.filter(c=>c.k==='hard'&&c.alpha===base.alpha&&c.beta===base.beta&&c.ori===base.ori)
  .reduce((a,b)=>s.arms[b.name].mean>s.arms[a.name].mean?b:a);
const direct=compile(matching), meta=compile({...matching,k:'meta'});
assert.deepEqual(direct.next,meta.next);assert.deepEqual(direct.born,meta.born);
assert.equal(direct.init,meta.init);assert.equal(direct.oracle,meta.oracle);assert.equal(direct.standing,meta.standing);
const F=s.winners.fixed, B=s.best, O=s.winners.oracle;
assert.equal(F.z,0);assert(tune.every(seed=>pick(seed,F).sum===pick(seed,s.winners.null).sum));
const winner=specs.filter(c=>!['oracle','full','null'].includes(c.k))
  .reduce((a,b)=>s.arms[b.name].mean>s.arms[a.name].mean?b:a);
assert.equal(winner.name,B.name);
function stats(c) {
  const ints=tune.map(seed=>2*pick(seed,c).sum-3*pick(seed,B).sum+pick(seed,F).sum);
  const m=a=>s.arms[a.name].mean, positive=ints.filter(n=>n>0).length, ties=ints.filter(n=>!n).length;
  return {arm:c.name,mean:m(c),d4:mean(ints)/200,ratio:(m(c)-m(F))/(m(B)-m(F)),positive,ties,
    negative:ints.length-positive-ties,p:signflip(ints,1)};
}
assert.equal(stats(O).d4,s.d.mean);
const extinctions={};
for(const r of data)if(r.end===0){const k=r.arm.split('_')[0];extinctions[k]=(extinctions[k]??0)+1;}
console.log(JSON.stringify({cells:data.length,seeds:tune,oracle:stats(O),matchedMetaByIdentity:stats(matching),
  reads:data.reduce((n,r)=>n+r.reads,0),extinctions,preLateExtinctions:data.filter(r=>!r.seen).length,
  cap:data.reduce((n,r)=>n+r.atCap,0),heldOut:false},null,2));
