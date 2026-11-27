// 2-second diagnostic trace on seed 2001 (authorized exploration seed)
// Compares O_PLAST vs M_BEST vs M3_DR24 tick-by-tick around macro-shifts to see
// where the 4-fly gap between M3_DR24 (62.56) and O_PLAST (66.51) comes from!
import { rng32, mix, walsh, B, ALL_PAIRS, BASE_CFG, samplePair } from '../../microverse/l3v.mjs';

const ALL_BITS = Array.from({ length: B }, (_, i) => i);
const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);
function makeSubset(r, k, prev) {
  const pool = prev ? ALL_BITS.filter(b => !prev.includes(b)) : [...ALL_BITS];
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

function traceArm(seed, mode) {
  const cfg = { ...BASE_CFG, alphaMax: 100, macroEvery: 1800, subEvery: 300 };
  const rRule = rng32(mix(seed ^ 0x52554c45));
  const rPatch = rng32(mix(seed ^ 0x50415443));
  const rBeh = rng32(mix(seed));
  const N = cfg.size, plant = Array(N * N).fill(null);
  const patchCenters = Array.from({ length: cfg.patches }, () => [Math.floor(rPatch() * N), Math.floor(rPatch() * N)]);
  let subset = makeSubset(rRule, cfg.subsetSize, null);
  let rule = makeSubRule(rRule, subset, 0);
  let codes = [], kindValence = [];
  const redrawCodes = () => {
    const half = cfg.kinds / 2, seen = new Set(), good = [], bad = [];
    while (good.length < half || bad.length < half) {
      const c = Math.floor(rRule() * (1 << B));
      if (seen.has(c)) continue; seen.add(c);
      const bits = ALL_BITS.map(b => ((c >>> b) & 1) ? 1 : -1);
      const v = rule.sign * walsh(rule.mask, bits);
      if (v > 0 && good.length < half) good.push(bits);
      else if (v < 0 && bad.length < half) bad.push(bits);
    }
    codes = shuffleInPlace([...good, ...bad], rRule);
    kindValence = codes.map(bits => rule.sign * walsh(rule.mask, bits));
  };
  const seedPatch = i => {
    const [cx, cy] = patchCenters[i], R = cfg.patchRadius;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
      if (dx * dx + dy * dy > R * R || rPatch() > cfg.plantDensity) continue;
      const x = (cx + dx + N) % N, y = (cy + dy + N) % N, k = y * N + x;
      if (!plant[k]) plant[k] = { kind: Math.floor(rPatch() * codes.length), amount: cfg.plantCap * rPatch(), patch: i };
    }
  };
  const cell = (x, y) => ((y + N) % N) * N + ((x + N) % N);
  redrawCodes(); for (let i = 0; i < cfg.patches; i++) seedPatch(i);

  let nextId = 1, flies = [], lastMacroTick = 0;
  const spawn = (parent, x, y, energy, gen) => {
    const id = nextId++;
    const key = t => rng32(mix(seed ^ Math.imul(id, 2654435761) ^ t));
    let alpha = parent ? [...parent.alpha] : Array(B).fill(1);
    const trust = (parent && mode === 'm3') ? parent.trust : 1.0;
    flies.push({
      id, x, y, energy, age: 0, gen, r: key(0), rProp: key(0x50524f50),
      masks: [0], w: [0], maskAge: [0], memory: [], seen: 0, n: 0,
      lossModel: undefined, lossBase: undefined, base: .55, buf: [], lastKind: -1, alpha,
      trust, drought: 0, l2Decay: mode === 'const' ? .06 : .001, l2Boost: 20, l2Floor: .02,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
    });
  };
  for (let i = 0; i < cfg.founders; i++) spawn(null, Math.floor(rBeh() * N), Math.floor(rBeh() * N), 50, 0);

  const modelProb = (f, bits) => { const n = f.masks.length; let z = Math.log(2); for (let i = 0; i < n; i++) z += f.w[i] * walsh(f.masks[i], bits) / Math.sqrt(n); return sigmoid(z); };
  const tastePredict = (f, bits) => { const gate = f.lossModel !== undefined && f.lossModel >= f.lossBase; return .05 + .9 * (gate ? f.base : modelProb(f, bits)); };
  const tasteUpdate = (f, phi, target) => { const n = phi.length; let z = Math.log(2); for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n); const step = 4.0 * (target - sigmoid(z)) / Math.sqrt(n); for (let i = 0; i < n; i++) f.w[i] = clip(f.w[i] + step * phi[i], 8); };
  const removeMask = (f, i) => { f.masks.splice(i, 1); f.w.splice(i, 1); f.maskAge.splice(i, 1); for (const rc of f.memory) rc.phi.splice(i, 1); };

  const hist = [];
  for (let tick = 0; tick < cfg.ticks; tick++) {
    if (tick > 0 && tick % cfg.macroEvery === 0) {
      lastMacroTick = tick; subset = makeSubset(rRule, cfg.subsetSize, subset); rule = makeSubRule(rRule, subset, 0); redrawCodes();
    } else if (tick > 0 && tick % cfg.subEvery === 0) { rule = makeSubRule(rRule, subset, rule.mask); redrawCodes(); }
    else if (tick > 0 && tick % cfg.shiftEvery === 0) redrawCodes();
    if (tick > 0 && tick % cfg.relocateEvery === 0) {
      const i = Math.floor(rPatch() * cfg.patches);
      for (let k = 0; k < plant.length; k++) if (plant[k]?.patch === i) plant[k] = null;
      patchCenters[i] = [Math.floor(rPatch() * N), Math.floor(rPatch() * N)]; seedPatch(i);
    }
    for (const p of plant) if (p) p.amount = Math.min(cfg.plantCap, p.amount + cfg.regrow);
    const occ = new Map(); for (const f of flies) { const k = cell(f.x, f.y); occ.set(k, (occ.get(k) ?? 0) + 1); }
    const order = shuffleInPlace(flies.map((_, i) => i), rBeh), born = [];
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
      const qmax = Math.max(...qs), ties = []; for (let d = 0; d < 5; d++) if (qs[d] >= qmax - 1e-9) ties.push(d);
      let dir = ties[Math.floor(f.r() * ties.length)]; if (f.r() < .08) dir = Math.floor(f.r() * 5);
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
          const good = kindValence[pl.kind] > 0; f.energy += good ? take : -take * cfg.toxin;
          const lab = (good ? 1 : 0) ^ (f.r() < cfg.labelNoise ? 1 : 0);
          // tasteLearn
          const phi = f.masks.map(m => walsh(m, bits)), n = phi.length; let z = Math.log(2);
          for (let i = 0; i < n; i++) z += f.w[i] * phi[i] / Math.sqrt(n);
          const pm0 = sigmoid(z), residual = lab - pm0;
          const pm = Math.min(1 - 1e-3, Math.max(1e-3, pm0)), pb = Math.min(1 - 1e-3, Math.max(1e-3, f.base));
          const ll = p => -(lab ? Math.log(p) : Math.log(1 - p));
          if (f.lossModel === undefined) { f.lossModel = ll(pm); f.lossBase = ll(pb); }
          else { f.lossModel += .05 * (ll(pm) - f.lossModel); f.lossBase += .05 * (ll(pb) - f.lossBase); }
          f.base += .05 * (lab - f.base);
          const rec = { bits, phi, target: lab }; f.seen++;
          if (f.memory.length < 32) f.memory.push(rec); else f.memory[(f.seen - 1) % 32] = rec;
          tasteUpdate(f, phi, lab); const rep = f.memory[Math.floor(f.r() * f.memory.length)]; tasteUpdate(f, rep.phi, rep.target);
          for (let i = 0; i < f.maskAge.length; i++) f.maskAge[i]++;
          if (pl.kind !== f.lastKind) {
            f.lastKind = pl.kind; const D = 1 - 1 / cfg.tasteMemory, D2 = D * D; f.n++;
            const excl = new Set(f.masks); for (const s of f.buf) excl.add(s.mask);
            const fl = mode === 'oracle' ? ((tick - lastMacroTick < 150) ? 100 : .02) : f.l2Floor;
            while (f.buf.length < cfg.K) { const m = samplePair(f.alpha, excl, f.rProp, fl, null); if (m < 0) break; excl.add(m); f.buf.push({ mask: m, ev: 0, s2: 0, age: 0 }); }
            for (const s of f.buf) { s.ev = s.ev * D + walsh(s.mask, bits) * residual; s.s2 = s.s2 * D2 + residual * residual; s.age++; }
            if (f.n % cfg.tasteEvery === 0) {
              let dec = f.l2Decay, bst = f.l2Boost;
              if (mode === 'oracle') { dec = (tick - lastMacroTick < 150) ? .50 : .001; bst = (tick - lastMacroTick < 150) ? 25 : 20; }
              for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - dec) * (f.alpha[b] - 1));
              let val = false;
              for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) {
                val = true; for (const bit of pairBits(f.masks[i])) f.alpha[bit] = Math.min(cfg.alphaMax, f.alpha[bit] + bst);
              }
              if (mode === 'm3') {
                const maxA = Math.max(...f.alpha);
                if (val || maxA < 2) { f.drought = 0; f.trust = 1; }
                else if (f.masks.length === 1 && maxA > 10) { f.drought++; if (f.drought >= 24) f.trust = 0; }
                const d = 1 - f.trust; f.l2Decay = .001 + d * d * .50; f.l2Floor = .02 + d * d * 100;
              }
              for (let i = f.masks.length - 1; i >= 1; i--) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) < cfg.tastePrune) removeMask(f, i);
              let bestIdx = -1, bestScore = 0;
              for (let i = 0; i < f.buf.length; i++) { const s = f.buf[i]; if (s.age < 10 || s.s2 <= 1e-9) continue; const sc = Math.abs(s.ev) / Math.sqrt(s.s2); if (sc > bestScore) { bestScore = sc; bestIdx = i; } }
              if (bestIdx >= 0 && bestScore > cfg.tasteZ) {
                const chosen = f.buf[bestIdx].mask;
                if (f.masks.length >= cfg.tasteCap) {
                  let j = -1; for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && (j < 0 || Math.abs(f.w[i]) < Math.abs(f.w[j]))) j = i;
                  if (j >= 0 && Math.abs(f.w[j]) < cfg.tastePrune + 1.5) removeMask(f, j);
                }
                if (f.masks.length < cfg.tasteCap) { f.masks.push(chosen); f.w.push(0); f.maskAge.push(0); for (const rc of f.memory) rc.phi.push(walsh(chosen, rc.bits)); f.buf.splice(bestIdx, 1); }
              }
              for (let i = f.buf.length - 1; i >= 0; i--) if (f.buf[i].age >= cfg.evictAge) f.buf.splice(i, 1);
            }
          }
        }
      }
      f.energy = Math.min(cfg.maxEnergy, f.energy); f.age++; f.movePending.reward = (f.energy - e0) / 4;
      if (f.energy >= 60 && flies.length + born.length < cfg.capacity) { f.energy -= cfg.birthCost; born.push([f, (f.x + Math.floor(f.r() * 3) - 1 + N) % N, (f.y + Math.floor(f.r() * 3) - 1 + N) % N]); }
    }
    flies = flies.filter(f => f.energy > 0 && f.age < cfg.maxAge);
    for (const [p, x, y] of born) spawn(p, x, y, cfg.childEnergy, p.gen + 1);
    if ((tick + 1) >= 10800 && (tick + 1) <= 14400 && (tick + 1) % 300 === 0) {
      let sh = 0, tr = 0, ma = 0;
      for (const f of flies) { const tot = f.alpha.reduce((a, x) => a + .02 + x, 0); sh += subset.reduce((a, b) => a + .02 + f.alpha[b], 0) / tot; tr += f.trust; ma += Math.max(...f.alpha); }
      hist.push({ t: tick + 1, pop: flies.length, share: (sh / flies.length).toFixed(2), trust: (tr / flies.length).toFixed(2), maxA: (ma / flies.length).toFixed(0) });
    }
  }
  return hist;
}

const o = traceArm(2001, 'oracle');
const m = traceArm(2001, 'm3');
const c = traceArm(2001, 'const');
console.log('tick   | ORACLE (pop/sh) | M3_DR24 (pop/sh/tr/maxA) | CONST (pop/sh)');
for (let i = 0; i < o.length; i++) {
  console.log(`${String(o[i].t).padStart(5)}  | ${String(o[i].pop).padStart(3)} / ${o[i].share}      | ${String(m[i].pop).padStart(3)} / ${m[i].share} / ${m[i].trust} / ${String(m[i].maxA).padStart(3)}    | ${String(c[i].pop).padStart(3)} / ${c[i].share}`);
}
