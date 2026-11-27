// L4-A batch runner. Usage:
//   node microverse/l4-run.mjs <out.json> <seedSpec> <arm[:variant]>,...
// seedSpec: "101-116" or "101-116,301-332". variant: an L2_GRID key for META, an
// EVOR3_GRID key for EVOR3. Every seed x arm job must return a finite endpoint or the
// batch aborts (a missing result is invalid, never an extinction).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { runOne } from './l4.mjs';

if (!isMainThread) {
  const { seed, arm, cfg } = workerData;
  parentPort.postMessage(runOne(seed, arm, cfg));
} else {
  const [out, seedSpec, armSpec] = process.argv.slice(2);
  if (!out || !seedSpec || !armSpec) { console.error('usage: l4-run.mjs out.json seeds arms'); process.exit(2); }
  const seeds = seedSpec.split(',').flatMap(r => { const [a, b = a] = r.split('-').map(Number); return Array.from({ length: b - a + 1 }, (_, i) => a + i); });
  const arms = armSpec.split(',').map(s => {
    const [arm, v] = s.split(':');
    const cfg = !v ? {} : arm === 'EVOR3' ? { evorVariant: v } : { l2Variant: v };
    return { label: s, arm, cfg };
  });
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
  const dirty = (() => { try { return execSync('git status --porcelain microverse/l4.mjs microverse/l4-run.mjs').toString().trim() !== ''; } catch { return null; } })();
  writeFileSync(out, JSON.stringify({ test: 'L4-A', commit, dirty, seeds, arms: arms.map(a => a.label), seconds: (Date.now() - t0) / 1000, rows }, null, 1));
  console.log(`wrote ${out}: ${jobs.length} runs in ${((Date.now() - t0) / 1000).toFixed(0)}s (commit ${commit.slice(0, 7)}, dirty=${dirty})`);
}
