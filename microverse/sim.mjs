// Microverse: a small, closed, resource-limited world in which flies live, learn, breed and die
// continuously. Brains are heritable programs (feature masks + learning genes); learned weights
// are not inherited. The taste learner mirrors learning/odor-routed-taste.mjs (Walsh masks over an
// 8-bit odor code, logistic readout, reservoir replay, evidence-driven self-revision). Movement is a
// linear Q-learner over per-move features that can self-revise the same way (product features).
const popcount = m => { let n = 0; while (m) { n += m & 1; m >>>= 1; } return n; };
export const ODOR_BITS = 8, FULL = 1 << ODOR_BITS, KINDS = 16;
export const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
export const MOVE_BASE = 10; // movement senses, see moveFeatures(); bits 0-5 innate, 6-9 optional (sense menu)
const MOVE_DEP = 0b1111011110; // move-dependent senses (all but bias bit 0 and energy bit 5)
// Sense menu for movement self-revision: optional senses alone, or pairwise products of real senses,
// each including at least one move-dependent sense. Innate singles (bits 0-5) are not candidates.
export const MOVE_CANDS = [...Array(1 << MOVE_BASE).keys()].filter(c => !(c & 1) && (c & MOVE_DEP) &&
  ((popcount(c) === 1 && c >= 1 << 6) || popcount(c) === 2));
const innateMove = m => popcount(m) === 1 && m < 1 << 6;

export function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
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
export const DEFAULT_GENES = { tasteStep: 4, tasteZ: 3, tasteEvery: 8, tasteCap: 16, moveStep: .05, moveZ: 3, moveEvery: 32, moveCap: 12, eps: .08, tasteEps: .05, acceptAt: .4, birthEnergy: 60, tasteMemory: 200, tastePrune: 2, movePrune: .5 };
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
function modelProb(brain, bits) {
  const t = brain.taste, n = t.masks.length; let z = Math.log(3);
  for (let i = 0; i < n; i++) z += t.w[i] * walsh(t.masks[i], bits) / Math.sqrt(n);
  return sigmoid(z);
}
// Confidence gate (self-monitoring): the fly trusts its taste model only while the model's running
// log-loss on fresh tastes beats a base-rate guess; otherwise it predicts the base rate it has seen.
function tastePredict(brain, bits) {
  const t = brain.taste, gate = brain.program.confidenceGate !== false && t.lossModel !== undefined && t.lossModel >= t.lossBase;
  return .05 + .9 * (gate ? t.base : modelProb(brain, bits));
}
function tasteUpdate(brain, phi, target) {
  const t = brain.taste, n = phi.length; let z = Math.log(3);
  for (let i = 0; i < n; i++) z += t.w[i] * phi[i] / Math.sqrt(n);
  const step = brain.genes.tasteStep * (target - sigmoid(z)) / Math.sqrt(n);
  for (let i = 0; i < n; i++) t.w[i] = clip(t.w[i] + step * phi[i], 8);
}
// P13b (docs/MICROVERSE_L2_GOALS.md, amendment A1): the fly tunes its own reviser genes from its own
// experience at each revision check. 'meta' uses the rule's directions; 'sham' fires on the same
// conditions with the same step sizes but random directions. Children inherit the adjusted genes.
export const MEM_GRID = [1e12, 800, 400, 200, 100, 50], PRUNE_GRID = [0, .5, 1, 2, 3, 4], ACCEPT_GRID = [.1, .2, .3, .4, .5, .6, .75, .85];
function gridStep(genes, gene, grid, dir) { let i = grid.indexOf(genes[gene]); if (i < 0) i = 0; genes[gene] = grid[Math.max(0, Math.min(grid.length - 1, i + dir))]; }
function metaRevise(brain) {
  if (brain.program.metaR === 'trial' || brain.program.metaR === 'trialsham' || brain.program.metaR === 'trialoracle') return metaTrial(brain);
  const t = brain.taste, g = brain.genes, sham = brain.program.metaR === 'sham', dirOf = d => sham ? (brain.rand() < .5 ? -1 : 1) : d;
  const added = t.masks.map((m, i) => i).filter(i => popcount(t.masks[i]) > 1);
  if (added.length) { const weak = added.filter(i => Math.abs(t.w[i]) < 1).length;
    if (weak / added.length > .5) gridStep(g, 'tastePrune', PRUNE_GRID, dirOf(1)); else if (weak === 0) gridStep(g, 'tastePrune', PRUNE_GRID, dirOf(-1)); }
  const trusted = t.lossModel !== undefined && t.lossModel < t.lossBase; t.everTrusted ||= trusted;
  if (trusted) { t.trustRun = (t.trustRun ?? 0) + 1; t.distrustRun = 0; } else { t.distrustRun = (t.distrustRun ?? 0) + 1; t.trustRun = 0; }
  if (t.everTrusted && t.distrustRun >= 3) { gridStep(g, 'tasteMemory', MEM_GRID, dirOf(1)); t.distrustRun = 0; }
  else if (t.trustRun >= (brain.program.metaLongRun ?? 10)) { if (!(brain.program.metaNoInfinite && MEM_GRID.indexOf(g.tasteMemory) <= 1 && !sham)) gridStep(g, 'tasteMemory', MEM_GRID, dirOf(-1)); t.trustRun = 0; }
}
// P13b attempt 3: in-life trial-and-revert on the fly's own reviser genes. Every K revision checks the fly
// tries one grid step on tasteMemory or tastePrune; after K more checks it keeps the step only if its own
// running taste-prediction loss fell ('trial'), or by coin flip ('trialsham': same trials, no evidence).
// P13b-3a measurement only: tallies keep decisions by whether the trial step moved toward R* (memory 800, prune .5).
export const META_STATS = { towardKeep: 0, towardN: 0, awayKeep: 0, awayN: 0 };
function metaRecord(tr, now, keep) { const grid = tr.gene === 'tasteMemory' ? MEM_GRID : PRUNE_GRID, d = v => Math.abs(grid.indexOf(v) - 1);
  if (d(now) < d(tr.old)) { META_STATS.towardN++; META_STATS.towardKeep += keep; } else if (d(now) > d(tr.old)) { META_STATS.awayN++; META_STATS.awayKeep += keep; } }
function metaTrial(brain) {
  const t = brain.taste, g = brain.genes, K = brain.program.metaK ?? 6; t.metaChecks = (t.metaChecks ?? 0) + 1;
  if (t.metaChecks % K || t.lossModel === undefined) return;
  // Window means: own average log-loss over the K checks before the trial vs the K checks of the trial.
  const win = t.llN ? t.llSum / t.llN : null, wn = t.llN ?? 0; t.llSum = 0; t.llN = 0;
  const tr = t.trial;
  // 'trialoracle' (measuring instrument only, P13b-3b headroom): keep a step only if it moves toward R* (memory 800, prune .5).
  if (tr && brain.program.metaR === 'trialoracle') { const grid = tr.gene === 'tasteMemory' ? MEM_GRID : PRUNE_GRID, d = v => Math.abs(grid.indexOf(v) - 1); if (!(d(g[tr.gene]) < d(tr.old))) g[tr.gene] = tr.old; t.trial = null; return; }
  if (tr) { const keep = brain.program.metaR === 'trial' ? (brain.program.metaWindow ? (win !== null && wn >= 3 && win < tr.loss0) : t.lossModel < tr.loss0) : brain.rand() < .5; metaRecord(tr, g[tr.gene], keep); if (!keep) g[tr.gene] = tr.old; t.trial = null; return; }
  if (brain.program.metaWindow && (win === null || wn < 3)) return;
  const [gene, grid] = brain.rand() < .5 ? ['tasteMemory', MEM_GRID] : ['tastePrune', PRUNE_GRID], old = g[gene];
  gridStep(g, gene, grid, brain.rand() < .5 ? -1 : 1); if (g[gene] !== old) t.trial = { gene, old, loss0: brain.program.metaWindow ? win : t.lossModel };
}
export function tasteLearn(brain, bits, target) {
  const t = brain.taste, phi = t.masks.map(m => walsh(m, bits));
  const residual = target - sigmoid(Math.log(3) + t.w.reduce((s, w, i) => s + w * phi[i], 0) / Math.sqrt(phi.length));
  { const pm = Math.min(1 - 1e-3, Math.max(1e-3, modelProb(brain, bits))), pb = Math.min(1 - 1e-3, Math.max(1e-3, t.base ?? .75)), ll = p => -(target ? Math.log(p) : Math.log(1 - p));
    if (t.lossModel === undefined) { t.lossModel = ll(pm); t.lossBase = ll(pb); } else { t.lossModel += .05 * (ll(pm) - t.lossModel); t.lossBase += .05 * (ll(pb) - t.lossBase); }
    t.base = (t.base ?? .75) + .05 * (target - (t.base ?? .75)); t.llSum = (t.llSum ?? 0) + ll(pm); t.llN = (t.llN ?? 0) + 1; }
  const rec = { bits, phi, target }; t.seen++;
  if (t.memory.length < 32) t.memory.push(rec); else { const j = Math.floor(brain.rand() * t.seen); if (j < 32) t.memory[j] = rec; }
  tasteUpdate(brain, phi, target);
  const m = t.memory[Math.floor(brain.rand() * t.memory.length)]; tasteUpdate(brain, m.phi, m.target);
  const mode = brain.program.tasteRevise; if (!mode) return;
  // Forgetting: evidence decays (half-life ~140 tastings), so evidence from an old rule fades.
  const D = 1 - 1 / (brain.genes.tasteMemory ?? 200); t.n++; t.s2 = t.s2 * D + residual * residual;
  for (let k = 0; k < FULL; k++) t.ev[k] = t.ev[k] * D + walsh(k, bits) * residual;
  if (t.n % brain.genes.tasteEvery) return;
  if (brain.program.metaR) metaRevise(brain);
  // Pruning when full: drop the weakest added (higher-order) feature if its weight is small (|w| < 2).
  if (t.masks.length >= brain.genes.tasteCap) {
    let j = -1; for (let i = 0; i < t.masks.length; i++) if (popcount(t.masks[i]) > 1 && Math.abs(t.w[i]) < (brain.genes.tastePrune ?? 2) && (j < 0 || Math.abs(t.w[i]) < Math.abs(t.w[j]))) j = i;
    if (j < 0) return;
    t.masks.splice(j, 1); t.w.splice(j, 1); for (const rec of t.memory) rec.phi.splice(j, 1);
  }
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
  // Delayed credit: evidence for each candidate product feature uses its decaying trace (same lambda as learning).
  const et = mv.evTrace ?? (mv.evTrace = Array(mv.ev.length).fill(0));
  for (const k of MOVE_CANDS) { let v = 1; for (let b = 1; b < MOVE_BASE; b++) if (k >> b & 1) v *= p.base[b]; et[k] = .8 * et[k] + v; mv.ev[k] += et[k] * delta; }
  if (mv.n % brain.genes.moveEvery) return;
  // Pruning when full (as for taste): drop the weakest added product feature if its weight is small.
  if (mv.masks.length >= brain.genes.moveCap) {
    let j = -1; for (let i = 0; i < mv.masks.length; i++) if (!innateMove(mv.masks[i]) && Math.abs(mv.w[i]) < (brain.genes.movePrune ?? .5) && (j < 0 || Math.abs(mv.w[i]) < Math.abs(mv.w[j]))) j = i;
    if (j < 0) return; mv.masks.splice(j, 1); mv.w.splice(j, 1); if (mv.trace) mv.trace.splice(j, 1);
  }
  const have = new Set(mv.masks), list = MOVE_CANDS.filter(c => !have.has(c)); if (!list.length) return;
  const best = list.reduce((a, c) => Math.abs(mv.ev[c]) > Math.abs(mv.ev[a]) ? c : a, list[0]);
  if (Math.abs(mv.ev[best]) <= brain.genes.moveZ * Math.sqrt(mv.s2)) return;
  const chosen = mode === 'random' ? list[Math.floor(brain.rand() * list.length)] : best;
  mv.masks.push(chosen); mv.w.push(0); mv.added.push(chosen);
}

// ---------- world ----------
export const DEFAULT_WORLD = {
  size: 40, patches: 8, patchRadius: 4, plantDensity: .6, regrow: .08, plantCap: 4, bite: 1.5,
  toxin: .6, metabolism: .06, moveCost: .02, brainCost: .0005, maxEnergy: 100, maxAge: 1200,
  relocateEvery: 50, shiftEvery: 100, ruleSchedule: [['pairs', 1500]], labelNoise: .05,
  childEnergy: 25, birthCost: 30, mutation: .1, capacity: 400, founders: 60, senseRadius: 4
};
export class Microverse {
  constructor(seed, strains, config = {}) {
    this.cfg = { ...DEFAULT_WORLD, ...config }; this.r = rng32(mix(seed)); this.seed = seed; this.tick = 0; this.nextId = 1;
    this.strains = strains; // {name: program}
    const N = this.cfg.size; this.plant = Array.from({ length: N * N }, () => null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => this.randomCenter());
    this.ruleIndex = -1; this.ruleEnds = 0; this.nextRule(); this.redrawCodes();
    if (this.cfg.habitats || this.cfg.dualFood) this.habitatInit();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = []; this.stats = { births: 0, deaths: 0, starved: 0, aged: 0 }; this.history = [];
    const names = Object.keys(strains);
    for (let i = 0; i < this.cfg.founders; i++) { const s = names[i % names.length]; this.spawn(s, strains[s], null, Math.floor(this.r() * N), Math.floor(this.r() * N), 50, 0); }
  }
  randomCenter() { const N = this.cfg.size; return [Math.floor(this.r() * N), Math.floor(this.r() * N)]; }
  // Opt-in habitats (P13b H7): the right half of the world (x >= size/2) is volatile, with its own rule
  // that switches every habitats.every ticks and its own balanced odor table; the left half keeps the main rule.
  isVol(x) { const N = this.cfg.size; return ((x % N) + N) % N >= N / 2; }
  gv(gp, kind, x) { return (this.cfg.habitats && this.isVol(x)) || (this.cfg.dualFood && kind >= KINDS / 2) ? this.gp2[kind] : gp[kind]; }
  // Opt-in dual food (P13b H9): fruit kinds (0-7) follow the main (stable) rule; leaf kinds (8-15) follow a
  // second rule that switches every dualFood.every ticks. Even patches are fruit-rich, odd patches leaf-rich.
  habitatInit() { this.r2 = rng32(mix(this.seed ^ 0x5eed2)); this.habitatRule(); }
  habitatRule() { const fams = ['pairs', 'staircase', 'triples', 'single']; this.rule2 = makeRule(fams[Math.floor(this.r2() * 4)], Math.floor(this.r2() * 4294967296) >>> 0 || 1); this.habitatCodes(); }
  habitatCodes() { const seen = new Set(), good = [], bad = [];
    while (good.length < KINDS / 2 || bad.length < KINDS / 2) { const c = Math.floor(this.r2() * FULL); if (seen.has(c)) continue; seen.add(c);
      const bits = [...Array(ODOR_BITS).keys()].map(b => c >> b & 1 ? 1 : -1), v = valence(this.rule2, bits);
      if (v > 0 && good.length < KINDS / 2) good.push(bits); else if (v < 0 && bad.length < KINDS / 2) bad.push(bits); }
    this.codes2 = [...good, ...bad]; for (let i = this.codes2.length - 1; i > 0; i--) { const j = Math.floor(this.r2() * (i + 1)); [this.codes2[i], this.codes2[j]] = [this.codes2[j], this.codes2[i]]; }
    this.kindValence2 = this.codes2.map(b => valence(this.rule2, b)); }
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
      if (!this.plant[k]) { let kind = Math.floor(this.r() * KINDS);
        if (this.cfg.dualFood) { const fruitPatch = i % 2 === 0, half = KINDS / 2, own = this.r() < .85; kind = Math.floor(this.r() * half) + ((fruitPatch === own) ? 0 : half); }
        this.plant[k] = { kind, amount: this.cfg.plantCap * this.r(), patch: i }; }
    }
  }
  spawn(strain, program, parent, x, y, energy, gen) {
    const id = this.nextId++, r = rng32(mix(this.seed ^ Math.imul(id, 2654435761)));
    let prog = program;
    if (parent) {
      const pb = parent.brain; prog = { ...pb.program, tasteMasks: [...pb.taste.masks], moveMasks: [...pb.move.masks], genes: { ...pb.genes } };
      if (prog.mutate) this.mutate(prog, r);
      if (prog.evoA && r() < .1) gridStep(prog.genes, 'acceptAt', ACCEPT_GRID, r() < .5 ? -1 : 1); // P13b A2 EVO-R control
      if (prog.evoR) for (const [gene, grid] of [['tasteMemory', MEM_GRID], ['tastePrune', PRUNE_GRID]]) if (r() < .1) gridStep(prog.genes, gene, grid, r() < .5 ? -1 : 1); // P13b EVO-R control
    }
    // ORACLE (measuring instrument only): born with the true terms of the rule in force.
    if (prog.oracle) prog = { ...prog, tasteMasks: [0, ...this.rule.target.filter(t => t)] };
    const inh = parent ? { tasteEv: parent.brain.taste.ev, tasteN: parent.brain.taste.n, tasteS2: parent.brain.taste.s2, moveEv: parent.brain.move.ev, moveN: parent.brain.move.n, moveS2: parent.brain.move.s2 } : null;
    const f = { id, strain, x, y, energy, age: 0, gen, parent: parent?.id ?? 0, brain: newBrain(prog, r, prog.inheritEvidence === false ? null : inh), eaten: { good: 0, bad: 0 }, tastings: 0 };
    // Opt-in individual senses: each fly draws its own taste-sensor noise at birth (not inherited).
    // Opt-in individual toxin sensitivity (P13b H8): a non-heritable multiplier on toxin damage, drawn at birth.
    if (this.cfg.toxinNiche) { const [lo, hi] = this.cfg.toxinNiche; f.toxinMul = r() < .5 ? lo : hi;
      // Headroom instruments only: set exploration / accept threshold from the fly's true sensitivity.
      if (prog.epsOracle) f.brain.genes.tasteEps = f.toxinMul === lo ? prog.epsOracle.lo : prog.epsOracle.hi;
      if (prog.acceptOracle) f.brain.genes.acceptAt = f.toxinMul === lo ? prog.acceptOracle.lo : prog.acceptOracle.hi; }
    if (this.cfg.noiseNiche) { const [lo, hi] = this.cfg.noiseNiche; f.noise = r() < .5 ? lo : hi;
      // Headroom instrument (H6) only: stepOracle sets the learning rate from the fly's true noise level.
      if (prog.stepOracle) f.brain.genes.tasteStep = f.noise === lo ? prog.stepOracle.lo : prog.stepOracle.hi; }
    this.flies.push(f); return f;
  }
  mutate(prog, r) {
    const m = this.cfg.mutation;
    if (r() < m && prog.tasteMasks.length > 2) prog.tasteMasks.splice(1 + Math.floor(r() * (prog.tasteMasks.length - 1)), 1);
    if (r() < m && prog.tasteMasks.length < prog.genes.tasteCap) { const c = Math.floor(r() * FULL); if (c && !prog.tasteMasks.includes(c)) prog.tasteMasks.push(c); }
    if (r() < m) { const opt = prog.moveMasks.filter(x => !innateMove(x)); if (opt.length) prog.moveMasks.splice(prog.moveMasks.indexOf(opt[Math.floor(r() * opt.length)]), 1); }
    if (r() < m && prog.moveMasks.length < prog.genes.moveCap) { const c = MOVE_CANDS[Math.floor(r() * MOVE_CANDS.length)]; if (!prog.moveMasks.includes(c)) prog.moveMasks.push(c); }
    for (const k of ['tasteStep', 'moveStep', 'tasteZ', 'moveZ', 'eps', 'birthEnergy', 'acceptAt']) if (r() < m) prog.genes[k] *= Math.exp((r() - .5) * .4);
    prog.genes.eps = Math.min(.5, prog.genes.eps); prog.genes.birthEnergy = Math.max(40, Math.min(95, prog.genes.birthEnergy));
    prog.genes.tasteStep = Math.min(8, prog.genes.tasteStep); prog.genes.acceptAt = Math.max(.1, Math.min(.9, prog.genes.acceptAt));
  }
  cell(x, y) { const N = this.cfg.size; return ((y + N) % N) * N + ((x + N) % N); }
  // Movement senses for moving to (x+dx, y+dy). Innate: [0 bias, 1 food here, 2 EV-food here,
  // 3 smell (radius 4), 4 crowding, 5 energy]. Optional menu: [6 near smell (r 2), 7 far smell (r 6),
  // 8 heads toward the best food it senses, 9 food here worth staying for (stay only)]. Stay: dx=dy=0.
  moveFeatures(f, goodPred, dir, occupancy, target) {
    const [dx, dy] = MOVES[dir], x = f.x + dx, y = f.y + dy, p = this.plant[this.cell(x, y)];
    const food = p ? p.amount / this.cfg.plantCap : 0, good = p ? food * this.gv(goodPred, p.kind, x) : 0;
    let s2 = 0, s4 = 0, s6 = 0;
    if (dir) for (let d = 1; d <= 6; d++) for (let s = -d; s <= d; s++) { const cx = dx ? f.x + dx * d : f.x + s, cy = dy ? f.y + dy * d : f.y + s, q = this.plant[this.cell(cx, cy)];
      if (!q) continue; const v = q.amount * this.gv(goodPred, q.kind, cx) / (d * d); if (d <= 2) s2 += v; if (d <= 4) s4 += v; s6 += v; }
    const toward = dir && target ? (Math.abs(target[0] - dx) + Math.abs(target[1] - dy) < Math.abs(target[0]) + Math.abs(target[1]) ? 1 : 0) : 0;
    const stay = !dir && p && p.amount > 1 && this.gv(goodPred, p.kind, x) > 0 ? 1 : 0;
    return [1, food, good, Math.tanh(s4 / 4), Math.min(1, (occupancy.get(this.cell(x, y)) ?? 0) / 3), f.energy / this.cfg.maxEnergy * 2 - 1,
      Math.tanh(s2 / 2), Math.tanh(s6 / 6), toward, stay];
  }
  // Best food cell the fly senses (radius 4), by amount*EV/(1+distance)/(1+crowd); null if none.
  bestTarget(f, goodPred, occupancy) {
    const R = this.cfg.senseRadius; let best = null, bv = 0;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) { if (!dx && !dy) continue; const q = this.plant[this.cell(f.x + dx, f.y + dy)]; if (!q || q.amount <= .2 || this.gv(goodPred, q.kind, f.x + dx) <= 0) continue;
      const v = q.amount * this.gv(goodPred, q.kind, f.x + dx) / (1 + Math.abs(dx) + Math.abs(dy)) / (1 + (occupancy.get(this.cell(f.x + dx, f.y + dy)) ?? 0)); if (v > bv) { bv = v; best = [dx, dy]; } }
    return best;
  }
  // Planner (instrument): stay on edible food worth a bite; else step toward the cell maximising
  // amount*EV/(1+distance) within the sense radius, judged by the fly's own taste (no oracle valence).
  plan(f, goodPred, occupancy) {
    const R = this.cfg.senseRadius, here = this.plant[this.cell(f.x, f.y)];
    if (here && here.amount > 1 && this.gv(goodPred, here.kind, f.x) > 0) return 0;
    let best = null, bv = 0;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) { if (!dx && !dy) continue; const q = this.plant[this.cell(f.x + dx, f.y + dy)]; if (!q || q.amount <= .2 || this.gv(goodPred, q.kind, f.x + dx) <= 0) continue;
      const v = q.amount * this.gv(goodPred, q.kind, f.x + dx) / (1 + Math.abs(dx) + Math.abs(dy)) / (1 + (occupancy.get(this.cell(f.x + dx, f.y + dy)) ?? 0)); if (v > bv) { bv = v; best = [dx, dy]; } }
    if (!best) return 1 + Math.floor(f.brain.rand() * 4);
    const [dx, dy] = best; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 2 : 4) : (dy > 0 ? 3 : 1);
  }
  step() {
    const cfg = this.cfg, N = cfg.size;
    if (this.tick >= this.ruleEnds) { this.nextRule(); this.redrawCodes(); this.lastSwitch = this.tick; }
    // Headroom instrument (H3) only: memOracle flies forget fast for 300 ticks after each rule switch.
    for (const f of this.flies) { const o = f.brain.program.memOracle; if (o) f.brain.genes.tasteMemory = this.lastSwitch !== undefined && this.tick - this.lastSwitch < 300 ? o.fast : o.slow;
      // Headroom instrument (H4) only: regimeOracle knows whether the current rule epoch is volatile (< 300 ticks).
      const ro = f.brain.program.regimeOracle; if (ro) f.brain.genes.tasteMemory = this.cfg.ruleSchedule[this.ruleIndex][1] < 300 ? ro.volatile : ro.calm; }
    if (this.cfg.dualFood) { if (this.tick && this.tick % this.cfg.dualFood.every === 0) this.habitatRule(); else if (this.tick && this.tick % cfg.shiftEvery === 0) this.habitatCodes();
      for (const f of this.flies) { const dO = f.brain.program.dietOracle; if (dO) { const n = f.dietN ?? 0; f.brain.genes.tasteMemory = n >= 5 && (f.dietLeaf ?? 0) / n > .5 ? dO.leafy : dO.fruity; } } }
    if (this.cfg.habitats) { if (this.tick && this.tick % this.cfg.habitats.every === 0) this.habitatRule(); else if (this.tick && this.tick % cfg.shiftEvery === 0) this.habitatCodes();
      for (const f of this.flies) { const ho = f.brain.program.habitatOracle; if (ho) f.brain.genes.tasteMemory = this.isVol(f.x) ? ho.volatile : ho.calm; } }
    if (this.tick % cfg.shiftEvery === 0 && this.tick) this.redrawCodes();
    if (this.tick % cfg.relocateEvery === 0 && this.tick) { const i = Math.floor(this.r() * cfg.patches); for (let k = 0; k < this.plant.length; k++) if (this.plant[k]?.patch === i) this.plant[k] = null; this.patchCenters[i] = this.randomCenter(); this.seedPatch(i); }
    for (const p of this.plant) if (p) p.amount = Math.min(cfg.plantCap, p.amount + cfg.regrow);
    const occupancy = new Map(); for (const f of this.flies) { const k = this.cell(f.x, f.y); occupancy.set(k, (occupancy.get(k) ?? 0) + 1); }
    const order = this.flies.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const born = [];
    for (const i of order) {
      const f = this.flies[i], b = f.brain, e0 = f.energy;
      // Expected value of eating each kind for this fly (0 if it would refuse it): drives smell-guided movement.
      const goodPred = this.codes.map(bits => { const p = tastePredict(b, bits); return p > (b.genes.acceptAt ?? .5) ? p - (1 - p) * cfg.toxin : 0; });
      if (cfg.habitats || cfg.dualFood) this.gp2 = this.codes2.map(bits => { const p = tastePredict(b, bits); return p > (b.genes.acceptAt ?? .5) ? p - (1 - p) * cfg.toxin : 0; });
      const needTarget = b.move.masks.some(m => m & 1 << 8) || b.program.moveRevise, target = needTarget ? this.bestTarget(f, goodPred, occupancy) : null;
      const bases = MOVES.map((_, d) => this.moveFeatures(f, goodPred, d, occupancy, target));
      const qs = bases.map(base => moveValue(b, base));
      moveLearn(b, b.move.pending?.reward ?? 0); // complete the previous move with its observed reward
      const qmax = Math.max(...qs), ties = qs.map((q, d) => q >= qmax - 1e-9 ? d : -1).filter(d => d >= 0);
      let dir = ties[Math.floor(b.rand() * ties.length)]; if (b.rand() < b.genes.eps) dir = Math.floor(b.rand() * MOVES.length);
      if (b.program.movePlanner) dir = this.plan(f, goodPred, occupancy); // measuring instrument only (headroom check)
      b.move.pending = { base: bases[dir], phi: movePhi(b, bases[dir]) };
      const from = this.cell(f.x, f.y); occupancy.set(from, occupancy.get(from) - 1);
      f.x = (f.x + MOVES[dir][0] + N) % N; f.y = (f.y + MOVES[dir][1] + N) % N;
      const to = this.cell(f.x, f.y); occupancy.set(to, (occupancy.get(to) ?? 0) + 1);
      f.energy -= cfg.metabolism + (dir ? cfg.moveCost : 0) + cfg.brainCost * (b.taste.masks.length + b.move.masks.length);
      const p = this.plant[to];
      if (p && p.amount > .2) {
        const vol = (cfg.habitats && this.isVol(f.x)) || (cfg.dualFood && p.kind >= KINDS / 2), bits = (vol ? this.codes2 : this.codes)[p.kind];
        if (tastePredict(b, bits) > (b.genes.acceptAt ?? .5) || b.rand() < (b.genes.tasteEps ?? 0)) {
          if (cfg.dualFood) { f.dietN = (f.dietN ?? 0) * .98 + 1; f.dietLeaf = (f.dietLeaf ?? 0) * .98 + (p.kind >= KINDS / 2 ? 1 : 0); }
          const take = Math.min(p.amount, cfg.bite); p.amount -= take; const good = (vol ? this.kindValence2 : this.kindValence)[p.kind] > 0;
          { const dE = good ? take : -take * cfg.toxin * (f.toxinMul ?? 1); f.energy += dE; f.feedWin = (f.feedWin ?? 0) + dE; if (!good) { f.dmgSum = (f.dmgSum ?? 0) - dE; f.badTake = (f.badTake ?? 0) + take; } } good ? f.eaten.good++ : f.eaten.bad++; f.tastings++;
          tasteLearn(b, bits, (good ? 1 : 0) ^ (this.r() < (f.noise ?? cfg.labelNoise) ? 1 : 0));
        }
      }
      f.energy = Math.min(cfg.maxEnergy, f.energy); f.age++;
      // P13b A2: in-life trial-and-revert on acceptAt from own feeding outcome over W-tick windows.
      const mA = b.program.metaA, W = b.program.metaW ?? 100;
      // A2 attempt 2 ('ev'): set acceptAt by the expected-value rule from the fly's OWN measured toxin cost per bite;
      // 'evsham': same rule fed a cost drawn at birth from the same two possibilities, independent of the fly's body.
      if ((mA === 'ev' || mA === 'evsham') && f.age % W === 0) { let c;
        if (mA === 'ev') c = f.badTake ? f.dmgSum / f.badTake : cfg.toxin;
        else { if (f.shamCost === undefined) { const [lo, hi] = cfg.toxinNiche ?? [1, 1]; f.shamCost = cfg.toxin * (b.rand() < .5 ? lo : hi); } c = f.badTake ? f.shamCost : cfg.toxin; }
        const a = b.program.riskAversion ?? 1; b.genes.acceptAt = b.program.evPrior && !f.badTake ? b.program.genes.acceptAt : a * c / (1 + a * c); }
      else if (mA && f.age % W === 0) { const win = f.feedWin ?? 0; f.feedWin = 0; const tr = f.accTrial;
        if (tr) { const keep = mA === 'trial' ? win > tr.base : b.rand() < .5; if (!keep) b.genes.acceptAt = tr.old; f.accTrial = null; }
        else { const old = b.genes.acceptAt; gridStep(b.genes, 'acceptAt', ACCEPT_GRID, b.rand() < .5 ? -1 : 1); if (b.genes.acceptAt !== old) f.accTrial = { old, base: win }; } }
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
