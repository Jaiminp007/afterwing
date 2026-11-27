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
  const cfg = { toxin: 0.78 }; // healthy NOLEARN > 0, strong taste-selection signal

  const ARMS = [
    { name: 'NOLEARN', kind: 'nolearn' },
    { name: 'FIX_050', kind: 'fixed', alpha: 0.050 },
    { name: 'AUTO_020', kind: 'l2', l2: 'autostep', mu: 0.20, inheritL2: true },
    { name: 'DIR_DT_10', kind: 'direct_dtrace', mu: 0.20, dGain: 1.0, inheritL2: true },
    { name: 'COV_DT_02', kind: 'cov_dtrace', a0: 0.015, a1: 0.20, rho: 0.02, inheritL2: true },
    { name: 'SHAM_DT', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'sham', l3Rule: 'dt_ica', eta3: 0.15 },
    { name: 'RST_DT', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: false, l3: 'reset', l3Rule: 'dt_ica', eta3: 0.15 },
    { name: 'M3_DT_08', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'dt_ica', eta3: 0.08 },
    { name: 'M3_DT_15', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'dt_ica', eta3: 0.15 },
    { name: 'M3_DT_30', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'dt_ica', eta3: 0.30 },
    { name: 'M3_DIR_08', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'dt_dir', eta3: 0.08 },
    { name: 'ORACLE3', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'oracle' },
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
    console.log(`=== Exp 14: DT_ICA Verification in Full Ecology (toxin=0.78, seeds 3001-3008, ${((Date.now() - t0) / 1000).toFixed(1)}s) ===`);
    const byArm = new Map();
    for (const arm of ARMS) byArm.set(arm.name, SEEDS.map(s => rows.find(r => r.armName === arm.name && r.seed === s)));
    const fix = byArm.get('FIX_050').map(r => r.pop);
    const chalNames = ['AUTO_020', 'DIR_DT_10', 'COV_DT_02'];
    const bestL2Name = chalNames.reduce((a, b) => mean(byArm.get(a).map(r => r.pop)) >= mean(byArm.get(b).map(r => r.pop)) ? a : b);
    const bestL2 = byArm.get(bestL2Name).map(r => r.pop);
    for (const arm of ARMS) {
      const rs = byArm.get(arm.name);
      const pop = mean(rs.map(r => r.pop)), sk = mean(rs.map(r => r.skill)), al = mean(rs.map(r => r.align)), ext = rs.filter(r => r.extinct).length;
      const g = pop - mean(fix);
      console.log(`  ${arm.name.padEnd(11)} pop=${pop.toFixed(2).padStart(6)}  gain=${(g >= 0 ? '+' : '') + g.toFixed(2).padStart(5)}  skill=${sk.toFixed(3)}  align=${al.toFixed(3)}  ext=${ext}`);
    }
    console.log(`\nBest L2: ${bestL2Name} (${mean(bestL2).toFixed(2)}, gain=+${(mean(bestL2) - mean(fix)).toFixed(2)})`);
    for (const n of ['SHAM_DT', 'RST_DT', 'M3_DT_08', 'M3_DT_15', 'M3_DT_30', 'M3_DIR_08', 'ORACLE3']) {
      const arr = byArm.get(n).map(r => r.pop);
      const d4 = SEEDS.map((_, i) => (arr[i] - fix[i]) - 1.5 * (bestL2[i] - fix[i]));
      const ratio = (mean(arr) - mean(fix)) / (mean(bestL2) - mean(fix));
      console.log(`  ${n.padEnd(10)} vs ${bestL2Name}: d4=${mean(d4).toFixed(2)}  ratio=${ratio.toFixed(2)}x  signs=${d4.filter(x => x > 0).length}/${SEEDS.length}  p=${signflip(d4).toExponential(2)}`);
    }
  });
}
