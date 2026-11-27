import fs from 'node:fs';
import assert from 'node:assert/strict';
import {mean,bootCI} from '../../docs/paper/stats.mjs';
const url=n=>new URL(n,import.meta.url);
const read=n=>JSON.parse(fs.readFileSync(url(n)));
const scan=n=>fs.readFileSync(url(n),'utf8').trim().split('\n').map(s=>JSON.parse(s));
const lock=read('lock.json'),held=read('held-started.json'),tune=read('tune-started.json');
assert(new Date(held.start)>=new Date(lock.lockedAt));assert.deepEqual(held.hashes,tune.hashes);assert.deepEqual(held.hashes,lock.hashes);
function cells(manifest,name){
  const rows=scan(name), pairs=new Set(rows.map(r=>r.armName+':'+r.seed));
  assert.equal(pairs.size,rows.length);assert.equal(rows.length,manifest.seeds.length*manifest.arms.length);
  return Object.fromEntries(manifest.arms.map(a=>[a.name,manifest.seeds.map(s=>{
    const r=rows.find(r=>r.seed===s&&r.armName===a.name);assert(r&&Number.isInteger(r.popSum)&&r.popSum/100===r.pop&&Number.isFinite(r.skill)&&r.bites>0&&r.births>0);return r;
  })]));
}
const training=cells(tune,'tune.ndjson'),h=cells(held,'held.ndjson');
const trainScores=Object.fromEntries(Object.entries(training).map(([name,rs])=>[name,mean(rs.map(r=>r.popSum))/100]));
for(const [name,m] of Object.entries(trainScores))assert(Math.abs(m-lock.scores[name])<1e-9);
assert.equal(lock.primary,Object.keys(trainScores).sort((a,b)=>trainScores[b]-trainScores[a])[0]);
const frac=(x,y)=>x/y, sd=xs=>Math.sqrt(xs.reduce((s,x)=>s+(x-mean(xs))**2,0)/(xs.length-1));
// Integer numerators retain the half-cent lattice for the one-sided exact test.
function contrast(integer,scale){
  const target=integer.reduce((s,v)=>s+v,0),n=integer.length;
  let hits=0;
  function flip(i,sum){if(i===n){hits+=+(sum>=target);return;}flip(i+1,sum+integer[i]);flip(i+1,sum-integer[i]);}
  flip(0,0);
  const x=integer.map(v=>v/scale);
  return {mean:mean(x),sd:sd(x),min:Math.min(...x),max:Math.max(...x),pos:x.filter(v=>v>0).length,p:hits/2**n,ci95:bootCI(x),paired:x};
}
const population=rs=>mean(rs.map(r=>r.popSum))/100;
const popTable=Object.fromEntries(Object.entries(h).map(([k,rs])=>[k,{mean:population(rs),sd:sd(rs.map(r=>r.pop)),skill:mean(rs.map(r=>r.skill)),extinct:rs.filter(r=>r.extinct).length,ms:mean(rs.map(r=>r.ms)),bites:mean(rs.map(r=>r.bites)),l3Updates:mean(rs.map(r=>r.l3Updates))}]));
const contrasts={};
for(const k of [...lock.families.map(a=>a.name),'DIR_Q_DIAG','AUTO','EVO','SHAM','RESET','ORACLE3']){
  const f=h.FIXED,m=h.META3,c=h[k],o=h.ORACLE3;
  const d4=contrast(f.map((v,i)=>2*m[i].popSum+v.popSum-3*c[i].popSum),200);
  const oracleD4=contrast(f.map((v,i)=>2*o[i].popSum+v.popSum-3*c[i].popSum),200);
  const diff=contrast(m.map((v,i)=>v.popSum-c[i].popSum),100);
  contrasts[k]={d4,oracleD4,diff,ratio:frac(population(m)-population(f),population(c)-population(f))};
}
const off=h.META3OFF.map((r,i)=>({pop:r.pop-h.FIXED[i].pop,skill:r.skill-h.FIXED[i].skill}));
const shamMinusAuto=contrast(h.SHAM.map((r,i)=>r.popSum-h.AUTO[i].popSum),100);
const report={tuningCells:tune.seeds.length*tune.arms.length,heldCells:held.seeds.length*held.arms.length,primary:lock.primary,popTable,contrasts,off,shamMinusAuto};
fs.writeFileSync(url('scores.json'),JSON.stringify(report,null,2));
console.table(Object.fromEntries(Object.entries(popTable).map(([k,r])=>[k,{pop:r.mean,sd:r.sd,skill:r.skill,ext:r.extinct,d4:contrasts[k]?.d4.mean}])));
console.log('Primary',lock.primary,JSON.stringify(contrasts[lock.primary]),'OFF absolute population max',Math.max(...off.map(r=>Math.abs(r.pop))));
// Draw from the archived scores only. Positions are on a shared fly-count axis.
const names=['FIXED','DIR_Q_DIAG','META3',...lock.families.map(a=>a.name),'ORACLE3'].sort((a,b)=>popTable[b].mean-popTable[a].mean);
const lo=5*Math.floor(Math.min(...names.map(k=>popTable[k].mean))/5),hi=5*Math.ceil(Math.max(...names.map(k=>popTable[k].mean))/5);
const pos=v=>100*(v-lo)/(hi-lo);
const chart=`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{font:14px Georgia,serif;color:#293c37;background:#fcfaf4;margin:0;padding:16px}h3,p{margin:2px 0 12px}section{display:grid;grid-template-columns:128px 1fr 46px;align-items:center;gap:8px;margin:6px 0}i{background:#dae1d5;height:2px;position:relative}b{position:absolute;top:-5px;width:11px;height:11px;border-radius:50%;background:#23785b}strong{text-align:right}small{font:12px monospace}</style><h3>Late population, 16 held-out worlds</h3><p>Mean live flies at ticks 10,100 to 20,000. Shared axis: ${lo} to ${hi} flies.</p>${names.map(k=>`<section><small>${k}</small><i><b style="left:calc(${pos(popTable[k].mean)}% - 5px);background:${k==='META3'?'#b45927':k===lock.primary?'#003c34':'#72988b'}"></b></i><strong>${popTable[k].mean.toFixed(2)}</strong></section>`).join('')}`;
fs.writeFileSync(url('holdout.html'),chart);
