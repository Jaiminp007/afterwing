// Smoke-test world ONLY (not the blind family). Linear rule, random-walk drift.
import { rng32, randn } from '../../microverse/l4h.mjs';
export function createWorld(seed, D) {
  const r = rng32(seed), w = Float64Array.from({ length: D }, () => randn(r) * .6);
  return { step(t) { if (t % 50) return false; for (let i = 0; i < D; i++) w[i] += .05 * randn(r); return true; },
    value(b) { let s = 0; for (let i = 0; i < D; i++) s += w[i] * b[i]; return s; }, noiseSd: () => 1 };
}
