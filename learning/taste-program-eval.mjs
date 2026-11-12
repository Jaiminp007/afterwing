// Embodied evaluation of a taste-learning program (code + step/replays/memory/prior).
// Score per history = mean over families A,B,C of each fly's discrimination
// P(accept|good)-P(accept|bad), over flies alive at the end of phase C
// (acquisition and retention together; read before return-A).
import {fork} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {OdorRoutedExperiment} from './odor-routed-experiment.mjs';
import {predictTargetTaste} from './odor-routed-taste.mjs';
import {makeCueCodebook} from './cue-foraging.mjs';
import {advanceRng} from './intervention-study.mjs';

export function makeHistories(bankSeed,count){
  let rng=bankSeed>>>0||1;const next=()=>(rng=advanceRng(rng))>>>0||1;
  return Array.from({length:count},()=>({seed:next(),cueSeed:next(),resourceSeeds:[next(),next(),next(),next()],probeSeeds:{A:next(),B:next(),transfer:next()}}));
}
export function evaluateOne(program,history,world={}){
  const {code,...tasteProgram}=program;
  const run=new OdorRoutedExperiment({history,acquisitionGeometry:'continual',steeringMode:'learned',trainingRegime:'continuous',steeringLearner:'original',tasteCode:code,tasteProgram,...world});
  const end=run.advance((world.phaseDurations??[512,512,512,256]).reduce((x,y)=>x+y,0)),outcome={survivors:end.survivors,energy:end.budgetAdjustedEnergyPerFounder};
  const anchor=run.anchors.C;if(!anchor)return {score:0,alive:0,...outcome};
  const probe=OdorRoutedExperiment.restore(anchor),book=makeCueCodebook(history.cueSeed),values=[];
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
