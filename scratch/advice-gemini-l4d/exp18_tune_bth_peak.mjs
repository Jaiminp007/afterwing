import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import os from 'node:os';
import { runOne } from './l4d_world.mjs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

if (!isMainThread) {
  const results = workerData.tasks.map(t => runOne(t.seed, t.arm, t.cfg));
  parentPort.postMessage(results);
} else {
  const t0 = Date.now();
  const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008];
  const cfg = { nBlocks: 2, blockSize: 8, nFast: 1, toxin: 0.78, blockEvery: 4000, modeEvery: 1200, driftEvery: 220 };

  const ARMS = [
    { name: 'FIX_050', kind: 'fixed', alpha: 0.050 },
    { name: 'AUTO_025', kind: 'l2', l2: 'autostep', mu: 0.25, inheritL2: true },
    { name: 'BTH_11', kind: 'l2', l2: 'autostep', mu: 0.25, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'du_both', eta3: 0.11, s2Min: 1.5, slowScale: 0.5 },
    { name: 'BTH_16', kind: 'l2', l2: 'autostep', mu: 0.25, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'du_both', eta3: 0.16, s2Min: 1.5, slowScale: 0.5 },
    { name: 'BTH_22', kind: 'l2', l2: 'autostep', mu: 0.25, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'du_both', eta3: 0.22, s2Min: 1.5, slowScale: 0.5 },
    { name: 'BTH1_11', kind: 'l2', l2: 'autostep', mu: 0.25, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'du_both', eta3: 0.11, s2Min: 1.5, slowScale: 1.0 },
    { name: 'BTH1_16', kind: 'l2', l2: 'autostep', mu: 0.25, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'du_both', eta3: 0.16, s2Min: 1.5, slowScale: 1.0 },
    { name: 'BTH1_16_R', kind: 'l2', l2: 'autostep', mu: 0.25, usesQ: true, inheritL2: true, inheritQ: false, l3: 'reset', l3Rule: 'du_both', eta3: 0.16, s2Min: 1.5, slowScale: 1.0 },
  ];

  const tasks = [];
  for (const arm of ARMS) for (const seed of SEEDS) tasks.push({ seed, arm, cfg });
  const nWorkers = Math.min(os.cpus().length, tasks.length);
  const buckets = Array.from({ length: nWorkers }, () => []);
  tasks.forEach((t, i) => buckets[i % nWorkers].push(t));

  Promise.all(buckets.map(b => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { tasks: b } });
    w.on('message', res);
    w.on('error', rej);
  }))).then(chunks => {
    const rows = chunks.flat();
    console.log(`=== Exp 18: Peak eta3 & slowScale Tuning (2x8, seeds 3001-3008, ${((Date.now() - t0) / 1000).toFixed(1)}s) ===`);
    const byArm = new Map();
    for (const arm of ARMS) byArm.set(arm.name, SEEDS.map(s => rows.find(r => r.armName === arm.name && r.seed === s)));
    const fix = byArm.get('FIX_050').map(r => r.pop);
    const l2 = byArm.get('AUTO_025').map(r => r.pop);
    for (const arm of ARMS) {
      const rs = byArm.get(arm.name);
      const pop = mean(rs.map(r => r.pop)), sk = mean(rs.map(r => r.skill)), al = mean(rs.map(r => r.align));
      const g = pop - mean(fix);
      console.log(`  ${arm.name.padEnd(10)} pop=${pop.toFixed(2).padStart(6)}  gain=${(g >= 0 ? '+' : '') + g.toFixed(2).padStart(5)}  skill=${sk.toFixed(3)}  align=${al.toFixed(3)}`);
    }
    console.log('');
    for (const n of ['BTH_11', 'BTH_16', 'BTH_22', 'BTH1_11', 'BTH1_16', 'BTH1_16_R']) {
      const arr = byArm.get(n).map(r => r.pop);
      const d4 = SEEDS.map((_, i) => (arr[i] - fix[i]) - 1.5 * (l2[i] - fix[i]));
      const ratio = (mean(arr) - mean(fix)) / (mean(l2) - mean(fix));
      console.log(`  ${n.padEnd(10)} vs AUTO_025: d4=${mean(d4).toFixed(2)}  ratio=${ratio.toFixed(2)}x  signs=${d4.filter(x => x > 0).length}/${SEEDS.length}  p=${signflip(d4).toExponential(2)}`);
    }
  });
}
