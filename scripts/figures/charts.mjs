// Data charts. Static PNGs for the docs, so no hover layer: every value a reader needs is labelled.
// Palette validated on the cream surface (dataviz validator): tested lineage #a8652f, control #3a6ea5.
const SELF = '#a8652f', CTRL = '#3a6ea5', INK = '#2b2a1e', MUTED = '#5f5b45', FAINT = '#8a8566', GRID = 'rgba(43,42,30,.10)', ZERO = 'rgba(43,42,30,.45)';
const W = 920;
const fmt = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
const nice = v => Math.ceil(v / 5) * 5;

// Per-seed paired differences, one row per contrast, sorted so the share of winning worlds reads at a glance.
export function perSeed(page, { title, sub, rows, unit, note }) {
  const lw = 230, pw = W - lw, rh = 132, gapRow = 26;
  const max = nice(Math.max(...rows.flatMap(r => r.diffs.map(Math.abs))));
  let s = '';
  rows.forEach((r, k) => {
    const y0 = k * (rh + gapRow), mid = y0 + rh / 2, Y = v => mid - (v / max) * (rh / 2 - 6);
    const d = [...r.diffs].sort((a, b) => a - b), n = d.length, bw = pw / n;
    s += `<text x="0" y="${y0 + 22}" font-size="15" font-weight="600" fill="${INK}">${r.label}</text>
      <text x="0" y="${y0 + 56}" class="serif" font-size="32" fill="${INK}">${fmt(r.mean)}</text>
      <text x="${0 + 14 + fmt(r.mean).length * 15.5}" y="${y0 + 56}" font-size="14" fill="${MUTED}">${unit} on average</text>
      <text x="0" y="${y0 + 82}" font-size="14" fill="${MUTED}"><tspan class="mono" fill="${INK}">${r.positive}/${n}</tspan> worlds better</text>`;
    for (const v of [max, 0, -max]) s += `<line x1="${lw}" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v === 0 ? ZERO : GRID}" stroke-width="1"/>`;
    s += `<text x="${lw - 8}" y="${Y(max) + 4}" text-anchor="end" class="mono" font-size="11" fill="${FAINT}">+${max}</text>
      <text x="${lw - 8}" y="${Y(-max) + 4}" text-anchor="end" class="mono" font-size="11" fill="${FAINT}">−${max}</text>
      <text x="${lw - 8}" y="${Y(0) + 4}" text-anchor="end" class="mono" font-size="11" fill="${FAINT}">0</text>`;
    d.forEach((v, i) => {
      const x = lw + i * bw + 1, h = Math.max(1, Math.abs(Y(v) - Y(0)));
      s += `<rect x="${x.toFixed(2)}" y="${(v >= 0 ? Y(v) : Y(0)).toFixed(2)}" width="${Math.max(1, bw - 2).toFixed(2)}" height="${h.toFixed(2)}" rx="${Math.min(2, (bw - 2) / 2).toFixed(2)}" fill="${v >= 0 ? SELF : CTRL}"/>`;
    });
    const ym = Y(r.mean);
    s += `<line x1="${lw}" x2="${W}" y1="${ym}" y2="${ym}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="4 4"/>
      <rect x="${lw + 6}" y="${ym - 21}" width="${52}" height="16" rx="3" fill="#fefae0"/>
      <text x="${lw + 10}" y="${ym - 9}" class="mono" font-size="11.5" fill="${INK}">mean</text>`;
  });
  const H = rows.length * (rh + gapRow) - gapRow + 34;
  s += `<text x="${lw}" y="${H - 6}" font-size="12.5" fill="${MUTED}">each bar = one fresh world, sorted from worst to best</text>
    <rect x="${W - 330}" y="${H - 18}" width="12" height="12" rx="2" fill="${SELF}"/><text x="${W - 312}" y="${H - 7}" font-size="12.5" fill="${INK}">self-improver ahead</text>
    <rect x="${W - 170}" y="${H - 18}" width="12" height="12" rx="2" fill="${CTRL}"/><text x="${W - 152}" y="${H - 7}" font-size="12.5" fill="${INK}">comparison ahead</text>`;
  return { width: 1000, html: page({ width: 1000, title, sub, note, body: `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>` }) };
}

// Taste skill over time in one practice world, with the rule switches that knock it down.
export function skillOverTime(page, { seed, rows, switches }) {
  const H = 380, pl = 44, pr = 140, pt = 34, pb = 40, iw = W - pl - pr, ih = H - pt - pb;
  const tMax = rows.at(-1).tick, smooth = (key, k = 5) => rows.map((r, i) => {
    const win = rows.slice(Math.max(0, i - k + 1), i + 1).map(x => x[key]).filter(v => v !== null);
    return r[key] === null ? null : win.reduce((a, b) => a + b, 0) / win.length;
  });
  const lines = { SELF: smooth('SELF'), FIXED: smooth('FIXED') };
  const lo = Math.min(-0.1, ...Object.values(lines).flat().filter(v => v !== null)), hi = 1;
  const X = t => pl + (t / tMax) * iw, Y = v => pt + (1 - (v - lo) / (hi - lo)) * ih;
  let s = '';
  for (const v of [0, 0.5, 1]) s += `<line x1="${pl}" x2="${pl + iw}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v === 0 ? ZERO : GRID}"/><text x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end" class="mono" font-size="11" fill="${FAINT}">${v.toFixed(1)}</text>`;
  for (const t of [0, 3000, 6000, 9000, 12000].filter(t => t <= tMax)) s += `<text x="${X(t)}" y="${H - 14}" text-anchor="middle" class="mono" font-size="11" fill="${FAINT}">${t.toLocaleString('en-US')}</text>`;
  s += `<text x="${pl + iw}" y="${H - 0}" text-anchor="end" font-size="12" fill="${MUTED}">ticks</text>`;
  switches.forEach((sw, i) => {
    const x = X(sw.tick), next = switches[i + 1]?.tick ?? tMax;
    if (i) s += `<line x1="${x}" x2="${x}" y1="${pt - 6}" y2="${pt + ih}" stroke="${ZERO}" stroke-dasharray="3 4"/>`;
    s += `<text x="${(x + X(next)) / 2}" y="${pt - 12}" text-anchor="middle" font-size="12.5" fill="${MUTED}">${sw.family} rule</text>`;
  });
  const path = arr => { let d = '', pen = false; arr.forEach((v, i) => { if (v === null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${X(rows[i].tick).toFixed(1)} ${Y(v).toFixed(1)}`; pen = true; }); return d; };
  s += `<path d="${path(lines.FIXED)}" fill="none" stroke="${CTRL}" stroke-width="2.2" stroke-linejoin="round"/>`;
  s += `<path d="${path(lines.SELF)}" fill="none" stroke="${SELF}" stroke-width="2.2" stroke-linejoin="round"/>`;
  const lastIdx = key => lines[key].findLastIndex(v => v !== null);
  const iS = lastIdx('SELF'), iF = lastIdx('FIXED');
  s += `<circle cx="${X(rows[iS].tick)}" cy="${Y(lines.SELF[iS])}" r="4" fill="${SELF}" stroke="#fefae0" stroke-width="2"/>
    <text x="${X(rows[iS].tick) + 10}" y="${Y(lines.SELF[iS]) + 4}" font-size="13.5" font-weight="600" fill="${INK}">Self-improving</text>`;
  if (iF < rows.length - 1) {
    const x = X(rows[iF].tick), y = Y(lines.FIXED[iF]);
    s += `<g stroke="${CTRL}" stroke-width="2.2" stroke-linecap="round"><path d="M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10"/></g>
      <text x="${x + 10}" y="${y - 10}" font-size="13.5" font-weight="600" fill="${INK}">Fixed program</text>
      <text x="${x + 10}" y="${y + 8}" font-size="12.5" fill="${MUTED}">died out at tick ${rows[iF].tick.toLocaleString('en-US')}</text>`;
  } else s += `<text x="${X(rows[iF].tick) + 10}" y="${Y(lines.FIXED[iF]) + 4}" font-size="13.5" font-weight="600" fill="${INK}">Fixed program</text>`;
  // annotate the first drop and recovery
  const sw1 = switches[1];
  if (sw1) s += `<text x="${X(sw1.tick) + 12}" y="${Y(0.12)}" class="hand" font-size="21" fill="${SELF}">rule changes, skill collapses,</text><text x="${X(sw1.tick) + 12}" y="${Y(0.12) + 22}" class="hand" font-size="21" fill="${SELF}">then the lineage re-learns it</text>`;
  return { width: 1000, html: page({ width: 1000, title: 'Every time the rule changes, the self-improvers learn it again',
    sub: 'Taste skill (chance of eating good food minus chance of eating poison) in one world, self-improving lineage against a fixed program.',
    note: `One practice world (seed ${seed}), both lineages sharing it; 250-tick rolling mean. Generated by scripts/figures/build.mjs from microverse/sim.mjs. For the registered fresh-seed results see the finals below.`,
    body: `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>` }) };
}

// L3: every practice attempt's compounding ratio against the pre-registered 1.5x bar.
export function l3(page, attempts) {
  const lw = 250, pr = 70, rowH = 30, gh = 34, x0 = 1.0, x1 = 1.6;
  const groups = [...new Set(attempts.map(a => a.group))];
  const H = attempts.length * rowH + groups.length * gh + 46, X = v => lw + ((v - x0) / (x1 - x0)) * (W - lw - pr);
  const best = Math.max(...attempts.map(a => a.ratio));
  let s = '', y = 0;
  for (const v of [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]) s += `<line x1="${X(v)}" x2="${X(v)}" y1="0" y2="${H - 34}" stroke="${GRID}"/><text x="${X(v)}" y="${H - 14}" text-anchor="middle" class="mono" font-size="11" fill="${FAINT}">${v.toFixed(1)}×</text>`;
  for (const g of groups) {
    y += gh;
    s += `<text x="0" y="${y - 10}" font-size="13" font-weight="600" fill="${MUTED}">${g === 'L3' ? 'L3 practice' : 'L3b practice, costlier world'}</text>`;
    for (const a of attempts.filter(a => a.group === g)) {
      const top = y + 5, h = rowH - 10, isBest = a.ratio === best;
      s += `<text x="0" y="${top + h - 5}" font-size="13.5" fill="${INK}">${a.label}</text>
        <rect x="${X(x0)}" y="${top}" width="${X(a.ratio) - X(x0)}" height="${h}" rx="3" fill="${isBest ? SELF : '#d4a373'}"/>
        <text x="${X(a.ratio) + 8}" y="${top + h - 5}" class="mono" font-size="12.5" fill="${INK}">${a.ratio.toFixed(a.ratio * 100 % 1 ? 3 : 2)}×</text>`;
      y += rowH;
    }
  }
  s += `<line x1="${X(1.5)}" x2="${X(1.5)}" y1="4" y2="${H - 34}" stroke="${INK}" stroke-width="1.6" stroke-dasharray="6 4"/>
    <rect x="${X(1.5) + 6}" y="6" width="150" height="22" rx="4" fill="#fefae0"/>
    <text x="${X(1.5) + 10}" y="22" font-size="13" font-weight="600" fill="${INK}">bar: 1.5× (registered)</text>`;
  return { width: 1000, html: page({ width: 1000, title: 'Compounding (L3) never reached its bar',
    sub: 'L3 asks whether level-1 self-revision pays off at least 1.5× more when level 2 is also running. Ten practice designs; the best reached 1.44×, so no final was run.',
    note: 'Ratio = L1 gain with L2 ÷ L1 gain without it, on practice seeds. A later parking design (L3c) reached 1.78× on practice, but the margin came from damage to the comparison lineage, so the next registration removed that channel; L3-I reached 1.46×, and L3-II to L3-IV stopped at their screens. Full record: docs/FLY_RSI_LOG.md.',
    body: `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>` }) };
}
