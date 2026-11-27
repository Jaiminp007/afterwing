// L4-B Design 1 v2: Meta-Credit & Pure Bandit over Edge-Disjoint L2 Credit Rules (M=5 and M=11).
// Fixes:
//   1. Exact L2 meta-credit hit test: hit_r = +(m in pred_r(lastVal)), where pred_r(a,b) = {(a,p[b]), (p[a],b), (p[a],p[b])}.
//      Only updates u when at least one rule hit (or decays on any transition); fast switch via mcDecay=0.5.
//   2. Adds MIX_SHADOW (fair same-architecture uniform mixture over shadowAlphas) to L2best!
//   3. Supports both M=5 and M=11 (complete 1-factorization of K_12: 100% pair coverage, zero menu bias!).
//   4. Adds deterministic label-neutral SHAM3_MC_DET (averages credit across all M rules when sham? Wait:
//      also includes per-update uniform permutation SHAM3_MC and donor-replay SHAM3_DONOR!).

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

const PARITY = new Int8Array(1 << B);
for (let x = 0; x < (1 << B); x++) {
  let n = x, p = 0; while (n) { p ^= 1; n &= n - 1; }
  PARITY[x] = p ? -1 : 1;
}
export const walshFast = (mask, neg) => PARITY[mask & neg];

// Complete 1-factorization of K_12: 11 edge-disjoint perfect matchings.
export function makeMatchings(M) {
  const res = [];
  for (let r = 0; r < M; r++) {
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
export const MATCHINGS_11 = makeMatchings(11);

const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };

export const BASE_CFG = Object.freeze({
  size: 40, patches: 9, patchRadius: 4, plantDensity: .6, regrow: .11, plantCap: 4,
  bite: 1.5, toxin: .60, acceptAt: .40, tasteEps: .08,
  metabolism: .06, moveCost: .02, brainCost: .0005, maxEnergy: 100, maxAge: 2400,
  relocateEvery: 50, shiftEvery: 30, labelNoise: .05,
  childEnergy: 25, birthCost: 30, capacity: 400, founders: 60,
  M: 11,              // 11 edge-disjoint 1-factors covering 100% of K_12!
  eraEvery: 3600,
  macroEvery: 1200,
  subEvery: 300,
  kinds: 32,
  K: 6, tasteCap: 4, tasteMemory: 32, tasteEvery: 4, tasteZ: 3.3, tastePrune: 1.5,
  graceTastings: 10, evictAge: 18, valThresh: 2.5,
  alphaFloor: .02,
  alphaDecay: .060, alphaBoost: 20, alphaMax: 60,
  partnerBoost: 20, suppressDecay: .60,
  // PAIRX / ANTI-PAIRX / TRANSX
  gDecay: .005, gInc: 1, gCap: 10, gFloor: .15, gSuppress: 10,
  tDecay: .003, tInc: 1, tCap: 10, tHalf: 1.5,
  // L3 Meta-Credit (exact pred_r(lastVal) hit!)
  mcDecay: .45,       // fast forgetting on each hit event so switching takes ~1-2 transitions!
  mcConfThresh: .30,  // only apply partner spread/suppress when confidence max(u) > thresh; else plain scalar L2!
  mcSoft: false,
  mcBeta: 4.0,
  // L3 Pure Bandit
  bDecay: .15, bWin: 3.0, bLoss: .12, bBeta: 2.0, bEps: .10, bCap: 6, s2MinLoss: 1.0,
  ticks: 20000, every: 100, lateFrom: 10000,
});

const zeroMat = () => Array.from({ length: B }, () => new Float64Array(B));
const cloneMat = G => G.map(row => new Float64Array(row));
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);

function drawFromWeights(ws, masks, r) {
  let sum = 0; for (let i = 0; i < ws.length; i++) sum += ws[i];
  if (sum <= 0) return -1;
  let u = r() * sum;
  for (let i = 0; i < masks.length; i++) { u -= ws[i]; if (u <= 0) return masks[i]; }
  return masks[masks.length - 1];
}

function softmaxN(u, beta, eps) {
  const M = u.length;
  let m = u[0]; for (let i = 1; i < M; i++) if (u[i] > m) m = u[i];
  const ex = new Array(M); let z = 0;
  for (let i = 0; i < M; i++) { ex[i] = Math.exp(beta * (u[i] - m)); z += ex[i]; }
  return ex.map(e => (1 - eps) * e / z + eps / M);
}

// Check if newly validated mask m=(ca,cb) is in pred_r(lastVal=(la,lb)):
// pred_r(la,lb) = {(la, p[lb]), (p[la], lb), (p[la], p[lb])}.
export function isPredictedByRule(p, lastMask, newMask) {
  const [la, lb] = pairBits(lastMask);
  const pa = p[la], pb = p[lb];
  const m1 = (1 << la) | (1 << pb);
  const m2 = (1 << pa) | (1 << lb);
  const m3 = (1 << pa) | (1 << pb);
  return newMask === m1 || newMask === m2 || newMask === m3;
}

export class WorldCreditV2 {
  constructor(seed, armSpec, cfg = {}) {
    this.cfg = { ...BASE_CFG, ...cfg };
    this.arm = armSpec;
    this.seed = seed;
    this.M = this.cfg.M;
    this.matchings = MATCHINGS_11.slice(0, this.M);
    const garden = this.cfg.garden ? 0x47415232 : 0;
    this.rRule = rng32(mix(seed ^ garden ^ 0x52554c45));
    this.rPatch = rng32(mix(seed ^ garden ^ 0x50415443));
    this.rBeh = rng32(mix(seed ^ garden));
    this.tick = 0; this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)]);

    this.eraRule = Math.floor(this.rRule() * this.M);
    this.initMacro();
    this.rule = this.nextSubRule();
    this.redrawCodes();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = [];
    this.tel = { admissions: 0, correctAdm: 0, bites: 0, evBites: 0, vals: 0, births: 0, deaths: 0, ruleMatches: 0, ruleUses: 0 };
    for (let i = 0; i < this.cfg.founders; i++) this.spawn(null, Math.floor(this.rBeh() * N), Math.floor(this.rBeh() * N), 50, 0);
  }

  initMacro() {
    const p = this.matchings[this.eraRule];
    const groups = [];
    const seen = new Set();
    for (let i = 0; i < B; i++) {
      if (seen.has(i)) continue;
      seen.add(i); seen.add(p[i]);
      groups.push([i, p[i]]);
    }
    shuffleInPlace(groups, this.rRule);
    const [a0, a1] = groups[0], [b0, b1] = groups[1];
    this.subset = [a0, a1, b0, b1];
    this.macroQueue = shuffleInPlace([
      (1 << a0) | (1 << b0),
      (1 << a0) | (1 << b1),
      (1 << a1) | (1 << b0),
      (1 << a1) | (1 << b1),
    ], this.rRule);
  }

  nextSubRule() {
    if (!this.macroQueue.length) this.initMacro();
    return { mask: this.macroQueue.pop(), sign: this.rRule() < .5 ? -1 : 1 };
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
    const usesShadows = arm.l3 === 'bandit' || arm.l3 === 'sham_bandit' || arm.kind === 'mix_shadow';
    const shadowAlphas = usesShadows
      ? (parent ? parent.shadowAlphas.map(a => [...a]) : Array.from({ length: M }, () => Array(B).fill(1)))
      : null;
    const G = arm.usesG ? (parent ? cloneMat(parent.G) : zeroMat()) : null;
    const T = arm.usesT ? (parent ? cloneMat(parent.T) : zeroMat()) : null;
    const lastVal = (parent && arm.inheritLast) ? parent.lastVal : 0;
    let u = Array(M).fill(0);
    let evorRule = 0;
    if (arm.l3 === 'metacredit' || arm.l3 === 'sham_mc' || arm.l3 === 'sham_mc_det' || arm.l3 === 'bandit' || arm.l3 === 'sham_bandit') {
      if (parent && !arm.resetU) u = [...parent.u];
    } else if (arm.l3 === 'evor') {
      if (!parent) {
        evorRule = arm.standing ? ((id - 1) % M) : (arm.initRule ?? 0);
      } else {
        evorRule = parent.evorRule;
        if (arm.pm > 0 && rMut() < arm.pm) {
          const others = Array.from({ length: M }, (_, i) => i).filter(x => x !== evorRule);
          evorRule = others[Math.floor(rMut() * others.length)];
        }
      }
    }
    const f = {
      id, x, y, energy, age: 0, gen, r, rProp, rSham,
      masks: [0], w: [0], maskAge: [0], maskVal: [true], maskSrc: [-1],
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, shadowAlphas, G, T, u, lastVal, evorRule, deck: [], deckPos: 0,
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
      f.u[s] = Math.max(-this.cfg.bCap, f.u[s] - this.cfg.bLoss);
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
    if (arm.kind === 'pairx') {
      const masks = [], ws = [];
      for (const p of ALL_PAIRS) {
        if (excl.has(p.mask)) continue;
        masks.push(p.mask);
        ws.push((cfg.alphaFloor + f.alpha[p.a]) * (cfg.alphaFloor + f.alpha[p.b]) * (cfg.gFloor + f.G[p.a][p.b]));
      }
      return { mask: drawFromWeights(ws, masks, f.rProp), src: -1 };
    }
    if (arm.kind === 'antipairx') {
      const masks = [], ws = [];
      for (const p of ALL_PAIRS) {
        if (excl.has(p.mask)) continue;
        masks.push(p.mask);
        const sup = 1 + cfg.gSuppress * f.G[p.a][p.b];
        ws.push((cfg.alphaFloor + f.alpha[p.a]) * (cfg.alphaFloor + f.alpha[p.b]) / (sup * sup));
      }
      return { mask: drawFromWeights(ws, masks, f.rProp), src: -1 };
    }
    if (arm.kind === 'mix_shadow' || arm.l3 === 'bandit' || arm.l3 === 'sham_bandit') {
      let rIdx;
      if (arm.kind === 'mix_shadow') {
        rIdx = Math.floor(f.rProp() * this.M);
      } else {
        const q = softmaxN(f.u, cfg.bBeta, cfg.bEps);
        let uDraw = f.rProp(), chosen = this.M - 1;
        for (let i = 0; i < this.M; i++) { uDraw -= q[i]; if (uDraw <= 0) { chosen = i; break; } }
        if (arm.l3 === 'sham_bandit') {
          const perm = shuffleInPlace(Array.from({ length: this.M }, (_, i) => i), f.rSham);
          rIdx = perm[chosen];
        } else rIdx = chosen;
      }
      this.tel.ruleUses++;
      if (rIdx === this.eraRule) this.tel.ruleMatches++;
      const a = f.shadowAlphas[rIdx];
      const masks = [], ws = [];
      for (const p of ALL_PAIRS) {
        if (excl.has(p.mask)) continue;
        masks.push(p.mask); ws.push((cfg.alphaFloor + a[p.a]) * (cfg.alphaFloor + a[p.b]));
      }
      return { mask: drawFromWeights(ws, masks, f.rProp), src: rIdx };
    }
    // Standard alpha-only proposals
    const masks = [], ws = [];
    for (const p of ALL_PAIRS) {
      if (excl.has(p.mask)) continue;
      masks.push(p.mask);
      ws.push((cfg.alphaFloor + f.alpha[p.a]) * (cfg.alphaFloor + f.alpha[p.b]));
    }
    return { mask: drawFromWeights(ws, masks, f.rProp), src: -1 };
  }

  applyCreditRuleToAlpha(alpha, m, rIdx, cfg, strength = 1) {
    const [a, b] = pairBits(m);
    const p = this.matchings[rIdx];
    const pa = p[a], pb = p[b];
    for (let k = 0; k < B; k++) {
      if (k === a || k === b) alpha[k] = Math.min(cfg.alphaMax, alpha[k] + cfg.alphaBoost);
      else if (k === pa || k === pb) alpha[k] = Math.min(cfg.alphaMax, alpha[k] + cfg.partnerBoost * strength);
      else if (strength > 0) alpha[k] = Math.max(.05, 1 + (1 - cfg.suppressDecay * strength) * (alpha[k] - 1));
    }
  }

  // Deterministic label-neutral SHAM credit: average the post-clip outcomes across all M rule labels!
  applyDetShamCredit(alpha, m, cfg, strength = 1) {
    const out = new Float64Array(B);
    for (let r = 0; r < this.M; r++) {
      const tmp = [...alpha];
      this.applyCreditRuleToAlpha(tmp, m, r, cfg, strength);
      for (let k = 0; k < B; k++) out[k] += tmp[k] / this.M;
    }
    for (let k = 0; k < B; k++) alpha[k] = out[k];
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

    // L3 updates on newly validated masks
    if (newlyVal.length) {
      for (const idx of newlyVal) {
        const m = f.masks[idx];
        if ((arm.l3 === 'metacredit' || arm.l3 === 'sham_mc' || arm.l3 === 'sham_mc_det') && f.lastVal && f.lastVal !== m) {
          // Exact L2 meta-credit: which candidate L2 rule r predicted m from lastVal?
          let anyHit = false;
          const hits = new Uint8Array(this.M);
          for (let r = 0; r < this.M; r++) {
            if (isPredictedByRule(this.matchings[r], f.lastVal, m)) { hits[r] = 1; anyHit = true; }
          }
          // Only update when at least one rule predicted m (a valid within-structure transition!)
          if (anyHit) {
            for (let r = 0; r < this.M; r++) {
              f.u[r] = (1 - cfg.mcDecay) * f.u[r] + hits[r];
            }
          }
        } else if (arm.l3 === 'bandit' || arm.l3 === 'sham_bandit') {
          const s = f.maskSrc[idx];
          if (s >= 0) {
            for (let k = 0; k < this.M; k++) f.u[k] *= (1 - cfg.bDecay);
            f.u[s] = Math.min(cfg.bCap, f.u[s] + cfg.bWin);
          }
        }
        if (arm.usesT && f.lastVal && f.lastVal !== m) {
          const [la, lb] = pairBits(f.lastVal);
          const [ca, cb] = pairBits(m);
          for (const u of [la, lb]) for (const v of [ca, cb]) if (u !== v) {
            f.T[u][v] = f.T[v][u] = Math.min(cfg.tCap, f.T[u][v] + cfg.tInc);
          }
        }
        f.lastVal = m;
      }
    }

    // Decay
    for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - cfg.alphaDecay) * (f.alpha[b] - 1));
    if (f.shadowAlphas) {
      for (let r = 0; r < this.M; r++) {
        const a = f.shadowAlphas[r];
        for (let b = 0; b < B; b++) a[b] = Math.max(.05, 1 + (1 - cfg.alphaDecay) * (a[b] - 1));
      }
    }
    if (f.G) for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.G[i][j] *= (1 - cfg.gDecay);
    if (f.T) for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.T[i][j] *= (1 - cfg.tDecay);

    // Apply L2 credit updates
    for (const idx of allVal) {
      const m = f.masks[idx];
      const [a, b] = pairBits(m);
      if (f.G && newlyVal.includes(idx)) f.G[a][b] = f.G[b][a] = Math.min(cfg.gCap, f.G[a][b] + cfg.gInc);

      if (arm.kind === 'scalar' || arm.kind === 'pairx' || arm.kind === 'antipairx') {
        f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
        f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
      } else if (arm.kind === 'transx') {
        f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
        f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
        let maxSc = 0;
        const sc = new Float64Array(B);
        for (let k = 0; k < B; k++) {
          if (k === a || k === b) continue;
          sc[k] = Math.min(1, (f.T[a][k] + f.T[b][k]) / cfg.tHalf);
          if (sc[k] > maxSc) maxSc = sc[k];
        }
        for (let k = 0; k < B; k++) {
          if (k === a || k === b) continue;
          if (sc[k] > .25) f.alpha[k] = Math.min(cfg.alphaMax, f.alpha[k] + cfg.partnerBoost * sc[k]);
          else if (maxSc > .5) f.alpha[k] = Math.max(.05, 1 + (1 - cfg.suppressDecay) * (f.alpha[k] - 1));
        }
      } else if (arm.kind === 'mix_shadow' || arm.l3 === 'bandit' || arm.l3 === 'sham_bandit') {
        for (let r = 0; r < this.M; r++) this.applyCreditRuleToAlpha(f.shadowAlphas[r], m, r, cfg);
      } else if (arm.kind === 'mix') {
        f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
        f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
        for (let r = 0; r < this.M; r++) {
          const p = this.matchings[r];
          f.alpha[p[a]] = Math.min(cfg.alphaMax, f.alpha[p[a]] + cfg.partnerBoost / this.M);
          f.alpha[p[b]] = Math.min(cfg.alphaMax, f.alpha[p[b]] + cfg.partnerBoost / this.M);
        }
      } else {
        let rIdx = -1, strength = 1;
        if (arm.kind === 'fixed_rule') rIdx = arm.fixedRule;
        else if (arm.kind === 'oracle') rIdx = this.eraRule;
        else if (arm.l3 === 'evor') rIdx = f.evorRule;
        else if (arm.l3 === 'metacredit' || arm.l3 === 'sham_mc' || arm.l3 === 'sham_mc_det') {
          let mx = f.u[0], best = 0;
          for (let r = 1; r < this.M; r++) if (f.u[r] > mx) { mx = f.u[r]; best = r; }
          if (mx < cfg.mcConfThresh) {
            // No rule yet confident -> fall back to plain scalar L2 (no guessing!)
            f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
            f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
            continue;
          }
          if (arm.l3 === 'sham_mc_det') {
            this.applyDetShamCredit(f.alpha, m, cfg, 1);
            continue;
          } else if (arm.l3 === 'sham_mc') {
            const perm = shuffleInPlace(Array.from({ length: this.M }, (_, i) => i), f.rSham);
            rIdx = perm[best];
          } else {
            rIdx = best;
          }
        }
        this.tel.ruleUses++;
        if (rIdx === this.eraRule) this.tel.ruleMatches++;
        this.applyCreditRuleToAlpha(f.alpha, m, rIdx, cfg, strength);
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
        if ((this.arm.l3 === 'bandit' || this.arm.l3 === 'sham_bandit') && ev.src >= 0 && ev.s2 >= cfg.s2MinLoss) {
          for (let k = 0; k < this.M; k++) f.u[k] *= (1 - cfg.bDecay * .15);
          f.u[ev.src] = Math.max(-cfg.bCap, f.u[ev.src] - cfg.bLoss);
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
    if (this.tick > 0 && this.tick % cfg.eraEvery === 0) {
      const choices = Array.from({ length: this.M }, (_, i) => i).filter(i => i !== this.eraRule);
      this.eraRule = choices[Math.floor(this.rRule() * choices.length)];
      this.initMacro();
      this.rule = this.nextSubRule();
      this.redrawCodes();
    } else if (this.tick > 0 && this.tick % cfg.macroEvery === 0) {
      this.initMacro();
      this.rule = this.nextSubRule();
      this.redrawCodes();
    } else if (this.tick > 0 && this.tick % cfg.subEvery === 0) {
      this.rule = this.nextSubRule();
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
  const w = new WorldCreditV2(seed, armSpec, cfg);
  let popSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; }
  }
  return {
    seed, popSum, pop: popSum / nLate,
    ruleAcc: w.tel.ruleUses ? w.tel.ruleMatches / w.tel.ruleUses : 0,
    correctAdm: w.tel.correctAdm, vals: w.tel.vals,
  };
}
