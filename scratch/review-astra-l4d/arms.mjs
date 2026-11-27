import fs from 'node:fs';
import assert from 'node:assert/strict';
import {runOne} from '../advice-gemini-l4d/l4d_world.mjs';

export const cfg = {nBlocks:2, blockSize:8, nFast:1, toxin:.78, blockEvery:3400, modeEvery:1000, driftEvery:200, slowDriftEvery:1000, ticks:20000, every:100, lateFrom:10000};
export const meta = {name:'META3', kind:'l2', l2:'autostep', mu:.18, usesQ:true, inheritL2:true, inheritQ:true, l3:'learn', l3Rule:'du_both', eta3:.12, s2Min:1.5, qHalf:5};
export const references = [
  {name:'FIXED', kind:'fixed', alpha:.05}, meta,
  {name:'META3OFF', kind:'meta3off', alpha:.05, usesQ:true, l3:'oracle'},
  {name:'DIR_Q_DIAG', kind:'direct_q_diag', mu:.25, qGain:.5, usesQ:true, rawPred:true, l3:'oracle', inheritL2:true},
  {name:'ORACLE3', kind:'l2', l2:'autostep', mu:.18, usesQ:true, inheritL2:true, l3:'oracle'},
  {name:'AUTO', kind:'l2', l2:'autostep', mu:.18, inheritL2:true},
  {...meta,name:'SHAM',l3:'sham'}, {...meta,name:'RESET',l3:'reset',inheritQ:false},
  {...meta,name:'EVO',l3:'evor',pm:.25,nRot:4,angScale:.4},
];
export const grids = {
  ICA_I:[.06,.16].map(rate=>({...meta, name:`ICA_I_${rate}`, custom:'ica', eta3:rate})),
  ICA_R:[.06,.16].map(rate=>({...meta, name:`ICA_R_${rate}`, custom:'ica', eta3:rate, inheritQ:false})),
  FULL:[['K',.01],['K',.05],['R',.95]].map(([type,value])=>({name:`FULL_${type}_${value}`, custom:'full', type,value})),
  BLOCK:[.015,.06,.14].map(h=>({name:`BLOCK_${h}`, custom:'block', h})),
  SPHERE:[8,16].map(window=>({name:`SPHERE_${window}`, custom:'sphere', window})),
};

// Reuse the published ecology and scorer, installing review-only learner hooks.
let src=fs.readFileSync(new URL('../advice-gemini-l4d/l4d_world.mjs',import.meta.url),'utf8').replaceAll('\r\n','\n');
function replaceOnce(a,b){assert.equal(src.split(a).length,2,a); src=src.replace(a,()=>b);}
replaceOnce('this.flies.push(f);', 'globalThis.__l4review.spawn(this.arm,f); this.flies.push(f);');
replaceOnce('const arm = this.arm, D = this.D, cfg = this.cfg;\n    if (arm.kind', 'if (globalThis.__l4review.learn(this.arm,f,bits,y)) return;\n    const arm = this.arm, D = this.D, cfg = this.cfg;\n    if (arm.kind');
// The flat frame learner maximizes kurtosis of its slow and high-pass taste
// weights within known blocks. No alpha, beta, h, switch time, or Q* in its rotation.
replaceOnce('&& aSpread > 1e-5','&& (arm.custom === "ica" || aSpread > 1e-5)');
replaceOnce('if (Math.abs(da) < 1e-5) continue;', 'if (arm.custom === "ica" ? (j >> 3) !== (k >> 3) : Math.abs(da) < 1e-5) continue;');
replaceOnce('Math.abs(da) * invSpread * sj', '(arm.custom === "ica" ? 1 : Math.abs(da) * invSpread) * sj');
const modified=await import('data:text/javascript;base64,'+Buffer.from(src.replaceAll('\r\n','\n')).toString('base64'));
const energy=12.5, B=8;
function sub(n){const P=new Float64Array(n*n); for(let i=0;i<n;i++)P[i*n+i]=energy/n;return {w:new Float64Array(n),P,px:new Float64Array(n)};}
function spawn(arm,f) {
  if(arm.custom==='full') f.review=[sub(16)];
  if(arm.custom==='block') {f.review=[sub(8),sub(8)]; f.odds=0;}
  if(arm.custom==='sphere') {f.review=[]; f.rr=0x5a1b4f09;}
}
// Both Kalman variants update an ordinary raw-space linear taste predictor.
// BLOCK moment-matches the posteriors of "same coefficient" and "new
// coefficient" within each block, and compares the blocks by predictive density.
function filters(arm,f,x,y) {
  const block=arm.custom==='block', n=block?8:16, lp=[];
  for(let b=0;b<f.review.length;b++) {
    const {w,P,px}=f.review[b], off=b*n;
    let pred=0, s=1;
    for(let i=0;i<n;i++) {
      const index=i*n;
      if(block) P[index+i]+=.002;
      else if(arm.type==='K') P[index+i]+=arm.value;
      let v=0; for(let j=0;j<n;j++) v+=P[index+j]*x[off+j];
      px[i]=v; s+=v*x[off+i]; pred+=w[i]*x[off+i];
    }
    const e=y-pred, loglike=-.5*(Math.log(s)+e*e/s);
    const s0=1+energy, p0=energy/n;
    let reset=0;
    if(block){
      const a=Math.log1p(-arm.h)+loglike, c=Math.log(arm.h)-.5*(Math.log(s0)+y*y/s0);
      const d=Math.max(a,c); lp[b]=d+Math.log(Math.exp(a-d)+Math.exp(c-d));
      reset=Math.exp(c-lp[b]);
    }
    const decay=(!block&&arm.type==='R')?1/arm.value:1;
    for(let i=0;i<n;i++) {
      const newI=w[i]+px[i]*e/s, freshI=p0*x[off+i]*y/s0, di=newI-freshI;
      for(let j=i;j<n;j++) {
        const freshJ=p0*x[off+j]*y/s0, dj=w[j]+px[j]*e/s-freshJ;
        let v=(P[i*n+j]-px[i]*px[j]/s)*(1-reset);
        if(block) v+=reset*((i===j?p0:0)-p0*p0*x[off+i]*x[off+j]/s0+(1-reset)*di*dj);
        P[i*n+j]=P[j*n+i]=decay*v;
      }
      w[i]=(1-reset)*newI+reset*freshI;
    }
  }
  if(block){
    const p=.001+.998/(1+Math.exp(-f.odds));
    f.odds=Math.log(p/(1-p))+lp[0]-lp[1];
    const w0=1/(1+Math.exp(-f.odds));
    for(let i=0;i<B;i++){f.u[i]=w0*f.review[0].w[i];f.u[B+i]=(1-w0)*f.review[1].w[i];}
  }else f.u.set(f.review[0].w);
}

// Finite-history approximate Bayes. At most one 200-tick boundary falls
// within the truncated window. Marginalizing Haar frames, current w has fixed
// norm. Conditional on a crossing, old w is in the opposite block, or has
// cosine 0, -1/2, or -1 with current w. No use of absolute tick or true frame.
function sphere(arm,f,x,y) {
  const h=f.review; h.push({x,y,t:f.age});
  while(h.length>arm.window || f.age-h[0].t>=200)h.shift();
  function r(){let v=f.rr;v^=v<<13;v^=v>>>17;v^=v<<5;f.rr=v>>>0;return (f.rr+.5)/4294967296;}
  function normal(){return Math.sqrt(-2*Math.log(r()))*Math.cos(2*Math.PI*r());}
  function unit(v){let s=0;for(const a of v)s+=a*a; s=1/Math.sqrt(s);for(let i=0;i<B;i++)v[i]*=s;return v;}
  function randomUnit(){return unit(Float64Array.from({length:B},normal));}
  let a=randomUnit(), b=randomUnit(), other=randomUnit(), dot=0;
  for(let i=0;i<B;i++)dot+=a[i]*b[i];for(let i=0;i<B;i++)b[i]-=dot*a[i];unit(b);
  let blk=+(r()<.5), lag=Math.floor(r()*200), mode=0;
  function drawMode(){
    const z=r()*85; if(z<5)return 1; // block redraws
    if(z>=21)return 0; // ordinary fast flips
    const k=r()*14;return k<1?2:k<2?0:3; // mode redraw + slow sign flip
  }
  mode=drawMode();
  function ll(){
    let loss=0;const base=blk*B,alt=B-base,R=Math.sqrt(energy);
    for(const o of h){
      let g=0; const old=f.age-o.t>lag;
      if(!old || mode===2) {for(let i=0;i<B;i++)g+=a[i]*o.x[base+i]; if(old)g=-g;}
      else if(mode===1){for(let i=0;i<B;i++)g+=other[i]*o.x[alt+i];}
      else if(mode===0){for(let i=0;i<B;i++)g+=b[i]*o.x[base+i];}
      else {for(let i=0;i<B;i++)g+=(-.5*a[i]+Math.sqrt(.75)*b[i])*o.x[base+i];}
      loss+=(o.y-R*g)**2;
    }
    return -.5*loss;
  }
  let like=ll(), samples=0;f.u.fill(0);
  for(let k=0;k<64;k++){
    const oldBlk=blk, oldLag=lag, oldMode=mode; const t=r(); let i=0,j=0,A,Bb,C,D,E,F;
    if(t<.10)blk=1-blk;
    else if(t<.20){lag=Math.floor(r()*200);mode=drawMode();}
    else {
      i=Math.floor(8*r());j=(i+1+Math.floor(7*r()))%8;
      const angle=(r()*2-1)*(k%4===0?Math.PI:.75),c=Math.cos(angle),s=Math.sin(angle);
      A=a[i];Bb=a[j];C=b[i];D=b[j];E=other[i];F=other[j];
      a[i]=c*A+s*Bb;a[j]=c*Bb-s*A;b[i]=c*C+s*D;b[j]=c*D-s*C;
      // Rotate the independent old-block vector oppositely, keeping its prior.
      other[i]=c*E-s*F;other[j]=c*F+s*E;
    }
    const next=ll();
    if(Math.log(r())<next-like)like=next;
    else {blk=oldBlk;lag=oldLag;mode=oldMode;
      if(t>=.20){a[i]=A;a[j]=Bb;b[i]=C;b[j]=D;other[i]=E;other[j]=F;}}
    if(k>=32 && k%4===3){samples++;for(let i=0;i<8;i++)f.u[blk*8+i]+=Math.sqrt(energy)*a[i];}
  }
  for(let i=0;i<16;i++)f.u[i]/=samples;
}
globalThis.__l4review={spawn,learn(arm,f,x,y){
  if(!arm.custom||arm.custom==='ica')return false;
  if(arm.custom==='sphere')sphere(arm,f,x,y);else filters(arm,f,x,y);
  f.wDirty=true;return true;
}};
export function simulate(seed,arm){return (arm.custom?modified.runOne:runOne)(seed,arm,cfg);}
