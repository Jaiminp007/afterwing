import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { signflip, mean } from '../../docs/paper/stats.mjs';
import { read, cover, here } from './batch.mjs';
import { l2s } from './arms.mjs';
import { beams } from './beam.mjs';
import { GENERATIONS, LATE } from './world.mjs';

const C=GENERATIONS-LATE, stages=['tune','challengers','beam','beamchall','hold'];
const sum=a=>a.reduce((x,y)=>x+y,0), sd=a=>Math.sqrt(sum(a.map(x=>(x-mean(a))**2))/(a.length-1));
const lock=read('hold.json'), seeds=read('tune.json').seeds, ds=read('hold.json').seeds;
const marks=new Map(), spectra=new Map(), full=[];
let appendix='\n## Every seed endpoint\n\nEach cell is the exact sum of 24 late live-offspring censuses. Divide by 24 for the reported population. No extinct, tied, or losing seed is removed. Columns are in the displayed seed order. The NDJSON files also contain all 48 populations, axis labels, encounters, and nutritious bites for each row.\n';
for(const stage of stages){
  const job=read(stage+'.json'), rr=cover(stage);
  assert.equal(read(stage+'.complete.json').done,rr.length);
  assert.equal(fs.statSync(here(stage+'.err')).size,0);
  for(const [file,hash] of Object.entries(job.code)){
    const f=file==='batch.mjs' && ['tune','challengers'].includes(stage) ? 'batch-initial.mjs':file;
    assert.equal(createHash('sha256').update(fs.readFileSync(here(f))).digest('hex'),hash);
  }
  for(const r of rr){
    const key=r.seed+'/'+r.arm, eco=JSON.stringify([r.axes,r.events,r.switches]);
    assert(!marks.has(key));marks.set(key,r);
    if(spectra.has(r.seed))assert.equal(eco,spectra.get(r.seed));else spectra.set(r.seed,eco);
  }
  const table=[`| Configuration | ${job.seeds.join(' | ')} |`,`|---${'|---:'.repeat(16)}|`];
  for(const s of job.specs)table.push(`| ${s.name} | ${job.seeds.map(seed=>marks.get(seed+'/'+s.name).popSum).join(' | ')} |`);
  appendix+=`\n### ${stage}\n\n${table.join('\n')}\n`;
  full.push(...rr.map(r=>({...r,stage})));
}
assert.equal(spectra.size,32);assert.deepEqual(ds,seeds.map(x=>x+16));
const date=s=>Date.parse(read(s+'.json').frozen);
for(const s of stages.slice(0,-1))assert(date('hold')>=Date.parse(read(s+'.complete.json').at));
const metaLicensed=spec=>mean(ds.map(s=>2*marks.get(`${s}/${spec.name}`).popSum-3*marks.get(`${s}/${lock.T.name}`).popSum+marks.get(`${s}/${lock.F.name}`).popSum))>0;
const licensed=[lock.O,lock.BO].filter(metaLicensed).map(s=>s.name);
function stat(ints,div=C){
  assert.equal(ints.length,16);assert(ints.every(Number.isSafeInteger));
  const values=ints.map(x=>x/div),d=sum(ints),p=signflip(ints,1);
  let extreme=0;
  function enumerate(i,total) {
    if(i===16){extreme+=+(total>=d);return;}
    enumerate(i+1,total+ints[i]);enumerate(i+1,total-ints[i]);
  }
  enumerate(0,0);assert.equal(extreme/65536,p);
  return {mean:mean(values),sd:sd(values),se:sd(values)/4,range:[Math.min(...values),Math.max(...values)],
    pos:ints.filter(n=>n>0).length,ties:ints.filter(n=>n===0).length,p,ints,div};
}
const armName=s=>typeof s==='string'?s:s.name;
function summarize(bank,isHold){
  const get=(seed,s)=>marks.get(seed+'/'+armName(s));
  const vec=s=>bank.map(seed=>get(seed,s).popSum);
  const design=isHold ? lock.specs : stages.slice(0,-1).flatMap(stage=>read(stage+'.json').specs);
  const families=Object.fromEntries(design.map(s=>{
    const rr=bank.map(seed=>get(seed,s)),p=rr.map(r=>r.popSum/C),ac=rr.map(r=>sum(r.hits.slice(LATE))/sum(r.counts.slice(LATE)));
    return [s.name,{mean:mean(p),sd:sd(p),acc:mean(ac),accSd:sd(ac),empty:rr.filter(r=>r.pops.at(-1)===0).length,
      bites:sum(rr.map(r=>r.bites)),writes:sum(rr.map(r=>r.writes))}];
  }));
  const diff=(x,y)=>stat(vec(x).map((v,i)=>v-vec(y)[i]));
  const gate=(x,y)=>stat(vec(x).map((v,i)=>2*v-3*vec(y)[i]+vec(lock.F)[i]));
  const half=(x,y)=>stat(vec(x).map((v,i)=>v-vec(y)[i]),2*C);
  const gates={};
  for(const s of [lock.F,lock.E,lock.sr,lock.A,lock.bsWin,lock.ev,lock.beWin,lock.last,'UNPRUNED','LOCAL_BAYES',lock.T,'JOINT_quantile']){
    gates[armName(s)]={beam:gate(lock.BO,s),edit:gate(lock.O,s)};
  }
  function room(s,lib,field,ranks){
    const A=vec(s),F=vec(lock.F),T=vec(lock.T);
    const available=ranks.map(row=>lib.find(a=>a[field]===row[0][0]));
    const splice=bank.map(seed=>{
      let n=0;
      for(let g=LATE;g<GENERATIONS;g++){const a=get(seed,s).axes[g];n+=get(seed,available[a]).pops[g];}
      return n;
    });
    let optimistic=null;
    if(!isHold)optimistic=bank.map(seed=>[0,1].reduce((tot,ax)=>tot+Math.max(...lib.map(a=>{
      const r=get(seed,a);return sum(r.pops.slice(LATE).map((p,k)=>r.axes[LATE+k]===ax?p:0));})),0));
    const allGrid=field==='b'?l2s:beams;
    function spells(grid){
      return bank.map((seed,k)=>{
        const labels=get(seed,s).axes;let z=0;
        for(let start=LATE;start<GENERATIONS;){
          let end=start+1;while(end<GENERATIONS&&labels[end]===labels[start])end++;
          z+=Math.max(...grid.map(x=>sum(get(seed,x).pops.slice(start,end))));start=end;
        }
        return z-A[k];
      });
    }
    return {choices:available.map(armName),splice:stat(splice),extra:stat(splice.map((v,i)=>v-A[i])),
      need:half(s,lock.F),surplus:stat(splice.map((v,i)=>2*v-3*A[i]+F[i]),2*C),
      classSurplus:stat(splice.map((v,i)=>2*v-3*T[i]+F[i]),2*C),
      perWorldExtra:optimistic?stat(optimistic.map((v,i)=>v-A[i])):null,
      perSpellExtra:!isHold?stat(spells(lib)):null,allKnobsPerSpell:!isHold?stat(spells(allGrid)):null};
  }
  return {families,gates,editGain:diff(lock.E,lock.F),beamGain:diff(lock.A,lock.F),flatGain:diff(lock.T,lock.F),
    flatNeed:half(lock.T,lock.F),editRoom:room(lock.E,l2s.filter(s=>s.a===lock.E.a&&s.h===lock.E.h),'b',lock.ranks),
    beamRoom:room(lock.A,beams.filter(s=>s.h===lock.A.h),'q',lock.branks),beamOverFlat:diff(lock.BO,lock.T),
    fullOverFlat:diff('FULL_ORACLE',lock.T),fullGate:gate('FULL_ORACLE',lock.T),
    beamOverBase:diff(lock.BO,lock.A),editOverFlat:diff(lock.O,lock.T),
    needed:1.5*families[lock.T.name].mean-.5*families[lock.F.name].mean};
}
const result={tune:summarize(seeds,false),hold:summarize(ds,true),licensed,
  runs:full.length,stages:stages.map(s=>[s,read(s+'.json').specs.length,read(s+'.complete.json').done]),
  bites:sum(full.map(x=>x.bites)),zeroFinal:full.filter(r=>r.pops.at(-1)===0).length,
  events:seeds.concat(ds).map(s=>[s,...JSON.parse(spectra.get(s)).slice(1)])};
fs.writeFileSync(here('analysis.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(here('appendix.md'),appendix);
fs.writeFileSync(here('endpoints.tsv'),['stage\tarm\tseed\tpopSum\tnLate\tmean\tbites\tcorrect\tbirthsIncludingFounders\teditWrites\tL3Tests',
  ...full.sort((a,b)=>a.stage.localeCompare(b.stage)||a.arm.localeCompare(b.arm)||a.seed-b.seed).map(r=>
    [r.stage,r.arm,r.seed,r.popSum,r.nLate,r.popSum/r.nLate,r.bites,r.correct,r.born,r.writes,r.tested].join('\t'))].join('\n')+'\n');
console.log('complete',result.stages,'runs',result.runs,'bites',result.bites,'zeroFinal',result.zeroFinal,'licensed',licensed);
for(const [name,part] of [['tuning',result.tune],['holdout',result.hold]]){
  console.log(name);
  for(const [key,x] of Object.entries({editGain:part.editGain,beamGain:part.beamGain,flatGain:part.flatGain,beamExtra:part.beamRoom.extra,
    beamNeed:part.beamRoom.need,beamSurplus:part.beamRoom.surplus,editD4:part.gates[lock.T.name].edit,beamD4:part.gates[lock.T.name].beam,
    fullD4:part.fullGate}))console.log(key,x.mean,x.sd,x.pos,x.p);
}
