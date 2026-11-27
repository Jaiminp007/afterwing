import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

const file=s=>new URL(s,import.meta.url), read=s=>readFileSync(file(s),'utf8');
const screen=JSON.parse(read('screen.json')), raw=read('tuning.ndjson').trim().split('\n').map(JSON.parse);
const {tune,locks,arms,specs,d}=screen, seeds=Array.from({length:16},(_,i)=>3101+i);
assert.deepEqual(tune,seeds);assert.equal(raw.length,seeds.length*Object.keys(arms).length);
const pairs=new Map(raw.map(r=>[`${r.seed}/${r.arm}`,r]));assert.equal(pairs.size,raw.length);
const per=a=>tune.map(s=>pairs.get(`${s}/${a}`));
for(const a of Object.keys(arms)){
  const cells=per(a);
  for(const x of cells){
    assert.equal(x.digest,screen.digest);assert.equal(x.samples,100);assert.equal(x.schedule,per(locks.fixed)[tune.indexOf(x.seed)].schedule);
    assert(x.seen.every(n=>Number.isInteger(n)&&n>=0));assert(x.err2.every((n,i)=>n>=0&&n<=x.seen[i]+1e-7));
    assert.equal(x.end,60+x.births-x.deaths);
  }
  assert(Math.abs(mean(cells.map(x=>x.popSum))/100-arms[a].mean)<1e-10);
}
const pop=(s,a)=>pairs.get(`${s}/${a}`).popSum;
const contrast=tune.map(s=>2*pop(s,locks.oracle)-3*pop(s,locks.l2best)+pop(s,locks.fixed));
assert.deepEqual(contrast,d.ints);
const signs=contrast.reduce((ss,x)=>ss.flatMap(s=>[s+x,s-x]),[0]);
const tailCount=signs.filter(s=>s>=contrast.reduce((x,y)=>x+y,0)).length;
assert.equal(tailCount/signs.length,signflip(contrast,1));assert.equal(d.p,tailCount/signs.length);
const challengers=Object.keys(specs).filter(a=>!['full','oracle','null'].includes(specs[a].k));
assert.equal(arms[locks.l2best].mean,Math.max(...challengers.map(a=>arms[a].mean)));
const ps=Object.keys(specs).filter(a=>specs[a].k==='fixed'&&specs[a].mask===undefined);
const bestByRole=[0,1].map(j=>ps.reduce((a,b)=>arms[a].risk[j]<=arms[b].risk[j]?a:b));
const capture=against=>(arms[locks.fixed].mean-arms.NOREV.mean)/(arms[against].mean-arms.NOREV.mean);
const diagnostic={seeds,arms:Object.keys(arms).length,cells:raw.length,zeroEnds:raw.filter(x=>!x.end).length,
  capTicks:raw.reduce((n,x)=>n+x.atCap,0),tailCount,totalSigns:signs.length,bestByRole,
  scalarCaptureVsNOREV:{onChannel:capture(locks.oracle),fullChannel:capture('FULL_ALPHA_ORACLE')},
  swaps:tune.map(s=>pairs.get(`${s}/${locks.fixed}`).swaps),means:Object.fromEntries(
    ['NOREV',...new Set(Object.values(locks)),'FULL_ALPHA_ORACLE'].map(a=>[a,arms[a].mean]))};
console.log(JSON.stringify(diagnostic,null,1));

const ds=contrast.map(x=>x/200), W=640,H=374;
const xMax=Math.max(1,...ds.map(Math.abs))*1.10,scale=210/xMax;
const rows=ds.map((v,i)=>{
  const start=320+Math.min(0,v*scale),w=Math.abs(v*scale),y=23+i*20;
  return `<text x="32" y="${y+3}">${seeds[i]}</text><rect x="${start}" y="${y-6}" width="${w}" height="10" fill="${v>0?'#21725f':'#af482b'}"/><text x="570" y="${y+3}">${v.toFixed(2)}</text>`;
}).join('');
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>L4-D oracle headroom</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f8f5ed;color:#25312f;font:16px Georgia,serif}main{max-width:740px;margin:auto;padding:24px}h1{font-size:25px;margin:0 0 6px}p{margin:0 0 12px;line-height:1.5}svg{width:100%;height:auto;display:block}text{font:12px Consolas,monospace;fill:#2d3834}</style>
<main><h1>L4-D: oracle headroom by tuning seed</h1><p>Extra late flies after subtracting the required 1.5&times; challenger gain. Bars to the right of zero favor the oracle.</p>
<svg role="img" aria-label="All sixteen oracle headroom contrasts; ${d.wins} positive" viewBox="0 0 ${W} ${H}"><path d="M320 9V340" stroke="#443d32"/>${rows}<text x="320" y="354" text-anchor="middle">0 flies</text></svg>
<p>Oracle: ${locks.oracle}. Challenger: ${locks.l2best}. Mean ${d.mean.toFixed(2)} flies. This is a tuning screen, not a final test.</p></main></html>`;
writeFileSync(file('oracle.html'),html);
