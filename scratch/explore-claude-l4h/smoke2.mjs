// Code check on the throwaway toy world (seeds 6001-6002), all arm kinds incl. wrapped extras.
import { runOne } from '../../microverse/l4h.mjs';
import * as A from '../../microverse/l4h-arms.mjs';
import * as C from '../../microverse/l4h-classf.mjs';
import * as W from './toyworld.mjs';
C.register(A);
const all = [...A.DEPTH1, ...A.DEPTH2, ...C.DEPTH2_EXTRA];
const fams = [...new Set(all.map(a => a.family))].map(f => all.find(a => a.family === f));
const runs = [];
for (const b of fams.filter(a => !['lms', 'kalRW'].includes(a.kind))) {
  const st = { kind: 'static', name: 'S', base: b, offset: 1 };
  runs.push(b, st, A.meta3(st, A.L3GRID[0]), ...A.controls(st, A.L3GRID[0], A.EVOGRID[5]));
}
runs.push(...fams.filter(a => ['lms', 'kalRW'].includes(a.kind)));
let n = 0;
for (const a of runs) { const o = runOne(6001, a, W, A, { ticks: 1500, lateFrom: 700 }); if (!Number.isFinite(o.pop)) throw new Error(a.name); n++; }
console.log('ok', n, 'runs');
