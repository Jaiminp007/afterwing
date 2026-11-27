// Learners V2 for 8-regime pairwise world (D=12, N=66 pairs; B_MAX=140 floats; compute <= 3*O(D^2)).
import { pairIndex } from './world_v2.mjs';

export const B_MAX = 140; // N=66 w + N=66 beta + up to 8 meta floats = 140
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const LOG = Math.log;
const EXP = Math.exp;

const P_CACHE = new Map();
function getPairs(D) {
  let p = P_CACHE.get(D);
  if (!p) { p = pairIndex(D); P_CACHE.set(D, p); }
  return p;
}

function dotPair(w, bits) {
  let s = 0, idx = 0;
  const D = bits.length;
  for (let i = 0; i < D; i++) {
    const bi = bits[i];
    for (let j = i + 1; j < D; j++) s += w[idx++] * (bi * bits[j]);
  }
  return s;
}

function makePhi(bits, pa, pb, out) {
  const N = pa.length;
  for (let i = 0; i < N; i++) out[i] = bits[pa[i]] * bits[pb[i]];
}

// Per-regime L2 parameters for the 8 corners of (supportMode, noiseMode, sparseMode)
export function regimeL2ParamsV2(reg) {
  const persist = reg.supportMode === 0;
  const clean = reg.noiseMode === 0;
  const ultra = reg.sparseMode === 0;
  return {
    betaMin: persist ? -9.5 : -4.4,
    betaMax: ultra ? (clean ? -0.8 : -1.5) : (clean ? -2.3 : -2.9),
    betaInit: persist ? -6.0 : -4.2,
    betaDecay: persist ? 0.0002 : 0.020,
    eta: clean ? 0.16 : 0.08,
    eClip: clean ? 100.0 : 1.4,
    l1Shrink: ultra ? (persist ? (clean ? 0.015 : 0.006) : (clean ? 0.008 : 0.002)) : 0.0,
    wDecay: persist ? 0.001 : 0.006,
    sumCap: clean ? 0.92 : 0.65,
  };
}

export function interpL2ParamsV2(pSupport, pNoise, pSparse) {
  const s = clamp(pSupport, 0, 1), n = clamp(pNoise, 0, 1), sp = clamp(pSparse, 0, 1);
  const mix = (a, b, t) => a * (1 - t) + b * t;
  const betaMin = mix(-9.5, -4.4, s);
  const betaMax = mix(mix(-0.8, -1.5, n), mix(-2.3, -2.9, n), sp);
  const betaInit = mix(-6.0, -4.2, s);
  const betaDecay = mix(0.0002, 0.020, s);
  const eta = mix(0.16, 0.08, n);
  const eClip = EXP(mix(LOG(30.0), LOG(1.4), n));
  const l1U = mix(mix(0.015, 0.006, n), mix(0.008, 0.002, n), s);
  const l1Shrink = mix(l1U, 0.0, sp);
  const wDecay = mix(0.001, 0.006, s);
  const sumCap = mix(0.92, 0.65, n);
  return { betaMin, betaMax, betaInit, betaDecay, eta, eClip, l1Shrink, wDecay, sumCap };
}

// Depth 1 (FIXED, including LAST)
function pairLMS(arm, D, st) {
  const { N, pa, pb } = getPairs(D);
  const w = new Float64Array(N);
  if (st && arm.inheritW && st.length >= N) w.set(st.subarray(0, N));
  let alpha = arm.alpha, eClip = arm.eClip ?? 100, l1 = arm.l1Shrink ?? 0, wd = arm.wDecay ?? 0;
  return {
    depth: 1,
    predict: bits => dotPair(w, bits),
    setOracle(reg) {
      if (!arm.isOracle) return;
      const clean = reg.noiseMode === 0, ultra = reg.sparseMode === 0, persist = reg.supportMode === 0;
      alpha = clean ? 0.014 : 0.008;
      eClip = clean ? 100 : 1.5;
      l1 = ultra ? 0.006 : 0;
      wd = persist ? 0.001 : 0.006;
    },
    learn(bits, y) {
      const p = dotPair(w, bits);
      const e = clamp(y - p, -eClip, eClip);
      const step = alpha * e, keep = 1 - wd;
      for (let i = 0; i < N; i++) {
        let wi = w[i] * keep + step * bits[pa[i]] * bits[pb[i]];
        if (l1 > 0) wi = wi > l1 ? wi - l1 : wi < -l1 ? wi + l1 : 0;
        w[i] = clamp(wi, -6, 6);
      }
    },
    inherit: () => (arm.inheritW ? Float64Array.from(w) : new Float64Array(0)),
  };
}

// Depth 2 core
function makePairL2Core(D, initParams, st, inheritW, inheritBeta) {
  const { N, pa, pb } = getPairs(D);
  const w = new Float64Array(N);
  const beta = new Float64Array(N).fill(initParams.betaInit);
  const h = new Float64Array(N);
  const v = new Float64Array(N).fill(1.0);
  const phi = new Int8Array(N);
  const alphas = new Float64Array(N);

  let off = 0;
  if (st && inheritW && st.length >= off + N) { w.set(st.subarray(off, off + N)); off += N; }
  if (st && inheritBeta && st.length >= off + N) { beta.set(st.subarray(off, off + N)); off += N; }

  let P = { ...initParams };
  const tau = 200;

  return {
    w, beta, h, v, N, pa, pb,
    get params() { return P; },
    setParams(np) { P = { ...P, ...np }; },
    predict: bits => dotPair(w, bits),
    step(bits, y) {
      makePhi(bits, pa, pb, phi);
      let pred = 0;
      for (let i = 0; i < N; i++) pred += w[i] * phi[i];
      const rawE = y - pred;
      const e = clamp(rawE, -P.eClip, P.eClip);

      let sumA = 0;
      const bMin = P.betaMin, bMax = P.betaMax, bInit = P.betaInit, bDec = P.betaDecay, eta = P.eta;
      for (let i = 0; i < N; i++) {
        const g = e * phi[i] * h[i];
        const ag = Math.abs(g);
        const aPrev = EXP(clamp(beta[i], bMin, bMax));
        v[i] = Math.max(ag, v[i] + (1 / tau) * aPrev * (ag - v[i]));
        let bi = beta[i] + bDec * (bInit - beta[i]);
        if (v[i] > 1e-8) bi += eta * (g / v[i]);
        bi = clamp(bi, bMin, bMax);
        beta[i] = bi;
        const ai = EXP(bi);
        alphas[i] = ai;
        sumA += ai;
      }
      const sc = sumA > P.sumCap ? P.sumCap / sumA : 1.0;
      const keep = 1 - P.wDecay, l1 = P.l1Shrink;
      for (let i = 0; i < N; i++) {
        const ai = alphas[i] * sc, fi = phi[i];
        let wi = w[i] * keep + ai * e * fi;
        if (l1 > 0) wi = wi > l1 ? wi - l1 : wi < -l1 ? wi + l1 : 0;
        w[i] = clamp(wi, -6, 6);
        h[i] = h[i] * Math.max(0, 1 - ai) + ai * e * fi;
      }
      return { pred, rawE, e };
    },
    packState(extra = null) {
      const len = (inheritW ? N : 0) + (inheritBeta ? N : 0) + (extra ? extra.length : 0);
      const out = new Float64Array(len);
      let k = 0;
      if (inheritW) { out.set(w, k); k += N; }
      if (inheritBeta) { out.set(beta, k); k += N; }
      if (extra) out.set(extra, k);
      return out;
    },
  };
}

function pairL2(arm, D, st) {
  const core = makePairL2Core(D, arm.params, st, arm.inheritW ?? true, arm.inheritBeta ?? true);
  return {
    depth: arm.isOracle ? 3 : 2,
    predict: core.predict,
    setOracle(reg) { if (arm.isOracle) core.setParams(regimeL2ParamsV2(reg)); },
    learn(bits, y) { core.step(bits, y); },
    inherit: () => core.packState(),
  };
}

// Strong Class F #1: 3-expert Fixed-Share over L2 variants (3 * O(D^2))
function shareL2(arm, D, st) {
  const { N } = getPairs(D);
  const K = arm.experts.length;
  if (K > 3) throw new Error('shareL2 > 3 experts');
  const wInit = st && st.length >= N ? st.subarray(0, N) : null;
  const bInit = st && st.length >= 2 * N ? st.subarray(N, 2 * N) : null;
  const probs = new Float64Array(K).fill(1 / K);
  if (st && st.length >= 2 * N + K) {
    let s = 0;
    for (let k = 0; k < K; k++) s += (probs[k] = Math.max(1e-4, st[2 * N + k]));
    for (let k = 0; k < K; k++) probs[k] /= s;
  }
  const exps = arm.experts.map(ep => {
    const core = makePairL2Core(D, ep, null, false, false);
    if (wInit) core.w.set(wInit);
    if (bInit) for (let i = 0; i < N; i++) core.beta[i] = clamp(bInit[i], ep.betaMin, ep.betaMax);
    return core;
  });
  const wMix = new Float64Array(N);
  const syncMix = () => {
    wMix.fill(0);
    for (let k = 0; k < K; k++) {
      const pk = probs[k], wk = exps[k].w;
      for (let i = 0; i < N; i++) wMix[i] += pk * wk[i];
    }
  };
  syncMix();
  const etaMix = arm.etaMix ?? 0.25, share = arm.share ?? 0.02, lossClip = arm.lossClip ?? 3.0;
  const score = new Float64Array(K);
  return {
    depth: 2,
    predict: bits => dotPair(wMix, bits),
    learn(bits, y) {
      let peak = -Infinity;
      for (let k = 0; k < K; k++) {
        const { rawE } = exps[k].step(bits, y);
        const ae = Math.abs(rawE);
        const loss = ae <= lossClip ? 0.5 * ae * ae : lossClip * (ae - 0.5 * lossClip);
        score[k] = LOG(Math.max(1e-12, probs[k])) - etaMix * loss;
        if (score[k] > peak) peak = score[k];
      }
      let z = 0;
      for (let k = 0; k < K; k++) z += (probs[k] = EXP(score[k] - peak));
      for (let k = 0; k < K; k++) probs[k] = (1 - share) * (probs[k] / z) + share / K;
      syncMix();
    },
    inherit() {
      const out = new Float64Array(2 * N + K);
      out.set(wMix, 0);
      for (let i = 0; i < N; i++) {
        let bi = 0;
        for (let k = 0; k < K; k++) bi += probs[k] * exps[k].beta[i];
        out[N + i] = bi;
      }
      for (let k = 0; k < K; k++) out[2 * N + k] = probs[k];
      return out;
    },
  };
}

// Strong Class F #2: World-Model Open-Loop Regime Estimator (1 * O(D^2))
// Estimates (pSupport, pNoise, pSparse) directly from (x, y, w_hat) using the EXACT world model!
function openLoopClassFV2(arm, D, st) {
  const { N } = getPairs(D);
  let pSupport = 0.5, pNoise = 0.5, pSparse = 0.5;
  if (st && st.length >= 2 * N + 3) {
    pSupport = clamp(st[2 * N + 0], 0, 1);
    pNoise = clamp(st[2 * N + 1], 0, 1);
    pSparse = clamp(st[2 * N + 2], 0, 1);
  }
  const core = makePairL2Core(D, interpL2ParamsV2(pSupport, pNoise, pSparse), st, true, true);
  const wSnap = new Float64Array(N);
  wSnap.set(core.w);
  let bites = 0;
  let stormRate = pNoise * 0.14;

  return {
    depth: 2,
    predict: core.predict,
    learn(bits, y) {
      core.step(bits, y);
      bites++;

      // Axis 1 (noiseMode): raw |y| > 5.8 has P ~ 0.0001 in clean (S=2.6, sd=0.2) and P ~ 0.125 in storm (25% sd=8.5)
      const isExtreme = Math.abs(y) > 5.8 ? 1 : 0;
      stormRate += 0.04 * (isExtreme - stormRate);
      pNoise = clamp((stormRate - 0.015) / 0.06, 0, 1);

      // Axis 2 (sparseMode): participation ratio of top weights in w_hat (k=2 -> PR~2.5-4, k=10 -> PR~10-16)
      if (bites % 10 === 0) {
        let l1 = 0, l2 = 0;
        for (let i = 0; i < N; i++) {
          const aw = Math.abs(core.w[i]);
          if (aw > 0.18) { l1 += aw; l2 += aw * aw; }
        }
        if (l2 > 0.5) {
          const pr = (l1 * l1) / l2;
          const spEst = clamp((pr - 4.2) / 5.5, 0, 1);
          pSparse += 0.12 * (spEst - pSparse);
        }
      }

      // Axis 0 (supportMode): when w changes materially over 60 bites, check cosine overlap of |w| vs |wSnap|
      if (bites % 60 === 0) {
        let dotAbs = 0, n1 = 0, n2 = 0, diff2 = 0;
        for (let i = 0; i < N; i++) {
          const a = Math.abs(core.w[i]), b = Math.abs(wSnap[i]);
          dotAbs += a * b; n1 += a * a; n2 += b * b;
          const d = core.w[i] - wSnap[i]; diff2 += d * d;
        }
        if (n1 > 0.5 && n2 > 0.5 && diff2 > 1.0) {
          const cos = dotAbs / (Math.sqrt(n1 * n2) + 1e-9);
          const turnEst = clamp((0.68 - cos) / 0.35, 0, 1);
          pSupport += 0.35 * (turnEst - pSupport);
        }
        wSnap.set(core.w);
      }

      core.setParams(interpL2ParamsV2(pSupport, pNoise, pSparse));
    },
    inherit: () => core.packState(Float64Array.of(pSupport, pNoise, pSparse)),
  };
}

const FACTORIES = { pairLMS, pairL2, shareL2, openLoopClassFV2 };
export function makeLearner(arm, D, st, r) {
  if (st && st.length > B_MAX) throw new Error(`inherited ${st.length} > B_MAX=${B_MAX}`);
  const fn = FACTORIES[arm.kind];
  if (!fn) throw new Error(`unknown kind ${arm.kind}`);
  const L = fn(arm, D, st, r);
  const probeLen = L.inherit().length;
  if (probeLen > B_MAX) throw new Error(`${arm.name} inherits ${probeLen} > B_MAX=${B_MAX}`);
  return L;
}
