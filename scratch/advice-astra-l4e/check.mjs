import assert from 'node:assert/strict';
import { BITE_WORDS, BIRTH_WORDS, ERR, H, SLIP, bite, compile, founder, inherit, wval } from './machine.mjs';
import { run } from './culture.mjs';

const c={alpha:1,beta:.5,ori:1,leak:.875}, img=k=>compile({...c,k});
const meta=img('meta'), flat=img('hard'), sham=img('sham'), reset=img('reset');
assert.equal(meta.next.length,BITE_WORDS);assert.equal(meta.born.length,BIRTH_WORDS);
assert.deepEqual(meta.next,flat.next);assert.deepEqual(meta.born,flat.born);
assert.deepEqual(meta.next,reset.next);
for(let i=0;i<BITE_WORDS;i+=2){
  assert.equal(meta.next[i],meta.next[i+1]);
  assert.equal((sham.next[i]>>12)&7,0);
}
let st=0, velocityChoices=new Set();
for(const t of [1,1,1,0,0,1,1,0,0,1,1,0,0,0,1,0]){
  st=bite(meta.next,st,t,0);velocityChoices.add(wval(st));
}
assert(velocityChoices.size>=3);
for(let q=0;q<4096;q++)for(const token of [0,63,255]){
  assert.equal(inherit(meta.born,0xf000|q,token),q);
  assert.equal(inherit(reset.born,0xf000|q,token),q&255);
}
const evo=compile({...c,k:'evo',pm:1/4});
assert.equal(new Set(Array.from({length:60},(_,i)=>founder(evo,i))).size,15);
assert.equal(inherit(evo.born,0xa500,0x4f),0x500);
assert.equal(inherit(evo.born,0xa500,0x07),0);
for(let i=0;i<BITE_WORDS;i+=32){
  const old=(i>>10)&15;
  assert.equal((evo.next[i]>>8)&15,old===8?0:old);
}

// Independent hidden-path enumeration checks priors, emission timing, slip and HMM projection.
const win=compile({k:'window',alpha:1,n:4});
function expected(history) {
  let z=0,g=0;
  function walk(t,s,v,a,p){
    p*=((history>>(3-t))&1)===(s>0?1:0)?1-ERR:ERR;
    if(t===3){z+=p;g+=p*s*v*a*(1-2*ERR)*(1-2*H)*(1-2*SLIP);return;}
    for(const an of [-a,a])for(const vn of [-v*an,v*an])
      walk(t+1,s*vn,vn,an,p*(an===a?1-H:H)*(vn===v*an?1-SLIP:SLIP));
  }
  for(const s of [-1,1])for(const v of [-1,1])for(const a of [-1,1])walk(0,s,v,a,1/8);
  return Math.round((g/z)*7)/7;
}
for(let history=0;history<16;history++){
  let f=win.init;
  for(let i=3;i>=0;i--)f=bite(win.next,f,(history>>i)&1,0);
  assert(Math.abs(wval(f)-expected(history))<1e-12);
}
const fix=compile({k:'fixed',alpha:.5,z:1}), off=compile({...c,k:'off',fixedAlpha:.5,fixedZ:1});
const p=run(3201,fix,64), q=run(3201,off,64);
assert.deepEqual(p,q);assert(p.reads>0&&p.eggs>0);assert.equal(p.samples,0);
console.log('PASS: ROM sizes, full flat equivalence, ordinary input masking, label-neutral write, birth reset, birth-only variation, exact four-taste Bayes, and two matched 64-pulse cells (3201 only).');
