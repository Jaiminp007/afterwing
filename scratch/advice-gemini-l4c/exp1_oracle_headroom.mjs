// Exp 1: Oracle headroom diagnostic across 4 candidate L4-C worlds on tuning seeds 2801-2808 ONLY.
// Tests whether Oracle L2-write-rule switching has >=1.5x headroom over:
//   - FIXED (shuffled deck)
//   - Scalar L2 grid
//   - PAIRX
//   - Transition memory (TX)
//   - DIRECT given the SAME oracle season signal directly in proposals!
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { runWorld } from './l4c_world.mjs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

const SEEDS = Array.from({ length: 8 }, (_, i) => 2801 + i);

const WORLDS = {
  share_vs_disjoint: {
    wcfg: { eraEvery: 4000, subEvery: 250 },
    arms: {
      FIXED:           { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
      SCALAR_SLOW:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .015, alphaBoost: 8 } },
      SCALAR_MED:      { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .060, alphaBoost: 20 } },
      SCALAR_FAST:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .180, alphaBoost: 40 } },
      PAIRX:           { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .060, alphaBoost: 20, gDecay: .01, gFloor: .15 } },
      TX_OVERLAP:      { spec: { l1: true, kind: 'tx_overlap', usesL2: true, usesTx: true, inheritLast: true }, cfg: { txDecay: .45 } },
      DIRECT_LAST:     { spec: { l1: true, kind: 'direct_last', usesL2: true, inheritLast: true }, cfg: { alphaDecay: .060, alphaBoost: 20 } },
      DIRECT_INV:      { spec: { l1: true, kind: 'direct_inv', usesL2: true }, cfg: { alphaDecay: .150, alphaBoost: 40, invC: .5 } },
      ORACLE_W:        { spec: { l1: true, kind: 'oracle_w_share', usesL2: true }, cfg: { alphaDecay: .120, alphaBoost: 30 } },
    },
  },
  stay_vs_exhaust: {
    wcfg: { eraEvery: 4000, subEvery: 250 },
    arms: {
      FIXED:           { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
      SCALAR_SLOW:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .015, alphaBoost: 12 } },
      SCALAR_MED:      { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .060, alphaBoost: 20 } },
      SCALAR_FAST:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .150, alphaBoost: 40 } },
      PAIRX:           { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .015, alphaBoost: 12, gDecay: .01, gFloor: .15 } },
      TX_INV:          { spec: { l1: true, kind: 'tx_inv', usesL2: true, usesTx: true, inheritLast: true }, cfg: { alphaDecay: .025, alphaBoost: 16, txDecay: .40, invC: .5 } },
      DIRECT_LAST:     { spec: { l1: true, kind: 'direct_last', usesL2: true, inheritLast: true }, cfg: { alphaDecay: .025, alphaBoost: 16 } },
      DIRECT_INV_S:    { spec: { l1: true, kind: 'direct_inv', usesL2: true }, cfg: { alphaDecay: .020, alphaBoost: 16, invC: .5 } },
      DIRECT_INV_M:    { spec: { l1: true, kind: 'direct_inv', usesL2: true }, cfg: { alphaDecay: .040, alphaBoost: 24, invC: .5 } },
      ORACLE_W:        { spec: { l1: true, kind: 'oracle_w_exhaust', usesL2: true }, cfg: { alphaDecay: .015, alphaBoost: 12, recRate: .035 } },
    },
  },
  slow_vs_fast: {
    wcfg: { eraEvery: 5000, subEvery: 250 },
    arms: {
      FIXED:           { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
      SCALAR_004:      { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .004, alphaBoost: 6 } },
      SCALAR_015:      { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .015, alphaBoost: 12 } },
      SCALAR_040:      { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .040, alphaBoost: 20 } },
      SCALAR_100:      { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .100, alphaBoost: 30 } },
      SCALAR_200:      { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .200, alphaBoost: 45 } },
      PAIRX:           { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .040, alphaBoost: 20, gDecay: .005, gFloor: .15 } },
      DIRECT_TEMP:     { spec: { l1: true, kind: 'direct_temp', usesL2: true, inheritLast: true }, cfg: { alphaDecay: .006, alphaBoost: 8 } },
      ORACLE_W:        { spec: { l1: true, kind: 'oracle_w_slowfast', usesL2: true }, cfg: { slowDecay: .004, slowBoost: 6, fastDecay: .150, fastBoost: 35 } },
    },
  },
  clique_vs_pairs: {
    wcfg: { eraEvery: 4000, subEvery: 250 },
    arms: {
      FIXED:           { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
      SCALAR_SLOW:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .015, alphaBoost: 12 } },
      SCALAR_MED:      { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .060, alphaBoost: 20 } },
      PAIR_ONLY:       { spec: { l1: true, kind: 'pair_only', usesL2: true, usesG: true }, cfg: { gDecay: .005, gFloor: .05 } },
      PAIRX:           { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .015, alphaBoost: 12, gDecay: .005, gFloor: .15 } },
      DIRECT_GRAM:     { spec: { l1: true, kind: 'direct_gram', usesL2: true, usesG: true }, cfg: { alphaDecay: .015, alphaBoost: 12, gDecay: .005, gFloor: .05 } },
      ORACLE_W:        { spec: { l1: true, kind: 'oracle_gram', usesL2: true, usesG: true }, cfg: { alphaDecay: .015, alphaBoost: 12, gDecay: .005, gFloor: .05 } },
    },
  },
};

if (!isMainThread) {
  const { seed, worldName, armName } = workerData;
  const w = WORLDS[worldName];
  const a = w.arms[armName];
  const r = runWorld(seed, worldName, a.spec, { ...w.wcfg, ...a.cfg });
  parentPort.postMessage({ seed, worldName, armName, popSum: r.popSum, pop: r.pop, vals: r.tel.vals });
} else {
  const t0 = Date.now();
  const jobs = [];
  for (const [worldName, w] of Object.entries(WORLDS)) {
    for (const armName of Object.keys(w.arms)) {
      for (const seed of SEEDS) jobs.push({ seed, worldName, armName });
    }
  }
  const results = {};
  let next = 0;
  await Promise.all(Array.from({ length: 10 }, () => new Promise((resolve, reject) => {
    const go = () => {
      if (next >= jobs.length) return resolve();
      const job = jobs[next++];
      const wk = new Worker(new URL(import.meta.url), { workerData: job });
      wk.once('message', m => { ((results[m.worldName] ??= {})[m.armName] ??= {})[m.seed] = m; go(); });
      wk.once('error', reject);
    };
    go();
  })));
  console.log(`=== Exp 1: Oracle Headroom across 4 L4-C worlds (seeds 2801-2808, ${((Date.now()-t0)/1000).toFixed(1)}s) ===\n`);
  for (const [worldName, w] of Object.entries(WORLDS)) {
    console.log(`--- WORLD: ${worldName} ---`);
    const P = a => SEEDS.map(s => results[worldName][a][s].popSum);
    const pF = P('FIXED');
    const mF = mean(pF) / 100;
    const armNames = Object.keys(w.arms);
    for (const a of armNames) {
      const m = mean(P(a)) / 100;
      const v = mean(SEEDS.map(s => results[worldName][a][s].vals));
      console.log(`  ${a.padEnd(16)} pop=${m.toFixed(2)}  gain=${(m - mF >= 0 ? '+' : '') + (m - mF).toFixed(2)}  vals=${v.toFixed(0)}`);
    }
    const pO = P('ORACLE_W');
    const nonOracle = armNames.filter(a => a !== 'FIXED' && a !== 'ORACLE_W');
    const scalars = nonOracle.filter(a => a.startsWith('SCALAR'));
    const bestScalar = scalars.reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
    const bestAll = nonOracle.reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
    for (const [tag, ref] of [['bestScalar', bestScalar], ['bestALL   ', bestAll]]) {
      const pL = P(ref);
      const d = SEEDS.map((_, i) => 2 * pO[i] - 3 * pL[i] + pF[i]);
      const ratio = (mean(pO) - mean(pF)) / Math.max(1e-9, mean(pL) - mean(pF));
      console.log(`  ORACLE vs ${tag} (${ref.padEnd(12)}): d4=${(mean(d)/200).toFixed(2)}  ratio=${ratio.toFixed(2)}x  signs=${d.filter(x=>x>0).length}/${SEEDS.length}  p=${signflip(d,1).toExponential(2)}`);
    }
    console.log('');
  }
}
