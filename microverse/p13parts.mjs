// P13b parts: run META (trial), SHAM (trialsham), EVO-R, FIXED once per seed; report every contrast.
// Usage: node microverse/p13parts.mjs seeds   (e.g. 90001-90048 or 101,102)
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { runWorld, STRAINS } from './run.mjs';
import { TICKS, EVERY, CONFIG } from './config.mjs';
// MV_META (JSON) overrides META/SHAM program fields (P13b-2b practice); MV_ARMS limits which arms run.
const X = JSON.parse(process.env.MV_META || '{}'), ALL = { META: { ...STRAINS.P13_FIXED, metaR: 'trial', ...X }, SHAM: { ...STRAINS.P13_FIXED, metaR: 'trialsham', ...X }, EVOR: STRAINS.P13_EVOR, FIXED: STRAINS.P13_FIXED };
const ARMS = Object.fromEntries(Object.entries(ALL).filter(([k]) => !process.env.MV_ARMS || process.env.MV_ARMS.split(',').includes(k)));
if (!isMainThread) {
  const { seed, arm } = workerData, { snaps } = runWorld(seed, TICKS, ['X'], { every: EVERY, config: CONFIG, strains: { X: ARMS[arm] } });
  const late = []; for (let t = 10000 + EVERY; t <= TICKS; t += EVERY) { const s = snaps.find(x => x.tick === t); late.push(s ? s.pop : 0); }
  parentPort.postMessage({ seed, arm, meanPop: late.reduce((a, b) => a + b, 0) / late.length });
} else {
  const arg = process.argv[2], seeds = arg.includes('-') ? (([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i))(arg.split('-').map(Number)) : arg.split(',').map(Number);
  const jobs = seeds.flatMap(seed => Object.keys(ARMS).map(arm => ({ seed, arm }))), res = {};
  await new Promise(resolve => { let next = 0, done = 0; const go = () => { if (next >= jobs.length) return; const j = jobs[next++], w = new Worker(new URL(import.meta.url), { workerData: j });
    w.on('message', m => (res[m.seed] ??= {})[m.arm] = m.meanPop); w.on('exit', () => ++done === jobs.length ? resolve() : go()); }; for (let i = 0; i < Math.min(jobs.length, cpus().length - 1); i++) go(); });
  const signflip = d => { const n = d.length, obs = d.reduce((a, b) => a + b, 0) / n; let ge = 0, total = 0;
    if (n <= 16) { for (let m = 0; m < 1 << n; m++) { let t = 0; for (let i = 0; i < n; i++) t += (m >> i & 1 ? -1 : 1) * d[i]; if (t / n >= obs - 1e-12) ge++; } total = 2 ** n; }
    else { let r = 7; for (let k = 0; k < 200000; k++) { let t = 0; for (let i = 0; i < n; i++) { r = (r * 1103515245 + 12345) >>> 0; t += (r & 0x10000 ? -1 : 1) * d[i]; } if (t / n >= obs - 1e-12) ge++; } total = 200000; }
    return { meanDiff: +obs.toFixed(2), positive: d.filter(x => x > 0).length, p: +(ge / total).toFixed(5) }; };
  const mean = a => +(seeds.reduce((s, x) => s + res[x][a], 0) / seeds.length).toFixed(2);
  const out = { seeds: seeds.length, means: Object.fromEntries(Object.keys(ARMS).map(a => [a, mean(a)])) };
  for (const B of ['FIXED', 'EVOR', 'SHAM'].filter(b => ARMS[b] && ARMS.META)) out['META-' + B] = signflip(seeds.map(s => res[s].META - res[s][B]));
  out.perSeed = res; console.log(JSON.stringify(out));
}
