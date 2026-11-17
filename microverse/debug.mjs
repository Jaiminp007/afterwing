// Dev diagnostic: energy flow over the first ticks of one world.
import { STRAINS } from './run.mjs';
import { Microverse } from './sim.mjs';
const [seed = 1, ticks = 300, every = 50, name = 'FIXED'] = process.argv.slice(2);
const w = new Microverse(+seed, { [name]: STRAINS[name] }), sum = (v, fn) => v.reduce((a, x) => a + fn(x), 0);
console.log('plants at start', w.plant.filter(Boolean).length);
for (let t = 1; t <= +ticks && w.flies.length; t++) {
  w.step();
  if (t % +every === 0) {
    const f = w.flies, live = w.plant.filter(Boolean);
    console.log(t, 'pop', f.length, 'E', (sum(f, x => x.energy) / f.length).toFixed(1), 'good', sum(f, x => x.eaten.good), 'bad', sum(f, x => x.eaten.bad),
      'plants', live.length, 'food', sum(live, p => p.amount).toFixed(0), 'births', w.stats.births, 'w0', f[0]?.brain.move.w.map(x => x.toFixed(2)).join(','));
  }
}
