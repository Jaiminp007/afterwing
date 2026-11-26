// Paired-solo runner for any set of named strains (paper revision: L2-D and G7d).
// Usage: node microverse/arms.mjs ARM1,ARM2,... <seeds: a-b or a,b,c>   (MV_WORLD env merges world overrides)
// Prints JSON: per-seed mean late population (ticks 10,100-20,000, extinct = 0) at full precision for every arm,
// plus per-seed L2-D telemetry. Scoring is done separately with the exact test (docs/paper/stats.mjs).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { runWorld, STRAINS } from './run.mjs';
import { TICKS, EVERY, CONFIG } from './config.mjs';
import { L2D_STATS } from './sim.mjs';

const WORLD = { ...CONFIG, ...JSON.parse(process.env.MV_WORLD || '{}') };
if (!isMainThread) {
  const { seed, arm } = workerData, { snaps } = runWorld(seed, TICKS, ['X'], { every: EVERY, config: WORLD, strains: { X: STRAINS[arm] } });
  const late = []; for (let t = 10000 + EVERY; t <= TICKS; t += EVERY) { const s = snaps.find(x => x.tick === t); late.push(s ? s.pop : 0); }
  parentPort.postMessage({ seed, arm, meanPop: late.reduce((a, b) => a + b, 0) / late.length, telemetry: { ...L2D_STATS } });
} else {
  const arms = process.argv[2].split(','), arg = process.argv[3];
  for (const a of arms) if (!STRAINS[a]) throw new Error(`unknown strain ${a}`);
  const seeds = arg.includes('-') ? (([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i))(arg.split('-').map(Number)) : arg.split(',').map(Number);
  const jobs = seeds.flatMap(seed => arms.map(arm => ({ seed, arm }))), pop = {}, tel = {};
  await new Promise(resolve => { let next = 0, done = 0; const go = () => { if (next >= jobs.length) return; const w = new Worker(new URL(import.meta.url), { workerData: jobs[next++] });
    w.on('message', m => { (pop[m.seed] ??= {})[m.arm] = m.meanPop; (tel[m.seed] ??= {})[m.arm] = m.telemetry; }); w.on('exit', () => ++done === jobs.length ? resolve() : go()); };
    for (let i = 0; i < Math.min(jobs.length, Math.max(1, cpus().length - 1)); i++) go(); });
  const mean = a => seeds.reduce((s, x) => s + pop[x][a], 0) / seeds.length;
  console.log(JSON.stringify({ arms, seeds, world: WORLD, means: Object.fromEntries(arms.map(a => [a, +mean(a).toFixed(3)])), perSeed: pop, telemetry: tel }));
}
