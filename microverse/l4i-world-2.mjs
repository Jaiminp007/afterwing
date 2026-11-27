/*
 * World family: l4i-world-2
 *
 * Declared scope:
 *   Foraging worlds whose food-quality rules change over time, in ways that
 *   differ across worlds and over time within each world, and whose rate and
 *   character of change vary within a fly's lifetime (<= 2400 ticks) and
 *   across the full 20,000-tick ecology run.
 *
 * Interface:
 *   createWorld(seed, D) -> { step(tick), value(bits), noiseSd() }
 *   - seed: 32-bit integer. All randomness is derived solely from `seed` via
 *     a local SplitMix32-seeded sfc32 PRNG (no globals, no Math.random, no I/O).
 *   - D: odor code dimensionality (16 in the standard ecology; works for D >= 8).
 *   - step(tick): advances hidden world state for tick = 1..20000+ and returns
 *     true iff the food-value mapping `value(bits)` changed on this tick.
 *   - value(bits): pure function mapping Int8Array(D) with entries in {-1, +1}
 *     to real-valued food quality (> 0 nutritious, <= 0 toxic), zero-centered
 *     with |value| typically of order 1..3 and exact sign balance P(v > 0) = 0.5.
 *   - noiseSd(): pure function returning the current Gaussian taste-noise SD,
 *     bounded in [0.30, 2.00].
 *
 * Seed selection:
 *   `seed` initializes a local sfc32 PRNG (seeded with 4 SplitMix32 words plus
 *   12 warmup draws for full avalanche across consecutive integer seeds).
 *   The first uniform draw selects one of the 6 world types with equal
 *   probability (1/6 each):
 *     0: punctuated_ecology
 *     1: seasonal_mosaic
 *     2: hierarchical_chemistry
 *     3: stochastic_volatility_drift
 *     4: ecological_niches
 *     5: sparse_species_turnover
 *   Subsequent draws from the same PRNG sample that world type's per-seed
 *   parameters, initial food rule, and all future stochastic transitions.
 *
 * World types and parameter ranges:
 *
 *   0. punctuated_ecology
 *      Alternates between calm plateaus (static or gentle micro-drift) and
 *      diverse ecological disruptions: rapid tangent-sphere drift storms,
 *      instantaneous sparse cue turnovers, partial sign reversals (mimicry
 *      shocks biased toward strong cues), and global regime shifts (abrupt or
 *      short-ramp). Calm plateaus also experience occasional sensory-fog
 *      episodes that raise taste noise without changing food values.
 *      Parameters:
 *        targetNorm  in [2.0, 2.8]
 *        calmMin     in [120, 260], calmMax in [380, 750] ticks
 *        microDrift  boolean (p = 0.5), microStride in [8, 20], microSd in [0.008, 0.024]
 *        stormMin    in [60, 110], stormMax in [120, 200] ticks, stormStride in [2, 5], stormSd in [0.08, 0.16]
 *        sparseK     in [3, 6] cues; flipK in [3, 7] cues; globalBlend in [0.65, 0.90]
 *        fogProb     in [0.25, 0.55] per plateau, fogLen in [80, 220] ticks
 *        noiseLow    in [0.35, 0.70], noiseHigh in [1.20, 1.90]
 *
 *   1. seasonal_mosaic
 *      Cycles (with occasional skips/reversals) among M recurring seasonal
 *      prototypes that slowly co-evolve across visits. Transitions between
 *      seasons vary between smooth spherical interpolation (gradual ramps) and
 *      abrupt 1-tick weather-front switches. Seasons have distinct taste-noise
 *      baselines and occasional mid-season blights that transiently invert or
 *      perturb a subset of odor cues before partially or fully receding.
 *      Parameters:
 *        M           in {3, 4} seasonal prototypes
 *        targetNorm  in [2.0, 2.9]
 *        seasonMin   in [220, 420], seasonMax in [550, 950] ticks
 *        pGradual    in [0.35, 0.70], rampMin in [60, 110], rampMax in [130, 220] ticks
 *        pSkip       in [0.15, 0.35], protoDrift in [0.15, 0.40] rad per revisit
 *        blightProb  in [0.35, 0.65] per season, blightK in [2, 4] cues, blightLen in [80, 200] ticks
 *        noiseLow    in [0.35, 0.70], noiseHigh in [1.15, 1.90]
 *
 *   2. hierarchical_chemistry
 *      Splits odor dimensions into a stable "core" chemistry subset and a
 *      faster "volatile" secondary subset. The volatile layer undergoes
 *      continuous spherical diffusion whose volatility switches between calm
 *      and turbulent regimes within a lifetime. The core layer holds steady
 *      for longer intervals before undergoing one of three distinct events:
 *      partial sign flip, core-volatile role swap, or smooth core migration.
 *      Parameters:
 *        kCore       in [4, 6] core dims (rest volatile)
 *        coreFrac    in [0.55, 0.72] share of squared norm in core
 *        targetNorm  in [2.1, 2.9]
 *        fastStride  in [4, 12] ticks
 *        fastLowSd   in [0.015, 0.045], fastHighSd in [0.10, 0.22]
 *        volDwellMin in [180, 300], volDwellMax in [360, 580] ticks
 *        coreHoldMin in [420, 680], coreHoldMax in [780, 1200] ticks
 *        migLen      in [80, 180] ticks
 *        noiseLow    in [0.35, 0.75], noiseHigh in [1.15, 1.90]
 *
 *   3. stochastic_volatility_drift
 *      A regime-switching continuous environment that transitions every few
 *      hundred ticks among four distinct movement modes: quiet holds (static),
 *      slow isotropic diffusion, coherent ballistic great-circle sweeps, and
 *      fast chaotic diffusion, overlaid with occasional discrete Householder
 *      reflection or large-angle rotation jumps. Taste noise follows a smooth
 *      bounded stochastic process partially coupled to regime volatility.
 *      Parameters:
 *        targetNorm  in [2.0, 2.9]
 *        modeMin     in [160, 280], modeMax in [340, 560] ticks
 *        slowStride  in [4, 8], slowSd in [0.02, 0.05]
 *        fastStride  in [2, 4], fastSd in [0.09, 0.17]
 *        omega       in [0.004, 0.012] rad/tick (ballistic sweep speed)
 *        jumpMin     in [420, 650], jumpMax in [750, 1150] ticks
 *        noiseMin    in [0.32, 0.65], noiseMax in [1.20, 1.95]
 *
 *   4. ecological_niches
 *      Combines a linear base food chemistry with a context-gated pairwise
 *      interaction controlled by a marker odor bit:
 *        value(bits) = dot(wBase, bits) + bits[marker] * dot(wDiff, bits)
 *      with wBase[marker] = wDiff[marker] = 0 (guaranteeing exact sign
 *      symmetry under negating all bits except `marker`). Within a lifetime,
 *      the world cycles across phases: linear calm, mimicry/niche surges
 *      (where interaction share rises while taste noise may stay low), base
 *      rotations or sparse flips, and marker-plus-base turnovers.
 *      Parameters:
 *        targetNorm  in [2.0, 2.9]
 *        phaseMin    in [180, 300], phaseMax in [380, 620] ticks
 *        lowFrac     in [0.02, 0.08], highFrac in [0.22, 0.36] interaction variance share
 *        rampLen     in [60, 150] ticks, sparseK in [3, 6] cues
 *        noiseLow    in [0.32, 0.70], noiseHigh in [1.15, 1.85]
 *
 *   5. sparse_species_turnover
 *      Only a dynamic roster of k active odor cues determines food quality at
 *      any time; inactive cues carry zero weight. Regimes switch within a
 *      lifetime among dormant stable rosters (with occasional noise fog),
 *      gradual 1-for-1 ecological succession (smooth fade-in/fade-out), rapid
 *      multi-cue bloom waves, and abrupt spoilage outbreaks that invert signs
 *      of active cues.
 *      Parameters:
 *        kActive     in [5, 10] active cues (capped by D - 2)
 *        targetNorm  in [2.0, 2.8]
 *        regimeMin   in [180, 320], regimeMax in [400, 680] ticks
 *        fadeMin     in [40, 80], fadeMax in [90, 150] ticks
 *        succStepMin in [70, 110], succStepMax in [120, 180] ticks
 *        noiseLow    in [0.35, 0.70], noiseHigh in [1.15, 1.90]
 */

const WORLD_TYPES = [
  'punctuated_ecology',
  'seasonal_mosaic',
  'hierarchical_chemistry',
  'stochastic_volatility_drift',
  'ecological_niches',
  'sparse_species_turnover',
];

const NOISE_FLOOR = 0.30;
const NOISE_CEIL = 2.00;

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

function makeRng(seed) {
  let z = (seed >>> 0) ^ 0x6d2b79f5;
  const nextSm = () => {
    z = (z + 0x9e3779b9) >>> 0;
    let t = z;
    t = Math.imul(t ^ (t >>> 16), 0x85ebca6b);
    t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35);
    return (t ^ (t >>> 16)) >>> 0;
  };
  let a = nextSm(), b = nextSm(), c = nextSm(), d = nextSm() | 1;
  let hasSpare = false;
  let spare = 0;

  const rand = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) rand();

  const uniform = (lo, hi) => lo + (hi - lo) * rand();
  const randInt = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  const randn = () => {
    if (hasSpare) {
      hasSpare = false;
      return spare;
    }
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    const th = 2 * Math.PI * v;
    spare = r * Math.sin(th);
    hasSpare = true;
    return r * Math.cos(th);
  };
  const sampleK = (n, k) => {
    const idx = new Int32Array(n);
    for (let i = 0; i < n; i++) idx[i] = i;
    const m = Math.min(k, n);
    for (let i = 0; i < m; i++) {
      const j = i + Math.floor(rand() * (n - i));
      const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
    }
    return idx.subarray(0, m);
  };

  return { rand, uniform, randInt, randn, sampleK };
}

function norm2(v) {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function scaleTo(v, target, rng) {
  let n = norm2(v);
  if (n < 1e-12) {
    for (let i = 0; i < v.length; i++) v[i] = rng.randn();
    n = norm2(v) || 1;
  }
  const f = target / n;
  for (let i = 0; i < v.length; i++) v[i] *= f;
}

function randSphere(out, radius, rng) {
  for (let i = 0; i < out.length; i++) out[i] = rng.randn();
  scaleTo(out, radius, rng);
}

function tangentStep(w, targetNorm, stepRad, scratch, rng) {
  const D = w.length;
  for (let i = 0; i < D; i++) scratch[i] = rng.randn();
  const n2 = dot(w, w);
  if (n2 > 1e-12) {
    const proj = dot(scratch, w) / n2;
    for (let i = 0; i < D; i++) scratch[i] -= proj * w[i];
  }
  const scale = (targetNorm * stepRad) / Math.sqrt(Math.max(1, D - 1));
  for (let i = 0; i < D; i++) w[i] += scale * scratch[i];
  scaleTo(w, targetNorm, rng);
}

function slerpInto(out, a, b, t, targetNorm) {
  const D = out.length;
  const na = norm2(a) || 1;
  const nb = norm2(b) || 1;
  let c = 0;
  for (let i = 0; i < D; i++) c += (a[i] / na) * (b[i] / nb);
  c = clamp(c, -1, 1);

  if (c > 0.9995) {
    for (let i = 0; i < D; i++) out[i] = (1 - t) * (a[i] / na) + t * (b[i] / nb);
    const n = norm2(out) || 1;
    const f = targetNorm / n;
    for (let i = 0; i < D; i++) out[i] *= f;
    return;
  }

  if (c < -0.9995) {
    // Pick the standard basis axis least aligned with a to form an orthogonal plane.
    let minIdx = 0, minAbs = Math.abs(a[0] / na);
    for (let i = 1; i < D; i++) {
      const av = Math.abs(a[i] / na);
      if (av < minAbs) { minAbs = av; minIdx = i; }
    }
    const ai = a[minIdx] / na;
    let pn2 = 0;
    for (let i = 0; i < D; i++) {
      const p = (i === minIdx ? 1 : 0) - ai * (a[i] / na);
      out[i] = p;
      pn2 += p * p;
    }
    const pn = Math.sqrt(pn2) || 1;
    const ct = Math.cos(Math.PI * t);
    const st = Math.sin(Math.PI * t);
    for (let i = 0; i < D; i++) out[i] = targetNorm * (ct * (a[i] / na) + st * (out[i] / pn));
    return;
  }

  const theta = Math.acos(c);
  const s = Math.sin(theta);
  const w0 = Math.sin((1 - t) * theta) / s;
  const w1 = Math.sin(t * theta) / s;
  for (let i = 0; i < D; i++) {
    out[i] = targetNorm * (w0 * (a[i] / na) + w1 * (b[i] / nb));
  }
}

function dotBits(w, bits) {
  let s = 0;
  for (let i = 0; i < w.length; i++) s += w[i] * bits[i];
  return s;
}

// ---------------------------------------------------------------------------
// Type 0: punctuated_ecology
// ---------------------------------------------------------------------------
function createPunctuatedEcology(D, rng) {
  const targetNorm = rng.uniform(2.0, 2.8);
  const calmMin = rng.randInt(120, 260);
  const calmMax = rng.randInt(380, 750);
  const microDrift = rng.rand() < 0.5;
  const microStride = rng.randInt(8, 20);
  const microSd = rng.uniform(0.008, 0.024);
  const stormMin = rng.randInt(60, 110);
  const stormMax = rng.randInt(120, 200);
  const stormStride = rng.randInt(2, 5);
  const stormSd = rng.uniform(0.08, 0.16);
  const sparseKMin = 3;
  const sparseKMax = Math.min(6, Math.max(3, D - 2));
  const flipKMin = 3;
  const flipKMax = Math.min(7, Math.max(3, D - 2));
  const globalBlendMin = 0.65;
  const globalBlendMax = 0.90;
  const fogProb = rng.uniform(0.25, 0.55);
  const noiseLow = rng.uniform(0.35, 0.70);
  const noiseHigh = rng.uniform(1.20, 1.90);
  const noiseMid = 0.5 * (noiseLow + noiseHigh);

  // Per-seed event mixture weights (storm, sparse, flip, global).
  const evW = [
    rng.uniform(0.6, 1.4),
    rng.uniform(0.6, 1.4),
    rng.uniform(0.6, 1.4),
    rng.uniform(0.5, 1.2),
  ];
  const evSum = evW[0] + evW[1] + evW[2] + evW[3];

  const w = new Float64Array(D);
  const wFrom = new Float64Array(D);
  const wTo = new Float64Array(D);
  const scratch = new Float64Array(D);
  randSphere(w, targetNorm, rng);

  let state = 'calm'; // 'calm' | 'storm' | 'ramp'
  let timer = rng.randInt(calmMin, calmMax);
  let phaseStep = 0;
  let rampTotal = 1;
  let fogDelay = -1;
  let fogLeft = 0;
  let shockNoiseLeft = 0;
  let curNoise = noiseLow;

  const scheduleFog = (calmDur) => {
    if (calmDur > 140 && rng.rand() < fogProb) {
      const len = Math.min(calmDur - 40, rng.randInt(80, 220));
      fogDelay = rng.randInt(20, Math.max(20, calmDur - len - 10));
      fogLeft = len;
    } else {
      fogDelay = -1;
      fogLeft = 0;
    }
  };
  scheduleFog(timer);

  const pickEvent = () => {
    let r = rng.rand() * evSum;
    for (let i = 0; i < 4; i++) {
      r -= evW[i];
      if (r <= 0) return i;
    }
    return 3;
  };

  const enterCalm = () => {
    state = 'calm';
    timer = rng.randInt(calmMin, calmMax);
    phaseStep = 0;
    scheduleFog(timer);
  };

  return {
    step(tick) {
      let changed = false;
      phaseStep++;

      if (state === 'calm') {
        if (microDrift && phaseStep % microStride === 0) {
          tangentStep(w, targetNorm, microSd, scratch, rng);
          changed = true;
        }
        let targetNoise = noiseLow;
        if (shockNoiseLeft > 0) {
          shockNoiseLeft--;
          targetNoise = Math.max(targetNoise, noiseMid + 0.35 * (noiseHigh - noiseMid));
        }
        if (fogDelay > 0) {
          fogDelay--;
        } else if (fogDelay === 0 && fogLeft > 0) {
          fogLeft--;
          targetNoise = noiseHigh;
        }
        curNoise += 0.08 * (targetNoise - curNoise);

        timer--;
        if (timer <= 0) {
          const ev = pickEvent();
          if (ev === 0) {
            // Rapid drift storm
            state = 'storm';
            timer = rng.randInt(stormMin, stormMax);
            phaseStep = 0;
          } else if (ev === 1) {
            // Instantaneous sparse cue turnover
            const k = rng.randInt(sparseKMin, sparseKMax);
            const idx = rng.sampleK(D, k);
            const perDimSd = targetNorm / Math.sqrt(D);
            for (let i = 0; i < idx.length; i++) {
              w[idx[i]] = perDimSd * rng.randn();
            }
            scaleTo(w, targetNorm, rng);
            shockNoiseLeft = rng.randInt(35, 95);
            changed = true;
            enterCalm();
          } else if (ev === 2) {
            // Partial sign reversal biased toward currently strong cues
            const k = rng.randInt(flipKMin, flipKMax);
            const scores = new Float64Array(D);
            for (let i = 0; i < D; i++) scores[i] = Math.abs(w[i]) + 0.35 * rng.rand();
            const order = Array.from({ length: D }, (_, i) => i);
            order.sort((i, j) => scores[j] - scores[i]);
            for (let i = 0; i < k; i++) w[order[i]] = -w[order[i]];
            // Tiny nudge so weights remain generic
            tangentStep(w, targetNorm, 0.03, scratch, rng);
            shockNoiseLeft = rng.randInt(45, 110);
            changed = true;
            enterCalm();
          } else {
            // Global regime shift: half abrupt, half short smooth ramp
            const blend = rng.uniform(globalBlendMin, globalBlendMax);
            randSphere(scratch, targetNorm, rng);
            wFrom.set(w);
            for (let i = 0; i < D; i++) {
              wTo[i] = (1 - blend) * w[i] + blend * scratch[i];
            }
            scaleTo(wTo, targetNorm, rng);
            if (rng.rand() < 0.5) {
              w.set(wTo);
              shockNoiseLeft = rng.randInt(50, 120);
              changed = true;
              enterCalm();
            } else {
              state = 'ramp';
              rampTotal = rng.randInt(25, 70);
              timer = rampTotal;
              phaseStep = 0;
            }
          }
        }
      } else if (state === 'storm') {
        if (phaseStep % stormStride === 0) {
          tangentStep(w, targetNorm, stormSd, scratch, rng);
          changed = true;
        }
        curNoise += 0.12 * (noiseHigh - curNoise);
        timer--;
        if (timer <= 0) enterCalm();
      } else {
        // state === 'ramp'
        const frac = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, phaseStep / rampTotal));
        slerpInto(w, wFrom, wTo, frac, targetNorm);
        changed = true;
        curNoise += 0.10 * (noiseMid - curNoise);
        timer--;
        if (timer <= 0) {
          w.set(wTo);
          enterCalm();
        }
      }

      curNoise = clamp(curNoise, NOISE_FLOOR, NOISE_CEIL);
      return changed;
    },
    value(bits) {
      return dotBits(w, bits);
    },
    noiseSd() {
      return curNoise;
    },
  };
}

// ---------------------------------------------------------------------------
// Type 1: seasonal_mosaic
// ---------------------------------------------------------------------------
function createSeasonalMosaic(D, rng) {
  const M = rng.rand() < 0.5 ? 3 : 4;
  const targetNorm = rng.uniform(2.0, 2.9);
  const seasonMin = rng.randInt(220, 420);
  const seasonMax = rng.randInt(550, 950);
  const pGradual = rng.uniform(0.35, 0.70);
  const rampMin = rng.randInt(60, 110);
  const rampMax = rng.randInt(130, 220);
  const pSkip = rng.uniform(0.15, 0.35);
  const protoDrift = rng.uniform(0.15, 0.40);
  const blightProb = rng.uniform(0.35, 0.65);
  const blightKMin = 2;
  const blightKMax = Math.min(4, Math.max(2, D - 2));
  const noiseLow = rng.uniform(0.35, 0.70);
  const noiseHigh = rng.uniform(1.15, 1.90);

  // Build M well-separated prototypes.
  const protos = [];
  const scratch = new Float64Array(D);
  for (let m = 0; m < M; m++) {
    const p = new Float64Array(D);
    for (let tries = 0; tries < 30; tries++) {
      randSphere(p, targetNorm, rng);
      let ok = true;
      for (let j = 0; j < m; j++) {
        const cos = dot(p, protos[j]) / (targetNorm * targetNorm);
        if (Math.abs(cos) > 0.40) { ok = false; break; }
      }
      if (ok) break;
    }
    protos.push(p);
  }

  // Spread seasonal noise baselines across [noiseLow, noiseHigh].
  const seasonNoise = new Float64Array(M);
  const order = rng.sampleK(M, M);
  for (let i = 0; i < M; i++) {
    const frac = M > 1 ? i / (M - 1) : 0.5;
    seasonNoise[order[i]] = clamp(
      noiseLow + frac * (noiseHigh - noiseLow) + rng.uniform(-0.08, 0.08),
      NOISE_FLOOR,
      NOISE_CEIL
    );
  }

  let curSeason = 0;
  let nextSeason = 1;
  const w = new Float64Array(D);
  const wFrom = new Float64Array(D);
  const wBlight = new Float64Array(D);
  w.set(protos[curSeason]);

  let mode = 'season'; // 'season' | 'ramp'
  let timer = rng.randInt(seasonMin, seasonMax);
  let rampStep = 0;
  let rampTotal = 1;
  let curNoise = seasonNoise[curSeason];

  // Mid-season blight state
  let blightDelay = -1;
  let blightLeft = 0;
  let blightActive = false;

  const scheduleBlight = (dur) => {
    blightActive = false;
    if (dur > 180 && rng.rand() < blightProb) {
      const len = Math.min(dur - 80, rng.randInt(80, 200));
      blightDelay = rng.randInt(35, Math.max(35, dur - len - 30));
      blightLeft = len;
    } else {
      blightDelay = -1;
      blightLeft = 0;
    }
  };
  scheduleBlight(timer);

  const chooseNextSeason = () => {
    if (rng.rand() < pSkip) {
      const step = rng.randInt(1, M - 1);
      return (curSeason + step) % M;
    }
    return (curSeason + 1) % M;
  };

  const evolvePrototype = (m) => {
    tangentStep(protos[m], targetNorm, protoDrift, scratch, rng);
  };

  return {
    step() {
      let changed = false;

      if (mode === 'season') {
        let targetNoise = seasonNoise[curSeason];

        if (blightDelay > 0) {
          blightDelay--;
        } else if (blightDelay === 0 && !blightActive && blightLeft > 0) {
          // Trigger mid-season blight: invert or scramble a small subset of cues
          blightActive = true;
          wBlight.set(protos[curSeason]);
          const k = rng.randInt(blightKMin, blightKMax);
          const idx = rng.sampleK(D, k);
          const invert = rng.rand() < 0.65;
          const perDimSd = targetNorm / Math.sqrt(D);
          for (let i = 0; i < idx.length; i++) {
            const j = idx[i];
            wBlight[j] = invert ? -wBlight[j] : perDimSd * rng.randn();
          }
          scaleTo(wBlight, targetNorm, rng);
          w.set(wBlight);
          changed = true;
        } else if (blightActive) {
          blightLeft--;
          targetNoise = Math.max(targetNoise, 0.4 * noiseLow + 0.6 * noiseHigh);
          if (blightLeft <= 0) {
            blightActive = false;
            // Partially recover toward season prototype (or fully recover)
            if (rng.rand() < 0.35) {
              for (let i = 0; i < D; i++) protos[curSeason][i] = 0.75 * protos[curSeason][i] + 0.25 * wBlight[i];
              scaleTo(protos[curSeason], targetNorm, rng);
            }
            w.set(protos[curSeason]);
            changed = true;
          }
        }

        curNoise += 0.08 * (targetNoise - curNoise);
        timer--;

        if (timer <= 0) {
          nextSeason = chooseNextSeason();
          evolvePrototype(nextSeason);
          blightActive = false;
          if (rng.rand() < pGradual) {
            mode = 'ramp';
            wFrom.set(w);
            rampTotal = rng.randInt(rampMin, rampMax);
            rampStep = 0;
          } else {
            curSeason = nextSeason;
            w.set(protos[curSeason]);
            timer = rng.randInt(seasonMin, seasonMax);
            scheduleBlight(timer);
            changed = true;
          }
        }
      } else {
        // Smooth seasonal transition
        rampStep++;
        const frac = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, rampStep / rampTotal));
        slerpInto(w, wFrom, protos[nextSeason], frac, targetNorm);
        changed = true;

        const baseN = (1 - frac) * seasonNoise[curSeason] + frac * seasonNoise[nextSeason];
        const bump = 0.22 * Math.sin(Math.PI * frac);
        curNoise += 0.12 * (baseN + bump - curNoise);

        if (rampStep >= rampTotal) {
          curSeason = nextSeason;
          w.set(protos[curSeason]);
          mode = 'season';
          timer = rng.randInt(seasonMin, seasonMax);
          scheduleBlight(timer);
        }
      }

      curNoise = clamp(curNoise, NOISE_FLOOR, NOISE_CEIL);
      return changed;
    },
    value(bits) {
      return dotBits(w, bits);
    },
    noiseSd() {
      return curNoise;
    },
  };
}

// ---------------------------------------------------------------------------
// Type 2: hierarchical_chemistry
// ---------------------------------------------------------------------------
function createHierarchicalChemistry(D, rng) {
  const kCore = Math.min(rng.randInt(4, 6), Math.max(2, D - 4));
  const coreFrac = rng.uniform(0.55, 0.72);
  const targetNorm = rng.uniform(2.1, 2.9);
  const coreNorm = targetNorm * Math.sqrt(coreFrac);
  const volNorm = targetNorm * Math.sqrt(1 - coreFrac);

  const fastStride = rng.randInt(4, 12);
  const fastLowSd = rng.uniform(0.015, 0.045);
  const fastHighSd = rng.uniform(0.10, 0.22);
  const volDwellMin = rng.randInt(180, 300);
  const volDwellMax = rng.randInt(360, 580);
  const coreHoldMin = rng.randInt(420, 680);
  const coreHoldMax = rng.randInt(780, 1200);
  const migLenMin = 80;
  const migLenMax = 180;
  const noiseLow = rng.uniform(0.35, 0.75);
  const noiseHigh = rng.uniform(1.15, 1.90);
  const wavePeriod = rng.uniform(550, 1400);
  const wavePhase = rng.uniform(0, 2 * Math.PI);

  const isCore = new Uint8Array(D);
  const initCore = rng.sampleK(D, kCore);
  for (let i = 0; i < initCore.length; i++) isCore[initCore[i]] = 1;

  const wCore = new Float64Array(kCore);
  const wCoreFrom = new Float64Array(kCore);
  const wCoreTo = new Float64Array(kCore);
  const wVol = new Float64Array(D - kCore);
  const scratchVol = new Float64Array(D - kCore);
  const coreIdx = new Int32Array(kCore);
  const volIdx = new Int32Array(D - kCore);
  const w = new Float64Array(D);

  const rebuildIndexMaps = () => {
    let ci = 0, vi = 0;
    for (let i = 0; i < D; i++) {
      if (isCore[i]) coreIdx[ci++] = i;
      else volIdx[vi++] = i;
    }
  };
  rebuildIndexMaps();

  randSphere(wCore, coreNorm, rng);
  randSphere(wVol, volNorm, rng);

  const assembleW = () => {
    for (let i = 0; i < kCore; i++) w[coreIdx[i]] = wCore[i];
    for (let i = 0; i < D - kCore; i++) w[volIdx[i]] = wVol[i];
  };
  assembleW();

  let volTurbulent = rng.rand() < 0.5;
  let volTimer = rng.randInt(volDwellMin, volDwellMax);
  let coreMode = 'hold'; // 'hold' | 'migrate'
  let coreTimer = rng.randInt(coreHoldMin, coreHoldMax);
  let migStep = 0;
  let migTotal = 1;
  let coreShockNoise = 0;
  let curNoise = volTurbulent ? 0.5 * (noiseLow + noiseHigh) : noiseLow;

  return {
    step(tick) {
      let changed = false;

      // Volatile layer regime & diffusion
      volTimer--;
      if (volTimer <= 0) {
        volTurbulent = !volTurbulent;
        volTimer = rng.randInt(volDwellMin, volDwellMax);
      }
      if (tick % fastStride === 0) {
        tangentStep(wVol, volNorm, volTurbulent ? fastHighSd : fastLowSd, scratchVol, rng);
        changed = true;
      }

      // Core layer stasis vs abrupt/smooth events
      if (coreMode === 'hold') {
        coreTimer--;
        if (coreTimer <= 0) {
          const ev = rng.rand();
          if (ev < 0.34) {
            // Partial core sign flip
            const kFlip = Math.min(kCore, rng.randInt(2, 3));
            const pick = rng.sampleK(kCore, kFlip);
            for (let i = 0; i < pick.length; i++) wCore[pick[i]] = -wCore[pick[i]];
            coreShockNoise = rng.randInt(40, 100);
            coreTimer = rng.randInt(coreHoldMin, coreHoldMax);
            changed = true;
          } else if (ev < 0.68) {
            // Core-volatile role swap: demote m core dims, promote m volatile dims
            const m = Math.min(kCore - 1, D - kCore, rng.randInt(2, 3));
            const demote = rng.sampleK(kCore, m);
            const promote = rng.sampleK(D - kCore, m);
            const promotedSet = new Uint8Array(D);
            for (let i = 0; i < m; i++) {
              isCore[coreIdx[demote[i]]] = 0;
              const pd = volIdx[promote[i]];
              isCore[pd] = 1;
              promotedSet[pd] = 1;
            }
            rebuildIndexMaps();
            for (let i = 0; i < kCore; i++) {
              const d = coreIdx[i];
              wCore[i] = promotedSet[d] ? (coreNorm / Math.sqrt(kCore)) * rng.randn() : w[d];
            }
            for (let i = 0; i < D - kCore; i++) {
              wVol[i] = w[volIdx[i]];
            }
            scaleTo(wCore, coreNorm, rng);
            scaleTo(wVol, volNorm, rng);
            coreShockNoise = rng.randInt(50, 110);
            coreTimer = rng.randInt(coreHoldMin, coreHoldMax);
            changed = true;
          } else {
            // Smooth core migration
            coreMode = 'migrate';
            wCoreFrom.set(wCore);
            randSphere(wCoreTo, coreNorm, rng);
            migTotal = rng.randInt(migLenMin, migLenMax);
            migStep = 0;
          }
        }
      } else {
        migStep++;
        const frac = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, migStep / migTotal));
        slerpInto(wCore, wCoreFrom, wCoreTo, frac, coreNorm);
        changed = true;
        if (migStep >= migTotal) {
          wCore.set(wCoreTo);
          coreMode = 'hold';
          coreTimer = rng.randInt(coreHoldMin, coreHoldMax);
        }
      }

      if (changed) assembleW();

      // Noise: combination of volatility regime, independent slow wave, and core shocks
      const wave = 0.5 + 0.5 * Math.sin(2 * Math.PI * tick / wavePeriod + wavePhase);
      let targetNoise = noiseLow + (noiseHigh - noiseLow) * (0.45 * (volTurbulent ? 1 : 0.1) + 0.45 * wave);
      if (coreShockNoise > 0) {
        coreShockNoise--;
        targetNoise = Math.max(targetNoise, noiseHigh - 0.1);
      }
      curNoise += 0.06 * (targetNoise - curNoise);
      curNoise = clamp(curNoise, NOISE_FLOOR, NOISE_CEIL);

      return changed;
    },
    value(bits) {
      return dotBits(w, bits);
    },
    noiseSd() {
      return curNoise;
    },
  };
}

// ---------------------------------------------------------------------------
// Type 3: stochastic_volatility_drift
// ---------------------------------------------------------------------------
function createStochasticVolatilityDrift(D, rng) {
  const targetNorm = rng.uniform(2.0, 2.9);
  const modeMin = rng.randInt(160, 280);
  const modeMax = rng.randInt(340, 560);
  const slowStride = rng.randInt(4, 8);
  const slowSd = rng.uniform(0.02, 0.05);
  const fastStride = rng.randInt(2, 4);
  const fastSd = rng.uniform(0.09, 0.17);
  const omegaBase = rng.uniform(0.004, 0.012);
  const jumpMin = rng.randInt(420, 650);
  const jumpMax = rng.randInt(750, 1150);
  const noiseMin = rng.uniform(0.32, 0.65);
  const noiseMax = rng.uniform(1.20, 1.95);

  const MODES = ['quiet_hold', 'slow_ou', 'ballistic_rot', 'fast_diff'];
  const w = new Float64Array(D);
  const u = new Float64Array(D);
  const v = new Float64Array(D);
  const scratch = new Float64Array(D);
  randSphere(w, targetNorm, rng);

  let modeIdx = rng.randInt(0, MODES.length - 1);
  let modeTimer = rng.randInt(modeMin, modeMax);
  let jumpTimer = rng.randInt(jumpMin, jumpMax);
  let omega = omegaBase;
  let modeNoiseTarget = noiseMin;
  let curNoise = rng.uniform(noiseMin, noiseMax);

  const initBallisticPlane = () => {
    u.set(w);
    scaleTo(u, 1, rng);
    for (let i = 0; i < D; i++) v[i] = rng.randn();
    const proj = dot(v, u);
    for (let i = 0; i < D; i++) v[i] -= proj * u[i];
    scaleTo(v, 1, rng);
    omega = omegaBase * rng.uniform(0.75, 1.35);
  };

  const setModeNoiseTarget = () => {
    const m = MODES[modeIdx];
    if (m === 'quiet_hold') {
      // Quiet holds can be crisp OR foggy (decoupling noise from rule motion)
      modeNoiseTarget = rng.rand() < 0.65 ? noiseMin + 0.12 * (noiseMax - noiseMin) : noiseMax - 0.10 * (noiseMax - noiseMin);
    } else if (m === 'slow_ou') {
      modeNoiseTarget = rng.uniform(noiseMin, noiseMin + 0.45 * (noiseMax - noiseMin));
    } else if (m === 'ballistic_rot') {
      modeNoiseTarget = rng.uniform(noiseMin + 0.15 * (noiseMax - noiseMin), noiseMin + 0.65 * (noiseMax - noiseMin));
    } else {
      modeNoiseTarget = rng.uniform(noiseMin + 0.55 * (noiseMax - noiseMin), noiseMax);
    }
  };

  if (MODES[modeIdx] === 'ballistic_rot') initBallisticPlane();
  setModeNoiseTarget();

  return {
    step(tick) {
      let changed = false;
      const m = MODES[modeIdx];

      if (m === 'slow_ou') {
        if (tick % slowStride === 0) {
          tangentStep(w, targetNorm, slowSd, scratch, rng);
          changed = true;
        }
      } else if (m === 'fast_diff') {
        if (tick % fastStride === 0) {
          tangentStep(w, targetNorm, fastSd, scratch, rng);
          changed = true;
        }
      } else if (m === 'ballistic_rot') {
        const c = Math.cos(omega);
        const s = Math.sin(omega);
        for (let i = 0; i < D; i++) {
          const ui = u[i], vi = v[i];
          u[i] = c * ui + s * vi;
          v[i] = -s * ui + c * vi;
        }
        // Mild curvature jitter in tangent direction v every 10 ticks
        if (tick % 10 === 0) {
          for (let i = 0; i < D; i++) v[i] += 0.08 * rng.randn() / Math.sqrt(D);
          const proj = dot(v, u);
          for (let i = 0; i < D; i++) v[i] -= proj * u[i];
          scaleTo(u, 1, rng);
          scaleTo(v, 1, rng);
        }
        for (let i = 0; i < D; i++) w[i] = targetNorm * u[i];
        changed = true;
      }

      // Discrete jumps (Householder reflection or large-angle rotation)
      jumpTimer--;
      if (jumpTimer <= 0) {
        if (rng.rand() < 0.5) {
          // Householder reflection across a random hyperplane (norm-preserving partial reversal)
          randSphere(scratch, 1, rng);
          // Bias hyperplane to have meaningful overlap with w so jump is substantive
          const nW = norm2(w) || 1;
          for (let i = 0; i < D; i++) scratch[i] = 0.6 * scratch[i] + 0.8 * (w[i] / nW);
          scaleTo(scratch, 1, rng);
          const proj = 2 * dot(w, scratch);
          for (let i = 0; i < D; i++) w[i] -= proj * scratch[i];
          scaleTo(w, targetNorm, rng);
        } else {
          // Large-angle rotation jump (0.8..1.8 rad)
          const ang = rng.uniform(0.8, 1.8);
          for (let i = 0; i < D; i++) scratch[i] = rng.randn();
          const n2 = dot(w, w) || 1;
          const proj = dot(scratch, w) / n2;
          for (let i = 0; i < D; i++) scratch[i] -= proj * w[i];
          scaleTo(scratch, targetNorm, rng);
          const ca = Math.cos(ang), sa = Math.sin(ang);
          for (let i = 0; i < D; i++) w[i] = ca * w[i] + sa * scratch[i];
          scaleTo(w, targetNorm, rng);
        }
        if (MODES[modeIdx] === 'ballistic_rot') initBallisticPlane();
        curNoise = clamp(curNoise + 0.35 * (noiseMax - curNoise), NOISE_FLOOR, NOISE_CEIL);
        jumpTimer = rng.randInt(jumpMin, jumpMax);
        changed = true;
      }

      // Switch movement mode (always to a different mode)
      modeTimer--;
      if (modeTimer <= 0) {
        const nextOffset = rng.randInt(1, MODES.length - 1);
        modeIdx = (modeIdx + nextOffset) % MODES.length;
        modeTimer = rng.randInt(modeMin, modeMax);
        if (MODES[modeIdx] === 'ballistic_rot') initBallisticPlane();
        setModeNoiseTarget();
      }

      // Smooth stochastic noise evolution
      curNoise += 0.04 * (modeNoiseTarget - curNoise) + 0.018 * rng.randn();
      curNoise = clamp(curNoise, noiseMin, noiseMax);
      curNoise = clamp(curNoise, NOISE_FLOOR, NOISE_CEIL);

      return changed;
    },
    value(bits) {
      return dotBits(w, bits);
    },
    noiseSd() {
      return curNoise;
    },
  };
}

// ---------------------------------------------------------------------------
// Type 4: ecological_niches
// ---------------------------------------------------------------------------
function createEcologicalNiches(D, rng) {
  const targetNorm = rng.uniform(2.0, 2.9);
  const phaseMin = rng.randInt(180, 300);
  const phaseMax = rng.randInt(380, 620);
  const lowFrac = rng.uniform(0.02, 0.08);
  const highFrac = rng.uniform(0.22, 0.36);
  const rampMin = 60;
  const rampMax = 150;
  const sparseKMin = 3;
  const sparseKMax = Math.min(6, Math.max(3, D - 3));
  const noiseLow = rng.uniform(0.32, 0.70);
  const noiseHigh = rng.uniform(1.15, 1.85);

  const wBase = new Float64Array(D);
  const wDiff = new Float64Array(D);
  const wBaseFrom = new Float64Array(D);
  const wBaseTo = new Float64Array(D);
  const wDiffFrom = new Float64Array(D);
  const wDiffTo = new Float64Array(D);
  const scratch = new Float64Array(D);

  let markerIdx = rng.randInt(0, D - 1);
  let interFrac = lowFrac;

  const normalizePair = () => {
    wBase[markerIdx] = 0;
    wDiff[markerIdx] = 0;
    const baseNorm = targetNorm * Math.sqrt(1 - interFrac);
    const diffNorm = targetNorm * Math.sqrt(interFrac);
    scaleTo(wBase, baseNorm, rng);
    wBase[markerIdx] = 0;
    scaleTo(wBase, baseNorm, rng);
    if (diffNorm > 1e-6) {
      scaleTo(wDiff, diffNorm, rng);
      wDiff[markerIdx] = 0;
      scaleTo(wDiff, diffNorm, rng);
    } else {
      wDiff.fill(0);
    }
  };

  const randMasked = (out, normVal) => {
    for (let i = 0; i < D; i++) out[i] = i === markerIdx ? 0 : rng.randn();
    scaleTo(out, normVal, rng);
    out[markerIdx] = 0;
  };

  randMasked(wBase, targetNorm * Math.sqrt(1 - interFrac));
  randMasked(wDiff, targetNorm * Math.sqrt(interFrac));

  const PHASES = ['linear_calm', 'niche_surge', 'base_shift', 'co_turnover'];
  let phaseIdx = 0;
  let phaseTimer = rng.randInt(phaseMin, phaseMax);
  let rampStep = 0;
  let rampTotal = 0;
  let fracFrom = interFrac;
  let fracTo = interFrac;
  let rampActive = false;
  let curNoise = noiseLow;
  let noiseTarget = noiseLow;

  const startPhase = (idx) => {
    phaseIdx = idx;
    phaseTimer = rng.randInt(phaseMin, phaseMax);
    rampActive = false;
    rampStep = 0;
    rampTotal = 0;

    const p = PHASES[phaseIdx];
    if (p === 'linear_calm') {
      // Ramp interaction down smoothly to lowFrac, then hold steady
      fracFrom = interFrac;
      fracTo = lowFrac;
      wBaseFrom.set(wBase);
      wBaseTo.set(wBase);
      wDiffFrom.set(wDiff);
      wDiffTo.set(wDiff);
      rampTotal = Math.min(phaseTimer - 20, rng.randInt(40, 90));
      rampActive = Math.abs(fracTo - fracFrom) > 1e-4 && rampTotal > 1;
      noiseTarget = rng.uniform(noiseLow, noiseLow + 0.35 * (noiseHigh - noiseLow));
    } else if (p === 'niche_surge') {
      // Interaction surges to highFrac with a fresh niche-difference vector; noise often stays low!
      fracFrom = interFrac;
      fracTo = highFrac;
      wBaseFrom.set(wBase);
      wBaseTo.set(wBase);
      tangentStep(wBaseTo, norm2(wBase), 0.18, scratch, rng);
      wBaseTo[markerIdx] = 0;
      wDiffFrom.set(wDiff);
      randMasked(wDiffTo, targetNorm * Math.sqrt(highFrac));
      rampTotal = Math.min(phaseTimer - 20, rng.randInt(rampMin, rampMax));
      rampActive = true;
      noiseTarget = rng.rand() < 0.65
        ? rng.uniform(noiseLow, noiseLow + 0.30 * (noiseHigh - noiseLow))
        : rng.uniform(noiseLow + 0.45 * (noiseHigh - noiseLow), noiseHigh);
    } else if (p === 'base_shift') {
      // Either smooth rotation of wBase OR abrupt sparse flip of wBase while interaction drops
      if (rng.rand() < 0.5) {
        // Smooth rotation
        fracFrom = interFrac;
        fracTo = lowFrac + 0.35 * (highFrac - lowFrac);
        wBaseFrom.set(wBase);
        randMasked(wBaseTo, targetNorm * Math.sqrt(1 - fracTo));
        wDiffFrom.set(wDiff);
        wDiffTo.set(wDiff);
        rampTotal = Math.min(phaseTimer - 20, rng.randInt(rampMin, rampMax));
        rampActive = true;
      } else {
        // Instant sparse flip/turnover on non-marker base dims
        interFrac = lowFrac;
        const k = rng.randInt(sparseKMin, sparseKMax);
        const candidates = [];
        for (let i = 0; i < D; i++) if (i !== markerIdx) candidates.push(i);
        const pick = rng.sampleK(candidates.length, k);
        const invert = rng.rand() < 0.55;
        const perDimSd = targetNorm / Math.sqrt(D);
        for (let i = 0; i < pick.length; i++) {
          const d = candidates[pick[i]];
          wBase[d] = invert ? -wBase[d] : perDimSd * rng.randn();
        }
        normalizePair();
        rampActive = false;
      }
      noiseTarget = rng.uniform(noiseLow + 0.25 * (noiseHigh - noiseLow), noiseHigh - 0.15 * (noiseHigh - noiseLow));
    } else {
      // co_turnover: switch marker bit, rotate base partially, draw new diff, elevate noise
      const prevMarker = markerIdx;
      markerIdx = (markerIdx + rng.randInt(1, D - 1)) % D;
      interFrac = rng.uniform(lowFrac + 0.3 * (highFrac - lowFrac), highFrac);
      const perDimSd = targetNorm / Math.sqrt(D);
      wBase[prevMarker] = perDimSd * rng.randn();
      wDiff[prevMarker] = perDimSd * rng.randn();
      wBase[markerIdx] = 0;
      wDiff[markerIdx] = 0;
      // Blend wBase partially toward a fresh direction
      randMasked(scratch, targetNorm);
      for (let i = 0; i < D; i++) if (i !== markerIdx) wBase[i] = 0.45 * wBase[i] + 0.55 * scratch[i];
      randMasked(wDiff, targetNorm * Math.sqrt(interFrac));
      normalizePair();
      noiseTarget = rng.uniform(noiseLow + 0.65 * (noiseHigh - noiseLow), noiseHigh);
    }
  };

  return {
    step() {
      let changed = false;

      if (rampActive) {
        rampStep++;
        const frac = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, rampStep / rampTotal));
        interFrac = fracFrom + (fracTo - fracFrom) * frac;
        const baseNorm = targetNorm * Math.sqrt(1 - interFrac);
        const diffNorm = targetNorm * Math.sqrt(interFrac);
        slerpInto(wBase, wBaseFrom, wBaseTo, frac, baseNorm);
        wBase[markerIdx] = 0;
        scaleTo(wBase, baseNorm, rng);
        wBase[markerIdx] = 0;
        slerpInto(wDiff, wDiffFrom, wDiffTo, frac, diffNorm);
        wDiff[markerIdx] = 0;
        if (diffNorm > 1e-6) {
          scaleTo(wDiff, diffNorm, rng);
          wDiff[markerIdx] = 0;
        } else {
          wDiff.fill(0);
        }
        changed = true;
        if (rampStep >= rampTotal) rampActive = false;
      }

      phaseTimer--;
      if (phaseTimer <= 0) {
        const nextIdx = (phaseIdx + rng.randInt(1, PHASES.length - 1)) % PHASES.length;
        startPhase(nextIdx);
        // Instant phases (base_shift instant branch or co_turnover) mutate w immediately
        if (!rampActive && (PHASES[phaseIdx] === 'base_shift' || PHASES[phaseIdx] === 'co_turnover')) {
          changed = true;
        }
      }

      curNoise += 0.06 * (noiseTarget - curNoise);
      curNoise = clamp(curNoise, NOISE_FLOOR, NOISE_CEIL);
      return changed;
    },
    value(bits) {
      let base = 0;
      let diff = 0;
      for (let i = 0; i < D; i++) {
        base += wBase[i] * bits[i];
        diff += wDiff[i] * bits[i];
      }
      return base + bits[markerIdx] * diff;
    },
    noiseSd() {
      return curNoise;
    },
  };
}

// ---------------------------------------------------------------------------
// Type 5: sparse_species_turnover
// ---------------------------------------------------------------------------
function createSparseSpeciesTurnover(D, rng) {
  const kActive = Math.min(rng.randInt(5, 10), Math.max(4, D - 2));
  const targetNorm = rng.uniform(2.0, 2.8);
  const regimeMin = rng.randInt(180, 320);
  const regimeMax = rng.randInt(400, 680);
  const fadeMin = rng.randInt(40, 80);
  const fadeMax = rng.randInt(90, 150);
  const succStepMin = rng.randInt(70, 110);
  const succStepMax = rng.randInt(120, 180);
  const noiseLow = rng.uniform(0.35, 0.70);
  const noiseHigh = rng.uniform(1.15, 1.90);

  // Per-cue state:
  //   status: 0 = inactive, 1 = active, 2 = fading_in, 3 = fading_out
  const status = new Uint8Array(D);
  const amp = new Float64Array(D);    // signed target weight when fully active
  const level = new Float64Array(D);  // in [0, 1]
  const rate = new Float64Array(D);   // per-tick delta for level
  const w = new Float64Array(D);

  const drawCueAmp = () => (rng.rand() < 0.5 ? -1 : 1) * rng.uniform(0.45, 1.45);

  const initIdx = rng.sampleK(D, kActive);
  for (let i = 0; i < initIdx.length; i++) {
    const d = initIdx[i];
    status[d] = 1;
    amp[d] = drawCueAmp();
    level[d] = 1;
  }

  const rebuildW = () => {
    let n2 = 0;
    for (let i = 0; i < D; i++) {
      const val = amp[i] * level[i];
      w[i] = val;
      n2 += val * val;
    }
    const n = Math.sqrt(n2);
    if (n > 1e-9) {
      const f = targetNorm / n;
      for (let i = 0; i < D; i++) w[i] *= f;
    }
  };
  rebuildW();

  const REGIMES = ['dormant', 'succession', 'bloom_wave', 'spoilage'];
  let regimeIdx = 0;
  let regimeTimer = rng.randInt(regimeMin, regimeMax);
  let subTimer = 0;
  let fogDelay = -1;
  let fogLeft = 0;
  let curNoise = noiseLow;

  const swapOnePair = (fadeLen) => {
    const actives = [];
    const inactives = [];
    for (let i = 0; i < D; i++) {
      if (status[i] === 1) actives.push(i);
      else if (status[i] === 0) inactives.push(i);
    }
    if (!actives.length || !inactives.length) return false;
    const outDim = actives[rng.randInt(0, actives.length - 1)];
    const inDim = inactives[rng.randInt(0, inactives.length - 1)];
    status[outDim] = 3;
    rate[outDim] = 1 / fadeLen;
    status[inDim] = 2;
    amp[inDim] = drawCueAmp();
    level[inDim] = 0;
    rate[inDim] = 1 / fadeLen;
    return true;
  };

  const triggerSpoilage = (count) => {
    const actives = [];
    for (let i = 0; i < D; i++) if ((status[i] === 1 || status[i] === 2) && level[i] > 1e-6) actives.push(i);
    const k = Math.min(count, actives.length);
    if (k <= 0) return false;
    const pick = rng.sampleK(actives.length, k);
    for (let i = 0; i < pick.length; i++) {
      const d = actives[pick[i]];
      amp[d] = -amp[d];
    }
    return true;
  };

  const enterRegime = (idx) => {
    regimeIdx = idx;
    regimeTimer = rng.randInt(regimeMin, regimeMax);
    fogDelay = -1;
    fogLeft = 0;
    const r = REGIMES[regimeIdx];
    let immediateChange = false;

    if (r === 'dormant') {
      if (regimeTimer > 160 && rng.rand() < 0.40) {
        fogLeft = Math.min(regimeTimer - 40, rng.randInt(70, 180));
        fogDelay = rng.randInt(20, Math.max(20, regimeTimer - fogLeft - 10));
      }
    } else if (r === 'succession') {
      subTimer = rng.randInt(20, 60);
    } else if (r === 'bloom_wave') {
      // Rapid multi-cue turnover wave + occasional spoilage flip
      const nSwaps = Math.min(rng.randInt(2, 4), Math.min(kActive - 1, D - kActive));
      for (let s = 0; s < nSwaps; s++) {
        swapOnePair(rng.randInt(Math.max(25, Math.floor(fadeMin * 0.7)), Math.max(40, Math.floor(fadeMax * 0.75))));
      }
      if (rng.rand() < 0.55) immediateChange = triggerSpoilage(rng.randInt(1, 2));
      subTimer = rng.randInt(70, 140);
    } else {
      // spoilage: abrupt sign inversion of 2..4 active cues
      immediateChange = triggerSpoilage(rng.randInt(2, Math.min(4, kActive)));
      subTimer = rng.randInt(120, 240);
    }
    return immediateChange;
  };

  return {
    step() {
      let changed = false;

      // Advance any active smooth fades
      for (let i = 0; i < D; i++) {
        if (status[i] === 2) {
          level[i] += rate[i];
          if (level[i] >= 1) {
            level[i] = 1;
            status[i] = 1;
          }
          changed = true;
        } else if (status[i] === 3) {
          level[i] -= rate[i];
          if (level[i] <= 0) {
            level[i] = 0;
            amp[i] = 0;
            status[i] = 0;
          }
          changed = true;
        }
      }

      const r = REGIMES[regimeIdx];
      let targetNoise = noiseLow;

      if (r === 'dormant') {
        if (fogDelay > 0) fogDelay--;
        else if (fogDelay === 0 && fogLeft > 0) {
          fogLeft--;
          targetNoise = noiseHigh;
        }
      } else if (r === 'succession') {
        targetNoise = noiseLow + 0.35 * (noiseHigh - noiseLow);
        subTimer--;
        if (subTimer <= 0) {
          swapOnePair(rng.randInt(fadeMin, fadeMax));
          subTimer = rng.randInt(succStepMin, succStepMax);
        }
      } else if (r === 'bloom_wave') {
        targetNoise = noiseLow + 0.80 * (noiseHigh - noiseLow);
        subTimer--;
        if (subTimer <= 0) {
          swapOnePair(rng.randInt(Math.max(25, Math.floor(fadeMin * 0.7)), fadeMax));
          subTimer = rng.randInt(60, 130);
        }
      } else {
        targetNoise = noiseLow + 0.60 * (noiseHigh - noiseLow);
        subTimer--;
        if (subTimer <= 0) {
          if (triggerSpoilage(rng.randInt(1, 2))) changed = true;
          subTimer = rng.randInt(120, 240);
        }
      }

      regimeTimer--;
      if (regimeTimer <= 0) {
        const nextIdx = (regimeIdx + rng.randInt(1, REGIMES.length - 1)) % REGIMES.length;
        if (enterRegime(nextIdx)) changed = true;
      }

      if (changed) rebuildW();

      curNoise += 0.08 * (targetNoise - curNoise);
      curNoise = clamp(curNoise, NOISE_FLOOR, NOISE_CEIL);
      return changed;
    },
    value(bits) {
      return dotBits(w, bits);
    },
    noiseSd() {
      return curNoise;
    },
  };
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------
export function createWorld(seed, D = 16) {
  const rng = makeRng(seed);
  const typeIndex = Math.floor(rng.rand() * WORLD_TYPES.length);
  switch (typeIndex) {
    case 0: return createPunctuatedEcology(D, rng);
    case 1: return createSeasonalMosaic(D, rng);
    case 2: return createHierarchicalChemistry(D, rng);
    case 3: return createStochasticVolatilityDrift(D, rng);
    case 4: return createEcologicalNiches(D, rng);
    default: return createSparseSpeciesTurnover(D, rng);
  }
}
