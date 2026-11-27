import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import assert from 'node:assert/strict';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {cfg,grids,references,simulate} from './arms.mjs';

const path=n=>new URL(n,import.meta.url);
const hashes=()=>Object.fromEntries(['arms.mjs','run.mjs','../advice-gemini-l4d/l4d_world.mjs'].map(k=>[k,crypto.createHash('sha256').update(fs.readFileSync(path(k))).digest('hex')]));
function write(name,o){fs.writeFileSync(path(name),JSON.stringify(o,null,2),{flag:'wx'});}
const read=name=>JSON.parse(fs.readFileSync(path(name)));
const range=start=>Array.from({length:16},(_,i)=>i+start);
if(!isMainThread) {
  parentPort.on('message',({seed,arm})=>{
    const t=Date.now(), r=simulate(seed,arm);
    assert(r.bites>0&&r.births>0&&r.pop*100-r.popSum<1e-8&&Number.isFinite(r.skill));
    parentPort.postMessage({...r,ms:Date.now()-t});
  });
} else {
  const mode=process.argv[2]; assert(['tune','held'].includes(mode));
  const seeds=range(mode==='tune'?3401:3417);
  const locks=mode==='held'?read('lock.json'):null;
  if(locks)assert.deepEqual(locks.hashes,hashes());
  const arms=locks?[...references,...locks.families]:Object.values(grids).flat();
  const tasks=arms.flatMap(arm=>seeds.map(seed=>({arm,seed})));
  write(`${mode}-started.json`,{start:new Date().toISOString(),hashes:hashes(),seeds,arms,cfg,node:process.version});
  const out=fs.openSync(path(`${mode}.ndjson`),'wx'),rows=[];
  await Promise.all(Array.from({length:Math.min(10,os.availableParallelism())},()=>new Promise((res,rej)=>{
    const w=new Worker(new URL(import.meta.url),{workerData:true});
    const next=()=>{const task=tasks.shift();if(task)w.postMessage(task);else w.terminate().then(res,rej);};
    w.on('error',rej);w.on('message',r=>{
      fs.writeSync(out,JSON.stringify(r)+'\n');rows.push(r);
      if(rows.length%16===0)console.log(mode,rows.length,'/',seeds.length*arms.length,new Date().toISOString());
      next();
    });next();
  })));
  fs.closeSync(out);
  const scores={};
  for(const a of arms) {
    const set=rows.filter(r=>r.armName===a.name);
    assert.deepEqual(set.map(r=>r.seed).sort(),seeds);
    scores[a.name]=set.reduce((sum,r)=>sum+r.popSum,0)/1600;
  }
  if(mode==='tune'){
    const best=(a,b)=>scores[b.name]>scores[a.name]?b:a;
    const families=Object.values(grids).map(g=>g.reduce(best));
    write('lock.json',{lockedAt:new Date().toISOString(),scores,families,primary:families.reduce(best).name,hashes:hashes()});
  }
  console.log(mode,scores);
}
