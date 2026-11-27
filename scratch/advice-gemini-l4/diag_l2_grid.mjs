// Exploratory diagnostic ONLY on authorized seeds 2001-2008.
// Checks constant-L2 grid in unmodified l3v.mjs to see how much of the META->ORACLE_L2
// gap is constant-parameter tuning vs genuine stability-plasticity tension.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { runOne } from '../../microverse/l3v.mjs';

if (!isMainThread) {
  const { seed, arm, cfg } = workerData;
  parentPort.postMessage(runOne(seed, arm, cfg));
} else {
  const seeds = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008];
  const configs = [
    { label: 'FIXED_DECK', arm: 'FIXED_DECK', cfg: {} },
    { label: 'ORACLE_L2', arm: 'ORACLE_L2', cfg: {} },
    { label: 'META_L3V', arm: 'META', cfg: {} }, // boost=4, decay=.006, max=30, floor=.02
    { label: 'D002_M60', arm: 'META', cfg: { alphaDecay: .002, alphaMax: 60, alphaBoost: 6, alphaFloor: .005 } },
    { label: 'D006_M60', arm: 'META', cfg: { alphaDecay: .006, alphaMax: 60, alphaBoost: 6, alphaFloor: .005 } },
    { label: 'D015_M30', arm: 'META', cfg: { alphaDecay: .015, alphaMax: 30, alphaBoost: 6 } },
    { label: 'D030_M30', arm: 'META', cfg: { alphaDecay: .030, alphaMax: 30, alphaBoost: 8 } },
    { label: 'D060_M30', arm: 'META', cfg: { alphaDecay: .060, alphaMax: 30, alphaBoost: 10 } },
    { label: 'D120_M30', arm: 'META', cfg: { alphaDecay: .120, alphaMax: 30, alphaBoost: 15 } },
    { label: 'D030_M100', arm: 'META', cfg: { alphaDecay: .030, alphaMax: 100, alphaBoost: 15, alphaFloor: .005 } },
  ];

  const jobs = seeds.flatMap(seed => configs.map(c => ({ seed, arm: c.arm, label: c.label, cfg: c.cfg })));
  const rows = {};
  const t0 = Date.now();
  await new Promise((res, rej) => {
    let next = 0, done = 0;
    const go = () => {
      if (next >= jobs.length) return;
      const job = jobs[next++];
      const wk = new Worker(new URL(import.meta.url), { workerData: job });
      wk.on('message', m => { (rows[m.seed] ??= {})[job.label] = m; });
      wk.on('error', rej);
      wk.on('exit', () => { if (++done === jobs.length) res(); else go(); });
    };
    for (let i = 0; i < Math.min(jobs.length, Math.max(1, cpus().length - 1)); i++) go();
  });

  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  console.log(`Done ${jobs.length} runs in ${((Date.now() - t0) / 1000).toFixed(1)}s (seeds 2001-2008)`);
  const fPops = seeds.map(s => rows[s].FIXED_DECK.pop);
  for (const c of configs) {
    const pops = seeds.map(s => rows[s][c.label].pop);
    const shares = seeds.map(s => rows[s][c.label].alphaShareOnS);
    const gain = mean(pops) - mean(fPops);
    console.log(`${c.label.padEnd(12)} pop=${mean(pops).toFixed(2)}  gainVsFixed=${gain >= 0 ? '+' : ''}${gain.toFixed(2)}  alphaShareOnS=${mean(shares).toFixed(3)}`);
  }
}
