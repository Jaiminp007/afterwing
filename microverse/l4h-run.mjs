// L4-H batch runner. Refuses to run unless every code file it loads is committed and clean.
// usage: node microverse/l4h-run.mjs --world <module> --arms <arms.json> --seeds <lo>-<hi> --out <file.ndjson> [--workers N] [--ticks T]
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');

if (isMainThread) {
  const a = process.argv.slice(2), opt = {};
  for (let i = 0; i < a.length; i += 2) opt[a[i].replace(/^--/, '')] = a[i + 1];
  for (const k of ['world', 'arms', 'seeds', 'out']) if (!opt[k]) { console.error('missing --' + k); process.exit(2); }
  const files = [path.join(here, 'l4h.mjs'), path.join(here, 'l4h-arms.mjs'), path.join(here, 'l4h-run.mjs'), path.resolve(opt.world), path.resolve(opt.arms), path.join(here, 'l4h-score.mjs'), path.join(repo, 'docs/paper/stats.mjs')];
  const extra = JSON.parse(fs.readFileSync(opt.arms, 'utf8')).extraModules ?? [];
  for (const m of extra) files.push(path.resolve(repo, m));
  const rel = files.map(f => path.relative(repo, f).replaceAll('\\', '/'));
  const dirty = execSync(`git status --porcelain -- ${rel.map(r => JSON.stringify(r)).join(' ')}`, { cwd: repo }).toString().trim();
  const untracked = rel.filter(r => !execSync(`git ls-files -- ${JSON.stringify(r)}`, { cwd: repo }).toString().trim());
  if (dirty || untracked.length) { console.error('REFUSING: uncommitted or untracked code:\n' + dirty + '\n' + untracked.join('\n')); process.exit(3); }
  const head = execSync('git rev-parse HEAD', { cwd: repo }).toString().trim();
  const sha = Object.fromEntries(rel.map((r, i) => [r, createHash('sha256').update(fs.readFileSync(files[i])).digest('hex').slice(0, 12)]));
  const spec = JSON.parse(fs.readFileSync(opt.arms, 'utf8'));
  const seeds = opt.seeds.split(',').flatMap(r => { const [lo, hi] = r.split('-').map(Number); return Array.from({ length: (hi ?? lo) - lo + 1 }, (_, i) => lo + i); });
  const tasks = [];
  for (const s of seeds) for (const arm of spec.arms) tasks.push({ seed: s, arm });
  const header = { header: true, head, sha, world: rel[3], arms: rel[4], seedSpec: opt.seeds, seeds, armNames: spec.arms.map(a => a.name), n: tasks.length, ticks: opt.ticks ? +opt.ticks : null, started: new Date().toISOString() };
  fs.writeFileSync(opt.out, JSON.stringify(header) + '\n');
  const nW = Math.min(+(opt.workers ?? Math.max(1, os.cpus().length - 1)), tasks.length);
  let next = 0, done = 0;
  const worldUrl = pathToFileURL(path.resolve(opt.world)).href;
  const extraUrls = extra.map(m => pathToFileURL(path.resolve(repo, m)).href);
  for (let k = 0; k < nW; k++) {
    const w = new Worker(fileURLToPath(import.meta.url), { workerData: { worldUrl, extraUrls, ticks: opt.ticks ? +opt.ticks : null } });
    const feed = () => { if (next < tasks.length) w.postMessage(tasks[next++]); else w.terminate(); };
    w.on('message', row => { fs.appendFileSync(opt.out, JSON.stringify(row) + '\n'); done++; if (done % 20 === 0 || done === tasks.length) console.log(`${done}/${tasks.length}`); feed(); });
    w.on('error', e => { console.error(e); process.exit(1); });
    feed();
  }
} else {
  const H = await import(pathToFileURL(path.join(here, 'l4h.mjs')).href);
  const A = await import(pathToFileURL(path.join(here, 'l4h-arms.mjs')).href);
  const W = await import(workerData.worldUrl);
  for (const u of workerData.extraUrls) { const m = await import(u); m.register?.(A); }
  parentPort.on('message', ({ seed, arm }) => {
    const cfg = workerData.ticks ? { ticks: workerData.ticks } : {};
    const o = H.runOne(seed, arm, W, A, cfg);
    parentPort.postMessage({ ...o, arm });
  });
}
