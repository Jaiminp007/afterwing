import { World } from './world.mjs';
import { rng32,mix } from '../../microverse/l3v.mjs';
import { Worker,isMainThread,parentPort } from 'node:worker_threads';
import { readFileSync,appendFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// Five one-factor matchings of six receptors. Each possible partner occurs
// exactly once. A successful cross-guild mask alone does not identify its map.
const partner=Array.from({length:5},(_,k)=>{
  const a=[];a[5]=k;a[k]=5;
  for(let d=1;d<=2;d++) {let i=(k+d)%5,j=(k+5-d)%5; a[i]=j;a[j]=i;}
  return a;
});
const masks=Array.from({length:36},(_,q)=>(1<<Math.floor(q/6))|(1<<(6+q%6)));
const levels=['LEGACY','LAST','DILUTE','M0','M1','M2','M3','M4','ALL'];
const labels=['U','DECK',...levels,'ADAPT','ORACLE','COIN','EVO0','EVO10','EVO50'];
const axes=m=>[31-Math.clz32(m&63),25-Math.clz32(m&4032)];
const bits=(mask,func)=>{ for(let i=0;i<12;i++) if(mask&(1<<i)) func(i); };
class Kernel extends World {
  constructor(seed,a) {
    super(seed,a==='DECK'?'DECK':a==='U'?'U':'LEGACY'); this.mode=a;
  }
  contextStep() {
    const r=this.ctxR; this.ca=this.cb=0;
    if(this.tick===this.nextEra) {
      this.axis=this.tick ? (this.axis+1+Math.floor(4*r()))%5 : Math.floor(5*r());
      this.nextEra=this.tick+1500*(3+Math.floor(3*r()));
    }
    if(this.tick%1500===0) {
      const a=Math.floor(6*r()), b=Math.floor(6*r());
      this.subset=[a,partner[this.axis][a],6+b,6+partner[this.axis][b]];
    }
    const allowed=[];
    for(let i=0;i<2;i++) for(let j=2;j<4;j++) {
      const m=(1<<this.subset[i])|(1<<this.subset[j]); if(m!==this.rule.mask) allowed.push(m);
    }
    const m=allowed[Math.floor(this.rRule()*allowed.length)];
    this.rule={mask:m,sign:this.rRule()<.5?-1:1,subset:this.subset,target:[m]};
    this.redrawCodes(); if(this.schedule)this.schedule.push([this.tick,0,0,this.axis,m,this.rule.sign,...this.subset]);
  }
  spawn(p,...args) {
    const f=super.spawn(p,...args);
    f.scores=p?p.scores.slice():Array(5).fill(0);
    f.last=p?.last??0; f.unpaired=null;
    f.ind=rng32(mix(this.seed^Math.imul(f.id,2654435761)^0x4c345233));
    f.gene=p?.gene??Math.floor(5*f.ind());
    if(p && this.mode?.startsWith('EVO') && f.ind()<+this.mode.slice(3)/100) f.gene=Math.floor(5*f.ind());
    return f;
  }
  drawCandidate(f,ex) {
    if(this.mode==='DECK') {
      for(let t=0;t<73;t++) {
        if(f.deckPos>=f.deck.length) {
          f.deck=masks.slice(); for(let i=35;i>0;i--) {const j=Math.floor((i+1)*f.rProp());[f.deck[i],f.deck[j]]=[f.deck[j],f.deck[i]];}
          f.deckPos=0;
        }
        const m=f.deck[f.deckPos++]; if(!ex.has(m))return m;
      }
      return -1;
    }
    let total=0;
    const a=f.alpha, w=q=>(a[Math.floor(q/6)]+.02)*(a[6+q%6]+.02);
    for(let q=0;q<36;q++) if(!ex.has(masks[q]))total+=w(q);
    if(!total)return -1;
    let v=f.rProp()*total,last=-1;
    for(let q=0;q<36;q++)if(!ex.has(masks[q])) {last=masks[q];v-=w(q);if(v<=0)return last;}
    return last;
  }
  feedback(f,bits,y) {
    if(this.mode!=='ADAPT'||!f.last)return;
    const x=bits.negative, last=f.unpaired;
    if(!last||last.x===x || last.anchor!==f.last) { f.unpaired={x,y,anchor:f.last}; return; }
    f.unpaired=null;
    const dx=x^last.x, yy=last.y===y?1:-1, [i,j]=axes(f.last);
    const sign=b=>(dx & (1<<b))?-1:1;
    for(let k=0;k<5;k++) {
      const moment=(sign(i)+sign(partner[k][i]))*(sign(6+j)+sign(6+partner[k][j]))/4;
      f.scores[k]=.994*f.scores[k]+Math.log1p(.60*yy*moment);
    }
    this.checks++;
  }
  forget(f) { for(let i=0;i<12;i++)f.alpha[i]=1+.994*(f.alpha[i]-1); }
  credit(f,m) {
    const a=f.alpha, mode=this.mode;
    if(mode==='LEGACY') {bits(m,i=>{a[i]=Math.min(30,a[i]+4);});return;}
    const [i,j]=axes(m);
    let k=-1;
    if(mode==='ADAPT')k=f.scores.indexOf(Math.max(...f.scores));
    else if(mode==='ORACLE')k=this.axis;
    else if(mode==='COIN')k=Math.floor(5*f.ind());
    else if(mode.startsWith('EVO'))k=f.gene;
    else if(/^M[0-4]$/.test(mode))k=+mode[1];
    a.fill(1); a[i]=a[j+6]=mode==='DILUTE'?5:25;
    if(k>=0) {
      a[partner[k][i]]=a[6+partner[k][j]]=25;
      this.writes++;this.aligned+=+(k===this.axis);
    } else if(mode==='ALL') {
      for(let k=0;k<5;k++) {a[partner[k][i]]+=24/5;a[6+partner[k][j]]+=24/5;}
    }
    f.last=m;
  }
}
const sha=x=>createHash('sha256').update(x).digest('hex');
const digest=sha(Buffer.concat(['../../microverse/l3v.mjs','./world.mjs','./kernel.mjs'].map(x=>readFileSync(new URL(x,import.meta.url)))));
const file=new URL('./kernel.ndjson',import.meta.url);
if(!isMainThread) {
  parentPort.on('message',({seed,arm})=>{
    const w=new Kernel(seed,arm),t=Date.now(); let sum=0,n=0,skill=0,share=0,hi=0;
    for(let i=0;i<20000;i++) { w.step(); if(w.tick>10000 && w.tick%100===0) {
      sum+=w.flies.length;n++;hi=Math.max(hi,w.flies.length);skill+=w.skill();share+=w.alphaShareOnS();
    } }
    assert.equal(n,100); assert.ok(Number.isInteger(sum)&&Number.isFinite(skill+share));
    parentPort.postMessage({design:'kernel',seed,arm,sum,n,hi,skill:skill/n,share:share/n,extinct:!w.flies.length,
      ms:Date.now()-t,sourceHash:digest,schedule:sha(JSON.stringify(w.schedule)),writes:w.writes,checks:w.checks,
      aligned:w.writes?w.aligned/w.writes:null,tel:w.tel});
  });
} else {
  const ps=+(process.argv[2]??5);
  const rows=existsSync(file)?readFileSync(file,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
  assert.ok(rows.every(r=>r.sourceHash===digest));const key=x=>x.seed+':'+x.arm,done=new Set(rows.map(key)),jobs=[];
  assert.equal(done.size,rows.length);
  for(let seed=2101;seed<=2116;seed++)for(const arm of labels) if(!done.has(key({seed,arm})))jobs.push({seed,arm});
  let n=0,j=0; console.log(`running ${jobs.length} kernel cells; ${ps} workers; ${digest.slice(0,10)}`);
  await Promise.all(Array.from({length:Math.min(ps,jobs.length)},()=>new Promise((res,rej)=>{
    const w=new Worker(new URL(import.meta.url));let job;
    const go=()=>{if(j===jobs.length)return w.terminate().then(res,rej);job=jobs[j++];w.postMessage(job);};
    w.on('error',rej);w.on('message',r=>{assert.equal(key(r),key(job));assert.ok(!done.has(key(r)));done.add(key(r));appendFileSync(file,JSON.stringify(r)+'\n');
      if(++n%25===0||n===jobs.length)console.log(`${n}/${jobs.length}`);go();});go();
  })));
}
