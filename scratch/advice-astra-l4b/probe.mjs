import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { World as CachedWorld } from '../advice-astra-l4/world.mjs';

// Retain the L4-A ecology and its admission and validation thresholds. Add
// provenance to each proposal, keeping it through admission until adjudicated.
const input = x => readFileSync(new URL(x, import.meta.url), 'utf8');
const sha = x => createHash('sha256').update(x).digest('hex');
let src = input('../../microverse/l4.mjs');
function replace(old, fresh) {
  assert.equal(src.split(old).length, 2, old);
  src = src.replace(old, () => fresh);
}
replace('if (this.tick > 0 && this.tick % cfg.macroEvery === 0) {', 'if (this.tick > 0 && this.tick % 200 === 0) { this.switchFrame(); } else if (false) {');
replace('} else if (this.tick > 0 && this.tick % cfg.subEvery === 0) {','} else if (false) {');
replace('const v = ruleValence(this.rule, bits);','bits.negative = 4095 ^ c; const v = ruleValence(this.rule, bits);');
replace('const goodPred = this.codes.map(bits => { const p = this.tastePredict(f, bits); return p > cfg.acceptAt ? p - (1 - p) * cfg.toxin : 0; });','const goodPred = this.goodValues(f);');
replace('const phi = f.masks.map(m => walsh(m, bits));','f.predCodes = null; const phi = f.masks.map(m => walsh(m, bits));');
replace('const bits = this.codes[pl.kind], pred = this.tastePredict(f, bits);','const bits = this.codes[pl.kind], pred = f.raw[pl.kind];');
replace('if (this.l2v) this.l2Update(f);','this.observeActive(f); if (this.l2v) this.l2Update(f);');
replace('excl.add(m); f.buf.push({ mask: m,','excl.add(m); f.buf.push({ ticket: this.ticket(f,m), mask: m,');
replace('f.masks.push(chosen); f.w.push(0);','f.activeTickets.push(f.buf[bestIdx].ticket); f.masks.push(chosen); f.w.push(0);');
replace('if (f.buf[i].age >= cfg.evictAge) f.buf.splice(i, 1);','if (f.buf[i].age >= cfg.evictAge) { this.resolve(f, f.buf[i].ticket, false); f.buf.splice(i, 1); }');
replace('removeMask(f, i) { f.masks.splice','removeMask(f, i) { this.resolve(f, f.activeTickets[i], false); f.activeTickets.splice(i,1); f.masks.splice');
const {World4, rng32, mix, ALL_PAIRS, L2_GRID} = await import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
const digest = sha([src,input('./probe.mjs'),input('../advice-astra-l4/world.mjs'),input('../../microverse/l3v.mjs')].join('\n'));
const seeds = Array.from({length:16}, (_,i)=>2501+i);
const train = seeds.slice(0,8);
const masks = ALL_PAIRS.map(p=>p.mask);
const rot = (m,k) => (m & 2048) | (((m & 2047) << k | (m & 2047) >>> (11-k)) & 2047);
const mod = x => (x % 11 + 11) % 11;
const id = new Map(masks.map((m,i)=>[m,i]));
const translated = masks.map(m=>Array.from({length:11},(_,k)=>id.get(rot(m,k))));
const neutral = Array(11).fill(1/11);
const soft = (s,t=1) => {const x=s.map(v=>Math.exp(t*v)); const n=x.reduce((a,b)=>a+b); return x.map(v=>v/n);};
export const scalars = ['L3V','D015B4','D030B12','D060B20','D150B40'].map(k=>'S:'+k);
export const pairs = ['.0002,.15,D060B20','.02,.15,D060B20','.10,1,D060B20','.02,1,D030B12','.10,.15,D150B40'].map(k=>'P:'+k);
export const direct = ['D:.5','D:1','D:2'];
export const l2 = [...scalars,...pairs,'POOL',...direct];
export const labels = [...l2,'FIXED','NOREV','M3','SHAM','OFF','RESET','ORACLE'];
const ordinary = new Set(labels);
const evos = ['E0','SV0','SV10','SV50'];
function spec(name) {
  const [kind,base] = name.split('|');
  if(base) assert.ok(evos.includes(kind)&&l2.includes(base));
  else assert.ok(ordinary.has(name));
  return {base:base??name, evo:base?kind:null};
}
class WorldB extends World4 {
  constructor(seed, name) {
    assert.ok(seeds.includes(seed));
    const s=spec(name), base=s.base, plain=base.startsWith('S:'), pair=base.startsWith('P:');
    const [dg,gf,variant]=pair?base.slice(2).split(','):['.02','.15',plain?base.slice(2):'D060B20'];
    super(seed,base==='NOREV'?'NOREV':['OFF','FIXED'].includes(base)?'FIXED':'META',{l2Variant:variant,proto:s});
    if(base==='OFF')this.l2v=L2_GRID[variant];
    Object.assign(this,{s,dg:+dg,gf:+gf,plain,pair});
    this.env=rng32(mix(seed ^ 0x4652414d)); this.nextSwitch=0;this.phase=0;
    this.schedule=[]; this.diag={events:0,censored:0,attributed:0,success:0,anchors:0,oracleMass:0,reads:0};
    this.switchFrame();
  }
  switchFrame() {
    const r=this.env,t=this.tick/200;
    if(t===this.nextSwitch) {
      this.law=t?mod(this.law+1+Math.floor(10*r())):Math.floor(11*r());
      this.nextSwitch=t+23+Math.floor(11*r());
    }
    if(t%5===0)this.canonical=Math.floor(66*r());
    this.phase=t?mod(this.phase+1+Math.floor(10*r())):Math.floor(11*r());
    const q=translated[this.canonical][mod(this.law*this.phase)], p=ALL_PAIRS[q];
    this.subset=[p.a,p.b];this.rule={mask:p.mask,target:[p.mask],sign:r()<.5?-1:1,subset:this.subset};
    this.redrawCodes(); this.schedule.push([this.tick,this.phase,this.law,this.canonical,p.mask,this.rule.sign,this.codes.map(x=>x.negative)]);
  }
  spawn(p,...args) {
    const f=super.spawn(p,...args),{base,evo}=this.cfg.proto;
    f.g=p?Float64Array.from(p.g):new Float64Array(66);
    f.score=p&&base!=='RESET'?p.score.slice():Array(11).fill(0);
    // The L2 write stays inherited even in RESET. Only rule-score memory resets.
    f.cache=p?.cache??null;f.anchor=p?.anchor??null; f.activeTickets=[null];
    const r=rng32(mix(this.seed^Math.imul(f.id,2654435761)^0x42495254));
    f.gene=p?p.gene:Math.floor(r()*11);
    if(p && evo?.startsWith('SV') && r()<Number(evo.slice(2))/100) f.gene=mod(f.gene+1+Math.floor(10*r()));
    return f;
  }
  l2Update(f) {
    const v=this.l2v;
    for(let b=0;b<12;b++) f.alpha[b]=1+(1-v.alphaDecay)*(f.alpha[b]-1);
    for(let i=0;i<66;i++)f.g[i]*=1-this.dg;
    for(let j=1;j<f.masks.length;j++) if(f.maskAge[j]>=10 && Math.abs(f.w[j])>=2.5) {
      const q=id.get(f.masks[j]),p=ALL_PAIRS[q]; this.tel.l2Updates++;
      for(const b of [p.a,p.b]) f.alpha[b]=Math.min(v.alphaMax,f.alpha[b]+v.alphaBoost);
      f.g[q]=Math.min(10,f.g[q]+1);
    }
  }
  ticket(f,m) {
    const a=f.anchor,q=id.get(m);
    let who=-1;
    if(a && this.phase!==a.phase) for(let k=0;k<11;k++)
      if(translated[a.q][mod((this.phase-a.phase)*k)]===q) {who=k;break;}
    return {q,who,epoch:Math.floor(this.tick/200),phase:this.phase};
  }
  resolve(f,t,ok) {
    if(!t)return;
    if(t.epoch!==Math.floor(this.tick/200)){this.diag.censored++;return;}
    this.diag.events++;
    if(t.who>=0) {
      this.diag.attributed++; if(ok)this.diag.success++;
      for(let k=0;k<11;k++)f.score[k]=Math.max(-4,Math.min(6,.996*f.score[k]+(k===t.who?(ok?Math.log(.12/.005):Math.log(.88/.995)):0)));
    }
    if(!ok)return;
    f.anchor={q:t.q,phase:t.phase};this.diag.anchors++;
    let w=neutral;
    if(['M3','RESET','OFF','SHAM'].includes(this.s.base)){
      const p=soft(f.score);
      // All permutations of the 11 post-clip, post-softmax weights, averaged
      // at the L2 write. Translations that coincide retain their combined mass.
      w=this.s.base==='SHAM'?Array(11).fill(p.reduce((a,b)=>a+b)/11):p;
    } else if(this.s.base==='ORACLE')w=neutral.map((_,k)=>+(k===this.law));
    f.cache=w;
    if(this.s.base==='ORACLE')assert.equal(w[this.law],1);
    this.diag.oracleMass+=w[this.law];this.diag.reads++;
  }
  observeActive(f) {
    for(let j=1;j<f.masks.length;j++) if(f.activeTickets[j]&&f.maskAge[j]>=10&&Math.abs(f.w[j])>=2.5) {
      this.resolve(f,f.activeTickets[j],true);f.activeTickets[j]=null;
    }
  }
  drawCandidate(f,ex) {
    const {base,evo}=this.s;
    if(['OFF','FIXED','NOREV'].includes(base))return super.drawCandidate(f,ex);
    const a=f.anchor,r=f.rProp;
    let w;
    if(evo?.startsWith('SV')&&a&&r()<.85)w=neutral.map((_,k)=>+(k===f.gene));
    else if(a&&!this.plain&&!this.pair&&r()<.85)w=base.startsWith('D:')?soft(f.score,+base.slice(2)):f.cache;
    if(w){
      const delta=this.phase-a.phase, preds=translated[a.q], eligible=[];
      let sum=0;
      for(let k=0;k<11;k++){const m=masks[preds[mod(delta*k)]]; if(w[k]>0&&!ex.has(m)){sum+=w[k];eligible.push([m,w[k]]);}}
      if(sum>0){let x=r()*sum;for(const [m,p] of eligible)if((x-=p)<=0)return m;return eligible.at(-1)[0];}
    }
    const weights=[],ms=[];let sum=0;
    for(let i=0;i<66;i++) {
      const p=ALL_PAIRS[i];if(ex.has(p.mask))continue;
      const v=(.02+f.alpha[p.a])*(.02+f.alpha[p.b])*(this.plain?1:this.gf+f.g[i]);
      sum+=v;weights.push(v);ms.push(p.mask);
    }
    let x=r()*sum;for(let i=0;i<ms.length;i++)if((x-=weights[i])<=0)return ms[i];return ms.at(-1)??-1;
  }
}
WorldB.prototype.goodValues=CachedWorld.prototype.goodValues;
WorldB.prototype.moveFeatures=CachedWorld.prototype.moveFeatures;
export function run(seed,arm) {
  const w=new WorldB(seed,arm);
  let popSum=0,n=0;const hashes=[];
  for(let t=0;t<20000;t++) {w.step();if(w.tick%100===0){hashes.push(w.stateHash());if(w.tick>10000){popSum+=w.flies.length;n++;}}}
  assert.equal(n,100);assert.equal(w.schedule.length,100);
  return {seed,arm,popSum,n,schedule:sha(JSON.stringify(w.schedule)),states:sha(JSON.stringify(hashes)),digest,extinct:!w.flies.length,diag:w.diag,tel:w.tel};
}
export const ledger=new URL('./rows.ndjson',import.meta.url);
export function readRows() {
  const rows=existsSync(ledger)?readFileSync(ledger,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
  const keys=new Set();
  for(const r of rows){assert.equal(r.digest,digest);assert.ok(seeds.includes(r.seed));spec(r.arm);const k=r.seed+' '+r.arm;assert.ok(!keys.has(k));keys.add(k);}
  return rows;
}
export function best(opts,rows,bank=train) {
  const sum=k=>bank.reduce((n,s)=>{const a=rows.filter(r=>r.seed===s&&r.arm===k);assert.equal(a.length,1);return n+a[0].popSum;},0);
  return opts.map(k=>({k,sum:sum(k)})).sort((a,b)=>b.sum-a.sum)[0].k;
}
if(!isMainThread)parentPort.on('message',({s,a})=>parentPort.postMessage(run(s,a)));
else if(process.argv[2]==='run'){
  const rows=readRows(),done=new Set(rows.map(r=>r.seed+':'+r.arm));
  async function batch(labels,bank) {
    const jobs=bank.flatMap(s=>labels.map(a=>({s,a}))).filter(({s,a})=>!done.has(s+':'+a));
    let j=0,n=0;console.log('starting',jobs.length,labels.join(' '));
    await Promise.all(Array.from({length:Math.min(5,jobs.length)},()=>new Promise((res,rej)=>{
      const w=new Worker(new URL(import.meta.url));let job;
      function next(){if(j>=jobs.length){w.terminate().then(res,rej);return;} job=jobs[j++];w.postMessage(job);}
      w.on('error',rej);w.on('message',r=>{assert.equal(r.seed,job.s);assert.equal(r.arm,job.a);assert.equal(r.digest,digest);appendFileSync(ledger,JSON.stringify(r)+'\n');rows.push(r);done.add(r.seed+':'+r.arm);if(++n%32===0)console.log(n,'/',jobs.length);next();});next();
    })));
  }
  await batch(l2,train);const b=best(l2,rows);
  const e=evos.map(x=>x+'|'+b);
  await batch(e,train);
  await batch(labels.slice(l2.length),train);
  await batch([...labels,...e],seeds.slice(8));
  console.log('done',rows.length,'locked L2',b,'EVO',best(e,rows));
}
