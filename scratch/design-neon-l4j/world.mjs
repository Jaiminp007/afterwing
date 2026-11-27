// Pairwise sparse-support 16-regime world (N = C(D,2) = 120 pairwise Walsh features for D=16).
// Exports createWorld(seed, D) -> { step(tick), value(bits), noiseSd(), regimeInfo() }.
//
// 4 orthogonal binary axes => 2^4 = 16 regimes:
//   axis 0: supportMode  0=persist (same k pairs stay active across flips), 1=turnover (fresh random k pairs each switch)
//   axis 1: noiseMode    0=clean (sd=0.30), 1=storm (sd=0.35 + 18% ticks with sd=5.5 heavy-tail spikes)
//   axis 2: changeMode   0=flip (abrupt full weight redraw every subEvery ticks), 1=drift (smooth continuous drift + rare turnover)
//   axis 3: sparseMode   0=ultra (k=3 active pairs), 1=broad (k=14 active pairs)
//
// Why this tests the compute barrier against Class F:
//   - Feature dimension is N = C(D,2) = O(D^2) = 120.
//   - Full-covariance Kalman / matrix-Q over pairs is O(N^2) = O(D^4) (20x over the 3*O(D^2) budget).
//   - Flat mixture / fixed-share over 16 L2 variants is 16*O(D^2) (5.3x over budget); legal 3-expert
//     fixed-share can cover at most 3 of the 16 corners.
//   - Marginal E[value(x)^2] = S^2 is invariant across all 16 regimes, and every pair is equally likely
//     to be active (zero static target-direction content in the regime ID).

function makeRng(seed) {
  let s = seed >>> 0;
  const sm = () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ z >>> 16, 0x85ebca6b);
    z = Math.imul(z ^ z >>> 13, 0xc2b2ae35);
    return (z ^ z >>> 16) >>> 0;
  };
  let a = sm(), b = sm(), c = sm(), d = sm();
  const r = () => {
    const t = (((a + b) | 0) + d) | 0; d = (d + 1) | 0;
    a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) r();
  return r;
}

export function pairIndex(D) {
  const pa = [], pb = [];
  for (let i = 0; i < D; i++) for (let j = i + 1; j < D; j++) { pa.push(i); pb.push(j); }
  return { N: pa.length, pa: Int8Array.from(pa), pb: Int8Array.from(pb) };
}

export function createWorld(seed, D, opts = {}) {
  const r = makeRng(seed);
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const { N, pa, pb } = pairIndex(D);
  const sampleIdx = (n, m) => {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = 0; i < m; i++) {
      const j = i + Math.floor(r() * (n - i));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx.slice(0, m);
  };

  const S = opts.S ?? 2.2;
  const stayMean = opts.stayMean ?? 2000;
  const subEvery = opts.subEvery ?? 160;
  const fixedRegime = opts.fixedRegime ?? -1; // >=0 locks a single regime (for diagnostics)

  const w = new Float64Array(N);
  let active = [];
  let regimeId = fixedRegime >= 0 ? fixedRegime : Math.floor(r() * 16);
  let stayLeft = Math.max(800, Math.round(-Math.log(1 - r()) * stayMean));
  let subLeft = subEvery;
  let curSd = 0.3;

  const decode = id => ({
    id,
    supportMode: (id >> 0) & 1, // 0=persist, 1=turnover
    noiseMode: (id >> 1) & 1,   // 0=clean,   1=storm
    changeMode: (id >> 2) & 1,  // 0=flip,    1=drift
    sparseMode: (id >> 3) & 1,  // 0=ultra(3),1=broad(14)
  });

  let reg = decode(regimeId);

  const normalize = () => {
    let s2 = 0;
    for (let i = 0; i < active.length; i++) { const v = w[active[i]]; s2 += v * v; }
    const sc = S / (Math.sqrt(s2) || 1);
    for (let i = 0; i < active.length; i++) w[active[i]] *= sc;
  };

  const drawSupportAndWeights = (freshSupport) => {
    const k = reg.sparseMode === 0 ? 3 : 14;
    if (freshSupport || active.length !== k) {
      w.fill(0);
      active = sampleIdx(N, k);
    }
    for (let i = 0; i < active.length; i++) {
      // Draw away from zero so every active pair carries real signal
      const sgn = r() < 0.5 ? -1 : 1;
      w[active[i]] = sgn * (0.6 + 0.8 * r());
    }
    normalize();
  };

  const updateSd = () => {
    if (reg.noiseMode === 0) {
      curSd = reg.changeMode === 1 ? 0.65 : 0.30;
    } else {
      curSd = r() < 0.20 ? 5.5 : 0.35;
    }
  };

  drawSupportAndWeights(true);
  updateSd();

  return {
    step(tick) {
      let changed = false;
      if (fixedRegime < 0 && --stayLeft <= 0) {
        let next = Math.floor(r() * 15);
        if (next >= regimeId) next++;
        regimeId = next;
        reg = decode(regimeId);
        stayLeft = Math.max(800, Math.round(-Math.log(1 - r()) * stayMean));
        subLeft = subEvery;
        drawSupportAndWeights(true);
        changed = true;
      } else if (reg.changeMode === 0) {
        if (--subLeft <= 0) {
          subLeft = subEvery;
          drawSupportAndWeights(reg.supportMode === 1);
          changed = true;
        }
      } else {
        // drift mode: continuous random walk on active pairs; if turnover, replace 1 active pair periodically
        const sig = reg.sparseMode === 0 ? 0.045 : 0.025;
        for (let i = 0; i < active.length; i++) w[active[i]] += sig * randn();
        if (reg.supportMode === 1 && --subLeft <= 0) {
          subLeft = Math.round(subEvery / 2);
          // Replace half the active pairs
          const k = active.length, rep = Math.max(1, Math.floor(k / 2));
          const inSet = new Set(active);
          const off = [];
          for (let p = 0; p < N; p++) if (!inSet.has(p)) off.push(p);
          for (let j = 0; j < rep; j++) {
            const dropIdx = Math.floor(r() * active.length);
            w[active[dropIdx]] = 0;
            const pickOff = Math.floor(r() * off.length);
            const np = off[pickOff];
            off.splice(pickOff, 1);
            active[dropIdx] = np;
            w[np] = (r() < 0.5 ? -1 : 1) * (0.6 + 0.8 * r());
          }
        }
        normalize();
        changed = true;
      }
      updateSd();
      return changed;
    },
    value(bits) {
      let z = 0;
      for (let i = 0; i < active.length; i++) {
        const p = active[i];
        z += w[p] * bits[pa[p]] * bits[pb[p]];
      }
      return z;
    },
    noiseSd() { return curSd; },
    regimeInfo() { return reg; },
  };
}
