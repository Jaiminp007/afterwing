// L4-H fixtures. node microverse/l4h-fixtures.mjs   (uses only the throwaway smoke world)
import assert from 'node:assert/strict';
import { runOne, rng32, WorldL4H } from './l4h.mjs';
import * as A from './l4h-arms.mjs';
import * as C from './l4h-classf.mjs';
import * as W from '../scratch/explore-claude-l4h/toyworld.mjs';
C.register(A);
let pass = 0; const ok = (c, m) => { assert.ok(c, m); pass++; console.log('PASS', m); };

// 1. Null drift: a base whose predictions ignore the rate, approaching a constant target.
A.registerBase('nullRate', (arm, D) => { const w = new Float64Array(D); return { w, depth: 2, rateInit: 0, setRate() {}, learn(x, y) { for (let i = 0; i < D; i++) w[i] += .01 * (y - 0) * x[i] / D; }, inherit: () => new Float64Array(0) }; });
let drift = 0, sq = 0; const R = 400;
for (let k = 0; k < R; k++) {
  const L = A.makeLearner(A.meta3({ kind: 'nullRate', name: 'N' }, { n: 4, c: .2, eta: .1, span: 3 }), 16, null, rng32(1000 + k));
  const rx = rng32(77 + k);
  for (let t = 0; t < 200; t++) L.learn(Int8Array.from({ length: 16 }, () => rx() < .5 ? -1 : 1), 1 + .3 * (rx() - .5));
  drift += L.logRate; sq += L.logRate ** 2;
}
const m = drift / R, se = Math.sqrt((sq / R - m * m) / R);
ok(Math.abs(m) < 3 * se + 1e-9, `null-rate learner: mean center drift ${m.toFixed(3)} within 3 SE (${se.toFixed(3)})`);

// 2. Budget cap.
assert.throws(() => A.makeLearner({ kind: 'idbd', theta: .01, alpha0: .01, name: 'x' }, 16, new Float64Array(4), rng32(1)));
ok(true, 'inherited state above B=3 is rejected');
for (const a of [...A.DEPTH1, ...A.DEPTH2, ...C.DEPTH2_EXTRA]) {
  const L = A.makeLearner(a, 16, null, rng32(3));
  ok(L.inherit().length <= A.B_MAX - (a.kind === 'lms' || a.kind === 'kalRW' ? 0 : 1), `${a.name} leaves room for META3's float`);
}

// 3. Determinism and catalogue.
const base = A.DEPTH2.find(a => a.family === 'KALADQ');
const st = { kind: 'static', name: 'L2BEST', base, offset: 0 };
const cfg = { ticks: 1200, lateFrom: 600 };
const r1 = runOne(6001, st, W, A, cfg), r2 = runOne(6001, st, W, A, cfg);
ok(r1.popSum === r2.popSum && r1.bites === r2.bites, 'runs are deterministic');
const wd = new WorldL4H(6002, st, W, A, cfg);
for (let t = 0; t < 300; t++) wd.step();
ok(wd.codes.length === wd.cfg.kinds && wd.codes.every(b => b instanceof Int8Array && b.length === 16), 'odor catalogue keeps fixed length');

// 4. EVOR point mass (pm 0, no standing variation) reproduces L2BEST exactly.
const ev = { kind: 'l3', l3: 'evo', name: 'EVOR', base: st, ...A.EVOGRID[0] };
ok(runOne(6001, ev, W, A, cfg).popSum === r1.popSum, 'EVOR point mass == L2BEST bit for bit');
// 5. Static offset 0 == bare base.
ok(runOne(6001, base, W, A, cfg).popSum === r1.popSum, 'STATIC_0 == bare base bit for bit');
// 6. SHAM_NOWRITE never writes; META3 writes; RANDSIGN writes about as often as META3.
const h = { n: 8, c: .3, eta: .15, span: 3 };
const probeL = arm => { const L = A.makeLearner(arm, 16, null, rng32(9)); const rx = rng32(10); for (let t = 0; t < 2000; t++) { const x = Int8Array.from({ length: 16 }, () => rx() < .5 ? -1 : 1); L.learn(x, x[0] + x[1] + rx() - .5); } return L; };
const [mL, nL, rL] = [A.meta3(st, h), ...A.controls(st, h, A.EVOGRID[0]).slice(0, 2)].map(probeL);
ok(nL.writes === 0 && nL.pairs > 50, `SHAM_NOWRITE: ${nL.pairs} pairs, 0 writes`);
ok(mL.writes > 50 && rL.writes > 50, `META3 ${mL.writes} writes, RANDSIGN ${rL.writes} writes`);
console.log(`${pass} checks passed`);
