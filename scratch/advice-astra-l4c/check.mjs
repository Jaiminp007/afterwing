import assert from 'node:assert/strict';
import { Garden, write } from './world.mjs';

const spec={kind:'META3',scalar:3,gain:20}, w=new Garden(2701,0,spec);
const alpha=[59,3,58,...Array(9).fill(1)],r=alpha.slice(),s=alpha.slice(),sh=alpha.slice();
write(r,3,1,20,60);write(s,3,0,20,60);write(sh,3,.5,20,60);
assert.deepEqual(sh,r.map((x,i)=>(x+s[i])/2));assert.equal(r[0],60);assert.equal(s[2],60);
const f=w.flies[0];w.tick=50;w.open(f,3);
const rec=f.own, held=f.alpha.slice(), child=w.spawn(f,0,0,25,1);
const val=t=>{f.masks=[0,12];f.w=[0,4];f.maskAge=[10,10];f.maskVal=[true,false];f.maskSrc=[-1,t];w.l2Update(f);};
w.tick=60;val(48);assert.equal(rec.y,0);assert.deepEqual(f.alpha,held);
w.tick=170;val(51);assert.equal(rec.y,1);assert.deepEqual(f.alpha,held);
w.flush(child);assert.deepEqual(child.yields,[0,0,0,0]);
w.tick=171;w.flush(child);w.flush(f);assert.deepEqual(child.yields,f.yields);assert.equal(f.yields[rec.r*2],1);
w.flush(f);assert.equal(f.yields[rec.r*2+1],1);
for(const season of [0,1]){
  w.cfg.season=season;w.initMacro();let prev=w.nextSubRule();
  for(let i=0;i<30;i++){const cur=w.nextSubRule();assert.notEqual(cur.mask,prev.mask);assert.equal(+(!!(cur.mask&prev.mask)),season);prev=cur;}
}
const reset=new Garden(2701,0,{...spec,kind:'RESET'});reset.assay=true;
const p=reset.flies[0];p.yields=[2,3,4,5];p.alpha[0]=14;
const ch=reset.spawn(p,0,0,25,1);assert.deepEqual(ch.yields,[0,0,0,0]);assert.equal(ch.alpha[0],14);
const d=new Garden(2701,0,{kind:'DIRECT',scalar:3,gain:80,soft:false});
d.assay=true;const df=d.flies[0];df.last=3;df.yields=[0,9,8,9];
const unchanged=[...df.alpha];
let nr=0;for(let i=0;i<100;i++)nr+=+!!(d.drawCandidate(df,new Set([3])).mask&3);
assert.ok(nr>80);assert.deepEqual(df.alpha,unchanged);
const live=new Garden(2701,0,spec);
while(live.tick<5000)live.step();
assert.ok(live.flies.length>0&&live.flies.every(f=>Number.isInteger(f.x)&&Number.isInteger(f.y)));
assert.ok(live.tel.bites>0&&live.records.length>0&&live.records.some(r=>r.y>0));
console.log('2701 synthetic fixtures only: both seasons, post-clip SHAM, actual proposal timestamp, inclusive hold, delayed inherited outcome, newborn RESET, and direct proposal use passed.');
