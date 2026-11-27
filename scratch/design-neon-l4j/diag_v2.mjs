// Fast 8-regime diagnostic for World V2 on tuning seed 951001 ONLY (D=12, N=66 pairs)
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { regimeL2ParamsV2, interpL2ParamsV2 } from './learners_v2.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.join(__dir, 'worker_v2.mjs');

const CFG = { D: 12, toxin: 1.05, acceptAt: 0.48, ticks: 8000, lateFrom: 3000, every: 100 };
const SEED = 951001;

const regOf = id => ({ id, supportMode: (id>>0)&1, noiseMode: (id>>1)&1, sparseMode: (id>>2)&1 });
const E0 = regimeL2ParamsV2(regOf(0)); // persist + clean + ultra
const E3 = regimeL2ParamsV2(regOf(3)); // turnover + storm + ultra
const E5 = regimeL2ParamsV2(regOf(5)); // turnover + clean + semi
const E6 = regimeL2ParamsV2(regOf(6)); // persist + storm + semi

const ARMS = [
  { name: 'LAST', kind: 'pairLMS', alpha: 0.012, eClip: 1.6, wDecay: 0.003, inheritW: true },
  { name: 'ORACLE1', kind: 'pairLMS', alpha: 0.012, eClip: 1.6, wDecay: 0.003, inheritW: true, isOracle: true },
  { name: 'L2_MID', kind: 'pairL2', params: interpL2ParamsV2(0.5, 0.5, 0.5) },
  { name: 'L2_000', kind: 'pairL2', params: E0 },
  { name: 'L2_011', kind: 'pairL2', params: E6 },
  { name: 'SHARE3', kind: 'shareL2', etaMix: 0.25, share: 0.02, lossClip: 3.0, experts: [E0, E3, E6] },
  { name: 'OPENLOOP', kind: 'openLoopClassFV2' },
  { name: 'ORACLE3', kind: 'pairL2', params: interpL2ParamsV2(0.5, 0.5, 0.5), isOracle: true },
];

const jobs = [];
for (let r = 0; r < 8; r++) {
  const worldOpts = { fixedRegime: r };
  for (const arm of ARMS) jobs.push({ regId: r, seed: SEED, arm, cfg: CFG, worldOpts });
}

const t0 = Date.now();
const workers = Array.from({ length: 8 }, () => new Worker(WORKER_PATH));
const out = Array.from({ length: 8 }, () => ({}));
let next = 0, done = 0;
await new Promise((resolve, reject) => {
  const go = w => { if (next < jobs.length) { const j = next++; w.postMessage({ jobId: j, ...jobs[j] }); } };
  for (const w of workers) {
    w.on('message', ({ jobId, res }) => {
      out[jobs[jobId].regId][res.armName] = res;
      if (++done === jobs.length) { workers.forEach(x => x.terminate()); resolve(); }
      else go(w);
    });
    w.on('error', reject);
    go(w);
  }
});

console.log(`Done ${jobs.length} runs in ${((Date.now() - t0)/1000).toFixed(1)}s`);
const names = ARMS.map(a => a.name);
console.log('Reg(SNS) |   LAST    |  ORACLE1  |  L2_MID   |  L2_000   |  SHARE3   | OPENLOOP  |  ORACLE3  | O3-SH3 | O3-OL');
console.log('---------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|--------|------');
const sums = Object.fromEntries(names.map(n => [n, { pop: 0, skill: 0 }]));
for (let r = 0; r < 8; r++) {
  const tag = `${(r>>0)&1}${(r>>1)&1}${(r>>2)&1}`;
  for (const n of names) { sums[n].pop += out[r][n].pop; sums[n].skill += out[r][n].skill; }
  const f = n => `${out[r][n].pop.toFixed(1).padStart(4)}/${out[r][n].skill.toFixed(2)}`;
  console.log(`  ${r} ${tag}  | ${f('LAST')} | ${f('ORACLE1')} | ${f('L2_MID')} | ${f('L2_000')} | ${f('SHARE3')} | ${f('OPENLOOP')} | ${f('ORACLE3')} | ${(out[r].ORACLE3.pop - out[r].SHARE3.pop).toFixed(1).padStart(6)} | ${(out[r].ORACLE3.pop - out[r].OPENLOOP.pop).toFixed(1).padStart(5)}`);
}
console.log('---------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|--------|------');
const fa = n => `${(sums[n].pop/8).toFixed(1).padStart(4)}/${(sums[n].skill/8).toFixed(2)}`;
const lastM = sums.LAST.pop / 8, l2M = Math.max(sums.L2_MID.pop, sums.L2_000.pop, sums.L2_011.pop) / 8;
const shM = sums.SHARE3.pop / 8, olM = sums.OPENLOOP.pop / 8, o3M = sums.ORACLE3.pop / 8;
const cfM = Math.max(l2M, shM, olM);
console.log(`  MEAN   | ${fa('LAST')} | ${fa('ORACLE1')} | ${fa('L2_MID')} | ${fa('L2_000')} | ${fa('SHARE3')} | ${fa('OPENLOOP')} | ${fa('ORACLE3')} | ${(o3M - shM).toFixed(1).padStart(6)} | ${(o3M - olM).toFixed(1).padStart(5)}`);
console.log(`\nLAST=${lastM.toFixed(2)}, bestFixedL2=${l2M.toFixed(2)}, SHARE3=${shM.toFixed(2)}, OPENLOOP=${olM.toFixed(2)}, bestCF=${cfM.toFixed(2)}, ORACLE3=${o3M.toFixed(2)}`);
console.log(`(a) L2 - LAST     = ${(l2M - lastM).toFixed(2)}`);
console.log(`(b) O3 - fixedL2  = ${(o3M - l2M).toFixed(2)} (ratio ${((o3M - lastM)/(l2M - lastM)).toFixed(2)}x)`);
console.log(`(c) O3 - bestCF   = ${(o3M - cfM).toFixed(2)} (d4 vs bestCF = ${(2*o3M - 3*cfM + lastM).toFixed(2)})`);
