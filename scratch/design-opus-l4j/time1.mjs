import { runOne } from '../../microverse/l4h.mjs';
import * as W from '../../microverse/l4i-world-1.mjs';
import * as A from '../../microverse/l4i-arms.mjs';
const t0 = Date.now();
const r = runOne(953001, { name: 'K', kind: 'kalRW', q: 1e-3, R: 1 }, W, A);
console.log(r, (Date.now() - t0) / 1000);
