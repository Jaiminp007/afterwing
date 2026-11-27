// Exp 4: Full 16-seed (2401-2416) test of M=11 (complete 1-factorization of K_12, 100% pair coverage,
// zero menu bias!) with fixed exact Meta-Credit (pred_r hit), Pure Bandit, MIX_SHADOW, PAIRX, TRANSX,
// SCALAR grid, EVOR_SV, SHAM3_DET, SHAM3_PERM, META3_RESET, ORACLE3.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { runOne } from './l4b_credit_v2.mjs';
import { signflip, mean } from '../../docs/paper/stats.mjs';

const SEEDS = Array.from({ length: 16 }, (_, i) => 2401 + i);

const WORLD_CFG = { M: 11, eraEvery: 3600, macroEvery: 1200, subEvery: 300 };

const ARMS = {
  FIXED:          { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
  SCALAR_030:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .030, alphaBoost: 15 } },
  SCALAR_060:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .060, alphaBoost: 20 } },
  SCALAR_120:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .120, alphaBoost: 30 } },
  SCALAR_200:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .200, alphaBoost: 40 } },
  PAIRX_005:      { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .120, alphaBoost: 30, gDecay: .005, gFloor: .15 } },
  PAIRX_030:      { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .120, alphaBoost: 30, gDecay: .030, gFloor: .15 } },
  ANTIPAIRX:      { spec: { l1: true, kind: 'antipairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .120, alphaBoost: 30, gDecay: .015, gSuppress: 10 } },
  TRANSX_003:     { spec: { l1: true, kind: 'transx', usesL2: true, usesT: true, inheritLast: true }, cfg: { alphaDecay: .060, tDecay: .003 } },
  TRANSX_015:     { spec: { l1: true, kind: 'transx', usesL2: true, usesT: true, inheritLast: true }, cfg: { alphaDecay: .060, tDecay: .015 } },
  FIXED_M0:       { spec: { l1: true, kind: 'fixed_rule', fixedRule: 0, usesL2: true }, cfg: {} },
  MIX11:          { spec: { l1: true, kind: 'mix', usesL2: true }, cfg: {} },
  MIX_SHADOW:     { spec: { l1: true, kind: 'mix_shadow', usesL2: true }, cfg: {} },
  EVOR_SV10:      { spec: { l1: true, kind: 'evor', l3: 'evor', standing: true, pm: .10, usesL2: true }, cfg: {} },
  EVOR_SV25:      { spec: { l1: true, kind: 'evor', l3: 'evor', standing: true, pm: .25, usesL2: true }, cfg: {} },
  EVOR_SV50:      { spec: { l1: true, kind: 'evor', l3: 'evor', standing: true, pm: .50, usesL2: true }, cfg: {} },
  META3_MC:       { spec: { l1: true, kind: 'mc', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: {} },
  META3_MC_RESET: { spec: { l1: true, kind: 'mc', l3: 'metacredit', resetU: true, usesL2: true, inheritLast: true }, cfg: {} },
  SHAM3_MC:       { spec: { l1: true, kind: 'sham', l3: 'sham_mc', usesL2: true, inheritLast: true }, cfg: {} },
  SHAM3_MC_DET:   { spec: { l1: true, kind: 'sham', l3: 'sham_mc_det', usesL2: true, inheritLast: true }, cfg: {} },
  META3_BANDIT:   { spec: { l1: true, kind: 'bandit', l3: 'bandit', usesL2: true }, cfg: {} },
  SHAM3_BANDIT:   { spec: { l1: true, kind: 'sham', l3: 'sham_bandit', usesL2: true }, cfg: {} },
  ORACLE3:        { spec: { l1: true, kind: 'oracle', usesL2: true }, cfg: {} },
};

if (!isMainThread) {
  const { seed, armName } = workerData;
  const a = ARMS[armName];
  const r = runOne(seed, a.spec, { ...WORLD_CFG, ...a.cfg });
  parentPort.postMessage({ seed, armName, ...r });
} else {
  const t0 = Date.now();
  const jobs = [];
  for (const seed of SEEDS) for (const armName of Object.keys(ARMS)) jobs.push({ seed, armName });
  const results = {};
  let next = 0;
  await Promise.all(Array.from({ length: 10 }, () => new Promise((resolve, reject) => {
    const go = () => {
      if (next >= jobs.length) return resolve();
      const job = jobs[next++];
      const w = new Worker(new URL(import.meta.url), { workerData: job });
      w.once('message', m => { (results[m.armName] ??= {})[m.seed] = m; go(); });
      w.once('error', reject);
    };
    go();
  })));
  console.log(`=== Exp 4: Complete 1-Factorization K_12 (M=11, era=3600, mac=1200, sub=300, n=16, ${((Date.now()-t0)/1000).toFixed(1)}s) ===`);
  const P = a => SEEDS.map(s => results[a][s].popSum);
  for (const a of Object.keys(ARMS)) {
    const pop = mean(P(a)) / 100;
    const acc = mean(SEEDS.map(s => results[a][s].ruleAcc));
    const vals = mean(SEEDS.map(s => results[a][s].vals));
    console.log(`${a.padEnd(15)} pop=${pop.toFixed(2)}  ruleAcc=${(acc * 100).toFixed(1).padStart(5)}%  vals=${vals.toFixed(0)}`);
  }

  const l2Cands = ['SCALAR_030', 'SCALAR_060', 'SCALAR_120', 'SCALAR_200', 'PAIRX_005', 'PAIRX_030', 'ANTIPAIRX', 'TRANSX_003', 'TRANSX_015', 'FIXED_M0', 'MIX11', 'MIX_SHADOW'];
  const l2Best = l2Cands.reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
  const evorBest = ['EVOR_SV10', 'EVOR_SV25', 'EVOR_SV50'].reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
  console.log(`\nBest L2 challenger (of 12 incl. PAIRX, ANTI-PAIRX, TRANSX, MIX_SHADOW): ${l2Best} (${(mean(P(l2Best)) / 100).toFixed(2)})`);
  console.log(`Best EVOR3 challenger: ${evorBest} (${(mean(P(evorBest)) / 100).toFixed(2)})`);

  const report = (label, aName, bName) => {
    const diff = SEEDS.map((_, i) => P(aName)[i] - P(bName)[i]);
    const m = mean(diff) / 100, wins = diff.filter(x => x > 0).length, p = signflip(diff, 1);
    console.log(`${label.padEnd(36)} ${m >= 0 ? '+' : ''}${m.toFixed(2)}  ${wins}/16  p=${p.toExponential(2)}`);
  };
  const reportD4 = (label, m3Name, l2Name) => {
    const p3 = P(m3Name), pL = P(l2Name), pF = P('FIXED');
    const d4 = SEEDS.map((_, i) => 2 * p3[i] - 3 * pL[i] + pF[i]);
    const ratio = (mean(p3) - mean(pF)) / (mean(pL) - mean(pF));
    const wins = d4.filter(x => x > 0).length, p = signflip(d4, 1);
    console.log(`${label.padEnd(36)} d4=${(mean(d4) / 200).toFixed(2)}  ratio=${ratio.toFixed(2)}x  ${wins}/16  p=${p.toExponential(2)}`);
  };

  console.log('\n--- Key contrasts ---');
  report(`L2best (${l2Best}) - FIXED`, l2Best, 'FIXED');
  reportD4(`ORACLE3 vs ${l2Best}`, 'ORACLE3', l2Best);
  reportD4(`META3_MC vs ${l2Best}`, 'META3_MC', l2Best);
  report(`META3_MC - ${l2Best}`, 'META3_MC', l2Best);
  report(`META3_MC - SHAM3_MC`, 'META3_MC', 'SHAM3_MC');
  report(`META3_MC - SHAM3_MC_DET`, 'META3_MC', 'SHAM3_MC_DET');
  report(`META3_MC - ${evorBest}`, 'META3_MC', evorBest);
  report(`META3_MC - META3_MC_RESET`, 'META3_MC', 'META3_MC_RESET');
  reportD4(`META3_BANDIT vs ${l2Best}`, 'META3_BANDIT', l2Best);
  report(`META3_BANDIT - SHAM3_BANDIT`, 'META3_BANDIT', 'SHAM3_BANDIT');
}
