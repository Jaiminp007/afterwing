import assert from 'node:assert/strict';
import * as A from '../../microverse/l4h-arms.mjs';
import { rng32, runOne } from '../../microverse/l4h.mjs';
import * as toy from '../explore-claude-l4h/toyworld.mjs';
import { DEPTH2_EXTRA, register } from './classf.mjs';

register(A);
const h = A.L3GRID[0], evo = A.EVOGRID.at(-1), D = 16;
const newLearner = (a, st = null) => A.makeLearner(a, D, st, rng32(6001));
const tol = 1e-11;
const tape = [[0x9a36, 2], [0x9a36, -1], [0x0855, .2], [0x65c9, 1.5],
  [0x3219, -2.9], [0xf938, .4], [0xab2f, 3], [0x0003, -1.4]]
  .map(([mask, y]) => [Int8Array.from({ length: D }, (_, i) => mask & (1 << i) ? 1 : -1), y]);
const feed = L => { for (const [x, y] of tape) L.learn(x, y); };
const configs = JSON.parse(JSON.stringify(DEPTH2_EXTRA));
assert.equal(new Set(configs.map(a => a.name)).size, configs.length);
for (const arm of configs) {
  const plain = newLearner(arm), fast = newLearner(arm);
  fast.setRate(plain.rateInit + .7);
  feed(plain); feed(fast);
  assert(plain.w.some((v, i) => Math.abs(v - fast.w[i]) > tol), arm.name + ': no rate effect');
  for (const a of [arm, A.meta3(arm, h), ...A.controls(arm, h, evo)]) {
    const parent = newLearner(a);
    for (let i = 0; i < 6; i++) feed(parent);
    const st = parent.inherit(), snapshot = [...st], child = newLearner(a, st);
    assert(st instanceof Float64Array && st.every(Number.isFinite));
    assert.equal(st.length, plain.inherit().length + Number(a.kind === 'l3'));
    assert(st.length <= 2 + Number(a.kind === 'l3'));
    assert(child.w.every(v => v === 0), a.name + ': inherited weights');
    feed(child);
    assert(child.w.every(Number.isFinite) && child.w.some(v => v !== 0));
    assert.deepEqual([...st], snapshot);
    assert.deepEqual([...parent.inherit()], snapshot);
  }
}
const dir = configs.find(a => a.kind === 'dirRLS'), first = newLearner(dir);
first.learn(...tape[0]);
for (let i = 0; i < D; i++) assert(Math.abs(first.w[i] - tape[0][0][i] * 2 / (D + dir.lambda)) < tol);
console.log(`PASS: ${configs.length} JSON configs, real rate effect, bare/learn/both shams/reset/evo birth contracts`);

// Independent dense two-branch reference. No aliasing, use the second-moment
// identity E[ww'] - E[w]E[w]' rather than the library's centered covariance.
function checkSwitch() {
  const arm = { kind: 'kalSW', p0: .7, h: .12, R: .9, rho: .08, inheritL2: true };
  const n = 3, L = A.makeLearner(arm, n, null, rng32(6001));
  const matrix = fn => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => fn(i, j)));
  const diag = v => matrix((i, j) => i === j ? v : 0);
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  let u = [0, 0, 0], C = diag(arm.p0), lp = Math.log(arm.p0), max = 0;
  for (let rep = 0; rep < 5; rep++) for (const [bits, y] of tape) {
    const x = [...bits.slice(0, n)];
    function posterior(m, P) {
      const t = P.map(row => dot(row, x)), S = arm.R + dot(x, t), e = y - dot(m, x);
      return { m: m.map((v, i) => v + t[i] * e / S),
        C: matrix((i, j) => P[i][j] - t[i] * t[j] / S),
        density: Math.exp(-e * e / (2 * S)) / Math.sqrt(S), S };
    }
    const a = posterior(u, C), b = posterior([0, 0, 0], diag(Math.exp(lp)));
    const t = arm.h * b.density / ((1 - arm.h) * a.density + arm.h * b.density);
    u = a.m.map((v, i) => (1 - t) * v + t * b.m[i]);
    C = matrix((i, j) => (1 - t) * (a.C[i][j] + a.m[i] * a.m[j]) +
      t * (b.C[i][j] + b.m[i] * b.m[j]) - u[i] * u[j]);
    lp = Math.max(Math.log(.001), Math.min(Math.log(10), lp + arm.rho * t * (Math.SQRT1_2 - Math.exp(-y * y / (2 * b.S)))));
    L.learn(x, y);
    max = Math.max(max, ...u.map((v, i) => Math.abs(v - L.w[i])), Math.abs(lp - L.inherit()[0]));
  }
  assert(max < tol, `kalSW discrepancy ${max}`);
  console.log(`PASS: kalSW versus dense reference, 40 updates, maximum |weight or log-prior difference| ${max}`);
}
checkSwitch();

// Diagnostic, not a world. Its predictions are provably independent of setRate.
const applied = [];
A.registerBase('rateAuditOnly', () => {
  const w = new Float64Array(1);
  let lr = 0;
  return { w, rateInit: 0, setRate(r) { lr = r; },
    learn() { applied.push(lr); w[0] += .2 * (1 - w[0]); }, inherit: () => new Float64Array(0) };
});
const nullL = A.makeLearner(A.meta3({ kind: 'rateAuditOnly' }, { n: 2, c: .2, eta: .1, span: 3 }),
  1, null, rng32(6001));
for (let i = 0; i < 20; i++) nullL.learn([1], 1);
console.log(`Wrapper null diagnostic: first four applied log-rates ${applied.slice(0, 4)}, center after five pairs ${nullL.logRate}`);

// One predeclared grid entry per family. Short runs test plumbing, not endpoints
// or relative performance. Do not run the registered batch or choose a winner.
const representatives = [...new Set(configs.map(a => a.family))].map(f => configs.find(a => a.family === f));
const cfg = { size: 14, patches: 3, patchRadius: 2, capacity: 24, founders: 8, ticks: 128, lateFrom: 64, every: 16 };
let runs = 0, minBites = Infinity, maxBites = 0, births = 0;
for (let seed = 6001; seed <= 6008; seed++) for (const a of representatives) {
  for (const arm of [a, A.meta3(a, h)]) {
    const r = runOne(seed, arm, toy, A, cfg);
    assert(r.bites > 0 && Number.isFinite(r.pop) && Number.isFinite(r.skill) && Number.isFinite(r.probe));
    assert.equal(r.pop * 4, r.popSum);
    minBites = Math.min(minBites, r.bites); maxBites = Math.max(maxBites, r.bites);
    births += r.births; runs++;
  }
}
assert(births > 0);
console.log(`PASS: toy integration only, ${runs} runs, ${minBites}..${maxBites} bites/run, ${births} births total`);
