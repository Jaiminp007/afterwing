// Fixtures for the paper-revision controls (L2-D, G7d). Practice seed 101 and committed final data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Microverse } from '../microverse/sim.mjs';
import { STRAINS as S } from '../microverse/strains.mjs';
import { CONFIG, TICKS, EVERY } from '../microverse/config.mjs';
import { runWorld } from '../microverse/run.mjs';

const L2W = { ...CONFIG, brainSwitch: { mul: [1, 12], switch: .001 } };
const world = (p, c = L2W) => new Microverse(101, { X: p }, c);
const lateMean = (seed, strain, cfg) => { const { snaps } = runWorld(seed, TICKS, ['X'], { every: EVERY, config: cfg, strains: { X: strain } });
  const late = []; for (let t = 10000 + EVERY; t <= TICKS; t += EVERY) { const s = snaps.find(x => x.tick === t); late.push(s ? s.pop : 0); }
  return late.reduce((a, b) => a + b, 0) / late.length; };

test('existing L2 and G7c arms are unchanged (match committed finals exactly)', () => {
  const l2 = JSON.parse(readFileSync(new URL('../evidence/microverse/fly-rsi-l2-final-95001-95048.json', import.meta.url), 'utf8'));
  for (const [arm, strain] of [['META', 'L2_META'], ['SHAM', 'L2_SHAM']]) assert.equal(lateMean(95001, S[strain], L2W), l2.perSeed['95001'][arm], arm);
  const g = JSON.parse(readFileSync(new URL('../evidence/microverse/g7c-final-94001-94096-vs-TASTEONLY.json', import.meta.url), 'utf8'));
  assert.equal(+(lateMean(94001, S.SELF, CONFIG) - lateMean(94001, S.TASTEONLY, CONFIG)).toFixed(1), g.diffs[0]);
});

test('L2-D sham cue is inert when the packages are equal (dedicated stream)', () => {
  const inert = p => ({ ...p, leanGenes: p.fullGenes });
  const a = world(inert(S.L2D_META)), b = world(inert(S.L2D_SHAM));
  for (let t = 0; t < 300; t++) { a.step(); b.step(); assert.deepEqual(a.flies.map(f => [f.id, f.x, f.y, f.energy]), b.flies.map(f => [f.id, f.x, f.y, f.energy]), `tick ${t + 1}`); }
});

test('L2-D birth-only controller keeps its first-tick package for life', () => {
  const w = world(S.L2D_BIRTH, { ...CONFIG, brainSwitch: { mul: [1, 12], switch: .02 } });
  const first = new Map();
  // A newborn's package is set on its first tick of life, when the controller reads the price (f.birthMul).
  for (let t = 0; t < 400; t++) { w.step(); for (const f of w.flies) { if (f.birthMul === undefined) continue; const cap = f.brain.genes.tasteCap; if (!first.has(f.id)) first.set(f.id, cap); else assert.equal(cap, first.get(f.id), `fly ${f.id}`); } }
  assert.ok(w.flies.some(f => f.mulSwitches), 'some flies saw a switch');
});

test('L2-D static and EVO-R arms keep their package thresholds after mutation', () => {
  for (const name of ['L2D_FIXED', 'L2D_EVOR', 'L2D_LEAN']) {
    const p = S[name], w = world(p); for (let t = 0; t < 1200; t++) w.step();
    const kids = w.flies.filter(f => f.gen); assert.ok(kids.length, name);
    for (const f of kids) { const g = f.brain.genes, pkg = name === 'L2D_LEAN' || (name === 'L2D_EVOR' && g._lean) ? p.leanGenes : p.fullGenes;
      assert.deepEqual([g.tasteZ, g.moveZ, g.tasteCap, g.moveCap], [pkg.tasteZ, pkg.moveZ, pkg.tasteCap, pkg.moveCap], name); }
  }
});

test('L2-D parent price state cannot change offspring mutation (package reset before birth)', () => {
  const quiet = { ...L2W, founders: 1, patches: 0, metabolism: 0, moveCost: 0, brainCost: 0, brainSwitch: { mul: [1, 12], switch: 0 } };
  const kids = mul => { const w = world({ ...S.L2D_METAOFF }, quiet), parent = w.flies[0]; parent.brainMul = mul; w.step();
    return Array.from({ length: 4 }, () => w.spawn('X', null, parent, 0, 0, 25, 1).brain.move.masks.join(',') + '|' + w.flies.at(-1).brain.taste.masks.join(',')); };
  assert.deepEqual(kids(1), kids(12));
});
