// Exploratory 16-seed control check ONLY on authorized seeds 2001-2016 for META3_UPD
// (pure L3 update-rule rewrite: samplePair reads ONLY f.alpha, NEVER G!).
// Verifies SHAM3_UPD, EVOR3_UPD (E0, SV, J25), M3_UPD_RESET, ORACLE3_UPD, and META3OFF===FIXED lockstep.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { rng32, mix, walsh, B, ALL_PAIRS, BASE_CFG, samplePair } from '../../microverse/l3v.mjs';
import { signflip } from '../../docs/paper/stats.mjs';

const ALL_BITS = Array.from({ length: B }, (_, i) => i);
const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);

function makePartition(r) {
  const perm = shuffleInPlace([...ALL_BITS], r);
  return [
    perm.slice(0, 4).sort((a, b) => a - b),
    perm.slice(4, 8).sort((a, b) => a - b),
    perm.slice(8, 12).sort((a, b) => a - b),
  ];
}
function makeSubRule(r, subset, prevMask = 0) {
  const pairs = [];
  for (let i = 0; i < subset.length; i++) for (let j = i + 1; j < subset.length; j++) {
    const m = (1 << subset[i]) | (1 << subset[j]);
    if (m !== prevMask) pairs.push(m);
  }
  const m = pairs[Math.floor(r() * pairs.length)];
  return { subset, mask: m, sign: r() < .5 ? -1 : 1 };
}
function makeZeroG() { return Array.from({ length: B }, () => new Float64Array(B)); }
function cloneG(G) { return G.map(row => new Float64Array(row)); }

function runSim(seed, armSpec) {
  const cfg = { ...BASE_CFG, macroEvery: 1500, subEvery: 250, alphaMax: 60, ...armSpec.cfg };
  const rRule = rng32(mix(seed ^ 0x52554c45));
  const rPatch = rng32(mix(seed ^ 0x50415443));
  const rBeh = rng32(mix(seed));
  const N = cfg.size;
  const plant = Array(N * N).fill(null);
  const patchCenters = Array.from({ length: cfg.patches }, () => [Math.floor(rPatch() * N), Math.floor(rPatch() * N)]);

  const partition = makePartition(rRule);
  let partIdx = Math.floor(rRule() * 3);
  let subset = partition[partIdx];
  let rule = makeSubRule(rRule, subset, 0);
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

  let nextId = 1, flies = [];
  function spawn(parent, x, y, energy, gen) {
    const id = nextId++;
    const key = t => rng32(mix(seed ^ Math.imul(id, 2654435761) ^ t));
    const r = key(0), rProp = key(0x50524f50), rMut = key(0x4d555441), rSham = key(0x5348414d);
    const l2 = armSpec.l2;
    let alpha = (parent && l2 !== 'deck' && l2 !== 'meta3off') ? [...parent.alpha] : Array(B).fill(1);
    let G = makeZeroG();
    if (parent && armSpec.hasG && armSpec.inheritG !== false) G = cloneG(parent.G);
    if (l2 === 'evor3') {
      if (!parent && armSpec.standing) {
        const p = makePartition(rMut);
        for (const grp of p) for (const u of grp) for (const v of grp) if (u !== v) G[u][v] = 5.0;
      } else if (parent && (armSpec.pm ?? 0) > 0 && rMut() < armSpec.pm) {
        if (armSpec.mutKind === 'swap') {
          const u = Math.floor(rMut() * B), v = Math.floor(rMut() * B);
          if (u !== v) {
            for (let k = 0; k < B; k++) {
              if (k === u || k === v) continue;
              const tmp = G[u][k]; G[u][k] = G[v][k]; G[v][k] = tmp;
              G[k][u] = G[u][k]; G[k][v] = G[v][k];
            }
          }
        } else if (armSpec.mutKind === 'jump') {
          for (let t = 0; t < 2; t++) {
            const u = Math.floor(rMut() * B), v = Math.floor(rMut() * B);
            if (u !== v) G[u][v] = G[v][u] = (rMut() < 0.5 ? 5.0 : 0.0);
          }
        }
      }
    }
    flies.push({
      id, x, y, energy, age: 0, gen, r, rProp, rMut, rSham,
      masks: [0], w: [0], maskAge: [0],
      memory: [], seen: 0, n: 0, lossModel: undefined, lossBase: undefined, base: .55,
      buf: [], lastKind: -1, alpha, G, deck: [], deckPos: 0,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
    });
  }
  for (let i = 0; i < cfg.founders; i++) spawn(null, Math.floor(rBeh() * N), Math.floor(rBeh() * N), 50, 0);

  function getOracleG() {
    const og = makeZeroG();
    for (const grp of partition) for (const u of grp) for (const v of grp) if (u !== v) og[u][v] = 10.0;
    return og;
  }

  function drawCandidate(f, excl) {
    const l2 = armSpec.l2;
    if (l2 === 'deck' || l2 === 'meta3off') {
      for (let tries = 0; tries < 2 * ALL_PAIRS.length + 1; tries++) {
        if (f.deckPos >= f.deck.length) { f.deck = shuffleInPlace(ALL_PAIRS.map(p => p.mask), f.rProp); f.deckPos = 0; }
        const m = f.deck[f.deckPos++];
        if (!excl.has(m)) return m;
      }
      return -1;
    }
    // EXACT unmodified L3-V samplePair(f.alpha, ...): L1 NEVER reads G!
    return samplePair(f.alpha, excl, f.rProp, cfg.alphaFloor, null);
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

  function tasteLearn(f, bits, target, kind) {
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
      const m = drawCandidate(f, excl);
      if (m < 0) break;
      excl.add(m); f.buf.push({ mask: m, ev: 0, s2: 0, age: 0 });
    }
    for (const s of f.buf) { s.ev = s.ev * D + walsh(s.mask, bits) * residual; s.s2 = s.s2 * D2 + residual * residual; s.age++; }
    if (f.n % cfg.tasteEvery !== 0) return;

    const l2 = armSpec.l2;
    if (l2 !== 'deck' && l2 !== 'meta3off') {
      const valMasks = [];
      for (let i = 1; i < f.masks.length; i++) if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) valMasks.push(f.masks[i]);

      if (armSpec.learnsG) {
        for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.G[i][j] *= (1 - 0.0002);
        for (const m of valMasks) {
          const [ba, bb] = pairBits(m);
          f.G[ba][bb] = Math.min(10.0, f.G[ba][bb] + 1.0);
          f.G[bb][ba] = f.G[ba][bb];
        }
      }
      const effG = l2 === 'oracle3' ? getOracleG() : f.G;

      let effDecay = cfg.alphaDecay;
      if (armSpec.useG) {
        let gSum = 0;
        for (let i = 0; i < B; i++) for (let j = i + 1; j < B; j++) gSum += Math.min(1, effG[i][j] / 2.0);
        const gConf = Math.min(1, gSum / 12.0);
        effDecay = cfg.alphaDecay + gConf * ((armSpec.hiDecay ?? 0.18) - cfg.alphaDecay);
      }

      for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - effDecay) * (f.alpha[b] - 1));

      for (const m of valMasks) {
        const [ba, bb] = pairBits(m);
        f.alpha[ba] = Math.min(cfg.alphaMax, f.alpha[ba] + cfg.alphaBoost);
        f.alpha[bb] = Math.min(cfg.alphaMax, f.alpha[bb] + cfg.alphaBoost);
        if (armSpec.useG) {
          const others = ALL_BITS.filter(k => k !== ba && k !== bb);
          const scores = others.map(k => Math.min(1, (effG[ba][k] + effG[bb][k]) / 2.0));
          if (l2 === 'sham3') shuffleInPlace(scores, f.rSham);
          const maxSc = Math.max(...scores);
          for (let idx = 0; idx < others.length; idx++) {
            const k = others[idx], sc = scores[idx];
            if (sc > 0.25) f.alpha[k] = Math.min(cfg.alphaMax, f.alpha[k] + cfg.alphaBoost * sc);
            else if (maxSc > 0.5) f.alpha[k] = Math.max(.05, 1 + (1 - 0.65) * (f.alpha[k] - 1));
          }
        }
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

  let popSum = 0, nLate = 0, skillSum = 0;
  function skill() {
    if (!flies.length) return 0;
    let sum = 0;
    for (const f of flies) {
      let g = 0, gn = 0, b = 0, bn = 0;
      for (let k = 0; k < codes.length; k++) { const acc = tastePredict(f, codes[k]) > .5 ? 1 : 0; if (kindValence[k] > 0) { g += acc; gn++; } else { b += acc; bn++; } }
      sum += g / gn - b / bn;
    }
    return sum / flies.length;
  }

  for (let tick = 0; tick < cfg.ticks; tick++) {
    if (tick > 0 && tick % cfg.macroEvery === 0) {
      const choices = [0, 1, 2].filter(i => i !== partIdx);
      partIdx = choices[Math.floor(rRule() * choices.length)];
      subset = partition[partIdx];
      rule = makeSubRule(rRule, subset, 0);
      redrawCodes();
    } else if (tick > 0 && tick % cfg.subEvery === 0) {
      rule = makeSubRule(rRule, subset, rule.mask);
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
            tasteLearn(f, bits, lab, pl.kind);
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
    if (nextTick > cfg.lateFrom && nextTick % cfg.every === 0) { popSum += flies.length; nLate++; skillSum += skill(); }
  }
  return { seed, popSum, pop: popSum / nLate, skill: skillSum / nLate };
}

if (!isMainThread) {
  const { seed, armSpec } = workerData;
  parentPort.postMessage(runSim(seed, armSpec));
} else {
  const seeds = Array.from({ length: 16 }, (_, i) => 2001 + i);
  const baseL2 = { alphaDecay: .060, alphaBoost: 20, alphaMax: 60 };
  const arms = [
    { label: 'FIXED',        l2: 'deck',     hasG: false, learnsG: false, useG: false, cfg: {} },
    { label: 'META3OFF',     l2: 'meta3off', hasG: false, learnsG: false, useG: false, cfg: {} },
    { label: 'M_D060',       l2: 'meta',     hasG: false, learnsG: false, useG: false, cfg: baseL2 },
    { label: 'META3_UPD',    l2: 'meta3',    hasG: true,  learnsG: true,  useG: true,  hiDecay: .18, cfg: baseL2 },
    { label: 'M3_UPD_RESET', l2: 'meta3',    hasG: true,  learnsG: true,  useG: true,  inheritG: false, hiDecay: .18, cfg: baseL2 },
    { label: 'SHAM3_UPD',    l2: 'sham3',    hasG: true,  learnsG: true,  useG: true,  hiDecay: .18, cfg: baseL2 },
    { label: 'EVOR3_E0',     l2: 'evor3',    hasG: true,  learnsG: false, useG: true,  pm: 0, hiDecay: .18, cfg: baseL2 },
    { label: 'EVOR3_SV',     l2: 'evor3',    hasG: true,  learnsG: false, useG: true,  standing: true, mutKind: 'swap', pm: 0.25, hiDecay: .18, cfg: baseL2 },
    { label: 'EVOR3_J25',    l2: 'evor3',    hasG: true,  learnsG: false, useG: true,  mutKind: 'jump', pm: 0.25, hiDecay: .18, cfg: baseL2 },
    { label: 'ORACLE3_UPD',  l2: 'oracle3',  hasG: false, learnsG: false, useG: true,  hiDecay: .18, cfg: baseL2 },
  ];
  const jobs = seeds.flatMap(seed => arms.map(a => ({ seed, armSpec: a, label: a.label })));
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
  const P = a => seeds.map(s => rows[s][a].popSum);
  const sub = (x, y) => x.map((v, i) => v - y[i]);
  const n = seeds.length;
  const pF = P('FIXED'), pO = P('META3OFF'), pM = P('M_D060'), p3 = P('META3_UPD');
  const offDiff = seeds.filter((_, i) => pF[i] !== pO[i]).length;
  console.log(`\n=== 16-Seed META3_UPD Controls (seeds 2001-2016, ${((Date.now() - t0) / 1000).toFixed(1)}s, META3OFF!=FIXED: ${offDiff}/16) ===`);
  for (const a of arms) {
    const pA = P(a.label), sk = seeds.map(s => rows[s][a.label].skill);
    console.log(`  ${a.label.padEnd(13)} pop=${(mean(pA)/100).toFixed(2)}  vsF=${((mean(pA)-mean(pF))/100 >= 0 ? '+' : '')}${((mean(pA)-mean(pF))/100).toFixed(2)}  sk=${mean(sk).toFixed(3)}`);
  }
  const rep = (name, ints, unit = 100) => {
    const m = mean(ints) / unit, w = ints.filter(x => x > 0).length, p = signflip(ints, 1);
    console.log(`  ${name.padEnd(28)} ${m >= 0 ? '+' : ''}${m.toFixed(2)}  (${w}/${n}, p=${p.toExponential(2)})`);
  };
  console.log('\nExact paired contrasts for META3_UPD (16 seeds):');
  const d4 = seeds.map((_, i) => 2 * p3[i] - 3 * pM[i] + pF[i]);
  rep('d4 (ratio ' + ((mean(p3)-mean(pF))/(mean(pM)-mean(pF))).toFixed(2) + 'x)', d4, 200);
  rep('META3_UPD - M_D060', sub(p3, pM));
  rep('META3_UPD - SHAM3_UPD', sub(p3, P('SHAM3_UPD')));
  rep('META3_UPD - EVOR3_E0', sub(p3, P('EVOR3_E0')));
  rep('META3_UPD - EVOR3_SV', sub(p3, P('EVOR3_SV')));
  rep('META3_UPD - EVOR3_J25', sub(p3, P('EVOR3_J25')));
  rep('META3_UPD - M3_UPD_RESET', sub(p3, P('M3_UPD_RESET')));
  const d4o = seeds.map((_, i) => 2 * P('ORACLE3_UPD')[i] - 3 * pM[i] + pF[i]);
  rep('d4_O (ORACLE3_UPD)', d4o, 200);
}
