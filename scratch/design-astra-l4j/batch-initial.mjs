import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { createHash } from 'node:crypto';
import { fixed, l2s, other, shares, make } from './arms.mjs';
import { run, G, GENERATIONS, LATE } from './world.mjs';
import { mean } from '../../docs/paper/stats.mjs';

export const here = n => new URL(n,import.meta.url);
const path = fileURLToPath(import.meta.url);
export const read = n => JSON.parse(fs.readFileSync(here(n),'utf8'));
export const save = (n,v) => fs.writeFileSync(here(n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
export const rows = stage => fs.readFileSync(here(stage+'.ndjson'),'utf8').trim().split('\n').map(JSON.parse);
const sum = a => a.reduce((s,x)=>s+x,0);
export function cover(stage) {
  const job=read(stage+'.json'), rr=rows(stage);
  assert.equal(rr.length,job.seeds.length*job.specs.length);
  const tab=new Map();
  for(const row of rr){
    const {seed,arm,pops,axes,hits,counts,nLate}=row;
    assert(job.seeds.includes(seed)&&job.specs.some(a=>a.name===arm));
    assert(!tab.has(`${seed}/${arm}`)); tab.set(`${seed}/${arm}`,row);
    assert.equal(pops.length,GENERATIONS); assert.equal(axes.length,GENERATIONS);
    assert(pops.every(n=>Number.isInteger(n)&&n>=0)); assert(axes.every(x=>x===0||x===1));
    assert.equal(row.popSum,sum(pops.slice(LATE))); assert.equal(nLate,GENERATIONS-LATE);
    assert.equal(row.born,48+sum(pops)); assert.equal(row.bites,sum(counts));
    assert.equal(row.correct,sum(hits)); assert(row.bites>0);
    assert(counts.every((c,g)=>c===G*(g ? pops[g-1] : 48)&&hits[g]>=0&&hits[g]<=c));
  }
  return rr;
}
const average=(rr,s)=>mean(rr.filter(r=>r.arm===s.name).map(r=>r.popSum/r.nLate));
export const best=(rr,specs) => specs.reduce((a,s)=>average(rr,s)>average(rr,a) ? s:a);
export const sortBias = (rr,base) => {
  const family = l2s.filter(s=>s.a===base.a&&s.h===base.h);
  return [0,1].map(ax=>family.map(s=>{
    let tot=0,n=0;
    for(const r of rr.filter(r=>r.arm===s.name)) for(let g=LATE;g<GENERATIONS;g++)
      if(r.axes[g]===ax) {tot+=r.pops[g]; n++;}
    return [s.b,tot/n];
  }).sort((a,b)=>b[1]-a[1]));
};
const seeds=(offset)=>Array.from({length:16},(_,i)=>952001+offset+i);
function plan(stage) {
  if(stage==='tune') return {specs:[...fixed,...l2s,...other],seeds:seeds(0)};
  const t=cover('tune'), F=best(t,fixed), E=best(t,l2s), ranks=sortBias(t,E);
  const O={...E,name:'ORACLE3',kind:'oracle',map:ranks.map(r=>r[0][0])};
  const evos=[0,.04,.20].map(pm=>({...E,name:`EVO_${pm}`,kind:'evo',pm}));
  if(stage==='challengers')return {specs:[...shares(E),...evos,O],seeds:seeds(0),F,E,O,ranks};
  const c=cover('challengers'), sr=best(c,shares(E)), ev=best(c,evos), j=best(t,other.filter(s=>s.kind==='joint'));
  const contenders=[F,E,sr,ev,j,other[0]], T=best([...t,...c],contenders);
  if(stage==='hold') return {specs:[...new Map([...contenders,O].map(s=>[s.name,s])).values()],seeds:seeds(16), F,E,O,T,sr,ev,j,ranks,
    learned:{...E,name:'META3',kind:'meta'},sham:{...E,name:'SHAM',kind:'sham'}};
  assert.equal(stage,'learned');
  const h=cover('hold'), lock=read('hold.json');
  assert(2*average(h,O)-3*average(h,T)+average(h,F)>0,'oracle screen failed, META3 not licensed');
  return {specs:[lock.learned,lock.sham],seeds:seeds(16)};
}
if(!isMainThread) {
  const spec=workerData;
  parentPort.on('message',([seed,i])=>parentPort.postMessage(run(seed,spec[i],make)));
} else if(process.argv[1]===path) {
  const [cmd,stage]=process.argv.slice(2);
  if(cmd==='launch'){
    assert.equal(process.versions.node.split('.')[0],'22');
    const job=plan(stage);
    job.code=Object.fromEntries(['arms.mjs','world.mjs','batch.mjs','design.md'].map(f=>[f,
      createHash('sha256').update(fs.readFileSync(here(f))).digest('hex')]));
    job.frozen=new Date().toISOString(); save(stage+'.json',job);
    const out=fs.openSync(here(stage+'.out'),'wx'),err=fs.openSync(here(stage+'.err'),'wx');
    const p=spawn(process.execPath,[path,'work',stage],{detached:true,windowsHide:true,stdio:['ignore',out,err]});
    fs.closeSync(out);fs.closeSync(err);p.unref(); console.log(JSON.stringify({stage,pid:p.pid,specs:job.specs.length,seeds:job.seeds}));
  } else {
    assert.equal(cmd,'work'); const job=read(stage+'.json'), src=here(stage+'.ndjson');
    fs.writeFileSync(src,'',{flag:'wx'});
    const tasks=job.seeds.flatMap(s=>job.specs.map((_,i)=>[s,i]));
    let sent=0, done=0;
    await Promise.all(Array.from({length:4},()=>new Promise((resolve,reject)=>{
      const w=new Worker(new URL(import.meta.url),{workerData:job.specs});
      const next=()=>sent<tasks.length ? w.postMessage(tasks[sent++]) : w.terminate().then(resolve,reject);
      w.on('error',reject); w.on('message',row=>{
        fs.appendFileSync(src,JSON.stringify(row)+'\n'); ++done;
        if(done%32===0 || done===tasks.length) console.log(new Date().toISOString(),done,'/',tasks.length);
        next();
      });next();
    })));
    assert.equal(cover(stage).length,tasks.length); save(stage+'.complete.json',{done,at:new Date().toISOString()});
  }
}
