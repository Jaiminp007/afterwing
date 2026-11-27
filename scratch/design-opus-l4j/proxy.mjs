// Fast non-ecological proxy for the ORBIT screen: one lineage of sequential lives on a world stream.
// Loss = pre-update squared prediction error of value (noise-free target) on bitten random codes.
import { createWorld } from './world-orbit.mjs';
import { MAKERS } from './proxy-learners.mjs';
const D = 16;
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const randn = r => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// arm: { kind, ...cfg, betaOf?: (regime) => beta }   returns { loss, err, perReg: Map(reg -> [loss, n]) }
export function proxyRun(seed, arm, opts = {}) {
  const W = createWorld(seed, D, opts.world);
  const r = rng(seed ^ 0x5eed), life = opts.life ?? 1300, pb = opts.pb ?? .5, ticks = opts.ticks ?? 20000, from = opts.from ?? 10000;
  let L = null, born = 0, st = null, loss = 0, err = 0, n = 0;
  const perReg = new Map(), x = new Int8Array(D);
  for (let t = 1; t <= ticks; t++) {
    W.step(t);
    if (!L || t - born >= life) { st = L ? L.inherit() : null; L = MAKERS[arm.kind](arm, D, st); born = t; }
    const reg = W.describe().regime;
    if (arm.betaOf) L.setBeta(arm.betaOf(reg, W.describe()));
    if (r() < pb) {
      for (let i = 0; i < D; i++) x[i] = r() < .5 ? -1 : 1;
      const v = W.value(x), y = v + W.noiseSd() * randn(r);
      let p = 0; for (let i = 0; i < D; i++) p += L.w[i] * x[i];
      if (t > from) { const l = (p - v) ** 2; loss += l; err += (p > 0) !== (v > 0) ? 1 : 0; n++; const a = perReg.get(reg) ?? [0, 0]; a[0] += l; a[1]++; perReg.set(reg, a); }
      L.learn(x, y, t);
    }
  }
  return { loss: loss / n, err: err / n, perReg };
}
