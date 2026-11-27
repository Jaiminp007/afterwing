// Exploratory extension of the registered ecology. Insert hooks at the actual
// validation point, before L1 can prune the mask. No tracked source is written.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let src = readFileSync(new URL('../../microverse/l3v.mjs', import.meta.url), 'utf8');
function replace(a, b) {
  assert.equal(src.split(a).length, 2, `missing or duplicate insertion: ${a}`);
  src = src.replace(a, b);
}
replace('this.subset = makeSubset(this.rRule, cfg.subsetSize); this.rule = makeSubRule(this.rRule, this.subset, 0); this.redrawCodes();',
  'throw Error("unexpected legacy macro update");');
replace('this.rule = makeSubRule(this.rRule, this.subset, this.rule.mask); this.redrawCodes();',
  'this.contextStep();');
replace('const phi = f.masks.map(m => walsh(m, bits));',
  'f.predCodes = null; this.feedback(f, bits, target); const phi = f.masks.map(m => walsh(m, bits));');
replace('for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - cfg.alphaDecay) * (f.alpha[b] - 1));', 'this.forget(f);');
replace("for (const bit of pairBits(f.masks[i])) { const tb = l2 === 'shamp' ? f.shamPerm[bit] : bit; f.alpha[tb] = Math.min(cfg.alphaMax, f.alpha[tb] + cfg.alphaBoost); }", 'this.credit(f, f.masks[i]);');
replace('const goodPred = this.codes.map(bits => { const p = this.tastePredict(f, bits); return p > cfg.acceptAt ? p - (1 - p) * cfg.toxin : 0; });', 'const goodPred = this.goodValues(f);');
replace('const bits = this.codes[pl.kind], pred = this.tastePredict(f, bits);', 'const bits = this.codes[pl.kind], pred = f.raw[pl.kind];');
replace('export const walsh = (mask, bits) => { let v = 1; for (let b = 0; b < bits.length; b++) if ((mask >>> b) & 1) v *= bits[b]; return v; };',
  'const parity = Int8Array.from({length:4096}, (_,n) => n.toString(2).split("1").length % 2 ? 1 : -1); export const walsh = (mask,bits) => parity[mask & bits.negative];');
replace('this.kindValence = this.codes.map(bits => ruleValence(this.rule, bits));',
  'for (const v of this.codes) v.negative = v.reduce((n,x,i)=>n | (+(x<0)<<i),0); this.kindValence = this.codes.map(bits => ruleValence(this.rule, bits));');
replace('const v = ruleValence(this.rule, bits);', 'bits.negative = 4095 ^ c; const v = ruleValence(this.rule, bits);');
src += '\nexport {makeSubset,makeSubRule};';
const { WorldV, makeSubset, makeSubRule, rng32, mix } = await import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);

const Q = 4, B = 12, UNIT = () => Array(B).fill(1);
const copy = (old, n) => old ? old.map(a => a.slice()) : Array.from({length:n}, UNIT);
export const arms = {
  U: {}, DECK: {}, LEGACY: {}, JOINT: {}, A: {lambda:1}, B: {lambda:0},
  MIX25: {lambda:.25}, MIX50: {lambda:.5}, MIX75: {lambda:.75},
  ADAPT: {}, ORACLE_ROUTE: {},
};
const constL2 = ['LEGACY','JOINT','A','B','MIX25','MIX50','MIX75'];
export { constL2 };
function decay(v, d) { for (let i = 0; i < B; i++) v[i] = 1 + (1-d)*(v[i]-1); }
function bump(v, mask, size, cap) {
  while (mask) { const j = 31 - Math.clz32(mask & -mask); v[j] = Math.min(cap,v[j]+size); mask &= mask-1; }
}
// Predicted product of two taste labels, marginalized over candidate pair
// under the shadow L2's prior. The unknown Walsh sign cancels.
function pairMoment(prior, x) {
  let s = 0, v = 0, sq = 0;
  for (let i=0; i<B; i++) { const w = prior[i]+.02; s+=w; sq+=w*w; v+=(x & (1<<i)) ? -w : w; }
  return (v*v-sq)/(s*s-sq);
}
export class World extends WorldV {
  constructor(seed, arm) {
    assert.ok(Number.isInteger(seed) && seed>=2101 && seed<=2116);
    assert.ok(Object.hasOwn(arms,arm));
    super(seed, arm==='DECK'?'FIXED_DECK':arm==='U'?'FIXED_U':'META',
      {proto:arm, macroEvery:Infinity});
    this.ctxR = rng32(mix(seed ^ 0x435458));
    this.nextEra = 0; this.contextStep();
    this.checks = 0; this.aligned = 0; this.writes = 0; this.schedule = [];
    this.schedule.push([0,this.ca,this.cb,this.axis,this.rule.mask,this.rule.sign,...this.subset]);
  }
  contextStep() {
    const r=this.ctxR;
    if(this.tick===this.nextEra) {
      this.axis = this.nextEra ? 1-this.axis : Math.floor(2*r());
      this.nextEra = this.tick + 300*(14+Math.floor(9*r()));
      this.catalog = Array.from({length:Q},()=>makeSubset(r,4));
    }
    this.ca=Math.floor(Q*r()); this.cb=Math.floor(Q*r());
    this.subset=this.catalog[this.axis ? this.cb : this.ca];
    this.rule=makeSubRule(this.rRule,this.subset,this.rule.mask);
    this.redrawCodes();
    if(this.schedule) this.schedule.push([this.tick,this.ca,this.cb,this.axis,this.rule.mask,this.rule.sign,...this.subset]);
  }
  spawn(p,...args) {
    const f=super.spawn(p,...args), a=this.cfg.proto;
    if(this.arm.l2==='meta' && a!=='LEGACY') f.joint=copy(p?.joint,Q*Q);
    if(a==='ADAPT') {
      f.shadow=copy(p?.shadow,2*Q);
      f.score=p?.score ?? 0; f.prev=null;
    }
    return f;
  }
  proposal(f) { return [f.joint ? f.joint[this.ca*Q+this.cb] : f.alpha,this.cfg.alphaFloor]; }
  feedback(f,bits,y) {
    if(!f.shadow) return;
    const c=this.ca*Q+this.cb, last=f.prev, x=bits.negative;
    if(!last || last.c!==c || last.x===x) { f.prev={c,x,y}; return; }
    f.prev=null;
    // Score before either model receives the current validation. Disjoint bite
    // pairs avoid treating overlapping labels as fresh observations.
    const dx=last.x^x, yy=last.y===y?1:-1;
    const mA=.81*pairMoment(f.shadow[this.ca],dx), mB=.81*pairMoment(f.shadow[Q+this.cb],dx);
    const delta=Math.log1p(yy*mA)-Math.log1p(yy*mB);
    f.score=.985*f.score+delta;
    this.checks++;
  }
  forget(f) {
    const d=this.cfg.alphaDecay;
    decay(this.proposal(f)[0],d);
    if(f.shadow) { decay(f.shadow[this.ca],d); decay(f.shadow[Q+this.cb],d); }
  }
  credit(f,m) {
    const a=this.cfg.proto, b=this.cfg.alphaBoost, cap=this.cfg.alphaMax;
    if(f.shadow) { bump(f.shadow[this.ca],m,b,cap); bump(f.shadow[Q+this.cb],m,b,cap); }
    bump(this.proposal(f)[0],m,b,cap);
    if(!f.joint || a==='JOINT') return;
    const l=a==='ADAPT' ? +(f.score>=0) : a==='ORACLE_ROUTE' ? 1-this.axis : arms[a].lambda;
    assert.ok(l>=0 && l<=1);
    this.writes++; this.aligned+=this.axis ? 1-l : l;
    for(let i=0;i<Q;i++) {
      if(i!==this.cb && l) bump(f.joint[this.ca*Q+i],m,l*b,cap);
      if(i!==this.ca && l!==1) bump(f.joint[i*Q+this.cb],m,(1-l)*b,cap);
    }
  }
  goodValues(f) {
    if(f.predCodes===this.codes) return f.good;
    f.predCodes=this.codes;
    const n=f.masks.length, sq=Math.sqrt(n), ps=[], raw=f.raw??=Array(32), good=f.good??=Array(32);
    for(let k=0;k<32;k++) {
      const x=this.codes[k].negative;
      let key=0;
      for(let i=1;i<n;i++) {const bit=x & f.masks[i]; if(bit && !(bit&(bit-1))) key|=1<<i;}
      let p=ps[key];
      if(p===undefined) {
        let z=Math.log(2);
        for(let i=0;i<n;i++) z+=f.w[i]*((key&(1<<i))?-1:1)/sq;
        p=ps[key]=.05+.9*(f.lossModel!==undefined && f.lossModel>=f.lossBase ? f.base : 1/(1+Math.exp(-z)));
      }
      raw[k]=p; good[k]=p>this.cfg.acceptAt ? p-(1-p)*this.cfg.toxin : 0;
    }
    return good;
  }
  moveFeatures(f, good, dir, occ) {
    const k=this.cell(f.x,f.y);
    if(!this.near || this.nearTick!==Math.floor(this.tick/50)) { this.near=[]; this.nearTick=Math.floor(this.tick/50); }
    const i=k*5+dir;
    let geo=this.near[i];
    if(!geo) {
      const dx=[0,0,1,0,-1][dir], dy=[0,-1,0,1,0][dir], to=this.cell(f.x+dx,f.y+dy);
      geo=this.near[i]={to,p:this.plant[to],pp:[],dd:[]};
      if(dir) for(let d=1;d<=4;d++) for(let s=-d;s<=d;s++) {
        const p=this.plant[this.cell(dx?f.x+dx*d:f.x+s,dy?f.y+dy*d:f.y+s)];
        if(p) { geo.pp.push(p);geo.dd.push(d*d); }
      }
    }
    const {p,pp,dd}=geo, food=p?p.amount/this.cfg.plantCap:0;
    let s=0; for(let j=0;j<pp.length;j++) s+=pp[j].amount*good[pp[j].kind]/dd[j];
    return [1,food,p?food*good[p.kind]:0,Math.tanh(s/4),Math.min(1,(occ.get(geo.to)??0)/3),f.energy/this.cfg.maxEnergy*2-1];
  }
}
