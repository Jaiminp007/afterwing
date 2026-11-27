import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

const read = n => fs.readFileSync(new URL(n, import.meta.url), 'utf8');
const { data } = JSON.parse(read('analysis.json'));
const [header, ...lines] = read('per-seed.tsv').trim().split(/\r?\n/);
const names = header.split('\t');
const seeds = lines.map(s => Object.fromEntries(s.split('\t').map((v, i) => [names[i], v])));
const report = read('report.md');
const table = report.split('| Arm |')[1].split('\n\n')[0].split('\n').slice(2);
assert.equal(table.length, 19);
for (const line of table) {
  const cells = line.split('|').slice(1, -1).map(s => s.trim());
  const arm = cells[0].replace(/^\([abc]\) /, '').split(',')[0];
  for (let i = 0; i < 4; i++)
    assert(Math.abs(data[i].means[arm] - Number(cells[i + 1])) <= .0050001, `${arm}:${i}`);
}
assert.equal(seeds.length, 64);
for (const d of data) {
  const rows = seeds.filter(r => d.seeds.includes(+r.seed)), x = d.gates.L2;
  const sums = rows.map(r => 2 * Math.round(100 * r.TRUE_FIFO) - 3 * Math.round(100 * r[x]) + Math.round(100 * r.FIXED));
  const enabled = ['W0','W35','W65','W85'], top = Math.max(...enabled.map(a => d.means[a]));
  const sub = op => rows.filter(r => op(+r.returns)).map(r => r.WORLD_MEM - r.LAST);
  console.log(d.family, {
    trueFifoHalfD4: mean(sums) / 200, trueFifoD4P: signflip(sums, 1),
    trueFifoD4Wins: sums.filter(v => v > 0).length,
    fractionOfTrueSelectorNeeded: d.gates.need / (d.means.TRUE_FIFO - d.means[x]),
    enabledRoom: mean(rows.map(r => Math.max(...enabled.map(a => +r[a])))) - top,
    enabledNeed: (top - d.means.FIXED) / 2,
    worldMemMinusLastNoReturns: [sub(n => !n).length, mean(sub(n => !n))],
    worldMemMinusLastReturns: [sub(n => n > 0).length, mean(sub(n => n > 0))],
  });
}
console.log('All 76 reported arm means match the measured values to rounding.');
