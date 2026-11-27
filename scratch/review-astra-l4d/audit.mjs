import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {WorldL4D} from '../advice-gemini-l4d/l4d_world.mjs';
import {cfg,meta,references} from './arms.mjs';
import {signflip,mean} from '../../docs/paper/stats.mjs';

const ref=name=>references.find(a=>a.name===name);
const worlds=['FIXED','META3','EVO','SHAM'].map(n=>new WorldL4D(3401,ref(n),cfg));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
// Plant amounts are endogenous. Layout/identity and the rule/codebook are not.
function exo(w){return JSON.stringify([w.blk,w.m0,w.mFast,w.c0,w.cFast,w.wTrue,w.Qtrue,w.codes,w.patchCenters,w.plant.map(p=>p?String(p.patch)+':'+p.kind:null)]);}
const trace=crypto.createHash('sha256');let checks=0;
for(let t=0;t<=3500;t++){
  for(const w of worlds)w.step();
  if(t%30===0||t%50===0||t%200===0){
    const hs=worlds.map(w=>hash(exo(w))); assert.equal(new Set(hs).size,1);trace.update(hs[0]);checks++;
  }
}
function cross(w){
  let sum=0,max=0;
  for(const f of w.flies){let e=0;for(let i=0;i<16;i++)for(let j=0;j<16;j++)if((i>>3)!==(j>>3))e+=f.Q[i][j]**2;sum+=e/16;max=Math.max(max,e/16);}
  return {mean:sum/w.flies.length,max};
}
const qCross=Object.fromEntries(worlds.slice(1).map(w=>[w.arm.name,cross(w)]));
const parent=worlds[1].flies.reduce((a,b)=>a.qAge.reduce((s,v)=>s+v,0)>b.qAge.reduce((s,v)=>s+v,0)?a:b);
const child=worlds[1].spawn(parent,0,0,25,parent.gen+1);
assert(parent.qAge.some(x=>x>0));
for(const k of ['Q','qAge','beta','v']){assert.deepEqual(parent[k],child[k]);assert.notEqual(parent[k],child[k]);}
assert.notEqual(parent.Q[0],child.Q[0]);
for(const k of ['u','wRaw','h','uSlow','dTrace'])assert(child[k].every(x=>x===0));

const off=new WorldL4D(3401,ref('META3OFF'),cfg),fix=worlds[0];
const raw=fix.flies[0],rot=off.flies[0], x=new Int8Array(16).fill(1);
raw.u.fill(0);raw.u[0]=11.9;for(let i=0;i<16;i++)rot.u[i]=11.9*rot.Q[i][0];
fix.tasteLearn(raw,x,40);off.tasteLearn(rot,x,40);off.syncWRaw(rot);
const clipWitness={fixed:raw.u[0],oracleRotated:rot.wRaw[0]};assert(Math.abs(clipWitness.fixed-clipWitness.oracleRotated)>.49);

// Construct an independent raw-space reader with no frame optimization at all:
// dw = Q' diag(alpha) Q x delta. Compare after each bite to the coded oracle.
const oracle=new WorldL4D(3401,ref('ORACLE3'),cfg),f=oracle.flies[0],Q=f.Q;
const w=new Float64Array(16),beta=new Float64Array(16).fill(-4),v=new Float64Array(16).fill(.1),h=new Float64Array(16);
let maxReaderError=0;
for(let t=0;t<256;t++){
  const bits=oracle.codes[(7*t)%32],y=Math.sin(t*.02)+1.2*bits[3]-.9*bits[7];
  const z=Q.map(row=>row.reduce((s,c,j)=>s+c*bits[j],0));
  const delta=Math.max(-12,Math.min(12,y-w.reduce((s,c,j)=>s+c*bits[j],0)));
  const a=z.map((zi,i)=>{
    const gh=delta*zi*h[i],ag=Math.abs(gh);
    v[i]=Math.max(ag,v[i]+.02*Math.exp(beta[i])*(ag-v[i]));
    if(v[i]>1e-12)beta[i]=Math.max(-6.5,Math.min(-.3,beta[i]+.18*gh/v[i]));
    return Math.exp(beta[i]);
  });
  const scale=Math.min(1,.9/a.reduce((s,ai,i)=>s+ai*z[i]*z[i],0));
  for(let i=0;i<16;i++){
    const step=a[i]*scale,du=step*delta*z[i];h[i]=h[i]*Math.max(0,1-step*z[i]*z[i])+du;
    for(let j=0;j<16;j++)w[j]+=Q[i][j]*du;
  }
  oracle.tasteLearn(f,bits,y);oracle.syncWRaw(f);
  maxReaderError=Math.max(maxReaderError,...Array.from(w,(c,j)=>Math.abs(c-f.wRaw[j])));
}
assert(maxReaderError<1e-11);

const original=JSON.parse(fs.readFileSync(new URL('../advice-gemini-l4d/l4d_results.json',import.meta.url)));
const {FIXED_LOCK:F,META3_LOCK:M,DIRECT_LOCK:C,META3OFF:O}=original.stage2;
const d=F.map((r,i)=>(2*M[i].popSum+r.popSum-3*C[i].popSum)/200);
const out={seed:3401,fullRunsInProbe:0,arms:worlds.map(w=>w.arm.name),ticks:3501,checks,exogenousDigest:trace.digest('hex'),qCross,childCopyFixture:true,clipWitness,maxReaderError,oracleFixtureBites:256,
  archiveOnly:{n:d.length,meanD4:mean(d),exactP:signflip(d,200),skillMismatches:F.filter((r,i)=>r.skill!==O[i].skill).length,maxSkillDiff:Math.max(...F.map((r,i)=>Math.abs(r.skill-O[i].skill))),popMismatches:F.filter((r,i)=>r.popSum!==O[i].popSum).length}};
console.log(JSON.stringify(out,null,2));
