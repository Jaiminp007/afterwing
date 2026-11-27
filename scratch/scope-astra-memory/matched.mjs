import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { WorldL4H, mix } from '../../microverse/l4h.mjs';
import { worlds, family, kalman, getPlan, dot } from './diagnostic.mjs';

export const matchedArms = ['JUMP', 'WORLD_MEM', 'TRUE_FIFO', 'W0', 'W35', 'W65', 'W85'];
// Eight deterministically signed blocks of 16 Hadamard rows. X'X/128 = I,
// so X'y/128 is the least-squares projection on this odor panel.
const parity = n => { let p = 1; while (n) { p = -p; n &= n - 1; } return p; };
const codes = Array.from({ length: 128 }, (_, n) =>
  Int8Array.from({ length: 16 }, (_, i) => parity((n & 15) & i) * ((mix(n >> 4) >> i) & 1 ? 1 : -1)));
const sq = (a, b) => {
  let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2; return s;
};
for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++)
  assert.equal(codes.reduce((s, x) => s + x[i] * x[j], 0), i === j ? 128 : 0);

function runMatched(seed, arm) {
  const f = family(seed); assert(matchedArms.includes(arm));
  const R = f ? .5 : 2, truth = arm === 'TRUE_FIFO', worldMem = arm === 'WORLD_MEM', jump = arm === 'JUMP';
  const g = Number(arm.slice(1)) / 100, K = 8, block = 16;
  const cache = new Map();
  let w, oldT = -1, currId = 0, fit, jumps = 0, birthRecall = 0, eventRecall = 0, switches = 0, older = 0;
  function currentFit() {
    if (oldT !== w.tick) {
      oldT = w.tick; fit = new Float64Array(16);
      for (const x of codes) {
        const v = w.rule.value(x);
        for (let i = 0; i < 16; i++) fit[i] += v * x[i] / 128;
      }
    }
    return fit;
  }
  const M = { makeLearner(_, __, st) {
    const k = kalman(R), wv = k.w;
    const bank = st?.bank?.slice() ?? [], scores = new Float64Array(K);
    let age = 0, count = 0, live = 0;
    return { w: wv, get count() { return count; },
      reset(prior) { k.reset(prior); count = 0; },
      inherit() {
        if (jump) return null;
        const prior = (worldMem ? count : age) >= 8 ? wv.slice() : null;
        if (worldMem) return { prior, id: currId };
        const b = bank.slice(); if (prior) b.push(prior);
        return { bank: b.slice(-K), hasPrior: !!prior };
      },
      learn(x, y) {
        if (age === 0) {
          const v = worldMem ? ((st?.id === currId && st.prior) || cache.get(currId)) : st?.hasPrior && bank.at(-1);
          if (v) { k.reset(v); birthRecall++; }
        }
        const p = dot(wv, x);
        if (!worldMem && !jump && !truth) {
          live += (y - p) ** 2;
          for (let i = 0; i < bank.length; i++) scores[i] += (y - dot(bank[i], x)) ** 2;
        }
        k.update(x, y, p); count++; age++;
        if (worldMem || jump || age % block) return;
        let j = -1, best;
        if (truth) {
          const target = currentFit(); best = sq(wv, target);
          for (let i = 0; i < bank.length; i++) {
            const e = sq(bank[i], target);
            if (e < best) { best = e; j = i; }
          }
        } else {
          best = (1 - g) * live;
          for (let i = 0; i < bank.length; i++) if (scores[i] < best) { best = scores[i]; j = i; }
        }
        if (j >= 0) { wv.set(bank[j]); switches++; if (j < bank.length - 1) older++; }
        if (age % 64 === 0) { bank.push(wv.slice()); if (bank.length > K) bank.shift(); }
        scores.fill(0); live = 0;
      },
    };
  } };
  w = new WorldL4H(seed, arm, worlds[f], M);
  if (worldMem || jump) {
    const plan = worldMem ? getPlan(seed) : null, step = w.rule.step.bind(w.rule);
    const obs = () => Float64Array.from(codes, x => w.rule.value(x));
    let old = jump ? obs() : null;
    const radius2 = jump ? .25 * old.reduce((a, v) => a + v * v, 0) : 0;
    w.rule.step = t => {
      const changed = step(t);
      if (!changed) return changed;
      if (worldMem) {
        const next = plan.key[t];
        if (next >= 0) {
          let writer = null;
          for (const fly of w.flies) if (fly.L.count >= 8 && (!writer || fly.L.count > writer.count)) writer = fly.L;
          if (writer) cache.set(currId, writer.w.slice());
          currId = next;
          const v = cache.get(currId);
          for (const fly of w.flies) { fly.L.reset(v); fly.wDirty = true; if (v) eventRecall++; }
        }
      } else {
        const now = obs();
        if (sq(now, old) > radius2) {
          jumps++;
          for (const fly of w.flies) { fly.L.reset(null); fly.wDirty = true; }
        }
        old = now;
      }
      return changed;
    };
  }
  const halves = [0, 0]; let nLate = 0, skillSum = 0;
  while (w.tick < w.cfg.ticks) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) {
      halves[+(w.tick > 15000)] += w.flies.length; skillSum += w.skill(); nLate++;
    }
  }
  return { arm, seed, ticks: w.tick, halves, nLate, popSum: halves[0] + halves[1],
    skillSum, finalPop: w.flies.length, ...w.tel, jumps, birthRecall, eventRecall, switches, older };
}

if (!isMainThread) {
  parentPort.on('message', ([s, a]) => parentPort.postMessage(runMatched(s, a)));
} else if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const out = new URL('matched.ndjson', import.meta.url);
  const done = new Set((fs.existsSync(out) ? fs.readFileSync(out, 'utf8').trim().split(/\r?\n/).filter(Boolean) : [])
    .map(line => { const r = JSON.parse(line); return `${r.seed}:${r.arm}`; }));
  const tasks = [];
  for (let i = 1; i <= 16; i++) for (const a of matchedArms) for (let f = 0; f < 4; f++) {
    const s = (939 + f) * 1000 + i;
    if (!done.has(`${s}:${a}`)) tasks.push([s, a]);
  }
  let n = 0;
  for (let i = 0; i < Math.min(tasks.length, Number(process.argv[2]) || 9); i++) {
    const worker = new Worker(new URL(import.meta.url));
    const next = () => n < tasks.length ? worker.postMessage(tasks[n++]) : worker.terminate();
    worker.on('message', r => {
      assert.equal(r.nLate, 100); assert(Number.isFinite(r.skillSum) && Number.isInteger(r.popSum));
      fs.appendFileSync(out, JSON.stringify(r) + '\n');
      done.add(`${r.seed}:${r.arm}`);
      if (done.size % 16 === 0 || done.size === 448) console.log(new Date().toISOString(), done.size, '/ 448');
      next();
    });
    next();
  }
}
