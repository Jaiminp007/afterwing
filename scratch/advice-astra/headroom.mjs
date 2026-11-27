// Exploratory instrument only: no META, reproductive selection, or qualification.
// Fixed cohort of independent two-flower foragers, with a fresh private patch
// target/sign and one persistent private motif preference per fly.
import { mix, rng32 } from '../../microverse/sim.mjs';

const seeds = Array.from({ length: 16 }, (_, i) => i + 701);
const flies = 24, patches = 12, T = 80, K = 32;
const sign = r => r() < .5 ? -1 : 1;
const rand = (r, n) => Math.floor(r() * n);
const range = n => Array.from({ length: n }, (_, i) => i);
const family = k => ((k % 8) - Math.floor(k / 8) + 4) % 4;
const menu = range(K), members = range(4).map(f => menu.filter(k => family(k) === f));
const statics = ['shuffle', 'cycle', 'first0', 'first1', 'first2', 'first3'];
const arms = ['off', ...statics, 'grammar', 'hindsight'];
function shuffle(a, r) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(r, i + 1); [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// For the second blossom, all y bits AND the innate hint reverse. Net energy
// is +1/-1 for the chosen blossom. A chosen blossom's feature * observed reward
// therefore equals the first one's feature * first one's reward, for either
// action. This sufficient-statistic replay gives NO counterfactual samples.
function patch(r, familyHome) {
  const f = r() < .875 ? familyHome : (familyHome + 1 + rand(r, 3)) % 4;
  const target = members[f][rand(r, 8)], s = sign(r);
  const bits = [], hint = [], reward = [], hintPrefix = [0];
  const C = menu.map(() => new Int16Array(T + 1));
  for (let t = 0; t < T; t++) {
    const x = range(4).map(() => sign(r)), y = range(8).map(() => sign(r));
    const q = menu.map(k => x[k >> 3] * y[k % 8]);
    const v = s * q[target], h = v * (r() < .65 ? 1 : -1), z = v * (r() < .95 ? 1 : -1);
    bits.push(q); hint.push(h); reward.push(z); hintPrefix.push(hintPrefix[t] + h * z);
    for (const k of menu) C[k][t + 1] = C[k][t] + q[k] * z;
  }
  return { bits, hint, reward, hintPrefix, C };
}
const allow = (p, k, t) => Math.abs(p.C[k][t] - p.C[k][t - 16]) >= 14;
function gain(p, k, start, t) {
  const h = (2 + p.hintPrefix[t]) / (8 + t);
  const w = k < 0 ? 0 : (p.C[k][t] - p.C[k][start]) / (4 + t - start);
  const z = k >= 0 && Math.abs(w) > Math.abs(h) ? w * p.bits[t][k] : h * p.hint[t];
  return (z < 0 ? -1 : 1) * p.reward[t];
}
function policy(p, order, k) {
  let start = 0, total = 0;
  for (let t = 0; t < T; t++) {
    if (order && t >= 16 && t % 4 === 0) {
      const j = order[(t - 16) / 4];
      if (k !== j && allow(p, j, t)) { k = j; start = t; }
    }
    total += gain(p, k, start, t);
  }
  return [total, k];
}

// DP over every possible accepted candidate and start time. At each audit it
// can pick ANY eligible edit or abstain, with hindsight. L0, opening mask,
// evidence hurdle, edit clock and cross-patch carry still match. Permitting
// a same-mask recommit relaxes the arm rules and preserves the upper bound.
function hindsight(p, inherited) {
  const states = [...inherited].map(([k, score]) => ({ k, start: 0, score }));
  for (let t = 0; t < T; t++) {
    if (t >= 16 && t % 4 === 0) {
      const best = Math.max(...states.map(x => x.score));
      for (const k of menu) if (allow(p, k, t)) states.push({ k, start: t, score: best });
    }
    for (const st of states) st.score += gain(p, st.k, st.start, t);
  }
  const out = new Map();
  for (const { k, score } of states) out.set(k, Math.max(score, out.get(k) ?? -Infinity));
  return out;
}
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const rows = [];
for (const seed of seeds) {
  const score = Object.fromEntries(arms.map(a => [a, 0]));
  for (let j = 0; j < flies; j++) {
    const r = rng32(mix(seed ^ Math.imul(1 + j, 2654435761)));
    const rSearch = rng32(mix(seed ^ Math.imul(1 + j, 2246822519) ^ 0x1c9452));
    const home = rand(r, 4), active = Object.fromEntries(arms.map(a => [a, -1]));
    let upper = new Map([[-1, 0]]);
    for (let h = 0; h < patches; h++) {
      const p = patch(r, home), deck = shuffle([...menu], rSearch), fams = shuffle(range(4), rSearch);
      const groups = range(4).map(i => deck.filter(k => family(k) === i));
      const cycle = range(K).map(i => groups[fams[i % 4]][i >> 2]);
      const first = i => [...groups[i], ...deck.filter(k => family(k) !== i)];
      const plans = { off: null, shuffle: deck, cycle, grammar: first(home) };
      for (const f of range(4)) plans['first'+f] = first(f);
      for (const [a, order] of Object.entries(plans)) {
        const [v, k] = policy(p, order, active[a]); score[a] += v; active[a] = k;
      }
      upper = hindsight(p, upper);
    }
    score.hindsight += Math.max(...upper.values());
  }
  for (const a of arms) score[a] /= flies * patches;
  if (arms.some(a => !Number.isFinite(score[a]) || score[a] > score.hindsight)) throw Error('bad upper bound');
  rows.push({ seed, ...score });
}
const means = Object.fromEntries(arms.map(a => [a, mean(rows.map(r => r[a]))]));
const fixed = statics.toSorted((a, b) => means[b] - means[a])[0];
const g = means[fixed] - means.off;
const d = a => rows.map(r => r[a] - r[fixed] - .5 * (r[fixed] - r.off));
const stat = a => ({ meanD: mean(d(a)), wins: d(a).filter(x => x > 0).length, minD: Math.min(...d(a)) });
console.log(JSON.stringify({ exploratory: true, units: 'net energy / 80-landing patch / founder', seeds, flies, patches, fixed, means, g, grammar: stat('grammar'), hindsight: stat('hindsight'), rows }, null, 2));
