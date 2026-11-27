// Food rules follow one of three ecologies, selected by unsigned seed modulo 3.
// All ranges below are drawn per seed (and again at each relevant event) from a
// seed-local RNG. Odor niches use 4-7 signed bits out of D=16.
// 0, seasons: two niches rotate over a 750-1800 tick cycle. Weather lasts
//    250-700 ticks and changes the rotation speed to 0.4-1.8 times normal.
// 1, succession: a niche lasts 250-900 ticks, then gives way to a new niche
//    over 20-110 ticks; each replacement persists until the next succession.
// 2, blooms: a resident niche is interrupted by a temporary niche. Lulls last
//    250-700 ticks; bloom onset/retreat each take 45-145 ticks, with an
//    80-320 tick peak and a 0.65-1.4 invasion strength.
// Food is an odd, saturating function of the niche score (about -2.25 to 2.25),
// so complementary odors always have opposite signs. Taste noise SD is
// 0.34-1.68 in seasons, 0.45-1.65 in succession, and 0.35-1.75 in blooms.
export function createWorld(seed, D) {
  let state = ((seed ^ 0x9e3779b9) >>> 0) || 0x6d2b79f5;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const duration = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));
  const niche = () => {
    const weights = new Float64Array(D);
    const count = duration(4, 7);
    let norm = 0;
    for (let n = 0; n < count; n++) {
      let i;
      do { i = Math.floor(random() * D); } while (weights[i] !== 0);
      const w = (random() < 0.5 ? -1 : 1) * (0.7 + 0.6 * random());
      weights[i] = w;
      norm += w * w;
    }
    for (let i = 0; i < D; i++) weights[i] /= Math.sqrt(norm);
    return weights;
  };

  const type = (seed >>> 0) % 3;
  let resident = niche();
  let visitor = niche();
  let blend = 0;
  let phase = random() * 2 * Math.PI;
  const cycle = duration(750, 1800);
  let pace = 0.4 + 1.4 * random();
  let until = duration(250, 700);
  let transitionStart = 0;
  let span = 0;
  let mode = 0;
  let remaining = duration(250, 700);
  let invasion = 0.65 + 0.75 * random();
  const baseNoise = type === 2 ? 0.35 + 0.7 * random() : 0.45 + 0.75 * random();
  const bloomNoise = 0.35 + 0.35 * random();
  let sd = type === 1 ? 0.45 + 1.2 * random() : baseNoise * (0.75 + 0.65 * random());

  return {
    step(tick) {
      if (type === 0) {
        if (tick >= until) {
          pace = 0.4 + 1.4 * random();
          sd = baseNoise * (0.75 + 0.65 * random());
          until = tick + duration(250, 700);
        }
        phase += 2 * Math.PI * pace / cycle;
        return true;
      }
      if (type === 1) {
        if (tick < until) return false;
        if (!transitionStart) {
          visitor = niche();
          transitionStart = tick;
          span = duration(20, 110);
          sd = 0.45 + 1.2 * random();
        }
        blend = (tick - transitionStart + 1) / span;
        if (blend >= 1) {
          resident = visitor;
          blend = 0;
          transitionStart = 0;
          until = tick + duration(250, 900);
          sd = 0.45 + 1.2 * random();
        }
        return true;
      }

      const changing = mode === 1 || mode === 3;
      if (mode === 1) blend += 1 / span;
      if (mode === 3) blend -= 1 / span;
      if (--remaining === 0) {
        if (mode === 0) {
          visitor = niche();
          invasion = 0.65 + 0.75 * random();
          mode = 1;
          span = duration(45, 145);
          remaining = span;
        } else if (mode === 1) {
          blend = 1;
          mode = 2;
          remaining = duration(80, 320);
        } else if (mode === 2) {
          mode = 3;
          span = duration(45, 145);
          remaining = span;
        } else {
          blend = 0;
          mode = 0;
          remaining = duration(250, 700);
        }
      }
      return changing;
    },
    value(bits) {
      let a = 0, b = 0;
      for (let i = 0; i < D; i++) {
        a += resident[i] * bits[i];
        b += visitor[i] * bits[i];
      }
      const score = type === 0
        ? Math.cos(phase) * a + Math.sin(phase) * b
        : type === 1 ? (1 - blend) * a + blend * b : a + blend * invasion * b;
      return 2.25 * Math.tanh(2.1 * score);
    },
    noiseSd() {
      return type === 2 ? baseNoise + bloomNoise * blend : sd;
    },
  };
}
