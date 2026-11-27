// Exp 2: Additional oracle-headroom stress tests on tuning seeds 2801-2808 ONLY:
//   World 5: slow_vs_fast_v2 (lower alphaMax=15 to strip dynamic-range buffer, extreme contrast)
//   World 6: core_vs_drift (persistent 4-bit core + 33% random decoys vs rapid disjoint drift)
//   World 7: matchings_11 (L4-B's 11 matchings: ORACLE_W vs DIRECT_ALPHA = alpha[k] + alpha[p[k]] + DIRECT_P40)
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import {
  WorldL4C, ALL_BITS, ALL_PAIRS, B, pairBits, bitOverlap, shuffleInPlace, drawFromWeights,
} from './l4c_world.mjs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

const SEEDS = Array.from({ length: 8 }, (_, i) => 2801 + i);

function makeMatchings11() {
  const res = [];
  for (let r = 0; r < 11; r++) {
    const p = new Int8Array(B);
    p[11] = r; p[r] = 11;
    for (let d = 1; d <= 5; d++) {
      const i = (r + d) % 11, j = (r - d + 11) % 11;
      p[i] = j; p[j] = i;
    }
    res.push(p);
  }
  return res;
}
const MATCHINGS_11 = makeMatchings11();

class WorldExt extends WorldL4C {
  initSeason(season) {
    this.season = season;
    this.seasonSubCount = 0;
    this.subQueue = [];
    if (this.worldKind === 'matchings_11') {
      this.eraRule = Math.floor(this.rRule() * 11);
      this.initMatchingMacro();
    } else {
      this.newSubset4(true);
    }
  }

  initMatchingMacro() {
    const p = MATCHINGS_11[this.eraRule];
    const groups = [], seen = new Set();
    for (let i = 0; i < B; i++) {
      if (seen.has(i)) continue;
      seen.add(i); seen.add(p[i]);
      groups.push([i, p[i]]);
    }
    shuffleInPlace(groups, this.rRule);
    const [a0, a1] = groups[0], [b0, b1] = groups[1];
    this.subQueue = shuffleInPlace([
      (1 << a0) | (1 << b0), (1 << a0) | (1 << b1),
      (1 << a1) | (1 << b0), (1 << a1) | (1 << b1),
    ], this.rRule);
  }

  nextTarget() {
    let m = 0;
    if (this.worldKind === 'slow_vs_fast_v2') {
      if (this.season === 0) {
        // Persistent 4-bit subset for entire 5000 ticks, disjoint consecutive pairs
        m = this.curPairPool[this.seasonSubCount % this.curPairPool.length];
      } else {
        // Every 3 sub-epochs (600 ticks), jump to disjoint 4-bit subset, 3 pairs sharing bits
        const k = this.seasonSubCount % 3;
        if (k === 0 && this.seasonSubCount > 0) this.newSubset4(true);
        const [a, b, c, d] = this.curSubset;
        const seq = [(1 << a) | (1 << b), (1 << a) | (1 << c), (1 << b) | (1 << d)];
        m = seq[k];
      }
    } else if (this.worldKind === 'core_vs_drift') {
      if (this.season === 0) {
        // Persistent 4-bit core with 33% random decoy pairs outside core!
        if (this.seasonSubCount % 3 === 2) {
          const coreSet = new Set(this.curSubset);
          const decoys = ALL_PAIRS.filter(p => !coreSet.has(p.a) && !coreSet.has(p.b));
          m = decoys[Math.floor(this.rRule() * decoys.length)].mask;
        } else {
          const prev = this.rule ? this.rule.mask : 0;
          const cands = this.curPairPool.filter(x => x !== prev);
          m = cands[Math.floor(this.rRule() * cands.length)];
        }
      } else {
        // Rapid drift: every 2 sub-epochs jump to a disjoint 4-bit subset
        if (this.seasonSubCount % 2 === 0 && this.seasonSubCount > 0) this.newSubset4(true);
        const [a, b, c] = this.curSubset;
        m = (this.seasonSubCount % 2 === 0) ? ((1 << a) | (1 << b)) : ((1 << a) | (1 << c));
      }
    } else if (this.worldKind === 'matchings_11') {
      if (!this.subQueue.length) this.initMatchingMacro();
      m = this.subQueue.pop();
    } else {
      return super.nextTarget();
    }
    this.seasonSubCount++;
    this.rule = { mask: m, sign: this.rRule() < .5 ? -1 : 1 };
  }

  drawCandidate(f, excl) {
    const arm = this.arm, cfg = this.cfg;
    if (arm.kind === 'direct_alpha_match') {
      const p = MATCHINGS_11[this.eraRule];
      const eff = new Float64Array(B);
      for (let k = 0; k < B; k++) eff[k] = Math.min(cfg.alphaMax, f.alpha[k] + (cfg.pGain ?? 1.0) * f.alpha[p[k]]);
      const pred = new Set();
      if (cfg.directPair && f.lastVal) {
        const [la, lb] = pairBits(f.lastVal);
        pred.add((1 << la) | (1 << p[lb]));
        pred.add((1 << p[la]) | (1 << lb));
        pred.add((1 << p[la]) | (1 << p[lb]));
      }
      const masks = [], ws = [];
      for (const q of ALL_PAIRS) {
        if (excl.has(q.mask)) continue;
        masks.push(q.mask);
        ws.push((cfg.alphaFloor + eff[q.a]) * (cfg.alphaFloor + eff[q.b]) * (pred.has(q.mask) ? (1 + (cfg.kappa ?? 40)) : 1));
      }
      return drawFromWeights(ws, masks, f.rProp);
    }
    return super.drawCandidate(f, excl);
  }

  l2Update(f) {
    const arm = this.arm, cfg = this.cfg;
    if (arm.kind === 'oracle_match') {
      const newlyVal = [], allVal = [];
      for (let i = 1; i < f.masks.length; i++) {
        if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) {
          allVal.push(i);
          if (!f.maskVal[i]) { f.maskVal[i] = true; newlyVal.push(i); this.tel.vals++; }
        }
      }
      for (const idx of newlyVal) f.lastVal = f.masks[idx];
      for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - cfg.alphaDecay) * (f.alpha[b] - 1));
      const p = MATCHINGS_11[this.eraRule];
      for (const idx of allVal) {
        const [a, b] = pairBits(f.masks[idx]);
        const pa = p[a], pb = p[b];
        for (let k = 0; k < B; k++) {
          if (k === a || k === b) f.alpha[k] = Math.min(cfg.alphaMax, f.alpha[k] + cfg.alphaBoost);
          else if (k === pa || k === pb) f.alpha[k] = Math.min(cfg.alphaMax, f.alpha[k] + cfg.partnerBoost);
          else f.alpha[k] = Math.max(.05, 1 + (1 - cfg.suppressDecay) * (f.alpha[k] - 1));
        }
      }
      return;
    }
    return super.l2Update(f);
  }
}

function runExt(seed, worldKind, armSpec, cfg) {
  const w = new WorldExt(seed, worldKind, armSpec, cfg);
  let popSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; }
  }
  return { seed, popSum, pop: popSum / nLate, vals: w.tel.vals };
}

const WORLDS = {
  slow_vs_fast_v2: {
    wcfg: { eraEvery: 5000, subEvery: 200, alphaMax: 15 },
    arms: {
      FIXED:        { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
      SCALAR_003:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .003, alphaBoost: 3 } },
      SCALAR_010:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .010, alphaBoost: 5 } },
      SCALAR_025:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .025, alphaBoost: 8 } },
      SCALAR_060:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .060, alphaBoost: 12 } },
      SCALAR_150:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .150, alphaBoost: 15 } },
      ORACLE_W:     { spec: { l1: true, kind: 'oracle_w_slowfast', usesL2: true }, cfg: { slowDecay: .003, slowBoost: 3, fastDecay: .150, fastBoost: 15 } },
    },
  },
  core_vs_drift: {
    wcfg: { eraEvery: 5000, subEvery: 200, alphaMax: 30 },
    arms: {
      FIXED:        { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
      SCALAR_004:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .004, alphaBoost: 3 } },
      SCALAR_012:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .012, alphaBoost: 6 } },
      SCALAR_030:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .030, alphaBoost: 12 } },
      SCALAR_080:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .080, alphaBoost: 20 } },
      SCALAR_180:   { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .180, alphaBoost: 30 } },
      ORACLE_W:     { spec: { l1: true, kind: 'oracle_w_slowfast', usesL2: true }, cfg: { slowDecay: .004, slowBoost: 3, fastDecay: .180, fastBoost: 30 } },
    },
  },
  matchings_11: {
    wcfg: { eraEvery: 4800, subEvery: 300, alphaMax: 60 },
    arms: {
      FIXED:            { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
      SCALAR_120:       { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .120, alphaBoost: 40 } },
      DIRECT_ALPHA:     { spec: { l1: true, kind: 'direct_alpha_match', usesL2: true }, cfg: { alphaDecay: .120, alphaBoost: 40, pGain: 1.0, directPair: false } },
      DIRECT_PAIR_ONLY: { spec: { l1: true, kind: 'direct_alpha_match', usesL2: true, inheritLast: true }, cfg: { alphaDecay: .120, alphaBoost: 40, pGain: 0.0, directPair: true, kappa: 40 } },
      DIRECT_BOTH:      { spec: { l1: true, kind: 'direct_alpha_match', usesL2: true, inheritLast: true }, cfg: { alphaDecay: .120, alphaBoost: 40, pGain: 1.0, directPair: true, kappa: 40 } },
      ORACLE_W:         { spec: { l1: true, kind: 'oracle_match', usesL2: true }, cfg: { alphaDecay: .060, alphaBoost: 20, partnerBoost: 20, suppressDecay: .60 } },
    },
  },
};

if (!isMainThread) {
  const { seed, worldName, armName } = workerData;
  const w = WORLDS[worldName];
  const a = w.arms[armName];
  const r = runExt(seed, worldName, a.spec, { ...w.wcfg, ...a.cfg });
  parentPort.postMessage({ seed, worldName, armName, popSum: r.popSum, pop: r.pop, vals: r.tel?.vals ?? r.vals });
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
  console.log(`=== Exp 2: Additional Oracle Headroom Tests (seeds 2801-2808, ${((Date.now()-t0)/1000).toFixed(1)}s) ===\n`);
  for (const [worldName, w] of Object.entries(WORLDS)) {
    console.log(`--- WORLD: ${worldName} ---`);
    const P = a => SEEDS.map(s => results[worldName][a][s].popSum);
    const pF = P('FIXED'), mF = mean(pF) / 100;
    const armNames = Object.keys(w.arms);
    for (const a of armNames) {
      const m = mean(P(a)) / 100;
      const v = mean(SEEDS.map(s => results[worldName][a][s].vals));
      console.log(`  ${a.padEnd(18)} pop=${m.toFixed(2)}  gain=${(m - mF >= 0 ? '+' : '') + (m - mF).toFixed(2)}  vals=${v.toFixed(0)}`);
    }
    const pO = P('ORACLE_W');
    const nonOracle = armNames.filter(a => a !== 'FIXED' && a !== 'ORACLE_W');
    const bestAll = nonOracle.reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
    const pL = P(bestAll);
    const d = SEEDS.map((_, i) => 2 * pO[i] - 3 * pL[i] + pF[i]);
    const ratio = (mean(pO) - mean(pF)) / Math.max(1e-9, mean(pL) - mean(pF));
    console.log(`  ORACLE vs bestALL (${bestAll.padEnd(16)}): d4=${(mean(d)/200).toFixed(2)}  ratio=${ratio.toFixed(2)}x  signs=${d.filter(x=>x>0).length}/${SEEDS.length}  p=${signflip(d,1).toExponential(2)}\n`);
  }
}
