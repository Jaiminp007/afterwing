import { proxyRun } from './proxy.mjs';
const seeds = Array.from({ length: 16 }, (_, i) => 953001 + i);
const arms = [];
for (const q of [1e-4, 3e-4, 1e-3, 3e-3, 1e-2]) for (const R of [1]) arms.push({ name: `KRW_q${q}`, kind: 'krw', q, R });
for (const q of [1e-4, 1e-3]) arms.push({ name: `LAST_q${q}`, kind: 'krw', q, R: 1, last: true });
for (const beta of [.003, .01, .03, .1]) for (const q of [1e-4, 1e-3]) arms.push({ name: `CV_b${beta}_q${q}`, kind: 'cv', beta, q, R: 1, vdecay: .002, last: true });
for (const beta of [.003, .01, .03, .1, .3]) for (const q of [1e-4, 1e-3]) arms.push({ name: `ROT_b${beta}_q${q}`, kind: 'rot', beta, q, R: 1, vdecay: 0, last: true });
const res = {};
for (const a of arms) {
  const ls = seeds.map(s => proxyRun(s, a));
  res[a.name] = ls;
  const m = ls.reduce((s, x) => s + x.loss, 0) / ls.length, e = ls.reduce((s, x) => s + x.err, 0) / ls.length;
  console.log(a.name.padEnd(22), m.toFixed(4), e.toFixed(4));
}
