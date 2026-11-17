// Microverse: a small, closed, resource-limited world in which flies live, learn, breed and die
// continuously. Brains are heritable programs (feature masks + learning genes); learned weights
// are not inherited. The taste learner mirrors learning/odor-routed-taste.mjs (Walsh masks over an
// 8-bit odor code, logistic readout, reservoir replay, evidence-driven self-revision). Movement is a
// linear Q-learner over per-move features that can self-revise the same way (product features).
export const ODOR_BITS = 8, FULL = 1 << ODOR_BITS, KINDS = 16;
export const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
export const MOVE_BASE = 6; // base movement features, see moveFeatures()

export function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const popcount = m => { let n = 0; while (m) { n += m & 1; m >>>= 1; } return n; };
const walsh = (mask, bits) => { let v = 1; for (let b = 0; b < bits.length; b++) if (mask >> b & 1) v *= bits[b]; return v; };
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clip = (x, a) => Math.max(-a, Math.min(a, x));

// ---------- chemistry: hidden valence rules over the 8-bit odor code ----------
function shuffledBits(r) { const b = [...Array(ODOR_BITS).keys()]; for (let j = b.length - 1; j > 0; j--) { const k = Math.floor(r() * (j + 1)); [b[j], b[k]] = [b[k], b[j]]; } return b; }
export function makeRule(family, seed) {
  const r = rng32(mix(seed)), b = shuffledBits(r), sign = r() < .5 ? -1 : 1;
  let terms, bias = 0;
  if (family === 'pairs') terms = [0, 2, 4].map(i => [1 << b[i] | 1 << b[i + 1], 1]);
  else if (family === 'staircase') { const t = [1 << b[0]]; for (let j = 1; j < 4; j++) t.push(t[j - 1] | 1 << b[j]); terms = [[t[0], 1], [t[1], 2], [t[2], 2], [t[3], 1]]; bias = .5; }
  else if (family === 'single') terms = [[1 << b[0], 1]];
  else if (family === 'triples') terms = [[1 << b[0] | 1 << b[1] | 1 << b[2], 1], [1 << b[3] | 1 << b[4] | 1 << b[5], 1], [1 << b[6], .5]];
  else throw Error('family ' + family);
  return { family, seed, terms, bias, sign, target: terms.map(t => t[0]) };
}
export const valence = (rule, bits) => rule.sign * Math.sign(rule.bias + rule.terms.reduce((s, [m, c]) => s + c * walsh(m, bits), 0) || 1e-9);

// ---------- brains ----------
export const DEFAULT_GENES = { tasteStep: 4, tasteZ: 3, tasteEvery: 8, tasteCap: 16, moveStep: .05, moveZ: 3, moveEvery: 32, moveCap: 12, eps: .08, tasteEps: .05, acceptAt: .4, birthEnergy: 60 };
export function S0Masks() { return [0, ...[...Array(ODOR_BITS).keys()].map(b => 1 << b)]; }
// program = {tasteMasks, moveMasks, genes, tasteRevise: 'evid'|'random'|null, moveRevise, mutate: bool}
export function newBrain(program, r, inherited = null) {
  const tm = [...program.tasteMasks], mm = [...program.moveMasks];
  return {
    program, genes: { ...program.genes },
    taste: { masks: tm, w: Array(tm.length).fill(0), memory: [], seen: 0,
      ev: inherited?.tasteEv ? [...inherited.tasteEv] : Array(FULL).fill(0), n: inherited?.tasteN ?? 0, s2: inherited?.tasteS2 ?? 0, added: [] },
    move: { masks: mm, w: mm.map(m => program.moveInit?.[m] ?? 0), ev: inherited?.moveEv ? [...inherited.moveEv] : Array(1 << MOVE_BASE).fill(0), n: inherited?.moveN ?? 0, s2: inherited?.moveS2 ?? 0, pending: null, added: [] },
    rand: r
  };
}
function tastePredict(brain, bits) {
  const t = brain.taste, n = t.masks.length; let z = Math.log(3);
  for (let i = 0; i < n; i++) z += t.w[i] * walsh(t.masks[i], bits) / Math.sqrt(n);
  return .05 + .9 * sigmoid(z);
}
function tasteUpdate(brain, phi, target) {
  const t = brain.taste, n = phi.length; let z = Math.log(3);
  for (let i = 0; i < n; i++) z += t.w[i] * phi[i] / Math.sqrt(n);
  const step = brain.genes.tasteStep * (target - sigmoid(z)) / Math.sqrt(n);
  for (let i = 0; i < n; i++) t.w[i] = clip(t.w[i] + step * phi[i], 8);
}
export function tasteLearn(brain, bits, target) {
  const t = brain.taste, phi = t.masks.map(m => walsh(m, bits));
  const residual = target - sigmoid(Math.log(3) + t.w.reduce((s, w, i) => s + w * phi[i], 0) / Math.sqrt(phi.length));
  const rec = { bits, phi, target }; t.seen++;
  if (t.memory.length < 32) t.memory.push(rec); else { const j = Math.floor(brain.rand() * t.seen); if (j < 32) t.memory[j] = rec; }
  tasteUpdate(brain, phi, target);
  const m = t.memory[Math.floor(brain.rand() * t.memory.length)]; tasteUpdate(brain, m.phi, m.target);
  const mode = brain.program.tasteRevise; if (!mode) return;
  t.n++; t.s2 += residual * residual;
  for (let k = 0; k < FULL; k++) t.ev[k] += walsh(k, bits) * residual;
  if (t.n % brain.genes.tasteEvery || t.masks.length >= brain.genes.tasteCap) return;
  const have = new Set(t.masks), kids = new Set();
  for (const mk of t.masks) if (mk) for (let b = 0; b < ODOR_BITS; b++) { const c = mk | 1 << b; if (!have.has(c)) kids.add(c); }
  const list = [...kids].sort((a, b) => a - b); if (!list.length) return;
  const best = list.reduce((a, c) => Math.abs(t.ev[c]) > Math.abs(t.ev[a]) ? c : a, list[0]);
  if (Math.abs(t.ev[best]) <= brain.genes.tasteZ * Math.sqrt(t.s2)) return;
  const chosen = mode === 'random' ? list[Math.floor(brain.rand() * list.length)] : best;
  t.masks.push(chosen); t.w.push(0); t.added.push(chosen);
  for (const rec of t.memory) rec.phi.push(walsh(chosen, rec.bits));
}
// Movement: base features per candidate move (all in [-1,1] or [0,1]); masks are products of base features.
function moveValue(brain, base) {
  const mv = brain.move; let q = 0;
  for (let i = 0; i < mv.masks.length; i++) { let v = 1; const m = mv.masks[i]; for (let b = 0; b < MOVE_BASE; b++) if (m >> b & 1) v *= base[b]; q += mv.w[i] * v; }
  return q;
}
function movePhi(brain, base) { return brain.move.masks.map(m => { let v = 1; for (let b = 0; b < MOVE_BASE; b++) if (m >> b & 1) v *= base[b]; return v; }); }
// Movement learning: reward-modulated preference with an eligibility trace (advantage over a running
// reward baseline). It only shifts preferences by better/worse-than-usual outcomes, so the innate
// instinct (initial weights) is refined rather than regressed toward the small absolute returns.
export function moveLearn(brain, reward) {
  const mv = brain.move, p = mv.pending; if (!p) return;
  const delta = clip(reward - (mv.rbar ?? 0), 4); mv.rbar = (mv.rbar ?? 0) + .02 * (reward - (mv.rbar ?? 0));
  const tr = mv.trace ?? (mv.trace = []); while (tr.length < p.phi.length) tr.push(0);
  for (let i = 0; i < tr.length; i++) tr[i] = .8 * tr[i] + (p.phi[i] ?? 0);
  for (let i = 0; i < tr.length; i++) mv.w[i] = clip(mv.w[i] + brain.genes.moveStep * delta * tr[i], 8);
  mv.pending = null;
  const mode = brain.program.moveRevise; if (!mode) return;
  mv.n++; mv.s2 += delta * delta;
  for (let k = 0; k < mv.ev.length; k++) { let v = 1; for (let b = 0; b < MOVE_BASE; b++) if (k >> b & 1) v *= p.base[b]; mv.ev[k] += v * delta; }
  if (mv.n % brain.genes.moveEvery || mv.masks.length >= brain.genes.moveCap) return;
  const have = new Set(mv.masks), kids = new Set();
  for (const mk of mv.masks) for (let b = 0; b < MOVE_BASE; b++) { const c = mk | 1 << b; if (!have.has(c) && popcount(c) <= 3) kids.add(c); }
  const list = [...kids].sort((a, b) => a - b); if (!list.length) return;
  const best = list.reduce((a, c) => Math.abs(mv.ev[c]) > Math.abs(mv.ev[a]) ? c : a, list[0]);
  if (Math.abs(mv.ev[best]) <= brain.genes.moveZ * Math.sqrt(mv.s2)) return;
  const chosen = mode === 'random' ? list[Math.floor(brain.rand() * list.length)] : best;
  mv.masks.push(chosen); mv.w.push(0); mv.added.push(chosen);
}

// ---------- world ----------
export const DEFAULT_WORLD = {
  size: 40, patches: 12, patchRadius: 4, plantDensity: .6, regrow: .08, plantCap: 4, bite: 1.5,
  toxin: .6, metabolism: .06, moveCost: .02, brainCost: .002, maxEnergy: 100, maxAge: 1200,
  relocateEvery: 300, shiftEvery: 100, ruleSchedule: [['pairs', 1500]], labelNoise: .05,
  childEnergy: 25, birthCost: 30, mutation: .1, capacity: 400, founders: 60, senseRadius: 4
};
export class Microverse {
  constructor(seed, strains, config = {}) {
    this.cfg = { ...DEFAULT_WORLD, ...config }; this.r = rng32(mix(seed)); this.seed = seed; this.tick = 0; this.nextId = 1;
    this.strains = strains; // {name: program}
    const N = this.cfg.size; this.plant = Array.from({ length: N * N }, () => null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => this.randomCenter());
    this.ruleIndex = -1; this.ruleEnds = 0; this.nextRule(); this.redrawCodes();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = []; this.stats = { births: 0, deaths: 0, starved: 0, aged: 0 }; this.history = [];
    const names = Object.keys(strains);
    for (let i = 0; i < this.cfg.founders; i++) { const s = names[i % names.length]; this.spawn(s, strains[s], null, Math.floor(this.r() * N), Math.floor(this.r() * N), 50, 0); }
  }
  randomCenter() { const N = this.cfg.size; return [Math.floor(this.r() * N), Math.floor(this.r() * N)]; }
  nextRule() {
    const sch = this.cfg.ruleSchedule; this.ruleIndex = (this.ruleIndex + 1) % sch.length;
    const [family, ticks] = sch[this.ruleIndex]; this.epoch = (this.epoch ?? -1) + 1; this.rule = makeRule(family, mix(this.seed ^ (this.tick + 1) * 7919)); this.ruleEnds = this.tick + ticks;
  }
  redrawCodes() {
    // Balanced chemistry: each draw has exactly KINDS/2 good and KINDS/2 bad odor kinds, so the base
    // rate of good food never swings into famine; telling kinds apart still pays.
    const seen = new Set(), good = [], bad = [];
    while (good.length < KINDS / 2 || bad.length < KINDS / 2) { const c = Math.floor(this.r() * FULL); if (seen.has(c)) continue; seen.add(c);
      const bits = [...Array(ODOR_BITS).keys()].map(b => c >> b & 1 ? 1 : -1), v = valence(this.rule, bits);
      if (v > 0 && good.length < KINDS / 2) good.push(bits); else if (v < 0 && bad.length < KINDS / 2) bad.push(bits); }
    this.codes = [...good, ...bad]; for (let i = this.codes.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [this.codes[i], this.codes[j]] = [this.codes[j], this.codes[i]]; }
    this.kindValence = this.codes.map(b => valence(this.rule, b));
  }
  seedPatch(i) {
    const [cx, cy] = this.patchCenters[i], N = this.cfg.size, R = this.cfg.patchRadius;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
      if (dx * dx + dy * dy > R * R || this.r() > this.cfg.plantDensity) continue;
      const x = (cx + dx + N) % N, y = (cy + dy + N) % N, k = y * N + x;
      if (!this.plant[k]) this.plant[k] = { kind: Math.floor(this.r() * KINDS), amount: this.cfg.plantCap * this.r(), patch: i };
    }
  }
  spawn(strain, program, parent, x, y, energy, gen) {
    const id = this.nextId++, r = rng32(mix(this.seed ^ Math.imul(id, 2654435761)));
    let prog = program;
    if (parent) {
      const pb = parent.brain; prog = { ...pb.program, tasteMasks: [...pb.taste.masks], moveMasks: [...pb.move.masks], genes: { ...pb.genes } };
      if (prog.mutate) this.mutate(prog, r);
    }
    // ORACLE (measuring instrument only): born with the true terms of the rule in force.
    if (prog.oracle) prog = { ...prog, tasteMasks: [0, ...this.rule.target.filter(t => t)] };
    const inh = parent ? { tasteEv: parent.brain.taste.ev, tasteN: parent.brain.taste.n, tasteS2: parent.brain.taste.s2, moveEv: parent.brain.move.ev, moveN: parent.brain.move.n, moveS2: parent.brain.move.s2 } : null;
    const f = { id, strain, x, y, energy, age: 0, gen, parent: parent?.id ?? 0, brain: newBrain(prog, r, prog.inheritEvidence === false ? null : inh), eaten: { good: 0, bad: 0 }, tastings: 0 };
    this.flies.push(f); return f;
  }
  mutate(prog, r) {
    const m = this.cfg.mutation;
    if (r() < m && prog.tasteMasks.length > 2) prog.tasteMasks.splice(1 + Math.floor(r() * (prog.tasteMasks.length - 1)), 1);
    if (r() < m && prog.tasteMasks.length < prog.genes.tasteCap) { const c = Math.floor(r() * FULL); if (c && !prog.tasteMasks.includes(c)) prog.tasteMasks.push(c); }
    if (r() < m && prog.moveMasks.length > 2) prog.moveMasks.splice(1 + Math.floor(r() * (prog.moveMasks.length - 1)), 1);
    if (r() < m && prog.moveMasks.length < prog.genes.moveCap) { const c = Math.floor(r() * (1 << MOVE_BASE)); if (c && !prog.moveMasks.includes(c)) prog.moveMasks.push(c); }
    for (const k of ['tasteStep', 'moveStep', 'tasteZ', 'moveZ', 'eps', 'birthEnergy', 'acceptAt']) if (r() < m) prog.genes[k] *= Math.exp((r() - .5) * .4);
    prog.genes.eps = Math.min(.5, prog.genes.eps); prog.genes.birthEnergy = Math.max(40, Math.min(95, prog.genes.birthEnergy));
    prog.genes.tasteStep = Math.min(8, prog.genes.tasteStep); prog.genes.acceptAt = Math.max(.1, Math.min(.9, prog.genes.acceptAt));
  }
  cell(x, y) { const N = this.cfg.size; return ((y + N) % N) * N + ((x + N) % N); }
  // Base movement features for moving to (x+dx, y+dy): [bias, food here, predicted-good food here,
  // smell of predicted-good food in that direction, crowding, energy level]. Stay: dx=dy=0.
  moveFeatures(f, goodPred, dir, occupancy) {
    const N = this.cfg.size, [dx, dy] = MOVES[dir], x = f.x + dx, y = f.y + dy, p = this.plant[this.cell(x, y)];
    const food = p ? p.amount / this.cfg.plantCap : 0, good = p ? food * (2 * goodPred[p.kind] - 1) : 0;
    let smell = 0;
    if (dir) { const R = this.cfg.senseRadius;
      for (let d = 1; d <= R; d++) for (let s = -d; s <= d; s++) { const cx = dx ? f.x + dx * d : f.x + s, cy = dy ? f.y + dy * d : f.y + s, q = this.plant[this.cell(cx, cy)]; if (q) smell += q.amount * (2 * goodPred[q.kind] - 1) / (d * d); }
      smell = Math.tanh(smell / 4); }
    return [1, food, good, smell, Math.min(1, (occupancy.get(this.cell(x, y)) ?? 0) / 3), f.energy / this.cfg.maxEnergy * 2 - 1];
  }
  step() {
    const cfg = this.cfg, N = cfg.size;
    if (this.tick >= this.ruleEnds) { this.nextRule(); this.redrawCodes(); }
    if (this.tick % cfg.shiftEvery === 0 && this.tick) this.redrawCodes();
    if (this.tick % cfg.relocateEvery === 0 && this.tick) { const i = Math.floor(this.r() * cfg.patches); for (let k = 0; k < this.plant.length; k++) if (this.plant[k]?.patch === i) this.plant[k] = null; this.patchCenters[i] = this.randomCenter(); this.seedPatch(i); }
    for (const p of this.plant) if (p) p.amount = Math.min(cfg.plantCap, p.amount + cfg.regrow);
    const occupancy = new Map(); for (const f of this.flies) { const k = this.cell(f.x, f.y); occupancy.set(k, (occupancy.get(k) ?? 0) + 1); }
    const order = this.flies.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const born = [];
    for (const i of order) {
      const f = this.flies[i], b = f.brain, e0 = f.energy;
      const goodPred = this.codes.map(bits => tastePredict(b, bits));
      const bases = MOVES.map((_, d) => this.moveFeatures(f, goodPred, d, occupancy));
      const qs = bases.map(base => moveValue(b, base));
      moveLearn(b, b.move.pending?.reward ?? 0); // complete the previous move with its observed reward
      const qmax = Math.max(...qs), ties = qs.map((q, d) => q >= qmax - 1e-9 ? d : -1).filter(d => d >= 0);
      let dir = ties[Math.floor(b.rand() * ties.length)]; if (b.rand() < b.genes.eps) dir = Math.floor(b.rand() * MOVES.length);
      b.move.pending = { base: bases[dir], phi: movePhi(b, bases[dir]) };
      const from = this.cell(f.x, f.y); occupancy.set(from, occupancy.get(from) - 1);
      f.x = (f.x + MOVES[dir][0] + N) % N; f.y = (f.y + MOVES[dir][1] + N) % N;
      const to = this.cell(f.x, f.y); occupancy.set(to, (occupancy.get(to) ?? 0) + 1);
      f.energy -= cfg.metabolism + (dir ? cfg.moveCost : 0) + cfg.brainCost * (b.taste.masks.length + b.move.masks.length);
      const p = this.plant[to];
      if (p && p.amount > .2) {
        const bits = this.codes[p.kind];
        if (tastePredict(b, bits) > (b.genes.acceptAt ?? .5) || b.rand() < (b.genes.tasteEps ?? 0)) {
          const take = Math.min(p.amount, cfg.bite); p.amount -= take; const good = this.kindValence[p.kind] > 0;
          f.energy += good ? take : -take * cfg.toxin; good ? f.eaten.good++ : f.eaten.bad++; f.tastings++;
          tasteLearn(b, bits, (good ? 1 : 0) ^ (this.r() < cfg.labelNoise ? 1 : 0));
        }
      }
      f.energy = Math.min(cfg.maxEnergy, f.energy); f.age++;
      b.move.pending.reward = (f.energy - e0) / 4; // reward for this move: its energy change
      if (f.energy >= b.genes.birthEnergy && this.flies.length + born.length < cfg.capacity) {
        f.energy -= cfg.birthCost; born.push([f, (f.x + Math.floor(this.r() * 3) - 1 + N) % N, (f.y + Math.floor(this.r() * 3) - 1 + N) % N]);
      }
    }
    const alive = [];
    for (const f of this.flies) {
      if (f.energy <= 0 || f.age >= cfg.maxAge) { this.stats.deaths++; f.energy <= 0 ? this.stats.starved++ : this.stats.aged++; } else alive.push(f);
    }
    this.flies = alive;
    for (const [p, x, y] of born) { this.spawn(p.strain, null, p, x, y, cfg.childEnergy, p.gen + 1); this.stats.births++; }
    this.tick++;
  }
  // Population taste skill on the current chemistry: P(accept|good) - P(accept|bad) over the 16 kinds.
  skill(f) {
    const g = [], x = []; this.codes.forEach((bits, k) => (this.kindValence[k] > 0 ? g : x).push(tastePredict(f.brain, bits) > .5 ? 1 : 0));
    const m = v => v.length ? v.reduce((a, c) => a + c, 0) / v.length : 0; return m(g) - m(x);
  }
  snapshot() {
    const by = {}; for (const f of this.flies) (by[f.strain] ??= []).push(f);
    const m = (v, fn) => v.length ? v.reduce((a, c) => a + fn(c), 0) / v.length : 0;
    const strains = Object.fromEntries(Object.keys(this.strains).map(s => { const v = by[s] ?? [];
      return [s, { n: v.length, skill: m(v, f => this.skill(f)), tasteMasks: m(v, f => f.brain.taste.masks.length), targetsHeld: m(v, f => this.rule.target.filter(t => f.brain.taste.masks.includes(t)).length), moveMasks: m(v, f => f.brain.move.masks.length), gen: m(v, f => f.gen), energy: m(v, f => f.energy) }]; }));
    return { tick: this.tick, pop: this.flies.length, rule: this.rule.family, epoch: this.epoch, births: this.stats.births, deaths: this.stats.deaths, strains };
  }
}
