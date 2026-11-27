// Run 1: Headroom + initial comparison of Design 1 on exploration seeds 2401-2416 ONLY.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { runOne } from './l4b_world.mjs';
import { signflip, mean } from '../../docs/paper/stats.mjs';

const SEEDS = Array.from({ length: 16 }, (_, i) => 2401 + i);

const ARMS = {
  FIXED:        { spec: { l1: true, kind: 'deck', usesL2: false, usesG: false }, cfg: {} },
  SCALAR_015:   { spec: { l1: true, kind: 'scalar', usesL2: true, usesG: false }, cfg: { alphaDecay: .015, alphaBoost: 15 } },
  SCALAR_040:   { spec: { l1: true, kind: 'scalar', usesL2: true, usesG: false }, cfg: { alphaDecay: .040, alphaBoost: 20 } },
  SCALAR_CONT:  { spec: { l1: true, kind: 'scalar', usesL2: true, usesG: false }, cfg: { onceVal: false, alphaDecay: .06, alphaBoost: 20, alphaMax: 60 } },
  PAIRX_015:    { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .015, gDecay: .015, gFloor: .15 } },
  PAIRX_CONT:   { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { onceVal: false, alphaDecay: .06, alphaBoost: 20, alphaMax: 60, gDecay: .015, gFloor: .15 } },
  RULE_REPEAT:  { spec: { l1: true, kind: 'fixed_rule', fixedRule: 0, usesL2: true, usesG: true }, cfg: {} },
  RULE_SUBSET:  { spec: { l1: true, kind: 'fixed_rule', fixedRule: 1, usesL2: true, usesG: true }, cfg: {} },
  RULE_HUB:     { spec: { l1: true, kind: 'fixed_rule', fixedRule: 2, usesL2: true, usesG: true }, cfg: {} },
  MIX3:         { spec: { l1: true, kind: 'mix3', usesL2: true, usesG: true }, cfg: {} },
  EVOR_SV25:    { spec: { l1: true, kind: 'evor', l3: 'evor', standing: true, pm: .25, usesL2: true, usesG: true }, cfg: {} },
  META3_BANDIT: { spec: { l1: true, kind: 'bandit', l3: 'bandit', usesL2: true, usesG: true }, cfg: {} },
  SHAM3_BANDIT: { spec: { l1: true, kind: 'sham', l3: 'sham_bandit', usesL2: true, usesG: true }, cfg: {} },
  META3_LOGSC:  { spec: { l1: true, kind: 'logscore', l3: 'logscore', usesL2: true, usesG: true }, cfg: {} },
  SHAM3_LOGSC:  { spec: { l1: true, kind: 'sham', l3: 'sham_logscore', usesL2: true, usesG: true }, cfg: {} },
  ORACLE3:      { spec: { l1: true, kind: 'oracle', usesL2: true, usesG: true }, cfg: {} },
};

if (!isMainThread) {
  const { seed, armName } = workerData;
  const a = ARMS[armName];
  const r = runOne(seed, a.spec, a.cfg);
  parentPort.postMessage({ seed, armName, ...r });
} else {
  const jobs = [];
  for (const seed of SEEDS) for (const armName of Object.keys(ARMS)) jobs.push({ seed, armName });
  const results = {};
  let next = 0;
  const CONC = 10;
  await Promise.all(Array.from({ length: CONC }, () => new Promise((resolve, reject) => {
    const runNext = () => {
      if (next >= jobs.length) return resolve();
      const job = jobs[next++];
      const w = new Worker(new URL(import.meta.url), { workerData: job });
      w.once('message', msg => { (results[msg.armName] ??= {})[msg.seed] = msg; runNext(); });
      w.once('error', reject);
    };
    runNext();
  })));

  console.log('=== Design 1 Run 1 (seeds 2401-2416, n=16) ===');
  const P = a => SEEDS.map(s => results[a][s].popSum);
  for (const a of Object.keys(ARMS)) {
    const pop = mean(P(a)) / 100;
    const acc = mean(SEEDS.map(s => results[a][s].regimeAcc));
    const cadm = mean(SEEDS.map(s => results[a][s].correctAdm));
    console.log(`${a.padEnd(14)} pop=${pop.toFixed(2)}  regAcc=${(acc * 100).toFixed(1).padStart(5)}%  corrAdm=${cadm.toFixed(0)}`);
  }

  const l2Candidates = ['SCALAR_015', 'SCALAR_040', 'SCALAR_CONT', 'PAIRX_015', 'PAIRX_CONT', 'RULE_REPEAT', 'RULE_SUBSET', 'RULE_HUB', 'MIX3'];
  const l2Best = l2Candidates.reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
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
}
