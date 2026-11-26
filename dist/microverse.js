// Afterwing Microverse instrument: runs microverse/sim.mjs unchanged in the browser and draws what it does.
// The page only reads the world; it never changes a fly, a plant or the rule.
import { Microverse, ODOR_BITS, KINDS } from '/microverse/sim.mjs';
import { STRAINS } from '/microverse/strains.mjs';
import { CONFIG } from '/microverse/config.mjs';

const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => Math.round(n).toLocaleString('en-US');
const sk = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);
const popcount = m => { let n = 0; while (m) { n += m & 1; m >>>= 1; } return n; };
const bitsOf = m => [...Array(ODOR_BITS).keys()].filter(b => m >> b & 1);
const maskName = m => m ? bitsOf(m).map(b => 'b' + (b + 1)).join('·') : 'bias';

// ---------- scenarios and lineages ----------
const L2_WORLD = { ...CONFIG, brainSwitch: { mul: [1, 12], switch: .001 } }; // the Fly-RSI L2 world (docs/FLY_RSI_GOALS.md)
// Each scenario: its rung on the L0–L3 ladder, its default practice seed (checked in the browser, which does not reproduce
// Node's numbers for the L2 world), and one line of fresh-world context from docs/MICROVERSE_LOG.md and docs/FLY_RSI_LOG.md.
const L2_FINAL = 'in the 48-world paired-solo final, where each lineage lives alone, L2 beat evolution in 44/48 (+3.64 flies) and sham in 39/48 (+2.87).';
const L2_CONTEXT = 'One head-to-head world (practice seed); ' + L2_FINAL;
const SCENARIOS = [
  ['l1-fixed', 'L1 · Self-improving vs Fixed', 'L1', ['SELF', 'FIXED'], 101, 'One practice world. In the fresh-seed final (G5), self-improving beat fixed in 8/8 worlds.'],
  ['l1-sham', 'L1 · Self-improving vs Random Sham', 'L1', ['SELF', 'SHAM'], 101, 'One practice world. In the fresh-seed final (G5), self-improving beat random rewrites in 8/8 worlds.'],
  ['l1-evo', 'L1 · Self-improving vs Mutation-Only', 'L1', ['SELF', 'EVO'], 101, 'One practice world. Self-improving beat mutation-only in 8/8 practice worlds (a validity check, not a fresh final).'],
  ['g7c', 'L1 (G7c) · Taste + Movement vs Taste-Only', 'L1', ['SELF', 'TASTEONLY'], 101, 'One practice world. In the 96-world fresh final (G7c), taste + movement revision beat taste-only by +2.14 flies (66/96, p < 0.00001).'],
  ['self', 'L1 · Self-improving alone', 'L1', ['SELF'], 101, 'One practice world. In the fresh-seed final (G6), self-improving flies regained taste skill after each switch: mean gain .39 per rule, late skill .78.'],
  // Seed 109 is one of only 2 of 16 practice seeds where L2 survives evolution head to head, so the line says so.
  ['l2-evo', 'L2 · Brain-Cost Meta-Tuning vs Evolution', 'L2', ['L2_META', 'L2_EVOR'], 109, 'A practice seed where L2 survives and leads for the first ~5,000 ticks; head to head, evolution usually outlasts L2 (L2 died out in 14 of 16). ' + L2_FINAL[0].toUpperCase() + L2_FINAL.slice(1), L2_WORLD],
  ['l2-sham', 'L2 · Brain-Cost Meta-Tuning vs Matched Sham', 'L2', ['L2_META', 'L2_SHAM'], 105, L2_CONTEXT, L2_WORLD],
  ['oracle', 'Control · Born knowing the rule vs Fixed', null, ['ORACLE', 'FIXED'], 101, 'One practice world. The taste-matters control (G2): flies born with the rule beat fixed in 8/8 fresh final worlds. Born knowing is not learning, so it sits off the ladder.'],
].map(([id, label, rung, strains, seed, context, cfg = CONFIG]) => ({ id, label, rung, strains, seed, context, cfg }));
// When the tested lineage dies out in the one world on screen, the context line says how often that happens head to head
// (practice seeds 101–116 run in the browser to tick 10,000) before the registered result.
const LOST = {
  'l2-evo': 'Head to head, evolution usually outlasts L2 (L2 died out in 14 of 16 practice seeds); ' + L2_FINAL,
  'l2-sham': 'Rare head to head (the sham died first in all 16 practice seeds); ' + L2_FINAL,
};
// `dies`: why this control tends to lose, shown when it dies out. Tested lineages get no excuse.
const LINEAGE = {
  SELF: { name: 'Self-improving', color: '#b0703a', why: 'Adds and drops taste and movement features from its own evidence.' },
  L2_META: { name: 'Meta-tuning (L2)', color: '#b0703a', why: 'Self-improving, and switches its reviser between a lean and a full package from the brain cost it feels.' },
  FIXED: { name: 'Fixed program', color: '#3f5f74', hollow: true, why: 'Learns weights in life but never changes which features it has.', dies: fam => `cannot form ${fam === 'triples' ? 'triple' : fam === 'pairs' ? 'pair' : 'multi-bit'} features` },
  EVO: { name: 'Mutation only', color: '#3f5f74', hollow: true, why: 'Features change only by random mutation at birth.', dies: () => 'features change only by chance at birth' },
  L2_EVOR: { name: 'Evolution (EVO-R)', color: '#3f5f74', hollow: true, why: 'Self-improving; its reviser package changes only by mutation at birth.', dies: () => 'its reviser settings change only by mutation at birth' },
  SHAM: { name: 'Random rewrites', color: '#5f5b45', hollow: true, why: 'Adds and drops features at random instead of from evidence.', dies: () => 'random rewrites rarely keep the hidden terms' },
  L2_SHAM: { name: 'Matched sham', color: '#5f5b45', hollow: true, why: 'Same package switching, driven by a fake cost signal unrelated to its body.', dies: () => 'its package follows a fake cost signal' },
  TASTEONLY: { name: 'Taste-only revision', color: '#3f5f74', hollow: true, why: 'Revises taste features from evidence, never movement senses.', dies: () => 'it never revises how it searches for food' },
  ORACLE: { name: 'Oracle', color: '#8a6a1c', why: 'Born holding the current rule\'s terms; never revises.' },
};
const SAGE = '#5f7a2e', TOXIC = '#b5452e', INK = '#2b2a1e', FAINT = '#8f8a6a', STONE = '#c9c2a0', OCHRE = '#8a6a1c', TERRA = '#b0703a';
const RATE = { slow: 8, normal: 24, fast: 120 }; // ticks per second, independent of display refresh rate
const coarse = matchMedia('(pointer: coarse)').matches;
const MOVE_NAMES = ['bias', 'food here', 'good food here', 'smell', 'crowding', 'energy', 'near smell', 'far smell', 'toward best food', 'worth staying'];
const moveName = m => [...Array(10).keys()].filter(b => m >> b & 1).map(b => MOVE_NAMES[b]).join(' × ');

// The fly's own taste decision, read the same way sim.mjs computes it (tastePredict + acceptAt), for display only.
const walsh = (m, bits) => { let v = 1; for (let b = 0; b < bits.length; b++) if (m >> b & 1) v *= bits[b]; return v; };
const gated = t => t.lossModel !== undefined && t.lossModel >= t.lossBase;
function predict(brain, bits) {
  const t = brain.taste;
  if (brain.program.confidenceGate !== false && gated(t)) return .05 + .9 * t.base;
  const n = t.masks.length; let z = Math.log(3);
  for (let i = 0; i < n; i++) z += t.w[i] * walsh(t.masks[i], bits) / Math.sqrt(n);
  return .05 + .9 / (1 + Math.exp(-z));
}
const accepts = (f, bits) => predict(f.brain, bits) > (f.brain.genes.acceptAt ?? .5);
const isLean = f => f.brain.genes.tasteCap === 9; // L2 lean package (strains.mjs L2_LEAN)

// ---------- state ----------
let sc, names, w, hist, switches, followed, flyState, ripples, events, handoff, extinct, locks, lastSwitchTick, prevMasks, prevMul;
let running = !reduced, speed = 'normal', layer = 'truth', chartMode = 'skill', hotTerm = null, skipping = null, tickAcc = 0, lastFrame = 0, lastUi = 0, stats = {};
let seedCustom = false; // a seed typed by the reader, drawn by New world, or given in the URL survives scenario switches
let menuGeom = { x0: 0, cw: 1 }, hotCol = null;

function setup() {
  const sel = $('scenario');
  sel.innerHTML = SCENARIOS.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
  const q = new URLSearchParams(location.search);
  if (SCENARIOS.some(s => s.id === q.get('scenario'))) sel.value = q.get('scenario');
  const first = scenarioOf(sel.value), qs = Math.floor(+q.get('seed'));
  seedCustom = qs >= 1 && qs !== first.seed;
  $('seed').value = seedCustom ? qs : first.seed;
  sel.addEventListener('change', () => { if (!seedCustom) $('seed').value = scenarioOf(sel.value).seed; reset(); });
  $('seed').addEventListener('change', () => { seedCustom = Math.floor(+$('seed').value) !== scenarioOf(sel.value).seed; reset(); });
  $('newWorld').addEventListener('click', () => { $('seed').value = 1 + Math.floor(Math.random() * 99999); seedCustom = true; reset(); });
  $('play').addEventListener('click', () => { if (!w.flies.length) return; running = !running; skipping = null; note(null); syncControls(); });
  $('step').addEventListener('click', () => { running = false; skipping = null; note(null); for (let i = 0; i < 10; i++) tick1(); observe(false); syncControls(); updateUi(); });
  $('skip').addEventListener('click', () => { note(null); startSkip(); });
  for (const b of $('speed').querySelectorAll('button')) b.addEventListener('click', () => { speed = b.dataset.speed; tickAcc = 0; syncControls(); });
  for (const b of $('layer').querySelectorAll('button')) b.addEventListener('click', () => { layer = b.dataset.layer; syncControls(); updateUi(); });
  for (const b of $('chartMode').querySelectorAll('button')) b.addEventListener('click', () => { chartMode = b.dataset.mode; syncControls(); drawChart(); });
  $('world').addEventListener('click', pickFly);
  const menu = $('menu');
  menu.addEventListener('mousemove', e => setHotCol(menuCol(e)));
  menu.addEventListener('click', e => setHotCol(menuCol(e)));
  menu.addEventListener('mouseleave', () => setHotCol(null));
  menu.addEventListener('blur', () => setHotCol(null));
  menu.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setHotCol(hotCol === null ? 0 : (hotCol + (e.key === 'ArrowRight' ? 1 : KINDS - 1)) % KINDS);
  });
  $('layer').querySelector('[data-layer=mind]').title = 'Food as the followed fly would judge it';
  document.addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); $('play').click(); } });
  addEventListener('resize', () => { drawChart(); drawMenu(); });
  if (coarse) {
    $('pickHint').textContent = 'Tap any fly to follow it.';
    $('world').setAttribute('aria-label', 'Live map of the world: food patches and flies. Tap a fly to follow it.');
  }
  buildConstellation();
  reset();
  requestAnimationFrame(frame);
}
const scenarioOf = id => SCENARIOS.find(s => s.id === id) ?? SCENARIOS[0];

function reset() {
  sc = scenarioOf($('scenario').value);
  names = sc.strains;
  const seed = Math.max(1, Math.floor(+$('seed').value || sc.seed)); $('seed').value = seed;
  w = new Microverse(seed, Object.fromEntries(names.map(n => [n, STRAINS[n]])), sc.cfg);
  hist = []; switches = [{ tick: 0, family: w.rule.family }]; flyState = new Map(); ripples = []; events = []; handoff = null; extinct = {}; locks = {};
  lastSwitchTick = 0; prevMasks = null; prevMul = null; skipping = null; tickAcc = 0;
  followed = bestOf(names[0]);
  history.replaceState(null, '', `${location.pathname}?scenario=${sc.id}${seedCustom ? `&seed=${seed}` : ''}${location.hash}`);
  for (const li of $('ladder').children) {
    const on = li.dataset.rung === sc.rung; li.classList.toggle('on', on);
    on ? li.setAttribute('aria-current', 'step') : li.removeAttribute('aria-current');
    if (on) { const lad = $('ladder'); lad.scrollLeft = Math.max(0, li.offsetLeft - lad.offsetLeft - 16); } // phones scroll the strip
  }
  $('prevRule').innerHTML = '';
  buildCards(); buildLegends();
  log(`World ${seed} begins: ${names.map(n => LINEAGE[n].name).join(' vs ')}, ${w.flies.length} founders, rule <b>${w.rule.family}</b>.`);
  if (reduced) note('Paused because your system asks for reduced motion. Press Play, Step or Skip to run the world.');
  else note(null);
  sample(); observe(false); syncControls(); updateUi();
}

const bestOf = strain => w.flies.filter(f => f.strain === strain).sort((a, b) => b.energy - a.energy)[0] ?? w.flies[0] ?? null;
function note(text) { const n = $('notice'); n.hidden = !text; n.textContent = text ?? ''; }
function log(html) { events.unshift({ tick: w.tick, html }); events.length = Math.min(events.length, 7); renderLog(); }

// ---------- running the world ----------
function tick1() {
  if (!w.flies.length) return false;
  const r0 = w.rule; w.step();
  if (w.rule !== r0) onSwitch(r0);
  if (w.tick % 25 === 0) sample();
  return true;
}
function onSwitch(old) {
  lastSwitchTick = w.tick; switches.push({ tick: w.tick, family: w.rule.family }); locks = {};
  fadeOldRule(old);
  log(`<b>Rule switch</b>: ${old.family} → ${w.rule.family}. New hidden terms: ${w.rule.target.map(maskName).join(', ')}.`);
}
function sample() {
  const pt = { tick: w.tick };
  for (const n of names) {
    const v = w.flies.filter(f => f.strain === n), stride = Math.max(1, Math.floor(v.length / 60));
    let s = 0, k = 0; for (let i = 0; i < v.length; i += stride) { s += w.skill(v[i]); k++; }
    pt[n] = { pop: v.length, skill: k ? s / k : null };
    if (!v.length && extinct[n] === undefined && w.flies.length) {
      extinct[n] = w.tick; const L = LINEAGE[n];
      log(`<b style="color:${L.color}">${L.name} died out</b>${L.dies ? ` (${L.dies(w.rule.family)})` : ''}.`);
    }
  }
  hist.push(pt);
  if (hist.length > 1600) hist = hist.filter((_, i) => i % 2 === 0 || i === hist.length - 1);
}
function startSkip() {
  if (!w.flies.length) return;
  const sch = w.cfg.ruleSchedule;
  let to = w.ruleEnds - 40;
  if (to <= w.tick + 5) to += sch[(w.ruleIndex + 1) % sch.length][1];
  skipping = { from: w.tick, to }; syncControls();
}
function frame(now) {
  const dt = Math.min(100, lastFrame ? now - lastFrame : 16); lastFrame = now; // cap so a hidden tab does not burst on return
  if (skipping) {
    const end = performance.now() + 26;
    while (w.tick < skipping.to && performance.now() < end) if (!tick1()) break;
    if (w.tick >= skipping.to || !w.flies.length) { skipping = null; running = !!w.flies.length; speed = 'normal'; tickAcc = 0; }
    observe(false); for (const s of flyState.values()) s.trail = s.trail.slice(-1); syncControls();
  } else if (running) {
    if (speed === 'max') { const end = performance.now() + 12; while (performance.now() < end) if (!tick1()) break; }
    else {
      tickAcc += dt * RATE[speed] / 1000;
      const n = Math.min(40, Math.floor(tickAcc)); tickAcc -= n;
      for (let i = 0; i < n; i++) if (!tick1()) break;
    }
    if (!w.flies.length) { running = false; note(`Every fly has died by tick ${fmt(w.tick)}. Start a new world.`); syncControls(); }
    observe(!reduced && speed !== 'max');
  }
  drawMap(now);
  if (now - lastUi > 160) { lastUi = now; updateUi(); }
  requestAnimationFrame(frame);
}

// Per-frame observation: headings, trails, bites (for ripples) and the followed fly's fate.
function observe(withRipples) {
  const N = w.cfg.size, next = new Map();
  for (const f of w.flies) {
    let s = flyState.get(f.id);
    if (!s) s = { trail: [[f.x, f.y]], ang: Math.random() * 6.283, good: f.eaten.good, bad: f.eaten.bad };
    const [lx, ly] = s.trail[s.trail.length - 1];
    if (lx !== f.x || ly !== f.y) {
      let dx = f.x - lx, dy = f.y - ly; if (dx > N / 2) dx -= N; if (dx < -N / 2) dx += N; if (dy > N / 2) dy -= N; if (dy < -N / 2) dy += N;
      s.ang = Math.atan2(dy, dx); s.trail.push([f.x, f.y]);
      const cap = f === followed ? 90 : 5; if (s.trail.length > cap) s.trail.splice(0, s.trail.length - cap);
    }
    if (withRipples && ripples.length < 90) {
      const own = f === followed;
      if (f.eaten.good > s.good) ripples.push({ x: f.x, y: f.y, good: true, own, t0: performance.now() });
      if (f.eaten.bad > s.bad) ripples.push({ x: f.x, y: f.y, good: false, own, t0: performance.now() });
    }
    s.good = f.eaten.good; s.bad = f.eaten.bad; next.set(f.id, s);
  }
  flyState = next;
  if (followed && !next.has(followed.id)) {
    const was = followed, cause = was.energy <= 0 ? `starved at age ${fmt(was.age)}` : `reached the age limit (${fmt(was.age)} ticks)`;
    followed = bestOf(was.strain);
    // Auto-follow handoffs collapse into one counter line so rule switches and discoveries stay visible.
    handoff = { n: (handoff?.n ?? 0) + 1, tick: w.tick, text: `#${was.id} ${cause}${followed ? `; now following #${followed.id}` : ''}` };
    renderLog();
    prevMasks = null; prevMul = null;
  }
}

function pickFly(e) {
  const c = $('world'), r = c.getBoundingClientRect(), N = w.cfg.size;
  const cx = (e.clientX - r.left) / r.width * N - .5, cy = (e.clientY - r.top) / r.height * N - .5;
  let best = null, bd = 2.2;
  for (const f of w.flies) {
    let dx = Math.abs(f.x - cx), dy = Math.abs(f.y - cy); dx = Math.min(dx, N - dx); dy = Math.min(dy, N - dy);
    const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = f; }
  }
  if (best) { followed = best; prevMasks = null; prevMul = null; updateUi(); }
}

// ---------- the map ----------
const bloom = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(95,122,46,.95)'); g.addColorStop(.45, 'rgba(95,122,46,.45)'); g.addColorStop(1, 'rgba(95,122,46,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c;
})();
function fit(c) {
  const r = c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1), W = Math.round(r.width * d), H = Math.round(r.height * d);
  if (W && H && (c.width !== W || c.height !== H)) { c.width = W; c.height = H; }
  const ctx = c.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0); return { ctx, W: r.width, H: r.height };
}
function drawFly(ctx, x, y, ang, L, color, hollow) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(-L * .12, s * L * .26, L * .34, L * .13, -s * .45, 0, 6.2832);
    if (!hollow) { ctx.fillStyle = color + '4d'; ctx.fill(); }
    ctx.lineWidth = .9; ctx.strokeStyle = color; ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, L * .42, L * .15, 0, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.arc(L * .45, 0, L * .12, 0, 6.2832); ctx.fill();
  ctx.restore();
}
function diamond(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.closePath(); }

function drawMap(now) {
  const { ctx, W } = fit($('world')); if (!W) return;
  const N = w.cfg.size, cell = W / N, cap = w.cfg.plantCap;
  ctx.fillStyle = '#e9edc9'; ctx.fillRect(0, 0, W, W);
  ctx.strokeStyle = 'rgba(43,42,30,.045)'; ctx.lineWidth = 1;
  for (let i = 5; i < N; i += 5) { const p = Math.round(i * cell) + .5; ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, W); ctx.moveTo(0, p); ctx.lineTo(W, p); ctx.stroke(); }

  const mind = layer === 'mind' && followed, acc = mind ? w.codes.map(b => accepts(followed, b)) : null;
  // pass 1: nutritious blooms, multiplied like watercolor on paper
  ctx.globalCompositeOperation = 'multiply';
  for (let k = 0; k < w.plant.length; k++) {
    const p = w.plant[k]; if (!p || w.kindValence[p.kind] <= 0) continue;
    if (mind && !acc[p.kind]) continue;
    const a = Math.max(.08, Math.min(1, p.amount / cap)), r = cell * (.55 + .6 * Math.sqrt(a));
    const cx = (k % N + .5) * cell, cy = (Math.floor(k / N) + .5) * cell;
    ctx.globalAlpha = .18 + .32 * a; ctx.drawImage(bloom, cx - r, cy - r, 2 * r, 2 * r);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // pass 2: crisp marks
  for (let k = 0; k < w.plant.length; k++) {
    const p = w.plant[k]; if (!p) continue;
    const a = Math.max(.1, Math.min(1, p.amount / cap)), cx = (k % N + .5) * cell, cy = (Math.floor(k / N) + .5) * cell, good = w.kindValence[p.kind] > 0;
    // Perception layer, quietest to loudest: skips toxic (stone outline), skips nutritious (dashed ochre ring),
    // would eat nutritious (sage bloom, as in true chemistry), would eat toxic (solid red diamond in a red halo).
    if (good) {
      if (mind && !acc[p.kind]) { ctx.setLineDash([2, 2]); ctx.strokeStyle = OCHRE; ctx.globalAlpha = .45 + .3 * a; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, cell * .3, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.fillStyle = SAGE; ctx.globalAlpha = .45 + .5 * a; ctx.beginPath(); ctx.arc(cx, cy, cell * .07 + 1, 0, 6.2832); ctx.fill(); }
    } else {
      const s = cell * (.16 + .2 * a);
      if (mind && acc[p.kind]) {
        ctx.globalAlpha = .16; ctx.fillStyle = TOXIC; ctx.beginPath(); ctx.arc(cx, cy, cell * .66, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = .9; ctx.strokeStyle = TOXIC; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, cell * .66, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = 1; diamond(ctx, cx, cy, Math.max(s * 1.25, cell * .3)); ctx.fill();
      } else if (mind) { ctx.globalAlpha = .6; ctx.strokeStyle = STONE; ctx.lineWidth = .9; diamond(ctx, cx, cy, s * .9); ctx.stroke(); }
      else { ctx.globalAlpha = .45 + .5 * a; ctx.strokeStyle = TOXIC; ctx.lineWidth = 1.15; diamond(ctx, cx, cy, s); ctx.stroke(); }
    }
  }
  ctx.globalAlpha = 1;
  // trails
  ctx.lineCap = 'round';
  for (const f of w.flies) {
    const s = flyState.get(f.id); if (!s || s.trail.length < 2) continue;
    const color = LINEAGE[f.strain]?.color ?? INK, long = f === followed, t = s.trail;
    if (!long && (speed === 'fast' || speed === 'max')) continue;
    ctx.strokeStyle = color; ctx.lineWidth = long ? 1.4 : 1;
    for (let i = 1; i < t.length; i++) {
      if (Math.abs(t[i][0] - t[i - 1][0]) + Math.abs(t[i][1] - t[i - 1][1]) > 2) continue; // a frame that skipped several ticks, or a wrap
      ctx.globalAlpha = (long ? .65 : .2) * i / t.length;
      ctx.beginPath(); ctx.moveTo((t[i - 1][0] + .5) * cell, (t[i - 1][1] + .5) * cell); ctx.lineTo((t[i][0] + .5) * cell, (t[i][1] + .5) * cell); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  // feeding ripples
  ripples = ripples.filter(r => now - r.t0 < 750);
  for (const r of ripples) {
    if (mind && !r.own) continue; // through one fly's eyes, other flies' bites would read as its own errors
    const u = (now - r.t0) / 750; ctx.globalAlpha = (1 - u) * .8; ctx.strokeStyle = r.good ? SAGE : TOXIC; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc((r.x + .5) * cell, (r.y + .5) * cell, cell * (.35 + 1.25 * u), 0, 6.2832); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // flies
  for (const f of w.flies) {
    if (f === followed) continue; const s = flyState.get(f.id), L = LINEAGE[f.strain] ?? { color: INK };
    drawFly(ctx, (f.x + .5) * cell, (f.y + .5) * cell, s?.ang ?? 0, cell * .95, L.color, L.hollow);
  }
  if (followed) {
    const s = flyState.get(followed.id), L = LINEAGE[followed.strain], x = (followed.x + .5) * cell, y = (followed.y + .5) * cell, R = cell * 1.15, q = cell * .5;
    drawFly(ctx, x, y, s?.ang ?? 0, cell * 1.35, L.color, L.hollow);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath();
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.moveTo(x + sx * R, y + sy * (R - q)); ctx.lineTo(x + sx * R, y + sy * R); ctx.lineTo(x + sx * (R - q), y + sy * R); }
    ctx.stroke();
    ctx.font = '500 10px "Geist Mono", ui-monospace, monospace'; ctx.fillStyle = INK; ctx.textBaseline = 'middle';
    const label = '#' + followed.id, tx = x + R + 5 + ctx.measureText(label).width > W ? x - R - 5 - ctx.measureText(label).width : x + R + 5;
    ctx.fillStyle = 'rgba(254,250,224,.9)'; ctx.fillRect(tx - 2, y - R - 1, ctx.measureText(label).width + 4, 12); ctx.fillStyle = INK; ctx.fillText(label, tx, y - R + 5);
  }
}

// ---------- the constellation ----------
const C = 130, RAD = 96, node = i => [C + RAD * Math.cos(-Math.PI / 2 + i * Math.PI / 4), C + RAD * Math.sin(-Math.PI / 2 + i * Math.PI / 4)];
function buildConstellation() {
  const nodes = [...Array(ODOR_BITS).keys()].map(i => { const [x, y] = node(i); return `<g class="node" data-bit="${i}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11"/><text x="${x.toFixed(1)}" y="${y.toFixed(1)}">${i + 1}</text></g>`; }).join('');
  $('constellation').innerHTML = `<circle cx="${C}" cy="${C}" r="${RAD}" fill="none" stroke="rgba(43,42,30,.08)"/>
    <g id="prevRule" class="prev"></g><g id="flyLeads"></g><g id="ruleTerms"></g><g id="heldTerms"></g><g id="nodes">${nodes}</g>`;
}
// One term as geometry: a ring for one channel, a chord for two, a polygon for three or more.
function shape(mask, v, attrs) {
  const b = bitsOf(mask);
  // v = 0 is the hidden term (dashed); v = 1, 2 are the two lineages, drawn offset so the strokes never sit on the dashes.
  if (b.length === 1) { const [x, y] = node(b[0]); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${15 + v * 5}" fill="none" ${attrs}/>`; }
  let pts = b.map(node);
  if (b.length === 2) {
    const [[x1, y1], [x2, y2]] = pts, L = Math.hypot(x2 - x1, y2 - y1) || 1, o = [0, 4.5, -4.5][v], nx = -(y2 - y1) / L * o, ny = (x2 - x1) / L * o;
    return `<line x1="${(x1 + nx).toFixed(1)}" y1="${(y1 + ny).toFixed(1)}" x2="${(x2 + nx).toFixed(1)}" y2="${(y2 + ny).toFixed(1)}" ${attrs}/>`;
  }
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length, k = [1, .84, .7][v];
  pts = pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
  return `<polygon points="${pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke-linejoin="round" ${attrs}/>`;
}
function fadeOldRule(old) {
  const g = $('prevRule'); g.style.transition = 'none'; g.style.opacity = 1;
  g.innerHTML = old.target.map(m => shape(m, 0, 'stroke="#8f8a6a" stroke-width="1" stroke-dasharray="3 3"')).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => { g.style.transition = ''; g.style.opacity = 0; }));
}
function drawConstellation() {
  const target = w.rule.target, hot = hotTerm;
  $('ruleTerms').innerHTML = target.map(m => shape(m, 0, `stroke="${INK}" stroke-width="${m === hot ? 1.8 : 1}" stroke-dasharray="4 3" opacity="${hot !== null && m !== hot ? .25 : 1}"`)).join('');
  $('heldTerms').innerHTML = names.slice(0, 2).map((n, v) => target.map(m => {
    const share = stats[n]?.shares.get(m) ?? 0; if (share < .02) return '';
    return shape(m, v + 1, `stroke="${LINEAGE[n].color}" stroke-width="${share >= .5 ? 2 : 1.4}" opacity="${((hot !== null && m !== hot) ? .2 : .25 + .75 * share).toFixed(2)}"`);
  }).join('')).join('');
  // The followed fly's added features that are not in the rule: its open guesses.
  $('flyLeads').innerHTML = followed ? followed.brain.taste.masks.filter(m => popcount(m) > 1 && !target.includes(m)).map(m => shape(m, 0, 'stroke="#8f8a6a" stroke-width=".9" stroke-dasharray="1 2.5"')).join('') : '';
  const lit = new Set(hot !== null ? bitsOf(hot) : []);
  for (const g of $('nodes').children) g.classList.toggle('lit', lit.has(+g.dataset.bit));
}

function drawRule() {
  const r = w.rule, sch = w.cfg.ruleSchedule;
  $('ruleTag').textContent = `rule ${w.ruleIndex + 1} of ${sch.length} · ${r.family}`;
  const terms = r.terms.map(([m, c]) => (c === 1 ? '' : c + '·') + maskName(m));
  $('formula').innerHTML = `<span class="fam">nutritious when (bits read as ±1; the flies never see this line)</span><br>${r.bias ? r.bias + ' + ' : ''}${terms.join(' + ')} ${r.sign > 0 ? '&gt;' : '&lt;'} 0`;
  const ul = $('terms');
  const key = r.target.join(',') + '|' + names.join(',');
  if (ul.dataset.key !== key) {
    ul.dataset.key = key;
    $('termsKey').innerHTML = names.slice(0, 2).map(n => `<span><i class="lsw" style="background:${LINEAGE[n].color}"></i>${LINEAGE[n].name}</span>`).join('') + '<span>share of flies holding each term</span>';
    ul.innerHTML = r.target.map(m => `<li data-mask="${m}" tabindex="0"><span class="t">${maskName(m)}</span><span class="bars">${names.slice(0, 2).map(n => `<span class="share"><i class="lsw" style="background:${LINEAGE[n].color}" title="${LINEAGE[n].name}"></i><b><i data-n="${n}" style="background:${LINEAGE[n].color};width:0"></i></b><span data-v="${n}">0%</span></span>`).join('')}</span></li>`).join('');
    for (const li of ul.children) {
      const on = () => { hotTerm = +li.dataset.mask; drawConstellation(); drawMenu(); }, off = () => { hotTerm = null; drawConstellation(); drawMenu(); };
      li.addEventListener('mouseenter', on); li.addEventListener('mouseleave', off); li.addEventListener('focus', on); li.addEventListener('blur', off);
    }
  }
  for (const li of ul.children) {
    const m = +li.dataset.mask; li.classList.toggle('hot', m === hotTerm);
    for (const n of names.slice(0, 2)) { const s = stats[n]?.shares.get(m) ?? 0; li.querySelector(`i[data-n="${n}"]`).style.width = (s * 100).toFixed(0) + '%'; li.querySelector(`[data-v="${n}"]`).textContent = (s * 100).toFixed(0) + '%'; }
  }
  $('redraw').textContent = `${w.cfg.shiftEvery - w.tick % w.cfg.shiftEvery} ticks`;
  $('switchIn').textContent = `${fmt(Math.max(0, w.ruleEnds - w.tick))} ticks`;
}

// The 16 odor codes now on offer: their bits, their true value, and the followed fly's decision.
// Drawn at the SVG's real pixel width so labels stay 11px on every screen and the matrix never needs a scrollbar.
// The rule's sum for one code: bias + Σ coefficient × (product of its bits read as ±1). sign(sum) × rule.sign = valence.
const ruleSum = bits => w.rule.bias + w.rule.terms.reduce((a, [m, c]) => a + c * walsh(m, bits), 0);
const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) % 1 ? Math.abs(v).toFixed(1) : Math.abs(v));
function drawMenu() {
  const svg = $('menu'), W = Math.max(280, Math.round(svg.getBoundingClientRect().width) || 640);
  const x0 = 38, cw = (W - x0) / KINDS, P = 12.5, cs = 9, y0 = 2, yS = y0 + ODOR_BITS * P + 8, yT = yS + 15, yF = yT + 14, yE = yF + 9, H = yE + 5;
  const hb = hotTerm !== null ? new Set(bitsOf(hotTerm)) : null;
  const lab = (y, t, hot) => `<text x="0" y="${y}" dominant-baseline="central" style="font:500 10.5px var(--mono);fill:${hot ? TERRA : '#5f5b45'}">${t}</text>`;
  menuGeom = { x0, cw };
  let s = '', wrong = 0;
  for (let b = 0; b < ODOR_BITS; b++) {
    const y = y0 + b * P;
    if (hb?.has(b)) s += `<rect x="0" y="${y}" width="${W}" height="${P}" fill="#faedcd"/><rect x="0" y="${y}" width="2" height="${P}" fill="${TERRA}"/>`;
    else if (b % 2) s += `<rect x="0" y="${y}" width="${W}" height="${P}" fill="rgba(43,42,30,.025)"/>`;
    s += lab(y + P / 2, (hb?.has(b) ? ' ' : '') + 'b' + (b + 1), hb?.has(b));
  }
  if (hotCol !== null) s += `<rect x="${(x0 + hotCol * cw + 1).toFixed(1)}" y="0" width="${(cw - 2).toFixed(1)}" height="${H}" rx="3" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1"/>`;
  // The sum row: at rest the whole formula's value per code; while a term is hovered, that term's ±1 for each code.
  s += `<line x1="${x0}" x2="${W}" y1="${yS - 8.5}" y2="${yS - 8.5}" stroke="rgba(43,42,30,.12)"/>` + lab(yS, hotTerm !== null ? '±' : 'sum', hotTerm !== null) + lab(yT, 'true') + (followed ? lab(yF, 'fly') : '');
  w.codes.forEach((bits, k) => {
    const cx = x0 + k * cw + cw / 2, good = w.kindValence[k] > 0, X = cx.toFixed(1);
    bits.forEach((v, b) => { s += `<rect x="${(cx - cs / 2).toFixed(1)}" y="${(y0 + b * P + (P - cs) / 2).toFixed(2)}" width="${cs}" height="${cs}" rx="1.5" fill="${v > 0 ? INK : '#fffdf3'}" stroke="${hb?.has(b) ? TERRA : v > 0 ? INK : 'rgba(43,42,30,.3)'}" stroke-width="${hb?.has(b) ? 1.2 : .9}"/>`; });
    if (hotTerm !== null) { const p = walsh(hotTerm, bits); s += `<text x="${X}" y="${yS}" text-anchor="middle" dominant-baseline="central" style="font:500 12px var(--mono);fill:${p > 0 ? INK : TERRA}">${p > 0 ? '+' : '−'}</text>`; }
    else { const v = ruleSum(bits), t = cw < 28 ? (v > 0 ? '+' : v < 0 ? '−' : '0') : sgn(v) || '0'; s += `<text x="${X}" y="${yS}" text-anchor="middle" dominant-baseline="central" style="font:10px var(--mono);fill:#8f8a6a">${t}</text>`; }
    s += good ? `<circle cx="${X}" cy="${yT}" r="3.8" fill="${SAGE}"/>` : `<path d="M${X} ${yT - 4.2} l4.2 4.2 -4.2 4.2 -4.2 -4.2z" fill="none" stroke="${TOXIC}" stroke-width="1.3"/>`;
    if (followed) {
      const eat = accepts(followed, bits), bad = eat !== good; if (bad) wrong++;
      s += eat ? `<circle cx="${X}" cy="${yF}" r="3.6" fill="${INK}"/>` : `<circle cx="${X}" cy="${yF}" r="3.3" fill="#fffdf3" stroke="${INK}" stroke-width="1.2"/>`;
      if (bad) s += `<rect x="${(cx - Math.min(8, cw * .36)).toFixed(1)}" y="${yE - 1.5}" width="${Math.min(16, cw * .72).toFixed(1)}" height="3" rx="1.5" fill="${TERRA}"/>`;
    }
  });
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.style.height = H + 'px';
  svg.innerHTML = s;
  $('menuNote').innerHTML = followed ? `fly #${followed.id}: ● eats ○ skips <i style="display:inline-block;width:12px;height:3px;border-radius:2px;background:${TERRA};vertical-align:middle;margin:0 3px 0 6px"></i>wrong call · <b style="color:${wrong ? TERRA : SAGE}">${wrong} wrong of 16</b>` : '';
  drawTrace();
}
// One line under the matrix that walks a single code through the hidden formula and the followed fly's call.
function drawTrace() {
  const el = $('trace');
  if (hotCol === null) {
    el.innerHTML = hotTerm !== null ? `<b>${maskName(hotTerm)}</b> is the product of its bits read as ±1: <b>+</b> when an even number of them are off, <b style="color:${TERRA}">−</b> when odd. Hover a column to add it up.`
      : `${coarse ? 'Tap' : 'Hover'} any term or column to trace the formula${coarse ? '' : ' (or focus the matrix and use ← →)'}.`;
    return;
  }
  const bits = w.codes[hotCol], r = w.rule, good = w.kindValence[hotCol] > 0, sum = ruleSum(bits);
  const parts = r.terms.map(([m, c]) => { const v = c * walsh(m, bits), on = m === hotTerm; return `${on ? '<b>' : ''}${c === 1 ? '' : c + '·'}${maskName(m)}(${sgn(v)})${on ? '</b>' : ''}`; });
  let t = `code ${hotCol + 1}: ${r.bias ? r.bias + ' + ' : ''}${parts.join(' + ')} = <b>${sgn(sum) || '0'}</b> → <span class="${good ? 'good' : 'tox'}">${good ? 'nutritious' : 'toxic'}</span>`;
  if (followed) {
    const p = predict(followed.brain, bits), eat = p > (followed.brain.genes.acceptAt ?? .5), right = eat === good;
    t += ` · fly #${followed.id} predicts ${p.toFixed(2)} → ${eat ? 'eats' : 'skips'} <span class="${right ? 'ok' : 'bad'}">${right ? '✓' : '✗ wrong call'}</span>`;
  }
  el.innerHTML = t;
}
function setHotCol(k) { if (k === hotCol) return; hotCol = k; drawMenu(); }
function menuCol(e) { const r = $('menu').getBoundingClientRect(), k = Math.floor((e.clientX - r.left - menuGeom.x0) / menuGeom.cw); return k >= 0 && k < KINDS ? k : null; }

// ---------- numbers ----------
function measure() {
  stats = {};
  for (const n of names) {
    const v = w.flies.filter(f => f.strain === n), m = fn => v.length ? v.reduce((a, f) => a + fn(f), 0) / v.length : 0;
    const shares = new Map(w.rule.target.map(t => [t, v.length ? v.filter(f => f.brain.taste.masks.includes(t)).length / v.length : 0]));
    const stride = Math.max(1, Math.floor(v.length / 60)); let s = 0, k = 0; for (let i = 0; i < v.length; i += stride) { s += w.skill(v[i]); k++; }
    const st = { n: v.length, skill: k ? s / k : 0, shares, held: [...shares.values()].reduce((a, b) => a + b, 0), gen: m(f => f.gen), taste: m(f => f.brain.taste.masks.length), move: m(f => f.brain.move.masks.length) };
    if (sc.cfg.brainSwitch) {
      const hi = sc.cfg.brainSwitch.mul[1], known = v.filter(f => f.brainMul !== undefined), share = fn => known.length ? known.filter(fn).length / known.length : 0;
      st.costly = share(f => f.brainMul === hi); st.lean = share(isLean); st.matched = share(f => isLean(f) === (f.brainMul === hi));
    }
    stats[n] = st;
    // lineage-level discovery events, with hysteresis so a share hovering at the line does not chatter
    for (const [t, sh] of shares) {
      const key = n + ':' + t, was = locks[key];
      if (!was && sh >= .5) { locks[key] = true; log(`<span style="color:${LINEAGE[n].color}">${LINEAGE[n].name}</span>: most flies now hold <b>${maskName(t)}</b>.`); }
      else if (was && sh < .25) { locks[key] = false; log(`<span style="color:${LINEAGE[n].color}">${LINEAGE[n].name}</span> lost <b>${maskName(t)}</b> from most flies.`); }
    }
  }
  if (followed) {
    const now = new Set(followed.brain.taste.masks);
    if (prevMasks) {
      for (const m of now) if (!prevMasks.has(m)) log(`#${followed.id} added taste feature <b>${maskName(m)}</b>${w.rule.target.includes(m) ? ' (a hidden term)' : ''}.`);
      for (const m of prevMasks) if (!now.has(m)) log(`#${followed.id} pruned <b>${maskName(m)}</b>.`);
    }
    prevMasks = now;
    if (sc.cfg.brainSwitch && followed.brainMul !== undefined) {
      if (prevMul !== null && prevMul !== followed.brainMul) log(`#${followed.id}: brain cost now ×${followed.brainMul}; package ${isLean(followed) ? 'lean' : 'full'}.`);
      prevMul = followed.brainMul;
    }
  }
}

function updateUi() {
  measure();
  $('tickText').textContent = `tick ${fmt(w.tick)} · ${w.rule.family}`;
  $('tickPill').classList.toggle('paused', !running && !skipping);
  drawRule(); drawConstellation(); drawMenu(); drawCost(); drawVerdict(); drawChart(); updateCards(); drawSpec();
}

function drawVerdict() {
  const A = names[0], B = names[1], a = stats[A], nT = w.rule.target.length, since = w.tick - lastSwitchTick;
  const who = (n, s) => `<span style="color:${LINEAGE[n].color}">${LINEAGE[n].name}</span>: <span class="k">${fmt(s.n)}</span> flies, taste skill <span class="k">${sk(s.skill)}</span>, <span class="k">${s.held.toFixed(1)}/${nT}</span> hidden terms`;
  let t = `Tick ${fmt(w.tick)}, ${w.rule.family} rule. `;
  if (lastSwitchTick && since < 500) t = `The rule changed ${fmt(since)} ticks ago; watch taste skill fall and recover. `;
  if (!w.flies.length) t = `Every fly had died by tick ${fmt(w.tick)}.`;
  else if (!B) t += who(A, a) + '.';
  else {
    const b = stats[B], gone = n => { const L = LINEAGE[n], at = extinct[n]; return `${L.name} died out${at !== undefined ? ` at tick ${fmt(at)}` : ''}${L.dies ? ` (${L.dies(familyAt(at))})` : ''}. `; };
    if (!b.n) t = gone(B) + who(A, a) + '.';
    else if (!a.n) t = gone(A) + who(B, b) + '.' + (LOST[sc.id] ? '' : ' A single world can go either way.');
    else t += who(A, a) + '. ' + who(B, b) + '.';
  }
  $('verdict').innerHTML = t;
  $('context').textContent = B && !stats[A].n && w.flies.length && LOST[sc.id] ? LOST[sc.id] : sc.context;
  const tot = names.reduce((s, n) => s + stats[n].n, 0) || 1;
  $('sharebar').innerHTML = names.map(n => `<i style="width:${(stats[n].n / tot * 100).toFixed(1)}%;background:${LINEAGE[n].color}"></i>`).join('');
}

const familyAt = tick => [...switches].reverse().find(s => s.tick <= (tick ?? w.tick))?.family ?? w.rule.family;

function drawCost() {
  const el = $('cost'); el.classList.toggle('on', !!sc.cfg.brainSwitch); if (!sc.cfg.brainSwitch) return;
  const f = followed, fl = f && f.brainMul !== undefined ? `<span>#${f.id} <span class="big" style="color:${f.brainMul > 1 ? TOXIC : SAGE}">×${f.brainMul}</span> cost, <b>${isLean(f) ? 'lean' : 'full'}</b></span>` : '';
  el.innerHTML = `<div class="row"><span class="why">Brain cost</span>${fl}${names.map(n => `<span><span style="color:${LINEAGE[n].color}">${LINEAGE[n].name}</span> ${stats[n].n ? `<span class="mono">${(stats[n].costly * 100).toFixed(0)}%</span> at ×12, <b class="mono">${(stats[n].matched * 100).toFixed(0)}%</b> matched` : 'died out'}</span>`).join('')}</div>
    <div class="why">Feature cost flips ×1 ↔ ×12 about every 1,000 ticks; matched = lean package (≤ 9 taste features) at ×12, full at ×1.</div>`;
}

// ---------- chart ----------
function drawChart() {
  const { ctx, W, H } = fit($('chart')); if (!W) return;
  ctx.clearRect(0, 0, W, H);
  const pl = 34, pr = 8, pt = 15, pb = 17, iw = W - pl - pr, ih = H - pt - pb;
  const t1 = Math.max(3000, w.tick), X = t => pl + t / t1 * iw;
  let lo, hi, ticks;
  if (chartMode === 'skill') { lo = -.25; hi = 1; ticks = [0, .5, 1]; }
  else { lo = 0; hi = Math.max(20, ...hist.flatMap(p => names.map(n => p[n].pop))) * 1.1; const st = hi > 300 ? 100 : hi > 120 ? 50 : 20; ticks = []; for (let v = 0; v < hi; v += st) ticks.push(v); }
  const Y = v => pt + (1 - (v - lo) / (hi - lo)) * ih;
  ctx.font = '10px "Geist Mono", ui-monospace, monospace'; ctx.textBaseline = 'middle'; ctx.lineWidth = 1;
  for (const v of ticks) { ctx.strokeStyle = v === 0 ? 'rgba(43,42,30,.22)' : 'rgba(43,42,30,.07)'; ctx.beginPath(); ctx.moveTo(pl, Math.round(Y(v)) + .5); ctx.lineTo(W - pr, Math.round(Y(v)) + .5); ctx.stroke(); ctx.fillStyle = FAINT; ctx.textAlign = 'right'; ctx.fillText(chartMode === 'skill' ? v.toFixed(1) : String(v), pl - 6, Y(v)); }
  // rule-switch lines; labels flip to the left of their line near the right edge and skip when they would collide
  ctx.setLineDash([3, 3]); let labelEnd = -Infinity;
  for (const s of switches) {
    const x = Math.round(X(s.tick)) + .5; if (s.tick) { ctx.strokeStyle = 'rgba(43,42,30,.3)'; ctx.beginPath(); ctx.moveTo(x, pt - 4); ctx.lineTo(x, pt + ih); ctx.stroke(); }
    const tw = ctx.measureText(s.family).width, left = x + 4 + tw > W - pr ? x - 4 - tw : x + 4;
    if (left < labelEnd + 8) continue;
    ctx.fillStyle = FAINT; ctx.textAlign = 'left'; ctx.fillText(s.family, left, pt - 8); labelEnd = left + tw;
  }
  ctx.setLineDash([]);
  for (const n of names) {
    ctx.strokeStyle = LINEAGE[n].color; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.beginPath(); let on = false;
    for (const p of hist) {
      // a mean over fewer than 5 flies is noise (it spikes just before a lineage dies out), so the skill line breaks there
      const v = chartMode === 'skill' ? (p[n].pop < 5 ? null : p[n].skill) : p[n].pop;
      if (v === null) { on = false; continue; }
      const x = X(p.tick), y = Y(Math.max(lo, Math.min(hi, v))); on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true;
    }
    ctx.stroke();
  }
  // x axis: round intermediate ticks, then the current end
  ctx.fillStyle = FAINT; ctx.textAlign = 'left'; ctx.fillText('0', pl, H - 6);
  const endLabel = `tick ${fmt(t1)}`, endLeft = W - pr - ctx.measureText(endLabel).width;
  const step = [500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000, 100000].find(st => t1 / st <= 6) ?? 200000;
  ctx.textAlign = 'center';
  for (let v = step; v < t1; v += step) {
    const x = X(v), half = ctx.measureText(fmt(v)).width / 2;
    if (x + half > endLeft - 10) break;
    ctx.strokeStyle = 'rgba(43,42,30,.22)'; ctx.beginPath(); ctx.moveTo(Math.round(x) + .5, pt + ih); ctx.lineTo(Math.round(x) + .5, pt + ih + 3); ctx.stroke();
    ctx.fillText(fmt(v), x, H - 6);
  }
  ctx.textAlign = 'right'; ctx.fillText(endLabel, W - pr, H - 6);
  $('chartHead').textContent = chartMode === 'skill' ? 'Taste skill over time' : 'Population over time';
  $('chartSub').textContent = chartMode === 'skill' ? 'P(eat | nutritious) − P(eat | toxic), lineage mean' : 'Living flies in each lineage';
}

// ---------- lineage cards, specimen, legends, log ----------
const glyph = n => { const L = LINEAGE[n]; return `<svg class="flyglyph" viewBox="0 0 16 12" aria-hidden="true"><g transform="translate(8 6)">${[-1, 1].map(s => `<ellipse cx="-1.7" cy="${s * 3.6}" rx="4.8" ry="1.8" transform="rotate(${-s * 26} -1.7 ${s * 3.6})" fill="${L.hollow ? 'none' : L.color}" fill-opacity=".3" stroke="${L.color}" stroke-width=".9"/>`).join('')}<ellipse rx="5.9" ry="2.1" fill="${L.color}"/><circle cx="6.3" r="1.7" fill="${L.color}"/></g></svg>`; };
function buildCards() {
  $('cards').innerHTML = names.map(n => `<article class="card"><h3>${glyph(n)}${LINEAGE[n].name}</h3><p class="why">${LINEAGE[n].why}</p>
    <dl><dt>Population</dt><dd data-k="${n}:n">–</dd><dt>Taste skill</dt><dd data-k="${n}:skill">–</dd><dt>Hidden terms held</dt><dd data-k="${n}:held">–</dd><dt>Mean generation</dt><dd data-k="${n}:gen">–</dd><dt>Taste features / senses</dt><dd data-k="${n}:fs">–</dd></dl>
    <button class="btn" type="button" data-follow="${n}">Follow a ${LINEAGE[n].name.toLowerCase()} fly</button></article>`).join('');
  for (const b of $('cards').querySelectorAll('[data-follow]')) b.addEventListener('click', () => { const f = bestOf(b.dataset.follow); if (f && f.strain === b.dataset.follow) { followed = f; prevMasks = null; prevMul = null; updateUi(); } });
}
function updateCards() {
  const nT = w.rule.target.length, set = (k, v) => { const el = $('cards').querySelector(`[data-k="${k}"]`); if (el) el.textContent = v; };
  for (const n of names) {
    const s = stats[n]; set(n + ':n', fmt(s.n)); set(n + ':skill', s.n ? sk(s.skill) : '–'); set(n + ':held', s.n ? `${s.held.toFixed(1)} / ${nT}` : '–');
    set(n + ':gen', s.n ? s.gen.toFixed(1) : '–'); set(n + ':fs', s.n ? `${s.taste.toFixed(1)} / ${s.move.toFixed(1)}` : '–');
    const btn = $('cards').querySelector(`[data-follow="${n}"]`); if (btn) btn.disabled = !s.n;
  }
}
function drawSpec() {
  const f = followed, el = $('spec');
  if (!f) { el.innerHTML = '<p class="empty">No fly selected.</p>'; return; }
  const t = f.brain.taste, target = w.rule.target, trusted = !gated(t);
  const gate = t.lossModel === undefined ? '<span class="gate">no tastings yet</span>' : trusted ? '<span class="gate ok">taste model trusted</span>' : '<span class="gate fb">base-rate fallback</span>';
  const chips = t.masks.map(m => `<span class="chip ${target.includes(m) ? 'hit' : m === 0 ? 'base' : ''}">${maskName(m)}</span>`).join('') + target.filter(m => !t.masks.includes(m)).map(m => `<span class="chip miss">${maskName(m)} missing</span>`).join('');
  const senses = f.brain.move.masks.map(m => `<span class="chip ${m === 1 ? 'base' : ''}">${moveName(m)}</span>`).join('');
  const cost = sc.cfg.brainSwitch && f.brainMul !== undefined ? ` · brain cost ×${f.brainMul}, ${isLean(f) ? 'lean' : 'full'} package` : '';
  el.innerHTML = `<h3>${glyph(f.strain)}Fly #${f.id} · <span style="color:${LINEAGE[f.strain].color}">${LINEAGE[f.strain].name}</span> ${gate}</h3>
    <div class="stats"><div><span>Energy</span><b>${f.energy.toFixed(1)} / ${w.cfg.maxEnergy}</b></div><div><span>Age</span><b>${fmt(f.age)}</b></div><div><span>Generation</span><b>${f.gen}</b></div><div><span>Bites good / toxic</span><b>${f.eaten.good} / ${f.eaten.bad}</b></div></div>
    <h4>Taste features (${t.masks.length}) · highlighted = a hidden term</h4><div class="chips">${chips}</div>
    <h4>Movement senses (${f.brain.move.masks.length})</h4><div class="chips">${senses}</div>
    <p class="empty" style="margin:10px 0 0">Eats when its predicted chance of good food exceeds ${(f.brain.genes.acceptAt ?? .5).toFixed(2)}${cost}. ${f.gen ? "Born with its parent's features and evidence, with every learned weight at zero." : "A founder: it starts from its lineage's program with every weight at zero."}</p>`;
}
function buildLegends() {
  const flies = names.map(n => `<span>${glyph(n)}${LINEAGE[n].name}</span>`).join('');
  $('chartLegend').innerHTML = names.map(n => `<span><i class="sw" style="height:2px;background:${LINEAGE[n].color}"></i>${LINEAGE[n].name}</span>`).join('') + '<span><i class="sw" style="height:0;border-top:1px dashed rgba(43,42,30,.45)"></i>rule switch</span>';
  $('mapLegend').dataset.flies = flies;
}
function mapLegend() {
  const flies = $('mapLegend').dataset.flies ?? '';
  if (layer === 'mind' && followed) {
    const acc = w.codes.map(b => accepts(followed, b)); let ge = 0, te = 0, gs = 0, ts = 0;
    for (const p of w.plant) { if (!p) continue; const g = w.kindValence[p.kind] > 0, e = acc[p.kind]; g ? (e ? ge++ : gs++) : (e ? te++ : ts++); }
    return `<span><i class="sw bloom"></i>would eat, nutritious <b class="mono">${ge}</b></span><span><i class="sw poison"></i>would eat, toxic <b class="mono" style="color:${te ? TOXIC : 'inherit'}">${te}</b></span><span><i class="sw miss"></i>skips nutritious <b class="mono">${gs}</b></span><span><i class="sw avoid"></i>skips toxic <b class="mono">${ts}</b></span>`;
  }
  return `<span><i class="sw bloom"></i>nutritious food</span><span><i class="sw hazard"></i>toxic food</span>${flies}`;
}
function renderLog() {
  $('log').innerHTML = events.map(e => `<li><span class="tk">t ${fmt(e.tick)}</span><span>${e.html}</span></li>`).join('')
    + (handoff ? `<li class="handoff"><span class="tk">t ${fmt(handoff.tick)}</span><span>Auto-follow: ${handoff.n} handoff${handoff.n > 1 ? 's' : ''} so far; latest ${handoff.text}.</span></li>` : '');
}

function syncControls() {
  $('play').textContent = running || skipping ? 'Pause' : 'Play';
  $('play').disabled = !w.flies.length;
  for (const b of $('speed').querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.speed === speed));
  for (const b of $('layer').querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.layer === layer));
  for (const b of $('chartMode').querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.mode === chartMode));
  const skipBtn = $('skip');
  skipBtn.textContent = skipping ? `Skipping… ${Math.round((w.tick - skipping.from) / Math.max(1, skipping.to - skipping.from) * 100)}%` : 'Skip to switch →';
  skipBtn.disabled = !w.flies.length;
  if (running || skipping) note(null);
  $('mapLegend').innerHTML = mapLegend();
}

setup();
setInterval(() => { if (layer === 'mind') $('mapLegend').innerHTML = mapLegend(); }, 400);
