// Detached batch runner: node batch.mjs <spec.json> <out.ndjson> [workers]
// spec = { seeds: [...], arms: [{name, kind, ...}], cfg?: {} }. Skips (seed, arm) rows already in out.
import fs from 'node:fs';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { runOne } from './harness.mjs';
import * as W from './world-orbit.mjs';
import * as A from './arms.mjs';

if (!isMainThread) {
  parentPort.on('message', ([seed, arm, cfg]) => {
    const t0 = Date.now();
    const r = runOne(seed, arm, W, A, cfg ?? {});
    parentPort.postMessage({ ...r, arm: arm.name, sec: (Date.now() - t0) / 1000 });
  });
} else {
  const [specPath, outPath, nw = '9'] = process.argv.slice(2);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const done = new Set(fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8').split(/\r?\n/).filter(Boolean).map(l => { const r = JSON.parse(l); return `${r.seed}:${r.arm}`; }) : []);
  const todo = [];
  for (const s of spec.seeds) for (const a of spec.arms) if (!done.has(`${s}:${a.name}`)) todo.push([s, a, spec.cfg]);
  let n = 0, fin = 0;
  console.log(new Date().toISOString(), 'todo', todo.length);
  for (let i = 0; i < Math.min(Number(nw), todo.length); i++) {
    const w = new Worker(new URL(import.meta.url));
    const next = () => n < todo.length ? w.postMessage(todo[n++]) : w.terminate();
    w.on('message', r => {
      if (r.nLate !== 100) throw new Error('nLate');
      fs.appendFileSync(outPath, JSON.stringify(r) + '\n');
      if (++fin % 20 === 0 || fin === todo.length) console.log(new Date().toISOString(), fin, '/', todo.length);
      next();
    });
    next();
  }
}
