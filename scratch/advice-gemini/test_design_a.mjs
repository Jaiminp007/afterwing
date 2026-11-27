// Exploratory headroom check for L3-V Design A (v5: standard balanced food, B=12 (66 pairs), |S|=4 (6 pairs), Corr=1.0).
// Strictly exploratory, seeds 601-616 ONLY. Does not touch any repo files.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';

function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const walsh = (mask, bits) => { let v = 1; for (let b = 0; b < bits.length; b++) if ((mask >>> b) & 1) v *= bits[b]; return v; };

// 12-bit odor: C(12,2) = 66 unordered pairs. Secret 4-bit causal subset S has C(4,2) = 6 pairs (11x compression).
const B = 12;
const ALL_BITS = Array.from({ length: B }, (_, i) => i);
const ALL_PAIRS = [];
for (let i = 0; i < B; i++)
  for (let j = i + 1; j < B; j++)
    ALL_PAIRS.push({ mask: (1 << i) | (1 << j), a: i, b: j });

const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };

function makeSubset(r, k) {
  const arr = [...ALL_BITS];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr.slice(0, k).sort((a, b) => a - b);
}

function makeSubRule(r, subset, prevMask = 0) {
  const pairs = [];
  for (let i = 0; i < subset.length; i++)
    for (let j = i + 1; j < subset.length; j++) {
      const m = (1 << subset[i]) | (1 << subset[j]);
      if (m !== prevMask) pairs.push(m);
    }
  const m = pairs[Math.floor(r() * pairs.length)];
  return { subset, mask: m, sign: r() < .5 ? -1 : 1, target: [m] };
}

const ruleValence = (rule, bits) => rule.sign * walsh(rule.mask, bits);

const BASE_CFG = {
  size: 40, patches: 9, patchRadius: 4, plantDensity: .6, regrow: .11, plantCap: 4,
  bite: 1.5, toxin: .60, acceptAt: .40, tasteEps: .08,
  metabolism: .06, moveCost: .02, brainCost: .0005, maxEnergy: 100, maxAge: 2400,
  relocateEvery: 50, shiftEvery: 30, labelNoise: .05,
  childEnergy: 25, birthCost: 30, capacity: 400, founders: 60, senseRadius: 4,
  macroEvery: 3600, subEvery: 300, subsetSize: 4, kinds: 32,
  inheritMasks: false, inheritAlpha: false,
  K: 6, tasteCap: 4, tasteMemory: 32, tasteEvery: 4, tasteZ: 3.3, tastePrune: 1.5,
  graceTastings: 10, evictAge: 18, valThresh: 2.5,
  alphaBoost: 4.0, alphaDecay: .006, alphaMax: 30, alphaFloor: .02,
  ticks: 20000, every: 100
};

function samplePair(alpha, excludeSet, r, floor) {
  let sum = 0;
  const cands = [];
  for (const p of ALL_PAIRS) {
    if (excludeSet.has(p.mask)) continue;
    const w = (floor + alpha[p.a]) * (floor + alpha[p.b]);
    sum += w;
    cands.push([p.mask, sum]);
  }
  if (!cands.length) return -1;
  const u = r() * sum;
  for (const [m, acc] of cands) if (u <= acc) return m;
  return cands[cands.length - 1][0];
}

function pairBits(mask) {
  const out = [];
  for (let b = 0; b < B; b++) if ((mask >>> b) & 1) out.push(b);
  return out;
}

class WorldA {
  constructor(seed, mode, overrides = {}) {
    this.cfg = { ...BASE_CFG, ...overrides };
    this.mode = mode;
    this.seed = seed;
    this.r = rng32(mix(seed));
    this.tick = 0;
    this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.r() * N), Math.floor(this.r() * N)]);
    this.subset = makeSubset(this.r, this.cfg.subsetSize);
    this.rule = makeSubRule(this.r, this.subset, 0);
    this.redrawCodes();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = [];
    for (let i = 0; i < this.cfg.founders; i++) {
      this.spawn(null, Math.floor(this.r() * N), Math.floor(this.r() * N), 50, 0);
    }
    this.tel = { admissions: 0, correctAdm: 0, bites: 0, evBites: 0, deathAgeSum: 0, deaths: 0 };
  }

  redrawCodes() {
    const half = this.cfg.kinds / 2;
    const seen = new Set();
    const good = [], bad = [];
    while (good.length < half || bad.length < half) {
      const c = Math.floor(this.r() * (1 << B));
      if (seen.has(c)) continue; seen.add(c);
      const bits = ALL_BITS.map(b => ((c >>> b) & 1) ? 1 : -1);
      const v = ruleValence(this.rule, bits);
      if (v > 0 && good.length < half) good.push(bits);
      else if (v < 0 && bad.length < half) bad.push(bits);
    }
    this.codes = [...good, ...bad];
    for (let i = this.codes.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [this.codes[i], this.codes[j]] = [this.codes[j], this.codes[i]]; }
    this.kindValence = this.codes.map(bits => ruleValence(this.rule, bits));
  }

  seedPatch(i) {
    const [cx, cy] = this.patchCenters[i], N = this.cfg.size, R = this.cfg.patchRadius;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
      if (dx * dx + dy * dy > R * R || this.r() > this.cfg.plantDensity) continue;
      const x = (cx + dx + N) % N, y = (cy + dy + N) % N, k = y * N + x;
      if (!this.plant[k]) {
        const kind = Math.floor(this.r() * this.codes.length);
        this.plant[k] = { kind, amount: this.cfg.plantCap * this.r(), patch: i };
      }
    }
  }

  cell(x, y) { const N = this.cfg.size; return ((y + N) % N) * N + ((x + N) % N); }

  spawn(parent, x, y, energy, gen) {
    const id = this.nextId++;
    const r = rng32(mix(this.seed ^ Math.imul(id, 2654435761)));
    const rL2 = rng32(mix(this.seed ^ Math.imul(id, 1597334677) ^ 0x4c324141));
    let masks = [0];
    if (this.mode === 'TRUE_ORACLE') {
      masks = [0, ...this.rule.target];
    } else if (parent && this.cfg.inheritMasks) {
      masks = [...parent.masks];
    }
    let alpha = Array(B).fill(1);
    if (this.mode === 'EVOR' && parent) {
      alpha = [...parent.alpha];
      if (rL2() < 0.25) {
        for (let t = 0; t < 2; t++) {
          const bi = Math.floor(rL2() * B);
          alpha[bi] = Math.max(0.05, Math.min(this.cfg.alphaMax, alpha[bi] * Math.exp((rL2() - 0.5) * 2.0)));
        }
      }
    } else if (this.cfg.inheritAlpha && parent && (this.mode === 'META' || this.mode === 'SHAM')) {
      alpha = [...parent.alpha];
    }
    let shamPerm = null;
    if (this.mode === 'SHAM') {
      shamPerm = [...ALL_BITS];
      for (let i = shamPerm.length - 1; i > 0; i--) { const j = Math.floor(rL2() * (i + 1)); [shamPerm[i], shamPerm[j]] = [shamPerm[j], shamPerm[i]]; }
    }
    const f = {
      id, x, y, energy, age: 0, gen, r, rL2,
      masks, w: Array(masks.length).fill(0), maskAge: masks.map(() => 0),
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1,
      alpha, shamPerm,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0
    };
    this.flies.push(f);
    return f;
  }

  modelProb(f, bits) {
    const n = f.masks.length;
    let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * walsh(f.masks[i], bits) / Math.sqrt(n);
    return sigmoid(z);
  }

  tastePredict(f, bits) {
    const gate = f.lossModel !== undefined && f.lossModel >= f.lossBase;
    return .05 + .9 * (gate ? f.base : this.modelProb(f, bits));
  }

  tasteUpdate(f, phi, target) {
    const n = phi.length;
    let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n);
    const step = 4.0 * (target - sigmoid(z)) / Math.sqrt(n);
    for (let i = 0; i < n; i++) f.w[i] = clip(f.w[i] + step * phi[i], 8);
  }

  getEffAlpha(f) {
    if (this.mode === 'ORACLE_L2') {
      const a = Array(B).fill(0);
      for (const b of this.subset) a[b] = 10;
      return a;
    }
    return f.alpha;
  }

  tasteLearn(f, bits, target, kind) {
    const cfg = this.cfg;
    const phi = f.masks.map(m => walsh(m, bits));
    const n = phi.length;
    let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n);
    const pm0 = sigmoid(z);
    const residual = target - pm0;
    const pm = Math.min(1 - 1e-3, Math.max(1e-3, pm0));
    const pb = Math.min(1 - 1e-3, Math.max(1e-3, f.base));
    const ll = p => -(target ? Math.log(p) : Math.log(1 - p));
    if (f.lossModel === undefined) { f.lossModel = ll(pm); f.lossBase = ll(pb); }
    else { f.lossModel += .05 * (ll(pm) - f.lossModel); f.lossBase += .05 * (ll(pb) - f.lossBase); }
    f.base += .05 * (target - f.base);

    const rec = { bits, phi, target };
    f.seen++;
    if (f.memory.length < 32) f.memory.push(rec);
    else f.memory[f.seen % 32] = rec;
    this.tasteUpdate(f, phi, target);
    const rep = f.memory[Math.floor(f.r() * f.memory.length)];
    this.tasteUpdate(f, rep.phi, rep.target);
    for (let i = 0; i < f.maskAge.length; i++) f.maskAge[i]++;

    if (this.mode === 'NOREV' || this.mode === 'METAOFF' || this.mode === 'TRUE_ORACLE') return;
    if (kind === f.lastKind) return;
    f.lastKind = kind;
    this.tel.evBites++;

    const D = 1 - 1 / cfg.tasteMemory;
    const D2 = D * D;
    f.n++;

    const effAlpha = this.getEffAlpha(f);
    const floor = this.mode === 'ORACLE_L2' ? 0 : cfg.alphaFloor;
    const excl = new Set(f.masks);
    for (const s of f.buf) excl.add(s.mask);
    while (f.buf.length < cfg.K) {
      const m = samplePair(effAlpha, excl, f.rL2, floor);
      if (m < 0) break;
      excl.add(m);
      f.buf.push({ mask: m, ev: 0, s2: 0, age: 0 });
    }

    for (const s of f.buf) {
      s.ev = s.ev * D + walsh(s.mask, bits) * residual;
      s.s2 = s.s2 * D2 + residual * residual;
      s.age++;
    }

    if (f.n % cfg.tasteEvery !== 0) return;

    // L2 update: reinforce bits of validated L1-added masks; gentle decay toward 1
    if (this.mode === 'META' || this.mode === 'SHAM') {
      for (let b = 0; b < B; b++) f.alpha[b] = Math.max(0.05, 1 + (1 - cfg.alphaDecay) * (f.alpha[b] - 1));
      for (let i = 1; i < f.masks.length; i++) {
        if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) {
          for (const bit of pairBits(f.masks[i])) {
            const tb = this.mode === 'SHAM' ? f.shamPerm[bit] : bit;
            f.alpha[tb] = Math.min(cfg.alphaMax, f.alpha[tb] + cfg.alphaBoost);
          }
        }
      }
    }

    // Prune weak masks past grace period (no alpha punishment on prune; decay handles macro shifts)
    for (let i = f.masks.length - 1; i >= 1; i--) {
      if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) < cfg.tastePrune) {
        f.masks.splice(i, 1); f.w.splice(i, 1); f.maskAge.splice(i, 1);
        for (const rc of f.memory) rc.phi.splice(i, 1);
      }
    }

    let bestIdx = -1, bestScore = 0;
    for (let i = 0; i < f.buf.length; i++) {
      const s = f.buf[i];
      if (s.age < 10 || s.s2 <= 1e-9) continue;
      const sc = Math.abs(s.ev) / Math.sqrt(s.s2);
      if (sc > bestScore) { bestScore = sc; bestIdx = i; }
    }

    if (bestIdx >= 0 && bestScore > cfg.tasteZ) {
      const chosen = f.buf[bestIdx].mask;
      if (f.masks.length >= cfg.tasteCap) {
        let j = -1;
        for (let i = 1; i < f.masks.length; i++)
          if (f.maskAge[i] >= cfg.graceTastings && (j < 0 || Math.abs(f.w[i]) < Math.abs(f.w[j]))) j = i;
        if (j >= 0 && Math.abs(f.w[j]) < cfg.tastePrune + 1.5) {
          f.masks.splice(j, 1); f.w.splice(j, 1); f.maskAge.splice(j, 1);
          for (const rc of f.memory) rc.phi.splice(j, 1);
        }
      }
      if (f.masks.length < cfg.tasteCap) {
        f.masks.push(chosen); f.w.push(0); f.maskAge.push(0);
        for (const rc of f.memory) rc.phi.push(walsh(chosen, rc.bits));
        f.buf.splice(bestIdx, 1);
        this.tel.admissions++;
        if (this.rule.target.includes(chosen)) this.tel.correctAdm++;
      }
    }

    for (let i = f.buf.length - 1; i >= 0; i--) {
      if (f.buf[i].age >= cfg.evictAge) f.buf.splice(i, 1);
    }
  }

  moveFeatures(f, goodPred, dir, occ) {
    const [dx, dy] = MOVES[dir], x = f.x + dx, y = f.y + dy, p = this.plant[this.cell(x, y)];
    const food = p ? p.amount / this.cfg.plantCap : 0, good = p ? food * goodPred[p.kind] : 0;
    let s4 = 0;
    if (dir) for (let d = 1; d <= 4; d++) for (let s = -d; s <= d; s++) {
      const cx = dx ? f.x + dx * d : f.x + s, cy = dy ? f.y + dy * d : f.y + s, q = this.plant[this.cell(cx, cy)];
      if (!q) continue;
      s4 += q.amount * goodPred[q.kind] / (d * d);
    }
    return [1, food, good, Math.tanh(s4 / 4), Math.min(1, (occ.get(this.cell(x, y)) ?? 0) / 3), f.energy / this.cfg.maxEnergy * 2 - 1];
  }

  step() {
    const cfg = this.cfg, N = cfg.size;
    if (this.tick > 0 && this.tick % cfg.macroEvery === 0) {
      this.subset = makeSubset(this.r, cfg.subsetSize);
      this.rule = makeSubRule(this.r, this.subset, 0);
      this.redrawCodes();
      if (this.mode === 'TRUE_ORACLE') for (const f of this.flies) { f.masks = [0, ...this.rule.target]; f.w = Array(f.masks.length).fill(0); f.memory = []; }
    } else if (this.tick > 0 && this.tick % cfg.subEvery === 0) {
      this.rule = makeSubRule(this.r, this.subset, this.rule.mask);
      this.redrawCodes();
      if (this.mode === 'TRUE_ORACLE') for (const f of this.flies) { f.masks = [0, ...this.rule.target]; f.w = Array(f.masks.length).fill(0); f.memory = []; }
    } else if (this.tick > 0 && this.tick % cfg.shiftEvery === 0) {
      this.redrawCodes();
    }

    if (this.tick > 0 && this.tick % cfg.relocateEvery === 0) {
      const i = Math.floor(this.r() * cfg.patches);
      for (let k = 0; k < this.plant.length; k++) if (this.plant[k]?.patch === i) this.plant[k] = null;
      this.patchCenters[i] = [Math.floor(this.r() * N), Math.floor(this.r() * N)];
      this.seedPatch(i);
    }
    for (const p of this.plant) if (p) p.amount = Math.min(cfg.plantCap, p.amount + cfg.regrow);

    const occ = new Map();
    for (const f of this.flies) { const k = this.cell(f.x, f.y); occ.set(k, (occ.get(k) ?? 0) + 1); }
    const order = this.flies.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const born = [];

    for (const idx of order) {
      const f = this.flies[idx], e0 = f.energy;
      const goodPred = this.codes.map(bits => {
        const p = this.tastePredict(f, bits);
        return p > cfg.acceptAt ? p - (1 - p) * cfg.toxin : 0;
      });
      const bases = MOVES.map((_, d) => this.moveFeatures(f, goodPred, d, occ));
      const qs = bases.map(base => base.reduce((s, v, j) => s + f.moveW[j] * v, 0));
      if (f.movePending) {
        const rew = f.movePending.reward ?? 0;
        const delta = clip(rew - f.rbar, 4);
        f.rbar += .02 * (rew - f.rbar);
        for (let j = 0; j < f.moveW.length; j++) {
          f.moveTrace[j] = .8 * f.moveTrace[j] + f.movePending.base[j];
          f.moveW[j] = clip(f.moveW[j] + .05 * delta * f.moveTrace[j], 8);
        }
      }
      const qmax = Math.max(...qs);
      const ties = [];
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
        const bits = this.codes[pl.kind];
        const pred = this.tastePredict(f, bits);
        if (pred > cfg.acceptAt || f.r() < cfg.tasteEps) {
          const take = Math.min(pl.amount, cfg.bite);
          pl.amount -= take;
          const good = this.kindValence[pl.kind] > 0;
          f.energy += good ? take : -take * cfg.toxin;
          this.tel.bites++;
          const lab = (good ? 1 : 0) ^ (this.r() < cfg.labelNoise ? 1 : 0);
          this.tasteLearn(f, bits, lab, pl.kind);
        }
      }
      f.energy = Math.min(cfg.maxEnergy, f.energy);
      f.age++;
      f.movePending.reward = (f.energy - e0) / 4;
      if (f.energy >= 60 && this.flies.length + born.length < cfg.capacity) {
        f.energy -= cfg.birthCost;
        born.push([f, (f.x + Math.floor(this.r() * 3) - 1 + N) % N, (f.y + Math.floor(this.r() * 3) - 1 + N) % N]);
      }
    }

    const alive = [];
    for (const f of this.flies) {
      if (f.energy <= 0 || f.age >= cfg.maxAge) { this.tel.deathAgeSum += f.age; this.tel.deaths++; }
      else alive.push(f);
    }
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
        const acc = this.tastePredict(f, this.codes[k]) > .5 ? 1 : 0;
        if (this.kindValence[k] > 0) { g += acc; gn++; } else { b += acc; bn++; }
      }
      sum += (g / gn) - (b / bn);
    }
    return sum / this.flies.length;
  }
}

function runOne(seed, mode, overrides) {
  const w = new WorldA(seed, mode, overrides);
  const late = [], skills = [];
  for (let t = 0; t < w.cfg.ticks && w.flies.length; t++) {
    w.step();
    if (w.tick > 10000 && w.tick % w.cfg.every === 0) {
      late.push(w.flies.length);
      skills.push(w.skill());
    }
  }
  const extinct = !w.flies.length;
  while (late.length < (w.cfg.ticks - 10000) / w.cfg.every) { late.push(0); skills.push(0); }
  return {
    seed, mode,
    pop: late.reduce((a, b) => a + b, 0) / late.length,
    skill: skills.reduce((a, b) => a + b, 0) / skills.length,
    extinct, tel: w.tel
  };
}

if (!isMainThread) {
  const { seed, mode, overrides } = workerData;
  parentPort.postMessage(runOne(seed, mode, overrides));
} else {
  const nSeeds = Number(process.argv[2] || 8);
  const inheritMasks = process.argv[3] === 'inh';
  const inheritAlpha = process.argv[4] === 'inha';
  const SEEDS = Array.from({ length: nSeeds }, (_, i) => 601 + i);
  const MODES = ['NOREV', 'FIXED', 'META', 'METAOFF', 'SHAM', 'EVOR', 'ORACLE_L2', 'TRUE_ORACLE'];
  const overrides = { inheritMasks, inheritAlpha };
  const jobs = SEEDS.flatMap(seed => MODES.map(mode => ({ seed, mode, overrides })));
  const R = {};
  await new Promise(res => {
    let next = 0, done = 0;
    const go = () => {
      if (next >= jobs.length) return;
      const wk = new Worker(new URL(import.meta.url), { workerData: jobs[next++] });
      wk.on('message', m => { (R[m.seed] ??= {})[m.mode] = m; });
      wk.on('error', e => { console.error(e); process.exit(1); });
      wk.on('exit', () => { if (++done === jobs.length) res(); else go(); });
    };
    for (let i = 0; i < Math.min(jobs.length, Math.max(1, cpus().length - 1)); i++) go();
  });

  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  console.log(`\n=== Design A v5 (seeds 601..${600 + nSeeds}, inheritMasks=${inheritMasks}, inheritAlpha=${inheritAlpha}) ===`);
  for (const m of MODES) {
    const pops = SEEDS.map(s => R[s][m].pop);
    const sks = SEEDS.map(s => R[s][m].skill);
    const exts = SEEDS.filter(s => R[s][m].extinct).length;
    const adms = mean(SEEDS.map(s => R[s][m].tel.admissions));
    const cadms = mean(SEEDS.map(s => R[s][m].tel.correctAdm));
    const evb = mean(SEEDS.map(s => R[s][m].tel.evBites));
    const age = mean(SEEDS.map(s => R[s][m].tel.deaths ? R[s][m].tel.deathAgeSum / R[s][m].tel.deaths : 0));
    console.log(`${m.padEnd(12)} pop=${mean(pops).toFixed(2).padStart(6)}  skill=${mean(sks).toFixed(3)}  ext=${exts}  age=${age.toFixed(0).padStart(4)}  evB=${evb.toFixed(0).padStart(6)}  adm=${adms.toFixed(0).padStart(5)} (ok=${cadms.toFixed(0).padStart(5)}, prec=${adms ? (100 * cadms / adms).toFixed(0) : 0}%)`);
  }
  const summarize = (metric) => {
    const g = SEEDS.map(s => R[s].FIXED[metric] - R[s].NOREV[metric]);
    const m = SEEDS.map(s => R[s].META[metric] - R[s].FIXED[metric]);
    const d = SEEDS.map((_, i) => m[i] - 0.5 * g[i]);
    const dO = SEEDS.map(s => (R[s].ORACLE_L2[metric] - R[s].FIXED[metric]) - 0.5 * (R[s].FIXED[metric] - R[s].NOREV[metric]));
    const vsSham = SEEDS.map(s => R[s].META[metric] - R[s].SHAM[metric]);
    const vsEvor = SEEDS.map(s => R[s].META[metric] - R[s].EVOR[metric]);
    const offDiff = SEEDS.map(s => Math.abs(R[s].METAOFF[metric] - R[s].NOREV[metric]));
    const ratio = (mean(SEEDS.map(s => R[s].META[metric] - R[s].NOREV[metric]))) / mean(g);
    const ratioO = (mean(SEEDS.map(s => R[s].ORACLE_L2[metric] - R[s].NOREV[metric]))) / mean(g);
    console.log(`\n[${metric}]`);
    console.log(`  g (FIXED-NOREV)   = ${mean(g).toFixed(3)}`);
    console.log(`  m (META-FIXED)    = ${mean(m).toFixed(3)}   ratio=${ratio.toFixed(2)}x   d=${mean(d).toFixed(3)} (${d.filter(x => x > 0).length}/${nSeeds})`);
    console.log(`  ORACLE_L2         = ratio=${ratioO.toFixed(2)}x   dO=${mean(dO).toFixed(3)} (${dO.filter(x => x > 0).length}/${nSeeds})`);
    console.log(`  META - SHAM       = ${mean(vsSham).toFixed(3)} (${vsSham.filter(x => x > 0).length}/${nSeeds})`);
    console.log(`  META - EVOR       = ${mean(vsEvor).toFixed(3)} (${vsEvor.filter(x => x > 0).length}/${nSeeds})`);
    console.log(`  max|METAOFF-NOREV|= ${Math.max(...offDiff).toFixed(6)}`);
  };
  summarize('pop');
  summarize('skill');
}
