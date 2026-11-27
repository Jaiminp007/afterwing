/*
 * The first draw from a seed-local Mulberry32 selects one of three types
 * with equal probability. The next draws shuffle which bits play each role
 * and set the world's strengths, taste scale, noise level and update stride.
 *
 * Ripening: four fixed cues and twelve drifting additive cues. The rule
 * interpolates between fresh profiles, alternating 180-520 tick fast spans
 * with 840-1900 tick slow spans.
 *
 * Succession: four fixed cues, four changing additive cues and four changing
 * products of disjoint cue pairs. Profiles switch abruptly, alternating
 * short 100-420 tick stands with long 650-1650 tick stands.
 *
 * Seasons: four fixed cues, six changing additive cues and five changing
 * cues whose effects reverse with a shared marker bit. Two profiles recur
 * in alternation, with 500-1600 tick plateaus and 90-350 tick transitions.
 *
 * The seed chooses the initial pace for ripening and succession. Span lengths
 * are redrawn at each boundary. Ramps update every 6-16 ticks (a per-world
 * stride) and land exactly at the boundary. Fixed and changing weights have
 * respective L2 norms of 0.50-0.85 and 0.95-1.45 at profile endpoints. Their
 * signed magnitudes before normalization are drawn from 0.45-1. Each profile
 * has a bias in [-0.24, 0.24] and a noise SD of the world's 0.55-1.65 base
 * plus a draw from [-0.25, 0.35]. Both follow the same transitions as the
 * weights. Food quality is tanh of the cue score, scaled by 2.4-3 per world.
 */
export function createWorld(seed, D) {
  let state = seed >>> 0;
  function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const range = (lo, hi) => lo + (hi - lo) * random();
  const integer = (lo, hi) => Math.floor(range(lo, hi + 1));

  const type = ['ripening', 'succession', 'seasons'][integer(0, 2)];
  const order = Array.from({ length: D }, (_, i) => i);
  for (let i = D - 1; i > 0; i--) {
    const j = integer(0, i);
    [order[i], order[j]] = [order[j], order[i]];
  }

  // A term is either an odor bit or the product of two bits.
  const fixedCount = 4;
  const terms = order.slice(0, fixedCount).map(i => [i]);
  if (type === 'ripening') {
    for (const i of order.slice(fixedCount)) terms.push([i]);
  } else if (type === 'succession') {
    for (const i of order.slice(fixedCount, 8)) terms.push([i]);
    for (let i = 8; i < D; i += 2) terms.push([order[i], order[i + 1]]);
  } else {
    const marker = order[fixedCount];
    for (const i of order.slice(5, 11)) terms.push([i]);
    for (const i of order.slice(11)) terms.push([i, marker]);
  }

  const fixedStrength = range(0.50, 0.85);
  const changingStrength = range(0.95, 1.45);
  const scale = range(2.4, 3);
  const noiseBase = range(0.55, 1.65);
  const stride = integer(6, 16);
  const changingCount = terms.length - fixedCount;

  function drawWeights(count, strength) {
    const w = Float64Array.from({ length: count }, () =>
      (random() < 0.5 ? -1 : 1) * range(0.45, 1));
    const factor = strength / Math.hypot(...w);
    return w.map(x => x * factor);
  }
  function drawProfile() {
    return {
      weights: drawWeights(changingCount, changingStrength),
      bias: range(-0.24, 0.24),
      noise: noiseBase + range(-0.25, 0.35),
    };
  }

  const weights = new Float64Array(terms.length);
  weights.set(drawWeights(fixedCount, fixedStrength));
  let from = drawProfile();
  let to = drawProfile();
  weights.set(from.weights, fixedCount);
  let bias = from.bias;
  let noise = from.noise;
  let fast = type !== 'seasons' && random() < 0.5;
  let end, rampStart;

  function planSpan(start) {
    if (type === 'ripening') {
      end = start + (fast ? integer(180, 520) : integer(840, 1900));
      rampStart = start;
    } else if (type === 'succession') {
      end = start + (fast ? integer(100, 420) : integer(650, 1650));
      rampStart = end;
    } else {
      rampStart = start + integer(500, 1600);
      end = rampStart + integer(90, 350);
    }
  }
  planSpan(0);

  return {
    step(tick) {
      const atBoundary = tick === end;
      if (!atBoundary && (tick <= rampStart || (tick - rampStart) % stride !== 0)) return false;

      const blend = atBoundary ? 1 : (tick - rampStart) / (end - rampStart);
      const keep = 1 - blend;
      for (let i = 0; i < changingCount; i++) {
        weights[fixedCount + i] = keep * from.weights[i] + blend * to.weights[i];
      }
      bias = keep * from.bias + blend * to.bias;
      noise = keep * from.noise + blend * to.noise;

      if (atBoundary) {
        const previous = from;
        from = to;
        to = type === 'seasons' ? previous : drawProfile();
        fast = !fast;
        planSpan(tick);
      }
      return true;
    },
    value(bits) {
      let score = bias;
      for (let k = 0; k < terms.length; k++) {
        const [i, j] = terms[k];
        score += weights[k] * bits[i] * (j === undefined ? 1 : bits[j]);
      }
      return scale * Math.tanh(score);
    },
    noiseSd() {
      return noise;
    },
  };
}
