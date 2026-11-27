// L4-C Exploration World Engine (scratch/advice-gemini-l4c/l4c_world.mjs)
// Strictly exogenous world dynamics (rRule, rPatch) identical across all arms for a seed.
// Preserves the exact L0/L1/foraging/movement ecology of microverse/l3v.mjs.

export function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
export const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const B = 12;
export const ALL_BITS = Array.from({ length: B }, (_, i) => i);
export const ALL_PAIRS = [];
for (let i = 0; i < B; i++) for (let j = i + 1; j < B; j++) ALL_PAIRS.push({ mask: (1 << i) | (1 << j), a: i, b: j });
export const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);
export const bitOverlap = (m1, m2) => { let x = m1 & m2, c = 0; while (x) { c++; x &= x - 1; } return c; };

const PARITY = new Int8Array(1 << B);
for (let x = 0; x < (1 << B); x++) {
  let n = x, p = 0; while (n) { p ^= 1; n &= n - 1; }
  PARITY[x] = p ? -1 : 1;
}
export const walshFast = (mask, neg) => PARITY[mask & neg];

const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };

export const BASE_CFG = Object.freeze({
  size: 40, patches: 9, patchRadius: 4, plantDensity: .6, regrow: .11, plantCap: 4,
  bite: 1.5, toxin: .60, acceptAt: .40, tasteEps: .08,
  metabolism: .06, moveCost: .02, brainCost: .0005, maxEnergy: 100, maxAge: 2400,
  relocateEvery: 50, shiftEvery: 30, labelNoise: .05,
  childEnergy: 25, birthCost: 30, capacity: 400, founders: 60,
  kinds: 32,
  K: 6, tasteCap: 4, tasteMemory: 32, tasteEvery: 4, tasteZ: 3.3, tastePrune: 1.5,
  graceTastings: 10, evictAge: 18, valThresh: 2.5,
  alphaFloor: .02,
  alphaDecay: .060, alphaBoost: 20, alphaMax: 60,
  gDecay: .005, gInc: 1, gCap: 10, gFloor: .15,
  eraEvery: 4000, subEvery: 250,
  ticks: 20000, every: 100, lateFrom: 10000,
});

const zeroMat = () => Array.from({ length: B }, () => new Float64Array(B));
const cloneMat = G => G.map(row => new Float64Array(row));

export function drawFromWeights(ws, masks, r) {
  let sum = 0; for (let i = 0; i < ws.length; i++) sum += ws[i];
  if (sum <= 0) return -1;
  let u = r() * sum;
  for (let i = 0; i < masks.length; i++) { u -= ws[i]; if (u <= 0) return masks[i]; }
  return masks[masks.length - 1];
}

export class WorldL4C {
  constructor(seed, worldKind, armSpec, cfg = {}) {
    this.cfg = { ...BASE_CFG, ...cfg };
    this.worldKind = worldKind;
    this.arm = armSpec;
    this.seed = seed;
    this.rRule = rng32(mix(seed ^ 0x52554c45));
    this.rPatch = rng32(mix(seed ^ 0x50415443));
    this.rBeh = rng32(mix(seed));
    this.tick = 0; this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)]);

    this.season = this.rRule() < 0.5 ? 0 : 1;
    this.subQueue = [];
    this.curSubset = null;
    this.curPairPool = null;
    this.seasonSubCount = 0;
    this.rule = null;
    this.initSeason(this.season);
    this.nextTarget();
    this.redrawCodes();

    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = [];
    this.tel = { admissions: 0, correctAdm: 0, bites: 0, evBites: 0, vals: 0, births: 0, deaths: 0 };
    for (let i = 0; i < this.cfg.founders; i++) this.spawn(null, Math.floor(this.rBeh() * N), Math.floor(this.rBeh() * N), 50, 0);
  }

  initSeason(season) {
    this.season = season;
    this.seasonSubCount = 0;
    this.subQueue = [];
    if (this.worldKind === 'stay_vs_exhaust') {
      if (season === 0) this.newSubset4(false);
      else this.newExhaustQueue();
    } else if (this.worldKind === 'slow_vs_fast') {
      this.newSubset4(true);
    } else if (this.worldKind === 'clique_vs_pairs') {
      if (season === 0) this.newSubset4(false);
      else this.newDisjointPairs(4);
    }
  }

  newSubset4(avoidPrev) {
    const prev = new Set(this.curSubset ?? []);
    const pool = (avoidPrev && prev.size && B - prev.size >= 4)
      ? ALL_BITS.filter(b => !prev.has(b)) : [...ALL_BITS];
    this.curSubset = shuffleInPlace(pool, this.rRule).slice(0, 4).sort((a, b) => a - b);
    const [a, b, c, d] = this.curSubset;
    // Alternating disjoint order for slow_vs_fast so consecutive pairs inside S are disjoint!
    this.curPairPool = [
      (1 << a) | (1 << b), (1 << c) | (1 << d),
      (1 << a) | (1 << c), (1 << b) | (1 << d),
      (1 << a) | (1 << d), (1 << b) | (1 << c),
    ];
  }

  newExhaustQueue() {
    const perm = shuffleInPlace([...ALL_BITS], this.rRule);
    this.subQueue = [];
    for (let i = 0; i < B; i += 2) this.subQueue.push((1 << perm[i]) | (1 << perm[i + 1]));
  }

  newDisjointPairs(nPairs) {
    const perm = shuffleInPlace([...ALL_BITS], this.rRule);
    this.curPairPool = [];
    for (let i = 0; i < nPairs; i++) this.curPairPool.push((1 << perm[2 * i]) | (1 << perm[2 * i + 1]));
  }

  nextTarget() {
    const prevMask = this.rule ? this.rule.mask : 0;
    let m = 0;
    if (this.worldKind === 'share_vs_disjoint') {
      if (!prevMask) {
        m = ALL_PAIRS[Math.floor(this.rRule() * ALL_PAIRS.length)].mask;
      } else if (this.season === 0) {
        const cands = ALL_PAIRS.filter(p => bitOverlap(p.mask, prevMask) === 1);
        m = cands[Math.floor(this.rRule() * cands.length)].mask;
      } else {
        const cands = ALL_PAIRS.filter(p => bitOverlap(p.mask, prevMask) === 0);
        m = cands[Math.floor(this.rRule() * cands.length)].mask;
      }
    } else if (this.worldKind === 'stay_vs_exhaust') {
      if (this.season === 0) {
        if (this.seasonSubCount > 0 && this.seasonSubCount % 8 === 0) this.newSubset4(true);
        const cands = this.curPairPool.filter(x => x !== prevMask);
        m = cands[Math.floor(this.rRule() * cands.length)];
      } else {
        if (!this.subQueue.length) this.newExhaustQueue();
        m = this.subQueue.pop();
      }
    } else if (this.worldKind === 'slow_vs_fast') {
      if (this.season === 0) {
        // Persistent 4-bit subset for entire season; cycle through disjoint consecutive pairs!
        m = this.curPairPool[this.seasonSubCount % this.curPairPool.length];
      } else {
        // Every 2 sub-epochs (500 ticks), jump to a disjoint 4-bit subset; 2 pairs share 1 bit!
        if (this.seasonSubCount % 2 === 0) {
          if (this.seasonSubCount > 0) this.newSubset4(true);
          m = this.curPairPool[0]; // (a,b)
        } else {
          m = this.curPairPool[2]; // (a,c) — shares bit a with (a,b)!
        }
      }
    } else if (this.worldKind === 'clique_vs_pairs') {
      if (this.seasonSubCount > 0 && this.seasonSubCount % 8 === 0) {
        if (this.season === 0) this.newSubset4(true);
        else this.newDisjointPairs(4);
      }
      const cands = this.curPairPool.filter(x => x !== prevMask);
      m = cands[Math.floor(this.rRule() * cands.length)];
    }
    this.seasonSubCount++;
    this.rule = { mask: m, sign: this.rRule() < .5 ? -1 : 1 };
  }

  redrawCodes() {
    const half = this.cfg.kinds / 2, seen = new Set(), good = [], bad = [];
    while (good.length < half || bad.length < half) {
      const c = Math.floor(this.rRule() * (1 << B));
      if (seen.has(c)) continue; seen.add(c);
      const neg = ((1 << B) - 1) ^ c;
      const v = this.rule.sign * walshFast(this.rule.mask, neg);
      if (v > 0 && good.length < half) good.push(neg);
      else if (v < 0 && bad.length < half) bad.push(neg);
    }
    this.codesNeg = shuffleInPlace([...good, ...bad], this.rRule);
    this.kindValence = this.codesNeg.map(neg => this.rule.sign * walshFast(this.rule.mask, neg));
    this.codeVer = (this.codeVer ?? 0) + 1;
  }

  seedPatch(i) {
    const [cx, cy] = this.patchCenters[i], N = this.cfg.size, R = this.cfg.patchRadius;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
      if (dx * dx + dy * dy > R * R || this.rPatch() > this.cfg.plantDensity) continue;
      const x = (cx + dx + N) % N, y = (cy + dy + N) % N, k = y * N + x;
      if (!this.plant[k]) this.plant[k] = { kind: Math.floor(this.rPatch() * this.codesNeg.length), amount: this.cfg.plantCap * this.rPatch(), patch: i };
    }
  }
  cell(x, y) { const N = this.cfg.size; return ((y + N) % N) * N + ((x + N) % N); }

  spawn(parent, x, y, energy, gen) {
    const id = this.nextId++, arm = this.arm;
    const key = t => rng32(mix(this.seed ^ Math.imul(id, 2654435761) ^ t));
    const r = key(0), rProp = key(0x50524f50);
    const alpha = (parent && arm.usesL2) ? [...parent.alpha] : Array(B).fill(1);
    const G = arm.usesG ? (parent ? cloneMat(parent.G) : zeroMat()) : null;
    const lastVal = (parent && arm.inheritLast) ? parent.lastVal : 0;
    const ovEma = (parent && arm.usesTx) ? parent.ovEma : 0.5;
    const f = {
      id, x, y, energy, age: 0, gen, r, rProp,
      masks: [0], w: [0], maskAge: [0], maskVal: [true],
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, G, lastVal, ovEma, deck: [], deckPos: 0,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
      predVer: -1, goodPred: null, rawPred: null,
    };
    this.flies.push(f);
    if (parent) this.tel.births++;
    return f;
  }

  modelProbNeg(f, neg) {
    const n = f.masks.length; let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * walshFast(f.masks[i], neg) / Math.sqrt(n);
    return sigmoid(z);
  }
  tastePredictNeg(f, neg) {
    const gate = f.lossModel !== undefined && f.lossModel >= f.lossBase;
    return .05 + .9 * (gate ? f.base : this.modelProbNeg(f, neg));
  }
  getGoodPred(f) {
    if (f.predVer === this.codeVer) return f.goodPred;
    f.predVer = this.codeVer;
    const K = this.codesNeg.length;
    if (!f.goodPred) { f.goodPred = new Float64Array(K); f.rawPred = new Float64Array(K); }
    const cfg = this.cfg;
    for (let k = 0; k < K; k++) {
      const p = this.tastePredictNeg(f, this.codesNeg[k]);
      f.rawPred[k] = p;
      f.goodPred[k] = p > cfg.acceptAt ? p - (1 - p) * cfg.toxin : 0;
    }
    return f.goodPred;
  }
  tasteUpdate(f, phi, target) {
    const n = phi.length; let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n);
    const step = 4.0 * (target - sigmoid(z)) / Math.sqrt(n);
    for (let i = 0; i < n; i++) f.w[i] = clip(f.w[i] + step * phi[i], 8);
    f.predVer = -1;
  }
  removeMask(f, i) {
    f.masks.splice(i, 1); f.w.splice(i, 1); f.maskAge.splice(i, 1); f.maskVal.splice(i, 1);
    for (const rc of f.memory) rc.phi.splice(i, 1);
    f.predVer = -1;
  }

  drawCandidate(f, excl) {
    const arm = this.arm, cfg = this.cfg;
    if (arm.kind === 'deck') {
      for (let tries = 0; tries < 2 * ALL_PAIRS.length + 1; tries++) {
        if (f.deckPos >= f.deck.length) { f.deck = shuffleInPlace(ALL_PAIRS.map(p => p.mask), f.rProp); f.deckPos = 0; }
        const m = f.deck[f.deckPos++];
        if (!excl.has(m)) return m;
      }
      return -1;
    }
    const masks = [], ws = [];
    for (const p of ALL_PAIRS) {
      if (excl.has(p.mask)) continue;
      let w = (cfg.alphaFloor + f.alpha[p.a]) * (cfg.alphaFloor + f.alpha[p.b]);
      if (arm.kind === 'pairx') {
        w *= (cfg.gFloor + f.G[p.a][p.b]);
      } else if (arm.kind === 'pair_only') {
        w = cfg.gFloor + f.G[p.a][p.b] * f.G[p.a][p.b];
      } else if (arm.kind === 'oracle_gram' || arm.kind === 'direct_gram') {
        if (this.season === 1) w = cfg.gFloor + f.G[p.a][p.b] * f.G[p.a][p.b];
      } else if (arm.kind === 'tx_overlap') {
        if (f.lastVal) {
          const ov = bitOverlap(p.mask, f.lastVal);
          if (f.ovEma >= 0.5) w = ov === 1 ? 30 : 1;
          else w = ov === 0 ? 30 : 1;
        }
      } else if (arm.kind === 'tx_inv') {
        // Uses ovEma to choose alpha_scalar vs inverted alpha_scalar!
        if (f.ovEma < 0.45) {
          const ia = 1 / (cfg.invC + f.alpha[p.a]);
          const ib = 1 / (cfg.invC + f.alpha[p.b]);
          w = ia * ib;
        }
      } else if (arm.kind === 'direct_last') {
        if (f.lastVal) {
          const ov = bitOverlap(p.mask, f.lastVal);
          if (this.season === 0) w = ov === 1 ? 40 : 1;
          else w = ov === 0 ? 40 : 1;
        }
      } else if (arm.kind === 'direct_inv') {
        if (this.season === 1) {
          const ia = 1 / (cfg.invC + f.alpha[p.a]);
          const ib = 1 / (cfg.invC + f.alpha[p.b]);
          w = ia * ib;
        }
      } else if (arm.kind === 'direct_temp') {
        // Scalar alpha + oracle season adjusts temperature / lastVal focus directly in proposals
        if (this.season === 1 && f.lastVal) {
          const ov = bitOverlap(p.mask, f.lastVal);
          w = ov === 1 ? 30 : 1;
        }
      }
      masks.push(p.mask); ws.push(w);
    }
    return drawFromWeights(ws, masks, f.rProp);
  }

  l2Update(f) {
    const cfg = this.cfg, arm = this.arm;
    const newlyVal = [], allVal = [];
    for (let i = 1; i < f.masks.length; i++) {
      if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) {
        allVal.push(i);
        if (!f.maskVal[i]) {
          f.maskVal[i] = true;
          newlyVal.push(i);
          this.tel.vals++;
        }
      }
    }
    if (newlyVal.length) {
      for (const idx of newlyVal) {
        const m = f.masks[idx];
        if (arm.usesTx && f.lastVal && f.lastVal !== m) {
          const shared = bitOverlap(f.lastVal, m) > 0 ? 1 : 0;
          f.ovEma = (1 - (cfg.txDecay ?? 0.35)) * f.ovEma + (cfg.txDecay ?? 0.35) * shared;
        }
        f.lastVal = m;
      }
    }

    // Decay
    let decay = cfg.alphaDecay;
    if (arm.kind === 'oracle_w_slowfast') {
      decay = this.season === 0 ? cfg.slowDecay : cfg.fastDecay;
    }
    if (arm.kind === 'oracle_w_share' && this.season === 1) {
      // Spread/recover toward high baseline
      for (let b = 0; b < B; b++) f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + 2.0);
    } else if (arm.kind === 'oracle_w_exhaust' && this.season === 1) {
      // Recover suppressed bits slowly toward high cap
      for (let b = 0; b < B; b++) f.alpha[b] = f.alpha[b] + (cfg.recRate ?? 0.035) * (cfg.alphaMax - f.alpha[b]);
    } else {
      for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - decay) * (f.alpha[b] - 1));
    }

    if (f.G) for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.G[i][j] *= (1 - cfg.gDecay);

    // Apply writes
    for (const idx of allVal) {
      const m = f.masks[idx];
      const [a, b] = pairBits(m);
      if (f.G && newlyVal.includes(idx)) f.G[a][b] = f.G[b][a] = Math.min(cfg.gCap, f.G[a][b] + cfg.gInc);

      if (arm.kind === 'oracle_w_share') {
        if (this.season === 0) {
          // Reinforce a,b; suppress others strongly
          f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + 30);
          f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + 30);
          for (let k = 0; k < B; k++) if (k !== a && k !== b) f.alpha[k] = Math.max(.05, 1 + 0.35 * (f.alpha[k] - 1));
        } else {
          // Suppress a,b to floor
          f.alpha[a] = .05;
          f.alpha[b] = .05;
        }
      } else if (arm.kind === 'oracle_w_exhaust') {
        if (this.season === 0) {
          f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
          f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
        } else {
          f.alpha[a] = .05;
          f.alpha[b] = .05;
        }
      } else if (arm.kind === 'oracle_w_slowfast') {
        if (this.season === 0) {
          f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.slowBoost);
          f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.slowBoost);
        } else {
          // Fast flush: if newly validated and bits aren't both high, flush others!
          if (newlyVal.includes(idx)) {
            for (let k = 0; k < B; k++) if (k !== a && k !== b) f.alpha[k] = Math.max(.05, 1 + 0.25 * (f.alpha[k] - 1));
          }
          f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.fastBoost);
          f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.fastBoost);
        }
      } else if (arm.usesL2) {
        f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
        f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
      }
    }
  }

  tasteLearn(f, neg, target, kind) {
    const cfg = this.cfg;
    const phi = f.masks.map(m => walshFast(m, neg));
    const n = phi.length; let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n);
    const pm0 = sigmoid(z), residual = target - pm0;
    const pm = Math.min(1 - 1e-3, Math.max(1e-3, pm0)), pb = Math.min(1 - 1e-3, Math.max(1e-3, f.base));
    const ll = p => -(target ? Math.log(p) : Math.log(1 - p));
    if (f.lossModel === undefined) { f.lossModel = ll(pm); f.lossBase = ll(pb); }
    else { f.lossModel += .05 * (ll(pm) - f.lossModel); f.lossBase += .05 * (ll(pb) - f.lossBase); }
    f.base += .05 * (target - f.base);
    const rec = { neg, phi, target };
    f.seen++;
    if (f.memory.length < 32) f.memory.push(rec); else f.memory[(f.seen - 1) % 32] = rec;
    this.tasteUpdate(f, phi, target);
    const rep = f.memory[Math.floor(f.r() * f.memory.length)];
    this.tasteUpdate(f, rep.phi, rep.target);
    for (let i = 0; i < f.maskAge.length; i++) f.maskAge[i]++;

    if (!this.arm.l1) return;
    if (kind === f.lastKind) return;
    f.lastKind = kind; this.tel.evBites++;
    const D = 1 - 1 / cfg.tasteMemory, D2 = D * D;
    f.n++;

    const excl = new Set(f.masks); for (const s of f.buf) excl.add(s.mask);
    while (f.buf.length < cfg.K) {
      const m = this.drawCandidate(f, excl);
      if (m < 0) break;
      excl.add(m); f.buf.push({ mask: m, ev: 0, s2: 0, age: 0 });
    }
    for (const s of f.buf) { s.ev = s.ev * D + walshFast(s.mask, neg) * residual; s.s2 = s.s2 * D2 + residual * residual; s.age++; }
    if (f.n % cfg.tasteEvery !== 0) return;

    if (this.arm.usesL2) this.l2Update(f);

    for (let i = f.masks.length - 1; i >= 1; i--) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) < cfg.tastePrune) this.removeMask(f, i);
    let bestIdx = -1, bestScore = 0;
    for (let i = 0; i < f.buf.length; i++) {
      const s = f.buf[i]; if (s.age < 10 || s.s2 <= 1e-9) continue;
      const sc = Math.abs(s.ev) / Math.sqrt(s.s2); if (sc > bestScore) { bestScore = sc; bestIdx = i; }
    }
    if (bestIdx >= 0 && bestScore > cfg.tasteZ) {
      const chosen = f.buf[bestIdx].mask;
      if (f.masks.length >= cfg.tasteCap) {
        let j = -1;
        for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && (j < 0 || Math.abs(f.w[i]) < Math.abs(f.w[j]))) j = i;
        if (j >= 0 && Math.abs(f.w[j]) < cfg.tastePrune + 1.5) this.removeMask(f, j);
      }
      if (f.masks.length < cfg.tasteCap) {
        f.masks.push(chosen); f.w.push(0); f.maskAge.push(0); f.maskVal.push(false);
        for (const rc of f.memory) rc.phi.push(walshFast(chosen, rc.neg));
        f.buf.splice(bestIdx, 1);
        f.predVer = -1;
        this.tel.admissions++;
        if (this.rule.mask === chosen) this.tel.correctAdm++;
      }
    }
    for (let i = f.buf.length - 1; i >= 0; i--) if (f.buf[i].age >= cfg.evictAge) f.buf.splice(i, 1);
  }

  moveFeatures(f, goodPred, dir, occ) {
    const [dx, dy] = MOVES[dir], x = f.x + dx, y = f.y + dy, p = this.plant[this.cell(x, y)];
    const food = p ? p.amount / this.cfg.plantCap : 0, good = p ? food * goodPred[p.kind] : 0;
    let s4 = 0;
    if (dir) for (let d = 1; d <= 4; d++) for (let s = -d; s <= d; s++) {
      const cx = dx ? f.x + dx * d : f.x + s, cy = dy ? f.y + dy * d : f.y + s, q = this.plant[this.cell(cx, cy)];
      if (q) s4 += q.amount * goodPred[q.kind] / (d * d);
    }
    return [1, food, good, Math.tanh(s4 / 4), Math.min(1, (occ.get(this.cell(x, y)) ?? 0) / 3), f.energy / this.cfg.maxEnergy * 2 - 1];
  }

  step() {
    const cfg = this.cfg, N = cfg.size;
    if (this.tick > 0 && this.tick % cfg.eraEvery === 0) {
      this.initSeason(1 - this.season);
      this.nextTarget();
      this.redrawCodes();
    } else if (this.tick > 0 && this.tick % cfg.subEvery === 0) {
      this.nextTarget();
      this.redrawCodes();
    } else if (this.tick > 0 && this.tick % cfg.shiftEvery === 0) {
      this.redrawCodes();
    }

    if (this.tick > 0 && this.tick % cfg.relocateEvery === 0) {
      const i = Math.floor(this.rPatch() * cfg.patches);
      for (let k = 0; k < this.plant.length; k++) if (this.plant[k]?.patch === i) this.plant[k] = null;
      this.patchCenters[i] = [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)];
      this.seedPatch(i);
    }
    for (const p of this.plant) if (p) p.amount = Math.min(cfg.plantCap, p.amount + cfg.regrow);
    if (!this.flies.length) { this.tick++; return; }

    const occ = new Map();
    for (const f of this.flies) { const k = this.cell(f.x, f.y); occ.set(k, (occ.get(k) ?? 0) + 1); }
    const order = shuffleInPlace(this.flies.map((_, i) => i), this.rBeh);
    const born = [];
    for (const idx of order) {
      const f = this.flies[idx], e0 = f.energy;
      const goodPred = this.getGoodPred(f);
      const bases = MOVES.map((_, d) => this.moveFeatures(f, goodPred, d, occ));
      const qs = bases.map(base => base.reduce((s, v, j) => s + f.moveW[j] * v, 0));
      if (f.movePending) {
        const rew = f.movePending.reward ?? 0, delta = clip(rew - f.rbar, 4);
        f.rbar += .05 * (rew - f.rbar);
        for (let i = 0; i < f.moveW.length; i++) { f.moveW[i] = clip(f.moveW[i] + .02 * delta * f.moveTrace[i], 4); f.moveTrace[i] *= .35; }
      }
      let dir;
      if (f.r() < .08) dir = Math.floor(f.r() * 5);
      else {
        const m = Math.max(...qs), ps = qs.map(q => Math.exp((q - m) / .18)), z = ps.reduce((a, b) => a + b, 0);
        let u = f.r() * z; dir = 4; for (let d = 0; d < 5; d++) { u -= ps[d]; if (u <= 0) { dir = d; break; } }
      }
      f.x = (f.x + MOVES[dir][0] + N) % N; f.y = (f.y + MOVES[dir][1] + N) % N;
      f.energy -= cfg.metabolism + (dir ? cfg.moveCost : 0) + cfg.brainCost * f.masks.length;
      const pl = this.plant[this.cell(f.x, f.y)];
      if (pl && pl.amount > .05) {
        const pred = f.rawPred[pl.kind];
        if (pred > cfg.acceptAt || f.r() < cfg.tasteEps) {
          const bite = Math.min(cfg.bite, pl.amount); pl.amount -= bite;
          const good = this.kindValence[pl.kind] > 0;
          f.energy = Math.min(cfg.maxEnergy, f.energy + (good ? bite : -bite * cfg.toxin));
          const target = (f.r() < cfg.labelNoise ? !good : good) ? 1 : 0;
          this.tasteLearn(f, this.codesNeg[pl.kind], target, pl.kind);
          this.tel.bites++;
        }
      }
      for (let i = 0; i < f.moveW.length; i++) f.moveTrace[i] += bases[dir][i];
      f.movePending = { reward: f.energy - e0 };
      f.age++;
      if (f.energy >= cfg.birthCost + cfg.childEnergy && this.flies.length + born.length < cfg.capacity) {
        f.energy -= cfg.birthCost;
        born.push([f, (f.x + Math.floor(f.r() * 3) - 1 + N) % N, (f.y + Math.floor(f.r() * 3) - 1 + N) % N, cfg.childEnergy, f.gen + 1]);
      }
    }
    const alive = [];
    for (const f of this.flies) { if (f.energy > 0 && f.age < cfg.maxAge) alive.push(f); else this.tel.deaths++; }
    this.flies = alive;
    for (const b of born) this.spawn(...b);
    this.tick++;
  }
}

export function runWorld(seed, worldKind, armSpec, cfg = {}) {
  const w = new WorldL4C(seed, worldKind, armSpec, cfg);
  let popSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; }
  }
  return { seed, popSum, pop: popSum / nLate, tel: w.tel };
}
