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
  const cfg = { toxin: 0.72 }; // check if NOLEARN survives while preserving huge L3 gain

  const ARMS = [
    { name: 'NOLEARN', kind: 'nolearn' },
    { name: 'FIX_030', kind: 'fixed', alpha: 0.030 },
    { name: 'FIX_050', kind: 'fixed', alpha: 0.050 },
    { name: 'AUTO_015', kind: 'l2', l2: 'autostep', mu: 0.15, inheritL2: true },
    { name: 'AUTO_025', kind: 'l2', l2: 'autostep', mu: 0.25, inheritL2: true },
    { name: 'DIR_Q_DIAG', kind: 'direct_q_diag', mu: 0.20, qGain: 0.5, usesQ: true, rawPred: true, l3: 'oracle', inheritL2: true },
    { name: 'DIR_Q_MIX5', kind: 'direct_q_rawl2', mu: 0.20, mixQ: 0.5, usesQ: true, rawPred: true, l3: 'oracle', inheritL2: true },
    { name: 'EVO_E0', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, l3: 'evor', pm: 0 },
    { name: 'EVO_J25', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, l3: 'evor', pm: 0.25, nRot: 4, angScale: 0.4 },
    { name: 'EVO_SV0', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, l3: 'evor', pm: 0, standing: true },
    { name: 'EVO_SV25', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, l3: 'evor', pm: 0.25, standing: true, nRot: 4, angScale: 0.4 },
    { name: 'SHAM_ICA', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'sham', l3Rule: 'l2ica', eta3: 0.60, u2Min: 2.0 },
    { name: 'RST_ICA6', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: false, l3: 'reset', l3Rule: 'l2ica', eta3: 0.60, u2Min: 2.0 },
    { name: 'M3_ICA_3', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'l2ica', eta3: 0.30, u2Min: 2.0 },
    { name: 'M3_ICA_6', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'l2ica', eta3: 0.60, u2Min: 2.0 },
    { name: 'M3_ICA_12', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'l2ica', eta3: 1.20, u2Min: 2.0 },
    { name: 'RST_L2U1', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: false, l3: 'reset', l3Rule: 'l2u', eta3: 0.12, u2Min: 2.0 },
    { name: 'M3_L2U_12', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'l2u', eta3: 0.12, u2Min: 2.0 },
    { name: 'M3_L2U_25', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'l2u', eta3: 0.25, u2Min: 2.0 },
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
    console.log(`=== Exp 12: L3 Rule & Toxin Tuning (toxin=0.72, seeds 3001-3008, ${((Date.now() - t0) / 1000).toFixed(1)}s) ===`);
    const byArm = new Map();
    for (const arm of ARMS) byArm.set(arm.name, SEEDS.map(s => rows.find(r => r.armName === arm.name && r.seed === s)));

    const bestFixName = mean(byArm.get('FIX_050').map(r => r.pop)) >= mean(byArm.get('FIX_030').map(r => r.pop)) ? 'FIX_050' : 'FIX_030';
    const bestFix = byArm.get(bestFixName).map(r => r.pop);
    const chalNames = ['AUTO_015', 'AUTO_025', 'DIR_Q_DIAG', 'DIR_Q_MIX5'];
    const bestL2Name = chalNames.reduce((a, b) => mean(byArm.get(a).map(r => r.pop)) >= mean(byArm.get(b).map(r => r.pop)) ? a : b);
    const bestL2 = byArm.get(bestL2Name).map(r => r.pop);

    for (const arm of ARMS) {
      const rs = byArm.get(arm.name);
      const pop = mean(rs.map(r => r.pop));
      const sk = mean(rs.map(r => r.skill));
      const al = mean(rs.map(r => r.align));
      const ext = rs.filter(r => r.extinct).length;
      const g = pop - mean(bestFix);
      console.log(`  ${arm.name.padEnd(11)} pop=${pop.toFixed(2).padStart(6)}  gain=${(g >= 0 ? '+' : '') + g.toFixed(2).padStart(5)}  skill=${sk.toFixed(3)}  align=${al.toFixed(3)}  ext=${ext}`);
    }
    console.log(`\nBest FIXED: ${bestFixName} (${mean(bestFix).toFixed(2)}) | Best L2: ${bestL2Name} (${mean(bestL2).toFixed(2)}, gain=+${(mean(bestL2) - mean(bestFix)).toFixed(2)})`);
    for (const n of ['SHAM_ICA', 'RST_ICA6', 'M3_ICA_3', 'M3_ICA_6', 'M3_ICA_12', 'RST_L2U1', 'M3_L2U_12', 'M3_L2U_25', 'ORACLE3']) {
      const arr = byArm.get(n).map(r => r.pop);
      const d4 = SEEDS.map((_, i) => (arr[i] - bestFix[i]) - 1.5 * (bestL2[i] - bestFix[i]));
      const ratio = (mean(arr) - mean(bestFix)) / (mean(bestL2) - mean(bestFix));
      const pos = d4.filter(x => x > 0).length;
      const p = signflip(d4);
      console.log(`  ${n.padEnd(10)} vs ${bestL2Name.padEnd(10)}: d4=${mean(d4).toFixed(2)}  ratio=${ratio.toFixed(2)}x  signs=${pos}/${SEEDS.length}  p=${p.toExponential(2)}`);
    }
  });
}
