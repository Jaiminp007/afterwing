// Learners for L4-J pairwise N=C(D,2)=120 world.
// All arms obey the exact same compute cap (<= 3 * O(D^2) per bite) and inherited-float cap B_MAX = 256.
// Observation interface: learn(bits: Int8Array(D), y: number), predict(bits: Int8Array(D)) -> number.
import { pairIndex } from './world.mjs';

export const B_MAX = 256;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const LOG = Math.log;
const EXP = Math.exp;

// Cache pair index per D
const P_CACHE = new Map();
function getPairs(D) {
  let p = P_CACHE.get(D);
  if (!p) { p = pairIndex(D); P_CACHE.set(D, p); }
  return p;
}

function makePhi(bits, pa, pb, out) {
  const N = pa.length;
  for (let i = 0; i < N; i++) out[i] = bits[pa[i]] * bits[pb[i]];
  return out;
}

function dotPair(w, bits, pa, pb) {
  let s = 0, idx = 0;
  const D = bits.length;
  for (let i = 0; i < D; i++) {
    const bi = bits[i];
    for (let j = i + 1; j < D; j++) s += w[idx++] * (bi * bits[j]);
  }
  return s;
}

// Per-regime optimal L2 settings (tuned on 951001-951016, indexed by 4-bit regimeId).
// Axes:
//   b0: supportMode 0=persist, 1=turnover
//   b1: noiseMode   0=clean,   1=storm
//   b2: changeMode  0=flip,    1=drift
//   b3: sparseMode  0=ultra(3),1=broad(14)
export function regimeL2Params(reg) {
  const persist = reg.supportMode === 0;
  const clean = reg.noiseMode === 0;
  const flip = reg.changeMode === 0;
  const ultra = reg.sparseMode === 0;

  const betaMin = persist ? -8.5 : -4.8;
  const betaMax = ultra ? (clean ? -1.1 : -2.2) : (clean ? -2.7 : -3.4);
  const betaInit = persist ? -5.8 : -4.5;
  const betaDecay = persist ? 0.0005 : 0.035;
  const eta = (clean ? 0.14 : 0.06) * (flip ? 1.2 : 0.65);
  const eClip = clean ? 100.0 : 1.3;
  const l1Shrink = ultra ? (clean ? 0.012 : 0.008) : 0.0;
  const wDecay = persist ? (flip ? 0.002 : 0.004) : 0.018;
  const sumCap = clean ? 0.90 : 0.55;
  return { betaMin, betaMax, betaInit, betaDecay, eta, eClip, l1Shrink, wDecay, sumCap };
}

// Smooth interpolation of L2 params from continuous axis probabilities p0..p3 in [0,1]
export function interpL2Params(pSupport, pNoise, pChange, pSparse) {
  const s = clamp(pSupport, 0, 1), n = clamp(pNoise, 0, 1), c = clamp(pChange, 0, 1), sp = clamp(pSparse, 0, 1);
  const mix = (a, b, t) => a * (1 - t) + b * t;
  const betaMin = mix(-8.5, -4.8, s);
  const betaMaxU = mix(-1.1, -2.2, n);
  const betaMaxB = mix(-2.7, -3.4, n);
  const betaMax = mix(betaMaxU, betaMaxB, sp);
  const betaInit = mix(-5.8, -4.5, s);
  const betaDecay = mix(0.0005, 0.035, s);
  const eta = mix(0.14, 0.06, n) * mix(1.2, 0.65, c);
  const eClip = EXP(mix(LOG(20.0), LOG(1.3), n));
  const l1Shrink = mix(mix(0.012, 0.008, n), 0.0, sp);
  const wDecay = mix(mix(0.002, 0.004, c), 0.018, s);
  const sumCap = mix(0.90, 0.55, n);
  return { betaMin, betaMax, betaInit, betaDecay, eta, eClip, l1Shrink, wDecay, sumCap };
}

// ---------- DEPTH 1 (FIXED, including weight-inheriting LAST) ----------
function pairLMS(arm, D, st) {
  const { N, pa, pb } = getPairs(D);
  const w = new Float64Array(N);
  if (st && arm.inheritW && st.length >= N) w.set(st.subarray(0, N));
  let alpha = arm.alpha, eClip = arm.eClip ?? 100, l1 = arm.l1Shrink ?? 0, wd = arm.wDecay ?? 0;
  return {
    depth: 1,
    predict: bits => dotPair(w, bits, pa, pb),
    setOracle(reg) {
      if (!arm.isOracle) return;
      const clean = reg.noiseMode === 0, ultra = reg.sparseMode === 0, persist = reg.supportMode === 0;
      alpha = clean ? (ultra ? 0.014 : 0.010) : 0.005;
      eClip = clean ? 100 : 1.3;
      l1 = ultra ? 0.008 : 0.0;
      wd = persist ? 0.002 : 0.015;
    },
    learn(bits, y) {
      const p = dotPair(w, bits, pa, pb);
      const e = clamp(y - p, -eClip, eClip);
      const step = alpha * e;
      const keep = 1 - wd;
      for (let i = 0; i < N; i++) {
        const fi = bits[pa[i]] * bits[pb[i]];
        let wi = w[i] * keep + step * fi;
        if (l1 > 0) wi = wi > l1 ? wi - l1 : wi < -l1 ? wi + l1 : 0;
        w[i] = clamp(wi, -6, 6);
      }
    },
    inherit: () => (arm.inheritW ? Float64Array.from(w) : new Float64Array(0)),
  };
}

function pairDiagKal(arm, D, st) {
  const { N, pa, pb } = getPairs(D);
  const w = new Float64Array(N), P = new Float64Array(N).fill(arm.pInit ?? 0.05);
  if (st && arm.inheritW && st.length >= N) w.set(st.subarray(0, N));
  const q = arm.q, R = arm.R, eClip = arm.eClip ?? 100;
  return {
    depth: 1,
    predict: bits => dotPair(w, bits, pa, pb),
    learn(bits, y) {
      let S = R, p = 0;
      for (let i = 0; i < N; i++) {
        P[i] += q;
        S += P[i];
        p += w[i] * bits[pa[i]] * bits[pb[i]];
      }
      const e = clamp(y - p, -eClip, eClip);
      const invS = 1 / S;
      for (let i = 0; i < N; i++) {
        const fi = bits[pa[i]] * bits[pb[i]];
        const k = P[i] * invS;
        w[i] = clamp(w[i] + k * e * fi, -6, 6);
        P[i] = Math.max(1e-6, P[i] - k * P[i]);
      }
    },
    inherit: () => (arm.inheritW ? Float64Array.from(w) : new Float64Array(0)),
  };
}

// ---------- DEPTH 2 (PAIR_L2: Autostep-style per-pair adaptive step-size over N=120 pairs) ----------
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
    predict: bits => dotPair(w, bits, pa, pb),
    step(bits, y) {
      makePhi(bits, pa, pb, phi);
      let pred = 0;
      for (let i = 0; i < N; i++) pred += w[i] * phi[i];
      const rawE = y - pred;
      const e = clamp(rawE, -P.eClip, P.eClip);

      // L2: Autostep update on log step-sizes beta[i] from L1's realized error e
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
      const keep = 1 - P.wDecay;
      const l1 = P.l1Shrink;
      for (let i = 0; i < N; i++) {
        const ai = alphas[i] * sc;
        const fi = phi[i];
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
  const initP = arm.params ? { ...arm.params } : {
    betaMin: arm.betaMin ?? -6.5,
    betaMax: arm.betaMax ?? -1.8,
    betaInit: arm.betaInit ?? -5.0,
    betaDecay: arm.betaDecay ?? 0.008,
    eta: arm.eta ?? 0.10,
    eClip: arm.eClip ?? 3.0,
    l1Shrink: arm.l1Shrink ?? 0.004,
    wDecay: arm.wDecay ?? 0.006,
    sumCap: arm.sumCap ?? 0.75,
  };
  const core = makePairL2Core(D, initP, st, arm.inheritW ?? true, arm.inheritBeta ?? true);
  return {
    depth: arm.isOracle ? 3 : 2,
    predict: core.predict,
    setOracle(reg) { if (arm.isOracle) core.setParams(regimeL2Params(reg)); },
    learn(bits, y) { core.step(bits, y); },
    inherit: () => core.packState(),
  };
}

// ---------- CLASS F CHALLENGER 1: 3-EXPERT FIXED-SHARE OVER L2 VARIANTS (3 * O(D^2)) ----------
function shareL2(arm, D, st) {
  const { N, pa, pb } = getPairs(D);
  const K = arm.experts.length; // <= 3 to respect 3 * O(D^2)
  if (K > 3) throw new Error('shareL2 exceeds 3 * O(D^2) compute budget');
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
    if (bInit) {
      for (let i = 0; i < N; i++) core.beta[i] = clamp(bInit[i], ep.betaMin, ep.betaMax);
    }
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
  const etaMix = arm.etaMix ?? 0.25;
  const share = arm.share ?? 0.02;
  const lossClip = arm.lossClip ?? 4.0;
  const score = new Float64Array(K);
  return {
    depth: 2,
    predict: bits => dotPair(wMix, bits, pa, pb),
    learn(bits, y) {
      let peak = -Infinity;
      for (let k = 0; k < K; k++) {
        const { rawE } = exps[k].step(bits, y);
        // Robust Huber loss so storm spikes don't randomly scramble expert weights
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
      // Pack mixed w (120) + mixed beta (120) + probs (3) = 243 <= B_MAX=256
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

// ---------- CLASS F CHALLENGER 2: WORLD-MODEL OPEN-LOOP ESTIMATOR (1 * O(D^2)) ----------
// Knows the exact 4-axis world structure and estimates all 4 axes directly from (x, y, w_hat),
// NEVER reading L2's realized performance. Plugs estimates into interpL2Params.
function openLoopClassF(arm, D, st) {
  const { N, pa, pb } = getPairs(D);
  let pSupport = 0.5, pNoise = 0.5, pChange = 0.5, pSparse = 0.5;
  if (st && st.length >= 2 * N + 4) {
    pSupport = clamp(st[2 * N + 0], 0, 1);
    pNoise = clamp(st[2 * N + 1], 0, 1);
    pChange = clamp(st[2 * N + 2], 0, 1);
    pSparse = clamp(st[2 * N + 3], 0, 1);
  }
  const core = makePairL2Core(D, interpL2Params(pSupport, pNoise, pChange, pSparse), st, true, true);
  // Open-loop tracking buffers (within-life only)
  const wSnap = new Float64Array(N);
  wSnap.set(core.w);
  let biteCount = 0;
  let stormRate = pNoise * 0.20;
  let bigPersist = 0.5;
  let prevBig = false;
  let e2Fast = 1.0, e2Slow = 1.0;

  return {
    depth: 2,
    predict: core.predict,
    learn(bits, y) {
      const { rawE } = core.step(bits, y);
      biteCount++;

      // Axis 1 (noiseMode: clean vs storm): detect extreme |y| spikes (>5.2) OR isolated 1-bite |e| spikes (>4.2)
      const isSpike = Math.abs(y) > 5.0 || (Math.abs(rawE) > 4.2 && !prevBig);
      stormRate += 0.04 * ((isSpike ? 1 : 0) - stormRate);
      // In storm mode, P(|y|>5 | sd=5.5)*0.20 ~ 0.08 + isolated error spikes ~ 0.14; in clean ~ 0.005
      pNoise = clamp((stormRate - 0.02) / 0.08, 0, 1);

      // Axis 2 (changeMode: flip vs drift): persistent big non-storm error bursts => flip; steady moderate error => drift
      const ae = Math.abs(rawE);
      const curBig = ae > 2.2 && Math.abs(y) <= 5.0;
      if (curBig && prevBig) {
        e2Fast += 0.15 * (ae * ae - e2Fast);
      } else if (ae < 4.5) {
        e2Fast += 0.08 * (ae * ae - e2Fast);
      }
      if (ae < 4.5) e2Slow += 0.015 * (ae * ae - e2Slow);
      const ratio = e2Fast / (e2Slow + 0.1);
      // High peak-to-average ratio of non-storm errors indicates abrupt flips (changeMode=0)
      bigPersist += 0.03 * ((ratio > 1.7 ? 0 : 1) - bigPersist);
      pChange = clamp(bigPersist, 0, 1);
      prevBig = curBig;

      // Axis 3 (sparseMode: ultra k=3 vs broad k=14): effective L1/L2 support size of w_hat
      if (biteCount % 8 === 0) {
        let l1 = 0, l2 = 0, maxW = 0;
        for (let i = 0; i < N; i++) {
          const aw = Math.abs(core.w[i]);
          l1 += aw; l2 += aw * aw;
          if (aw > maxW) maxW = aw;
        }
        if (l2 > 0.25) {
          // Participation ratio (l1^2 / l2): ~3-5 for ultra (k=3), ~14-24 for broad (k=14)
          const pr = (l1 * l1) / l2;
          const spEst = clamp((pr - 6.5) / 10.0, 0, 1);
          pSparse += 0.10 * (spEst - pSparse);
        }
      }

      // Axis 0 (supportMode: persist vs turnover): overlap between |w(t)| and |w(t - 40 bites)| after a change
      if (biteCount % 40 === 0) {
        let dotAbs = 0, n1 = 0, n2 = 0, diff2 = 0;
        for (let i = 0; i < N; i++) {
          const a = Math.abs(core.w[i]), b = Math.abs(wSnap[i]);
          dotAbs += a * b; n1 += a * a; n2 += b * b;
          const d = core.w[i] - wSnap[i]; diff2 += d * d;
        }
        if (n1 > 0.2 && n2 > 0.2 && diff2 > 0.4) {
          // Weights changed significantly! Did the support |w| stay the same (cos ~ 0.7-0.9) or turn over (cos ~ 0.1-0.3)?
          const cos = dotAbs / (Math.sqrt(n1 * n2) + 1e-9);
          const turnEst = clamp((0.62 - cos) / 0.35, 0, 1);
          pSupport += 0.25 * (turnEst - pSupport);
        }
        wSnap.set(core.w);
      }

      core.setParams(interpL2Params(pSupport, pNoise, pChange, pSparse));
    },
    inherit: () => core.packState(Float64Array.of(pSupport, pNoise, pChange, pSparse)),
  };
}

// ---------- DEPTH 3: LEARNED META3 (Paired-shadow / coordinate-wise realized-performance L3) ----------
// Adapts the 4 continuous L2 meta-axes z = (z0, z1, z2, z3) in [-3, 3]^4 (sigmoid -> pSupport, pNoise, pChange, pSparse)
// using L2's realized pre-update prediction loss via 2 shadow L2 copies (total compute = 3 * O(D^2)).
// Cycles through axes (or random Rademacher directions) with paired +-c shadows on the SAME bite stream.
function meta3Pair(arm, D, st, r) {
  const { N } = getPairs(D);
  const KAX = 4;
  const mode = arm.l3 ?? 'learn'; // 'learn', 'nowrite', 'randsign', 'reset', 'evo'
  const z = new Float64Array(KAX);
  if (st && st.length >= 2 * N + KAX && mode !== 'reset') {
    for (let j = 0; j < KAX; j++) z[j] = clamp(st[2 * N + j], -3, 3);
  } else if (mode === 'evo' && arm.standing) {
    for (let j = 0; j < KAX; j++) z[j] = (r() * 2 - 1) * (arm.width ?? 2.5);
  }
  if (mode === 'evo' && st && st.length >= 2 * N + KAX) {
    if (r() < (arm.pm ?? 0.2)) {
      const j = Math.floor(r() * KAX);
      z[j] = clamp(z[j] + (arm.sm ?? 1.0) * (r() * 2 - 1), -3, 3);
    }
  }

  const sig = v => 1 / (1 + EXP(-v));
  const paramsOf = zv => interpL2Params(sig(zv[0]), sig(zv[1]), sig(zv[2]), sig(zv[3]));

  const core = makePairL2Core(D, paramsOf(z), st, true, true);
  if (mode === 'evo') {
    return {
      depth: 3,
      predict: core.predict,
      learn(bits, y) { core.step(bits, y); },
      inherit: () => core.packState(z),
    };
  }

  const Sp = makePairL2Core(D, paramsOf(z), st, true, true);
  const Sm = makePairL2Core(D, paramsOf(z), st, true, true);
  const c = arm.c ?? 1.2;
  const eta3 = arm.eta3 ?? 0.6;
  const blockLen = arm.blockLen ?? 32;
  const lossClip = arm.lossClip ?? 4.0;
  let ax = Math.floor(r() * KAX);
  let k = 0, lp = 0, lm = 0;
  const zp = new Float64Array(KAX), zm = new Float64Array(KAX);

  const syncShadows = () => {
    zp.set(z); zm.set(z);
    zp[ax] = clamp(z[ax] + c, -3, 3);
    zm[ax] = clamp(z[ax] - c, -3, 3);
    Sp.setParams(paramsOf(zp));
    Sm.setParams(paramsOf(zm));
    // Re-anchor shadows to acting core state so comparison measures the L2 update rule over the next block
    Sp.w.set(core.w); Sp.beta.set(core.beta); Sp.h.set(core.h); Sp.v.set(core.v);
    Sm.w.set(core.w); Sm.beta.set(core.beta); Sm.h.set(core.h); Sm.v.set(core.v);
    lp = 0; lm = 0; k = 0;
  };
  syncShadows();

  const hloss = e => { const a = Math.abs(e); return a <= lossClip ? 0.5 * a * a : lossClip * (a - 0.5 * lossClip); };

  return {
    depth: 3,
    predict: core.predict,
    learn(bits, y) {
      const rp = Sp.step(bits, y);
      const rm = Sm.step(bits, y);
      core.step(bits, y);
      // Skip first few bites of block so shadows diverge via their different L2 updates
      k++;
      if (k > 6) {
        lp += hloss(rp.rawE);
        lm += hloss(rm.rawE);
      }
      if (k >= blockLen) {
        const diff = lp - lm; // >0 means +c performed worse -> step negative
        if (diff !== 0 && mode !== 'nowrite') {
          const sgn = mode === 'randsign' ? (r() < 0.5 ? 1 : -1) : Math.sign(diff);
          z[ax] = clamp(z[ax] - eta3 * sgn, -3, 3);
          core.setParams(paramsOf(z));
        }
        ax = (ax + 1) % KAX;
        syncShadows();
      }
    },
    inherit: () => core.packState(z),
  };
}

const FACTORIES = { pairLMS, pairDiagKal, pairL2, shareL2, openLoopClassF, meta3Pair };

export function makeLearner(arm, D, st, r) {
  if (st && st.length > B_MAX) throw new Error(`inherited ${st.length} > B_MAX=${B_MAX}`);
  const fn = FACTORIES[arm.kind];
  if (!fn) throw new Error(`unknown learner kind ${arm.kind}`);
  const L = fn(arm, D, st, r);
  const probeLen = L.inherit().length;
  if (probeLen > B_MAX) throw new Error(`${arm.name} inherits ${probeLen} > B_MAX=${B_MAX}`);
  return L;
}
