// L4-J arm library for the ecology harness (harness.mjs). Wraps proxy-learners.mjs.
// Every learner sees (bits, noisy taste, tick) and its inherited state only. Oracle arms
// (name starts with ORACLE) additionally read world.describe(); no other arm touches `world`.
import { MAKERS } from './proxy-learners.mjs';

export const B_MAX = 34; // 2D + 2 floats, the same cap for every arm
const ORACLE_MAPS = {
  // beta as a function of the current regime's angular speed (oracle reads it)
  omegaPow: (arm, d) => d.still ? arm.bStill : Math.min(.05, arm.a * Math.pow(Math.abs(d.omega) / 0.01, arm.g)),
  // generous variant: also boosts beta for T ticks after every regime entry (oracle timing)
  omegaBoost: (arm, d) => d.now - d.entryTick < arm.T ? arm.bBoost : ORACLE_MAPS.omegaPow(arm, d),
  // constant per regime index (hindsight per-regime table, arm.table[regime])
  table: (arm, d) => arm.table[d.regime],
};
const dot = (a, b, D) => { let s = 0; for (let i = 0; i < D; i++) s += a[i] * b[i]; return s; };

// Class F: fixed-share mixture over K ROT experts at fixed betas (mixer changes output weights only).
// Inherits the mixture-weighted (w, v) for every expert plus K-1 mixture weights (<= B).
function mixRot(arm, D, st) {
  const K = arm.betas.length, ex = arm.betas.map(beta => MAKERS.rot({ ...arm, beta, kind: 'rot', last: true }, D, st ? st.subarray(0, 2 * D) : null));
  const p = new Float64Array(K).fill(1 / K), w = new Float64Array(D);
  if (st && st.length >= 2 * D + K - 1) { let s = 0; for (let k = 0; k < K - 1; k++) s += (p[k] = st[2 * D + k]); p[K - 1] = Math.max(0, 1 - s); }
  const mixW = () => { w.fill(0); for (let k = 0; k < K; k++) for (let i = 0; i < D; i++) w[i] += p[k] * ex[k].w[i]; };
  mixW();
  return { w, depth: 2,
    learn(x, y, t) {
      const lg = ex.map(L => { const { e, S } = L.learn(x, y, t); return -.5 * arm.eta * (Math.log(S) + e * e / S); });
      const m = Math.max(...lg); let z = 0;
      for (let k = 0; k < K; k++) z += (p[k] *= Math.exp(lg[k] - m));
      for (let k = 0; k < K; k++) p[k] = (1 - arm.share) * p[k] / z + arm.share / K;
      mixW();
    },
    inherit() {
      const o = new Float64Array(2 * D + K - 1);
      for (let k = 0; k < K; k++) for (let i = 0; i < D; i++) { o[i] += p[k] * ex[k].w[i]; o[D + i] += p[k] * ex[k].v[i]; }
      for (let k = 0; k < K - 1; k++) o[2 * D + k] = p[k];
      return o;
    } };
}

// depth 3: META3P = acting ROT plus two shadow ROTs at beta*exp(+-c) on the same bites (3x ROT compute).
// Every n bites, step log beta by eta toward the shadow with lower EMA (tau) pre-update squared error.
// Variants: l3 'pair' (META3), 'nowrite' (SHAM), 'randsign' (SHAM), 'evo' (EVO-R: log beta is a gene,
// mutation sd sm with prob pm at birth, no in-life change). Inherits (w, v, log beta) = 2D + 1 floats.
function meta3(arm, D, st, r) {
  const hasB = st && st.length === 2 * D + 1, base = { ...arm, kind: 'rot', last: true };
  const wv = st ? st.subarray(0, 2 * D) : null;
  let lb = hasB ? st[2 * D] : Math.log(arm.beta);
  const lo = Math.log(arm.beta) - arm.span, hi = Math.log(arm.beta) + arm.span, cl = x => Math.max(lo, Math.min(hi, x));
  if (arm.l3 === 'evo' && hasB && r() < arm.pm) { let u = 0; while (!u) u = r(); lb = cl(lb + arm.sm * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())); }
  const L = MAKERS.rot({ ...base, beta: Math.exp(lb) }, D, wv);
  if (arm.l3 === 'evo') return { w: L.w, depth: 3, learn: (x, y, t) => L.learn(x, y, t), inherit: () => Float64Array.from([...L.w, ...L.v, lb]), get logBeta() { return lb; } };
  const Sp = MAKERS.rot({ ...base, beta: Math.exp(cl(lb + arm.c)) }, D, wv), Sm = MAKERS.rot({ ...base, beta: Math.exp(cl(lb - arm.c)) }, D, wv);
  let ep = 0, em = 0, k = 0;
  const k1 = 1 / arm.tau;
  return { w: L.w, depth: 3, get logBeta() { return lb; },
    learn(x, y, t) {
      const dp = y - dot(Sp.w, x, D), dm = y - dot(Sm.w, x, D);
      ep += k1 * (dp * dp - ep); em += k1 * (dm * dm - em);
      if (++k >= arm.n) {
        k = 0; const g = ep - em;
        if (g !== 0 && arm.l3 !== 'nowrite') {
          const sg = arm.l3 === 'randsign' ? (r() < .5 ? 1 : -1) : Math.sign(g);
          lb = cl(lb - arm.eta * sg); L.setBeta(Math.exp(lb)); Sp.setBeta(Math.exp(cl(lb + arm.c))); Sm.setBeta(Math.exp(cl(lb - arm.c)));
        }
      }
      Sp.learn(x, y, t); Sm.learn(x, y, t); L.learn(x, y, t);
    },
    inherit: () => Float64Array.from([...L.w, ...L.v, lb]) };
}
const EXTRA = { mixRot, meta3 };

export function makeLearner(arm, D, st, r, world) {
  if (st && st.length > B_MAX) throw new Error(`inherited ${st.length} > B`);
  const L = (EXTRA[arm.kind] ?? MAKERS[arm.kind])(arm, D, st, r);
  if (arm.oracle) {
    const map = ORACLE_MAPS[arm.oracle], inner = L.learn;
    L.learn = (x, y, t) => { L.setBeta(map(arm, world.describe())); return inner(x, y, t); };
  }
  if (L.inherit().length > B_MAX) throw new Error(`${arm.name} inherits > B`);
  return L;
}
