// Reproduce the P11b gate (docs/MICROVERSE_L2_LOG.md, "P11b gate") and save per-seed data.
// The original run kept only summary numbers. The sim is deterministic, so this rerun on the
// same spent seeds 80001-80048 is a reproduction, not a new test.
// Usage: node microverse/p11b-gate.mjs  -> writes evidence/microverse/p11b-final-80001-80048.json
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { writeFileSync, mkdirSync } from 'node:fs';
import { runWorld, STRAINS } from './run.mjs';
import { TICKS, EVERY, CONFIG } from './config.mjs';

// Same as soloPop in l2search.mjs (importing that file would run its worker branch here).
function soloPop(seed, genes) {
  const strain = { ...STRAINS.SELF, genes: { ...STRAINS.SELF.genes, ...genes } }, { snaps } = runWorld(seed, TICKS, ['X'], { every: EVERY, config: CONFIG, strains: { X: strain } });
  const late = []; for (let t = 10000 + EVERY; t <= TICKS; t += EVERY) { const s = snaps.find(x => x.tick === t); late.push(s ? s.pop : 0); }
  return late.reduce((a, b) => a + b, 0) / late.length;
}
const R_P12 = { tasteMemory: 1e12, tastePrune: 0, tasteZ: 3, tasteEvery: 8, tasteCap: 16 };
const ARMS ={ RSTAR: { tasteMemory: 800, tastePrune: .5, tasteZ: 3, tasteEvery: 4, tasteCap: 16 }, R_P12, R0: {} };
const SEEDS = [...Array(48).keys()].map(i => 80001 + i);

if (!isMainThread) { parentPort.postMessage({ ...workerData, pop: soloPop(workerData.seed, ARMS[workerData.arm]) }); }
else {
  const jobs = SEEDS.flatMap(seed => Object.keys(ARMS).map(arm => ({ seed, arm }))), out = {};
  await new Promise(resolve => { let next = 0, done = 0; const go = () => { if (next >= jobs.length) return; const w = new Worker(new URL(import.meta.url), { workerData: jobs[next++] });
    w.on('message', m => { (out[m.arm] ??= {})[m.seed] = m.pop; }); w.on('exit', () => ++done === jobs.length ? resolve() : go()); };
    for (let i = 0; i < Math.max(1, cpus().length - 1); i++) go(); });
  const pops = Object.fromEntries(Object.keys(ARMS).map(a => [a, SEEDS.map(s => out[a][s])]));
  const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  const contrast = (a, b) => { const d = pops[a].map((v, i) => v - pops[b][i]); return { meanDiff: +mean(d).toFixed(2), positive: d.filter(x => x > 0).length, diffs: d.map(x => +x.toFixed(3)) }; };
  const result = { plan: 'docs/MICROVERSE_L2_GOALS.md#P11b-A1', seeds: SEEDS, arms: ARMS, means: Object.fromEntries(Object.entries(pops).map(([a, v]) => [a, +mean(v).toFixed(2)])),
    gate_RSTAR_vs_R_P12: contrast('RSTAR', 'R_P12'), reported_RSTAR_vs_R0: contrast('RSTAR', 'R0'), pops };
  mkdirSync(new URL('../evidence/microverse/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../evidence/microverse/p11b-final-80001-80048.json', import.meta.url), JSON.stringify(result) + '\n');
  console.log(JSON.stringify(result.means), JSON.stringify({ gate: result.gate_RSTAR_vs_R_P12.meanDiff, pos: result.gate_RSTAR_vs_R_P12.positive, vsR0: result.reported_RSTAR_vs_R0.meanDiff }));
}
