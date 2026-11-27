import assert from 'node:assert/strict';
import fs from 'node:fs';
import { arms, family } from './diagnostic.mjs';
import { matchedArms } from './matched.mjs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

const here = name => new URL(name, import.meta.url);
const read = name => fs.readFileSync(here(name), 'utf8').trim();
const nd = name => read(name).split(/\r?\n/).map(JSON.parse);
const json = name => JSON.parse(read(name));
const gates = ['W0', 'W35', 'W65', 'W85', 'LAST'];
const score = (x, y) => x.popSum - y.popSum;
const by = new Map();
function put(r) {
  const k = r.seed + ':' + r.arm;
  assert(!by.has(k), k); by.set(k, r);
}
const get = (s, a) => { const r = by.get(s + ':' + a); assert(r, `missing ${s}:${a}`); return r; };
const rows = [...nd('rows.ndjson'), ...nd('matched.ndjson')];
assert.equal(rows.length, 1092);
for (const r of rows) {
  const d = family(r.seed);
  assert.equal(r.nLate, 100); assert.equal(r.ticks, 20000);
  assert.equal(r.halves.reduce((a, b) => a + b), r.popSum);
  assert(Number.isInteger(r.popSum) && Number.isFinite(r.skillSum));
  assert.equal(r.finalPop, 60 + r.births - r.deaths); assert(r.bites > 0);
  if (r.arm === 'FIXED') {
    assert.equal(r.seed, (939 + d) * 1000 + 1);
    put({ ...r, arm: 'REPLAY' });
  } else {
    assert(arms.includes(r.arm) || matchedArms.includes(r.arm));
    put(r);
  }
}
const meanPop = rs => mean(rs.map(x => x.popSum)) / 100;
const popSD = rs => stdev(rs.map(x => x.popSum / 100));
const stdev = xs => Math.sqrt(xs.reduce((a, x) => a + (x - mean(xs)) ** 2, 0) / (xs.length - 1));
const summary = ds => ({ mean: mean(ds), se: stdev(ds) / Math.sqrt(ds.length),
  wins: ds.filter(v => v > 0).length, p: signflip(ds, 100) });
const best = (opts, value) => opts.reduce((a, b) => value(b) > value(a) ? b : a);
const data = [];
let jumpIdentity = 0, localIdentity = 0;
for (let f = 0; f < 4; f++) {
  const code = ['h', 'd1', 'd2', 'd3'][f];
  const base = f ? `../../results/l4i/d${f}-` : '../../results/l4h/';
  const fixedName = json(base + 'lock1.json').FIXED.name;
  const fixed = nd(base + 'A1.ndjson').filter(r => r.armName === fixedName);
  const ceiling = json(`../ceiling-l4/${code}.json`);
  const seeds = Array.from({ length: 16 }, (_, i) => (939 + f) * 1000 + i + 1);
  assert.equal(ceiling.seeds, `${seeds[0]}-${seeds.at(-1)}`);
  assert.equal(fixed.length, 16); assert.equal(ceiling.perSeed.length, 16);
  for (const r of fixed) { assert(seeds.includes(r.seed)); put({ ...r, arm: 'FIXED' }); }
  for (let i = 0; i < 16; i++)
    put({ seed: seeds[i], arm: 'CEILING', popSum: Math.round(100 * ceiling.perSeed[i]) });
  const replay = get(seeds[0], 'REPLAY'), ref = get(seeds[0], 'FIXED');
  for (const k of ['popSum', 'bites', 'births', 'unbalanced']) assert.equal(replay[k], ref[k]);
  assert(Math.abs(replay.skillSum / 100 - ref.skill) < 1e-12);
  for (const s of seeds) {
    if (get(s, 'JUMP').jumps === 0) {
      jumpIdentity++;
      assert.equal(get(s, 'JUMP').popSum, get(s, 'FIXED').popSum);
      assert.equal(get(s, 'JUMP').bites, get(s, 'FIXED').bites);
    }
    if (get(s, 'MEM_LOCAL').eventRecall === 0) {
      localIdentity++;
      assert.equal(get(s, 'MEM_LOCAL').popSum, get(s, 'LAG').popSum);
      assert.equal(get(s, 'MEM_LOCAL').bites, get(s, 'LAG').bites);
    }
    for (const a of ['LAG', 'MEM_LOCAL', 'MEM'])
      assert.deepEqual(get(s, 'RAW').clock, get(s, a).clock);
  }
  const names = ['FIXED', 'CEILING', ...arms, ...matchedArms];
  const all = Object.fromEntries(names.map(a => [a, seeds.map(s => get(s, a))]));
  const means = Object.fromEntries(names.map(a => [a, meanPop(all[a])]));
  const diff = (a, b) => summary(all[a].map((r, i) => score(r, all[b][i]) / 100));
  const L2 = best(gates, a => means[a]);
  const finite = best(gates.slice(0, -1), a => means[a]);
  const bare = best(['G0', 'G20', 'G50', 'G80'], a => means[a]);
  const bestFirst = best(gates, a => mean(all[a].map(r => r.halves[0])));
  const choices = seeds.map(s => {
    const row = a => get(s, a);
    const perWorld = best(gates, a => row(a).popSum);
    const halves = [0, 1].map(h => best(gates, a => row(a).halves[h]));
    return { s, perWorld, halves,
      room: score(row(perWorld), row(L2)) / 100,
      roomHalf: (row(halves[0]).halves[0] + row(halves[1]).halves[1] - row(L2).popSum) / 100,
      forward: (row(halves[0]).halves[1] - row(bestFirst).halves[1]) / 50,
      clock: row('RAW').clock };
  });
  const comparisons = {};
  for (const [a, b] of [[L2,'FIXED'],[L2,'LAST'],[finite,'LAST'],[bare,'FIXED'],
    ['JUMP','FIXED'],['LAG','FIXED'],['MEM_LOCAL','LAG'],['MEM','MEM_LOCAL'],
    ['WORLD_MEM','LAG'],['LAST','FIXED'],['TRUE_FIFO',L2],['CEILING','TRUE_FIFO'],['MEM','LAST'],
    ['WORLD_MEM',L2],['CEILING','MEM'],['LOCAL20','FIXED'],['G20','LOCAL20']])
    comparisons[`${a}-${b}`] = diff(a, b);
  const gaps = choices.map(c => c.room), gain = means[L2] - means.FIXED;
  const gatesInfo = { L2, finite, bare, gain, need: gain / 2, room: summary(gaps),
    half: mean(choices.map(c => c.roomHalf)), forward: summary(choices.map(c => c.forward)),
    bestFirst, oracleDeltaVsTarget: mean(gaps) - gain / 2 };
  const stats = {};
  for (const a of names.filter(x => !['FIXED','CEILING'].includes(x))) {
    const rs = all[a];
    stats[a] = { extinct: rs.filter(r => !r.finalPop).length, bites: mean(rs.map(r => r.bites)),
      skill: mean(rs.map(r => r.skillSum)) / 100, sd: popSD(rs),
      birthRecall: mean(rs.map(r => r.birthRecall || 0)), eventRecall: mean(rs.map(r => r.eventRecall || 0)),
      older: mean(rs.map(r => r.older || 0)), switches: mean(rs.map(r => r.switches || 0)) };
  }
  data.push({ family: code, seeds, means, comparisons, gates: gatesInfo, choices, stats,
    jumps: all.JUMP.map(r => r.jumps) });
}
const write = (n, x) => fs.writeFileSync(here(n), x);
write('analysis.json', JSON.stringify({ jumpIdentity, localIdentity, data }, null, 2) + '\n');
const header = ['seed','rawChanges','materialChanges','labels','returns','jumps',
  'bestGate','half1Gate','half2Gate','worldRoom','forwardVsGlobal', 'FIXED','CEILING', ...arms,...matchedArms];
const csv = [header.join('\t')];
for (const d of data) for (let i = 0; i < d.choices.length; i++) {
  const { s, clock: c, perWorld, halves, room, forward } = d.choices[i];
  csv.push([s, c.nRaw, c.events, c.prototypes, c.returns, d.jumps[i], perWorld, ...halves, room.toFixed(2),
    forward.toFixed(2), ...header.slice(11).map(a => (get(s, a).popSum / 100).toFixed(2))].join('\t'));
}
write('per-seed.tsv', csv.join('\n') + '\n');
console.log(`Checked ${rows.length} full runs, four archive replays, ${jumpIdentity} no-jump and ${localIdentity} no-local-hit identities.`);
console.table(Object.keys(data[0].means).map(arm => ({ arm, ...Object.fromEntries(data.map(d => [d.family, d.means[arm].toFixed(3)])) })));
for (const d of data) console.log(d.family, d.gates);
