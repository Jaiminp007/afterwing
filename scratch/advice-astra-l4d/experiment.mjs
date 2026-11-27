import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { mean, signflip } from '../../docs/paper/stats.mjs';
import { run } from './garden.mjs';

const file=s=>new URL(s,import.meta.url), read=s=>readFileSync(file(s),'utf8');
const digest=createHash('sha256').update(['garden.mjs','experiment.mjs','protocol.md','../../microverse/l4.mjs','../../docs/paper/stats.mjs'].map(read).join('\0')).digest('hex');
const tune=Array.from({length:16},(_,i)=>3101+i), hold=tune.map(s=>s+16);
const save=(s,x)=>writeFileSync(file(s),JSON.stringify(x,null,1)+'\n',{flag:'wx'});
const specs={}, rows=new Map(), means={}, pop=(r)=>r.popSum/100;
const add=(label,k,opts)=>{specs[label]={k,...opts};return label;};
const get=(s,a)=>{const r=rows.get(`${s}/${a}`);assert(r,`${s}/${a}`);return r;};
function ranks(names,bank=tune) {
  for(const a of names) means[a]=mean(bank.map(s=>pop(get(s,a))));
  return names.reduce((b,a)=>means[a]>means[b]?a:b);
}
function record(row) {
  const tag=`${row.seed}/${row.arm}`;
  assert(!rows.has(tag));assert.equal(row.digest,digest);assert.equal(row.samples,100);
  assert(Number.isInteger(row.popSum)&&row.popSum>=0&&row.popSum<=40000);
  assert.equal(row.end,60+row.births-row.deaths);
  rows.set(tag,row);
}
function measure(ints,unit) {
  const m=mean(ints)/unit;
  return {mean:m,sd:Math.sqrt(ints.reduce((v,x)=>v+(x/unit-m)**2,0)/(ints.length-1)),
    wins:ints.filter(x=>x>0).length,ties:ints.filter(x=>!x).length,p:signflip(ints,1),ints};
}
function compare(a,b,f,bank) {
  const A=bank.map(s=>get(s,a).popSum), B=bank.map(s=>get(s,b).popSum), F=bank.map(s=>get(s,f).popSum);
  return {...measure(A.map((x,i)=>2*x-3*B[i]+F[i]),200), gain2:(mean(B)-mean(F))/100,
    ratio:(mean(A)-mean(F))/(mean(B)-mean(F))};
}
function audit(arms,bank) {
  const out={};
  for(const a of arms){
    const rs=bank.map(s=>get(s,a)), risk=[0,1].map(j=>{
      const observed=rs.filter(r=>r.seen[j]);return observed.length?mean(observed.map(r=>r.err2[j]/r.seen[j])):null;
    });
    for(const r of rs)assert.equal(r.schedule,get(r.seed,arms[0]).schedule);
    out[a]={mean:mean(rs.map(pop)),risk,extinctions:rs.filter(r=>!r.end).map(r=>r.seed),
      capTicks:rs.reduce((n,r)=>n+r.atCap,0),lateTastes:rs.reduce((n,r)=>n+r.seen[0]+r.seen[1],0),
      scored:rs.reduce((n,r)=>n+r.counterfactuals,0),rateChanges:rs.reduce((n,r)=>n+r.alphaChanges,0)};
  }
  return out;
}
async function batch(names,bank,stage) {
  assert.equal(new Set(names).size,names.length);
  console.log(`${stage}: ${names.length} arms x ${bank[0]}..${bank.at(-1)}`);
  const jobs=bank.flatMap(seed=>names.map(arm=>({seed,arm,c:specs[arm]})));let cursor=0;
  await Promise.all(Array.from({length:Math.min(6,jobs.length)},()=>new Promise((res,rej)=>{
    const w=new Worker(new URL(import.meta.url));let job;
    const step=()=>{
      if(cursor===jobs.length){w.terminate().then(res,rej);return;}
      job=jobs[cursor++];assert(!rows.has(`${job.seed}/${job.arm}`));w.postMessage(job);
    };
    w.on('error',rej);w.on('message',r=>{
      assert.equal(r.seed,job.seed);const row={...r,arm:job.arm,digest};
      record(row);appendFileSync(file(`${stage}.ndjson`),JSON.stringify(row)+'\n');step();
    });step();
  })));
}

async function screen() {
  assert(!existsSync(file('tuning.ndjson')) && !existsSync(file('screen.json')),'Tuning already started');
  save('started.json',{digest,utc:new Date().toISOString(),tune,hold,version:process.version});
  const no=add('NOREV','null',{a:0});
  const cs=[1/128,1/32,1/8,.25,.5,.75,1].map(a=>add(`C_${a}`,'fixed',{a}));
  await batch([no,...cs],tune,'tuning');
  const fix=ranks(cs), a=specs[fix].a;
  const heter=[], idbd=[], auto=[], rms=[],bayes=[];
  for(const [low,high] of [[1/32,.75],[1/8,1]])for(const mask of [3,5,6,9,10,12])
    heter.push(add(`HET_${low}_${high}_${mask}`,'fixed',{a:low,high,mask}));
  for(const ai of new Set([1/32,.25,1,a]))for(const theta of [1/64,1/16,.25,1,4])
    idbd.push(add(`IDBD_${ai}_${theta}`,'idbd',{a:ai,theta}));
  for(const theta of [.005,.02,.08,.32])for(const tau of [100,10000])
    auto.push(add(`AUTO_${theta}_${tau}`,'auto',{a,theta,tau}));
  for(const scale of [1/32,1/8,.5])for(const decay of [.875,.984375])
    rms.push(add(`RMS_${scale}_${decay}`,'rms',{a,scale,decay}));
  for(const scale of [.5,1,2])bayes.push(add(`BAYES_${scale}`,'bayes',{a,scale}));
  const full=add('FULL_ALPHA_ORACLE','full',{a});
  await batch([...heter,...idbd,...auto,...rms,...bayes,full],tune,'tuning');
  const iBest=ranks(idbd), base=specs[iBest], dir=[],ora=[];
  for(const span of [2,8,32]) {
    const pars={a:base.a,theta:base.theta,span};
    ora.push(add(`ORACLE_${span}`,'oracle',pars));
    for(const [low,high] of [[1/32,.5],[1/16,1],[1/8,1]])for(const soft of [false,true])
      dir.push(add(`DIRECT_${span}_${low}_${high}_${+soft}`,'direct',{...pars,low,high,soft}));
  }
  await batch([...dir,...ora],tune,'tuning');
  const arms=Object.keys(specs),groups={fixed:cs,heter,idbd,auto,rms,bayes,direct:dir,oracle:ora};
  const locks=Object.fromEntries(Object.entries(groups).map(([k,x])=>[k,ranks(x)]));
  locks.l2best=ranks([...cs,...heter,...idbd,...auto,...rms,...bayes,...dir]);
  const d=compare(locks.oracle,locks.l2best,fix,tune);
  const output={digest,tune,hold,locks,specs,arms:audit(arms,tune),d,full:compare(full,locks.l2best,fix,tune),
    pass:d.mean>1&&d.gain2>0&&d.p<.05};
  save('screen.json',output);
  console.log(JSON.stringify({locks,d,pass:output.pass}));
}
async function heldout() {
  const s=JSON.parse(read('screen.json'));assert.equal(s.digest,digest);assert.equal(s.pass,true,'Headroom stop; no holdout');
  assert(!existsSync(file('evo.ndjson'))&&!existsSync(file('held-started.json')));
  Object.assign(specs,s.specs);
  for(const r of read('tuning.ndjson').trim().split('\n').map(JSON.parse))record(r);
  const {fixed:F,l2best:M,idbd:I,oracle:O}=s.locks;
  const base={...specs[I],span:specs[O].span};delete base.k;
  const E=[-1,0,.1,.5].map(pm=>add(`EVO_${pm}`,'evo',{...base,pm}));
  await batch(E,tune,'evo'); const evo=ranks(E);
  const m=add('META3','meta',base), sh=add('SHAM3','sham',base), re=add('META3_RESET','reset',base);
  const off=add('META3OFF','off',{...base,fixed:specs[F].a});
  const names=[...new Set(['NOREV',F,I,M,s.locks.auto,s.locks.rms,s.locks.bayes,s.locks.direct,O,m,sh,re,off,evo])];
  save('held-started.json',{digest,bank:hold,names,evo,specs});
  await batch(names,hold,'heldout');
  for(const seed of hold){
    assert.equal(get(seed,off).popSum,get(seed,F).popSum);
    assert.equal(get(seed,off).popPath,get(seed,F).popPath);
  }
  const margin=(a,b)=>measure(hold.map(seed=>get(seed,a).popSum-get(seed,b).popSum),100);
  const d=compare(m,M,F,hold),fact=compare(m,I,F,hold);
  const contrasts=[margin(m,M),margin(m,sh),margin(m,evo),margin(m,re),margin(M,F),margin(F,'NOREV')];
  const pass=d.mean>0&&d.p<.01&&fact.mean>0&&fact.p<.01&&fact.wins>=11&&
    contrasts.every((x,i)=>x.p<.01&&(i<3?x.mean>=1:x.mean>0));
  save('heldout.json',{digest,hold,names,evo,arms:audit(names,hold),d,fact,contrasts,pass});
}
if(!isMainThread)parentPort.on('message',({seed,c})=>parentPort.postMessage(run(seed,c)));
else if(process.argv[2]==='screen')await screen();
else if(process.argv[2]==='hold')await heldout();
else throw Error('Expected screen or hold');
