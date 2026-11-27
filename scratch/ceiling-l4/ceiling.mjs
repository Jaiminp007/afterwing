// Oracle ceiling screen (Fable checkpoint ruling, scratch/judge-fable-checkpoint3/ruling.md).
// Screen-only, on the already-exposed tuning seeds of each blind family. Every fly's readout
// weights are set to the best linear fit of the CURRENT true food value (least squares over a
// fixed sample of 512 odor codes, refreshed whenever the world changes, at most every 5 ticks).
// No learning; this upper-bounds any linear-readout learner (any depth) in this harness.
// usage: node scratch/ceiling-l4/ceiling.mjs <world module> <lo>-<hi>
import { WorldL4H, rng32 } from '../../microverse/l4h.mjs';
import * as A from '../../microverse/l4i-arms.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [wpath, range] = process.argv.slice(2);
const W = await import(pathToFileURL(path.resolve(wpath)).href);
const [lo, hi] = range.split('-').map(Number);
const D = 16, rs = rng32(12345), S = Array.from({ length: 512 }, () => Int8Array.from({ length: D }, () => rs() < .5 ? -1 : 1));
function fit(rule) { // least squares w minimizing sum (v - w.b)^2 over S (normal equations, Cholesky)
  const A2 = new Float64Array(D * D), bv = new Float64Array(D);
  for (const b of S) { const v = rule.value(b); for (let i = 0; i < D; i++) { bv[i] += v * b[i]; for (let j = 0; j < D; j++) A2[i * D + j] += b[i] * b[j]; } }
  const L = new Float64Array(D * D);
  for (let i = 0; i < D; i++) for (let j = 0; j <= i; j++) { let s = A2[i * D + j]; for (let k = 0; k < j; k++) s -= L[i * D + k] * L[j * D + k]; L[i * D + j] = i === j ? Math.sqrt(s) : s / L[j * D + j]; }
  const y = new Float64Array(D), w = new Float64Array(D);
  for (let i = 0; i < D; i++) { let s = bv[i]; for (let k = 0; k < i; k++) s -= L[i * D + k] * y[k]; y[i] = s / L[i * D + i]; }
  for (let i = D - 1; i >= 0; i--) { let s = y[i]; for (let k = i + 1; k < D; k++) s -= L[k * D + i] * w[k]; w[i] = s / L[i * D + i]; }
  return w;
}
const oracleArm = { kind: 'lms', alpha: 0, name: 'ORACLE_W' };
const out = [];
for (let seed = lo; seed <= hi; seed++) {
  const w = new WorldL4H(seed, oracleArm, W, A, {});
  let wStar = fit(w.rule), last = 0, popSum = 0, n = 0;
  const origStep = w.rule.step.bind(w.rule); let dirty = false;
  w.rule.step = t => { const c = origStep(t); if (c) dirty = true; return c; };
  for (let t = 0; t < w.cfg.ticks; t++) {
    if (dirty && w.tick - last >= 5) { wStar = fit(w.rule); last = w.tick; dirty = false; }
    for (const f of w.flies) { if (f.L.w !== wStar) { f.L.w.set(wStar); f.wDirty = true; } }
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; n++; }
  }
  out.push(popSum / n);
}
console.log(JSON.stringify({ world: wpath, seeds: range, mean: out.reduce((a, b) => a + b) / out.length, perSeed: out }));
