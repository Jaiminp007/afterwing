import { World } from './world.mjs';
import { rng32, mix } from '../../microverse/l3v.mjs';

const rates={D0005:.0005,LEGACY:.006,D03:.03,D12:.12,D48:.48};
export const volArms=['U','DECK',...Object.keys(rates),'ADAPT','ORACLE_ROUTE','CHANGE','COIN','EVO0','EVO10','EVO50'];
export const volConstants=Object.keys(rates);
const seedAlpha=()=>Array(12).fill(1);
function forget(a,d) { for(let i=0;i<12;i++) a[i]=1+(1-d)*(a[i]-1); }
function add(a,m) { for(let i=0;i<12;i++) if(m & (1<<i)) a[i]=Math.min(30,a[i]+4); }
function moment(a,x) {
  let s=0,v=0,q=0;
  for(let i=0;i<12;i++) { const w=a[i]+.02; s+=w; q+=w*w; v+=(x&(1<<i))?-w:w; }
  return (v*v-q)/(s*s-q);
}
export class Vol extends World {
  constructor(seed,arm) {
    if(!volArms.includes(arm)) throw Error(arm);
    super(seed,['U','DECK'].includes(arm)?arm:'LEGACY'); this.mode=arm;
  }
  contextStep() {
    const r=this.ctxR; this.ca=this.cb=0;
    if(this.tick===this.nextEra) {
      this.axis=this.tick?1-this.axis:Math.floor(2*r());
      this.nextEra=this.tick+300*(9+Math.floor(12*r()));
    }
    if(!this.tick || r()<(this.axis?.80:.055)) {
      const bits=Array.from({length:12},(_,i)=>i);
      for(let i=11;i>0;i--) {const j=Math.floor((i+1)*r()); [bits[i],bits[j]]=[bits[j],bits[i]];}
      this.subset=bits.slice(0,4); this.redrawCount=(this.redrawCount??0)+1;
    }
    const pairs=[];
    for(let i=0;i<4;i++) for(let j=0;j<i;j++) {
      const p=(1<<this.subset[i])|(1<<this.subset[j]); if(p!==this.rule.mask) pairs.push(p);
    }
    const mask=pairs[Math.floor(this.rRule()*pairs.length)];
    this.rule={mask,sign:this.rRule()<.5?-1:1,subset:this.subset,target:[mask]};
    this.redrawCodes();
    if(this.schedule) this.schedule.push([this.tick,this.ca,this.cb,this.axis,this.rule.mask,this.rule.sign,...this.subset]);
  }
  spawn(p,...args) {
    const f=super.spawn(p,...args);
    f.slow=p?p.slow.slice():seedAlpha(); f.fast=p?p.fast.slice():seedAlpha();
    f.score=p?.score??0; f.prev=null; f.lastReset=p?.lastReset??0;
    f.ind=rng32(mix(this.seed^Math.imul(f.id,2654435761)^0x4c345233));
    f.genotype=p?.genotype??Math.floor(f.ind()*5);
    if(p && this.mode?.startsWith('EVO') && f.ind()<+this.mode.slice(3)/100) f.genotype=Math.floor(f.ind()*5);
    return f;
  }
  feedback(f,bits,y) {
    if(this.mode!=='ADAPT') return;
    const x=bits.negative,last=f.prev;
    if(!last || last.x===x) { f.prev={x,y}; return; }
    f.prev=null;
    const xx=x^last.x, yy=y===last.y?1:-1;
    f.score=.985*f.score+Math.log1p(yy*.81*moment(f.slow,xx))-Math.log1p(yy*.81*moment(f.fast,xx));
    this.checks++;
  }
  forget(f) {
    const m=this.mode;
    let d=rates[m];
    if(m==='ADAPT' || m==='COIN' || m==='ORACLE_ROUTE') {
      const fast=m==='ADAPT'?f.score<0:m==='COIN'?f.ind()<.5:!!this.axis;
      d=fast?.48:.0005;
      this.writes++; this.aligned+=+(fast===!!this.axis);
    } else if(m==='CHANGE') {
      d=f.lastReset!==this.redrawCount?1:.0005; f.lastReset=this.redrawCount;
    } else if(m.startsWith('EVO')) d=Object.values(rates)[f.genotype];
    if(!Number.isFinite(d)) throw Error(m);
    forget(f.alpha,d); if(m==='ADAPT') { forget(f.slow,.0005); forget(f.fast,.48); }
  }
  credit(f,m) {
    add(f.alpha,m);
    if(this.mode==='ADAPT') { add(f.slow,m); add(f.fast,m); }
  }
}
