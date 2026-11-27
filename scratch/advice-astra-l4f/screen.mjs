import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { Worker, isMainThread, workerData, parentPort } from 'node:worker_threads';
import { ARMS, GRID, fixtures, garden, run } from './ecology.mjs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

const url=name=>new URL(name,import.meta.url);
const read=name=>readFileSync(url(name),'utf8');
const save=(name,x)=>writeFileSync(url(name),JSON.stringify(x,null,1)+'\n',{flag:'wx'});
const seeds=Array.from({length:16},(_,i)=>3301+i);
const fingerprint=()=>Object.fromEntries(['protocol.md','ecology.mjs','screen.mjs','../../microverse/l3v.mjs','../../docs/paper/stats.mjs']
  .map(name=>[name,createHash('sha256').update(readFileSync(url(name))).digest('hex')]));
function score(){
  const start=JSON.parse(read('started.json'));
  assert.deepEqual(start.hashes,fingerprint());assert.deepEqual(start.seeds,seeds);assert.deepEqual(start.arms,ARMS);
  const rows=read('tuning.ndjson').trim().split('\n').map(s=>JSON.parse(s));
  assert.equal(rows.length,seeds.length*ARMS.length);
  const byArm=new Map(ARMS.map(a=>[a.name,new Map()]));
  for(const r of rows){
    assert(seeds.includes(r.seed)&&Number.isInteger(r.sum));assert.equal(r.census.length,24);
    assert.equal(r.sum,r.census.slice(12).reduce((a,b)=>a+b,0));assert(r.bites>0);
    assert.equal(r.bites,r.deaths*80);assert.equal(r.births-r.deaths+72,r.census.at(-1));
    assert(!byArm.get(r.arm).has(r.seed));byArm.get(r.arm).set(r.seed,r);
  }
  for(const s of seeds)assert.equal(new Set(ARMS.map(a=>byArm.get(a.name).get(s).world)).size,1);
  const val=n=>seeds.map(s=>byArm.get(n).get(s).sum),N=n=>mean(val(n))/12;
  const rank=ns=>ns.reduce((a,b)=>N(b)>N(a)?b:a);
  const fam=n=>ARMS.filter(a=>a.family===n).map(a=>a.name);
  const C=fam('C'), E=[...fam('EVO'),...C];
  const O=GRID.flatMap((_,s)=>GRID.map((_,f)=>s===f?`C:${s}`:`O:${s}:${f}`));
  const best={};
  for(const [k,ns] of Object.entries({NOREV:fam('NOREV'),FIXED:fam('FIXED'),C,EVO_SV:fam('EVO'),EVO:E,SUR:fam('SUR'),IDBD:fam('IDBD'),BAYES:fam('BAYES'),ORACLE:O,
    L2best:[...C,...fam('EVO'),...fam('SUR'),...fam('IDBD'),...fam('BAYES')]})){
    const n=rank(ns);best[k]={arm:n,mean:N(n)};
  }
  const F=val(best.FIXED.arm),B=val(best.L2best.arm),o=val(best.ORACLE.arm);
  const ints=o.map((x,i)=>2*x-3*B[i]+F[i]), wins=ints.filter(x=>x>0).length, ties=ints.filter(x=>!x).length;
  const p=signflip(ints,1),delta=ints.map(v=>v/24),d4=mean(delta),base=(mean(B)-mean(F))/12;
  const ratio=(mean(o)-mean(F))/(12*base);
  // Independent exhaustive check, small enough for all 2^16 allocations.
  let exact=0;const observed=ints.reduce((a,b)=>a+b,0);
  for(let m=0;m<65536;m++){let v=0;for(let i=0;i<16;i++)v+=(m>>i&1?1:-1)*ints[i];if(v>=observed)exact++;}
  assert.equal(exact/65536,p);
  const result={n:rows.length,best,baselineGain:base,oracleGain:(mean(o)-mean(F))/12,d4,ratio,wins,ties,p,exact,
    d4BySeed:delta,sd:Math.sqrt(delta.reduce((s,x)=>s+(x-d4)**2,0)/15),
    pass:base>0&&ratio>=1.5&&wins>=11,extinctCells:rows.filter(r=>r.census.at(-1)===0).length,
    familyMeans:Object.fromEntries(ARMS.map(a=>[a.name,N(a.name)]))};
  save('result.json',result);console.log(JSON.stringify({...result,familyMeans:undefined},null,1));
}
if(!isMainThread){
  for(const seed of workerData){
    const e=garden(seed);
    parentPort.postMessage({world:{seed,hash:e.hash,draws:e.draws,pulses:e.pulses,swaps:e.swaps}});
    for(const a of ARMS)parentPort.postMessage({row:run(seed,a,e)});
  }
}else if(process.argv[2]==='check'){
  fixtures();console.log('Fixtures passed on scripted tastes, no ecology endpoints.');
}else if(process.argv[2]==='score'){
  score();
}else if(process.argv[2]==='tune'){
  fixtures();
  for(const f of ['started.json','tuning.ndjson','worlds.ndjson','result.json'])assert(!existsSync(url(f)),f);
  save('started.json',{at:new Date().toISOString(),stage:'tuning only',seeds,arms:ARMS,grid:GRID,hashes:fingerprint()});
  const workers=8;
  await Promise.all(Array.from({length:workers},(_,i)=>new Promise((resolve,reject)=>{
    const w=new Worker(new URL(import.meta.url),{workerData:seeds.filter((_,j)=>j%workers===i)});
    w.on('message',m=>appendFileSync(url(m.world?'worlds.ndjson':'tuning.ndjson'),JSON.stringify(m.world??m.row)+'\n'));
    w.on('error',reject);w.on('exit',code=>code?reject(Error(`worker exit ${code}`)):resolve());
  })));
  score();
}else throw Error('use check | tune | score');
