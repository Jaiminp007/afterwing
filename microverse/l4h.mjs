// L4-H ecology harness: blind-world protocol.
// The ecology (40x40 grid, 9 relocating patches, Q-learning movement, energy, toxins,
// births, deaths, capacity) is copied from scratch/advice-gemini-l4d/l4d_world.mjs.
// Two things are pluggable and were written by different parties:
//   - the world family (microverse/l4h-worlds.mjs, written blind to the arms), which
//     supplies the food value of an odor code over time and the taste noise;
//   - the learner (microverse/l4h-arms.mjs, frozen before the world family existed),
//     which only ever sees (odor bits, noisy taste) pairs and its inherited state.
// Interfaces:
//   world = createWorld(seed, D)  -> { step(tick) -> boolean changed, value(bits) -> number, noiseSd() -> number }
//   L = makeLearner(arm, D, parentState|null, rng) -> { w: Float64Array(D), learn(bits, y), inherit() -> Float64Array }
export function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
export function randn(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const sigmoid = x => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, x))));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };

export const BASE_CFG = Object.freeze({
  size: 40, patches: 9, patchRadius: 4, plantDensity: .6, regrow: .11, plantCap: 4,
  bite: 1.5, toxin: .78, acceptAt: .40, tasteEps: .08,
  metabolism: .06, moveCost: .02, brainCost: .005, maxEnergy: 100, maxAge: 2400,
  relocateEvery: 50, shiftEvery: 30,
  childEnergy: 25, birthCost: 30, capacity: 400, founders: 60,
  D: 16, kinds: 32, predScale: 0.85,
  ticks: 20000, every: 100, lateFrom: 10000,
});

export class WorldL4H {
  constructor(seed, arm, worldMod, armsMod, cfg = {}) {
    this.cfg = { ...BASE_CFG, ...cfg };
    this.arm = arm; this.seed = seed; this.D = this.cfg.D;
    this.armsMod = armsMod;
    this.rule = worldMod.createWorld(mix(seed ^ 0x52554c45), this.D);
    this.rPatch = rng32(mix(seed ^ 0x50415443));
    this.rCode = rng32(mix(seed ^ 0x434f4445));
    this.rBeh = rng32(mix(seed));
    this.tick = 0; this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)]);
    this.codeVer = 0;
    this.tel = { bites: 0, births: 0, deaths: 0, unbalanced: 0 };
    this.bitBuf = new Int8Array(this.D);
    this.redrawCodes();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = [];
    for (let i = 0; i < this.cfg.founders; i++) this.spawn(null, Math.floor(this.rBeh() * N), Math.floor(this.rBeh() * N), 50, 0);
  }

  redrawCodes() {
    // Fixed-length catalogue of `kinds` odors; aim for half positive, half non-positive by
    // rejection sampling (the common ecology, identical for every arm). If one sign is too rare
    // after the cap, the remaining slots are filled with fresh random odors of any sign.
    const K = this.cfg.kinds, half = K / 2, D = this.D, good = [], bad = [], any = [];
    const draw = () => { const b = new Int8Array(D); for (let i = 0; i < D; i++) b[i] = this.rCode() < 0.5 ? -1 : 1; return b; };
    for (let tries = 0; (good.length < half || bad.length < half) && tries < 4000; tries++) {
      const bits = draw(), v = this.rule.value(bits);
      if (v > 0) { if (good.length < half) good.push(bits); } else if (bad.length < half) bad.push(bits);
    }
    while (good.length + bad.length + any.length < K) any.push(draw());
    this.codes = shuffleInPlace([...good, ...bad, ...any], this.rCode);
    if (this.codes.length !== K) throw new Error('catalogue length');
    this.kindValence = this.codes.map(bits => this.rule.value(bits));
    this.tel.unbalanced = (this.tel.unbalanced ?? 0) + (any.length ? 1 : 0);
    this.codeVer++;
  }

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
    const id = this.nextId++;
    const r = rng32(mix(this.seed ^ Math.imul(id, 2654435761)));
    const rL = rng32(mix(this.seed ^ Math.imul(id, 2654435761) ^ 0x4c524e52));
    const state = parent ? parent.L.inherit() : null;
    const L = this.armsMod.makeLearner(this.arm, this.D, state, rL);
    const f = { id, x, y, energy, age: 0, gen, r, L, goodPred: new Float64Array(this.cfg.kinds), codeVer: -1, wDirty: true,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0 };
    this.flies.push(f);
    if (parent) this.tel.births++;
    return f;
  }

  zOf(f, bits) { const w = f.L.w; let z = 0; for (let i = 0; i < this.D; i++) z += w[i] * bits[i]; return z; }
  tastePredict(f, bits) { return 0.05 + 0.90 * sigmoid(this.cfg.predScale * this.zOf(f, bits)); }

  getGoodPred(f) {
    if (!f.wDirty && f.codeVer === this.codeVer) return f.goodPred;
    const gp = f.goodPred, acc = this.cfg.acceptAt, tox = this.cfg.toxin;
    for (let k = 0; k < this.codes.length; k++) {
      const p = this.tastePredict(f, this.codes[k]);
      gp[k] = p > acc ? p - (1 - p) * tox : 0;
    }
    f.codeVer = this.codeVer; f.wDirty = false;
    return gp;
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
    if (this.tick > 0) {
      const changed = this.rule.step(this.tick);
      if (changed) { this.kindValence = this.codes.map(bits => this.rule.value(bits)); }
      if (this.tick % cfg.shiftEvery === 0) this.redrawCodes();
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
    const sd = this.rule.noiseSd();
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
      f.energy -= cfg.metabolism + (dir ? cfg.moveCost : 0) + cfg.brainCost;
      const pl = this.plant[to];
      if (pl && pl.amount > .2) {
        const bits = this.codes[pl.kind];
        const pred = this.tastePredict(f, bits);
        if (pred > cfg.acceptAt || f.r() < cfg.tasteEps) {
          const take = Math.min(pl.amount, cfg.bite); pl.amount -= take;
          const vTrue = this.kindValence[pl.kind];
          f.energy += vTrue > 0 ? take : -take * cfg.toxin;
          this.tel.bites++;
          const yObs = vTrue + sd * randn(f.r);
          this.bitBuf.set(bits); f.L.learn(this.bitBuf, yObs); // private copy
          f.wDirty = true;
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
    for (const f of this.flies) { if (f.energy <= 0 || f.age >= cfg.maxAge) this.tel.deaths++; else alive.push(f); }
    this.flies = alive;
    for (const [p, x, y] of born) this.spawn(p, x, y, cfg.childEnergy, p.gen + 1);
    this.tick++;
  }

  skill() {
    if (!this.flies.length) return 0;
    let sum = 0;
    for (const f of this.flies) {
      let g = 0, gn = 0, b = 0, bn = 0;
      for (let k = 0; k < this.codes.length; k++) {
        const acc = this.tastePredict(f, this.codes[k]) > 0.5 ? 1 : 0;
        if (this.kindValence[k] > 0) { g += acc; gn++; } else { b += acc; bn++; }
      }
      sum += (gn ? g / gn : 0) - (bn ? b / bn : 0);
    }
    return sum / this.flies.length;
  }
}

// Endpoint: mean live population over late censuses (ticks > lateFrom, every `every`).
export function runOne(seed, arm, worldMod, armsMod, cfg = {}) {
  const w = new WorldL4H(seed, arm, worldMod, armsMod, cfg);
  let popSum = 0, skillSum = 0, nLate = 0, probe = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) {
      popSum += w.flies.length; skillSum += w.skill(); nLate++;
      if (armsMod.probe) probe += armsMod.probe(w.flies.map(f => f.L));
    }
  }
  return { seed, armName: arm.name, popSum, nLate, pop: popSum / nLate, skill: skillSum / nLate, probe: probe / nLate,
    extinct: !w.flies.length, bites: w.tel.bites, births: w.tel.births, unbalanced: w.tel.unbalanced };
}
