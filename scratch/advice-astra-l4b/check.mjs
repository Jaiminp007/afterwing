import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const url=new URL('./probe.mjs',import.meta.url);
let src=readFileSync(url,'utf8').replaceAll('import.meta.url',JSON.stringify(url.href))
  .replace("from '../advice-astra-l4/world.mjs'",`from '${new URL('../advice-astra-l4/world.mjs',url).href}'`);
src+='\nexport { WorldB, translated, mod, masks, rng32 };';
const {WorldB,translated,mod,masks,rng32}=await import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
const S=2501;
for(let i=0;i<66;i++){
  assert.equal(translated[i][0],i);
  assert.equal(new Set(translated[i]).size,11);
  for(let a=0;a<11;a++)for(let b=0;b<11;b++)assert.equal(translated[translated[i][a]][b],translated[i][mod(a+b)]);
}
const m=new WorldB(S,'M3'),f=m.flies[0],sh=new WorldB(S,'SHAM'),off=new WorldB(S,'OFF'),fix=new WorldB(S,'FIXED');
const shf=sh.flies[0], oldPhase=mod(m.phase-1);f.anchor=shf.anchor={q:20,phase:oldPhase};
const mask=masks[translated[20][4]],t=m.ticket(f,mask);
assert.equal(t.who,4);
m.resolve(f,t,true);sh.resolve(shf,sh.ticket(shf,mask),true);
assert.ok(f.cache[4]>f.cache[0] && f.score[4]>0);
assert.ok(shf.cache.every(x=>Math.abs(x-1/11)<1e-12));
assert.ok(shf.score[4]===f.score[4]);
const before=JSON.stringify(f.score);m.resolve(f,{...t,epoch:-1},false);
assert.equal(JSON.stringify(f.score),before);
const g=m.flies[1];
Object.assign(g,{alpha:f.alpha.slice(),g:Float64Array.from(f.g),anchor:f.anchor,cache:f.cache,score:f.score.map(x=>100-x)});
m.phase=mod(m.phase+1);f.rProp=rng32(S);g.rProp=rng32(S);
for(let i=0;i<1000;i++)assert.equal(m.drawCandidate(f,new Set()),m.drawCandidate(g,new Set()));
const inherited=m.spawn(f,0,0,25,1),r=new WorldB(S,'RESET'),rf=r.flies[0];
assert.deepEqual(inherited.score,f.score);assert.notEqual(inherited.score,f.score);
Object.assign(rf,{score:f.score,cache:f.cache,anchor:f.anchor});
const reset=r.spawn(rf,0,0,25,1);assert.ok(reset.score.every(x=>!x));assert.deepEqual(reset.cache,f.cache);
for(let i=0;i<20000;i++){
  fix.step();off.step();
  assert.equal(fix.stateHash(),off.stateHash());assert.equal(fix.exoHash(),off.exoHash());
}
assert.ok(off.diag.attributed>0&&off.tel.l2Updates>0);
console.log('2501 only: group law, actual proposal provenance, stale censor, post-clip SHAM, L1 unreadable live scores, inheritance law, 20,000-tick shadow/environment identities passed');
