// World V2: 3 ultra-sharp orthogonal non-target axes => 2^3 = 8 regimes on N = C(12,2) = 66 pairwise Walsh features.
//   axis 0: supportMode  0=persist (same k pairs, fast flips every 180 ticks)
//                        1=turnover (fresh random k pairs every 520 ticks, static weights between turnovers)
//   axis 1: noiseMode    0=clean (sd=0.20)
//                        1=storm (sd=0.30 + 25% ticks with sd=8.5 extreme outlier spikes)
//   axis 2: sparseMode   0=ultra (k=2 active pairs)
//                        1=semi  (k=10 active pairs)
//
// Invariants:
//   - Exact WorldL4H interface: createWorld(seed, D) -> { step(tick), value(bits), noiseSd(), regimeInfo() }
//   - Constant signal RMS S = 2.6 across all 8 regimes.
//   - Every pair in {0..N-1} is uniformly likely to be active with symmetric +- weights (zero static target direction in regimeId).

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
  const { N, pa, pb } = pairIndex(D);
  const sampleIdx = (n, m) => {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = 0; i < m; i++) {
      const j = i + Math.floor(r() * (n - i));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx.slice(0, m);
  };

  const S = opts.S ?? 2.6;
  const stayMean = opts.stayMean ?? 2400;
  const fixedRegime = opts.fixedRegime ?? -1;

  const w = new Float64Array(N);
  let active = [];
  let regimeId = fixedRegime >= 0 ? fixedRegime : Math.floor(r() * 8);
  let stayLeft = Math.max(1200, Math.round(-Math.log(1 - r()) * stayMean));
  let curSd = 0.2;

  const decode = id => ({
    id,
    supportMode: (id >> 0) & 1, // 0=persist, 1=turnover
    noiseMode: (id >> 1) & 1,   // 0=clean,   1=storm
    sparseMode: (id >> 2) & 1,  // 0=ultra(2),1=semi(10)
  });

  let reg = decode(regimeId);
  const subCadence = () => (reg.supportMode === 0 ? 180 : 520);
  let subLeft = subCadence();

  const normalize = () => {
    let s2 = 0;
    for (let i = 0; i < active.length; i++) { const v = w[active[i]]; s2 += v * v; }
    const sc = S / (Math.sqrt(s2) || 1);
    for (let i = 0; i < active.length; i++) w[active[i]] *= sc;
  };

  const drawSupportAndWeights = (freshSupport) => {
    const k = reg.sparseMode === 0 ? 2 : 10;
    if (freshSupport || active.length !== k) {
      w.fill(0);
      active = sampleIdx(N, k);
    }
    for (let i = 0; i < active.length; i++) {
      const sgn = r() < 0.5 ? -1 : 1;
      w[active[i]] = sgn * (0.7 + 0.6 * r());
    }
    normalize();
  };

  const updateSd = () => {
    curSd = reg.noiseMode === 0 ? 0.20 : (r() < 0.25 ? 8.5 : 0.30);
  };

  drawSupportAndWeights(true);
  updateSd();

  return {
    step(tick) {
      let changed = false;
      if (fixedRegime < 0 && --stayLeft <= 0) {
        let next = Math.floor(r() * 7);
        if (next >= regimeId) next++;
        regimeId = next;
        reg = decode(regimeId);
        stayLeft = Math.max(1200, Math.round(-Math.log(1 - r()) * stayMean));
        subLeft = subCadence();
        drawSupportAndWeights(true);
        changed = true;
      } else if (--subLeft <= 0) {
        subLeft = subCadence();
        drawSupportAndWeights(reg.supportMode === 1);
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
