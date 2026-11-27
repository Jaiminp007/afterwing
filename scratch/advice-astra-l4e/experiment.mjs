import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { mean, signflip } from '../../docs/paper/stats.mjs';
import { BITE_WORDS, BIRTH_WORDS, compile } from './machine.mjs';
import { run } from './culture.mjs';

const file=s=>new URL(s,import.meta.url), read=s=>readFileSync(file(s),'utf8');
const save=(f,v)=>writeFileSync(file(f),JSON.stringify(v,null,1)+'\n',{flag:'wx'});
const digest=createHash('sha256').update(['machine.mjs','culture.mjs','experiment.mjs','check.mjs','protocol.md','../../docs/paper/stats.mjs'].map(read).join('\0')).digest('hex');
const tune=Array.from({length:16},(_,j)=>3201+j), held=tune.map(s=>s+16);
const A=[.25,.5,1], beta=[.25,.5,.75,1], signs=[1,-1], leaks=[.5,.875,1];
function grid() {
  const list=[],add=(k,o)=>list.push({name:`${k}_${Object.values(o).join('_')}`,k,...o});
  add('null',{alpha:1});
  for(const alpha of A){
    for(const z of [-1,-.5,0,.5,1])add('fixed',{alpha,z});
    for(const b of beta)for(const ori of signs)add('constant',{alpha,beta:b,ori});
    for(const k of ['idbd','autostep'])for(const start of [.25,1])for(const theta of [.5,2,8])
      for(const ori of signs)add(k,{alpha,start,theta,ori});
    for(const decay of [.5,.875])for(const scale of [.25,.5,1])for(const ori of signs)
      add('rms',{alpha,decay,scale,ori});
    for(const k of ['hard','soft'])for(const b of beta)for(const leak of leaks)for(const ori of signs)
      add(k,{alpha,beta:b,leak,ori});
    for(const n of [4,7])add('filter',{alpha,n});
    for(const n of [4,8,12])add('window',{alpha,n});
    for(const b of beta)add('oracle',{alpha,beta:b,leak:.875,ori:1});
    add('full',{alpha});
  }
  return list;
}
const specs=grid(), all=new Map(specs.map(c=>[c.name,c])), rows=new Map();
function key(s,n){return `${s}:${n}`;}
function addRow(r){const k=key(r.seed,r.arm);assert(!rows.has(k));assert.equal(r.digest,digest);
  assert.equal(r.samples,100);rows.set(k,r);}
function batch(cs,seeds,stage) {
  assert(!existsSync(file(stage+'.ndjson')));
  for(const c of cs){
    all.set(c.name,c);
    const image=compile(c);assert.equal(image.next.length,BITE_WORDS);assert.equal(image.born.length,BIRTH_WORDS);
    assert(image.next instanceof Uint16Array&&image.born instanceof Uint16Array);
    for(const s of seeds){
      const r={arm:c.name,...run(s,image),digest};addRow(r);
      appendFileSync(file(stage+'.ndjson'),JSON.stringify(r)+'\n');
    }
  }
}
const sums=(c,bank)=>bank.map(s=>rows.get(key(s,c.name)).sum);
const levels=(c,bank)=>mean(sums(c,bank))/100;
function best(cs){return cs.reduce((a,b)=>levels(b,tune)>levels(a,tune)?b:a);}
function measure(ints,units) {
  const m=mean(ints)/units, p=signflip(ints,1);
  let upper=0;const observed=ints.reduce((a,b)=>a+b,0);
  function visit(i,z){if(i===ints.length){if(z>=observed)upper++;return;}
    visit(i+1,z+ints[i]);visit(i+1,z-ints[i]);}
  visit(0,0);assert.equal(p,upper/2**ints.length);
  return {mean:m,sd:Math.sqrt(ints.reduce((n,x)=>n+(x/units-m)**2,0)/(ints.length-1)),
    positive:ints.filter(x=>x>0).length,ties:ints.filter(x=>x===0).length,p,upper,ints,units};
}
function contrast(a,b,f,bank) {
  const x=sums(a,bank),y=sums(b,bank),z=sums(f,bank);
  return {...measure(x.map((v,i)=>2*v-3*y[i]+z[i]),200),gain2:(mean(y)-mean(z))/100,
    ratio:(mean(x)-mean(z))/(mean(y)-mean(z))};
}
function audit(cs,bank) {
  const out={};
  for(const c of cs){const rs=bank.map(s=>rows.get(key(s,c.name)));
    for(let i=0;i<rs.length;i++)assert.equal(rs[i].world,rows.get(key(bank[i],cs[0].name)).world);
    out[c.name]={mean:levels(c,bank),extinct:rs.filter(r=>!r.end).length,cap:rs.reduce((n,r)=>n+r.atCap,0),
      lateMSE:mean(rs.map(r=>r.sse/r.seen)),meanNet:mean(rs.map(r=>r.lateGain/r.seen))};
  }return out;
}
function screen(){
  save('started.json',{utc:new Date().toISOString(),node:process.version,digest,tune,held,specs});
  batch(specs,tune,'tuning');
  const winners=Object.fromEntries([...new Set(specs.map(s=>s.k))].map(k=>[k,best(specs.filter(s=>s.k===k))]));
  const B=best(specs.filter(c=>!['null','oracle','full'].includes(c.k)));
  const d=contrast(winners.oracle,B,winners.fixed,tune), full=contrast(winners.full,B,winners.fixed,tune);
  const pass=d.mean>1&&d.gain2>0&&d.p<.05;
  save('screen.json',{digest,winners,best:B,d,full,pass,cells:specs.length*tune.length,arms:audit(specs,tune)});
  console.log({pass,cells:specs.length*tune.length,best:B.name,oracle:winners.oracle.name,fixed:winners.fixed.name,d,full});
}
function heldout(){
  const screen=JSON.parse(read('screen.json'));assert.equal(screen.digest,digest);assert.equal(screen.pass,true,'stop at oracle');
  assert(!existsSync(file('locked.json'))&&!existsSync(file('held.ndjson')));
  for(const r of read('tuning.ndjson').trim().split('\n').map(JSON.parse))addRow(r);
  const w=screen.winners, base=w.constant, F=w.fixed, B=screen.best;
  const matching=best(specs.filter(c=>c.k==='hard'&&c.alpha===base.alpha&&c.beta===base.beta&&c.ori===base.ori));
  const treatment=k=>({...matching,k,name:k});
  const controls=[treatment('meta'),treatment('sham'),treatment('reset'),{...treatment('off'),fixedZ:F.z,fixedAlpha:F.alpha}];
  const evo=[-1,0,1/16,1/4,1].map(pm=>({...treatment('evo'),pm,name:`evo_${pm}`}));
  batch(evo,tune,'evo');
  const E=best(evo), cs=[...new Map([...Object.values(w),B,matching,...controls,E].map(c=>[c.name,c])).values()];
  save('locked.json',{utc:new Date().toISOString(),digest,cs,held,evo,matching,base});
  batch(cs,held,'held');
  const [m,sh,r,off]=controls,d=contrast(m,B,F,held);
  const diff=(c,b,margin=0)=>measure(sums(c,held).map((v,i)=>v-sums(b,held)[i]-100*margin),100);
  const x=sums(m,held),y=sums(off,held),z=sums(base,held),f=sums(F,held);
  const controlsD={L1:diff(F,w.null),L2:diff(B,F),matchedL2:diff(base,F),oneFlyL2:diff(m,B,1),
    sham:diff(m,sh,1),evo:diff(m,E,1),reset:diff(m,r),
    factorial:measure(x.map((v,i)=>2*(v-y[i])-3*(z[i]-f[i])),100)};
  const pass=[d,...Object.values(controlsD)].every(p=>p.mean>0&&p.p<.01)&&controlsD.factorial.positive>=11;
  save('held.json',{digest,pass,arms:audit(cs,held),d,controlsD});console.log({pass,d,controlsD});
}
if(process.argv[2]==='screen')screen();
else if(process.argv[2]==='held')heldout();
else throw Error('use screen or held');
