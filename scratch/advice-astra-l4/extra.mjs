import { World } from './world.mjs';
import { Vol, volArms } from './vol.mjs';
import { rng32, mix } from '../../microverse/l3v.mjs';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const cueArms=['BANK_A','BANK_B','COIN','EVO0','EVO10','EVO50'];
const levels=[0,.25,.5,.75,1];
class Control extends World {
  constructor(seed,arm) { super(seed,'MIX50'); this.mode=arm; }
  spawn(p,...args) {
    const f=super.spawn(p,...args);
    f.ind=rng32(mix(this.seed^Math.imul(f.id,2654435761)^0x4c345233));
    f.genotype=p?.genotype??Math.floor(f.ind()*5);
    if(p && this.mode?.startsWith('EVO') && f.ind()<+this.mode.slice(3)/100) f.genotype=Math.floor(f.ind()*5);
    return f;
  }
  proposal(f) {
    if(this.mode==='BANK_A') return [f.joint[this.ca*4],.02];
    if(this.mode==='BANK_B') return [f.joint[this.cb],.02];
    return super.proposal(f);
  }
  credit(f,mask) {
    const bump=(a,d)=>{ for(let i=0;i<12;i++) if(mask&(1<<i)) a[i]=Math.min(30,a[i]+d); };
    bump(this.proposal(f)[0],4);
    if(this.mode.startsWith('BANK')) return;
    const l=this.mode==='COIN'?+(f.ind()<.5):levels[f.genotype];
    this.writes++; this.aligned+=this.axis?1-l:l;
    for(let i=0;i<4;i++) {
      if(i!==this.cb && l) bump(f.joint[this.ca*4+i],4*l);
      if(i!==this.ca && l!==1) bump(f.joint[i*4+this.cb],4*(1-l));
    }
  }
}
const sha=x=>createHash('sha256').update(x).digest('hex');
const digest=sha(Buffer.concat(['../../microverse/l3v.mjs','./world.mjs','./vol.mjs','./extra.mjs'].map(x=>readFileSync(new URL(x,import.meta.url)))));
const path=new URL('./extra.ndjson',import.meta.url);
if(!isMainThread) {
  parentPort.on('message',({design,seed,arm})=>{
    const w=new (design==='cue'?Control:Vol)(seed,arm),t=Date.now();
    let sum=0,n=0,skill=0,share=0,hi=0;
    for(let i=0;i<20000;i++) { w.step(); if(w.tick>10000 && w.tick%100===0) {
      sum+=w.flies.length; n++; hi=Math.max(hi,w.flies.length); skill+=w.skill(); share+=w.alphaShareOnS();
    } }
    assert.equal(n,100); assert.ok(Number.isFinite(skill+share)&&Number.isInteger(sum));
    parentPort.postMessage({design,seed,arm,sum,n,hi,skill:skill/n,share:share/n,extinct:!w.flies.length,
      ms:Date.now()-t,sourceHash:digest,schedule:sha(JSON.stringify(w.schedule)),writes:w.writes,checks:w.checks,aligned:w.writes?w.aligned/w.writes:null,tel:w.tel});
  });
} else {
  const ps=+(process.argv[2]??6);
  const rows=existsSync(path)?readFileSync(path,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
  assert.ok(rows.every(r=>r.sourceHash===digest));
  const key=x=>[x.design,x.seed,x.arm].join(':'), done=new Set(rows.map(key)),jobs=[];
  assert.equal(rows.length,done.size);
  for(let seed=2101;seed<=2116;seed++) for(const [design,arms] of [['cue',cueArms],['vol',volArms]]) for(const arm of arms) {
    const job={design,arm,seed}; if(!done.has(key(job))) jobs.push(job);
  }
  let n=0,j=0;
  console.log(`running ${jobs.length} extra cells; ${ps} workers; ${digest.slice(0,10)}`);
  await Promise.all(Array.from({length:Math.min(ps,jobs.length)},()=>new Promise((res,rej)=>{
    const w=new Worker(new URL(import.meta.url)); let job;
    const go=()=>{ if(j===jobs.length) return w.terminate().then(res,rej); job=jobs[j++]; w.postMessage(job); };
    w.on('error',rej); w.on('message',r=>{ assert.equal(key(r),key(job)); assert.ok(!done.has(key(r))); done.add(key(r));
      appendFileSync(path,JSON.stringify(r)+'\n'); if(++n%25===0 || n===jobs.length) console.log(`${n}/${jobs.length}`); go(); }); go();
  })));
}
