// L4-I arm library (L4-H library plus Fable's L4-I amendments, scratch/judge-fable-l4i/ruling.md).
// FROZEN before the first L4-I world draw. Changes from l4h-arms.mjs: absolute L3/EVOR bounds equal
// to the static sweep range (+-SWEEP around L2A's rate, applied rate clamped too); sweep +-6;
// second declared L3 candidate META3P (paired shadows on the same bites).
// Every learner sees only (odor bits x in {-1,+1}^D, noisy taste y) and its inherited state.
// L1 weights w always start at 0 at birth. No learner knows the world model.
//
// Depth classes (Fable ruling, scratch/judge-fable-l4g/ruling.md, Class F):
//   depth 1 (FIXED class): the update rule's gains depend only on inputs and fixed constants.
//   depth 2 (Class F, "L2"): one adaptive component rewrites L1's update from L1's realized errors.
//     Any within-life algorithm; inherited state of at most B floats written by any rule from the
//     fly's observations, errors and weight estimates.
//   depth 3 (META3): a component (L3) that rewrites L2's update from L2's realized performance.
//     Excluded from Class F by definition.
// Gate cells: FIXED = best depth-1 member; L2best = best depth-2 member; META3 = L3 wrapped around
// the locked L2best (its declared rate parameter); all locked by stage-A mean on tuning seeds.

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const LOG = Math.log;

// ---------- depth 1 ----------
function lms(arm, D) {
  const w = new Float64Array(D), a = arm.alpha;
  return { w, depth: 1, learn(x, y) { let p = 0; for (let i = 0; i < D; i++) p += w[i] * x[i]; const e = y - p; for (let i = 0; i < D; i++) w[i] += a * e * x[i]; }, inherit: () => new Float64Array(0) };
}
// Random-walk Kalman regression with fixed process noise q and observation variance R.
function kalmanCore(D, q0, R) {
  const w = new Float64Array(D), P = new Float64Array(D * D), px = new Float64Array(D);
  for (let i = 0; i < D; i++) P[i * D + i] = 1;
  const core = { w, P, q: q0, R,
    // returns {e, S} before the update (realized innovation and its predicted variance)
    update(x, y) {
      const q = core.q;
      for (let i = 0; i < D; i++) P[i * D + i] += q;
      let S = core.R, p = 0;
      for (let i = 0; i < D; i++) { let v = 0; for (let j = 0; j < D; j++) v += P[i * D + j] * x[j]; px[i] = v; S += v * x[i]; p += w[i] * x[i]; }
      const e = y - p;
      for (let i = 0; i < D; i++) w[i] += px[i] * e / S;
      for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) P[i * D + j] -= px[i] * px[j] / S;
      return { e, S };
    } };
  return core;
}
function kalRW(arm, D) {
  const k = kalmanCore(D, arm.q, arm.R);
  return { w: k.w, depth: 1, learn(x, y) { k.update(x, y); }, inherit: () => new Float64Array(0) };
}

// ---------- depth 2 (Class F) ----------
// IDBD (Sutton 1992). Rate parameter: theta (meta step size).
function idbd(arm, D, st) {
  const w = new Float64Array(D), beta = new Float64Array(D), h = new Float64Array(D);
  beta.fill(LOG(arm.alpha0));
  let theta = arm.theta;
  return { w, depth: 2, rateInit: LOG(arm.theta), setRate(lr) { theta = Math.exp(lr); },
    learn(x, y) {
      let p = 0; for (let i = 0; i < D; i++) p += w[i] * x[i]; const e = y - p;
      let sum = 0;
      for (let i = 0; i < D; i++) { beta[i] = clamp(beta[i] + theta * e * x[i] * h[i], -10, -1); sum += Math.exp(beta[i]) * x[i] * x[i]; }
      const sc = sum > 1 ? 1 / sum : 1;
      for (let i = 0; i < D; i++) { const a = Math.exp(beta[i]) * sc; w[i] += a * e * x[i]; h[i] = h[i] * Math.max(0, 1 - a * x[i] * x[i]) + a * e * x[i]; }
    }, inherit: () => new Float64Array(0) };
}
// Autostep (Mahmood et al. 2012). Rate parameter: mu.
function autostep(arm, D, st) {
  const w = new Float64Array(D), beta = new Float64Array(D), h = new Float64Array(D), v = new Float64Array(D).fill(1);
  beta.fill(LOG(arm.alpha0));
  let mu = arm.mu; const tau = arm.tau ?? 1e4;
  return { w, depth: 2, rateInit: LOG(arm.mu), setRate(lr) { mu = Math.exp(lr); },
    learn(x, y) {
      let p = 0; for (let i = 0; i < D; i++) p += w[i] * x[i]; const e = y - p;
      for (let i = 0; i < D; i++) { const g = e * x[i] * h[i], ag = Math.abs(g); v[i] = Math.max(ag, v[i] + (1 / tau) * Math.exp(beta[i]) * x[i] * x[i] * (ag - v[i])); if (v[i] > 0) beta[i] = clamp(beta[i] + mu * g / v[i], -10, -1); }
      let sum = 0; for (let i = 0; i < D; i++) sum += Math.exp(beta[i]) * x[i] * x[i];
      if (sum > 1) { const d = LOG(sum); for (let i = 0; i < D; i++) beta[i] -= d; }
      for (let i = 0; i < D; i++) { const a = Math.exp(beta[i]); w[i] += a * e * x[i]; h[i] = h[i] * Math.max(0, 1 - a * x[i] * x[i]) + a * e * x[i]; }
    }, inherit: () => new Float64Array(0) };
}
// Kalman with adaptive process noise: log q moves with the normalized innovation e^2/S - 1.
// Rate parameter: rho (how fast L2 changes L1's gain).
function kalADQ(arm, D, st) {
  const k = kalmanCore(D, arm.q0, arm.R);
  let lq = st && arm.inheritL2 && st.length ? st[0] : LOG(arm.q0), rho = arm.rho;
  k.q = Math.exp(lq);
  return { w: k.w, depth: 2, rateInit: LOG(arm.rho), setRate(lr) { rho = Math.exp(lr); },
    learn(x, y) { const { e, S } = k.update(x, y); lq = clamp(lq + rho * (Math.SQRT1_2 - Math.exp(-e * e / (2 * S))), LOG(1e-6), LOG(1)); k.q = Math.exp(lq); },
    inherit: () => Float64Array.of(lq) };
}
// Switching Kalman: each bite, the target may have been redrawn with hazard h; moment-matched
// mixture of "same target" and "fresh prior N(0, p0 I)". Reset probability is set from the
// realized predictive likelihoods. Rate parameter: log h is NOT the L2 rate; the L2 rate here is
// the prior variance adaptation speed rho of log p0 toward the realized post-reset magnitude.
function kalSW(arm, D, st) {
  const w = new Float64Array(D), P = new Float64Array(D * D), px = new Float64Array(D);
  let lp0 = st && arm.inheritL2 && st.length ? st[0] : LOG(arm.p0), rho = arm.rho;
  for (let i = 0; i < D; i++) P[i * D + i] = Math.exp(lp0);
  const R = arm.R, h = arm.h;
  return { w, depth: 2, rateInit: LOG(arm.rho), setRate(lr) { rho = Math.exp(lr); },
    learn(x, y) {
      const p0 = Math.exp(lp0);
      let S = R, p = 0, xx = 0;
      for (let i = 0; i < D; i++) { let v = 0; for (let j = 0; j < D; j++) v += P[i * D + j] * x[j]; px[i] = v; S += v * x[i]; p += w[i] * x[i]; xx += x[i] * x[i]; }
      const S0 = R + p0 * xx, e = y - p;
      const l1 = LOG(1 - h) - .5 * (LOG(S) + e * e / S), l0 = LOG(h) - .5 * (LOG(S0) + y * y / S0);
      const m = Math.max(l1, l0), rr = Math.exp(l0 - m) / (Math.exp(l0 - m) + Math.exp(l1 - m));
      // L2: adapt the reset prior scale from the realized normalized fresh-prior innovation.
      lp0 = clamp(lp0 + rho * rr * (Math.SQRT1_2 - Math.exp(-y * y / (2 * S0))), LOG(1e-3), LOG(10));
      for (let i = 0; i < D; i++) {
        const a = w[i] + px[i] * e / S, b = p0 * x[i] * y / S0, nw = (1 - rr) * a + rr * b;
        for (let j = i; j < D; j++) {
          const aj = w[j] + px[j] * e / S, bj = p0 * x[j] * y / S0, nwj = (1 - rr) * aj + rr * bj;
          const PA = P[i * D + j] - px[i] * px[j] / S, PB = (i === j ? p0 : 0) - p0 * p0 * x[i] * x[j] / S0;
          const v = (1 - rr) * (PA + (a - nw) * (aj - nwj)) + rr * (PB + (b - nw) * (bj - nwj));
          P[i * D + j] = v; P[j * D + i] = v;
        }
        px[i] = nw; // reuse as new-w buffer (px no longer needed for row i after j>=i pass)
      }
      // px[i] was overwritten progressively; recompute w from stored new values
      for (let i = 0; i < D; i++) w[i] = px[i];
    }, inherit: () => Float64Array.of(lp0) };
}

// Flat depth-2: a base L2 run at a fixed log-rate offset (no L3). Its rateInit is re-centered,
// so META3 wrapped around a static arm explores around the static rate.
function staticRate(arm, D, st, r) { const L = BASES[arm.base.kind](arm.base, D, st, r); L.rateInit += arm.offset; L.setRate(L.rateInit); return L; }
const BASES = { lms, kalRW, idbd, autostep, kalADQ, kalSW, static: staticRate };
// Adversary-supplied Class F members register their factories here (frozen with the library).
export function registerBase(kind, fn) { if (BASES[kind]) throw new Error('duplicate base ' + kind); BASES[kind] = fn; }

// ---------- depth 3: META3 = L3 wrapped around a depth-2 base ----------
// L3 tunes the base's declared L2 rate (log scale) from L2's realized performance: the fly's
// realized squared taste-prediction error, compared between paired blocks of n bites run at
// rate*exp(+c) and rate*exp(-c) (SPSA in time). Sign update with step eta; clamp to +-span
// around the base's locked rate. The tuned log-rate is inherited (one extra float).
// Variants (arm.l3): 'learn' META3; 'nowrite' SHAM (same perturbations, no update);
// 'randsign' SHAM (same perturbations, update sign is a coin flip); 'reset' (not inherited);
// 'evo' EVO-R (log-rate is a gene: mutation at birth, no in-life change, no perturbation).
function wrapL3(arm, D, st, r) {
  const baseArm = arm.base, B0 = BASES[baseArm.kind];
  const hasL3 = st && st.length > 0;
  const baseSt = hasL3 ? st.subarray(0, st.length - 1) : st;
  const L = B0(baseArm, D, baseSt, r);
  const r0 = L.rateInit, a0 = baseArm.kind === 'static' ? r0 - baseArm.offset : r0, lo = a0 - SWEEP, hi = a0 + SWEEP;
  if (arm.l3.startsWith('pair')) return wrapPair(arm, D, st, r, L, hasL3, r0, lo, hi);
  let lr;
  if (arm.l3 === 'evo') {
    if (hasL3) lr = st[st.length - 1] + (r() < arm.pm ? arm.sm * normal(r) : 0);
    else lr = arm.standing ? r0 + arm.width * (2 * r() - 1) : r0;
    lr = clamp(lr, lo, hi);
  } else lr = hasL3 && arm.l3 !== 'reset' ? st[st.length - 1] : r0;
  const perturb = arm.l3 !== 'evo';
  // Pair schedule: per pair, order (+,-) or (-,+) drawn on the learner's private RNG; exactly n
  // updates per sign. The pre-update loss at bite t is attributed to the sign of update t-1
  // (the treatment that produced the prediction); the first prediction is skipped.
  let first = 1, idx = 0, prev = 0; const sum = { 1: 0, '-1': 0 }, cnt = { 1: 0, '-1': 0 };
  const newPair = () => { first = r() < .5 ? 1 : -1; idx = 0; sum[1] = sum[-1] = 0; cnt[1] = cnt[-1] = 0; };
  if (perturb) newPair(); else L.setRate(lr);
  let pairs = 0, writes = 0;
  return { w: L.w, depth: 3, get logRate() { return lr; }, get pairs() { return pairs; }, get writes() { return writes; },
    learn(x, y) {
      if (perturb) {
        if (prev !== 0) { let p = 0; for (let i = 0; i < D; i++) p += L.w[i] * x[i]; sum[prev] += (y - p) * (y - p); cnt[prev]++; }
        if (cnt[1] >= arm.n && cnt[-1] >= arm.n) {
          pairs++;
          const g = sum[1] / cnt[1] - sum[-1] / cnt[-1];
          if (g !== 0 && arm.l3 !== 'nowrite') { const sg = arm.l3 === 'randsign' ? (r() < .5 ? 1 : -1) : Math.sign(g); lr = clamp(lr - arm.eta * sg, lo, hi); writes++; }
          newPair();
        }
        const sign = idx < arm.n ? first : -first;
        if (idx < 2 * arm.n) idx++;
        L.setRate(clamp(lr + sign * arm.c, lo, hi)); prev = sign;
      }
      L.learn(x, y);
    },
    inherit: () => { const b = L.inherit(), o = new Float64Array(b.length + 1); o.set(b); o[b.length] = lr; return o; } };
}
// META3P: the acting L2 plus two shadow copies at rate*exp(+-c), all three learning from the same
// bites (same-stream paired comparison, compute 3x the base; within the budget of SHAREKF's three
// experts). Every n bites, compare EMA (time constant tau) of the shadows' pre-update squared
// errors and step the acting log-rate by eta toward the better shadow. Shadows always run at the
// current lr+-c (clamped). Only the acting learner predicts. Inherits base state + lr.
// Variants: 'pair' META3P; 'pair_nowrite' (shadows run, no update); 'pair_randsign' (coin-flip
// sign on the same write opportunities); 'pair_reset' (lr not inherited).
function wrapPair(arm, D, st, r, L, hasL3, r0, lo, hi) {
  const B0 = BASES[arm.base.kind], baseSt = hasL3 ? st.subarray(0, st.length - 1) : st;
  const Sp = B0(arm.base, D, baseSt, r), Sm = B0(arm.base, D, baseSt, r);
  let lr = hasL3 && arm.l3 !== 'pair_reset' ? st[st.length - 1] : r0, ep = 0, em = 0, k = 0, pairs = 0, writes = 0;
  const k1 = 1 / arm.tau;
  const setAll = () => { L.setRate(lr); Sp.setRate(clamp(lr + arm.c, lo, hi)); Sm.setRate(clamp(lr - arm.c, lo, hi)); };
  setAll();
  const pred = (M, x) => { let p = 0; for (let i = 0; i < D; i++) p += M.w[i] * x[i]; return p; };
  return { w: L.w, depth: 3, get logRate() { return lr; }, get pairs() { return pairs; }, get writes() { return writes; },
    learn(x, y) {
      const dp = y - pred(Sp, x), dm = y - pred(Sm, x);
      ep += k1 * (dp * dp - ep); em += k1 * (dm * dm - em);
      if (++k >= arm.n) {
        k = 0; pairs++;
        const g = ep - em; // >0: the higher rate is doing worse
        if (g !== 0 && arm.l3 !== 'pair_nowrite') { const sg = arm.l3 === 'pair_randsign' ? (r() < .5 ? 1 : -1) : Math.sign(g); lr = clamp(lr - arm.eta * sg, lo, hi); writes++; setAll(); }
      }
      Sp.learn(x, y); Sm.learn(x, y); L.learn(x, y);
    },
    inherit: () => { const b = L.inherit(), o = new Float64Array(b.length + 1); o.set(b); o[b.length] = lr; return o; } };
}
function normal(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

// One inherited-state cap for every arm, fixed before stage A: B = 3 floats.
export const B_MAX = 3;
export function makeLearner(arm, D, st, r) {
  if (arm.kind === 'nolearn') return { w: new Float64Array(D), depth: 0, learn() {}, inherit: () => new Float64Array(0) };
  if (st && st.length > B_MAX) throw new Error(`inherited state ${st.length} floats exceeds B=${B_MAX}`);
  let L;
  if (arm.kind === 'l3') L = wrapL3(arm, D, st, r);
  else L = BASES[arm.kind](arm, D, st, r);
  const probeLen = L.inherit().length; if (probeLen > B_MAX) throw new Error(`${arm.name} inherits ${probeLen} > B=${B_MAX}`);
  return L;
}
export function probe(Ls) { let s = 0, n = 0; for (const L of Ls) if (L.depth === 3) { s += L.logRate; n++; } return n ? s / n : 0; }

// ---------- declared tuning grids (stage A picks the best mean on tuning seeds) ----------
const g = (name, list) => list.map(o => ({ ...o, name: `${name}_${Object.entries(o).filter(([k]) => k !== 'kind').map(([k, v]) => `${k}${v}`).join('_')}`, family: name }));
export const DEPTH1 = [
  ...g('LMS', [.004, .008, .016, .032, .064].map(alpha => ({ kind: 'lms', alpha }))),
  ...g('KALRW', [1e-4, 1e-3, 1e-2].flatMap(q => [.5, 1, 2].map(R => ({ kind: 'kalRW', q, R })))),
];
export const DEPTH2 = [
  ...g('IDBD', [.001, .003, .01, .03].flatMap(theta => [.003, .01].map(alpha0 => ({ kind: 'idbd', theta, alpha0 })))),
  ...g('AUTO', [.003, .01, .03, .1].flatMap(mu => [.003, .01].map(alpha0 => ({ kind: 'autostep', mu, alpha0 })))),
  ...g('KALADQ', [.003, .01, .03, .1].flatMap(rho => [.5, 1, 2].map(R => ({ kind: 'kalADQ', rho, q0: 1e-3, R, inheritL2: true })))),
  ...g('KALSW', [.003, .01, .03].flatMap(h => [.3, 1].flatMap(p0 => [.01, .05].map(rho => ({ kind: 'kalSW', h, p0, rho, R: 1, inheritL2: true }))))),
];
// L3 hyperparameter grid; applied to the locked L2best after stage A step 1.
export const SWEEP = 6;
export const L3GRID = [8, 16].flatMap(n => [.15, .3].flatMap(c => [.05, .15].map(eta => ({ l3: 'learn', n, c, eta }))));
export const L3PGRID = [50, 200].flatMap(tau => [.3, .7].flatMap(c => [.1, .3].map(eta => ({ l3: 'pair', n: 16, tau, c, eta }))));
export const EVOGRID = [
  { pm: 0, sm: .25, standing: false }, // point mass at the locked rate, no mutation (== L2BEST)
  ...[.1, .3].flatMap(pm => [.25, .5].map(sm => ({ pm, sm, standing: false }))),
  ...[0, .1, .3].flatMap(pm => [.75, 3].map(width => ({ pm, sm: .25, standing: true, width }))),
];
// Flat static-rate sweep across META3's whole reachable range (log offsets from L2A's rate).
export const STATIC_OFFSETS = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
export const meta3 = (base, h) => ({ kind: 'l3', name: 'META3', base, ...h });
// Matched controls for whichever L3 candidate is locked (h.l3 'learn' -> SPSA, 'pair' -> paired shadows).
export const controls = (base, h, evo) => {
  const pre = h.l3 === 'pair' ? 'pair_' : '';
  return [
    { kind: 'l3', name: 'SHAM_NOWRITE', base, ...h, l3: pre + 'nowrite' },
    { kind: 'l3', name: 'SHAM_RANDSIGN', base, ...h, l3: pre + 'randsign' },
    { kind: 'l3', name: 'RESET', base, ...h, l3: pre + 'reset' },
    { kind: 'l3', l3: 'evo', name: 'EVOR', base, ...evo },
  ];
};
