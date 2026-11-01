// DAMAGE-GATE engine fixtures (PLAN V1: FROZEN design, this file implements the
// engine-gate tests only). Zero bank worlds: synthetic bodies/records only.
// Union-excluded via tests/*.mjs scan. Schema-absence (knob-off rows lack the
// damage field) is asserted at instrument stage on trial rows, not here.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createTasteEnergyBody,compactTasteEnergyBody,restoreTasteEnergyBody,replayGated} from '../learning/taste-energy.mjs';

const D = 3.0;
const mkState = (opts = {}) => createTasteEnergyBody(1, 7, {tasteRate: 0.1, ...opts});
const mkRecord = (damage) => ({target: 1, phi: [0.5, -0.25, 0.1, -0.1, 0.2, 0, -0.3, 0.15, 0, 0.05, -0.05], ...(damage === undefined ? {} : {damage})});
const noop = () => {};
const wsum = (s) => s.weights.taste.reduce((a, v) => a + v, 0);

test('knob validates finite non-negative; counter inits zero', () => {
  assert.throws(() => mkState({replayDamageGain: -1}), /./);
  assert.throws(() => mkState({replayDamageGain: NaN}), /./);
  const s = mkState();
  assert.equal(s.config.replayDamageGain, 0);
  assert.equal(s.work.replayDamageBoosts, 0);
  const on = mkState({replayDamageGain: D});
  assert.equal(on.config.replayDamageGain, D);
  assert.equal(on.work.replayDamageBoosts, 0);
});

test('trigger fires iff knob on AND record damage > 0', () => {
  const on = mkState({replayDamageGain: D});
  const before = wsum(on);
  replayGated(on, mkRecord(2), noop);
  assert.equal(on.work.replayDamageBoosts, 1);
  const boostedDelta = wsum(on) - before;
  const plain = mkState({replayDamageGain: D});
  const pbefore = wsum(plain);
  replayGated(plain, mkRecord(0), noop);
  assert.equal(plain.work.replayDamageBoosts, 0);
  const plainDelta = wsum(plain) - pbefore;
  assert.ok(Math.abs(boostedDelta) > Math.abs(plainDelta));
  assert.ok(Math.abs(boostedDelta / plainDelta - (1 + D)) < 1e-9);
});

test('knob off ignores damage entirely (null-default)', () => {
  const off = mkState();
  const before = wsum(off);
  replayGated(off, mkRecord(5), noop);
  assert.equal(off.work.replayDamageBoosts, 0);
  assert.equal(off.work.replaySurpriseBoosts, 0);
  const ref = mkState();
  const rbefore = wsum(ref);
  replayGated(ref, mkRecord(undefined), noop);
  assert.equal(wsum(off) - before, wsum(ref) - rbefore);
});

test('knob-on zero-damage matches knob-off weights; ops delta is constant', () => {
  const runOnce = (opts, dmg) => {
    const s = mkState(opts);
    const b = wsum(s), o = s.work.scalarOperations;
    replayGated(s, mkRecord(dmg), noop);
    return {dW: wsum(s) - b, dO: s.work.scalarOperations - o, boosts: s.work.replayDamageBoosts};
  };
  const on = runOnce({replayDamageGain: D}, 0);
  const off = runOnce({}, 0);
  assert.equal(on.dW, off.dW);
  assert.equal(on.boosts, 0);
  assert.ok(on.dO > off.dO);
  // Documented constant: shared err/err2 computation + one damage comparison.
  // Re-measure loudly if the gate internals change: this MUST stay small and constant.
  const delta = on.dO - off.dO;
  const again = runOnce({replayDamageGain: D}, 0);
  const base = runOnce({}, 0);
  assert.equal(again.dO - base.dO, delta);
});

test('compact+restore round-trips knob and counter', () => {
  const s = mkState({replayDamageGain: D});
  replayGated(s, mkRecord(1), noop);
  assert.equal(s.work.replayDamageBoosts, 1);
  compactTasteEnergyBody(s);
  const r = restoreTasteEnergyBody(s);
  assert.equal(r.config.replayDamageGain, D);
  assert.equal(r.work.replayDamageBoosts, 1);
  const z = mkState();
  compactTasteEnergyBody(z);
  const zr = restoreTasteEnergyBody(z);
  assert.equal(zr.config.replayDamageGain, 0);
  assert.equal(zr.work.replayDamageBoosts, 0);
});
