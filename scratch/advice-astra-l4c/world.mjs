import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ALL_PAIRS as P, WorldCreditV2, mix, rng32 } from './base.mjs';
import { World as Cached } from '../advice-astra-l4/world.mjs';

export const H = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const scalar = [[.006,4,30],[.015,4,60],[.03,12,60],[.06,20,60],[.12,40,60],[.2,40,60]];
export const strengths = [4,20,60];
const id = new Map(P.map((p,i)=>[p.mask,i]));
const bits = Array.from({length:12},(_,i)=>i);
const zero = n => Array(n).fill(0);
const copy = (v,n) => v ? [...v] : zero(n);
const overlap = (a,b) => a === b ? 2 : +(!!(a & b));
const rate = (s,i) => (s[2*i]+.1)/(s[2*i+1]+1);
const advantage = s => rate(s,1)-rate(s,0);
function credit(f,r) {
  for(let k=0;k<4;k++) f.yields[k]*=.85;
  f.yields[2*r.r]+=r.y; f.yields[2*r.r+1]++;
}
// Same total additive credit before clipping. Suppress the other group toward
// the scalar neutral point. Compute both counterfactuals from the SAME input.
export function write(alpha,m,p,gain,cap) {
  for(let k=0;k<12;k++) {
    const a=alpha[k], inside=!!(m & (1<<k)), lo=1+.25*(a-1);
    const r=inside?Math.min(cap,a+gain):lo;
    const s=inside?lo:Math.min(cap,a+gain/5);
    alpha[k]=p*r+(1-p)*s;
  }
}

export class Garden extends WorldCreditV2 {
  constructor(seed,garden,policy) {
    assert.ok(Number.isInteger(seed)&&seed>=2701&&seed<=2732);
    const season=(mix(seed ^ 0x53454153)&1)^garden;
    super(seed,{l1:true,usesL2:true,kind:'scalar'},{
      garden,season,policy,eraEvery:Infinity,macroEvery:1000,subEvery:200
    });
    this.records=[]; this.assay=false;
    this.reads=0;this.aligned=0;this.infReads=0;this.decisions=0;this.rm=0;
    this.schedule=[[this.rule.mask,this.rule.sign]];
  }
  initMacro() {
    const a=[...bits],r=this.rRule;
    for(let k=0;k<4;k++){const j=k+Math.floor(r()*(12-k));[a[k],a[j]]=[a[j],a[k]];}
    this.pool=P.filter(p=>a.slice(0,4).includes(p.a)&&a.slice(0,4).includes(p.b));
    this.lastTarget=0;
  }
  nextSubRule() {
    const opts=this.lastTarget?this.pool.filter(p=>overlap(p.mask,this.lastTarget)===this.cfg.season):this.pool;
    const mask=opts[Math.floor(this.rRule()*opts.length)].mask;
    this.lastTarget=mask;
    return {mask,sign:this.rRule()<.5?-1:1};
  }
  spawn(parent,...args) {
    const f=super.spawn(parent,...args), spec=this.cfg.policy;
    const reset=this.assay&&spec.kind==='RESET';
    f.yields=copy(parent&&!reset&&parent.yields,4);
    f.unread=parent&&!reset?[...parent.unread]:[];
    f.own=null; f.hold=-1;
    f.last=parent?.last??0;f.g=copy(parent?.g,66);
    f.hist=copy(parent?.hist,3); f.transitions=parent?new Map(parent.transitions):new Map();
    f.pr=rng32(mix(this.seed^Math.imul(f.id,2654435761)^0x50524f42^this.cfg.garden));
    f.mut=rng32(mix(this.seed^Math.imul(f.id,2654435761)^0x45564f52^this.cfg.garden));
    f.gene=parent?parent.gene:(f.id-1)%2;
    if(this.assay&&parent&&spec.evo?.startsWith('V')&&f.mut()<Number(spec.evo.slice(1))/100) f.gene=1-f.gene;
    return f;
  }
  flush(f) {
    if(f.unread.length) f.unread=f.unread.filter(r=>{
      if(r.end>=this.tick)return true;
      credit(f,r);return false;
    });
  }
  open(f,m) {
    const rec={id:f.id,start:this.tick,end:this.tick+120,m,r:+(f.pr()<.5),y:0};
    this.records.push(rec);f.unread.push(rec);f.own=rec;f.hold=rec.end;
    write(f.alpha,m,rec.r,20,60);
  }
  enterAssay() {
    for(const f of this.flies){this.flush(f);assert.equal(f.unread.length,0);}
    assert.ok(this.records.every(r=>r.end<=this.tick));
    this.fork=H([this.flies.map(f=>[f.id,f.x,f.y,f.age,f.energy,f.alpha,f.yields,f.g,f.hist,
      [...f.transitions],f.last,f.masks,f.maskVal,f.w,f.buf,f.moveW]),this.plant,this.rule,this.nextId]);
    const k=this.cfg.policy.kind;
    this.assay=true;this.arm.l1=k!=='NOREV';
    if(k==='FIXED'||k==='OFF')this.arm.kind='deck';
    const evo=this.cfg.policy.evo;
    if(evo?.startsWith('V'))for(const f of this.flies) f.gene=(f.id-1)%2;
  }
  choose(f,spec) {
    const k=spec.kind;
    if(k==='ORACLE')return this.cfg.season;
    if(k==='K')return spec.r;
    if(k==='SHAM')return .5;
    const d=advantage(f.yields);
    return d>0?1:d<0?0:.5;
  }
  l2Update(f) {
    const spec=this.cfg.policy, k=this.assay?spec.kind:'CAL';
    if(this.assay&&k==='FIXED')return;
    this.flush(f);
    const active=[],fresh=[];
    for(let i=1;i<f.masks.length;i++) if(f.maskAge[i]>=10&&Math.abs(f.w[i])>=2.5) {
      const m=f.masks[i];active.push(m);
      if(!f.maskVal[i]){
        f.maskVal[i]=true;fresh.push(m);
        const rec=f.own;
        if(rec&&this.tick<=rec.end&&f.maskSrc[i]>rec.start&&f.maskSrc[i]<=rec.end)rec.y++;
      }
    }
    const [decay,boost,cap]=this.assay?scalar[spec.scalar??3]:scalar[3];
    if(this.tick>f.hold){
      for(let i=0;i<12;i++)f.alpha[i]=1+(1-decay)*(f.alpha[i]-1);
      for(const m of active) {
        const {a,b}=P[id.get(m)];f.alpha[a]=Math.min(cap,f.alpha[a]+boost);f.alpha[b]=Math.min(cap,f.alpha[b]+boost);
      }
    }
    for(const m of fresh){
      for(let j=0;j<66;j++)f.g[j]*=.87;
      f.g[id.get(m)]++;
      if(f.last){
        for(let j=0;j<3;j++)f.hist[j]*=.75;
        f.hist[overlap(f.last,m)]++;
        for(const [key,v] of f.transitions) {if(v<.012)f.transitions.delete(key);else f.transitions.set(key,v*.82);}
        const key=66*id.get(f.last)+id.get(m);
        f.transitions.set(key,(f.transitions.get(key)??0)+1);
      }
      f.last=m;
      if(this.tick<=f.hold)continue;
      if(!this.assay){
        if(this.tick<4880&&f.pr()<1/3)this.open(f,m);
      } else {
        if(['ORACLE','K','META3','SHAM','RESET','OFF'].includes(k)) {
          const p=this.choose(f,spec);
          write(f.alpha,m,p,spec.gain??20,cap);
          this.reads++;this.aligned+=this.cfg.season?p:1-p;
          if(f.yields[1]>0&&f.yields[3]>0)this.infReads++;
        }
        if(spec.evo&&spec.evo!=='E0')write(f.alpha,m,spec.evo==='R'?1:spec.evo==='S'?0:f.gene,spec.evoGain,cap);
      }
    }
  }
  drawCandidate(f,ex) {
    const s=this.cfg.policy,k=s.kind,src=this.tick;
    if(!this.assay||!['PAIR','TRANS','DIRECT'].includes(k)){
      const {mask}=super.drawCandidate(f,ex);return {mask,src};
    }
    const ws=[],ms=[];
    const delta=advantage(f.yields);
    const direction=Math.sign(delta), confidence=s.soft?Math.tanh(6*Math.abs(delta)):1;
    const prev=f.last?id.get(f.last):-1;
    const nh=f.hist.reduce((a,b)=>a+b,0), bins=[45,20,1];
    let sum=0;
    for(let j=0;j<66;j++){
      const p=P[j];if(ex.has(p.mask))continue;
      let w=(.02+f.alpha[p.a])*(.02+f.alpha[p.b]);
      if(k==='PAIR')w*=1+s.gain*f.g[j];
      if(k==='TRANS'&&prev>=0){
        const o=overlap(p.mask,f.last),trans=f.transitions.get(66*prev+j)??0;
        w*=1+s.gain*(f.hist[o]/(nh+1)*66/bins[o]+trans);
      }
      if(k==='DIRECT'&&prev>=0&&direction){
        const o=overlap(p.mask,f.last);
        if(o===(direction>0?1:0))w*=1+s.gain*confidence;
      }
      sum+=w;ws.push(w);ms.push(p.mask);
    }
    if(k==='DIRECT'&&prev>=0&&direction){this.decisions++;this.rm+=+(direction>0);}
    let u=f.rProp()*sum;
    for(let j=0;j<ms.length;j++)if((u-=ws[j])<=0)return {mask:ms[j],src};
    return {mask:ms.at(-1)??-1,src};
  }
}
Garden.prototype.moveFeatures=Cached.prototype.moveFeatures;

export function run(seed,arm,spec) {
  const out={seed,arm,popSum:0,n:0,gardens:[]},raw=[];
  for(let i=0;i<2;i++){
    const w=new Garden(seed,i,spec);
    let popSum=0;
    while(w.tick<10000){
      if(w.tick===5000)w.enterAssay();
      w.step();
      if(w.tick%200===1)w.schedule.push([w.rule.mask,w.rule.sign]);
      if(w.tick>5000&&w.tick%100===0){popSum+=w.flies.length;out.n++;}
    }
    const a=w.records;
    const recs=a.map(r=>[r.id,r.start,r.m,r.r,r.y]);
    raw.push(recs);
    out.gardens.push({season:w.cfg.season,fork:w.fork,schedule:H(w.schedule),trials:H(recs),
      byAction:[0,1].map(i=>{const x=a.filter(r=>r.r===i);return [x.length,x.reduce((s,r)=>s+r.y,0)];}),
      reads:w.reads,aligned:w.aligned,informed:w.infReads,direct:w.decisions,directR:w.rm,
      popSum,extinct:!w.flies.length});
    out.popSum+=popSum;
  }
  assert.equal(out.n,100);
  return {out,raw:arm==='FIXED'?raw:null};
}
