import { runOne } from '../../microverse/l4h.mjs';
import * as A from '../../microverse/l4h-arms.mjs';
import * as W from './toyworld.mjs';
const pick = n => [...A.DEPTH1, ...A.DEPTH2].find(a => a.name.startsWith(n));
const base = pick('AUTO_mu0.01');
const arms = [{ kind: 'nolearn', name: 'NOLEARN' }, pick('LMS_alpha0.016'), pick('KALRW'), pick('IDBD'), base, pick('KALADQ'), pick('KALSW'),
  A.meta3(base, A.L3GRID[0]), ...A.controls(base, A.L3GRID[0], A.EVOGRID[3])];
const t0 = Date.now();
for (const a of arms) { const o = runOne(7, a, W, A, { ticks: +(process.argv[2] ?? 6000), lateFrom: 3000 }); console.log(a.name.padEnd(34), o.pop.toFixed(1), o.skill.toFixed(3), o.probe.toFixed(2), o.extinct ? 'EXT' : '', ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
