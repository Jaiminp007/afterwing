import assert from 'node:assert/strict';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { World, arms } from './world.mjs';

const ledger=new URL('./rows.ndjson',import.meta.url);
const hash=x=>createHash('sha256').update(x).digest('hex');
const sourceHash=hash(Buffer.concat(['../../microverse/l3v.mjs','./world.mjs','./run.mjs'].map(x=>readFileSync(new URL(x,import.meta.url)))));
if(!isMainThread) {
  parentPort.on('message',({seed,arm})=>{
    const t=Date.now(),w=new World(seed,arm);
    let sum=0,n=0,skill=0,share=0,hi=0;
    for(let i=0;i<20000;i++) {
      w.step();
      if(w.tick>10000 && w.tick%100===0) {
        const p=w.flies.length; sum+=p; hi=Math.max(hi,p); skill+=w.skill(); share+=w.alphaShareOnS(); n++;
      }
    }
    assert.equal(n,100); assert.ok(Number.isInteger(sum)); assert.ok(Number.isFinite(skill+share));
    parentPort.postMessage({seed,arm,sum,n,skill:skill/n,share:share/n,hi,extinct:!w.flies.length,
      sourceHash, ms:Date.now()-t,schedule:hash(JSON.stringify(w.schedule)),checks:w.checks,
      writes:w.writes,aligned:w.writes?w.aligned/w.writes:null,tel:w.tel});
  });
} else {
  const args=process.argv.slice(2), ps=+(args[0]??5), seeds=Array.from({length:16},(_,i)=>2101+i);
  const select=args[1]?args[1].split(','):Object.keys(arms);
  assert.ok(ps>=1&&ps<=10&&Number.isInteger(ps)); assert.ok(select.every(a=>Object.hasOwn(arms,a)));
  const rows=existsSync(ledger)?readFileSync(ledger,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
  assert.ok(rows.every(r=>r.sourceHash===sourceHash));
  const key=r=>r.seed+':'+r.arm, done=new Set(rows.map(key));
  assert.equal(done.size,rows.length);
  const jobs=seeds.flatMap(seed=>select.map(arm=>({seed,arm}))).filter(j=>!done.has(key(j)));
  let j=0,count=0;
  console.log(`running ${jobs.length} remaining cells on ${ps} workers (digest ${sourceHash.slice(0,10)})`);
  await Promise.all(Array.from({length:Math.min(ps,jobs.length)},()=>new Promise((resolve,reject)=>{
    const w=new Worker(new URL(import.meta.url)); let current=null;
    const next=()=>{ if(j>=jobs.length) { w.terminate().then(resolve,reject); return; } current=jobs[j++]; w.postMessage(current); };
    w.on('error',reject); w.on('message',r=>{
      assert.equal(key(current),key(r)); assert.ok(!done.has(key(r)) && r.sourceHash===sourceHash);
      appendFileSync(ledger,JSON.stringify(r)+'\n'); done.add(key(r)); count++;
      if(count===1 || count%10===0 || count===jobs.length) console.log(`${new Date().toISOString()} ${count}/${jobs.length} last ${r.ms}ms`);
      next();
    }); next();
  })));
}
