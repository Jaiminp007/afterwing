import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import fs from 'node:fs';
import os from 'node:os';
import { runOne } from './l4d_world.mjs';
import { mean, signflip, bootCI } from '../../docs/paper/stats.mjs';

if (!isMainThread) {
  const results = workerData.tasks.map(t => runOne(t.seed, t.arm, t.cfg));
  parentPort.postMessage(results);
} else {
  const WORLD_CFG = Object.freeze({
    nBlocks: 2, blockSize: 8, nFast: 1, toxin: 0.78,
    blockEvery: 3400, modeEvery: 1000, driftEvery: 200, slowDriftEvery: 1000,
    ticks: 20000, every: 100, lateFrom: 10000,
  });

  const TUNE_SEEDS = Array.from({ length: 16 }, (_, i) => 3001 + i);
  const HELD_SEEDS = Array.from({ length: 16 }, (_, i) => 3017 + i);

  async function runBatch(arms, seeds) {
    const tasks = [];
    for (const arm of arms) for (const seed of seeds) tasks.push({ seed, arm, cfg: WORLD_CFG });
    const nWorkers = Math.min(os.cpus().length, tasks.length);
    const buckets = Array.from({ length: nWorkers }, () => []);
    tasks.forEach((t, i) => buckets[i % nWorkers].push(t));
    const chunks = await Promise.all(buckets.map(b => new Promise((res, rej) => {
      const w = new Worker(new URL(import.meta.url), { workerData: { tasks: b } });
      w.on('message', res);
      w.on('error', rej);
    })));
    const flat = chunks.flat();
    const byArm = new Map();
    for (const arm of arms) byArm.set(arm.name, seeds.map(s => flat.find(r => r.armName === arm.name && r.seed === s)));
    return byArm;
  }

  function pickBest(arms, byArm) {
    return arms.reduce((best, cur) =>
      mean(byArm.get(cur.name).map(r => r.pop)) > mean(byArm.get(best.name).map(r => r.pop)) ? cur : best
    );
  }

  function contrastStats(d) {
    const m = mean(d);
    const sd = Math.sqrt(d.reduce((a, x) => a + (x - m) ** 2, 0) / (d.length - 1));
    const pos = d.filter(x => x > 0).length;
    const p = signflip(d);
    const ci = bootCI(d);
    return { mean: m, sd, pos, n: d.length, p, ci };
  }

  (async () => {
    const t0 = Date.now();
    console.log('====================================================================');
    console.log('L4-D PROTOCOL: ORTHOGONAL-FRAME STEP-SIZE HIERARCHY');
    console.log('World cfg:', JSON.stringify(WORLD_CFG));
    console.log('====================================================================\n');

    // ---------------- STAGE 1A: TUNE FIXED + ALL SINGLE-LEVEL L2 CHALLENGERS (3001-3016) ----------------
    const FIXED_ARMS = [
      { name: 'FIX_015', kind: 'fixed', alpha: 0.015 },
      { name: 'FIX_030', kind: 'fixed', alpha: 0.030 },
      { name: 'FIX_040', kind: 'fixed', alpha: 0.040 },
      { name: 'FIX_050', kind: 'fixed', alpha: 0.050 },
      { name: 'FIX_065', kind: 'fixed', alpha: 0.065 },
      { name: 'FIX_080', kind: 'fixed', alpha: 0.080 },
    ];
    const IDBD_ARMS = [
      { name: 'IDBD_005', kind: 'l2', l2: 'idbd', theta: 0.005, inheritL2: true },
      { name: 'IDBD_015', kind: 'l2', l2: 'idbd', theta: 0.015, inheritL2: true },
      { name: 'IDBD_030', kind: 'l2', l2: 'idbd', theta: 0.030, inheritL2: true },
      { name: 'IDBD_060', kind: 'l2', l2: 'idbd', theta: 0.060, inheritL2: true },
    ];
    const AUTO_ARMS = [
      { name: 'AUTO_010', kind: 'l2', l2: 'autostep', mu: 0.10, inheritL2: true },
      { name: 'AUTO_018', kind: 'l2', l2: 'autostep', mu: 0.18, inheritL2: true },
      { name: 'AUTO_025', kind: 'l2', l2: 'autostep', mu: 0.25, inheritL2: true },
      { name: 'AUTO_035', kind: 'l2', l2: 'autostep', mu: 0.35, inheritL2: true },
      { name: 'AUTO_050', kind: 'l2', l2: 'autostep', mu: 0.50, inheritL2: true },
    ];
    const RMS_ARMS = [
      { name: 'RMS_010', kind: 'rms', rho: 0.05, eta: 0.10, inheritL2: true },
      { name: 'RMS_020', kind: 'rms', rho: 0.05, eta: 0.20, inheritL2: true },
      { name: 'SNR_025', kind: 'snr', rho: 0.08, eta: 0.25, inheritL2: true },
    ];
    const MAT_ARMS = [
      { name: 'COVW_02', kind: 'cov_w', a0: 0.010, a1: 0.25, rho: 0.02, inheritL2: true },
      { name: 'COVDW_005', kind: 'cov_dw', a0: 0.010, a1: 0.25, rho: 0.005, slowRho: 0.005, inheritL2: true },
      { name: 'COVDW_01', kind: 'cov_dw', a0: 0.010, a1: 0.25, rho: 0.01, slowRho: 0.005, inheritL2: true },
      { name: 'COVDW_03', kind: 'cov_dw', a0: 0.010, a1: 0.25, rho: 0.03, slowRho: 0.010, inheritL2: true },
      { name: 'COVDT_01', kind: 'cov_dtrace', a0: 0.010, a1: 0.25, rho: 0.01, inheritL2: true },
    ];
    const DIRECT_ARMS = [
      { name: 'DIR_Q_CONST', kind: 'meta3off', alpha: 0.050, usesQ: true, l3: 'oracle' },
      { name: 'DIR_Q_DIAG', kind: 'direct_q_diag', mu: 0.25, qGain: 0.5, usesQ: true, rawPred: true, l3: 'oracle', inheritL2: true },
      { name: 'DIR_Q_RAWL2', kind: 'direct_q_rawl2', mu: 0.25, mixQ: 0.5, usesQ: true, rawPred: true, l3: 'oracle', inheritL2: true },
      { name: 'DIR_DU_10', kind: 'direct_du', mu: 0.25, dGain: 1.0, inheritL2: true },
      { name: 'DIR_DU_25', kind: 'direct_du', mu: 0.25, dGain: 2.5, inheritL2: true },
      { name: 'DIR_DT_15', kind: 'direct_dtrace', mu: 0.25, dGain: 1.5, inheritL2: true },
    ];
    const STAGE1A_ARMS = [{ name: 'NOLEARN', kind: 'nolearn' }, ...FIXED_ARMS, ...IDBD_ARMS, ...AUTO_ARMS, ...RMS_ARMS, ...MAT_ARMS, ...DIRECT_ARMS];

    const t1a = Date.now();
    console.log(`=== STAGE 1A: TUNING FIXED & ALL L2 CHALLENGERS ON SEEDS 3001-3016 (${STAGE1A_ARMS.length} arms x 16 seeds) ===`);
    const s1a = await runBatch(STAGE1A_ARMS, TUNE_SEEDS);
    for (const arm of STAGE1A_ARMS) {
      const rs = s1a.get(arm.name);
      console.log(`  ${arm.name.padEnd(13)} pop=${mean(rs.map(r => r.pop)).toFixed(2).padStart(6)}  skill=${mean(rs.map(r => r.skill)).toFixed(3)}  ext=${rs.filter(r => r.extinct).length}`);
    }
    const FIXED_LOCK = pickBest(FIXED_ARMS, s1a);
    const IDBD_LOCK = pickBest(IDBD_ARMS, s1a);
    const AUTO_LOCK = pickBest(AUTO_ARMS, s1a);
    const RMS_LOCK = pickBest(RMS_ARMS, s1a);
    const MAT_LOCK = pickBest(MAT_ARMS, s1a);
    const DIRECT_LOCK = pickBest(DIRECT_ARMS, s1a);
    const ALL_L2_LOCKS = [IDBD_LOCK, AUTO_LOCK, RMS_LOCK, MAT_LOCK, DIRECT_LOCK];
    const L2BEST_LOCK = pickBest(ALL_L2_LOCKS, s1a);
    console.log(`Stage 1A done in ${((Date.now() - t1a) / 1000).toFixed(1)}s.`);
    console.log(`LOCKED FROM 1A: FIXED=${FIXED_LOCK.name}, IDBD=${IDBD_LOCK.name}, AUTO=${AUTO_LOCK.name}, RMS=${RMS_LOCK.name}, MAT=${MAT_LOCK.name}, DIRECT=${DIRECT_LOCK.name} => L2best=${L2BEST_LOCK.name}\n`);

    // ---------------- STAGE 1B: TUNE META3 & EVO-R3 ON LOCKED AUTO_LOCK.mu (3001-3016) ----------------
    const muLock = AUTO_LOCK.mu;
    const META3_ARMS = [
      { name: 'M3_BTH_12_Q5', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'du_both', eta3: 0.12, s2Min: 1.5, qHalf: 5.0 },
      { name: 'M3_BTH_18_Q8', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'du_both', eta3: 0.18, s2Min: 1.5, qHalf: 8.0 },
      { name: 'M3_BTH_24_Q10', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, inheritQ: true, l3: 'learn', l3Rule: 'du_both', eta3: 0.24, s2Min: 1.5, qHalf: 10.0 },
    ];
    const EVOR_ARMS = [
      { name: 'EVO_E0', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, l3: 'evor', pm: 0 },
      { name: 'EVO_J10', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, l3: 'evor', pm: 0.10, nRot: 4, angScale: 0.4 },
      { name: 'EVO_J25', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, l3: 'evor', pm: 0.25, nRot: 4, angScale: 0.4 },
      { name: 'EVO_J50', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, l3: 'evor', pm: 0.50, nRot: 4, angScale: 0.4 },
      { name: 'EVO_SV0', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, l3: 'evor', pm: 0, standing: true },
      { name: 'EVO_SV25', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, l3: 'evor', pm: 0.25, standing: true, nRot: 4, angScale: 0.4 },
      { name: 'EVO_SV50', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, l3: 'evor', pm: 0.50, standing: true, nRot: 4, angScale: 0.4 },
    ];
    const ORACLE_ARM = { name: 'ORACLE3', kind: 'l2', l2: 'autostep', mu: muLock, usesQ: true, inheritL2: true, inheritQ: true, l3: 'oracle' };
    const STAGE1B_ARMS = [...META3_ARMS, ...EVOR_ARMS, ORACLE_ARM];

    const t1b = Date.now();
    console.log(`=== STAGE 1B: TUNING META3 & EVO-R3 ON LOCKED mu=${muLock} (3001-3016, ${STAGE1B_ARMS.length} arms x 16 seeds) ===`);
    const s1b = await runBatch(STAGE1B_ARMS, TUNE_SEEDS);
    for (const arm of STAGE1B_ARMS) {
      const rs = s1b.get(arm.name);
      console.log(`  ${arm.name.padEnd(14)} pop=${mean(rs.map(r => r.pop)).toFixed(2).padStart(6)}  skill=${mean(rs.map(r => r.skill)).toFixed(3)}  align=${mean(rs.map(r => r.align)).toFixed(3)}  ext=${rs.filter(r => r.extinct).length}`);
    }
    const maxEvoE0Diff = Math.max(...TUNE_SEEDS.map((_, i) => Math.abs(s1b.get('EVO_E0')[i].pop - s1a.get(AUTO_LOCK.name)[i].pop)));
    console.log(`Lockstep check max|EVO_E0 - ${AUTO_LOCK.name}| = ${maxEvoE0Diff.toExponential(2)}`);
    const META3_LOCK = pickBest(META3_ARMS, s1b);
    const EVO_LOCK = pickBest(EVOR_ARMS, s1b);

    // Tuning summary check (oracle headroom + meta3 on tuning half)
    const tuneFix = s1a.get(FIXED_LOCK.name).map(r => r.pop);
    const tuneL2 = s1a.get(L2BEST_LOCK.name).map(r => r.pop);
    const tuneM3 = s1b.get(META3_LOCK.name).map(r => r.pop);
    const tuneOrc = s1b.get('ORACLE3').map(r => r.pop);
    const tuneD4M3 = TUNE_SEEDS.map((_, i) => (tuneM3[i] - tuneFix[i]) - 1.5 * (tuneL2[i] - tuneFix[i]));
    const tuneD4Orc = TUNE_SEEDS.map((_, i) => (tuneOrc[i] - tuneFix[i]) - 1.5 * (tuneL2[i] - tuneFix[i]));
    console.log(`Stage 1B done in ${((Date.now() - t1b) / 1000).toFixed(1)}s.`);
    console.log(`LOCKED FROM 1B: META3=${META3_LOCK.name}, EVO-R3=${EVO_LOCK.name}`);
    console.log(`Tuning d4(META3 vs ${L2BEST_LOCK.name}): mean=${mean(tuneD4M3).toFixed(2)}, ratio=${((mean(tuneM3) - mean(tuneFix)) / (mean(tuneL2) - mean(tuneFix))).toFixed(2)}x, signs=${tuneD4M3.filter(x => x > 0).length}/16, p=${signflip(tuneD4M3).toExponential(2)}`);
    console.log(`Tuning d4(ORACLE3 vs ${L2BEST_LOCK.name}): mean=${mean(tuneD4Orc).toFixed(2)}, ratio=${((mean(tuneOrc) - mean(tuneFix)) / (mean(tuneL2) - mean(tuneFix))).toFixed(2)}x, signs=${tuneD4Orc.filter(x => x > 0).length}/16, p=${signflip(tuneD4Orc).toExponential(2)}\n`);

    // ---------------- STAGE 2: HELD-OUT EVALUATION ON SEEDS 3017-3032 (RUN ONCE, NO TUNING AFTER!) ----------------
    const SHAM3_ARM = { ...META3_LOCK, name: 'SHAM3', l3: 'sham' };
    const RESET_ARM = { ...META3_LOCK, name: 'META3_RESET', l3: 'reset', inheritQ: false };
    const META3OFF_ARM = { name: 'META3OFF', kind: 'meta3off', alpha: FIXED_LOCK.alpha, usesQ: true, l3: 'oracle' };

    // Deduplicate L2 locks by arm name if needed (always distinct since different families)
    const STAGE2_ARMS = [
      { name: 'NOLEARN', kind: 'nolearn' },
      { ...FIXED_LOCK, name: 'FIXED_LOCK' },
      META3OFF_ARM,
      { ...IDBD_LOCK, name: 'IDBD_LOCK' },
      { ...AUTO_LOCK, name: 'AUTO_LOCK' },
      { ...RMS_LOCK, name: 'RMS_LOCK' },
      { ...MAT_LOCK, name: 'MAT_LOCK' },
      { ...DIRECT_LOCK, name: 'DIRECT_LOCK' },
      { ...META3_LOCK, name: 'META3_LOCK' },
      SHAM3_ARM,
      RESET_ARM,
      { ...EVO_LOCK, name: 'EVO_LOCK' },
      ORACLE_ARM,
    ];
    const l2BestKey = L2BEST_LOCK.name === IDBD_LOCK.name ? 'IDBD_LOCK'
      : L2BEST_LOCK.name === AUTO_LOCK.name ? 'AUTO_LOCK'
      : L2BEST_LOCK.name === RMS_LOCK.name ? 'RMS_LOCK'
      : L2BEST_LOCK.name === MAT_LOCK.name ? 'MAT_LOCK' : 'DIRECT_LOCK';

    const t2 = Date.now();
    console.log(`=== STAGE 2: HELD-OUT EVALUATION ON SEEDS 3017-3032 (RUN ONCE, ${STAGE2_ARMS.length} arms x 16 seeds) ===`);
    const s2 = await runBatch(STAGE2_ARMS, HELD_SEEDS);
    const hFix = s2.get('FIXED_LOCK').map(r => r.pop);
    const hFixMean = mean(hFix);
    for (const arm of STAGE2_ARMS) {
      const rs = s2.get(arm.name);
      const pop = mean(rs.map(r => r.pop)), g = pop - hFixMean;
      console.log(`  ${arm.name.padEnd(13)} pop=${pop.toFixed(2).padStart(6)}  gain=${(g >= 0 ? '+' : '') + g.toFixed(2).padStart(6)}  skill=${mean(rs.map(r => r.skill)).toFixed(3)}  align=${mean(rs.map(r => r.align)).toFixed(3)}  ext=${rs.filter(r => r.extinct).length}`);
    }

    const hOff = s2.get('META3OFF').map(r => r.pop);
    const hL2 = s2.get(l2BestKey).map(r => r.pop);
    const hM3 = s2.get('META3_LOCK').map(r => r.pop);
    const hSham = s2.get('SHAM3').map(r => r.pop);
    const hReset = s2.get('META3_RESET').map(r => r.pop);
    const hEvo = s2.get('EVO_LOCK').map(r => r.pop);
    const hOrc = s2.get('ORACLE3').map(r => r.pop);

    const maxP01Diff = Math.max(...HELD_SEEDS.map((_, i) => Math.abs(hOff[i] - hFix[i])));
    console.log(`\nHeld-out factorial P01 invariance max|META3OFF - FIXED_LOCK| = ${maxP01Diff.toExponential(2)}`);
    console.log(`Locked L2best = ${L2BEST_LOCK.name} (${l2BestKey})`);

    const printContrast = (label, arr, extra = '') => {
      const st = contrastStats(arr);
      console.log(`  ${label.padEnd(36)} mean=${(st.mean >= 0 ? '+' : '') + st.mean.toFixed(2)}  CI=[${st.ci[0].toFixed(2)}, ${st.ci[1].toFixed(2)}]  signs=${st.pos}/${st.n}  p=${st.p.toExponential(2)}${extra}`);
      return st;
    };

    console.log('\n--- HELD-OUT CONTRASTS (seeds 3017-3032, n=16, exact one-sided sign-flip p) ---');
    const gL2 = HELD_SEEDS.map((_, i) => hL2[i] - hFix[i]);
    const gM3 = HELD_SEEDS.map((_, i) => hM3[i] - hFix[i]);
    const gOrc = HELD_SEEDS.map((_, i) => hOrc[i] - hFix[i]);
    const d4Main = HELD_SEEDS.map((_, i) => (hM3[i] - hFix[i]) - 1.5 * (hL2[i] - hFix[i]));
    const f4Main = HELD_SEEDS.map((_, i) => (hM3[i] - hOff[i]) - 1.5 * (hL2[i] - hFix[i]));
    const d4Orc = HELD_SEEDS.map((_, i) => (hOrc[i] - hFix[i]) - 1.5 * (hL2[i] - hFix[i]));

    const ratioPop = mean(gM3) / mean(gL2);
    const ratioOrc = mean(gOrc) / mean(gL2);
    const skFix = mean(s2.get('FIXED_LOCK').map(r => r.skill));
    const skL2 = mean(s2.get(l2BestKey).map(r => r.skill));
    const skM3 = mean(s2.get('META3_LOCK').map(r => r.skill));
    const ratioSkill = (skM3 - skFix) / (skL2 - skFix);

    printContrast(`L2best (${L2BEST_LOCK.name}) - FIXED`, gL2);
    printContrast(`META3 (${META3_LOCK.name}) - FIXED`, gM3);
    const stD4 = printContrast(`d4(META3 vs ${L2BEST_LOCK.name})`, d4Main, `  ratio=${ratioPop.toFixed(2)}x (skill=${ratioSkill.toFixed(2)}x)`);
    printContrast(`matched f4 (P10=${L2BEST_LOCK.name})`, f4Main);
    printContrast(`d4(ORACLE3 vs ${L2BEST_LOCK.name})`, d4Orc, `  ratio=${ratioOrc.toFixed(2)}x`);
    printContrast('META3 - L2best', HELD_SEEDS.map((_, i) => hM3[i] - hL2[i]));
    printContrast('META3 - SHAM3', HELD_SEEDS.map((_, i) => hM3[i] - hSham[i]));
    printContrast(`META3 - EVO_LOCK (${EVO_LOCK.name})`, HELD_SEEDS.map((_, i) => hM3[i] - hEvo[i]));
    printContrast('META3 - META3_RESET', HELD_SEEDS.map((_, i) => hM3[i] - hReset[i]));

    // Also check d4 against EVERY individual L2 challenger family lock on held-out!
    console.log('\n--- HELD-OUT d4 VS EVERY INDIVIDUAL L2 CHALLENGER LOCK ---');
    for (const [k, orig] of [['IDBD_LOCK', IDBD_LOCK], ['AUTO_LOCK', AUTO_LOCK], ['RMS_LOCK', RMS_LOCK], ['MAT_LOCK', MAT_LOCK], ['DIRECT_LOCK', DIRECT_LOCK]]) {
      const hC = s2.get(k).map(r => r.pop);
      const d4c = HELD_SEEDS.map((_, i) => (hM3[i] - hFix[i]) - 1.5 * (hC[i] - hFix[i]));
      const rC = (mean(hM3) - hFixMean) / (mean(hC) - hFixMean);
      printContrast(`d4(META3 vs ${orig.name})`, d4c, `  ratio=${rC.toFixed(2)}x`);
    }

    // Estimate 48-seed fresh-final pass probability via normal approximation on held-out d4 mean & sd
    const z48 = (stD4.mean / (stD4.sd / Math.sqrt(48))) - 2.3263; // one-sided alpha=0.01 critical z=2.3263
    const normCdf = x => 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp(-2 * x * x / Math.PI)));
    console.log(`\nFresh 48-seed power estimate for d4>0, p<0.01 (from held-out mean=${stD4.mean.toFixed(2)}, sd=${stD4.sd.toFixed(2)}): ~${(normCdf(z48) * 100).toFixed(1)}%`);
    console.log(`Total runtime: ${((Date.now() - t0) / 1000).toFixed(1)}s (Stage 2: ${((Date.now() - t2) / 1000).toFixed(1)}s)`);

    // Save raw JSON artifact for complete auditability
    const dump = {
      worldCfg: WORLD_CFG,
      tuneSeeds: TUNE_SEEDS,
      heldSeeds: HELD_SEEDS,
      locks: {
        FIXED_LOCK: FIXED_LOCK.name,
        IDBD_LOCK: IDBD_LOCK.name,
        AUTO_LOCK: AUTO_LOCK.name,
        RMS_LOCK: RMS_LOCK.name,
        MAT_LOCK: MAT_LOCK.name,
        DIRECT_LOCK: DIRECT_LOCK.name,
        L2BEST_LOCK: L2BEST_LOCK.name,
        META3_LOCK: META3_LOCK.name,
        EVO_LOCK: EVO_LOCK.name,
      },
      stage1a: Object.fromEntries([...s1a.entries()]),
      stage1b: Object.fromEntries([...s1b.entries()]),
      stage2: Object.fromEntries([...s2.entries()]),
    };
    fs.writeFileSync('scratch/advice-gemini-l4d/l4d_results.json', JSON.stringify(dump, null, 2));
    console.log('Saved raw artifact: scratch/advice-gemini-l4d/l4d_results.json');
  })();
}
