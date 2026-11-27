import { parentPort } from 'node:worker_threads';
import { runOne } from './harness.mjs';
import { createWorld } from './world_v2.mjs';
import * as armsMod from './learners_v2.mjs';

parentPort.on('message', ({ jobId, seed, arm, cfg, worldOpts }) => {
  const t0 = Date.now();
  const worldMod = { createWorld: (s, D) => createWorld(s, D, worldOpts || {}) };
  const res = runOne(seed, arm, worldMod, armsMod, cfg || {});
  res.ms = Date.now() - t0;
  parentPort.postMessage({ jobId, res });
});
