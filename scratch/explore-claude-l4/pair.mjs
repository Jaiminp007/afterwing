// Exploration ONLY on seeds 2301-2316: META3 (update-only) vs META3F (update + proposals) vs PAIRX (proposals only).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { runOne } from '../../microverse/l4.mjs';
import { signflip } from '../../docs/paper/stats.mjs';
if (!isMainThread) { const { s, a, c } = workerData; parentPort.postMessage({ s, a, r: runOne(s, a, c).popSum }); }
else {
  const seeds = Array.from({ length: 16 }, (_, i) => 2301 + i);
  const arms = [['FIXED', {}], ['META', { l2Variant: 'D060B20' }], ['META3', {}], ['META3F', {}], ['PAIRX', {}]];
  const jobs = seeds.flatMap(s => arms.map(([a, c]) => ({ s, a, c }))); const P = {};
  await new Promise(res => { let i = 0, d = 0; const go = () => { if (i >= jobs.length) return; const w = new Worker(new URL(import.meta.url), { workerData: jobs[i++] }); w.on('message', m => { (P[m.a] ??= {})[m.s] = m.r; }); w.on('exit', () => ++d === jobs.length ? res() : go()); }; for (let k = 0; k < cpus().length - 1; k++) go(); });
  const v = a => seeds.map(s => P[a][s]), mean = x => x.reduce((p, q) => p + q, 0) / x.length;
  for (const [a] of arms) console.log(a.padEnd(7), (mean(v(a)) / 100).toFixed(2));
  const con = (n, x, u = 100) => console.log(n.padEnd(34), (mean(x) / u).toFixed(2), `${x.filter(y => y > 0).length}/16`, 'p', signflip(x, 1).toExponential(2));
  const F = v('FIXED'), M = v('META');
  for (const a of ['META3', 'META3F']) {
    con(`${a} - PAIRX`, v(a).map((x, i) => x - v('PAIRX')[i]));
    con(`d4 ${a} vs META:D060B20`, v(a).map((x, i) => 2 * x - 3 * M[i] + F[i]), 200);
    con(`d4 ${a} vs PAIRX as L2`, v(a).map((x, i) => 2 * x - 3 * v('PAIRX')[i] + F[i]), 200);
  }
}
