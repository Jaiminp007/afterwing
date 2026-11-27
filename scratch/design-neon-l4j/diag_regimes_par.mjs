// Parallel 16-regime diagnostic on tuning seed 951001 ONLY (D=12, N=66 pairs)
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.join(__dir, 'worker.mjs');

function goodRegimeParams(reg) {
  const persist = reg.supportMode === 0;
  const clean = reg.noiseMode === 0;
  const flip = reg.changeMode === 0;
  const ultra = reg.sparseMode === 0;
  return {
    betaMin: persist ? -8.5 : -4.6,
    betaMax: ultra ? (clean ? -1.1 : -1.8) : (clean ? -2.6 : -3.1),
    betaInit: persist ? -5.8 : -4.4,
    betaDecay: persist ? 0.0005 : 0.020,
    eta: (clean ? 0.14 : 0.08) * (flip ? 1.15 : 0.75),
    eClip: clean ? 100.0 : 1.6,
    l1Shrink: (ultra && persist) ? (clean ? 0.010 : 0.004) : 0.0,
    wDecay: persist ? 0.002 : 0.008,
    sumCap: clean ? 0.90 : 0.65,
  };
}

const CFG = { D: 12, toxin: 1.05, acceptAt: 0.48, ticks: 8000, lateFrom: 3000, every: 100 };
const SEED = 951001;

const E0 = goodRegimeParams({ supportMode: 0, noiseMode: 0, changeMode: 0, sparseMode: 0 });
const E1 = goodRegimeParams({ supportMode: 1, noiseMode: 0, changeMode: 0, sparseMode: 0 });
const E2 = goodRegimeParams({ supportMode: 0, noiseMode: 1, changeMode: 1, sparseMode: 1 });
const E3 = goodRegimeParams({ supportMode: 1, noiseMode: 1, changeMode: 0, sparseMode: 1 });

const ARMS = [
  { name: 'LAST', kind: 'pairLMS', alpha: 0.012, eClip: 1.8, wDecay: 0.004, inheritW: true },
  { name: 'L2_P0', kind: 'pairL2', params: E0 },
  { name: 'L2_P1', kind: 'pairL2', params: E1 },
  { name: 'L2_P2', kind: 'pairL2', params: E2 },
  { name: 'L2_P3', kind: 'pairL2', params: E3 },
  { name: 'SHARE3', kind: 'shareL2', etaMix: 0.25, share: 0.02, lossClip: 3.0, experts: [E0, E1, E2] },
  { name: 'SHARE3_B', kind: 'shareL2', etaMix: 0.25, share: 0.02, lossClip: 3.0, experts: [E0, E3, E2] },
];

const jobs = [];
for (let r = 0; r < 16; r++) {
  const worldOpts = { fixedRegime: r, subEvery: 260, S: 2.5 };
  for (const arm of ARMS) jobs.push({ regId: r, seed: SEED, arm, cfg: CFG, worldOpts });
  const reg = { supportMode: (r>>0)&1, noiseMode: (r>>1)&1, changeMode: (r>>2)&1, sparseMode: (r>>3)&1 };
  jobs.push({ regId: r, seed: SEED, arm: { name: 'ORACLE3', kind: 'pairL2', params: goodRegimeParams(reg) }, cfg: CFG, worldOpts });
}

const t0 = Date.now();
const workers = Array.from({ length: 8 }, () => new Worker(WORKER_PATH));
const out = Array.from({ length: 16 }, () => ({}));
let next = 0, done = 0;
await new Promise((resolve, reject) => {
  const go = w => { if (next < jobs.length) { const j = next++; w.postMessage({ jobId: j, ...jobs[j] }); } };
  for (const w of workers) {
    w.on('message', ({ jobId, res }) => {
      const regId = jobs[jobId].regId;
      out[regId][res.armName] = res;
      if (++done === jobs.length) { workers.forEach(x => x.terminate()); resolve(); }
      else go(w);
    });
    w.on('error', reject);
    go(w);
  }
});

console.log(`Done ${jobs.length} runs in ${((Date.now() - t0)/1000).toFixed(1)}s`);
const names = [...ARMS.map(a => a.name), 'ORACLE3'];
console.log('Reg(SNCS) |   LAST    |   L2_P0   |   L2_P1   |   L2_P2   |  SHARE3   | SHARE3_B  |  ORACLE3  | O3-SH3');
console.log('----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-------');
const sums = Object.fromEntries(names.map(n => [n, { pop: 0, skill: 0 }]));
for (let r = 0; r < 16; r++) {
  const tag = `${(r>>0)&1}${(r>>1)&1}${(r>>2)&1}${(r>>3)&1}`;
  for (const n of names) { sums[n].pop += out[r][n].pop; sums[n].skill += out[r][n].skill; }
  const f = n => `${out[r][n].pop.toFixed(1).padStart(4)}/${out[r][n].skill.toFixed(2)}`;
  const bestSh = Math.max(out[r].SHARE3.pop, out[r].SHARE3_B.pop);
  console.log(`  ${String(r).padStart(2)} ${tag} | ${f('LAST')} | ${f('L2_P0')} | ${f('L2_P1')} | ${f('L2_P2')} | ${f('SHARE3')} | ${f('SHARE3_B')} | ${f('ORACLE3')} | ${(out[r].ORACLE3.pop - bestSh).toFixed(1).padStart(6)}`);
}
console.log('----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-------');
const fa = n => `${(sums[n].pop/16).toFixed(1).padStart(4)}/${(sums[n].skill/16).toFixed(2)}`;
const bestL2 = Math.max(sums.L2_P0.pop, sums.L2_P1.pop, sums.L2_P2.pop, sums.L2_P3.pop) / 16;
const bestSh = Math.max(sums.SHARE3.pop, sums.SHARE3_B.pop) / 16;
const lastM = sums.LAST.pop / 16;
const o3M = sums.ORACLE3.pop / 16;
console.log(`  MEAN    | ${fa('LAST')} | ${fa('L2_P0')} | ${fa('L2_P1')} | ${fa('L2_P2')} | ${fa('SHARE3')} | ${fa('SHARE3_B')} | ${fa('ORACLE3')} | ${(o3M - bestSh).toFixed(1).padStart(6)}`);
console.log(`\nSummary (pop): LAST=${lastM.toFixed(2)}, bestL2=${bestL2.toFixed(2)}, bestSHARE3=${bestSh.toFixed(2)}, ORACLE3=${o3M.toFixed(2)}`);
console.log(`L2 - LAST       = ${(bestL2 - lastM).toFixed(2)}`);
console.log(`ORACLE3 - L2    = ${(o3M - bestL2).toFixed(2)} (ratio ${((o3M - lastM) / (bestL2 - lastM)).toFixed(2)}x)`);
console.log(`ORACLE3 - SH3   = ${(o3M - bestSh).toFixed(2)} (d4 vs SH3 = ${(2*o3M - 3*bestSh + lastM).toFixed(2)})`);
