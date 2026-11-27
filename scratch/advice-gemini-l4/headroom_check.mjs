// Exploratory Oracle-L3 headroom check ONLY on authorized seeds 2001-2008.
// Compares Oracle-L3 vs best constant-L2 across candidate worlds for Design 1 and Design 2.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { rng32, mix, walsh, BASE_CFG } from '../../microverse/l3v.mjs';

const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function runWorld(seed, worldSpec, armSpec) {
  const B = worldSpec.B ?? 12;
  const ALL_BITS = Array.from({ length: B }, (_, i) => i);
  const ALL_PAIRS = [];
  for (let i = 0; i < B; i++) for (let j = i + 1; j < B; j++) ALL_PAIRS.push({ mask: (1 << i) | (1 << j), a: i, b: j });
  const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);
  const cfg = { ...BASE_CFG, alphaMax: 100, ...worldSpec.cfg, ...armSpec.cfg };

  const rRule = rng32(mix(seed ^ 0x52554c45));
  const rPatch = rng32(mix(seed ^ 0x50415443));
  const rBeh = rng32(mix(seed));
  const N = cfg.size;
  const plant = Array(N * N).fill(null);
  const patchCenters = Array.from({ length: cfg.patches }, () => [Math.floor(rPatch() * N), Math.floor(rPatch() * N)]);

  // Build macro schedule
  const macroTicks = new Map(); // tick -> regimeKind ('clique' | 'pairs' | 'fast')
  {
    let t = 0, idx = 0;
    const pat = worldSpec.pattern; // array of { dur, kind }
    while (t < cfg.ticks) {
      const p = pat[idx++ % pat.length];
      macroTicks.set(t, p.kind);
      t += p.dur;
    }
  }

  let curKind = macroTicks.get(0);
  let lastMacroTick = 0;
  let subset = null; // for clique
  let pairPool = null; // array of valid masks for current macro-epoch
  let rule = null;

  function setupMacro(kind) {
    curKind = kind;
    const prevBits = new Set(subset ?? (pairPool ? pairPool.flatMap(pairBits) : []));
    const disjPool = ALL_BITS.filter(b => !prevBits.has(b));
    if (kind === 'clique' || kind === 'fast') {
      const pool = (worldSpec.disjoint && disjPool.length >= cfg.subsetSize) ? [...disjPool] : [...ALL_BITS];
      subset = shuffleInPlace(pool, rRule).slice(0, cfg.subsetSize).sort((a, b) => a - b);
      pairPool = [];
      for (let i = 0; i < subset.length; i++) for (let j = i + 1; j < subset.length; j++) pairPool.push((1 << subset[i]) | (1 << subset[j]));
    } else if (kind === 'pairs') {
      // 3 or 4 disjoint pairs
      const nPairs = worldSpec.nDisjointPairs ?? 4;
      const perm = shuffleInPlace([...ALL_BITS], rRule);
      subset = null;
      pairPool = [];
      for (let i = 0; i < nPairs; i++) pairPool.push((1 << perm[2 * i]) | (1 << perm[2 * i + 1]));
    }
  }
  function nextSubRule(prevMask = 0) {
    const cands = pairPool.filter(m => m !== prevMask);
    const m = cands[Math.floor(rRule() * cands.length)];
    rule = { mask: m, sign: rRule() < .5 ? -1 : 1 };
  }
  const ruleValence = bits => rule.sign * walsh(rule.mask, bits);
  let codes = [], kindValence = [];
  function redrawCodes() {
    const half = cfg.kinds / 2, seen = new Set(), good = [], bad = [];
    while (good.length < half || bad.length < half) {
      const c = Math.floor(rRule() * (1 << B));
      if (seen.has(c)) continue; seen.add(c);
      const bits = ALL_BITS.map(b => ((c >>> b) & 1) ? 1 : -1);
      const v = ruleValence(bits);
      if (v > 0 && good.length < half) good.push(bits);
      else if (v < 0 && bad.length < half) bad.push(bits);
    }
    codes = shuffleInPlace([...good, ...bad], rRule);
    kindValence = codes.map(ruleValence);
  }
  function seedPatch(i) {
    const [cx, cy] = patchCenters[i], R = cfg.patchRadius;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
      if (dx * dx + dy * dy > R * R || rPatch() > cfg.plantDensity) continue;
      const x = (cx + dx + N) % N, y = (cy + dy + N) % N, k = y * N + x;
      if (!plant[k]) plant[k] = { kind: Math.floor(rPatch() * codes.length), amount: cfg.plantCap * rPatch(), patch: i };
    }
  }
  const cell = (x, y) => ((y + N) % N) * N + ((x + N) % N);

  setupMacro(curKind);
  nextSubRule(0);
  redrawCodes();
  for (let i = 0; i < cfg.patches; i++) seedPatch(i);

  let nextId = 1, flies = [];
  function spawn(parent, x, y, energy, gen) {
    const id = nextId++;
    const key = t => rng32(mix(seed ^ Math.imul(id, 2654435761) ^ t));
    const r = key(0), rProp = key(0x50524f50);
    let alpha = Array(B).fill(1);
    let pAlpha = Array(ALL_PAIRS.length).fill(1);
    if (parent && armSpec.l2 !== 'deck' && armSpec.l2 !== 'oracle') {
      alpha = [...parent.alpha];
      pAlpha = [...parent.pAlpha];
    }
    const f = {
      id, x, y, energy, age: 0, gen, r, rProp,
      masks: [0], w: [0], maskAge: [0],
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, pAlpha, deck: [], deckPos: 0,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
    };
    flies.push(f);
  }
  for (let i = 0; i < cfg.founders; i++) spawn(null, Math.floor(rBeh() * N), Math.floor(rBeh() * N), 50, 0);

  const maskToIdx = new Map(ALL_PAIRS.map((p, i) => [p.mask, i]));

  function drawCandidate(f, excl, tick) {
    const l2 = armSpec.l2;
    if (l2 === 'deck') {
      for (let tries = 0; tries < 2 * ALL_PAIRS.length + 1; tries++) {
        if (f.deckPos >= f.deck.length) { f.deck = shuffleInPlace(ALL_PAIRS.map(p => p.mask), f.rProp); f.deckPos = 0; }
        const m = f.deck[f.deckPos++];
        if (!excl.has(m)) return m;
      }
      return -1;
    }
    if (l2 === 'oracle') {
      const c = pairPool.filter(m => !excl.has(m));
      return c.length ? c[Math.floor(f.rProp() * c.length)] : -1;
    }
    // Determine effective mode and floor
    let mode = l2; // 'bit' | 'pair' | 'mix50' | 'oracle_plast' | 'oracle_gram'
    let fl = cfg.alphaFloor;
    if (l2 === 'oracle_plast') {
      mode = 'bit';
      const sinceMacro = tick - lastMacroTick;
      fl = (sinceMacro < (armSpec.flushWin ?? 150)) ? 100 : 0.02;
    } else if (l2 === 'oracle_gram') {
      mode = curKind === 'pairs' ? 'pair' : 'bit';
      const sinceMacro = tick - lastMacroTick;
      if (armSpec.withFlush && sinceMacro < 150) fl = 100;
    }
    const masks = [], ws = [];
    for (let idx = 0; idx < ALL_PAIRS.length; idx++) {
      const p = ALL_PAIRS[idx];
      if (excl.has(p.mask)) continue;
      let w;
      if (mode === 'bit') {
        w = (fl + f.alpha[p.a]) * (fl + f.alpha[p.b]);
      } else if (mode === 'pair') {
        w = fl + f.pAlpha[idx] * f.pAlpha[idx];
      } else if (mode === 'mix50') {
        const wb = (fl + f.alpha[p.a]) * (fl + f.alpha[p.b]);
        const wp = fl + f.pAlpha[idx] * f.pAlpha[idx];
        // Normalize? Better: pick component with p=0.5!
        w = wb + wp; // handled below
      }
      masks.push(p.mask); ws.push(w);
    }
    if (mode === 'mix50') {
      const usePair = f.rProp() < 0.5;
      ws.length = 0;
      for (const m of masks) {
        const idx = maskToIdx.get(m), p = ALL_PAIRS[idx];
        ws.push(usePair ? (fl + f.pAlpha[idx] * f.pAlpha[idx]) : ((fl + f.alpha[p.a]) * (fl + f.alpha[p.b])));
      }
    }
    if (!masks.length) return -1;
    let sum = 0; for (const w of ws) sum += w;
    let u = f.rProp() * sum;
    for (let i = 0; i < masks.length; i++) { u -= ws[i]; if (u <= 0) return masks[i]; }
    return masks[masks.length - 1];
  }

  function modelProb(f, bits) {
    const n = f.masks.length; let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * walsh(f.masks[i], bits) / Math.sqrt(n);
    return sigmoid(z);
  }
  function tastePredict(f, bits) {
    const gate = f.lossModel !== undefined && f.lossModel >= f.lossBase;
    return .05 + .9 * (gate ? f.base : modelProb(f, bits));
  }
  function tasteUpdate(f, phi, target) {
    const n = phi.length; let z = Math.log(2);
    for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n);
    const step = 4.0 * (target - sigmoid(z)) / Math.sqrt(n);
    for (let i = 0; i < n; i++) f.w[i] = clip(f.w[i] + step * phi[i], 8);
  }
  function removeMask(f, i) { f.masks.splice(i, 1); f.w.splice(i, 1); f.maskAge.splice(i, 1); for (const rc of f.memory) rc.phi.splice(i, 1); }

  function tasteLearn(f, bits, target, kind, tick) {
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
    tasteUpdate(f, phi, target);
    const rep = f.memory[Math.floor(f.r() * f.memory.length)];
    tasteUpdate(f, rep.phi, rep.target);
    for (let i = 0; i < f.maskAge.length; i++) f.maskAge[i]++;

    if (kind === f.lastKind) return;
    f.lastKind = kind;
    const D = 1 - 1 / cfg.tasteMemory, D2 = D * D;
    f.n++;
    const excl = new Set(f.masks); for (const s of f.buf) excl.add(s.mask);
    while (f.buf.length < cfg.K) {
      const m = drawCandidate(f, excl, tick);
      if (m < 0) break;
      excl.add(m); f.buf.push({ mask: m, ev: 0, s2: 0, age: 0 });
    }
    for (const s of f.buf) { s.ev = s.ev * D + walsh(s.mask, bits) * residual; s.s2 = s.s2 * D2 + residual * residual; s.age++; }
    if (f.n % cfg.tasteEvery !== 0) return;

    const l2 = armSpec.l2;
    if (l2 !== 'deck' && l2 !== 'oracle') {
      let dec = cfg.alphaDecay, bst = cfg.alphaBoost;
      if (l2 === 'oracle_plast' || (l2 === 'oracle_gram' && armSpec.withFlush)) {
        const sinceMacro = tick - lastMacroTick;
        if (sinceMacro < (armSpec.flushWin ?? 150)) { dec = 0.50; bst = 25; }
        else { dec = 0.001; bst = 20; }
      }
      for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - dec) * (f.alpha[b] - 1));
      for (let k = 0; k < f.pAlpha.length; k++) f.pAlpha[k] = Math.max(.05, 1 + (1 - dec) * (f.pAlpha[k] - 1));
      for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) {
        const m = f.masks[i];
        for (const bit of pairBits(m)) f.alpha[bit] = Math.min(cfg.alphaMax, f.alpha[bit] + bst);
        const idx = maskToIdx.get(m);
        if (idx !== undefined) f.pAlpha[idx] = Math.min(cfg.alphaMax, f.pAlpha[idx] + bst);
      }
    }

    for (let i = f.masks.length - 1; i >= 1; i--) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) < cfg.tastePrune) removeMask(f, i);
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
        if (j >= 0 && Math.abs(f.w[j]) < cfg.tastePrune + 1.5) removeMask(f, j);
      }
      if (f.masks.length < cfg.tasteCap) {
        f.masks.push(chosen); f.w.push(0); f.maskAge.push(0);
        for (const rc of f.memory) rc.phi.push(walsh(chosen, rc.bits));
        f.buf.splice(bestIdx, 1);
      }
    }
    for (let i = f.buf.length - 1; i >= 0; i--) if (f.buf[i].age >= cfg.evictAge) f.buf.splice(i, 1);
  }

  let popSum = 0, nLate = 0;
  for (let tick = 0; tick < cfg.ticks; tick++) {
    if (tick > 0 && macroTicks.has(tick)) {
      lastMacroTick = tick;
      setupMacro(macroTicks.get(tick));
      nextSubRule(0);
      redrawCodes();
    } else if (tick > 0 && tick % cfg.subEvery === 0) {
      nextSubRule(rule.mask);
      redrawCodes();
    } else if (tick > 0 && tick % cfg.shiftEvery === 0) redrawCodes();

    if (tick > 0 && tick % cfg.relocateEvery === 0) {
      const i = Math.floor(rPatch() * cfg.patches);
      for (let k = 0; k < plant.length; k++) if (plant[k]?.patch === i) plant[k] = null;
      patchCenters[i] = [Math.floor(rPatch() * N), Math.floor(rPatch() * N)];
      seedPatch(i);
    }
    for (const p of plant) if (p) p.amount = Math.min(cfg.plantCap, p.amount + cfg.regrow);
    if (flies.length) {
      const occ = new Map();
      for (const f of flies) { const k = cell(f.x, f.y); occ.set(k, (occ.get(k) ?? 0) + 1); }
      const order = shuffleInPlace(flies.map((_, i) => i), rBeh);
      const born = [];
      for (const idx of order) {
        const f = flies[idx], e0 = f.energy;
        const goodPred = codes.map(bits => { const p = tastePredict(f, bits); return p > cfg.acceptAt ? p - (1 - p) * cfg.toxin : 0; });
        const bases = MOVES.map(([dx, dy], d) => {
          const x = f.x + dx, y = f.y + dy, p = plant[cell(x, y)];
          const food = p ? p.amount / cfg.plantCap : 0, good = p ? food * goodPred[p.kind] : 0;
          let s4 = 0;
          if (d) for (let dist = 1; dist <= 4; dist++) for (let s = -dist; s <= dist; s++) {
            const cx = dx ? f.x + dx * dist : f.x + s, cy = dy ? f.y + dy * dist : f.y + s, q = plant[cell(cx, cy)];
            if (q) s4 += q.amount * goodPred[q.kind] / (dist * dist);
          }
          return [1, food, good, Math.tanh(s4 / 4), Math.min(1, (occ.get(cell(x, y)) ?? 0) / 3), f.energy / cfg.maxEnergy * 2 - 1];
        });
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
        const from = cell(f.x, f.y); occ.set(from, occ.get(from) - 1);
        f.x = (f.x + MOVES[dir][0] + N) % N; f.y = (f.y + MOVES[dir][1] + N) % N;
        const to = cell(f.x, f.y); occ.set(to, (occ.get(to) ?? 0) + 1);
        f.energy -= cfg.metabolism + (dir ? cfg.moveCost : 0) + cfg.brainCost * (f.masks.length + MOVE0.length);
        const pl = plant[to];
        if (pl && pl.amount > .2) {
          const bits = codes[pl.kind], pred = tastePredict(f, bits);
          if (pred > cfg.acceptAt || f.r() < cfg.tasteEps) {
            const take = Math.min(pl.amount, cfg.bite); pl.amount -= take;
            const good = kindValence[pl.kind] > 0;
            f.energy += good ? take : -take * cfg.toxin;
            const lab = (good ? 1 : 0) ^ (f.r() < cfg.labelNoise ? 1 : 0);
            tasteLearn(f, bits, lab, pl.kind, tick);
          }
        }
        f.energy = Math.min(cfg.maxEnergy, f.energy); f.age++;
        f.movePending.reward = (f.energy - e0) / 4;
        if (f.energy >= 60 && flies.length + born.length < cfg.capacity) {
          f.energy -= cfg.birthCost;
          born.push([f, (f.x + Math.floor(f.r() * 3) - 1 + N) % N, (f.y + Math.floor(f.r() * 3) - 1 + N) % N]);
        }
      }
      flies = flies.filter(f => f.energy > 0 && f.age < cfg.maxAge);
      for (const [p, x, y] of born) spawn(p, x, y, cfg.childEnergy, p.gen + 1);
    }
    const nextTick = tick + 1;
    if (nextTick > cfg.lateFrom && nextTick % cfg.every === 0) { popSum += flies.length; nLate++; }
  }
  return { seed, pop: popSum / nLate };
}

if (!isMainThread) {
  const { seed, worldSpec, armSpec } = workerData;
  parentPort.postMessage(runWorld(seed, worldSpec, armSpec));
} else {
  const seeds = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008];
  const tests = [
    {
      name: 'W1_L3V_B12',
      world: { B: 12, disjoint: false, pattern: [{ dur: 3600, kind: 'clique' }] },
      arms: [
        { label: 'FIXED', l2: 'deck', cfg: {} },
        { label: 'M_D015', l2: 'bit', cfg: { alphaDecay: .015, alphaBoost: 15 } },
        { label: 'M_D030', l2: 'bit', cfg: { alphaDecay: .030, alphaBoost: 15 } },
        { label: 'M_D060', l2: 'bit', cfg: { alphaDecay: .060, alphaBoost: 15 } },
        { label: 'O_PLAST', l2: 'oracle_plast', flushWin: 150, cfg: {} },
        { label: 'O_L2', l2: 'oracle', cfg: {} },
      ],
    },
    {
      name: 'W2_DISJ1800_B12',
      world: { B: 12, disjoint: true, pattern: [{ dur: 1800, kind: 'clique' }] },
      arms: [
        { label: 'FIXED', l2: 'deck', cfg: {} },
        { label: 'M_D015', l2: 'bit', cfg: { alphaDecay: .015, alphaBoost: 15 } },
        { label: 'M_D030', l2: 'bit', cfg: { alphaDecay: .030, alphaBoost: 15 } },
        { label: 'M_D060', l2: 'bit', cfg: { alphaDecay: .060, alphaBoost: 15 } },
        { label: 'O_PLAST', l2: 'oracle_plast', flushWin: 150, cfg: {} },
        { label: 'O_L2', l2: 'oracle', cfg: {} },
      ],
    },
    {
      name: 'W3_ALT_B12',
      world: { B: 12, disjoint: true, pattern: [{ dur: 3600, kind: 'clique' }, { dur: 900, kind: 'fast' }, { dur: 900, kind: 'fast' }, { dur: 900, kind: 'fast' }] },
      arms: [
        { label: 'FIXED', l2: 'deck', cfg: {} },
        { label: 'M_D015', l2: 'bit', cfg: { alphaDecay: .015, alphaBoost: 15 } },
        { label: 'M_D030', l2: 'bit', cfg: { alphaDecay: .030, alphaBoost: 15 } },
        { label: 'M_D060', l2: 'bit', cfg: { alphaDecay: .060, alphaBoost: 15 } },
        { label: 'O_PLAST', l2: 'oracle_plast', flushWin: 150, cfg: {} },
        { label: 'O_L2', l2: 'oracle', cfg: {} },
      ],
    },
    {
      name: 'W4_GRAM_MIX_B12',
      world: { B: 12, disjoint: true, nDisjointPairs: 4, pattern: [{ dur: 3000, kind: 'clique' }, { dur: 3000, kind: 'pairs' }] },
      arms: [
        { label: 'FIXED', l2: 'deck', cfg: {} },
        { label: 'M_BIT', l2: 'bit', cfg: { alphaDecay: .030, alphaBoost: 15 } },
        { label: 'M_PAIR', l2: 'pair', cfg: { alphaDecay: .030, alphaBoost: 15 } },
        { label: 'M_MIX50', l2: 'mix50', cfg: { alphaDecay: .030, alphaBoost: 15 } },
        { label: 'O_GRAM', l2: 'oracle_gram', withFlush: false, cfg: { alphaDecay: .030, alphaBoost: 15 } },
        { label: 'O_GR_FL', l2: 'oracle_gram', withFlush: true, cfg: {} },
      ],
    },
  ];

  const jobs = [];
  for (const t of tests) for (const seed of seeds) for (const a of t.arms) jobs.push({ tname: t.name, seed, worldSpec: t.world, armSpec: a, label: a.label });
  const rows = {};
  const t0 = Date.now();
  await new Promise((res, rej) => {
    let next = 0, done = 0;
    const go = () => {
      if (next >= jobs.length) return;
      const job = jobs[next++];
      const wk = new Worker(new URL(import.meta.url), { workerData: job });
      wk.on('message', m => { ((rows[job.tname] ??= {})[m.seed] ??= {})[job.label] = m.pop; });
      wk.on('error', rej);
      wk.on('exit', () => { if (++done === jobs.length) res(); else go(); });
    };
    for (let i = 0; i < Math.min(jobs.length, Math.max(1, cpus().length - 1)); i++) go();
  });
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  console.log(`Done ${jobs.length} runs in ${((Date.now() - t0) / 1000).toFixed(1)}s (seeds 2001-2008)`);
  for (const t of tests) {
    console.log(`\n=== ${t.name} ===`);
    const R = rows[t.name];
    const f = seeds.map(s => R[s].FIXED);
    let bestC = null, bestPop = -1;
    for (const a of t.arms) {
      const p = seeds.map(s => R[s][a.label]);
      const mp = mean(p), g = mp - mean(f);
      if (a.label.startsWith('M_') && mp > bestPop) { bestPop = mp; bestC = a.label; }
      console.log(`  ${a.label.padEnd(10)} pop=${mp.toFixed(2)}  vsF=${g >= 0 ? '+' : ''}${g.toFixed(2)}`);
    }
    const m = seeds.map(s => R[s][bestC]);
    for (const o of t.arms.filter(a => a.label.startsWith('O_') && a.label !== 'O_L2')) {
      const p3 = seeds.map(s => R[s][o.label]);
      const ratio = (mean(p3) - mean(f)) / (mean(m) - mean(f));
      const d4 = seeds.map((_, i) => (p3[i] - f[i]) - 1.5 * (m[i] - f[i]));
      console.log(`  -> ${o.label} vs best const ${bestC}: ratio=${ratio.toFixed(2)}x, d4=${mean(d4) >= 0 ? '+' : ''}${mean(d4).toFixed(2)} (${d4.filter(x => x > 0).length}/8)`);
    }
  }
}
