import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { mean, signflip } from '../../docs/paper/stats.mjs';
import { H, run, scalar, strengths } from './world.mjs';

const here=s=>new URL(s,import.meta.url), text=s=>readFileSync(here(s),'utf8');
const digest=H(['./world.mjs','./base.mjs','./experiment.mjs','./protocol.md',
  '../advice-astra-l4/world.mjs','../../docs/paper/stats.mjs'].map(text));
const rowsFile=here('./rows.ndjson'), recordsFile=here('./records.ndjson');
const tune=Array.from({length:16},(_,i)=>2701+i), hold=tune.map(x=>x+16);
const specs={FIXED:{kind:'FIXED'},NOREV:{kind:'NOREV'}};
const ss=scalar.map((_,i)=>`SCALAR${i}`);
ss.forEach((s,i)=>specs[s]={kind:'SCALAR',scalar:i});
const rows=[];
const by=(a,s)=>rows.find(r=>r.arm===a&&r.seed===s);
function add(name,k,sc,gain,extra={}) {specs[name]={kind:k,scalar:sc,gain,...extra};return name;}
function best(names,bank=tune) {
  const score=a=>mean(bank.map(s=>by(a,s).popSum));
  return names.reduce((b,k)=>score(k)>score(b)?k:b);
}
function test(ints,unit) {
  const m=mean(ints)/unit;
  return {mean:m,sd:Math.sqrt(ints.reduce((s,x)=>s+(x/unit-m)**2,0)/(ints.length-1)),
    positive:ints.filter(x=>x>0).length,ties:ints.filter(x=>!x).length,p:signflip(ints,1),ints};
}
function contrast(a,b,bank){
  const X=bank.map(s=>by(a,s).popSum),Y=bank.map(s=>by(b,s).popSum),F=bank.map(s=>by('FIXED',s).popSum);
  return {...test(X.map((v,i)=>2*v-3*Y[i]+F[i]),200),
    gain2:(mean(Y)-mean(F))/100,ratio:(mean(X)-mean(F))/(mean(Y)-mean(F))};
}
function verify(bank,arms) {
  for(const s of bank)for(const a of arms){
    const r=by(a,s),f=by('FIXED',s);
    assert.ok(r&&f);assert.equal(r.n,100);assert.ok(Number.isInteger(r.popSum));
    for(const i of [0,1]){
      const x=r.gardens[i],y=f.gardens[i];
      for(const key of ['season','fork','schedule','trials'])assert.deepEqual(x[key],y[key],[s,a,i,key].join('/'));
      assert.deepEqual(x.byAction,y.byAction);
      if(specs[a].kind==='ORACLE'){assert.equal(x.reads,x.aligned);assert.ok(x.reads>0);}
    }
  }
}
function summary(bank,arms){return Object.fromEntries(arms.map(a=>[a,mean(bank.map(s=>by(a,s).popSum))/100]));}
async function batch(bank,arms) {
  const jobs=bank.flatMap(seed=>arms.filter(a=>!by(a,seed)).map(arm=>({seed,arm,spec:specs[arm]})));
  if(!jobs.length)return;
  console.log('Starting',jobs.length,'new cells:',arms.join(' '));
  let at=0,done=0;
  await Promise.all(Array.from({length:Math.min(8,jobs.length)},()=>new Promise((resolve,reject)=>{
    const worker=new Worker(new URL(import.meta.url));
    let job;
    function next(){if(at===jobs.length){worker.terminate().then(resolve,reject);return;}job=jobs[at++];worker.postMessage(job);}
    worker.on('error',reject);
    worker.on('message',({out,raw})=>{
      assert.equal(out.arm,job.arm);assert.equal(out.seed,job.seed);out.digest=digest;
      if(raw)appendFileSync(recordsFile,JSON.stringify({seed:out.seed,digest,raw})+'\n');
      appendFileSync(rowsFile,JSON.stringify(out)+'\n');rows.push(out);
      if(++done%32===0||done===jobs.length)console.log(done,'/',jobs.length);
      next();
    });
    next();
  })));
}
const save=(name,value)=>writeFileSync(here('./'+name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
if(!isMainThread) parentPort.on('message',({seed,arm,spec})=>parentPort.postMessage(run(seed,arm,spec)));
else if(['screen','continue'].includes(process.argv[2])){
  if(existsSync(rowsFile))for(const line of text('./rows.ndjson').trim().split(/\r?\n/)){
    const r=JSON.parse(line);assert.equal(r.digest,digest);assert.ok([...tune,...hold].includes(r.seed));assert.ok(!by(r.arm,r.seed));rows.push(r);
  }
  await batch(tune,['FIXED',...ss]);
  const scalarBest=best(ss),sc=specs[scalarBest].scalar;
  const pairs=[1,8,40].map(g=>add(`PAIR${g}`,'PAIR',sc,g));
  const tx=[1,8,40].map(g=>add(`TRANS${g}`,'TRANS',sc,g));
  const direct=[4,20,80].flatMap(g=>[false,true].map(soft=>add(`DIRECT${g}${soft?'soft':'hard'}`,'DIRECT',sc,g,{soft})));
  const kernels=strengths.flatMap(g=>[0,1].map(r=>add(`K${r}_${g}`,'K',sc,g,{r})));
  const ora=strengths.map(g=>add(`ORACLE${g}`,'ORACLE',sc,g));
  await batch(tune,[...pairs,...tx,...direct,...kernels,...ora]);
  const challengers=[...ss,...pairs,...tx,...direct,...kernels];
  verify(tune,['FIXED',...challengers,...ora]);
  const records=text('./records.ndjson').trim().split(/\r?\n/).map(JSON.parse);
  for(const s of tune) {
    const rr=records.filter(x=>x.seed===s);assert.equal(rr.length,1);
    for(let i=0;i<2;i++)assert.equal(H(rr[0].raw[i]),by('FIXED',s).gardens[i].trials);
  }
  const locks={scalar:scalarBest,pair:best(pairs),transition:best(tx),direct:best(direct),fixedKernel:best(kernels),
    all:best(challengers),oracle:best(ora)};
  const d=contrast(locks.oracle,locks.all,tune),pass=d.mean>1&&d.p<.05&&d.gain2>0;
  const screen={digest,seeds:tune,locks,specs:{...specs},means:summary(tune,['FIXED',...challengers,...ora]),
    oracleD4:d,oracleVsDirect:contrast(locks.oracle,locks.direct,tune),pass};
  if(!existsSync(here('./screen.json')))save('screen.json',screen);
  else assert.deepEqual(screen,JSON.parse(text('./screen.json')));
  console.log(JSON.stringify({locks,d,pass}));
  if(process.argv[2]==='continue'){
    assert.ok(pass,'oracle screen failed; held-out seeds sealed');
    const g=specs[locks.oracle].gain;
    const controls=['META3','SHAM','RESET','OFF'].map(k=>add(k,k,sc,g));
    const evo=['E0','R','S','V0','V10','V50'].map(k=>{
      specs['EVO_'+k]={...specs[locks.all],evo:k,evoGain:g};return 'EVO_'+k;
    });
    await batch(tune,[...evo,...controls,'NOREV']);
    verify(tune,[...evo,...controls,'NOREV']);
    const e=best(evo);const confirmed=[...new Set(['FIXED','NOREV',...Object.values(locks),...controls,e])];
    const lock={locks,e,confirmed,digest};
    if(!existsSync(here('./lock.json')))save('lock.json',lock);else assert.deepEqual(lock,JSON.parse(text('./lock.json')));
    await batch(hold,confirmed);verify(hold,confirmed);
    for(const s of [...tune,...hold])assert.equal(by('OFF',s).popSum,by('FIXED',s).popSum);
    for(const s of tune)assert.equal(by('EVO_E0',s).popSum,by(locks.all,s).popSum);
    const delta=(a,b)=>test(hold.map(s=>by(a,s).popSum-by(b,s).popSum),100);
    const score={lock,means:summary(hold,confirmed),d4:contrast('META3',locks.all,hold),
      f4:contrast('META3',locks.scalar,hold),oracle:contrast(locks.oracle,locks.all,hold),
      direct:delta('META3',locks.direct),sham:delta('META3','SHAM'),evo:delta('META3',e),reset:delta('META3','RESET')};
    save('confirm.json',score);console.log(JSON.stringify(score));
  }
}
