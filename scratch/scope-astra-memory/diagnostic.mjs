import assert from 'node:assert/strict';
import { BASE_CFG, WorldL4H, mix } from '../../microverse/l4h.mjs';
import * as H from '../../microverse/l4h-worlds.mjs';
import * as I1 from '../../microverse/l4i-world-1.mjs';
import * as I2 from '../../microverse/l4i-world-2.mjs';
import * as I3 from '../../microverse/l4i-world-3.mjs';

const worlds = [H, I1, I2, I3];
const D = 16, K = 8, BLOCK = 8, SEG = 64;
export const arms = ['RAW', 'LAG', 'MEM_LOCAL', 'MEM', 'LAST', 'LOCAL20', 'G0', 'G20', 'G50', 'G80'];
export function family(seed) {
  const f = Math.floor(seed / 1000) - 939;
  assert(Number.isInteger(seed) && f >= 0 && f < 4 && seed % 1000 >= 1 && seed % 1000 <= 16);
  return f;
}
const dot = (a, b) => {
  let x = 0; for (let i = 0; i < D; i++) x += a[i] * b[i]; return x;
};

// Deterministic quadrature, not ecology seeds. Mix the 64 indices; use antithetic pairs.
const codes = Array.from({ length: 128 }, (_, n) => {
  const m = mix(n >> 1) ^ (n % 2 ? 65535 : 0);
  return Int8Array.from({ length: D }, (_, i) => (m >> i) & 1 ? 1 : -1);
});
function signature(rule) {
  const s = Float64Array.from(codes, b => rule.value(b));
  return s;
}
function ss(a, b) {
  let z = 0; for (let i = 0; i < a.length; i++) z += (a[i] - b[i]) ** 2; return z;
}
function norm2(a) {
  let z = 0; for (const x of a) z += x * x; return z;
}
// A true change is a material boundary once it has moved 50% of initial RMS from
// the last boundary. Quantize the new anchor to a historical prototype within 35%.
// Only the label passes into the oracle. Its stored readouts must come from bites.
function plan(seed) {
  const rule = worlds[family(seed)].createWorld(mix(seed ^ 0x52554c45), D);
  const raw = new Uint8Array(BASE_CFG.ticks), key = new Int32Array(BASE_CFG.ticks).fill(-1);
  let anchor = signature(rule), id = 0, events = 0, nRaw = 0, returns = 0;
  const unit = norm2(anchor), known = [anchor];
  for (let t = 1; t < raw.length; t++) {
    if (!rule.step(t)) continue;
    raw[t] = 1; nRaw++;
    const v = signature(rule);
    if (ss(v, anchor) < .5 ** 2 * unit) continue;
    let d = Infinity, j = -1;
    for (let k = 0; k < known.length; k++) {
      const s = ss(v, known[k]); if (s < d) { d = s; j = k; }
    }
    if (d > .35 ** 2 * unit) { j = known.length; known.push(v); }
    else if (j !== id) returns++;
    anchor = v; id = j; key[t] = id; events++;
  }
  return { raw, key, diagnostic: { nRaw, events, prototypes: known.length, returns } };
}
const plans = new Map();
function getPlan(seed) {
  if (!plans.has(seed)) plans.set(seed, plan(seed));
  return plans.get(seed);
}

// Same operation order as kalmanCore, with an explicit reset and symmetric P storage.
function kalman(R) {
  const w = new Float64Array(D), P = new Float64Array(D * D), px = new Float64Array(D);
  let pending = 1;
  function reset(v) {
    if (v) w.set(v); else w.fill(0);
    pending = v ? .05 : 1;
  }
  function update(x, y, p) {
    if (pending) {
      P.fill(0); for (let i = 0; i < D; i++) P[i * D + i] = pending;
      pending = 0;
    }
    for (let i = 0; i < D; i++) P[i * D + i] += .001;
    let S = R;
    for (let i = 0; i < D; i++) {
      let z = 0;
      for (let j = 0; j < D; j++) z += P[i * D + j] * x[j];
      px[i] = z; S += z * x[i];
    }
    for (let i = 0; i < D; i++) w[i] += px[i] * (y - p) / S;
    for (let i = 0; i < D; i++) for (let j = i; j < D; j++)
      P[j * D + i] = P[i * D + j] -= px[i] * px[j] / S;
  }
  return { w, reset, update };
}

function factory(arm, R, stats, current) {
  const keyed = arm === 'MEM' || arm === 'MEM_LOCAL';
  const flat = arm[0] === 'G' || arm === 'LOCAL20';
  const gate = (arm === 'LOCAL20' ? 20 : Number(arm.slice(1))) / 100;
  return { makeLearner(_, __, parent) {
    const k = kalman(R), w = k.w;
    let age = 0, count = 0, id = current.id, activeLoss = 0;
    // Snapshot vectors are immutable. Map/array membership and all losses are private.
    const map = keyed ? new Map(parent) : null;
    const bank = flat && parent ? parent.slice() : [];
    const loss = new Float64Array(K);
    function savedMap() {
      const b = new Map(map); if (count >= BLOCK) b.set(id, w.slice()); return b;
    }
    function stored(v) {
      bank.push(v); if (bank.length > K) bank.shift();
    }
    function change(next) {
      if (keyed) {
        if (count >= BLOCK) map.set(id, w.slice());
        const v = map.get(next);
        k.reset(v);
        if (v) stats.eventRecall++;
      } else k.reset(null);
      id = next; count = 0;
    }
    return { w, change,
      learn(x, y) {
        if (!age && (keyed || arm === 'LAST')) {
          const v = keyed ? map.get(id) : parent;
          if (v) { k.reset(v); stats.birthRecall++; }
        }
        const p = dot(w, x);
        if (flat) {
          activeLoss += (y - p) ** 2;
          for (let i = 0; i < bank.length; i++) loss[i] += (y - dot(bank[i], x)) ** 2;
        }
        k.update(x, y, p); age++; count++;
        if (!flat || age % BLOCK) return;
        let best = -1, v = (1 - gate) * activeLoss;
        for (let i = 0; i < bank.length; i++) if (loss[i] < v) { best = i; v = loss[i]; }
        // Prediction/loss are prequential. A switch here affects only future meals.
        if (best >= 0) {
          k.reset(bank[best]); stats.switches++;
          if (age === BLOCK) stats.firstBlock++;
          if (best < bank.length - 1) stats.older++;
        }
        if (age % SEG === 0) stored(w.slice());
        loss.fill(0); activeLoss = 0;
      },
      inherit() {
        if (arm === 'MEM') return savedMap();
        if (arm === 'LAST') return age >= BLOCK ? w.slice() : null;
        if (arm[0] === 'G') {
          const b = bank.slice();
          if (age >= BLOCK) b.push(w.slice());
          return b.slice(-K);
        }
        return null;
      },
    };
  } };
}

export function run(seed, arm, ticks = BASE_CFG.ticks) {
  const f = family(seed); assert(arms.includes(arm) || arm === 'FIXED');
  const stats = { eventRecall: 0, birthRecall: 0, switches: 0, older: 0, firstBlock: 0 };
  const oracle = ['RAW', 'LAG', 'MEM', 'MEM_LOCAL'].includes(arm);
  const clock = oracle ? getPlan(seed) : null;
  const current = { id: 0 };
  const M = factory(arm, f ? .5 : 2, stats, current);
  const w = new WorldL4H(seed, arm, worlds[f], M);
  if (oracle) {
    const step = w.rule.step.bind(w.rule);
    w.rule.step = t => {
      const changed = step(t);
      assert.equal(!!changed, !!clock.raw[t]);
      if (arm === 'RAW' ? changed : clock.key[t] >= 0) {
        current.id = clock.key[t];
        for (const fly of w.flies) { fly.L.change(current.id); fly.wDirty = true; }
      }
      return changed;
    };
  }
  const halves = [0, 0]; let nLate = 0, skillSum = 0;
  while (w.tick < ticks) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) {
      halves[+(w.tick > 15000)] += w.flies.length; skillSum += w.skill(); nLate++;
    }
  }
  return { seed, arm, ticks, halves, nLate, popSum: halves[0] + halves[1],
    skillSum, finalPop: w.flies.length, ...w.tel, ...stats, clock: clock?.diagnostic };
}

export { worlds, kalman, getPlan, dot };
