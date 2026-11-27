// L4-A: a learned L2 credit kernel ("how L2 assigns credit"). A constructed, self-contained
// world, copied from microverse/l3v.mjs (frozen, untouched) and separate from sim.mjs.
// Origin: Gemini 4 Neon's exploratory prototype META3_UPD
// (scratch/advice-gemini-l4/check_upd_16seeds.mjs, seeds 2001-2016), merged by Claude
// (Opus 5.5) with GPT-6.2 Astra / GPT-5.6 Sol's control requirements
// (scratch/advice-astra-l4/). Registration: docs/FLY_RSI_GOALS.md, section "L4-A".
//
// World: the L3-V ecology, except that the 12 odor bits are split per seed into 3 hidden
// disjoint 4-bit modules. The causal subset S is one module; every 1500 ticks S switches to
// one of the other two modules; inside S the target pair and its sign change every 250 ticks.
// Levels:
//   L1  structural revision of taste masks (identical in every arm with l1).
//   L2  the proposal prior alpha over bits: decay toward 1, boost the bits of validated masks.
//       L1 samples pairs with weight (floor+alpha_i)(floor+alpha_j) in every alpha arm.
//   L3  (META3 only) an inherited 12x12 co-validation matrix G, learned from L2's own
//       validated masks, that rewrites L2's update rule: boosts spread to G-partners of a
//       validated mask's bits, non-partners are suppressed, and L2's decay rises with G's
//       maturity. L1 never reads G.

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
  macroEvery: 1500, subEvery: 250, subsetSize: 4, modules: 3, kinds: 32,
  K: 6, tasteCap: 4, tasteMemory: 32, tasteEvery: 4, tasteZ: 3.3, tastePrune: 1.5,
  graceTastings: 10, evictAge: 18, valThresh: 2.5,
  alphaFloor: .02,
  // L3 (META3) constants: Gemini's exploratory values, frozen with the registration.
  gDecay: .0002, gInc: 1, gCap: 10, gHalf: 2, spreadAt: .25, suppressAt: .5, suppressDecay: .65, hiDecay: .18, gConfN: 12,
  evorG: 5,
  ticks: 20000, every: 100, lateFrom: 10000,
});

// Constant L2 settings (decay, boost, cap). Stage A locks the variant with the highest mean
// late population as META; exact ties go to the earlier entry. L3V is the frozen L3-V META.
export const L2_GRID = { L3V: { alphaDecay: .006, alphaBoost: 4, alphaMax: 30 } };
for (const d of [.006, .015, .03, .06, .10, .15, .20]) for (const b of [4, 12, 20, 40])
  L2_GRID[`D${String(Math.round(d * 1000)).padStart(3, '0')}B${b}`] = { alphaDecay: d, alphaBoost: b, alphaMax: 60 };
// META3's base L2 (Gemini's M_D060) is fixed, independent of the stage-A lock.
export const META3_BASE = 'D060B20';

// EVO-R3: inherited G with birth mutation only, no in-life G learning, on META3's base L2 and
// META3's G-driven update rule. E0 (G = 0) is exactly META:D060B20.
//   jump: with pm, two random off-diagonal pairs set to evorG or 0 (symmetric).
//   swap: founders get a random 3x4 partition at evorG; with pm, two bits swap G rows.
export const EVOR3_GRID = {
  E0: { pm: 0 },
  J10: { pm: .10, kind: 'jump' }, J25: { pm: .25, kind: 'jump' }, J50: { pm: .50, kind: 'jump' },
  SV10: { pm: .10, kind: 'swap', standing: true }, SV25: { pm: .25, kind: 'swap', standing: true }, SV50: { pm: .50, kind: 'swap', standing: true },
};

// Arms. l1: structural revision on. l2: proposal controller (none = uniform, deck = shuffled
// deck of all 66 pairs, alpha = learned inherited alpha). l3 names the credit rule:
//   none    constant L2 (variant from L2_GRID)
//   learn   META3: G learned from validated masks and inherited
//   reset   META3, but the newborn's G starts at 0 (alpha still inherited)
//   sham    META3's exact G learning and inheritance, but before every use the partner
//           scores of the 10 other bits are freshly permuted among those bits (rSham)
//   evor    EVO-R3 (variant from EVOR3_GRID)
//   oracle  G fixed to the true module partition (diagnostic)
//   shadow  META3's full G and alpha computation runs, but proposals come from the deck and
//           nothing it computes is read (factorial cell P01; must equal FIXED tickwise)
export const ARMS = {
  NOREV: { l1: false, l2: 'none', l3: 'none' },
  FIXED_U: { l1: true, l2: 'none', l3: 'none' },
  FIXED: { l1: true, l2: 'deck', l3: 'none' },
  META: { l1: true, l2: 'alpha', l3: 'none' },
  META3: { l1: true, l2: 'alpha', l3: 'learn' },
  META3_RESET: { l1: true, l2: 'alpha', l3: 'reset' },
  SHAM3: { l1: true, l2: 'alpha', l3: 'sham' },
  EVOR3: { l1: true, l2: 'alpha', l3: 'evor' },
  ORACLE3: { l1: true, l2: 'alpha', l3: 'oracle' },
  META3OFF: { l1: true, l2: 'deck', l3: 'shadow' },
};
const HAS_G = new Set(['learn', 'reset', 'sham', 'evor', 'oracle', 'shadow']);
const LEARNS_G = new Set(['learn', 'reset', 'sham', 'shadow']);
const INHERITS_G = new Set(['learn', 'sham', 'evor', 'shadow']);

// Partition of the 12 bits into `modules` disjoint sorted groups of subsetSize.
function makePartition(r, cfg) {
  const perm = shuffleInPlace([...ALL_BITS], r);
  return Array.from({ length: cfg.modules }, (_, i) => perm.slice(i * cfg.subsetSize, (i + 1) * cfg.subsetSize).sort((a, b) => a - b));
}
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
const zeroG = () => Array.from({ length: B }, () => new Float64Array(B));
const cloneG = G => G.map(row => new Float64Array(row));

// Weighted draw over eligible pairs; pairs with nonpositive weight are never eligible.
export function samplePair(alpha, excl, r, floor) {
  const masks = [], ws = [];
  for (const p of ALL_PAIRS) {
    if (excl.has(p.mask)) continue;
    const w = (floor + alpha[p.a]) * (floor + alpha[p.b]);
    if (w > 0) { masks.push(p.mask); ws.push(w); }
  }
  if (!masks.length) return -1;
  let sum = 0; for (const w of ws) sum += w;
  let u = r() * sum;
  for (let i = 0; i < masks.length; i++) { u -= ws[i]; if (u <= 0) return masks[i]; }
  return masks[masks.length - 1];
}
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);

// L3's credit rule applied to L2 for one validated mask (a, b): partner scores of the other
// 10 bits. Exported for fixtures.
export function partnerScores(G, a, b, cfg) {
  const others = ALL_BITS.filter(k => k !== a && k !== b);
  return [others, others.map(k => Math.min(1, (G[a][k] + G[b][k]) / cfg.gHalf))];
}
export function gConfidence(G, cfg) {
  let s = 0;
  for (let i = 0; i < B; i++) for (let j = i + 1; j < B; j++) s += Math.min(1, G[i][j] / cfg.gHalf);
  return Math.min(1, s / cfg.gConfN);
}

export class World4 {
  constructor(seed, armName, cfg = {}) {
    this.cfg = { ...BASE_CFG, ...cfg };
    this.armName = armName;
    this.arm = ARMS[armName];
    if (!this.arm) throw Error(`unknown arm ${armName}`);
    const usesAlpha = this.arm.l2 === 'alpha' || this.arm.l3 === 'shadow';
    this.l2v = null;
    if (usesAlpha) {
      const v = this.arm.l3 === 'none' ? this.cfg.l2Variant : META3_BASE;
      this.l2v = L2_GRID[v];
      if (!this.l2v) throw Error(`${armName} needs a valid cfg.l2Variant (got ${v})`);
    }
    this.evor = this.arm.l3 === 'evor' ? EVOR3_GRID[this.cfg.evorVariant] : null;
    if (this.arm.l3 === 'evor' && !this.evor) throw Error('EVOR3 needs cfg.evorVariant');
    this.seed = seed;
    // Exogenous streams (identical across arms for a seed) and a behavioral stream.
    this.rRule = rng32(mix(seed ^ 0x52554c45));
    this.rPatch = rng32(mix(seed ^ 0x50415443));
    this.rBeh = rng32(mix(seed));
    this.tick = 0; this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)]);
    this.partition = makePartition(this.rRule, this.cfg);
    this.partIdx = Math.floor(this.rRule() * this.cfg.modules);
    this.subset = this.partition[this.partIdx];
    this.rule = makeSubRule(this.rRule, this.subset, 0);
    this.oracleG = zeroG();
    for (const grp of this.partition) for (const u of grp) for (const v of grp) if (u !== v) this.oracleG[u][v] = this.cfg.gCap;
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
    const id = this.nextId++, cfg = this.cfg, l3 = this.arm.l3;
    const key = t => rng32(mix(this.seed ^ Math.imul(id, 2654435761) ^ t));
    const r = key(0), rProp = key(0x50524f50), rMut = key(0x4d555441), rSham = key(0x5348414d);
    let alpha = Array(B).fill(1);
    if (parent && this.l2v) alpha = [...parent.alpha];
    let G = null;
    if (HAS_G.has(l3)) {
      G = parent && INHERITS_G.has(l3) ? cloneG(parent.G) : zeroG();
      if (l3 === 'evor' && this.evor.standing && !parent) {
        for (const grp of makePartition(rMut, cfg)) for (const u of grp) for (const v of grp) if (u !== v) G[u][v] = cfg.evorG;
      }
      if (l3 === 'evor' && parent && this.evor.pm > 0 && rMut() < this.evor.pm) {
        if (this.evor.kind === 'swap') {
          const u = Math.floor(rMut() * B), v = Math.floor(rMut() * B);
          if (u !== v) for (let k = 0; k < B; k++) {
            if (k === u || k === v) continue;
            const t = G[u][k]; G[u][k] = G[v][k]; G[v][k] = t; G[k][u] = G[u][k]; G[k][v] = G[v][k];
          }
        } else if (this.evor.kind === 'jump') {
          for (let t = 0; t < 2; t++) { const u = Math.floor(rMut() * B), v = Math.floor(rMut() * B); if (u !== v) G[u][v] = G[v][u] = rMut() < .5 ? cfg.evorG : 0; }
        }
      }
    }
    const f = {
      id, x, y, energy, age: 0, gen, r, rProp, rSham,
      masks: [0], w: [0], maskAge: [0],
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, G, deck: [], deckPos: 0,
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

  drawCandidate(f, excl) {
    if (this.arm.l2 === 'deck') {
      for (let tries = 0; tries < 2 * ALL_PAIRS.length + 1; tries++) {
        if (f.deckPos >= f.deck.length) { f.deck = shuffleInPlace(ALL_PAIRS.map(p => p.mask), f.rProp); f.deckPos = 0; }
        const m = f.deck[f.deckPos++];
        if (!excl.has(m)) return m;
      }
      return -1;
    }
    return samplePair(this.arm.l2 === 'alpha' ? f.alpha : Array(B).fill(1), excl, f.rProp, this.cfg.alphaFloor);
  }

  // L2 update, with L3's credit rule when the arm has one.
  l2Update(f) {
    const cfg = this.cfg, l3 = this.arm.l3, v = this.l2v;
    const val = [];
    for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) val.push(f.masks[i]);
    if (LEARNS_G.has(l3)) {
      for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.G[i][j] *= 1 - cfg.gDecay;
      for (const m of val) { const [a, b] = pairBits(m); f.G[a][b] = f.G[b][a] = Math.min(cfg.gCap, f.G[a][b] + cfg.gInc); }
    }
    const G = l3 === 'oracle' ? this.oracleG : f.G;
    const decay = G ? v.alphaDecay + gConfidence(G, cfg) * (cfg.hiDecay - v.alphaDecay) : v.alphaDecay;
    for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - decay) * (f.alpha[b] - 1));
    for (const m of val) {
      this.tel.l2Updates++;
      const [a, b] = pairBits(m);
      f.alpha[a] = Math.min(v.alphaMax, f.alpha[a] + v.alphaBoost);
      f.alpha[b] = Math.min(v.alphaMax, f.alpha[b] + v.alphaBoost);
      if (!G) continue;
      const [others, sc] = partnerScores(G, a, b, cfg);
      if (l3 === 'sham') shuffleInPlace(sc, f.rSham);
      const maxSc = Math.max(...sc);
      for (let i = 0; i < others.length; i++) {
        const k = others[i];
        if (sc[i] > cfg.spreadAt) f.alpha[k] = Math.min(v.alphaMax, f.alpha[k] + v.alphaBoost * sc[i]);
        else if (maxSc > cfg.suppressAt) f.alpha[k] = Math.max(.05, 1 + (1 - cfg.suppressDecay) * (f.alpha[k] - 1));
      }
    }
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

    if (!this.arm.l1) return; // NOREV: no structural revision, so no L2 or L3 input
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

    if (this.l2v) this.l2Update(f);

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
      const choices = ALL_BITS.slice(0, cfg.modules).filter(i => i !== this.partIdx);
      this.partIdx = choices[Math.floor(this.rRule() * choices.length)];
      this.subset = this.partition[this.partIdx]; this.rule = makeSubRule(this.rRule, this.subset, 0); this.redrawCodes();
    } else if (this.tick > 0 && this.tick % cfg.subEvery === 0) {
      this.rule = makeSubRule(this.rRule, this.subset, this.rule.mask); this.redrawCodes();
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
  // Share of effective proposal weight (floor + alpha) on the current S's bits (alpha arms).
  alphaShareOnS() {
    if (!this.flies.length || this.arm.l2 !== 'alpha') return 0;
    let s = 0; const fl = this.cfg.alphaFloor;
    for (const f of this.flies) { const tot = f.alpha.reduce((a, x) => a + fl + x, 0); s += this.subset.reduce((a, b) => a + fl + f.alpha[b], 0) / tot; }
    return s / this.flies.length;
  }
  // Share of G's off-diagonal mass that lies inside the true modules (G arms).
  gShareInModules() {
    if (!this.flies.length || !this.flies[0].G) return 0;
    let s = 0, n = 0;
    for (const f of this.flies) {
      let inM = 0, tot = 0;
      for (let i = 0; i < B; i++) for (let j = i + 1; j < B; j++) { tot += f.G[i][j]; if (this.oracleG[i][j] > 0) inM += f.G[i][j]; }
      if (tot > 0) { s += inM / tot; n++; }
    }
    return n ? s / n : 0;
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
  const w = new World4(seed, armName, cfg);
  let popSum = 0, nLate = 0, skillSum = 0, alphaSum = 0, gSum = 0;
  const hs = [], ex = [];
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (hashes) hs.push(w.stateHash());
    if (exo) ex.push(w.exoHash());
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; skillSum += w.skill(); alphaSum += w.alphaShareOnS(); gSum += w.gShareInModules(); }
  }
  if (nLate !== (w.cfg.ticks - w.cfg.lateFrom) / w.cfg.every || !Number.isInteger(popSum)) throw Error(`invalid endpoint ${seed} ${armName}`);
  const out = { seed, arm: armName, l2Variant: cfg.l2Variant ?? null, evorVariant: cfg.evorVariant ?? null, popSum, pop: popSum / nLate, skill: skillSum / nLate,
    alphaShareOnS: alphaSum / nLate, gShareInModules: gSum / nLate, extinct: !w.flies.length, correctPerEvBite: w.tel.evBites ? w.tel.correctAdm / w.tel.evBites : 0, tel: w.tel };
  if (hashes) out.hashes = hs;
  if (exo) out.exo = ex;
  return out;
}
