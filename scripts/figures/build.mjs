// Builds every figure in docs/img/ from the committed evidence and a fresh simulator run.
// Usage: node scripts/figures/build.mjs [name ...]     (needs Chrome; set CHROME=/path/to/chrome if not found)
// Each figure is an HTML page rendered to a 2x PNG, so fonts and layout look the same everywhere.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { Microverse } from '../../microverse/sim.mjs';
import { STRAINS } from '../../microverse/strains.mjs';
import { CONFIG } from '../../microverse/config.mjs';
import * as D from './diagrams.mjs';
import * as C from './charts.mjs';

const ROOT = resolve(import.meta.dirname, '../..'), OUT = join(ROOT, 'docs/img');
const ev = f => JSON.parse(readFileSync(join(ROOT, 'evidence/microverse', f), 'utf8'));

// ---------- data ----------
function skillTrace(seed = 101, ticks = 12000, every = 50) {
  const names = ['SELF', 'FIXED'];
  const w = new Microverse(seed, Object.fromEntries(names.map(n => [n, STRAINS[n]])), CONFIG);
  const rows = [], switches = [{ tick: 0, family: w.rule.family }];
  let family = w.rule.family;
  for (let t = 0; t <= ticks; t++) {
    if (t % every === 0) { const s = w.snapshot(); rows.push({ tick: t, ...Object.fromEntries(names.map(n => [n, s.strains[n].n ? s.strains[n].skill : null])) }); }
    if (w.rule.family !== family) { family = w.rule.family; switches.push({ tick: w.tick, family }); }
    if (!w.flies.length) break;
    w.step();
  }
  return { seed, rows, switches };
}
function l2Diffs() {
  const j = ev('fly-rsi-l2-final-95001-95048.json'), per = Object.values(j.perSeed);
  const d = arm => per.map(s => +(s.META - s[arm]).toFixed(2));
  return [
    { label: 'vs evolution (EVO-R)', diffs: d('EVOR'), mean: j['META-EVOR'].meanDiff, positive: j['META-EVOR'].positive },
    { label: 'vs matched sham', diffs: d('SHAM'), mean: j['META-SHAM'].meanDiff, positive: j['META-SHAM'].positive },
    { label: 'vs no tuning (fixed)', diffs: d('FIXED'), mean: j['META-FIXED'].meanDiff, positive: j['META-FIXED'].positive },
  ];
}
function g7cDiffs() {
  return [['TASTEONLY', 'vs taste-only revision'], ['MOVEONLY', 'vs movement-only revision']].map(([k, label]) => {
    const j = ev(`g7c-final-94001-94096-vs-${k}.json`);
    return { label, diffs: j.diffs, mean: j.meanDiff, positive: j.positive };
  });
}
// docs/FLY_RSI_LOG.md: L3 practice attempts (5) and L3b practice attempts (5); bar is 1.5.
const L3 = [
  { group: 'L3', label: 'Lean package while costly', ratio: 1.44 },
  { group: 'L3', label: 'Lean taste only', ratio: 1.18 },
  { group: 'L3', label: 'Lean movement only', ratio: 1.18 },
  { group: 'L3', label: '+ fast regrowth phase', ratio: 1.38 },
  { group: 'L3', label: 'Keep strong features', ratio: 1.39 },
  { group: 'L3b', label: 'Cost ×20', ratio: 1.372 },
  { group: 'L3b', label: 'Cost ×50', ratio: 1.026 },
  { group: 'L3b', label: 'Cost ×30', ratio: 1.106 },
  { group: 'L3b', label: '×20, fast shedding', ratio: 1.395 },
  { group: 'L3b', label: '+ fast regrowth', ratio: 1.444 },
];

// ---------- page shell ----------
const FONTS = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=block';
const page = ({ width, title, sub, body, note }) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}"><style>
:root{--cream:#fefae0;--sand:#faedcd;--mist:#e9edc9;--sage:#ccd5ae;--tan:#d4a373;--ink:#2b2a1e;--ink2:#45432f;--muted:#5f5b45;--faint:#8a8566;--rule:rgba(43,42,30,.16);
--self:#a8652f;--ctrl:#3a6ea5;--good:#6b8e23;--toxic:#b5452e}
*{box-sizing:border-box}html,body{margin:0;background:var(--cream)}
#fig{width:${width}px;padding:36px 40px 30px;background:var(--cream);color:var(--ink);font:15px/1.5 Geist,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
h1{margin:0;font:400 30px/1.15 Newsreader,Georgia,serif;letter-spacing:-.015em}
.sub{margin:8px 0 0;color:var(--muted);font-size:15.5px;max-width:64ch}
.body{margin-top:26px}
.note{margin:18px 0 0;padding-top:12px;border-top:1px solid var(--rule);color:var(--faint);font-size:12.5px}
svg text{font-family:Geist,system-ui,sans-serif}
.mono{font-family:'Geist Mono',ui-monospace,monospace}
.hand{font-family:Caveat,cursive}
.serif{font-family:Newsreader,Georgia,serif}
</style></head><body><div id="fig">${title ? `<h1>${title}</h1>` : ''}${sub ? `<p class="sub">${sub}</p>` : ''}<div class="body">${body}</div>${note ? `<p class="note">${note}</p>` : ''}</div></body></html>`;

// ---------- chrome ----------
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
async function render(pages) {
  if (!CHROME) throw Error('Chrome not found; set CHROME=/path/to/chrome');
  const prof = mkdtempSync(join(tmpdir(), 'figs-')), port = 9400 + Math.floor(Math.random() * 400);
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let ws, id = 0; const P = new Map();
  try {
    let t; for (let i = 0; i < 60 && !t; i++) { await sleep(250); try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} }
    ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => (ws.onopen = r));
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id); } };
    const send = (method, params = {}) => new Promise(r => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send('Page.enable');
    for (const [name, html, width] of pages) {
      const file = join(prof, name + '.html'); writeFileSync(file, html);
      await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 2, mobile: false });
      await send('Page.navigate', { url: pathToFileURL(file).href });
      await sleep(400);
      await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      await sleep(250);
      const box = (await send('Runtime.evaluate', { expression: 'JSON.stringify(document.getElementById("fig").getBoundingClientRect())', returnByValue: true })).result.result.value;
      const { width: w, height: h } = JSON.parse(box);
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.ceil(h), scale: 1 } });
      writeFileSync(join(OUT, name + '.png'), Buffer.from(shot.result.data, 'base64'));
      console.log('wrote docs/img/' + name + '.png', `${Math.round(w)}×${Math.ceil(h)}`);
    }
  } finally { ws?.close(); chrome.kill(); await sleep(300); try { rmSync(prof, { recursive: true, force: true }); } catch {} }
}

// ---------- figures ----------
const FIGS = {
  'odor-rule': () => D.odorRule(page),
  'inheritance': () => D.inheritance(page),
  'ladder': () => D.ladder(page),
  'protocol': () => D.protocol(page),
  'skill-over-time': () => C.skillOverTime(page, skillTrace()),
  'g7c-final': () => C.perSeed(page, {
    title: 'Revising taste <i>and</i> movement beats revising either alone',
    sub: 'G7c final: 96 fresh worlds, run once. Each bar is one world: flies sustained by the full self-improver minus the comparison lineage.',
    rows: g7cDiffs(), unit: 'flies',
    note: 'Paired solo runs: each lineage lives alone in the same seeded world; score = mean population over ticks 10,000–20,000. Bar: ≥ +0.7 flies, p < .01. Data: evidence/microverse/g7c-final-94001-94096-vs-*.json',
  }),
  'l2-final': () => C.perSeed(page, {
    title: 'Flies that tune their own reviser outlast every control',
    sub: 'Fly-RSI L2 final: 48 fresh worlds, run once. Each bar is one world: flies sustained by meta-tuning (L2) minus the comparison lineage.',
    rows: l2Diffs(), unit: 'flies',
    note: 'World with an in-life brain-cost switch (×1 ↔ ×12). Bars: ≥ +1.0 flies vs evolution and sham, > 0 vs fixed; p < .01 each. Data: evidence/microverse/fly-rsi-l2-final-95001-95048.json',
  }),
  'l3-attempts': () => C.l3(page, L3),
};

mkdirSync(OUT, { recursive: true });
const want = process.argv.slice(2), names = want.length ? want : Object.keys(FIGS);
const pages = names.map(n => { if (!FIGS[n]) throw Error('unknown figure ' + n); const { html, width } = FIGS[n](); return [n, html, width]; });
await render(pages);
