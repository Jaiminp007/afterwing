// L3-V: learned proposal grammar ("where L1 searches"). A constructed, self-contained
// world, separate from sim.mjs; the default-world fingerprint is untouched.
// Origin: Gemini 4 Neon's exploratory prototype (scratch/advice-gemini/test_design_a.mjs,
// seeds 601-616), adapted by Claude (Opus 5.5) after an adversarial review by
// GPT-6.2 Astra / GPT-5.6 Sol: exogenous RNG streams, information-neutral SHAM,
// shuffled-deck FIXED candidate, standing-variation EVO-R, REUSE and META_RESET
// comparators, an oracle support fix, integer endpoints. Registration:
// docs/FLY_RSI_GOALS.md, section "L3-V".
//
// World: 12-bit odors, 32 balanced kinds redrawn every 30 ticks. A secret 4-bit causal
// subset S changes every 3600 ticks; inside S, the active target pair (one of 6) and its
// sign change every 300 ticks. Valence = sign * walsh(pair, odor).
// Fly: L0 logistic taste learner over its mask list (bias only at birth). L1 keeps K=6
// candidate pairs drawn from a proposal distribution, admits the strongest by
// |ev|/sqrt(s2) > tasteZ, prunes weak masks. L2 (META) raises a per-bit affinity alpha
// when an admitted mask survives grace with a strong weight; L1 samples pairs with
// weight (floor+alpha_i)(floor+alpha_j). Children inherit alpha (not masks, not weights).

export function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
export const walsh = (mask, bits) => { let v = 1; for (let b = 0; b < bits.length; b++) if ((mask >>> b) & 1) v *= bits[b]; return v; };
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const B = 12;
const ALL_BITS = Array.from({ length: B }, (_, i) => i);
export const ALL_PAIRS = [];
for (let i = 0; i < B; i++) for (let j = i + 1; j < B; j++) ALL_PAIRS.push({ mask: (1 << i) | (1 << j), a: i, b: j });

const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };

export const BASE_CFG = Object.freeze({
  size: 40, patches: 9, patchRadius: 4, plantDensity: .6, regrow: .11, plantCap: 4,
  bite: 1.5, toxin: .60, acceptAt: .40, tasteEps: .08,
  metabolism: .06, moveCost: .02, brainCost: .0005, maxEnergy: 100, maxAge: 2400,
  relocateEvery: 50, shiftEvery: 30, labelNoise: .05,
  childEnergy: 25, birthCost: 30, capacity: 400, founders: 60,
  macroEvery: 3600, subEvery: 300, subsetSize: 4, kinds: 32,
  K: 6, tasteCap: 4, tasteMemory: 32, tasteEvery: 4, tasteZ: 3.3, tastePrune: 1.5,
  graceTastings: 10, evictAge: 18, valThresh: 2.5,
  alphaBoost: 4.0, alphaDecay: .006, alphaMax: 30, alphaFloor: .02,
  reuseP: .5, reuseCap: 6,
  ticks: 20000, every: 100, lateFrom: 10000,
});

// Arms. l1: structural revision on. l2 names the proposal controller:
//   none   uniform proposals          deck   per-fly shuffled deck of all 66 pairs
//   meta   learned alpha (inherited)  reset  learned alpha, newborn alpha reset to 1
//   shamn  META's alpha updates and inheritance, but eligible pair weights are freshly
//          permuted among eligible labels before every draw (information-neutral)
//   shamp  boosts land on bits relabelled by a private permutation (scrambling diagnostic)
//   evor   inherited alpha with birth mutation only     reuse  cached validated exact masks
//   oracle proposals confined to the true S
export const ARMS = {
  NOREV: { l1: false, l2: 'none' },
  METAOFF: { l1: false, l2: 'meta' },
  FIXED_U: { l1: true, l2: 'none' },
  FIXED_DECK: { l1: true, l2: 'deck' },
  META: { l1: true, l2: 'meta' },
  META_RESET: { l1: true, l2: 'reset' },
  SHAM: { l1: true, l2: 'shamn' },
  SHAM_PERM: { l1: true, l2: 'shamp' },
  EVOR: { l1: true, l2: 'evor' },
  REUSE: { l1: true, l2: 'reuse' },
  ORACLE_L2: { l1: true, l2: 'oracle' },
  TRUE_ORACLE: { l1: false, l2: 'none', trueOracle: true },
};
const LEARNS_ALPHA = new Set(['meta', 'reset', 'shamn', 'shamp']);
const INHERITS_ALPHA = new Set(['meta', 'shamn', 'shamp', 'evor']);

// EVO-R grid (stage A locks the variant with the highest mean late population).
// pm: per-birth mutation probability. logn: 2 random bits x exp(U(-1,1)*step).
// jump: one random bit set to alphaMax (p=.5) or reset to 1.
// swap (standing variation): founders get 4 random bits at alphaMax; at birth, with pm,
// one high bit and one low bit swap values.
export const EVOR_GRID = {
  E0: { pm: 0 },
  L10: { pm: .10, kind: 'logn', step: 1 }, L25: { pm: .25, kind: 'logn', step: 1 }, L50: { pm: .50, kind: 'logn', step: 1 },
  J10: { pm: .10, kind: 'jump' }, J25: { pm: .25, kind: 'jump' }, J50: { pm: .50, kind: 'jump' },
  SV25: { pm: .25, kind: 'swap', standing: true },
};

function makeSubset(r, k) { return shuffleInPlace([...ALL_BITS], r).slice(0, k).sort((a, b) => a - b); }
function makeSubRule(r, subset, prevMask = 0) {
  const pairs = [];
  for (let i = 0; i < subset.length; i++) for (let j = i + 1; j < subset.length; j++) {
    const m = (1 << subset[i]) | (1 << subset[j]);
    if (m !== prevMask) pairs.push(m);
  }
  const m = pairs[Math.floor(r() * pairs.length)];
  return { subset, mask: m, sign: r() < .5 ? -1 : 1, target: [m] };
}
const ruleValence = (rule, bits) => rule.sign * walsh(rule.mask, bits);

// Weighted draw over eligible pairs; pairs with nonpositive weight are never eligible.
// If permR is given, the eligible weights are permuted among the eligible labels first.
export function samplePair(alpha, excl, r, floor, permR = null) {
  const masks = [], ws = [];
  for (const p of ALL_PAIRS) {
    if (excl.has(p.mask)) continue;
    const w = (floor + alpha[p.a]) * (floor + alpha[p.b]);
    if (w > 0) { masks.push(p.mask); ws.push(w); }
  }
  if (!masks.length) return -1;
  if (permR) shuffleInPlace(ws, permR);
  let sum = 0; for (const w of ws) sum += w;
  let u = r() * sum;
  for (let i = 0; i < masks.length; i++) { u -= ws[i]; if (u <= 0) return masks[i]; }
  return masks[masks.length - 1];
}
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);

export class WorldV {
  constructor(seed, armName, cfg = {}) {
    this.cfg = { ...BASE_CFG, ...cfg };
    this.armName = armName;
    this.arm = ARMS[armName];
    if (!this.arm) throw Error(`unknown arm ${armName}`);
    this.evor = this.arm.l2 === 'evor' ? EVOR_GRID[this.cfg.evorVariant] : null;
    if (this.arm.l2 === 'evor' && !this.evor) throw Error('EVOR needs cfg.evorVariant');
    this.seed = seed;
    // Exogenous streams (identical across arms for a seed) and a behavioral stream.
    this.rRule = rng32(mix(seed ^ 0x52554c45));
    this.rPatch = rng32(mix(seed ^ 0x50415443));
    this.rBeh = rng32(mix(seed));
    this.tick = 0; this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)]);
    this.subset = makeSubset(this.rRule, this.cfg.subsetSize);
    this.rule = makeSubRule(this.rRule, this.subset, 0);
    this.redrawCodes();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = [];
    this.tel = { admissions: 0, correctAdm: 0, inSubsetAdm: 0, bites: 0, evBites: 0, l2Updates: 0, births: 0, deaths: 0, deathAgeSum: 0 };
    for (let i = 0; i < this.cfg.founders; i++) this.spawn(null, Math.floor(this.rBeh() * N), Math.floor(this.rBeh() * N), 50, 0);
  }

  redrawCodes() {
    const half = this.cfg.kinds / 2, seen = new Set(), good = [], bad = [];
    while (good.length < half || bad.length < half) {
      const c = Math.floor(this.rRule() * (1 << B));
      if (seen.has(c)) continue; seen.add(c);
      const bits = ALL_BITS.map(b => ((c >>> b) & 1) ? 1 : -1);
      const v = ruleValence(this.rule, bits);
      if (v > 0 && good.length < half) good.push(bits);
      else if (v < 0 && bad.length < half) bad.push(bits);
    }
    this.codes = shuffleInPlace([...good, ...bad], this.rRule);
    this.kindValence = this.codes.map(bits => ruleValence(this.rule, bits));
  }

  // Plant presence and kind depend only on relocations (eating lowers amount, never removes).
  seedPatch(i) {
    const [cx, cy] = this.patchCenters[i], N = this.cfg.size, R = this.cfg.patchRadius;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
      if (dx * dx + dy * dy > R * R || this.rPatch() > this.cfg.plantDensity) continue;
      const x = (cx + dx + N) % N, y = (cy + dy + N) % N, k = y * N + x;
      if (!this.plant[k]) this.plant[k] = { kind: Math.floor(this.rPatch() * this.codes.length), amount: this.cfg.plantCap * this.rPatch(), patch: i };
    }
  }
  cell(x, y) { const N = this.cfg.size; return ((y + N) % N) * N + ((x + N) % N); }

  spawn(parent, x, y, energy, gen) {
    const id = this.nextId++, cfg = this.cfg, l2 = this.arm.l2;
    const key = t => rng32(mix(this.seed ^ Math.imul(id, 2654435761) ^ t));
    const r = key(0), rProp = key(0x50524f50), rMut = key(0x4d555441), rSham = key(0x5348414d);
    const masks = this.arm.trueOracle ? [0, ...this.rule.target] : [0];
    let alpha = Array(B).fill(1), cache = [];
    if (parent && INHERITS_ALPHA.has(l2)) alpha = [...parent.alpha];
    if (parent && l2 === 'reuse') cache = [...parent.cache];
    if (l2 === 'evor' && this.evor.standing && !parent) {
      for (const b of shuffleInPlace([...ALL_BITS], rMut).slice(0, 4)) alpha[b] = cfg.alphaMax;
    }
    if (parent && l2 === 'evor' && this.evor.pm > 0 && rMut() < this.evor.pm) {
      if (this.evor.kind === 'logn') {
        for (let t = 0; t < 2; t++) { const bi = Math.floor(rMut() * B); alpha[bi] = Math.max(.05, Math.min(cfg.alphaMax, alpha[bi] * Math.exp((rMut() * 2 - 1) * this.evor.step))); }
      } else if (this.evor.kind === 'jump') {
        const bi = Math.floor(rMut() * B); alpha[bi] = rMut() < .5 ? cfg.alphaMax : 1;
      } else if (this.evor.kind === 'swap') {
        const hi = ALL_BITS.filter(b => alpha[b] > 1), lo = ALL_BITS.filter(b => alpha[b] <= 1);
        if (hi.length && lo.length) { const a = hi[Math.floor(rMut() * hi.length)], b = lo[Math.floor(rMut() * lo.length)]; [alpha[a], alpha[b]] = [alpha[b], alpha[a]]; }
      }
    }
    const shamPerm = l2 === 'shamp' ? shuffleInPlace([...ALL_BITS], rSham) : null;
    const f = {
      id, x, y, energy, age: 0, gen, r, rProp, rSham,
      masks, w: Array(masks.length).fill(0), maskAge: masks.map(() => 0),
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, cache, shamPerm, deck: [], deckPos: 0,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
    };
    this.flies.push(f);
    if (parent) this.tel.births++;
    return f;
  }

  modelProb(f, bits) {
    const n = f.masks.length; let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * walsh(f.masks[i], bits) / Math.sqrt(n);
    return sigmoid(z);
  }
  tastePredict(f, bits) {
    const gate = f.lossModel !== undefined && f.lossModel >= f.lossBase;
    return .05 + .9 * (gate ? f.base : this.modelProb(f, bits));
  }
  tasteUpdate(f, phi, target) {
    const n = phi.length; let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n);
    const step = 4.0 * (target - sigmoid(z)) / Math.sqrt(n);
    for (let i = 0; i < n; i++) f.w[i] = clip(f.w[i] + step * phi[i], 8);
  }
  removeMask(f, i) { f.masks.splice(i, 1); f.w.splice(i, 1); f.maskAge.splice(i, 1); for (const rc of f.memory) rc.phi.splice(i, 1); }

  // Effective proposal weights over bits, and the floor.
  proposal(f) {
    if (this.arm.l2 === 'oracle') { const a = Array(B).fill(0); for (const b of this.subset) a[b] = 10; return [a, 0]; }
    return [f.alpha, this.cfg.alphaFloor];
  }
  drawCandidate(f, excl) {
    const l2 = this.arm.l2;
    if (l2 === 'deck') {
      for (let tries = 0; tries < 2 * ALL_PAIRS.length + 1; tries++) {
        if (f.deckPos >= f.deck.length) { f.deck = shuffleInPlace(ALL_PAIRS.map(p => p.mask), f.rProp); f.deckPos = 0; }
        const m = f.deck[f.deckPos++];
        if (!excl.has(m)) return m;
      }
      return -1;
    }
    if (l2 === 'reuse' && f.cache.length && f.rProp() < this.cfg.reuseP) {
      const c = f.cache.filter(x => !excl.has(x));
      if (c.length) return c[Math.floor(f.rProp() * c.length)];
    }
    const [alpha, floor] = this.proposal(f);
    return samplePair(alpha, excl, f.rProp, floor, l2 === 'shamn' ? f.rSham : null);
  }

  tasteLearn(f, bits, target, kind) {
    const cfg = this.cfg;
    // L0 (identical in every arm)
    const phi = f.masks.map(m => walsh(m, bits));
    const n = phi.length; let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n);
    const pm0 = sigmoid(z), residual = target - pm0;
    const pm = Math.min(1 - 1e-3, Math.max(1e-3, pm0)), pb = Math.min(1 - 1e-3, Math.max(1e-3, f.base));
    const ll = p => -(target ? Math.log(p) : Math.log(1 - p));
    if (f.lossModel === undefined) { f.lossModel = ll(pm); f.lossBase = ll(pb); }
    else { f.lossModel += .05 * (ll(pm) - f.lossModel); f.lossBase += .05 * (ll(pb) - f.lossBase); }
    f.base += .05 * (target - f.base);
    const rec = { bits, phi, target };
    f.seen++;
    if (f.memory.length < 32) f.memory.push(rec); else f.memory[(f.seen - 1) % 32] = rec; // FIFO: overwrite the oldest
    this.tasteUpdate(f, phi, target);
    const rep = f.memory[Math.floor(f.r() * f.memory.length)];
    this.tasteUpdate(f, rep.phi, rep.target);
    for (let i = 0; i < f.maskAge.length; i++) f.maskAge[i]++;

    if (!this.arm.l1) return; // NOREV, METAOFF, TRUE_ORACLE: no structural revision, so no L2 input
    if (kind === f.lastKind) return;
    f.lastKind = kind; this.tel.evBites++;
    const D = 1 - 1 / cfg.tasteMemory, D2 = D * D;
    f.n++;

    // L1: refill candidate buffer from the proposal distribution
    const excl = new Set(f.masks); for (const s of f.buf) excl.add(s.mask);
    while (f.buf.length < cfg.K) {
      const m = this.drawCandidate(f, excl);
      if (m < 0) break;
      excl.add(m); f.buf.push({ mask: m, ev: 0, s2: 0, age: 0 });
    }
    for (const s of f.buf) { s.ev = s.ev * D + walsh(s.mask, bits) * residual; s.s2 = s.s2 * D2 + residual * residual; s.age++; }
    if (f.n % cfg.tasteEvery !== 0) return;

    // L2: learn the proposal grammar from L1's own validated edits
    const l2 = this.arm.l2;
    if (LEARNS_ALPHA.has(l2)) {
      for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - cfg.alphaDecay) * (f.alpha[b] - 1));
      for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) {
        this.tel.l2Updates++;
        for (const bit of pairBits(f.masks[i])) { const tb = l2 === 'shamp' ? f.shamPerm[bit] : bit; f.alpha[tb] = Math.min(cfg.alphaMax, f.alpha[tb] + cfg.alphaBoost); }
      }
    } else if (l2 === 'reuse') {
      for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh && !f.cache.includes(f.masks[i])) {
        this.tel.l2Updates++; f.cache.push(f.masks[i]); if (f.cache.length > cfg.reuseCap) f.cache.shift();
      }
    }

    // L1: prune, admit
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
        f.masks.push(chosen); f.w.push(0); f.maskAge.push(0);
        for (const rc of f.memory) rc.phi.push(walsh(chosen, rc.bits));
        f.buf.splice(bestIdx, 1);
        this.tel.admissions++;
        if (this.rule.target.includes(chosen)) this.tel.correctAdm++;
        if (pairBits(chosen).every(b => this.subset.includes(b))) this.tel.inSubsetAdm++;
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

  resetTrueOracle() { for (const f of this.flies) { f.masks = [0, ...this.rule.target]; f.w = Array(f.masks.length).fill(0); f.maskAge = f.masks.map(() => 0); f.memory = []; } }

  // Exogenous schedule: rule, codebook, patches and plant kinds (not amounts).
  exoHash() {
    let h = 2166136261 >>> 0; const add = v => { h = Math.imul(h ^ (v | 0), 16777619) >>> 0; };
    add(this.rule.mask); add(this.rule.sign); for (const b of this.subset) add(b);
    for (const c of this.codes) for (const x of c) add(x);
    for (let k = 0; k < this.plant.length; k++) if (this.plant[k]) { add(k); add(this.plant[k].kind); }
    return h;
  }

  step() {
    const cfg = this.cfg, N = cfg.size;
    if (this.tick > 0 && this.tick % cfg.macroEvery === 0) {
      this.subset = makeSubset(this.rRule, cfg.subsetSize); this.rule = makeSubRule(this.rRule, this.subset, 0); this.redrawCodes();
      if (this.arm.trueOracle) this.resetTrueOracle();
    } else if (this.tick > 0 && this.tick % cfg.subEvery === 0) {
      this.rule = makeSubRule(this.rRule, this.subset, this.rule.mask); this.redrawCodes();
      if (this.arm.trueOracle) this.resetTrueOracle();
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
      const goodPred = this.codes.map(bits => { const p = this.tastePredict(f, bits); return p > cfg.acceptAt ? p - (1 - p) * cfg.toxin : 0; });
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
        const bits = this.codes[pl.kind], pred = this.tastePredict(f, bits);
        if (pred > cfg.acceptAt || f.r() < cfg.tasteEps) {
          const take = Math.min(pl.amount, cfg.bite); pl.amount -= take;
          const good = this.kindValence[pl.kind] > 0;
          f.energy += good ? take : -take * cfg.toxin;
          this.tel.bites++;
          const lab = (good ? 1 : 0) ^ (f.r() < cfg.labelNoise ? 1 : 0);
          this.tasteLearn(f, bits, lab, pl.kind);
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
    for (const f of this.flies) { if (f.energy <= 0 || f.age >= cfg.maxAge) { this.tel.deathAgeSum += f.age; this.tel.deaths++; } else alive.push(f); }
    this.flies = alive;
    for (const [p, x, y] of born) this.spawn(p, x, y, cfg.childEnergy, p.gen + 1);
    this.tick++;
  }

  // Discrimination at threshold .5 (not realized feeding, which uses acceptAt .40).
  skill() {
    if (!this.flies.length) return 0;
    let sum = 0;
    for (const f of this.flies) {
      let g = 0, gn = 0, b = 0, bn = 0;
      for (let k = 0; k < this.codes.length; k++) { const acc = this.tastePredict(f, this.codes[k]) > .5 ? 1 : 0; if (this.kindValence[k] > 0) { g += acc; gn++; } else { b += acc; bn++; } }
      sum += g / gn - b / bn;
    }
    return sum / this.flies.length;
  }
  // Share of effective proposal weight (floor + alpha) falling on the true subset's bits.
  alphaShareOnS() {
    if (!this.flies.length) return 0;
    let s = 0;
    for (const f of this.flies) { const [al, fl] = this.proposal(f); const tot = al.reduce((a, x) => a + fl + x, 0); s += this.subset.reduce((a, b) => a + fl + al[b], 0) / tot; }
    return s / this.flies.length;
  }
  stateHash() {
    let h = 2166136261 >>> 0;
    const add = v => { h = Math.imul(h ^ (Math.round(v * 1e6) | 0), 16777619) >>> 0; };
    add(this.flies.length); add(this.nextId);
    for (const f of this.flies) { add(f.id); add(f.x); add(f.y); add(f.energy); add(f.age); for (const m of f.masks) add(m); for (const w of f.w) add(w); for (const w of f.moveW) add(w); }
    for (const p of this.plant) if (p) { add(p.kind); add(p.amount); }
    return h;
  }
}

export function runOne(seed, armName, cfg = {}, { hashes = false, exo = false } = {}) {
  const w = new WorldV(seed, armName, cfg);
  let popSum = 0, nLate = 0, skillSum = 0, alphaSum = 0;
  const hs = [], ex = [];
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (hashes) hs.push(w.stateHash());
    if (exo) ex.push(w.exoHash());
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; skillSum += w.skill(); alphaSum += w.alphaShareOnS(); }
  }
  if (nLate !== (w.cfg.ticks - w.cfg.lateFrom) / w.cfg.every || !Number.isInteger(popSum)) throw Error(`invalid endpoint ${seed} ${armName}`);
  const out = { seed, arm: armName, evorVariant: cfg.evorVariant ?? null, popSum, pop: popSum / nLate, skill: skillSum / nLate, alphaShareOnS: alphaSum / nLate,
    extinct: !w.flies.length, correctPerEvBite: w.tel.evBites ? w.tel.correctAdm / w.tel.evBites : 0, tel: w.tel };
  if (hashes) out.hashes = hs;
  if (exo) out.exo = ex;
  return out;
}
