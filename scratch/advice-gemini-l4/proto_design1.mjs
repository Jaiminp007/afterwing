// Exploratory prototype ONLY on authorized seeds 2001-2008.
// Tests Design 1 (Payoff-Gated L2 Plasticity & Floor Controller) vs a full constant-L2 grid
// across 3 candidate world schedules (all minimal diffs from microverse/l3v.mjs).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { rng32, mix, walsh, B, ALL_PAIRS, BASE_CFG, samplePair } from '../../microverse/l3v.mjs';

const ALL_BITS = Array.from({ length: B }, (_, i) => i);
const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);

function makeSubset(r, k, prevSubset = null, disjoint = false) {
  const pool = disjoint && prevSubset ? ALL_BITS.filter(b => !prevSubset.includes(b)) : [...ALL_BITS];
  return shuffleInPlace(pool, r).slice(0, k).sort((a, b) => a - b);
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

// World schedule modes:
//   'l3v':      macroEvery=3600, random S
//   'disj1800': macroEvery=1800, disjoint S
//   'alt':      alternating slow/fast disjoint macro durations [3600, 900, 900, 900]
//   'alt2':     alternating slow/fast disjoint macro durations [3000, 600, 600, 600, 600]
function buildMacroTicks(mode, ticks) {
  const set = new Set();
  if (mode === 'l3v') {
    for (let t = 3600; t < ticks; t += 3600) set.add(t);
  } else if (mode === 'disj1800') {
    for (let t = 1800; t < ticks; t += 1800) set.add(t);
  } else if (mode === 'alt') {
    const pat = [3600, 900, 900, 900];
    let t = 0, idx = 0;
    while (true) { t += pat[idx++ % pat.length]; if (t >= ticks) break; set.add(t); }
  } else if (mode === 'alt2') {
    const pat = [3000, 600, 600, 600, 600];
    let t = 0, idx = 0;
    while (true) { t += pat[idx++ % pat.length]; if (t >= ticks) break; set.add(t); }
  }
  return set;
}

class WorldL4Proto {
  constructor(seed, armSpec, worldMode) {
    this.cfg = { ...BASE_CFG, alphaMax: 100, ...armSpec.cfg };
    this.arm = armSpec;
    this.worldMode = worldMode;
    this.disjointMacro = worldMode !== 'l3v';
    this.macroTicks = buildMacroTicks(worldMode, this.cfg.ticks);
    this.seed = seed;
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
    const r = key(0), rProp = key(0x50524f50);
    let alpha = Array(B).fill(1);
    if (parent && (l2 === 'meta' || l2 === 'meta3')) alpha = [...parent.alpha];
    // L3 state: trust in [0, 1] and drought counter
    const trust = (parent && l2 === 'meta3' && this.arm.inheritL3) ? parent.trust : 1.0;
    const f = {
      id, x, y, energy, age: 0, gen, r, rProp,
      masks: [0], w: [0], maskAge: [0],
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, deck: [], deckPos: 0,
      trust, drought: 0,
      l2Decay: cfg.alphaDecay, l2Boost: cfg.alphaBoost, l2Floor: cfg.alphaFloor,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
    };
    this.flies.push(f);
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
  proposal(f) {
    if (this.arm.l2 === 'oracle') { const a = Array(B).fill(0); for (const b of this.subset) a[b] = 10; return [a, 0]; }
    return [f.alpha, f.l2Floor];
  }
  drawCandidate(f, excl) {
    if (this.arm.l2 === 'deck') {
      for (let tries = 0; tries < 2 * ALL_PAIRS.length + 1; tries++) {
        if (f.deckPos >= f.deck.length) { f.deck = shuffleInPlace(ALL_PAIRS.map(p => p.mask), f.rProp); f.deckPos = 0; }
        const m = f.deck[f.deckPos++];
        if (!excl.has(m)) return m;
      }
      return -1;
    }
    const [alpha, floor] = this.proposal(f);
    return samplePair(alpha, excl, f.rProp, floor, null);
  }
  tasteLearn(f, bits, target, kind) {
    const cfg = this.cfg;
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
    if (f.memory.length < 32) f.memory.push(rec); else f.memory[(f.seen - 1) % 32] = rec;
    this.tasteUpdate(f, phi, target);
    const rep = f.memory[Math.floor(f.r() * f.memory.length)];
    this.tasteUpdate(f, rep.phi, rep.target);
    for (let i = 0; i < f.maskAge.length; i++) f.maskAge[i]++;

    if (!this.arm.l1) return;
    if (kind === f.lastKind) return;
    f.lastKind = kind;
    const D = 1 - 1 / cfg.tasteMemory, D2 = D * D;
    f.n++;

    const excl = new Set(f.masks); for (const s of f.buf) excl.add(s.mask);
    while (f.buf.length < cfg.K) {
      const m = this.drawCandidate(f, excl);
      if (m < 0) break;
      excl.add(m); f.buf.push({ mask: m, ev: 0, s2: 0, age: 0 });
    }
    for (const s of f.buf) { s.ev = s.ev * D + walsh(s.mask, bits) * residual; s.s2 = s.s2 * D2 + residual * residual; s.age++; }
    if (f.n % cfg.tasteEvery !== 0) return;

    const l2 = this.arm.l2;
    if (l2 === 'meta' || l2 === 'meta3') {
      const valMasks = [];
      for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) valMasks.push(f.masks[i]);

      // L3 controller: adapts (l2Decay, l2Boost, l2Floor) from L2's own payoff/surprise
      if (l2 === 'meta3') {
        const maxA = Math.max(...f.alpha);
        if (valMasks.length > 0) {
          f.drought = 0;
          // Did L2's prior predict the validated mask, or was it out-of-prior (changepoint)?
          let bestHit = 0;
          for (const m of valMasks) {
            const [ba, bb] = pairBits(m);
            const h = Math.min(f.alpha[ba], f.alpha[bb]) / Math.max(1, maxA);
            if (h > bestHit) bestHit = h;
          }
          if (maxA > 5 && bestHit < 0.15) {
            // Out-of-prior validated mask: L2 prior was stale -> high plasticity shock!
            f.trust = Math.max(0, f.trust - 0.8);
          } else {
            // In-prior validation: L2 is working -> high stability & concentration!
            f.trust = Math.min(1, f.trust + 0.35);
          }
        } else {
          f.drought++;
          // Sustained drought while prior is concentrated -> L2 prior is failing!
          const droughtThresh = this.arm.droughtThresh ?? 8;
          if (f.drought > droughtThresh && maxA > 3) {
            f.trust = Math.max(0, f.trust - 0.25);
          }
        }
        // Map trust in [0, 1] to L2 parameters:
        // trust=1 -> stable/sharp: decay=.001, boost=15, floor=.02
        // trust=0 -> plastic/wide: decay=.35,  boost=20, floor=50
        const t = f.trust;
        f.l2Decay = 0.001 + (1 - t) * (1 - t) * 0.35;
        f.l2Boost = 15 + (1 - t) * 10;
        f.l2Floor = 0.02 + Math.pow(1 - t, 2) * 50;
      }

      // Standard L2 update using (f.l2Decay, f.l2Boost)
      for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - f.l2Decay) * (f.alpha[b] - 1));
      for (const m of valMasks) {
        for (const bit of pairBits(m)) f.alpha[bit] = Math.min(cfg.alphaMax, f.alpha[bit] + f.l2Boost);
      }
    }

    // L1: prune, admit, evict
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
    if (this.tick > 0 && this.macroTicks.has(this.tick)) {
      this.subset = makeSubset(this.rRule, cfg.subsetSize, this.subset, this.disjointMacro);
      this.rule = makeSubRule(this.rRule, this.subset, 0);
      this.redrawCodes();
    } else if (this.tick > 0 && this.tick % cfg.subEvery === 0) {
      this.rule = makeSubRule(this.rRule, this.subset, this.rule.mask);
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
    this.flies = this.flies.filter(f => f.energy > 0 && f.age < cfg.maxAge);
    for (const [p, x, y] of born) this.spawn(p, x, y, cfg.childEnergy, p.gen + 1);
    this.tick++;
  }
  alphaShareOnS() {
    if (!this.flies.length) return 0;
    let s = 0;
    for (const f of this.flies) { const [al, fl] = this.proposal(f); const tot = al.reduce((a, x) => a + fl + x, 0); s += this.subset.reduce((a, b) => a + fl + al[b], 0) / tot; }
    return s / this.flies.length;
  }
}

function runProto(seed, armSpec, worldMode) {
  const w = new WorldL4Proto(seed, armSpec, worldMode);
  let popSum = 0, nLate = 0, alphaSum = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; alphaSum += w.alphaShareOnS(); }
  }
  return { seed, pop: popSum / nLate, popSum, alphaShareOnS: alphaSum / nLate };
}

if (!isMainThread) {
  const { seed, armSpec, worldMode } = workerData;
  parentPort.postMessage(runProto(seed, armSpec, worldMode));
} else {
  const worldMode = process.argv[2] || 'alt';
  const seeds = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008];
  const arms = [
    { label: 'FIXED_DECK', l1: true, l2: 'deck', cfg: {} },
    { label: 'ORACLE_L2', l1: true, l2: 'oracle', cfg: {} },
    { label: 'M_L3V', l1: true, l2: 'meta', cfg: { alphaDecay: .006, alphaBoost: 4, alphaMax: 30, alphaFloor: .02 } },
    { label: 'M_D005', l1: true, l2: 'meta', cfg: { alphaDecay: .005, alphaBoost: 15, alphaMax: 100, alphaFloor: .02 } },
    { label: 'M_D015', l1: true, l2: 'meta', cfg: { alphaDecay: .015, alphaBoost: 15, alphaMax: 100, alphaFloor: .02 } },
    { label: 'M_D030', l1: true, l2: 'meta', cfg: { alphaDecay: .030, alphaBoost: 15, alphaMax: 100, alphaFloor: .02 } },
    { label: 'M_D060', l1: true, l2: 'meta', cfg: { alphaDecay: .060, alphaBoost: 15, alphaMax: 100, alphaFloor: .02 } },
    { label: 'M_D120', l1: true, l2: 'meta', cfg: { alphaDecay: .120, alphaBoost: 20, alphaMax: 100, alphaFloor: .02 } },
    { label: 'M_D030_F2', l1: true, l2: 'meta', cfg: { alphaDecay: .030, alphaBoost: 15, alphaMax: 100, alphaFloor: 2.0 } },
    { label: 'META3_T6', l1: true, l2: 'meta3', droughtThresh: 6, inheritL3: true, cfg: { alphaMax: 100 } },
    { label: 'META3_T10', l1: true, l2: 'meta3', droughtThresh: 10, inheritL3: true, cfg: { alphaMax: 100 } },
  ];
  const jobs = seeds.flatMap(seed => arms.map(a => ({ seed, armSpec: a, worldMode, label: a.label })));
  const rows = {};
  const t0 = Date.now();
  await new Promise((res, rej) => {
    let next = 0, done = 0;
    const go = () => {
      if (next >= jobs.length) return;
      const job = jobs[next++];
      const wk = new Worker(new URL(import.meta.url), { workerData: job });
      wk.on('message', m => { (rows[m.seed] ??= {})[job.label] = m; });
      wk.on('error', rej);
      wk.on('exit', () => { if (++done === jobs.length) res(); else go(); });
    };
    for (let i = 0; i < Math.min(jobs.length, Math.max(1, cpus().length - 1)); i++) go();
  });
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  console.log(`\n=== World: ${worldMode} (seeds 2001-2008, ${((Date.now() - t0) / 1000).toFixed(1)}s) ===`);
  const fPops = seeds.map(s => rows[s].FIXED_DECK.pop);
  let bestMeta = null, bestMetaPop = -1;
  for (const a of arms) {
    const pops = seeds.map(s => rows[s][a.label].pop);
    const sh = seeds.map(s => rows[s][a.label].alphaShareOnS);
    const mp = mean(pops), gain = mp - mean(fPops);
    if (a.l2 === 'meta' && mp > bestMetaPop) { bestMetaPop = mp; bestMeta = a.label; }
    console.log(`${a.label.padEnd(11)} pop=${mp.toFixed(2)}  vsF=${gain >= 0 ? '+' : ''}${gain.toFixed(2)}  shareS=${mean(sh).toFixed(3)}`);
  }
  const mPops = seeds.map(s => rows[s][bestMeta].pop);
  for (const m3 of ['META3_T6', 'META3_T10']) {
    const p3 = seeds.map(s => rows[s][m3].pop);
    const d4 = seeds.map((_, i) => (p3[i] - fPops[i]) - 1.5 * (mPops[i] - fPops[i]));
    const ratio = (mean(p3) - mean(fPops)) / (mean(mPops) - mean(fPops));
    const wins = d4.filter(x => x > 0).length;
    console.log(`vs best const ${bestMeta} (${bestMetaPop.toFixed(2)}): ${m3} ratio=${ratio.toFixed(2)}x  d4=${mean(d4) >= 0 ? '+' : ''}${mean(d4).toFixed(2)} (${wins}/8)`);
  }
}
