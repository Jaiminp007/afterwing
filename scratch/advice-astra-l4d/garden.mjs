import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mix, rng32 } from '../../microverse/l4.mjs';

export const floor = 1 / 128;
const clip = a => Math.min(1, Math.max(floor, a));
const hazard = 1 / 384, flip = [.0008, .065], err = [.32, .04];
const T = 20000, last = 10000, families = 4;
const roleOf = k => k >>> 1, signOf = k => (k & 1) ? 1 : -1;
const mu = k => signOf(k) * (1 - 2 * err[roleOf(k)]);
const q = [0, 1, 2, 3].map(mu);
const matrices = new Map();

// A row distribution over (role, sign) evolves by right multiplication.
export function model(scale) {
  if (matrices.has(scale)) return matrices.get(scale);
  const P = new Float64Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const p = roleOf(i) === roleOf(j) ? 1 - scale * hazard : scale * hazard;
    const f = scale * flip[roleOf(j)];
    P[i * 4 + j] = p * (signOf(i) === signOf(j) ? 1 - f : f);
  }
  let v = [...q];
  for (let n = 0; n < 160; n++) v = q.map((_, i) => q.reduce((s, x, j) =>
    s + P[4 * i + j] * (.25 * x + .75 * v[j]), 0));
  const powers = [Float64Array.from({ length: 16 }, (_, i) => +(i % 5 === 0)), P];
  const m = { P, v, at(n) {
    while (powers.length <= n) {
      const a = powers.at(-1), c = new Float64Array(16);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) c[4 * i + j] += a[4 * i + k] * P[4 * k + j];
      }
      powers.push(c);
    }
    return powers[n];
  } };
  matrices.set(scale, m);
  return m;
}

const schedules = new Map();
export function schedule(seed) {
  assert(Number.isInteger(seed) && seed >= 3101 && seed <= 3132);
  if (schedules.has(seed)) return schedules.get(seed);
  const r = rng32(mix(seed ^ 0x574f524c)), masks = [3, 5, 6, 9, 10, 12];
  let roles = masks[Math.floor(r() * 6)], signs = Math.floor(r() * 16), swaps = 0;
  const path = new Uint8Array(T * families);
  for (let t = 0; t < T; t++) {
    if (t && r() < hazard) { roles ^= 15; swaps++; }
    for (let j = 0; j < 4; j++) {
      const role = (roles >> j) & 1;
      if (t && r() < flip[role]) signs ^= 1 << j;
      path[4 * t + j] = 2 * role + ((signs >> j) & 1);
    }
  }
  const out = {path, swaps, hash: createHash('sha256').update(path).digest('hex')};
  schedules.set(seed, out);
  return out;
}

export function init(c, j, parent, genotype) {
  const a0 = c.mask === undefined ? c.a : ((c.mask >>> j) & 1) ? c.high : c.a;
  return {
    w: 0, a: parent?.a ?? a0, h: 0, norm: parent?.norm ?? 0,
    score: c.k === 'reset' ? 0 : parent?.score ?? 0,
    abs: c.k === 'reset' ? 0 : parent?.abs ?? 0,
    predLow: NaN, predHigh: NaN, gene: genotype,
    bel: c.k === 'bayes' ? parent ? parent.bel.slice() : new Float64Array(4).fill(.25) : null,
    t: parent?.t ?? -1
  };
}
const idbdRate = (a, g, theta) => clip(a * Math.exp(Math.min(20, Math.max(-20, theta * g))));
function projected(w, y, goal) { return w === y ? floor : clip((goal - w) / (y - w)); }
function bayes(s, y, t, m) {
  const P = m.at(s.t < 0 ? 0 : t - s.t), b = s.bel;
  const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  let z = 0, tgt = 0;
  for (let j = 0; j < 4; j++) {
    b[j] = (b0 * P[j] + b1 * P[4+j] + b2 * P[8+j] + b3 * P[12+j]) * (1 + y * q[j]) / 2;
    z += b[j]; tgt += b[j] * m.v[j];
  }
  for (let j = 0; j < 4; j++) b[j] /= z;
  s.t = t;
  return projected(s.w, y, tgt / z);
}

// Non-oracles receive no environment state. All forward predictions use the same w.
export function update(s, y, t, c, goal) {
  const d = y - s.w, g = d * s.h;
  let a = s.a;
  switch (c.k) {
    case 'null': return;
    case 'fixed': break;
    case 'idbd': a = idbdRate(a, g, c.theta); break;
    case 'auto': {
      const z = Math.abs(g);
      s.norm = Math.max(z, s.norm + a / c.tau * (z - s.norm));
      a = idbdRate(a, s.norm ? g / s.norm : 0, c.theta);
      break;
    }
    case 'rms':
      s.norm = c.decay * s.norm + (1 - c.decay) * d * d;
      a = clip(c.scale / Math.sqrt(s.norm + .000001));
      break;
    case 'bayes': a = bayes(s, y, t, c.model); break;
    case 'full': a = projected(s.w, y, goal); break;
    default: {
      if (Number.isFinite(s.predLow)) {
        const diff = (s.predLow - y) ** 2 - (s.predHigh - y) ** 2;
        s.score = .9 * s.score + diff;
        s.abs = .9 * s.abs + Math.abs(diff);
      }
      const l = idbdRate(a, g, c.theta / c.span), m = idbdRate(a, g, c.theta), h = idbdRate(a, g, c.theta * c.span);
      s.predLow = s.w + l * d;
      s.predHigh = s.w + h * d;
      if (c.k === 'oracle') {
        a = m;
        if (Math.abs(s.predLow - goal) < Math.abs(s.w + a * d - goal)) a = l;
        if (Math.abs(s.predHigh - goal) < Math.abs(s.w + a * d - goal)) a = h;
      } else if (c.k === 'evo') {
        a = s.gene === 0 ? m : s.gene === 1 ? l : h;
      } else if (c.k === 'sham') {
        a = (l + m + h) / 3;
      } else if (c.k === 'direct') {
        let z = s.abs ? Math.sign(g) * s.score / s.abs : 0;
        if (!c.soft) z = Math.sign(z);
        a = c.low * Math.exp((1 + z) / 2 * Math.log(c.high / c.low));
      } else {
        assert(c.k === 'meta' || c.k === 'reset' || c.k === 'off');
        a = s.score > 0 ? h : s.score < 0 ? l : m;
      }
    }
  }
  s.a = a;
  const applied = c.k === 'off' ? c.fixed : a;
  s.w += applied * d;
  s.h = (1 - a) * s.h + a * d;
}

export function run(seed, c, ticks = T) {
  const env = schedule(seed), v = model(1).v;
  if (c.k === 'bayes') c = {...c, model:model(c.scale)};
  const isOracle = c.k === 'oracle' || c.k === 'full';
  let id = 0, births = 0, deaths = 0, samples = 0, popSum = 0, atCap = 0, feedGain = 0;
  let alphaChanges = 0, counterfactuals = 0, paid = 0, popPath = 2166136261;
  const err2 = [0, 0], seen = [0, 0], rate = [0, 0];
  const spawn = (p, t) => {
    const i = ++id, key = mix(seed ^ Math.imul(i, 0x27d4eb2d));
    const r = rng32(key), mut = rng32(mix(key ^ 0x4d555441));
    const x = Array.from({length:4}, (_, j) => {
      let gene = 0;
      if (c.k === 'evo' && c.pm >= 0) {
        gene = p ? p.x[j].gene : (i - 1 + Math.floor(j === 0 ? 0 : mix(seed ^ j ^ Math.floor((i-1)/3)) / 4294967296 * 3)) % 3;
        if (p && mut() < c.pm) gene = (gene + 1 + Math.floor(mut() * 2)) % 3;
      }
      return init(c, j, p?.x[j], gene);
    });
    return {x, r, start:t, energy:p ? 4 : 6};
  };
  let flies = Array.from({length:60}, () => spawn(null, 0));
  for (let t = 0; t < ticks; t++) {
    const upkeep = .04 + flies.length * .0012, next = [], born = [];
    const late = t >= last;
    for (const f of flies) {
      const j = (f.r() * 4) | 0, pol = f.r() < .5 ? -1 : 1;
      const k = env.path[4*t + j], role = roleOf(k), u = f.r();
      const canonical = signOf(k) * (f.r() < err[role] ? -1 : 1);
      const s = f.x[j], pred = (1 + pol * s.w) * .5, take = pred > u;
      const net = take ? (1 + pol * canonical) * .5 - u : 0;
      f.energy += net - upkeep;
      const old = s.a;
      if (late) {
        seen[role]++; err2[role] += ((s.w - q[k]) / 2) ** 2; feedGain += net;
        if (take) paid++;
        if (Number.isFinite(s.predLow)) counterfactuals++;
      }
      update(s, canonical, t, c, isOracle ? v[k] : undefined);
      if (late) { rate[role] += s.a; if (s.a !== old) alphaChanges++; }
      if (f.energy >= 10 && flies.length + born.length < 400) {
        f.energy -= 4.5;
        born.push(spawn(f, t + 1)); births++;
      }
      if (f.energy > 0 && t + 1 - f.start < 512) next.push(f); else deaths++;
    }
    flies = next.concat(born);
    popPath = Math.imul(popPath ^ flies.length, 16777619) >>> 0;
    if (flies.length >= 400) atCap++;
    if (t + 1 > last && (t + 1) % 100 === 0) { samples++; popSum += flies.length; }
  }
  assert.equal(60 + births - deaths, flies.length);
  if (ticks === T) assert.equal(samples, 100);
  return {seed, popSum, popPath, samples, end:flies.length, births, deaths, atCap, seen, err2, rate,
    feedGain, paid, alphaChanges, counterfactuals, schedule:env.hash, swaps:env.swaps};
}
