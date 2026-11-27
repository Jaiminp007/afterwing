// Diagnostic: measure the exact 3x3 payoff matrix (each regime solo) on seeds 2401-2408
// to verify regime headroom, validation rates, and incompatibility of R_REPEAT, R_SUBSET, R_HUB.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { World4B, BASE_CFG } from './l4b_world.mjs';
import { mean } from '../../docs/paper/stats.mjs';

// Subclass to lock a single regime (0, 1, or 2) and test 4-bit vs 5-bit subset and 2 vs 3 repeat pairs
class SoloWorld extends World4B {
  constructor(seed, armSpec, cfg) {
    super(seed, armSpec, cfg);
  }
  initRegime(reg) {
    const fixedReg = this.cfg.soloRegime;
    this.regime = fixedReg;
    if (fixedReg === 0 && this.cfg.repeatPairs === 2) {
      // 2 disjoint pairs alternating/cycling? Wait: 2 pairs with "never prev" is deterministic alternation!
      // Use 3 disjoint pairs, OR 2 disjoint pairs with random switch (allow same? no, 3 pairs is non-trivial)
      super.initRegime(0);
    } else if (fixedReg === 1 && this.cfg.subsetBits === 4) {
      // 4-bit subset -> 6 pairs without replacement
      const perm = Array.from({ length: 12 }, (_, i) => i);
      for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(this.rRule() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
      const S = perm.slice(0, 4);
      const pairs = [];
      for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) pairs.push((1 << S[i]) | (1 << S[j]));
      for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(this.rRule() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
      this.regQueue = pairs;
      this.regPool = S;
    } else {
      super.initRegime(fixedReg);
    }
  }
}

function runSolo(seed, armSpec, cfg) {
  const w = new SoloWorld(seed, armSpec, { ...cfg, regimeEvery: 1e9 });
  let popSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; }
  }
  return { pop: popSum / nLate, vals: w.tel.vals, corrAdm: w.tel.correctAdm, adm: w.tel.admissions };
}

const SEEDS = [2401, 2402, 2403, 2404, 2405, 2406, 2407, 2408];
const REGIMES = [
  { name: 'R0_PAIR3_s300',  cfg: { soloRegime: 0, subEvery: 300 } },
  { name: 'R1_SUB4_s300',   cfg: { soloRegime: 1, subsetBits: 4, subEvery: 300 } },
  { name: 'R1_SUB5_s300',   cfg: { soloRegime: 1, subsetBits: 5, subEvery: 300 } },
  { name: 'R2_HUB_s300',    cfg: { soloRegime: 2, subEvery: 300 } },
];
const ARMS = {
  FIXED:       { l1: true, kind: 'deck', usesL2: false, usesG: false },
  SCALAR:      { l1: true, kind: 'scalar', usesL2: true, usesG: false },
  PAIRX:       { l1: true, kind: 'pairx', usesL2: true, usesG: true },
  R_REPEAT:    { l1: true, kind: 'fixed_rule', fixedRule: 0, usesL2: true, usesG: true },
  R_SUBSET:    { l1: true, kind: 'fixed_rule', fixedRule: 1, usesL2: true, usesG: true },
  R_HUB:       { l1: true, kind: 'fixed_rule', fixedRule: 2, usesL2: true, usesG: true },
  MIX3:        { l1: true, kind: 'mix3', usesL2: true, usesG: true },
};

if (!isMainThread) {
  const { seed, regName, regCfg, armName } = workerData;
  const r = runSolo(seed, ARMS[armName], regCfg);
  parentPort.postMessage({ seed, regName, armName, ...r });
} else {
  const jobs = [];
  for (const reg of REGIMES) for (const armName of Object.keys(ARMS)) for (const seed of SEEDS)
    jobs.push({ seed, regName: reg.name, regCfg: reg.cfg, armName });
  const res = {};
  let next = 0;
  await Promise.all(Array.from({ length: 10 }, () => new Promise((resolve, reject) => {
    const go = () => {
      if (next >= jobs.length) return resolve();
      const job = jobs[next++];
      const w = new Worker(new URL(import.meta.url), { workerData: job });
      w.once('message', m => { ((res[m.regName] ??= {})[m.armName] ??= []).push(m); go(); });
      w.once('error', reject);
    };
    go();
  })));

  console.log('=== Solo-Regime 3x3 Payoff Matrix (seeds 2401-2408, subEvery=300) ===');
  const hdr = 'Regime'.padEnd(16) + Object.keys(ARMS).map(a => a.padStart(10)).join('');
  console.log(hdr);
  for (const reg of REGIMES) {
    let line = reg.name.padEnd(16);
    for (const a of Object.keys(ARMS)) {
      const m = mean(res[reg.name][a].map(x => x.pop));
      line += m.toFixed(2).padStart(10);
    }
    console.log(line);
  }
  console.log('\n--- Mean total validations per run (vals) ---');
  for (const reg of REGIMES) {
    let line = reg.name.padEnd(16);
    for (const a of Object.keys(ARMS)) {
      const m = mean(res[reg.name][a].map(x => x.vals));
      line += m.toFixed(0).padStart(10);
    }
    console.log(line);
  }
}
