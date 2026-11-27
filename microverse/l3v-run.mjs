// L3-V batch runner. Usage:
//   node microverse/l3v-run.mjs <out.json> <seedSpec> <arm[:evorVariant]>,... [key=value ...]
// seedSpec: "101-116" or "101-116,301-332". Every seed x arm job must return a finite
// endpoint or the batch aborts (a missing result is invalid, never an extinction).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { runOne } from './l3v.mjs';

if (!isMainThread) {
  const { seed, arm, cfg } = workerData;
  parentPort.postMessage(runOne(seed, arm, cfg));
} else {
  const [out, seedSpec, armSpec, ...kv] = process.argv.slice(2);
  if (!out || !seedSpec || !armSpec) { console.error('usage: l3v-run.mjs out.json seeds arms [k=v]'); process.exit(2); }
  const seeds = seedSpec.split(',').flatMap(r => { const [a, b = a] = r.split('-').map(Number); return Array.from({ length: b - a + 1 }, (_, i) => a + i); });
  const extra = Object.fromEntries(kv.map(s => { const [k, v] = s.split('='); return [k, Number.isNaN(+v) ? v : +v]; }));
  const arms = armSpec.split(',').map(s => { const [arm, v] = s.split(':'); return { label: v ? `${arm}:${v}` : arm, arm, cfg: v ? { ...extra, evorVariant: v } : { ...extra } }; });
  const jobs = seeds.flatMap(seed => arms.map(a => ({ seed, arm: a.arm, label: a.label, cfg: a.cfg })));
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
  for (const s of seeds) for (const a of arms) if (!rows[s]?.[a.label] || !Number.isFinite(rows[s][a.label].pop)) throw Error(`missing ${s} ${a.label}`);
  let commit = 'unknown'; try { commit = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  const dirty = (() => { try { return execSync('git status --porcelain microverse/l3v.mjs microverse/l3v-run.mjs').toString().trim() !== ''; } catch { return null; } })();
  writeFileSync(out, JSON.stringify({ test: 'L3-V', commit, dirty, seeds, arms: arms.map(a => a.label), cfg: extra, seconds: (Date.now() - t0) / 1000, rows }, null, 1));
  console.log(`wrote ${out}: ${jobs.length} runs in ${((Date.now() - t0) / 1000).toFixed(0)}s (commit ${commit.slice(0, 7)}, dirty=${dirty})`);
}
