// L4-B Design 1 v2 (scratch only, no tracked files touched).
// Fast exact Walsh parity + clean 4-partition index-agnostic L2 rules:
//   0 = R_REPEAT: high G[a][b] (recurring exact pairs)
//   1 = R_SUBSET: both bits high in alpha, low G (novel pairs inside active subset)
//   2 = R_HUB:    one bit high in alpha, one low, low G (hub + fresh spoke)
//   3 = R_FRESH:  both bits low in alpha, low G (fresh disjoint pairs)
// Also fixes the bandit eviction bug (only penalize evictions when candidate saw high residual s2).

export function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const B = 12;
const ALL_BITS = Array.from({ length: B }, (_, i) => i);
export const ALL_PAIRS = [];
for (let i = 0; i < B; i++) for (let j = i + 1; j < B; j++) ALL_PAIRS.push({ mask: (1 << i) | (1 << j), a: i, b: j });

// Fast exact Walsh parity table: for code integer c (bit b = 1 -> +1, bit b = 0 -> -1),
// negative bits mask is neg = ((1<<B)-1) ^ c. Product over mask is (-1)^popcount(mask & neg).
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
  regimeEvery: 3600, subEvery: 300, kinds: 32,
  regimes: [0, 2, 3], // active regime set (subset of 0=PAIR_CYCLE, 1=SUBSET_EXHAUST, 2=HUB_SPOKE, 3=FRESH_DISJOINT)
  repeatPairs: 3,     // number of disjoint pairs in PAIR_CYCLE
  subsetBits: 4,      // subset size in SUBSET_EXHAUST
  K: 6, tasteCap: 4, tasteMemory: 32, tasteEvery: 4, tasteZ: 3.3, tastePrune: 1.5,
  graceTastings: 10, evictAge: 18, valThresh: 2.5,
  alphaFloor: .02,
  onceVal: true,
  alphaDecay: .020, alphaBoost: 12, alphaMax: 60,
  gDecay: .015, gInc: 1, gCap: 8,
  gFloor: .15,
  repFloor: .01,
  gSuppress: 15,
  hubFloor: .5,
  hubPow: 2,
  freshPow: 2,
  // L3 Bandit
  uBeta: 1.8, uEps: .10, uWin: 2.0, uLoss: .15, uDecay: .06, uCap: 5, s2MinLoss: 1.0,
  // L3 LogScore
  lsDecay: .30, lsBeta: 1.5, lsEps: .05, lsMixUnif: .10,
  ticks: 20000, every: 100, lateFrom: 10000,
});

const zeroG = () => Array.from({ length: B }, () => new Float64Array(B));
const cloneG = G => G.map(row => new Float64Array(row));
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);

function drawFromWeights(ws, masks, r) {
  let sum = 0; for (let i = 0; i < ws.length; i++) sum += ws[i];
  if (sum <= 0) return -1;
  let u = r() * sum;
  for (let i = 0; i < masks.length; i++) { u -= ws[i]; if (u <= 0) return masks[i]; }
  return masks[masks.length - 1];
}

// 4 orthogonal index-agnostic L2 rules:
//   0 = R_REPEAT: high G[a][b]
//   1 = R_SUBSET: both alpha high, low G
//   2 = R_HUB:    one alpha high, one low, low G
//   3 = R_FRESH:  both alpha low, low G
export function rulePairWeight(ruleIdx, p, alpha, G, cfg) {
  const aa = alpha[p.a], ab = alpha[p.b], g = G[p.a][p.b];
  if (ruleIdx === 0) {
    return cfg.repFloor + g * g;
  }
  const sup = 1 + cfg.gSuppress * g;
  const invSup2 = 1 / (sup * sup);
  if (ruleIdx === 1) {
    return (cfg.alphaFloor + aa) * (cfg.alphaFloor + ab) * invSup2;
  } else if (ruleIdx === 2) {
    const hi = aa > ab ? aa : ab, lo = aa > ab ? ab : aa;
    const eHi = hi > 1 ? hi - 1 : 0, eLo = lo > 1 ? lo - 1 : 0;
    const num = cfg.hubPow === 3 ? eHi * eHi * eHi : eHi * eHi;
    return (cfg.hubFloor + num / ((1 + eLo) * (1 + eLo))) * invSup2;
  } else {
    // R_FRESH: strongly prefer pairs where BOTH bits have alpha near 1 (unused)
    const ea = aa > 1 ? aa - 1 : 0, eb = ab > 1 ? ab - 1 : 0;
    const denom = (1 + ea) * (1 + eb);
    return (1 / (cfg.freshPow === 2 ? denom * denom : denom)) * invSup2;
  }
}

export function ruleMixProb(ruleIdx, mask, alpha, G, cfg) {
  let sum = 0, targetW = 0;
  for (let i = 0; i < ALL_PAIRS.length; i++) {
    const p = ALL_PAIRS[i];
    const w = rulePairWeight(ruleIdx, p, alpha, G, cfg);
    sum += w;
    if (p.mask === mask) targetW = w;
  }
  const raw = sum > 0 ? targetW / sum : 1 / ALL_PAIRS.length;
  return (1 - cfg.lsMixUnif) * raw + cfg.lsMixUnif / ALL_PAIRS.length;
}

export function softmaxN(u, beta, eps) {
  const M = u.length;
  let m = u[0]; for (let i = 1; i < M; i++) if (u[i] > m) m = u[i];
  const ex = new Array(M); let z = 0;
  for (let i = 0; i < M; i++) { ex[i] = Math.exp(beta * (u[i] - m)); z += ex[i]; }
  return ex.map(e => (1 - eps) * e / z + eps / M);
}

export class World4Bv2 {
  constructor(seed, armSpec, cfg = {}) {
    this.cfg = { ...BASE_CFG, ...cfg };
    this.arm = armSpec;
    this.seed = seed;
    this.regList = this.cfg.regimes;
    this.M = this.regList.length;
    this.rRule = rng32(mix(seed ^ 0x52554c45));
    this.rPatch = rng32(mix(seed ^ 0x50415443));
    this.rBeh = rng32(mix(seed));
    this.tick = 0; this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)]);

    this.regSlot = Math.floor(this.rRule() * this.M);
    this.regime = this.regList[this.regSlot];
    this.initRegime(this.regime);
    this.rule = this.nextSubRule(0);
    this.redrawCodes();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = [];
    this.tel = { admissions: 0, correctAdm: 0, bites: 0, evBites: 0, vals: 0, births: 0, deaths: 0, regimeMatches: 0, regimeDraws: 0 };
    for (let i = 0; i < this.cfg.founders; i++) this.spawn(null, Math.floor(this.rBeh() * N), Math.floor(this.rBeh() * N), 50, 0);
  }

  initRegime(reg) {
    const perm = shuffleInPlace([...ALL_BITS], this.rRule);
    if (reg === 0) {
      // PAIR_CYCLE: repeatPairs disjoint pairs
      const k = this.cfg.repeatPairs;
      this.regPool = [];
      for (let i = 0; i < k; i++) this.regPool.push((1 << perm[2 * i]) | (1 << perm[2 * i + 1]));
      this.regQueue = [];
    } else if (reg === 1) {
      // SUBSET_EXHAUST: subsetBits-bit subset stepped without replacement
      const S = perm.slice(0, this.cfg.subsetBits);
      const pairs = [];
      for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) pairs.push((1 << S[i]) | (1 << S[j]));
      this.regQueue = shuffleInPlace(pairs, this.rRule);
      this.regPool = S;
    } else if (reg === 2) {
      // HUB_SPOKE: 1 hub + 11 spokes without replacement
      const h = perm[0];
      const spokes = shuffleInPlace(perm.slice(1), this.rRule);
      this.regQueue = spokes.map(x => (1 << h) | (1 << x));
      this.regPool = [h];
    } else {
      // FRESH_DISJOINT: 6 disjoint pairs covering all 12 bits, without replacement
      const pairs = [];
      for (let i = 0; i < 6; i++) pairs.push((1 << perm[2 * i]) | (1 << perm[2 * i + 1]));
      this.regQueue = shuffleInPlace(pairs, this.rRule);
      this.regPool = [];
    }
  }

  nextSubRule(prevMask) {
    let m;
    if (this.regime === 0) {
      const choices = this.regPool.filter(x => x !== prevMask);
      m = choices[Math.floor(this.rRule() * choices.length)];
    } else {
      if (!this.regQueue.length) this.initRegime(this.regime);
      m = this.regQueue.pop();
    }
    return { mask: m, sign: this.rRule() < .5 ? -1 : 1 };
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
    const id = this.nextId++, arm = this.arm, M = this.M;
    const key = t => rng32(mix(this.seed ^ Math.imul(id, 2654435761) ^ t));
    const r = key(0), rProp = key(0x50524f50), rMut = key(0x4d555441), rSham = key(0x5348414d);
    const alpha = (parent && arm.usesL2) ? [...parent.alpha] : Array(B).fill(1);
    const G = arm.usesG ? (parent ? cloneG(parent.G) : zeroG()) : null;
    let u = Array(M).fill(0);
    let evorSlot = 0;
    if (arm.l3 === 'bandit' || arm.l3 === 'logscore' || arm.l3 === 'sham_bandit' || arm.l3 === 'sham_logscore' || arm.l3 === 'shadow') {
      if (parent && !arm.resetU) u = [...parent.u];
    } else if (arm.l3 === 'evor') {
      if (!parent) {
        evorSlot = arm.standing ? ((id - 1) % M) : (arm.initSlot ?? 0);
      } else {
        evorSlot = parent.evorSlot;
        if (arm.pm > 0 && rMut() < arm.pm && M > 1) {
          const others = Array.from({ length: M }, (_, i) => i).filter(x => x !== evorSlot);
          evorSlot = others[Math.floor(rMut() * others.length)];
        }
      }
    }
    const f = {
      id, x, y, energy, age: 0, gen, r, rProp, rSham,
      masks: [0], w: [0], maskAge: [0], maskVal: [true], maskSrc: [-1],
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, G, u, evorSlot, deck: [], deckPos: 0,
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
    if ((this.arm.l3 === 'bandit' || this.arm.l3 === 'sham_bandit') && !f.maskVal[i] && f.maskSrc[i] >= 0) {
      const s = f.maskSrc[i];
      f.u[s] = Math.max(-this.cfg.uCap, f.u[s] - this.cfg.uLoss);
    }
    f.masks.splice(i, 1); f.w.splice(i, 1); f.maskAge.splice(i, 1); f.maskVal.splice(i, 1); f.maskSrc.splice(i, 1);
    for (const rc of f.memory) rc.phi.splice(i, 1);
    f.predVer = -1;
  }

  drawCandidate(f, excl) {
    const arm = this.arm, cfg = this.cfg;
    if (arm.kind === 'deck') {
      for (let tries = 0; tries < 2 * ALL_PAIRS.length + 1; tries++) {
        if (f.deckPos >= f.deck.length) { f.deck = shuffleInPlace(ALL_PAIRS.map(p => p.mask), f.rProp); f.deckPos = 0; }
        const m = f.deck[f.deckPos++];
        if (!excl.has(m)) return { mask: m, src: -1 };
      }
      return { mask: -1, src: -1 };
    }
    if (arm.kind === 'scalar') {
      const masks = [], ws = [];
      for (const p of ALL_PAIRS) {
        if (excl.has(p.mask)) continue;
        masks.push(p.mask); ws.push((cfg.alphaFloor + f.alpha[p.a]) * (cfg.alphaFloor + f.alpha[p.b]));
      }
      return { mask: drawFromWeights(ws, masks, f.rProp), src: -1 };
    }
    if (arm.kind === 'pairx') {
      const masks = [], ws = [];
      for (const p of ALL_PAIRS) {
        if (excl.has(p.mask)) continue;
        masks.push(p.mask);
        ws.push((cfg.alphaFloor + f.alpha[p.a]) * (cfg.alphaFloor + f.alpha[p.b]) * (cfg.gFloor + f.G[p.a][p.b]));
      }
      return { mask: drawFromWeights(ws, masks, f.rProp), src: -1 };
    }
    let slot = 0;
    if (arm.kind === 'fixed_rule') slot = this.regList.indexOf(arm.fixedRule) >= 0 ? this.regList.indexOf(arm.fixedRule) : -1;
    else if (arm.kind === 'mix') slot = Math.floor(f.rProp() * this.M);
    else if (arm.kind === 'oracle') slot = this.regSlot;
    else if (arm.l3 === 'evor') slot = f.evorSlot;
    else if (arm.l3 === 'bandit' || arm.l3 === 'logscore' || arm.l3 === 'sham_bandit' || arm.l3 === 'sham_logscore') {
      const isB = arm.l3 === 'bandit' || arm.l3 === 'sham_bandit';
      const q = softmaxN(f.u, isB ? cfg.uBeta : cfg.lsBeta, isB ? cfg.uEps : cfg.lsEps);
      let uDraw = f.rProp(), chosen = this.M - 1;
      for (let i = 0; i < this.M; i++) { uDraw -= q[i]; if (uDraw <= 0) { chosen = i; break; } }
      if (arm.l3 === 'sham_bandit' || arm.l3 === 'sham_logscore') {
        const perm = shuffleInPlace(Array.from({ length: this.M }, (_, i) => i), f.rSham);
        slot = perm[chosen];
      } else {
        slot = chosen;
      }
    }
    const rIdx = slot >= 0 ? this.regList[slot] : arm.fixedRule;
    this.tel.regimeDraws++;
    if (rIdx === this.regime) this.tel.regimeMatches++;
    const masks = [], ws = [];
    for (const p of ALL_PAIRS) {
      if (excl.has(p.mask)) continue;
      masks.push(p.mask);
      ws.push(rulePairWeight(rIdx, p, f.alpha, f.G, cfg));
    }
    return { mask: drawFromWeights(ws, masks, f.rProp), src: slot };
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
      if (arm.l3 === 'logscore' || arm.l3 === 'sham_logscore' || arm.l3 === 'shadow') {
        for (const idx of newlyVal) {
          const m = f.masks[idx];
          for (let s = 0; s < this.M; s++) {
            const p = ruleMixProb(this.regList[s], m, f.alpha, f.G, cfg);
            f.u[s] = (1 - cfg.lsDecay) * f.u[s] + Math.log(p);
          }
          let mx = f.u[0]; for (let s = 1; s < this.M; s++) if (f.u[s] > mx) mx = f.u[s];
          for (let s = 0; s < this.M; s++) f.u[s] -= mx;
        }
      } else if (arm.l3 === 'bandit' || arm.l3 === 'sham_bandit') {
        for (const idx of newlyVal) {
          const s = f.maskSrc[idx];
          if (s >= 0) {
            for (let k = 0; k < this.M; k++) f.u[k] *= (1 - cfg.uDecay);
            f.u[s] = Math.min(cfg.uCap, f.u[s] + cfg.uWin);
          }
        }
      }
    }

    for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - cfg.alphaDecay) * (f.alpha[b] - 1));
    if (f.G) {
      for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.G[i][j] *= (1 - cfg.gDecay);
    }

    const idxs = cfg.onceVal ? newlyVal : allVal;
    for (const idx of idxs) {
      const [a, b] = pairBits(f.masks[idx]);
      f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
      f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
      if (f.G) f.G[a][b] = f.G[b][a] = Math.min(cfg.gCap, f.G[a][b] + cfg.gInc);
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
      const { mask: m, src } = this.drawCandidate(f, excl);
      if (m < 0) break;
      excl.add(m); f.buf.push({ mask: m, ev: 0, s2: 0, age: 0, src });
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
      const chosen = f.buf[bestIdx];
      if (f.masks.length >= cfg.tasteCap) {
        let j = -1;
        for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && (j < 0 || Math.abs(f.w[i]) < Math.abs(f.w[j]))) j = i;
        if (j >= 0 && Math.abs(f.w[j]) < cfg.tastePrune + 1.5) this.removeMask(f, j);
      }
      if (f.masks.length < cfg.tasteCap) {
        f.masks.push(chosen.mask); f.w.push(0); f.maskAge.push(0); f.maskVal.push(false); f.maskSrc.push(chosen.src);
        for (const rc of f.memory) rc.phi.push(walshFast(chosen.mask, rc.neg));
        f.buf.splice(bestIdx, 1);
        f.predVer = -1;
        this.tel.admissions++;
        if (chosen.mask === this.rule.mask) this.tel.correctAdm++;
      }
    }
    for (let i = f.buf.length - 1; i >= 0; i--) {
      if (f.buf[i].age >= cfg.evictAge) {
        const ev = f.buf[i];
        // Only penalize eviction if L1 actually had unexplained prediction error!
        if ((this.arm.l3 === 'bandit' || this.arm.l3 === 'sham_bandit') && ev.src >= 0 && ev.s2 >= cfg.s2MinLoss) {
          for (let k = 0; k < this.M; k++) f.u[k] *= (1 - cfg.uDecay * .15);
          f.u[ev.src] = Math.max(-cfg.uCap, f.u[ev.src] - cfg.uLoss);
        }
        f.buf.splice(i, 1);
      }
    }
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
    if (this.tick > 0 && this.tick % cfg.regimeEvery === 0 && this.M > 1) {
      const choices = Array.from({ length: this.M }, (_, i) => i).filter(i => i !== this.regSlot);
      this.regSlot = choices[Math.floor(this.rRule() * choices.length)];
      this.regime = this.regList[this.regSlot];
      this.initRegime(this.regime);
      this.rule = this.nextSubRule(0);
      this.redrawCodes();
    } else if (this.tick > 0 && this.tick % cfg.subEvery === 0) {
      this.rule = this.nextSubRule(this.rule.mask);
      this.redrawCodes();
    } else if (this.tick > 0 && this.tick % cfg.shiftEvery === 0) this.redrawCodes();

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
        f.rbar += .02 * (rew - f.rbar);
        for (let j = 0; j < f.moveW.length; j++) { f.moveTrace[j] = .8 * f.moveTrace[j] + f.movePending.base[j]; f.moveW[j] = clip(f.moveW[j] + .05 * delta * f.moveTrace[j], 8); }
      }
      const qmax = Math.max(...qs), ties = [];
      for (let d = 0; d < 5; d++) if (qs[d] >= qmax - 1e-9) ties.push(d);
      let dir = ties[Math.floor(f.r() * ties.length)];
      if (f.r() < .08) dir = Math.floor(f.r() * 5);
      f.movePending = { base: bases[dir], reward: 0 };
      const from = this.cell(f.x, f.y); occ.set(from, occ.get(from) - 1);
      f.x = (f.x + MOVES[dir][0] + N) % N; f.y = (f.y + MOVES[dir][1] + N) % N;
      const to = this.cell(f.x, f.y); occ.set(to, (occ.get(to) ?? 0) + 1);
      f.energy -= cfg.metabolism + (dir ? cfg.moveCost : 0) + cfg.brainCost * (f.masks.length + MOVE0.length);
      const pl = this.plant[to];
      if (pl && pl.amount > .2) {
        const neg = this.codesNeg[pl.kind], pred = f.rawPred[pl.kind];
        if (pred > cfg.acceptAt || f.r() < cfg.tasteEps) {
          const take = Math.min(pl.amount, cfg.bite); pl.amount -= take;
          const good = this.kindValence[pl.kind] > 0;
          f.energy += good ? take : -take * cfg.toxin;
          this.tel.bites++;
          const lab = (good ? 1 : 0) ^ (f.r() < cfg.labelNoise ? 1 : 0);
          this.tasteLearn(f, neg, lab, pl.kind);
        }
      }
      f.energy = Math.min(cfg.maxEnergy, f.energy); f.age++;
      f.movePending.reward = (f.energy - e0) / 4;
      if (f.energy >= 60 && this.flies.length + born.length < cfg.capacity) {
        f.energy -= cfg.birthCost;
        born.push([f, (f.x + Math.floor(f.r() * 3) - 1 + N) % N, (f.y + Math.floor(f.r() * 3) - 1 + N) % N]);
      }
    }
    const alive = [];
    for (const f of this.flies) { if (f.energy <= 0 || f.age >= cfg.maxAge) { this.tel.deaths++; } else alive.push(f); }
    this.flies = alive;
    for (const [p, x, y] of born) this.spawn(p, x, y, cfg.childEnergy, p.gen + 1);
    this.tick++;
  }
}

export function runOne(seed, armSpec, cfg = {}) {
  const w = new World4Bv2(seed, armSpec, cfg);
  let popSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; }
  }
  return {
    seed, popSum, pop: popSum / nLate,
    regimeAcc: w.tel.regimeDraws ? w.tel.regimeMatches / w.tel.regimeDraws : 0,
    correctAdm: w.tel.correctAdm, vals: w.tel.vals,
  };
}
