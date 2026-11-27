// Class F challengers by the blind adversary (Astra+Sol), scratch/adversary-astra-l4h/. Copied verbatim; SHAREADQ (borderline) is declared ELIGIBLE before any world exists (the stronger flat class).
// General-purpose linear predictors. No imports, world access, shared state, or learner RNG.
const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const log = Math.log;
const exp = Math.exp;
const vec = n => new Float64Array(n);
function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// A bounded, zero-mean scale score when e ~ N(0, S). No Gaussian world is required to run it.
const scaleScore = (e, S) => Math.SQRT1_2 - exp(-.5 * e * e / S);

// Gaussian linear observation update. With lambda < 1, forget information only
// along the observed direction: Pprior = P + (1/lambda - 1) (Px)(Px)'/(x'Px).
// This avoids exponential covariance growth in directions never observed.
function filter(D) {
  const w = vec(D), P = vec(D * D), px = vec(D);
  for (let i = 0; i < D; i++) P[i * D + i] = 1;
  let e = 0, S = 1;
  return {
    w, get e() { return e; }, get S() { return S; },
    observe(x, y, R, q, lambda = 1) {
      let t = 0;
      for (let i = 0; i < D; i++) {
        const row = i * D;
        P[row + i] += q;
        let p = 0;
        for (let j = 0; j < D; j++) p += P[row + j] * x[j];
        px[i] = p;
        t += p * x[i];
      }
      e = y - dot(w, x);
      S = R + t / lambda;
      const gain = 1 / (lambda * S);
      // Algebraically equivalent to inflating P then subtracting the posterior downdate.
      const rank = ((1 - lambda) * R - t) * gain / t;
      for (let i = 0; i < D; i++) {
        w[i] += px[i] * gain * e;
        for (let j = i; j < D; j++) {
          const a = P[i * D + j] + rank * px[i] * px[j];
          P[i * D + j] = a;
          P[j * D + i] = a;
        }
      }
    },
  };
}

// Directional forgetting contracts old information even when y is well predicted.
// Only the observation scale adapts from error; its learning speed is the L2 rate.
function dirRLS(arm, D, st) {
  const f = filter(D);
  let lR = st?.[0] ?? 0, rho = arm.rate;
  return {
    w: f.w, depth: 2, rateInit: log(rho), setRate(lr) { rho = exp(lr); },
    learn(x, y) {
      f.observe(x, y, exp(lR), 0, arm.lambda);
      lR = clip(lR + rho * scaleScore(f.e, f.S), -9, 9);
    },
    inherit: () => Float64Array.of(lR),
  };
}

// Normalized LMS. Recent *signs* of raw gradients vote on a single gain, so one
// extreme taste cannot by itself cast a larger vote. Trace and w reset at birth.
function signGain(arm, D, st) {
  const w = vec(D), h = vec(D);
  let la = st?.[0] ?? log(.25), rho = arm.rate;
  return {
    w, depth: 2, rateInit: log(rho), setRate(lr) { rho = exp(lr); },
    learn(x, y) {
      const e = y - dot(w, x), s = Math.sign(e);
      const norm = Math.sqrt(D * dot(h, h));
      if (norm > 0) la = clip(la + rho * s * dot(x, h) / norm, -7, 0);
      const delta = exp(la) * e / D;
      for (let i = 0; i < D; i++) {
        w[i] += delta * x[i];
        h[i] += .2 * (s * x[i] - h[i]);
      }
    },
    inherit: () => Float64Array.of(la),
  };
}

// Adam's coordinate second moments coincide for x_i in {-1,1}. Only the
// second moment crosses birth, never momentum. Track its mass for bias correction.
function rmsAdam(arm, D, st) {
  const w = vec(D), m = vec(D);
  let v = st?.[0] ?? 0, mass = v > 0 ? 1 : 0, mMass = 0;
  let b = -Math.expm1(-arm.rate);
  return {
    w, depth: 2, rateInit: log(arm.rate), setRate(lr) { b = -Math.expm1(-exp(lr)); },
    learn(x, y) {
      const e = y - dot(w, x);
      v += b * (e * e - v);
      mass += b * (1 - mass);
      mMass += .25 * (1 - mMass);
      const a = arm.step / (D * mMass * (Math.sqrt(v / mass) + 1e-8));
      for (let i = 0; i < D; i++) {
        m[i] += .25 * (e * x[i] - m[i]);
        w[i] += a * m[i];
      }
    },
    inherit: () => Float64Array.of(mass ? v / mass : 0),
  };
}

// log q from innovations; a separate raw-data statistic estimates log R. Two
// consecutive tastes of exactly the same odor can difference out their mean.
// If the rule changes between them, the difference also contains target drift.
function repeatQR(arm, D, st) {
  const f = filter(D), lastX = vec(D);
  let lq = st?.[0] ?? log(.001), lR = st?.[1] ?? 0;
  let lastY = 0, seen = false, rho = arm.rate;
  return {
    w: f.w, depth: 2, rateInit: log(rho), setRate(lr) { rho = exp(lr); },
    learn(x, y) {
      const R = exp(lR);
      f.observe(x, y, R, exp(lq));
      lq = clip(lq + rho * scaleScore(f.e, f.S), -14, 1);
      if (seen && dot(lastX, x) === D)
        lR = clip(lR + .1 * scaleScore(y - lastY, 2 * R), -9, 9);
      lastX.set(x); lastY = y; seen = true;
    },
    inherit: () => arm.carryR ? Float64Array.of(lq, lR) : Float64Array.of(lq),
  };
}

// Parallel predictors on the SAME stream. The mixer changes only output weights,
// never expert updates. The adaptive-expert variant is declared borderline.
function shareKF(arm, D, st) {
  const w = vec(D), qs = arm.adaptive ? [.001, .001] : [.00003, .003, .15];
  const speed = [.01, .4], K = qs.length, fs = qs.map(() => filter(D));
  const p = vec(K).fill(1 / K), score = vec(K);
  if (st?.length) {
    let sum = 0;
    for (let k = 0; k < K - 1; k++) sum += (p[k] = st[k]);
    p[K - 1] = 1 - sum;
  }
  let eta = arm.rate;
  return {
    w, depth: 2, rateInit: log(eta), setRate(lr) { eta = exp(lr); },
    learn(x, y) {
      let peak = -Infinity, z = 0;
      for (let k = 0; k < K; k++) {
        const f = fs[k];
        f.observe(x, y, arm.R, qs[k]);
        score[k] = log(p[k]) - .5 * eta * (log(f.S) + f.e * f.e / f.S);
        peak = Math.max(peak, score[k]);
        if (arm.adaptive)
          qs[k] = exp(clip(log(qs[k]) + speed[k] * scaleScore(f.e, f.S), -14, 1));
      }
      for (let k = 0; k < K; k++) z += (p[k] = exp(score[k] - peak));
      w.fill(0);
      for (let k = 0; k < K; k++) {
        p[k] = (1 - arm.share) * p[k] / z + arm.share / K;
        for (let i = 0; i < D; i++) w[i] += p[k] * fs[k].w[i];
      }
    },
    inherit: () => p.slice(0, K - 1),
  };
}

const factories = { dirRLS, signGain, rmsAdam, repeatQR, shareKF };
export function register(A) {
  for (const [kind, factory] of Object.entries(factories)) A.registerBase(kind, factory);
}

function grid(family, kind, fields, configs) {
  return configs.map(values => ({
    family, kind, name: [family, ...values].join('_'),
    ...Object.fromEntries(fields.map((k, i) => [k, values[i]])),
  }));
}
export const DEPTH2_EXTRA = [
  ...grid('DIRRLS', 'dirRLS', ['lambda', 'rate'],
    [.94, .99].flatMap(l => [.03, .2].map(r => [l, r]))),
  ...grid('SIGNGAIN', 'signGain', ['rate'], [[.05], [.25], [1]]),
  ...grid('RMSADAM', 'rmsAdam', ['step', 'rate'],
    [.15, .6].flatMap(a => [.02, .15].map(r => [a, r]))),
  ...grid('REPEATQR', 'repeatQR', ['carryR', 'rate'],
    [false, true].flatMap(c => [.05, .3].map(r => [c, r]))),
  ...grid('SHAREKF', 'shareKF', ['adaptive', 'rate', 'share', 'R'],
    [.3, 1].flatMap(r => [.01, .08].map(s => [false, r, s, 1]))),
  ...grid('SHAREADQ', 'shareKF', ['adaptive', 'rate', 'share', 'R', 'borderline'],
    [.3, 1].map(r => [true, r, .03, 1, true])),
];
