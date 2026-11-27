import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import os from 'node:os';
import { mean, signflip } from '../../docs/paper/stats.mjs';

function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const sigmoid = x => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, x))));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };

const BASE_CFG = {
  size: 40, patches: 9, patchRadius: 4, plantDensity: .6, regrow: .11, plantCap: 4,
  bite: 1.5, toxin: .75, acceptAt: .40, tasteEps: .08,
  metabolism: .06, moveCost: .02, brainCost: .005, maxEnergy: 100, maxAge: 2400,
  relocateEvery: 50, shiftEvery: 30,
  childEnergy: 25, birthCost: 30, capacity: 400, founders: 60,
  D: 32, kinds: 32,
  wClip: 6.0, betaMin: -8.0, betaMax: 1.0, betaInit: -3.0,
  ticks: 20000, every: 100, lateFrom: 10000,
};

function makeWorldRule(worldType, rRule, D) {
  const idx = Array.from({ length: D }, (_, i) => i);
  if (worldType === 'W1_GLOBAL') {
    const era = rRule() < 0.5 ? 0 : 1; // 0=calm, 1=storm
    const active = shuffleInPlace([...idx], rRule).slice(0, 3);
    const wTrue = new Float64Array(D);
    for (const i of active) wTrue[i] = rRule() < 0.5 ? -1 : 1;
    return { worldType, era, eraTick: 0, subTick: 0, wTrue, fastMask: new Uint8Array(D).fill(era), noise: era === 0 ? 0.20 : 0.02 };
  }
  if (worldType === 'W2_POOLS') {
    const perm = shuffleInPlace([...idx], rRule);
    const pools = [perm.slice(0, 16), perm.slice(16, 32)];
    const fastPool = rRule() < 0.5 ? 0 : 1;
    const slowPool = 1 - fastPool;
    const wTrue = new Float64Array(D);
    const fastAct = shuffleInPlace([...pools[fastPool]], rRule).slice(0, 2);
    const slowAct = shuffleInPlace([...pools[slowPool]], rRule).slice(0, 2);
    for (const i of fastAct) wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 2.0;
    for (const i of slowAct) wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 1.1;
    const fastMask = new Uint8Array(D);
    for (const i of pools[fastPool]) fastMask[i] = 1;
    return { worldType, pools, fastPool, fastAct, slowAct, eraTick: 0, subTick: 0, wTrue, fastMask, noise: 0.10 };
  }
  if (worldType === 'W3_POOLS_4') {
    const perm = shuffleInPlace([...idx], rRule);
    const pools = [perm.slice(0, 8), perm.slice(8, 16), perm.slice(16, 24), perm.slice(24, 32)];
    const fastPool = Math.floor(rRule() * 4);
    const slowBits = [];
    for (let p = 0; p < 4; p++) if (p !== fastPool) slowBits.push(...pools[p]);
    const fastAct = shuffleInPlace([...pools[fastPool]], rRule).slice(0, 2);
    const slowAct = shuffleInPlace([...slowBits], rRule).slice(0, 2);
    const wTrue = new Float64Array(D);
    for (const i of fastAct) wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 2.0;
    for (const i of slowAct) wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 1.1;
    const fastMask = new Uint8Array(D);
    for (const i of pools[fastPool]) fastMask[i] = 1;
    return { worldType, pools, fastPool, fastAct, slowAct, eraTick: 0, subTick: 0, wTrue, fastMask, noise: 0.12 };
  }
  throw Error(`unknown worldType ${worldType}`);
}

function stepWorldRule(st, rRule, D) {
  st.eraTick++;
  st.subTick++;
  let changed = false;
  if (st.worldType === 'W1_GLOBAL') {
    if (st.eraTick >= 1500) {
      st.eraTick = 0;
      st.subTick = 0;
      st.era = 1 - st.era;
      st.noise = st.era === 0 ? 0.20 : 0.02;
      st.fastMask.fill(st.era);
      st.wTrue.fill(0);
      const idx = shuffleInPlace(Array.from({ length: D }, (_, i) => i), rRule).slice(0, 3);
      for (const i of idx) st.wTrue[i] = rRule() < 0.5 ? -1 : 1;
      changed = true;
    } else if (st.era === 1 && st.subTick >= 120) {
      st.subTick = 0;
      st.wTrue.fill(0);
      const idx = shuffleInPlace(Array.from({ length: D }, (_, i) => i), rRule).slice(0, 3);
      for (const i of idx) st.wTrue[i] = rRule() < 0.5 ? -1 : 1;
      changed = true;
    } else if (st.era === 0 && st.subTick >= 500) {
      st.subTick = 0;
      // slow sign flip of one active bit in calm era
      const act = [];
      for (let i = 0; i < D; i++) if (st.wTrue[i] !== 0) act.push(i);
      const pick = act[Math.floor(rRule() * act.length)];
      st.wTrue[pick] = -st.wTrue[pick];
      changed = true;
    }
  } else if (st.worldType === 'W2_POOLS') {
    if (st.eraTick >= 2000) {
      st.eraTick = 0;
      st.subTick = 0;
      st.fastPool = 1 - st.fastPool;
      const slowPool = 1 - st.fastPool;
      st.fastMask.fill(0);
      for (const i of st.pools[st.fastPool]) st.fastMask[i] = 1;
      st.fastAct = shuffleInPlace([...st.pools[st.fastPool]], rRule).slice(0, 2);
      st.slowAct = shuffleInPlace([...st.pools[slowPool]], rRule).slice(0, 2);
      st.wTrue.fill(0);
      for (const i of st.fastAct) st.wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 2.0;
      for (const i of st.slowAct) st.wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 1.1;
      changed = true;
    } else if (st.subTick >= 120) {
      st.subTick = 0;
      for (const i of st.fastAct) st.wTrue[i] = 0;
      st.fastAct = shuffleInPlace([...st.pools[st.fastPool]], rRule).slice(0, 2);
      for (const i of st.fastAct) st.wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 2.0;
      changed = true;
    }
  } else if (st.worldType === 'W3_POOLS_4') {
    if (st.eraTick >= 2000) {
      st.eraTick = 0;
      st.subTick = 0;
      const choices = [0, 1, 2, 3].filter(p => p !== st.fastPool);
      st.fastPool = choices[Math.floor(rRule() * choices.length)];
      st.fastMask.fill(0);
      for (const i of st.pools[st.fastPool]) st.fastMask[i] = 1;
      const slowBits = [];
      for (let p = 0; p < 4; p++) if (p !== st.fastPool) slowBits.push(...st.pools[p]);
      st.fastAct = shuffleInPlace([...st.pools[st.fastPool]], rRule).slice(0, 2);
      st.slowAct = shuffleInPlace([...slowBits], rRule).slice(0, 2);
      st.wTrue.fill(0);
      for (const i of st.fastAct) st.wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 2.0;
      for (const i of st.slowAct) st.wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 1.1;
      changed = true;
    } else if (st.subTick >= 100) {
      st.subTick = 0;
      for (const i of st.fastAct) st.wTrue[i] = 0;
      st.fastAct = shuffleInPlace([...st.pools[st.fastPool]], rRule).slice(0, 2);
      for (const i of st.fastAct) st.wTrue[i] = (rRule() < 0.5 ? -1 : 1) * 2.0;
      changed = true;
    }
  }
  return changed;
}

class World {
  constructor(seed, worldType, arm) {
    this.cfg = BASE_CFG;
    this.arm = arm;
    this.seed = seed;
    this.D = this.cfg.D;
    this.rRule = rng32(mix(seed ^ 0x52554c45));
    this.rPatch = rng32(mix(seed ^ 0x50415443));
    this.rBeh = rng32(mix(seed));
    this.tick = 0;
    this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)]);
    this.ruleSt = makeWorldRule(worldType, this.rRule, this.D);
    this.codeVer = 0;
    this.alphasTmp = new Float64Array(this.D);
    this.redrawCodes();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = [];
    for (let i = 0; i < this.cfg.founders; i++) this.spawn(null, Math.floor(this.rBeh() * N), Math.floor(this.rBeh() * N), 50, 0);
  }

  ruleValence(bits) {
    let s = 0;
    const w = this.ruleSt.wTrue;
    for (let i = 0; i < this.D; i++) if (w[i]) s += w[i] * bits[i];
    return s;
  }

  redrawCodes() {
    const half = this.cfg.kinds / 2;
    const good = [], bad = [];
    while (good.length < half || bad.length < half) {
      const bits = new Int8Array(this.D);
      for (let i = 0; i < this.D; i++) bits[i] = this.rRule() < 0.5 ? -1 : 1;
      const v = this.ruleValence(bits);
      if (v > 1e-6 && good.length < half) good.push(bits);
      else if (v < -1e-6 && bad.length < half) bad.push(bits);
    }
    this.codes = shuffleInPlace([...good, ...bad], this.rRule);
    this.kindValence = this.codes.map(bits => this.ruleValence(bits));
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
    const id = this.nextId++, D = this.D, arm = this.arm;
    const r = rng32(mix(this.seed ^ Math.imul(id, 2654435761)));
    const w = new Float64Array(D);
    const beta = new Float64Array(D);
    const h = new Float64Array(D);
    const v = new Float64Array(D);
    const g1 = new Float64Array(D);
    const g2 = new Float64Array(D);
    if (parent && arm.inheritL2) {
      beta.set(parent.beta);
      v.set(parent.v);
      g1.set(parent.g1);
      g2.set(parent.g2);
    } else {
      beta.fill(arm.betaInit ?? this.cfg.betaInit);
      v.fill(0.05);
      g2.fill(0.05);
    }
    const f = {
      id, x, y, energy, age: 0, gen, r,
      w, beta, h, v, g1, g2,
      goodPred: new Float64Array(this.cfg.kinds), codeVer: -1, wDirty: true,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
    };
    this.flies.push(f);
    return f;
  }

  tastePredict(f, bits) {
    let z = 0;
    const w = f.w;
    for (let i = 0; i < this.D; i++) z += w[i] * bits[i];
    return 0.05 + 0.90 * sigmoid(z);
  }

  getGoodPred(f) {
    if (!f.wDirty && f.codeVer === this.codeVer) return f.goodPred;
    const gp = f.goodPred, codes = this.codes, D = this.D, w = f.w;
    const acc = this.cfg.acceptAt, tox = this.cfg.toxin;
    for (let k = 0; k < codes.length; k++) {
      const bits = codes[k];
      let z = 0;
      for (let i = 0; i < D; i++) z += w[i] * bits[i];
      const p = 0.05 + 0.90 * sigmoid(z);
      gp[k] = p > acc ? p - (1 - p) * tox : 0;
    }
    f.codeVer = this.codeVer;
    f.wDirty = false;
    return gp;
  }

  tasteLearn(f, bits, target) {
    const arm = this.arm, D = this.D, cfg = this.cfg;
    if (arm.kind === 'nolearn') return;
    f.wDirty = true;
    const w = f.w;
    let z = 0;
    for (let i = 0; i < D; i++) z += w[i] * bits[i];
    const p = sigmoid(z);
    const delta = target - p;
    const p1p = Math.max(0.02, p * (1 - p));

    if (arm.kind === 'fixed') {
      const a = arm.alpha;
      for (let i = 0; i < D; i++) w[i] = clip(w[i] + a * delta * bits[i], cfg.wClip);
      return;
    }

    if (arm.kind === 'direct_oracle') {
      const fm = this.ruleSt.fastMask;
      for (let i = 0; i < D; i++) {
        const a = fm[i] ? arm.aFast : arm.aSlow;
        w[i] = clip(w[i] + a * delta * bits[i], cfg.wClip);
      }
      return;
    }

    if (arm.kind === 'snr') {
      // Single-level direct SNR step-size: alpha_i = eta * (ema(g_i)^2 / (ema(g_i^2) + eps))
      const rho = arm.rho, eta = arm.eta;
      let sumEff = 0;
      const alphas = this.alphasTmp;
      for (let i = 0; i < D; i++) {
        const g = delta * bits[i];
        f.g1[i] = (1 - rho) * f.g1[i] + rho * g;
        f.g2[i] = (1 - rho) * f.g2[i] + rho * g * g;
        const snr = (f.g1[i] * f.g1[i]) / (f.g2[i] + 1e-4);
        alphas[i] = clamp(eta * snr, 1e-4, 2.0);
        sumEff += alphas[i] * p1p;
      }
      const scale = sumEff > 1.0 ? 1.0 / sumEff : 1.0;
      for (let i = 0; i < D; i++) w[i] = clip(w[i] + scale * alphas[i] * delta * bits[i], cfg.wClip);
      return;
    }

    if (arm.kind === 'idbd' || arm.kind === 'oracle_idbd') {
      const fm = this.ruleSt.fastMask;
      const bMin = arm.betaMin ?? cfg.betaMin, bMax = arm.betaMax ?? cfg.betaMax;
      let sumEff = 0;
      const alphas = this.alphasTmp;
      for (let i = 0; i < D; i++) {
        const th = arm.kind === 'oracle_idbd' ? (fm[i] ? arm.thFast : arm.thSlow) : arm.theta;
        const g = delta * bits[i];
        f.beta[i] = clamp(f.beta[i] + th * g * f.h[i], bMin, bMax);
        alphas[i] = Math.exp(f.beta[i]);
        sumEff += alphas[i] * p1p;
      }
      const scale = sumEff > 1.0 ? 1.0 / sumEff : 1.0;
      for (let i = 0; i < D; i++) {
        const a = alphas[i] * scale;
        if (scale < 1.0) f.beta[i] = Math.log(Math.max(1e-6, a));
        const g = delta * bits[i];
        w[i] = clip(w[i] + a * g, cfg.wClip);
        f.h[i] = f.h[i] * Math.max(0, 1 - a * p1p) + a * g;
      }
      return;
    }

    if (arm.kind === 'autostep' || arm.kind === 'oracle_autostep' || arm.kind === 'direct_shift_autostep') {
      const fm = this.ruleSt.fastMask;
      const bMin = arm.betaMin ?? cfg.betaMin, bMax = arm.betaMax ?? cfg.betaMax;
      const tau = arm.tau ?? 50;
      let sumEff = 0;
      const alphas = this.alphasTmp;
      for (let i = 0; i < D; i++) {
        const mu = arm.kind === 'oracle_autostep' ? (fm[i] ? arm.muFast : arm.muSlow) : arm.mu;
        const g = delta * bits[i];
        const gh = g * f.h[i];
        const a0 = Math.exp(f.beta[i]);
        const absGh = Math.abs(gh);
        f.v[i] = Math.max(absGh, f.v[i] + (1 / tau) * a0 * p1p * (absGh - f.v[i]));
        if (f.v[i] > 1e-12) {
          f.beta[i] = clamp(f.beta[i] + mu * (gh / f.v[i]), bMin, bMax);
        }
        // Optional oracle beta-decay/floor pull in oracle_autostep_full
        if (arm.kind === 'oracle_autostep' && arm.pullFast && fm[i]) {
          f.beta[i] = clamp(f.beta[i] + arm.pullFast * (arm.pullTarget - f.beta[i]), bMin, bMax);
        }
        let bEff = f.beta[i];
        if (arm.kind === 'direct_shift_autostep' && fm[i]) {
          bEff = clamp(bEff + arm.shift, bMin, bMax);
        }
        alphas[i] = Math.exp(bEff);
        sumEff += alphas[i] * p1p;
      }
      const scale = sumEff > 1.0 ? 1.0 / sumEff : 1.0;
      for (let i = 0; i < D; i++) {
        const a = alphas[i] * scale;
        if (scale < 1.0 && arm.kind !== 'direct_shift_autostep') f.beta[i] = Math.log(Math.max(1e-6, a));
        const g = delta * bits[i];
        w[i] = clip(w[i] + a * g, cfg.wClip);
        f.h[i] = f.h[i] * Math.max(0, 1 - a * p1p) + a * g;
      }
      return;
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
    if (this.tick > 0) {
      const ruleChanged = stepWorldRule(this.ruleSt, this.rRule, this.D);
      if (ruleChanged || this.tick % cfg.shiftEvery === 0) this.redrawCodes();
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
        const bits = this.codes[pl.kind], pred = this.tastePredict(f, bits);
        if (pred > cfg.acceptAt || f.r() < cfg.tasteEps) {
          const take = Math.min(pl.amount, cfg.bite); pl.amount -= take;
          const good = this.kindValence[pl.kind] > 0;
          f.energy += good ? take : -take * cfg.toxin;
          const lab = (good ? 1 : 0) ^ (f.r() < this.ruleSt.noise ? 1 : 0);
          this.tasteLearn(f, bits, lab);
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
    for (const f of this.flies) if (f.energy > 0 && f.age < cfg.maxAge) alive.push(f);
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
      sum += g / gn - b / bn;
    }
    return sum / this.flies.length;
  }
}

function runOne(seed, worldType, arm) {
  const w = new World(seed, worldType, arm);
  let popSum = 0, skillSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) {
      popSum += w.flies.length;
      skillSum += w.skill();
      nLate++;
    }
  }
  return { seed, worldType, armName: arm.name, pop: popSum / nLate, skill: skillSum / nLate };
}

if (!isMainThread) {
  const results = workerData.tasks.map(t => runOne(t.seed, t.worldType, t.arm));
  parentPort.postMessage(results);
} else {
  const t0 = Date.now();
  const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008];
  const WORLDS = ['W1_GLOBAL', 'W2_POOLS', 'W3_POOLS_4'];
  const ARMS = [
    { name: 'NOLEARN', kind: 'nolearn' },
    { name: 'FIX_003', kind: 'fixed', alpha: 0.03 },
    { name: 'FIX_008', kind: 'fixed', alpha: 0.08 },
    { name: 'FIX_015', kind: 'fixed', alpha: 0.15 },
    { name: 'FIX_030', kind: 'fixed', alpha: 0.30 },
    { name: 'FIX_060', kind: 'fixed', alpha: 0.60 },
    { name: 'IDBD_002', kind: 'idbd', theta: 0.02, inheritL2: true },
    { name: 'IDBD_010', kind: 'idbd', theta: 0.10, inheritL2: true },
    { name: 'IDBD_030', kind: 'idbd', theta: 0.30, inheritL2: true },
    { name: 'IDBD_080', kind: 'idbd', theta: 0.80, inheritL2: true },
    { name: 'IDBD_200', kind: 'idbd', theta: 2.00, inheritL2: true },
    { name: 'AUTO_001', kind: 'autostep', mu: 0.01, inheritL2: true },
    { name: 'AUTO_005', kind: 'autostep', mu: 0.05, inheritL2: true },
    { name: 'AUTO_015', kind: 'autostep', mu: 0.15, inheritL2: true },
    { name: 'AUTO_040', kind: 'autostep', mu: 0.40, inheritL2: true },
    { name: 'AUTO_080', kind: 'autostep', mu: 0.80, inheritL2: true },
    { name: 'SNR_05', kind: 'snr', rho: 0.05, eta: 0.8, inheritL2: true },
    { name: 'SNR_15', kind: 'snr', rho: 0.15, eta: 0.8, inheritL2: true },
    { name: 'DIR_ORC', kind: 'direct_oracle', aFast: 0.35, aSlow: 0.06 },
    { name: 'DIR_SHF', kind: 'direct_shift_autostep', mu: 0.05, shift: 1.5, inheritL2: true },
    { name: 'ORC_IDBD', kind: 'oracle_idbd', thFast: 1.5, thSlow: 0.02, inheritL2: true },
    { name: 'ORC_AUTO', kind: 'oracle_autostep', muFast: 0.60, muSlow: 0.01, inheritL2: true },
    { name: 'ORC_AFUL', kind: 'oracle_autostep', muFast: 0.60, muSlow: 0.01, pullFast: 0.05, pullTarget: -2.0, inheritL2: true },
  ];

  (async () => {
    console.log(`=== Exp 1: Step-Size Hierarchy Oracle Headroom (seeds 3001-3008) ===`);
    for (const wt of WORLDS) {
      const tw = Date.now();
      const tasks = [];
      for (const arm of ARMS)
        for (const seed of SEEDS)
          tasks.push({ seed, worldType: wt, arm });

      const nWorkers = Math.min(os.cpus().length, tasks.length);
      const buckets = Array.from({ length: nWorkers }, () => []);
      tasks.forEach((t, i) => buckets[i % nWorkers].push(t));

      const chunks = await Promise.all(buckets.map(b => new Promise((res, rej) => {
        const w = new Worker(new URL(import.meta.url), { workerData: { tasks: b } });
        w.on('message', res);
        w.on('error', rej);
      })));
      const rows = chunks.flat();
      console.log(`\n--- WORLD: ${wt} (${((Date.now() - tw) / 1000).toFixed(1)}s) ---`);
      const byArm = new Map();
      for (const arm of ARMS) {
        const rs = SEEDS.map(s => rows.find(r => r.armName === arm.name && r.seed === s));
        byArm.set(arm.name, rs);
      }
      const fixedNames = ARMS.filter(a => a.kind === 'fixed').map(a => a.name);
      const bestFixName = fixedNames.reduce((a, b) => mean(byArm.get(a).map(r => r.pop)) >= mean(byArm.get(b).map(r => r.pop)) ? a : b);
      const bestFix = byArm.get(bestFixName).map(r => r.pop);
      const l2Names = ARMS.filter(a => ['idbd', 'autostep', 'snr', 'direct_oracle', 'direct_shift_autostep'].includes(a.kind)).map(a => a.name);
      const bestL2Name = l2Names.reduce((a, b) => mean(byArm.get(a).map(r => r.pop)) >= mean(byArm.get(b).map(r => r.pop)) ? a : b);
      const bestL2 = byArm.get(bestL2Name).map(r => r.pop);

      for (const arm of ARMS) {
        const rs = byArm.get(arm.name);
        const pop = mean(rs.map(r => r.pop));
        const sk = mean(rs.map(r => r.skill));
        const g = pop - mean(bestFix);
        console.log(`  ${arm.name.padEnd(10)} pop=${pop.toFixed(2).padStart(6)}  gain=${(g >= 0 ? '+' : '') + g.toFixed(2).padStart(5)}  skill=${sk.toFixed(3)}`);
      }
      console.log(`  Best FIXED: ${bestFixName} (${mean(bestFix).toFixed(2)}), Best L2: ${bestL2Name} (${mean(bestL2).toFixed(2)}, gain=+${(mean(bestL2) - mean(bestFix)).toFixed(2)})`);
      for (const orcName of ['ORC_IDBD', 'ORC_AUTO', 'ORC_AFUL']) {
        const orc = byArm.get(orcName).map(r => r.pop);
        const d4 = SEEDS.map((_, i) => (orc[i] - bestFix[i]) - 1.5 * (bestL2[i] - bestFix[i]));
        const gOrc = mean(orc) - mean(bestFix);
        const gL2 = mean(bestL2) - mean(bestFix);
        const ratio = gL2 > 0 ? gOrc / gL2 : NaN;
        const pos = d4.filter(x => x > 0).length;
        const p = signflip(d4);
        console.log(`  ${orcName.padEnd(10)} vs ${bestL2Name.padEnd(10)}: d4=${mean(d4).toFixed(2)}  ratio=${ratio.toFixed(2)}x  signs=${pos}/${SEEDS.length}  p=${p.toExponential(2)}`);
      }
    }
    console.log(`\nTotal runtime: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  })();
}
