// Embodied evaluation of a taste-learning program (code + step/replays/memory/prior).
// Score per history = mean over families A,B,C of each fly's discrimination
// P(accept|good)-P(accept|bad), over flies alive at the end of phase C
// (acquisition and retention together; read before return-A).
import {fork} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {OdorRoutedExperiment} from './odor-routed-experiment.mjs';
import {predictTargetTaste,tasteExampleListeners} from './odor-routed-taste.mjs';
import {makeCueCodebook} from './cue-foraging.mjs';
import {advanceRng} from './intervention-study.mjs';

export function makeHistories(bankSeed,count){
  let rng=bankSeed>>>0||1;const next=()=>(rng=advanceRng(rng))>>>0||1;
  return Array.from({length:count},()=>({seed:next(),cueSeed:next(),resourceSeeds:[next(),next(),next(),next()],probeSeeds:{A:next(),B:next(),transfer:next()}}));
}
// Valence rule ("odor chemistry"): an odor's value = sign * product of its cue
// bits over rule.mask, replacing the random codebook labels in every family.
export function applyValenceRule(run,rule){
  const value=bits=>{let v=rule.sign;for(let bit=0;bit<4;bit++)if(rule.mask>>bit&1)v*=bits[bit];return v;};
  for(const family of Object.values(run.codebook))for(const item of family)item.valence=value(item.bits);
  for(const patch of run.world.food)if(patch.cueId)patch.valence=value(patch.cue);
}
export function evaluateOne(program,history,world={}){
  const {code,...tasteProgram}=program,{valenceRule=null,...options}=world;
  const run=new OdorRoutedExperiment({history,acquisitionGeometry:'continual',steeringMode:'learned',trainingRegime:'continuous',steeringLearner:'original',tasteCode:code,tasteProgram,...options});
  if(valenceRule)applyValenceRule(run,valenceRule);
  // The flies' own experience: for each Walsh term, sum of term(cue)*(2*target-1).
  const termEvidence=Array(16).fill(0);let examples=0;
  const listener=({cue,target})=>{if(cue[0]===0)return;examples++;for(let m=0;m<16;m++){let v=1;for(let b=0;b<4;b++)if(m>>b&1)v*=cue[b];termEvidence[m]+=v*(2*target-1);}};
  tasteExampleListeners.add(listener);
  try{
  var end=run.advance((options.phaseDurations??[512,512,512,256]).reduce((x,y)=>x+y,0)),outcome0={survivors:end.survivors,energy:end.budgetAdjustedEnergyPerFounder};
  }finally{tasteExampleListeners.delete(listener);}
  const outcome={...outcome0,termEvidence,examples};
  const anchor=run.anchors.C;if(!anchor)return {score:0,alive:0,...outcome};
  const probe=OdorRoutedExperiment.restore(anchor),book=run.codebook,values=[];
  for(const fly of probe.world.flies){const s=structuredClone(probe.learners[fly.id]);let d=0;
    for(const family of ['A','B','C']){for(const item of book[family])d+=(item.valence>0?1:-1)*predictTargetTaste(s,item.bits)/2;}
    values.push(d/3);}
  return {score:values.length?values.reduce((a,b)=>a+b,0)/values.length:0,alive:values.length,...outcome};
}
// Child-process pool: evaluate many (program, history) jobs in parallel.
export class Pool{
  constructor(size=6){this.workers=Array.from({length:size},()=>fork(fileURLToPath(import.meta.url),['worker'],{stdio:['ignore','ignore','inherit','ipc']}));this.idle=[...this.workers];this.queue=[];this.next=0;this.pending=new Map();
    for(const w of this.workers)w.on('message',({id,result})=>{this.pending.get(id)(result);this.pending.delete(id);this.idle.push(w);this.pump();});}
  run(program,history,world={}){return new Promise(resolve=>{this.queue.push({id:this.next++,program,history,world,resolve});this.pump();});}
  pump(){while(this.idle.length&&this.queue.length){const job=this.queue.shift(),w=this.idle.pop();this.pending.set(job.id,job.resolve);w.send({id:job.id,program:job.program,history:job.history,world:job.world});}}
  close(){for(const w of this.workers)w.kill();}
}
if(process.argv[2]==='worker')process.on('message',({id,program,history,world})=>process.send({id,result:evaluateOne(program,history,world)}));
