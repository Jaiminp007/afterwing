// Tuning screen 1 on exploration tuning seeds 951001-951016 ONLY.
// Held-out seeds 951017-951032 are NOT touched here.
import { Worker } from 'node:worker_threads';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { regimeL2Params, interpL2Params } from './learners.mjs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.join(__dir, 'worker.mjs');

const SEEDS = Array.from({ length: 16 }, (_, i) => 951001 + i);

// Build diverse arm set for tuning screen
const ARMS = [
  // Depth 1 (FIXED, including weight-inheriting LAST and Huber-clipped LAST)
  { name: 'LMS_005', kind: 'pairLMS', alpha: 0.005, eClip: 100, inheritW: false },
  { name: 'LMS_010', kind: 'pairLMS', alpha: 0.010, eClip: 100, inheritW: false },
  { name: 'LAST_005', kind: 'pairLMS', alpha: 0.005, eClip: 100, inheritW: true },
  { name: 'LAST_010', kind: 'pairLMS', alpha: 0.010, eClip: 100, inheritW: true },
  { name: 'LAST_HUBER_006', kind: 'pairLMS', alpha: 0.006, eClip: 1.5, wDecay: 0.004, inheritW: true },
  { name: 'LAST_HUBER_010', kind: 'pairLMS', alpha: 0.010, eClip: 1.5, wDecay: 0.006, inheritW: true },
  { name: 'LAST_HUBER_L1', kind: 'pairLMS', alpha: 0.010, eClip: 1.5, l1Shrink: 0.005, wDecay: 0.004, inheritW: true },
  { name: 'LAST_KAL_M', kind: 'pairDiagKal', q: 1e-4, R: 1.5, eClip: 1.8, inheritW: true },
  { name: 'LAST_KAL_H', kind: 'pairDiagKal', q: 5e-4, R: 1.5, eClip: 1.8, inheritW: true },
  // Mediation diagnostic: depth-1 LAST given true regime
  { name: 'ORACLE1', kind: 'pairLMS', alpha: 0.008, eClip: 2.0, inheritW: true, isOracle: true },

  // Depth 2 (fixed-hyperparameter PAIR_L2 grid)
  { name: 'L2_MID', kind: 'pairL2', params: interpL2Params(0.5, 0.5, 0.5, 0.5) },
  { name: 'L2_PERSIST_CLEAN', kind: 'pairL2', params: regimeL2Params({ supportMode: 0, noiseMode: 0, changeMode: 0, sparseMode: 0 }) },
  { name: 'L2_PERSIST_STORM', kind: 'pairL2', params: regimeL2Params({ supportMode: 0, noiseMode: 1, changeMode: 0, sparseMode: 0 }) },
  { name: 'L2_TURN_CLEAN', kind: 'pairL2', params: regimeL2Params({ supportMode: 1, noiseMode: 0, changeMode: 0, sparseMode: 0 }) },
  { name: 'L2_TURN_STORM', kind: 'pairL2', params: regimeL2Params({ supportMode: 1, noiseMode: 1, changeMode: 0, sparseMode: 0 }) },
  { name: 'L2_BROAD_MID', kind: 'pairL2', params: interpL2Params(0.5, 0.5, 0.5, 1.0) },
  { name: 'L2_ROBUST_MID', kind: 'pairL2', params: interpL2Params(0.3, 0.75, 0.3, 0.3) },
  { name: 'L2_ROBUST_TURN', kind: 'pairL2', params: interpL2Params(0.65, 0.75, 0.3, 0.3) },
  { name: 'L2_NOINHW', kind: 'pairL2', params: interpL2Params(0.4, 0.7, 0.3, 0.3), inheritW: false, inheritBeta: true },

  // Strongest Class F challengers (<= 3 * O(D^2), B <= 256)
  {
    name: 'SHARE3_A', kind: 'shareL2', etaMix: 0.25, share: 0.02, lossClip: 3.0,
    experts: [
      regimeL2Params({ supportMode: 0, noiseMode: 0, changeMode: 0, sparseMode: 0 }), // persist+clean+ultra
      regimeL2Params({ supportMode: 1, noiseMode: 1, changeMode: 0, sparseMode: 0 }), // turnover+storm+ultra
      regimeL2Params({ supportMode: 0, noiseMode: 1, changeMode: 1, sparseMode: 1 }), // persist+storm+drift+broad
    ],
  },
  {
    name: 'SHARE3_B', kind: 'shareL2', etaMix: 0.25, share: 0.02, lossClip: 3.0,
    experts: [
      interpL2Params(0.0, 0.0, 0.2, 0.0), // persist+clean+ultra
      interpL2Params(1.0, 0.5, 0.3, 0.2), // turnover+mid
      interpL2Params(0.2, 1.0, 0.6, 0.9), // storm+broad
    ],
  },
  { name: 'OPENLOOP_CF', kind: 'openLoopClassF' },

  // Depth 3: ORACLE3 and initial learned META3 + SHAM
  { name: 'ORACLE3', kind: 'pairL2', params: interpL2Params(0.5, 0.5, 0.5, 0.5), isOracle: true },
  { name: 'META3', kind: 'meta3Pair', l3: 'learn', c: 1.5, eta3: 0.7, blockLen: 28, lossClip: 3.5 },
  { name: 'SHAM_RAND', kind: 'meta3Pair', l3: 'randsign', c: 1.5, eta3: 0.7, blockLen: 28, lossClip: 3.5 },
];

const nWorkers = Math.min(8, Number(process.argv[2] || 8));
const smoke = process.argv.includes('--smoke');
const useSeeds = smoke ? SEEDS.slice(0, 2) : SEEDS;
const jobs = [];
for (const arm of ARMS) for (const seed of useSeeds) jobs.push({ seed, arm });

console.log(`Running ${jobs.length} jobs (${ARMS.length} arms x ${useSeeds.length} seeds) on ${nWorkers} workers...`);
const tStart = Date.now();
const workers = Array.from({ length: nWorkers }, () => new Worker(WORKER_PATH));
const results = [];
let next = 0, done = 0;

await new Promise((resolve, reject) => {
  const dispatch = w => {
    if (next >= jobs.length) return;
    const jobId = next++;
    w.postMessage({ jobId, ...jobs[jobId] });
  };
  for (const w of workers) {
    w.on('message', ({ res }) => {
      results.push(res);
      done++;
      if (done % 40 === 0 || done === jobs.length) {
        console.log(`  ${done}/${jobs.length} done (${((Date.now() - tStart) / 1000).toFixed(1)}s)`);
      }
      if (done === jobs.length) {
        for (const ww of workers) ww.terminate();
        resolve();
      } else dispatch(w);
    });
    w.on('error', reject);
    dispatch(w);
  }
});

if (!smoke) {
  fs.writeFileSync(path.join(__dir, 'screen1.json'), JSON.stringify({ seeds: useSeeds, results }, null, 2));
}

// Aggregate by arm
const byArm = new Map();
for (const r of results) {
  if (!byArm.has(r.armName)) byArm.set(r.armName, new Map());
  byArm.get(r.armName).set(r.seed, r);
}

console.log('\nArm                |  Pop   | Skill  | Ext | ms');
console.log('-------------------|--------|--------|-----|-----');
for (const arm of ARMS) {
  const m = byArm.get(arm.name);
  const pops = useSeeds.map(s => m.get(s).pop);
  const skills = useSeeds.map(s => m.get(s).skill);
  const ext = useSeeds.filter(s => m.get(s).extinct).length;
  const ms = mean(useSeeds.map(s => m.get(s).ms));
  console.log(`${arm.name.padEnd(18)} | ${mean(pops).toFixed(2).padStart(6)} | ${mean(skills).toFixed(3).padStart(6)} | ${String(ext).padStart(3)} | ${ms.toFixed(0).padStart(4)}`);
}

// Compute key contrasts
const bestOf = names => {
  let best = names[0], bv = -Infinity;
  for (const n of names) {
    const v = mean(useSeeds.map(s => byArm.get(n).get(s).pop));
    if (v > bv) { bv = v; best = n; }
  }
  return best;
};
const d1Names = ARMS.filter(a => (a.kind === 'pairLMS' || a.kind === 'pairDiagKal') && !a.isOracle).map(a => a.name);
const l2Names = ARMS.filter(a => a.kind === 'pairL2' && !a.isOracle).map(a => a.name);
const cfNames = [...l2Names, 'SHARE3_A', 'SHARE3_B', 'OPENLOOP_CF'];

const bestD1 = bestOf(d1Names);
const bestL2 = bestOf(l2Names);
const bestCF = bestOf(cfNames);

const contrast = (aName, bName) => useSeeds.map(s => byArm.get(aName).get(s).pop - byArm.get(bName).get(s).pop);
const show = (label, diffs) => {
  const pos = diffs.filter(x => x > 0).length;
  const p = useSeeds.length >= 4 ? signflip(diffs) : NaN;
  console.log(`${label.padEnd(36)}: mean ${mean(diffs) >= 0 ? '+' : ''}${mean(diffs).toFixed(2)} (${pos}/${useSeeds.length}, p=${p.toPrecision(3)})`);
};

console.log(`\nBest Depth-1 (FIXED): ${bestD1}`);
console.log(`Best fixed L2       : ${bestL2}`);
console.log(`Best Class F        : ${bestCF}`);
show('L2 - FIXED (headroom)', contrast(bestL2, bestD1));
show('ORACLE1 - FIXED (mediation)', contrast('ORACLE1', bestD1));
show('ORACLE3 - bestL2 (L3 room)', contrast('ORACLE3', bestL2));
show('ORACLE3 - bestCF', contrast('ORACLE3', bestCF));
const d4_o3_l2 = useSeeds.map(s => 2 * byArm.get('ORACLE3').get(s).pop - 3 * byArm.get(bestL2).get(s).pop + byArm.get(bestD1).get(s).pop);
const d4_o3_cf = useSeeds.map(s => 2 * byArm.get('ORACLE3').get(s).pop - 3 * byArm.get(bestCF).get(s).pop + byArm.get(bestD1).get(s).pop);
const d4_m3_cf = useSeeds.map(s => 2 * byArm.get('META3').get(s).pop - 3 * byArm.get(bestCF).get(s).pop + byArm.get(bestD1).get(s).pop);
show('d4(ORACLE3 vs bestL2)', d4_o3_l2);
show('d4(ORACLE3 vs bestCF)', d4_o3_cf);
show('d4(META3   vs bestCF)', d4_m3_cf);
show('META3 - SHAM_RAND', contrast('META3', 'SHAM_RAND'));
