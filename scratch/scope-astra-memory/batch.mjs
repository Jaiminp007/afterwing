import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { arms, run } from './diagnostic.mjs';

const local = name => new URL(name, import.meta.url);
if (!isMainThread) {
  parentPort.on('message', ([s, a]) => parentPort.postMessage(run(s, a)));
} else {
  assert.equal(process.versions.node.split('.')[0], '22');
  const out = local('rows.ndjson');
  const existing = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse) : [];
  const tasks = [];
  for (let i = 1; i <= 16; i++) for (const arm of arms) for (let f = 0; f < 4; f++)
    tasks.push([(939 + f) * 1000 + i, arm]);
  for (let f = 0; f < 4; f++) tasks.unshift([(939 + f) * 1000 + 1, 'FIXED']);
  const done = new Set(existing.map(r => `${r.seed}:${r.arm}`));
  const todo = tasks.filter(([s, a]) => !done.has(`${s}:${a}`));
  let n = 0;
  for (let i = 0; i < Math.min(Number(process.argv[2] || 9), todo.length); i++) {
    const worker = new Worker(new URL(import.meta.url));
    const next = () => n < todo.length ? worker.postMessage(todo[n++]) : worker.terminate();
    worker.on('message', r => {
      assert.equal(r.nLate, 100);
      assert(Number.isFinite(r.skillSum) && r.bites > 0 && Number.isInteger(r.popSum));
      fs.appendFileSync(out, JSON.stringify(r) + '\n');
      done.add(`${r.seed}:${r.arm}`);
      if (done.size % 16 === 0 || done.size === tasks.length)
        console.log(new Date().toISOString(), done.size, '/', tasks.length);
      next();
    });
    next();
  }
}
