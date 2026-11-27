import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { mean } from '../../docs/paper/stats.mjs';
import { H } from './world.mjs';
const read=s=>readFileSync(new URL(s,import.meta.url),'utf8').trim();
const nd=s=>read(s).split(/\r?\n/).map(JSON.parse);
const rows=nd('./rows.ndjson'), records=nd('./records.ndjson'), screen=JSON.parse(read('./screen.json'));
const {locks}=screen;
const bank=screen.seeds, pick=(seed,arm)=>rows.find(r=>r.seed===seed&&r.arm===arm);
const exact=v=>{
  let tail=0;const obs=v.reduce((a,b)=>a+b,0);
  for(let mask=0;mask<2**v.length;mask++){
    let n=0;for(let i=0;i<v.length;i++)n+=(mask&(1<<i)?-1:1)*v[i];
    if(n>=obs)tail++;
  }
  return [tail,2**v.length];
};
const d=bank.map(s=>2*pick(s,locks.oracle).popSum-3*pick(s,locks.all).popSum+pick(s,'FIXED').popSum);
assert.deepEqual(d,screen.oracleD4.ints);
const [tail,total]=exact(d);assert.equal(tail/total,screen.oracleD4.p);
const seasons=[0,1].map(season=>{
  const probes=[[],[]], ratesDiff=[];
  const pop=Object.fromEntries(Object.keys(screen.means).map(a=>[a,mean(bank.map(s=>pick(s,a).gardens.find(g=>g.season===season).popSum/50))]));
  for(const s of bank){
    const g=pick(s,'FIXED').gardens,idx=g.findIndex(x=>x.season===season);
    const raw=records.find(r=>r.seed===s).raw[idx];
    assert.equal(H(raw),g[idx].trials);
    const split=[0,1].map(i=>raw.filter(r=>r[3]===i).map(r=>r[4]));
    for(let i=0;i<2;i++)probes[i].push(...split[i]);
    ratesDiff.push(mean(split[1])-mean(split[0]));
  }
  return {season,pop,probes:probes.map(y=>({n:y.length,sum:y.reduce((a,b)=>a+b,0),nonzero:y.filter(Boolean).length,rate:mean(y)})),
    meanSeedContrastRminusS:mean(ratesDiff)};
});
// Independent gardens let us compute an optimistic season-specific oracle from
// already-run trajectories, even if 'reuse means reinforce' is the wrong map.
const possible=[locks.scalar,...Object.keys(screen.means).filter(a=>a.startsWith('K'))];
const bestPerSeason=seasons.map(g=>possible.reduce((b,a)=>g.pop[a]>g.pop[b]?a:b));
const env=bank.map(s=>bestPerSeason.reduce((n,a,i)=>n+pick(s,a).gardens.find(g=>g.season===i).popSum,0));
const envD=bank.map((s,i)=>2*env[i]-3*pick(s,locks.all).popSum+pick(s,'FIXED').popSum);
const report={valid:rows.filter(r=>bank.includes(r.seed)).length,invalid:nd('./invalid-coordinate/rows.ndjson').length,
  extinctGardens:rows.filter(r=>bank.includes(r.seed)).flatMap(r=>r.gardens).filter(g=>g.extinct).length,
  envelope:{bestPerSeason,pop:mean(env)/100,d4:mean(envD)/200,positive:envD.filter(x=>x>0).length,signFlip:exact(envD)},
  tail,total,seasons,oracleBySeed:d.map((x,i)=>[bank[i],x/200]),
  activeOracleWrites:bank.flatMap(s=>pick(s,locks.oracle).gardens).reduce((n,g)=>n+g.reads,0),
  directDecisions:bank.flatMap(s=>pick(s,locks.direct).gardens).reduce((n,g)=>n+g.direct,0)};
writeFileSync(new URL('./diagnostics.json',import.meta.url),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report,null,2));
