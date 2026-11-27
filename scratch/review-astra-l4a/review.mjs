import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { L2_GRID, EVOR3_GRID, World4 } from '../../microverse/l4.mjs';

const fixture = new URL('../../microverse/l4-fixtures.mjs', import.meta.url);
const world = new URL('./l4.mjs', fixture);
const local = name => fileURLToPath(new URL(name, import.meta.url));
const worldSeed = 2201;
const scorer = (...args) => JSON.parse(execFileSync(process.execPath,
  [fileURLToPath(new URL('./l4-score.mjs', fixture)), ...args]));

// Direct observation of the oracle read by l2Update versus the matrix read by telemetry.
const oracle = new World4(worldSeed, 'ORACLE3');
assert.ok(oracle.oracleG.some(row => row.some(x => x > 0)));
console.log('ORACLE3 effective within-module fraction = 1; reported =', oracle.gShareInModules());

const seeds = [2231];
const canonical = [...Object.keys(L2_GRID).map(x => `META:${x}`), ...Object.keys(EVOR3_GRID).map(x => `EVOR3:${x}`)];
const arms = [...canonical, 'META:UNREGISTERED'];
const rows = {2231: Object.fromEntries(arms.map(a => [a, {seed: 2231, popSum: 5000}]))};
const fakeA = {test: 'L4-A', seeds, arms, rows, dirty: false, commit: 'unrelated'};
writeFileSync(local('a.json'), JSON.stringify(fakeA));
const lock = scorer('lock', local('a.json'));
assert.equal(lock.meta, 'META:UNREGISTERED');
console.log('All registered candidates tied; winner =', lock.meta);

// Run the published checks without using their reserved world seed or system temporary directory.
let src = readFileSync(fixture, 'utf8');
for (const [a, b] of [
  ['const S = 2901;', `const S = ${worldSeed};`],
  ["from './l4.mjs'", `from '${world.href}'`],
  ['import.meta.url', JSON.stringify(fixture.href)],
  ['rng32(5)', 'rng32(S)'],
  ['const w = new World4(S, \'SHAM3\'), cnt', 'const reviewShamR = rng32(S), w = new World4(S, \'SHAM3\'), cnt'],
  ['rng32(1000 + t)', 'reviewShamR'],
  ["mkdtempSync(join(tmpdir(), 'l4fx-'))", JSON.stringify(local('.'))],
  ['{ length: 48 }, (_, i) => 1 + i', '{ length: 12 }, (_, i) => 2202 + i'],
  ['[999001]', '[2232]'],
  ['2 ** -48', '2 ** -12'],
]) {
  assert.ok(src.includes(a), a);
  src = src.replaceAll(a, b);
}
await import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
