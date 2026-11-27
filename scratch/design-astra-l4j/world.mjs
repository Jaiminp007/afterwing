import { mix, rng32, randn } from '../../microverse/l4h.mjs';

export const D = 16, G = 40, GENERATIONS = 48, LATE = 24, B = 25;
export const H = .12, SWITCH = .33, SD = .75;
// Fix the fourth column sign at +1. Flipping that column complements all seven bits.
export const FLIP = [1, 2, 4, 8, 16, 32, 64, 127];
export const LINES = Array.from({ length: 8 }, (_, a) => Array.from({ length: 4 }, (_, k) =>
  a < 4 ? a * 4 + k : k * 4 + a - 4));
export const SIGN = Array.from({ length: D }, (_, i) => Int8Array.from({ length: 128 }, (_, s) =>
  ((s >> (i >> 2)) ^ ((i % 4 === 3) ? 0 : (s >> (4 + i % 4)))) & 1 ? -1 : 1));

export function createWorld(seed, dim) {
  if (dim !== D) throw Error('4 by 4 sites required');
  const r = rng32(seed);
  let state = Math.floor(r() * 128), axis = +(r() < .5), events = 0, changes = 0;
  return {
    step(tick) {
      if (tick % G === 0 && r() < SWITCH) { axis ^= 1; changes++; }
      if (r() >= H) return false;
      state ^= FLIP[4 * axis + Math.floor(4 * r())]; events++; return true;
    },
    value(bits) {
      for (let i = 0; i < D; i++) if (bits[i]) return bits[i] * SIGN[i][state];
      throw Error('empty odor');
    },
    noiseSd: () => SD,
    // Harness instrumentation; non-oracle learners do not receive this object.
    get axis() { return axis; }, get events() { return events; }, get changes() { return changes; },
  };
}

const codes = Array.from({ length: D }, (_, i) => Int8Array.from({ length: D }, (_, j) => +(i === j)));
export function run(seed, spec, make) {
  if (!Number.isInteger(seed) || seed < 952001 || seed > 952032) throw Error('seed outside screen');
  const world = createWorld(mix(seed ^ 0x52554c45), D);
  let born = 0, bites = 0, correct = 0, writes = 0, tested = 0;
  const birth = pack => {
    if (pack && (pack.length > B || !pack.every(Number.isFinite))) throw Error('heredity');
    const id = ++born;
    return { L: make(spec, pack, rng32(mix(seed ^ Math.imul(id, 7919) ^ 0x6c656172))),
      r: rng32(mix(seed ^ Math.imul(id, 104729) ^ 0x666c79)), hits: 0 };
  };
  let flies = Array.from({ length: 48 }, () => birth(null));
  const pops = [], axes = [], hits = [], counts = [], values = new Int8Array(D);
  for (let g = 0; g < GENERATIONS; g++) {
    let gh = 0;
    for (let t = 0; t < G; t++) {
      const tick = g * G + t;
      if ((tick && world.step(tick)) || !tick) for (let i = 0; i < D; i++) values[i] = world.value(codes[i]);
      for (const f of flies) {
        const site = Math.floor(f.r() * D), tie = f.r() < .5 ? -1 : 1;
        const score = f.L.predict(site);
        if (!Number.isFinite(score)) throw Error('bad prediction');
        const action = Math.sign(score) || tie, real = action * values[site];
        // A signed Gaussian is still Gaussian. This coupling gives all policies the same
        // demodulated noisy taste when they choose opposite fruits on the same encounter.
        const taste = real + action * world.noiseSd() * randn(f.r);
        f.L.observe(site, action * taste, spec.kind === 'oracle' ? world.axis : undefined);
        if (real > 0) { f.hits++; gh++; }
      }
    }
    const n = flies.length, children = [];
    for (const f of flies) {
      const clutch = Math.floor((.5 + 3 * f.hits / G) / (1 + n / 32) + f.r());
      const pack = clutch ? f.L.inherit() : null;
      for (let k = 0; k < clutch; k++) children.push(birth(pack));
      writes += f.L.writes ?? 0; tested += f.L.tested ?? 0;
    }
    flies = children;
    bites += n * G; correct += gh; axes.push(world.axis); pops.push(flies.length);
    counts.push(n * G); hits.push(gh);
  }
  return {seed, arm: spec.name, pops, axes, hits, counts, popSum: pops.slice(LATE).reduce((a,b) => a+b,0),
    nLate: GENERATIONS-LATE, bites, correct, born, writes, tested, events: world.events, switches: world.changes};
}
