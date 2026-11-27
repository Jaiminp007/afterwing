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
  const cfg = {}; // BASE_CFG: 2x10 blocks (D=20), blockEvery=4000, modeEvery=1200, driftEvery=220, toxin=0.90

  const ARMS = [
    { name: 'NOLEARN', kind: 'nolearn' },
    { name: 'FIX_015', kind: 'fixed', alpha: 0.015 },
    { name: 'FIX_030', kind: 'fixed', alpha: 0.030 },
    { name: 'FIX_050', kind: 'fixed', alpha: 0.050 },
    { name: 'FIX_080', kind: 'fixed', alpha: 0.080 },
    { name: 'META3OFF_050', kind: 'meta3off', alpha: 0.050, usesQ: true, l3: 'oracle' },
    { name: 'IDBD_010', kind: 'l2', l2: 'idbd', theta: 0.010, inheritL2: true },
    { name: 'IDBD_030', kind: 'l2', l2: 'idbd', theta: 0.030, inheritL2: true },
    { name: 'AUTO_010', kind: 'l2', l2: 'autostep', mu: 0.10, inheritL2: true },
    { name: 'AUTO_020', kind: 'l2', l2: 'autostep', mu: 0.20, inheritL2: true },
    { name: 'AUTO_035', kind: 'l2', l2: 'autostep', mu: 0.35, inheritL2: true },
    { name: 'RMS_010', kind: 'rms', rho: 0.05, eta: 0.10, inheritL2: true },
    { name: 'SNR_030', kind: 'snr', rho: 0.08, eta: 0.30, inheritL2: true },
    { name: 'COVW_02', kind: 'cov_w', a0: 0.008, a1: 0.25, rho: 0.02, inheritL2: true },
    { name: 'COVDW_01', kind: 'cov_dw', a0: 0.008, a1: 0.25, rho: 0.01, slowRho: 0.005, inheritL2: true },
    { name: 'COVDW_04', kind: 'cov_dw', a0: 0.008, a1: 0.25, rho: 0.04, slowRho: 0.005, inheritL2: true },
    { name: 'DIR_Q_RAWL2', kind: 'direct_q_rawl2', mu: 0.20, usesQ: true, rawPred: true, l3: 'oracle', inheritL2: true },
    { name: 'SHAM3_25', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'sham', eta3: 0.25 },
    { name: 'M3_RESET', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: false, l3: 'reset', eta3: 0.25 },
    { name: 'META3_15', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', eta3: 0.15 },
    { name: 'META3_30', kind: 'l2', l2: 'autostep', mu: 0.20, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', eta3: 0.30 },
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
    console.log(`=== Exp 11: L4-D Full Microverse Ecology Headroom (seeds 3001-3008, ${((Date.now() - t0) / 1000).toFixed(1)}s) ===`);
    const byArm = new Map();
    for (const arm of ARMS) byArm.set(arm.name, SEEDS.map(s => rows.find(r => r.armName === arm.name && r.seed === s)));

    const fixNames = ARMS.filter(a => a.kind === 'fixed').map(a => a.name);
    const bestFixName = fixNames.reduce((a, b) => mean(byArm.get(a).map(r => r.pop)) >= mean(byArm.get(b).map(r => r.pop)) ? a : b);
    const bestFix = byArm.get(bestFixName).map(r => r.pop);

    const chalNames = ['IDBD_010', 'IDBD_030', 'AUTO_010', 'AUTO_020', 'AUTO_035', 'RMS_010', 'SNR_030', 'COVW_02', 'COVDW_01', 'COVDW_04', 'DIR_Q_RAWL2'];
    const bestL2Name = chalNames.reduce((a, b) => mean(byArm.get(a).map(r => r.pop)) >= mean(byArm.get(b).map(r => r.pop)) ? a : b);
    const bestL2 = byArm.get(bestL2Name).map(r => r.pop);

    for (const arm of ARMS) {
      const rs = byArm.get(arm.name);
      const pop = mean(rs.map(r => r.pop));
      const sk = mean(rs.map(r => r.skill));
      const al = mean(rs.map(r => r.align));
      const ext = rs.filter(r => r.extinct).length;
      const g = pop - mean(bestFix);
      console.log(`  ${arm.name.padEnd(13)} pop=${pop.toFixed(2).padStart(6)}  gain=${(g >= 0 ? '+' : '') + g.toFixed(2).padStart(5)}  skill=${sk.toFixed(3)}  align=${al.toFixed(3)}  ext=${ext}`);
    }

    // Lockstep check: META3OFF_050 vs FIX_050
    const maxDiff = Math.max(...SEEDS.map((_, i) => Math.abs(byArm.get('META3OFF_050')[i].pop - byArm.get('FIX_050')[i].pop)));
    console.log(`\nFactorial P01 invariance check max|META3OFF_050 - FIX_050| = ${maxDiff.toExponential(2)}`);
    console.log(`Best FIXED: ${bestFixName} (${mean(bestFix).toFixed(2)}) | Best Challenger: ${bestL2Name} (${mean(bestL2).toFixed(2)}, gain=+${(mean(bestL2) - mean(bestFix)).toFixed(2)})`);

    for (const n of ['SHAM3_25', 'M3_RESET', 'META3_15', 'META3_30', 'ORACLE3']) {
      const arr = byArm.get(n).map(r => r.pop);
      const d4 = SEEDS.map((_, i) => (arr[i] - bestFix[i]) - 1.5 * (bestL2[i] - bestFix[i]));
      const ratio = (mean(arr) - mean(bestFix)) / (mean(bestL2) - mean(bestFix));
      const pos = d4.filter(x => x > 0).length;
      const p = signflip(d4);
      console.log(`  ${n.padEnd(10)} vs ${bestL2Name.padEnd(11)}: d4=${mean(d4).toFixed(2)}  ratio=${ratio.toFixed(2)}x  signs=${pos}/${SEEDS.length}  p=${p.toExponential(2)}`);
    }
  });
}
