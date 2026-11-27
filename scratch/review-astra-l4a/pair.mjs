import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { runOne } from '../../microverse/l4.mjs';

if (!isMainThread) {
  const seed = workerData;
  assert.ok(Number.isInteger(seed) && seed >= 2202 && seed <= 2209);
  const prototype = new URL('../advice-gemini-l4/ablation_16seeds.mjs', import.meta.url);
  const src = readFileSync(prototype, 'utf8').split('if (!isMainThread) {')[0]
    .replace(/from '(\.\.\/[^']+)'/g, (_, path) => `from '${new URL(path, prototype).href}'`);
  const {runSim} = await import(`data:text/javascript;base64,${Buffer.from(`${src}\nexport {runSim};`).toString('base64')}`);
  const spec = {l2: 'meta3', hasG: true, learnsG: true, cfg: {alphaDecay: .060, alphaBoost: 20, alphaMax: 60}};
  const pair = runSim(seed, {...spec, useGInProp: true, useGInUpd: false}).popSum;
  const meta3 = runOne(seed, 'META3').popSum;
  if (seed === 2202) assert.equal(meta3, runSim(seed, {...spec, useGInProp: false, useGInUpd: true, hiDecay: .18}).popSum);
  parentPort.postMessage(meta3 - pair);
} else {
  const one = seed => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), {workerData: seed});
    worker.once('message', resolve);
    worker.once('error', reject);
  });
  const differences = await Promise.all(Array.from({length: 8}, (_, i) => one(2202 + i)));
  const wins = differences.filter(d => d > 0).length;
  const margin = differences.reduce((s, d) => s + d, 0) / (100 * differences.length);
  // Report only whether the existing challenger threatens the nominal one-fly bar.
  console.log({n: differences.length, meta3WinsMajority: wins > differences.length / 2, meta3ClearsOneFly: margin >= 1});
}
