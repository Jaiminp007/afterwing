// Exploratory test ONLY on authorized seeds 2001-2008.
// Fixes the premature floorBar & drought-reset bugs from test_twostage.mjs.
// Tests clean L3 plasticity controllers (drought/strikeout/CUSUM + out-of-prior surprise)
// vs best constant L2 and O_PLAST on DISJ1800_SUB300 and DISJ2400_SUB200.
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

function runSim(seed, worldSpec, armSpec) {
  const cfg = { ...BASE_CFG, alphaMax: 100, ...worldSpec.cfg, ...armSpec.cfg };
  const rRule = rng32(mix(seed ^ 0x52554c45));
  const rPatch = rng32(mix(seed ^ 0x50415443));
  const rBeh = rng32(mix(seed));
  const N = cfg.size;
  const plant = Array(N * N).fill(null);
  const patchCenters = Array.from({ length: cfg.patches }, () => [Math.floor(rPatch() * N), Math.floor(rPatch() * N)]);

  const makeSubset = prev => {
    const pool = prev ? ALL_BITS.filter(b => !prev.includes(b)) : [...ALL_BITS];
    return shuffleInPlace(pool, rRule).slice(0, cfg.subsetSize).sort((a, b) => a - b);
  };
  const makeSubRule = (sub, prevMask = 0) => {
    const pairs = [];
    for (let i = 0; i < sub.length; i++) for (let j = i + 1; j < sub.length; j++) {
      const m = (1 << sub[i]) | (1 << sub[j]);
      if (m !== prevMask) pairs.push(m);
    }
    const m = pairs[Math.floor(rRule() * pairs.length)];
    return { subset: sub, mask: m, sign: rRule() < .5 ? -1 : 1 };
  };

  let subset = makeSubset(null);
  let rule = makeSubRule(subset, 0);
  let codes = [], kindValence = [];
  function redrawCodes() {
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
  redrawCodes();
  for (let i = 0; i < cfg.patches; i++) seedPatch(i);

  let nextId = 1, flies = [], lastMacroTick = 0, flushEvents = 0, trueFlushes = 0;
  function spawn(parent, x, y, energy, gen) {
    const id = nextId++;
    const key = t => rng32(mix(seed ^ Math.imul(id, 2654435761) ^ t));
    const r = key(0), rProp = key(0x50524f50);
    let alpha = Array(B).fill(1);
    if (parent && armSpec.l2 !== 'deck') alpha = [...parent.alpha];
    const flushing = (parent && armSpec.l2 === 'meta3') ? parent.flushing : 0;
    const f = {
      id, x, y, energy, age: 0, gen, r, rProp,
      masks: [0], w: [0], maskAge: [0],
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, deck: [], deckPos: 0,
      drought: 0, strike: 0, flushing,
      l2Decay: cfg.alphaDecay, l2Boost: cfg.alphaBoost, l2Floor: cfg.alphaFloor,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
    };
    flies.push(f);
  }
  for (let i = 0; i < cfg.founders; i++) spawn(null, Math.floor(rBeh() * N), Math.floor(rBeh() * N), 50, 0);

  function setFlush(f, tick) {
    if (f.flushing === 0) {
      flushEvents++;
      if (tick - lastMacroTick < 400) trueFlushes++;
    }
    f.flushing = armSpec.flushSteps ?? 8;
    f.drought = 0;
    f.strike = 0;
  }

  function applyL3(f) {
    if (f.flushing > 0) {
      f.l2Decay = 0.55;
      f.l2Floor = 100;
      f.l2Boost = 25;
    } else {
      f.l2Decay = armSpec.baseDecay ?? 0.002;
      f.l2Floor = 0.02;
      f.l2Boost = 20;
    }
  }

  function drawCandidate(f, excl, tick) {
    if (armSpec.l2 === 'deck') {
      for (let tries = 0; tries < 2 * ALL_PAIRS.length + 1; tries++) {
        if (f.deckPos >= f.deck.length) { f.deck = shuffleInPlace(ALL_PAIRS.map(p => p.mask), f.rProp); f.deckPos = 0; }
        const m = f.deck[f.deckPos++];
        if (!excl.has(m)) return m;
      }
      return -1;
    }
    let fl = f.l2Floor;
    if (armSpec.l2 === 'oracle_plast') fl = (tick - lastMacroTick < 150) ? 100 : 0.02;
    return samplePair(f.alpha, excl, f.rProp, fl, null);
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
      excl.add(m); f.buf.push({ mask: m, ev: 0, s2: 0, age: 0, unmasked: 0 });
    }
    const isUnmasked = f.masks.length === 1;
    for (const s of f.buf) {
      s.ev = s.ev * D + walsh(s.mask, bits) * residual;
      s.s2 = s.s2 * D2 + residual * residual;
      s.age++;
      if (isUnmasked) s.unmasked++;
    }
    if (f.n % cfg.tasteEvery !== 0) return;

    const l2 = armSpec.l2;
    if (l2 === 'meta' || l2 === 'meta3' || l2 === 'oracle_plast') {
      const valMasks = [];
      for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) valMasks.push(f.masks[i]);

      if (l2 === 'meta3') {
        const nHigh = f.alpha.filter(x => x > 8).length;
        const maxA = Math.max(...f.alpha);
        if (f.flushing > 0) {
          f.flushing--;
          if (maxA < 2.0) f.flushing = 0;
        }
        if (valMasks.length > 0) {
          f.drought = 0; f.strike = 0;
          if (nHigh >= 4) {
            for (const m of valMasks) {
              const [ba, bb] = pairBits(m);
              if (f.alpha[ba] < 4 && f.alpha[bb] < 4) setFlush(f, tick);
            }
          }
        } else if (f.flushing === 0 && f.masks.length === 1 && nHigh >= (armSpec.minHigh ?? 3)) {
          if (armSpec.trigger === 'drought') {
            f.drought++;
            if (f.drought >= armSpec.bar) setFlush(f, tick);
          }
        }
        applyL3(f);
      }

      let dec = f.l2Decay, bst = f.l2Boost;
      if (l2 === 'oracle_plast') {
        if (tick - lastMacroTick < 150) { dec = 0.50; bst = 25; }
        else { dec = 0.001; bst = 20; }
      }
      for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - dec) * (f.alpha[b] - 1));
      for (const m of valMasks) {
        for (const bit of pairBits(m)) f.alpha[bit] = Math.min(cfg.alphaMax, f.alpha[bit] + bst);
      }
    }

    for (let i = f.masks.length - 1; i >= 1; i--) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) < cfg.tastePrune) removeMask(f, i);
    let bestIdx = -1, bestScore = 0;
    for (let i = 0; i < f.buf.length; i++) {
      const s = f.buf[i]; if (s.age < 10 || s.s2 <= 1e-9) continue;
      const sc = Math.abs(s.ev) / Math.sqrt(s.s2); if (sc > bestScore) { bestScore = sc; bestIdx = i; }
    }
    let admitted = false;
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
        admitted = true;
      }
    }
    let evFail = 0;
    for (let i = f.buf.length - 1; i >= 0; i--) {
      const s = f.buf[i];
      if (s.age >= cfg.evictAge) {
        if (f.masks.length === 1 && s.unmasked >= 12) {
          const [ba, bb] = pairBits(s.mask);
          if (f.alpha[ba] > 8 && f.alpha[bb] > 8) evFail++;
        }
        f.buf.splice(i, 1);
      }
    }
    if (l2 === 'meta3') {
      if (admitted) { f.drought = 0; f.strike = 0; }
      else if (armSpec.trigger === 'strike' && f.flushing === 0 && evFail > 0) {
        const nHigh = f.alpha.filter(x => x > 8).length;
        if (nHigh >= (armSpec.minHigh ?? 3)) {
          f.strike += evFail;
          if (f.strike >= armSpec.bar) setFlush(f, tick);
        }
      }
      applyL3(f);
    }
  }

  let popSum = 0, nLate = 0, shareSum = 0;
  for (let tick = 0; tick < cfg.ticks; tick++) {
    if (tick > 0 && tick % cfg.macroEvery === 0) {
      lastMacroTick = tick;
      subset = makeSubset(subset);
      rule = makeSubRule(subset, 0);
      redrawCodes();
    } else if (tick > 0 && tick % cfg.subEvery === 0) {
      rule = makeSubRule(subset, rule.mask);
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
    if (nextTick > cfg.lateFrom && nextTick % cfg.every === 0) {
      popSum += flies.length; nLate++;
      if (flies.length) {
        let s = 0;
        for (const f of flies) { const fl = f.l2Floor; const tot = f.alpha.reduce((a, x) => a + fl + x, 0); s += subset.reduce((a, b) => a + fl + f.alpha[b], 0) / tot; }
        shareSum += s / flies.length;
      }
    }
  }
  return { seed, pop: popSum / nLate, shareS: shareSum / nLate, flushEvents, trueFlushes };
}

if (!isMainThread) {
  const { seed, worldSpec, armSpec } = workerData;
  parentPort.postMessage(runSim(seed, worldSpec, armSpec));
} else {
  const seeds = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008];
  const worlds = [
    { name: 'DISJ1800_SUB300', cfg: { macroEvery: 1800, subEvery: 300 } },
    { name: 'DISJ2400_SUB200', cfg: { macroEvery: 2400, subEvery: 200 } },
  ];
  const arms = [
    { label: 'FIXED', l2: 'deck', cfg: {} },
    { label: 'M_D060', l2: 'meta', cfg: { alphaDecay: .060, alphaBoost: 20 } },
    { label: 'M3_DR8_H4', l2: 'meta3', trigger: 'drought', bar: 8, minHigh: 4, cfg: {} },
    { label: 'M3_DR12_H4', l2: 'meta3', trigger: 'drought', bar: 12, minHigh: 4, cfg: {} },
    { label: 'M3_DR16_H3', l2: 'meta3', trigger: 'drought', bar: 16, minHigh: 3, cfg: {} },
    { label: 'M3_ST4_H4', l2: 'meta3', trigger: 'strike', bar: 4, minHigh: 4, cfg: {} },
    { label: 'M3_ST6_H4', l2: 'meta3', trigger: 'strike', bar: 6, minHigh: 4, cfg: {} },
    { label: 'M3_ST6_H3', l2: 'meta3', trigger: 'strike', bar: 6, minHigh: 3, cfg: {} },
  ];
  const jobs = [];
  for (const w of worlds) for (const seed of seeds) for (const a of arms) jobs.push({ wname: w.name, seed, worldSpec: w, armSpec: a, label: a.label });
  const rows = {};
  const t0 = Date.now();
  await new Promise((res, rej) => {
    let next = 0, done = 0;
    const go = () => {
      if (next >= jobs.length) return;
      const job = jobs[next++];
      const wk = new Worker(new URL(import.meta.url), { workerData: job });
      wk.on('message', m => { ((rows[job.wname] ??= {})[m.seed] ??= {})[job.label] = m; });
      wk.on('error', rej);
      wk.on('exit', () => { if (++done === jobs.length) res(); else go(); });
    };
    for (let i = 0; i < Math.min(jobs.length, Math.max(1, cpus().length - 1)); i++) go();
  });
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  console.log(`Done ${jobs.length} runs in ${((Date.now() - t0) / 1000).toFixed(1)}s (seeds 2001-2008)`);
  for (const w of worlds) {
    console.log(`\n=== ${w.name} ===`);
    const R = rows[w.name];
    const f = seeds.map(s => R[s].FIXED.pop);
    const m = seeds.map(s => R[s].M_D060.pop);
    for (const a of arms) {
      const p = seeds.map(s => R[s][a.label].pop);
      const sh = seeds.map(s => R[s][a.label].shareS);
      const fl = seeds.map(s => R[s][a.label].flushEvents);
      const tf = seeds.map(s => R[s][a.label].trueFlushes);
      const mp = mean(p), g = mp - mean(f);
      let extra = '';
      if (a.label.startsWith('M3_')) {
        const ratio = (mp - mean(f)) / (mean(m) - mean(f));
        const d4 = seeds.map((_, i) => (p[i] - f[i]) - 1.5 * (m[i] - f[i]));
        extra = `  ratio=${ratio.toFixed(2)}x d4=${mean(d4) >= 0 ? '+' : ''}${mean(d4).toFixed(2)} (${d4.filter(x => x > 0).length}/8) fl=${mean(fl).toFixed(0)} (true=${mean(tf).toFixed(0)})`;
      }
      console.log(`  ${a.label.padEnd(11)} pop=${mp.toFixed(2)}  vsF=${g >= 0 ? '+' : ''}${g.toFixed(2)}  shareS=${mean(sh).toFixed(3)}${extra}`);
    }
  }
}
