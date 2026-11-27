// Test the 3-regime switching world {0=PAIR_CYCLE, 2=HUB_SPOKE, 3=FRESH_DISJOINT}
// AND check solo FRESH_DISJOINT on seeds 2401-2416.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { runOne } from './l4b_v2.mjs';
import { signflip, mean } from '../../docs/paper/stats.mjs';

const SEEDS = Array.from({ length: 16 }, (_, i) => 2401 + i);

const WORLD_CFG = { regimes: [0, 2, 3], regimeEvery: 3600, subEvery: 300, repeatPairs: 3 };

const ARMS = {
  FIXED:         { spec: { l1: true, kind: 'deck', usesL2: false, usesG: false }, cfg: {} },
  SCALAR_010:    { spec: { l1: true, kind: 'scalar', usesL2: true, usesG: false }, cfg: { alphaDecay: .010, alphaBoost: 12 } },
  SCALAR_030:    { spec: { l1: true, kind: 'scalar', usesL2: true, usesG: false }, cfg: { alphaDecay: .030, alphaBoost: 15 } },
  SCALAR_060C:   { spec: { l1: true, kind: 'scalar', usesL2: true, usesG: false }, cfg: { onceVal: false, alphaDecay: .060, alphaBoost: 20 } },
  PAIRX_015:     { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .020, gDecay: .015, gFloor: .15 } },
  PAIRX_005:     { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .020, gDecay: .005, gFloor: .05 } },
  PAIRX_CONT:    { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { onceVal: false, alphaDecay: .060, alphaBoost: 20, gDecay: .015, gFloor: .15 } },
  R_REPEAT:      { spec: { l1: true, kind: 'fixed_rule', fixedRule: 0, usesL2: true, usesG: true }, cfg: {} },
  R_HUB:         { spec: { l1: true, kind: 'fixed_rule', fixedRule: 2, usesL2: true, usesG: true }, cfg: {} },
  R_FRESH:       { spec: { l1: true, kind: 'fixed_rule', fixedRule: 3, usesL2: true, usesG: true }, cfg: {} },
  MIX3:          { spec: { l1: true, kind: 'mix', usesL2: true, usesG: true }, cfg: {} },
  EVOR_SV25:     { spec: { l1: true, kind: 'evor', l3: 'evor', standing: true, pm: .25, usesL2: true, usesG: true }, cfg: {} },
  EVOR_SV10:     { spec: { l1: true, kind: 'evor', l3: 'evor', standing: true, pm: .10, usesL2: true, usesG: true }, cfg: {} },
  META3_BANDIT:  { spec: { l1: true, kind: 'bandit', l3: 'bandit', usesL2: true, usesG: true }, cfg: {} },
  SHAM3_BANDIT:  { spec: { l1: true, kind: 'sham', l3: 'sham_bandit', usesL2: true, usesG: true }, cfg: {} },
  META3_LOGSC:   { spec: { l1: true, kind: 'logscore', l3: 'logscore', usesL2: true, usesG: true }, cfg: {} },
  SHAM3_LOGSC:   { spec: { l1: true, kind: 'sham', l3: 'sham_logscore', usesL2: true, usesG: true }, cfg: {} },
  META3_LRESET:  { spec: { l1: true, kind: 'logscore', l3: 'logscore', resetU: true, usesL2: true, usesG: true }, cfg: {} },
  ORACLE3:       { spec: { l1: true, kind: 'oracle', usesL2: true, usesG: true }, cfg: {} },
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
  console.log(`=== Design 1 v2 ({PAIR_CYCLE, HUB_SPOKE, FRESH_DISJOINT}, reg=3600, sub=300, n=16, ${((Date.now()-t0)/1000).toFixed(1)}s) ===`);
  const P = a => SEEDS.map(s => results[a][s].popSum);
  for (const a of Object.keys(ARMS)) {
    const pop = mean(P(a)) / 100;
    const acc = mean(SEEDS.map(s => results[a][s].regimeAcc));
    const vals = mean(SEEDS.map(s => results[a][s].vals));
    console.log(`${a.padEnd(14)} pop=${pop.toFixed(2)}  regAcc=${(acc * 100).toFixed(1).padStart(5)}%  vals=${vals.toFixed(0)}`);
  }

  const l2Cands = ['SCALAR_010', 'SCALAR_030', 'SCALAR_060C', 'PAIRX_015', 'PAIRX_005', 'PAIRX_CONT', 'R_REPEAT', 'R_HUB', 'R_FRESH', 'MIX3'];
  const l2Best = l2Cands.reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
  console.log(`\nBest L2 challenger: ${l2Best} (${(mean(P(l2Best)) / 100).toFixed(2)})`);

  const report = (label, aName, bName) => {
    const diff = SEEDS.map((_, i) => P(aName)[i] - P(bName)[i]);
    const m = mean(diff) / 100, wins = diff.filter(x => x > 0).length, p = signflip(diff, 1);
    console.log(`${label.padEnd(32)} ${m >= 0 ? '+' : ''}${m.toFixed(2)}  ${wins}/16  p=${p.toExponential(2)}`);
  };
  const reportD4 = (label, m3Name, l2Name) => {
    const p3 = P(m3Name), pL = P(l2Name), pF = P('FIXED');
    const d4 = SEEDS.map((_, i) => 2 * p3[i] - 3 * pL[i] + pF[i]);
    const ratio = (mean(p3) - mean(pF)) / (mean(pL) - mean(pF));
    const wins = d4.filter(x => x > 0).length, p = signflip(d4, 1);
    console.log(`${label.padEnd(32)} d4=${(mean(d4) / 200).toFixed(2)}  ratio=${ratio.toFixed(2)}x  ${wins}/16  p=${p.toExponential(2)}`);
  };

  console.log('\n--- Key contrasts ---');
  report(`L2best (${l2Best}) - FIXED`, l2Best, 'FIXED');
  reportD4(`ORACLE3 vs ${l2Best}`, 'ORACLE3', l2Best);
  reportD4(`META3_BANDIT vs ${l2Best}`, 'META3_BANDIT', l2Best);
  report(`META3_BANDIT - SHAM3_BANDIT`, 'META3_BANDIT', 'SHAM3_BANDIT');
  report(`META3_BANDIT - EVOR_SV25`, 'META3_BANDIT', 'EVOR_SV25');
  reportD4(`META3_LOGSC vs ${l2Best}`, 'META3_LOGSC', l2Best);
  report(`META3_LOGSC - SHAM3_LOGSC`, 'META3_LOGSC', 'SHAM3_LOGSC');
  report(`META3_LOGSC - EVOR_SV25`, 'META3_LOGSC', 'EVOR_SV25');
  report(`META3_LOGSC - EVOR_SV10`, 'META3_LOGSC', 'EVOR_SV10');
  report(`META3_LOGSC - META3_LRESET`, 'META3_LOGSC', 'META3_LRESET');
}
