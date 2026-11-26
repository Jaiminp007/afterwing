#!/usr/bin/env node
// Generates Figure 3: L3 compounding screens — observed headroom / effect vs prespecified bars,
// plus L3-IV-H0 oracle decomposition (including Gemini 4 Neon's post-hoc diagnosis).
// Reads committed JSON via docs/paper/figures/stats_summary.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stats = JSON.parse(readFileSync(resolve(__dirname, 'stats_summary.json'), 'utf8'));

const s1 = stats.datasets.l3iScreen1;
const l3ii = stats.datasets.l3iiStageA;
const l3iii = stats.datasets.l3iii.stageB;
const h0_60 = stats.datasets.l3ivH0.batches['0.6'];
const h0_85 = stats.datasets.l3ivH0.batches['0.85'];

const W = 1060, H = 696;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Helvetica Neue, Arial, DejaVu Sans, sans-serif">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
  <text x="24" y="30" font-size="17" font-weight="700" fill="#1a202c">Why Compounding (L3 ≥ 1.5×) Failed: Eight Prespecified Screens &amp; Oracle Diagnosis</text>
  <text x="24" y="49" font-size="11.5" fill="#4a5568">Every L3 variant stopped on practice/headroom screens; zero L3 finals were run. Error bars: 95% bootstrap CIs over seeds from committed JSON.</text>
`;

// ================= PANEL A (Top-Left): L1 Payoff Ratio vs 1.5x Bar =================
{
  const bx = 24, by = 68, bw = 498, bh = 362;
  const px = bx + 146, py = by + 50, pw = 212, ph = bh - 90;
  const labelColX = px + pw + 10;
  const rows = [
    { label: 'L3 (×1/×12, att 1)', val: 1.44, note: '1.44× (log, 5 att)', color: '#64748b' },
    { label: 'L3b (×20, att 5)', val: 1.444, note: '1.44× (log, 5 att)', color: '#64748b' },
    { label: 'L3c (park, att 3)*', val: 1.778, note: '1.78×* (confound)', color: '#d97706', hollow: true },
    { label: 'L3-I scr1 (park+law)', val: s1.observedL1Ratio, note: `${s1.observedL1Ratio.toFixed(2)}× (f = −0.45)`, color: '#b83b3b' },
    { label: 'L3-III stB (ev-route)', val: l3iii.ratioWithOverWithout, note: `${l3iii.ratioWithOverWithout.toFixed(2)}× (d = −5.81)`, color: '#b83b3b' },
    { label: 'L3-IV-H0 .60 ORACLE', val: h0_60.oracleL1Ratio, note: `${h0_60.oracleL1Ratio.toFixed(2)}× (dO = +0.49)`, color: '#7c3aed' },
    { label: 'L3-IV-H0 .85 ORACLE', val: h0_85.oracleL1Ratio, note: `${h0_85.oracleL1Ratio.toFixed(2)}× (dO = −1.91)`, color: '#7c3aed' },
  ];
  const xmin = 0.9, xmax = 1.95;
  const xMap = v => px + ((v - xmin) / (xmax - xmin)) * pw;
  const rowH = ph / rows.length;

  svg += `  <g>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="#fafbfc" stroke="#d8dee6" stroke-width="1"/>
    <text x="${bx + 12}" y="${by + 22}" font-size="12.4" font-weight="700" fill="#1a202c">A. Observed L1 Payoff Ratio vs 1.5× Threshold</text>
    <text x="${bx + 12}" y="${by + 37}" font-size="9.8" fill="#475569">Ratio = (L1 gain with controller or oracle) / (L1 gain without). *L3c had inheritance-loss confound.</text>
`;
  for (const tk of [1.0, 1.25, 1.5, 1.75]) {
    const xx = xMap(tk);
    const isBar = tk === 1.5;
    svg += `    <line x1="${xx.toFixed(1)}" y1="${py}" x2="${xx.toFixed(1)}" y2="${py + ph}" stroke="${isBar ? '#b45309' : '#e2e8f0'}" stroke-width="${isBar ? 1.8 : 0.8}"${isBar ? ' stroke-dasharray="5,3"' : ''}/>\n`;
    svg += `    <text x="${xx.toFixed(1)}" y="${py + ph + 14}" font-size="9.6" fill="${isBar ? '#b45309' : '#475569'}" font-weight="${isBar ? '700' : '400'}" text-anchor="middle">${tk.toFixed(2)}×</text>\n`;
  }
  svg += `    <text x="${(xMap(1.5) + 4).toFixed(1)}" y="${py - 3}" font-size="9.2" font-weight="700" fill="#b45309">1.5× bar</text>\n`;

  rows.forEach((r, i) => {
    const cy = py + i * rowH + rowH / 2;
    const x1 = xMap(1.0);
    const x2 = xMap(r.val);
    const bhBar = 16;
    svg += `    <text x="${px - 8}" y="${(cy + 3.5).toFixed(1)}" font-size="10" fill="#1e293b" text-anchor="end">${esc(r.label)}</text>\n`;
    if (r.hollow) {
      svg += `    <rect x="${Math.min(x1, x2).toFixed(1)}" y="${(cy - bhBar / 2).toFixed(1)}" width="${Math.abs(x2 - x1).toFixed(1)}" height="${bhBar}" fill="#fef3c7" stroke="${r.color}" stroke-width="1.6" stroke-dasharray="4,2"/>\n`;
    } else {
      svg += `    <rect x="${Math.min(x1, x2).toFixed(1)}" y="${(cy - bhBar / 2).toFixed(1)}" width="${Math.abs(x2 - x1).toFixed(1)}" height="${bhBar}" fill="${r.color}" fill-opacity="0.82"/>\n`;
    }
    svg += `    <text x="${labelColX.toFixed(1)}" y="${(cy + 3.5).toFixed(1)}" font-size="9.6" fill="#334155">${esc(r.note)}</text>\n`;
  });

  svg += `    <text x="${bx + 12}" y="${by + bh - 8}" font-size="9.2" fill="#64748b">Omitted from ratio axis: L3-I scr2 RewriteCost (0/16 qualified at Stage A; 2 wins / 230 checks) &amp; L3-II (no NOREV).</text>\n`;
  svg += `  </g>\n`;
}

// ================= PANEL B (Top-Right): Observed Margin vs Frozen Bar (with 95% CIs) =================
{
  const bx = 538, by = 68, bw = 498, bh = 362;
  const px = bx + 168, py = by + 50, pw = 212, ph = bh - 90;
  const labelColX = px + pw + 8;
  const items = [
    { label: 'L3-I scr1: factorial f (n=48)', stat: s1.factorial, bar: 0.0, note: '−0.45 (19/48; bar >0)' },
    { label: 'L3-II stA: ORACLE−BLIND', stat: l3ii['ORACLE-BLIND_pop'], bar: 2.0, note: '+1.37 (10/16; bar ≥2)' },
    { label: 'L3-III stB: d = m−0.5g', stat: l3iii.d, bar: 0.0, note: '−5.81 (1/16; bar >0)' },
    { label: 'L3-IV-H0 .60: dO', stat: h0_60.dO, bar: 4.0, note: '+0.49 (8/16; bar ≥4)' },
    { label: 'L3-IV-H0 .60: ORAC−BLIND', stat: h0_60['ORACLE-BLIND'], bar: 4.0, note: '+2.54 (13/16; bar ≥4)' },
    { label: 'L3-IV-H0 .85: dO', stat: h0_85.dO, bar: 4.0, note: '−1.91 (4/16; bar ≥4)' },
    { label: 'L3-IV-H0 .85: ORAC−BLIND', stat: h0_85['ORACLE-BLIND'], bar: 4.0, note: '+2.62 (13/16; bar ≥4)' },
  ];
  const xmin = -8.5, xmax = 5.5;
  const xMap = v => px + ((v - xmin) / (xmax - xmin)) * pw;
  const rowH = ph / items.length;

  svg += `  <g>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="#fafbfc" stroke="#d8dee6" stroke-width="1"/>
    <text x="${bx + 12}" y="${by + 22}" font-size="12.4" font-weight="700" fill="#1a202c">B. Committed-JSON Screen Contrasts vs Frozen Bars (flies)</text>
    <text x="${bx + 12}" y="${by + 37}" font-size="9.8" fill="#475569">Red dots &amp; lines: observed mean &amp; 95% bootstrap CI. Orange vertical ticks: prespecified advance bar.</text>
`;
  for (const tk of [-8, -4, 0, 4]) {
    const xx = xMap(tk);
    svg += `    <line x1="${xx.toFixed(1)}" y1="${py}" x2="${xx.toFixed(1)}" y2="${py + ph}" stroke="${tk === 0 ? '#64748b' : '#e2e8f0'}" stroke-width="${tk === 0 ? 1.2 : 0.8}"/>\n`;
    svg += `    <text x="${xx.toFixed(1)}" y="${py + ph + 14}" font-size="9.6" fill="#475569" text-anchor="middle">${tk}</text>\n`;
  }

  items.forEach((it, i) => {
    const cy = py + i * rowH + rowH / 2;
    const xm = xMap(it.stat.mean);
    const xLo = xMap(it.stat.ci95[0]);
    const xHi = xMap(it.stat.ci95[1]);
    const xb = xMap(it.bar);

    svg += `    <text x="${px - 8}" y="${(cy + 3.5).toFixed(1)}" font-size="9.8" fill="#1e293b" text-anchor="end">${esc(it.label)}</text>\n`;
    svg += `    <line x1="${xb.toFixed(1)}" y1="${(cy - 10).toFixed(1)}" x2="${xb.toFixed(1)}" y2="${(cy + 10).toFixed(1)}" stroke="#d97706" stroke-width="2.4"/>\n`;
    svg += `    <polygon points="${xb.toFixed(1)},${(cy - 10).toFixed(1)} ${(xb + 5).toFixed(1)},${(cy - 10).toFixed(1)} ${xb.toFixed(1)},${(cy - 5).toFixed(1)}" fill="#d97706"/>\n`;
    svg += `    <line x1="${xLo.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${xHi.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#b83b3b" stroke-width="2"/>\n`;
    svg += `    <line x1="${xLo.toFixed(1)}" y1="${(cy - 4).toFixed(1)}" x2="${xLo.toFixed(1)}" y2="${(cy + 4).toFixed(1)}" stroke="#b83b3b" stroke-width="1.5"/>\n`;
    svg += `    <line x1="${xHi.toFixed(1)}" y1="${(cy - 4).toFixed(1)}" x2="${xHi.toFixed(1)}" y2="${(cy + 4).toFixed(1)}" stroke="#b83b3b" stroke-width="1.5"/>\n`;
    svg += `    <circle cx="${xm.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.8" fill="#b83b3b"/>\n`;
    svg += `    <text x="${labelColX.toFixed(1)}" y="${(cy + 3.5).toFixed(1)}" font-size="9.2" fill="#334155">${esc(it.note)}</text>\n`;
  });

  svg += `    <text x="${(px + pw / 2).toFixed(1)}" y="${by + bh - 8}" font-size="9.4" fill="#475569" text-anchor="middle">Contrast value (late flies); every screen missed its orange bar</text>\n`;
  svg += `  </g>\n`;
}

// ================= PANEL C (Bottom Full Width): L3-IV-H0 Decomposition & Post-Hoc Diagnosis =================
{
  const bx = 24, by = 448, bw = 1012, bh = 224;
  svg += `  <g>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="#fafbfc" stroke="#d8dee6" stroke-width="1"/>
    <text x="${bx + 12}" y="${by + 22}" font-size="12.4" font-weight="700" fill="#1a202c">C. L3-IV-H0 (Toxin .60) Population Ladder &amp; Post-Hoc Diagnosis of the TRUE_ORACLE Gap</text>
    <text x="${bx + 12}" y="${by + 37}" font-size="9.8" fill="#475569">Left: registered 16-seed screen (101–116) from fly-rsi-l3iv-h0.json. Right: exploratory 4-seed diagnosis (501–504, commit 16b4372, not registered) isolating the 16 founder singletons.</text>
`;

  const ymin = 30, ymax = 70;
  const c1x = bx + 42, c1y = by + 58, c1w = 456, c1h = 120;
  const yMap = v => c1y + c1h * (1 - (v - ymin) / (ymax - ymin));

  const c1Bars = [
    { name: 'NOREV', val: h0_60.means.Q_NOREV, sub: '0 admits', col: '#94a3b8' },
    { name: 'S10 (F)', val: h0_60.means.S10, sub: '102 corr', col: '#475569' },
    { name: 'BLIND', val: h0_60.means.Q_BLIND, sub: '212 corr', col: '#2563eb' },
    { name: 'ORACLE', val: h0_60.means.Q_ORACLE, sub: '637 corr', col: '#7c3aed' },
    { name: 'TRUE_ORAC', val: h0_60.means.Q_TRUEORACLE, sub: '5 masks', col: '#0f766e' },
  ];
  for (const tk of [30, 40, 50, 60, 70]) {
    const yy = yMap(tk);
    svg += `    <line x1="${c1x}" y1="${yy.toFixed(1)}" x2="${c1x + c1w}" y2="${yy.toFixed(1)}" stroke="#e2e8f0" stroke-width="0.8"/>\n`;
    svg += `    <text x="${c1x - 6}" y="${(yy + 3.5).toFixed(1)}" font-size="9.4" fill="#475569" text-anchor="end">${tk}</text>\n`;
  }
  const neededOracle = h0_60.means.S10 + 0.5 * h0_60.g.mean + 4.0;
  const yNeed = yMap(neededOracle);
  svg += `    <line x1="${c1x}" y1="${yNeed.toFixed(1)}" x2="${c1x + c1w}" y2="${yNeed.toFixed(1)}" stroke="#d97706" stroke-width="1.4" stroke-dasharray="5,3"/>\n`;
  svg += `    <text x="${c1x + 4}" y="${(yNeed - 4).toFixed(1)}" font-size="9" font-weight="700" fill="#b45309">ORACLE needed for dO ≥ 4 (${neededOracle.toFixed(1)})</text>\n`;

  const step1 = c1w / c1Bars.length;
  c1Bars.forEach((b, i) => {
    const x = c1x + i * step1 + 15;
    const w = step1 - 30;
    const yt = yMap(b.val);
    const yb = yMap(ymin);
    svg += `    <rect x="${x.toFixed(1)}" y="${yt.toFixed(1)}" width="${w.toFixed(1)}" height="${(yb - yt).toFixed(1)}" fill="${b.col}" fill-opacity="0.85" rx="3"/>\n`;
    svg += `    <text x="${(x + w / 2).toFixed(1)}" y="${(yt - 4).toFixed(1)}" font-size="9.6" font-weight="700" fill="#1e293b" text-anchor="middle">${b.val.toFixed(2)}</text>\n`;
    svg += `    <text x="${(x + w / 2).toFixed(1)}" y="${(yb + 14).toFixed(1)}" font-size="9.4" font-weight="700" fill="#1e293b" text-anchor="middle">${b.name}</text>\n`;
    svg += `    <text x="${(x + w / 2).toFixed(1)}" y="${(yb + 26).toFixed(1)}" font-size="8.6" fill="#64748b" text-anchor="middle">${b.sub}</text>\n`;
  });

  // Divider between C1 and C2
  svg += `    <line x1="${bx + 518}" y1="${by + 48}" x2="${bx + 518}" y2="${by + bh - 12}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,3"/>\n`;

  // Sub-panel C2 (Right): 4-seed exploratory decomposition + dedicated annotation box
  const c2x = bx + 558, c2w = 304;
  const c2Bars = [
    { name: 'S10', val: 46.77, sub: 'static', col: '#475569' },
    { name: 'ORACLE', val: 49.88, sub: '23 masks', col: '#7c3aed' },
    { name: 'TRUE_21', val: 53.29, sub: '1+16+4', col: '#0284c7' },
    { name: 'TRUE_5', val: 62.71, sub: '1+0+4', col: '#0f766e' },
  ];
  for (const tk of [30, 40, 50, 60, 70]) {
    const yy = yMap(tk);
    svg += `    <line x1="${c2x}" y1="${yy.toFixed(1)}" x2="${c2x + c2w}" y2="${yy.toFixed(1)}" stroke="#e2e8f0" stroke-width="0.8"/>\n`;
    svg += `    <text x="${c2x - 6}" y="${(yy + 3.5).toFixed(1)}" font-size="9.4" fill="#475569" text-anchor="end">${tk}</text>\n`;
  }
  const step2 = c2w / c2Bars.length;
  c2Bars.forEach((b, i) => {
    const x = c2x + i * step2 + 12;
    const w = step2 - 24;
    const yt = yMap(b.val);
    const yb = yMap(ymin);
    svg += `    <rect x="${x.toFixed(1)}" y="${yt.toFixed(1)}" width="${w.toFixed(1)}" height="${(yb - yt).toFixed(1)}" fill="${b.col}" fill-opacity="0.85" rx="3"/>\n`;
    svg += `    <text x="${(x + w / 2).toFixed(1)}" y="${(yt - 4).toFixed(1)}" font-size="9.6" font-weight="700" fill="#1e293b" text-anchor="middle">${b.val.toFixed(2)}</text>\n`;
    svg += `    <text x="${(x + w / 2).toFixed(1)}" y="${(yb + 14).toFixed(1)}" font-size="9.4" font-weight="700" fill="#1e293b" text-anchor="middle">${b.name}</text>\n`;
    svg += `    <text x="${(x + w / 2).toFixed(1)}" y="${(yb + 26).toFixed(1)}" font-size="8.6" fill="#64748b" text-anchor="middle">${b.sub}</text>\n`;
  });

  // Clean right-side diagnostic callout card (no overlap with bars!)
  const cardX = c2x + c2w + 14, cardY = c1y + 2, cardW = bx + bw - cardX - 12, cardH = 118;
  svg += `    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="5" fill="#fffbeb" stroke="#d97706" stroke-width="1"/>
    <text x="${cardX + 8}" y="${cardY + 17}" font-size="9.8" font-weight="700" fill="#92400e">Singleton Tax</text>
    <text x="${cardX + 8}" y="${cardY + 34}" font-size="9.2" fill="#78350f">TRUE_5 − TRUE_21:</text>
    <text x="${cardX + 8}" y="${cardY + 48}" font-size="10.2" font-weight="700" fill="#92400e">+9.42 flies</text>
    <text x="${cardX + 8}" y="${cardY + 64}" font-size="8.8" fill="#78350f">• ~4.2 energy cost</text>
    <text x="${cardX + 8}" y="${cardY + 78}" font-size="8.8" fill="#78350f">• ~5.3 L0 overfit</text>
    <text x="${cardX + 8}" y="${cardY + 95}" font-size="8.6" fill="#78350f">Even TRUE_21 gives</text>
    <text x="${cardX + 8}" y="${cardY + 108}" font-size="8.6" fill="#78350f">dO ≈ +3.9 (&lt; bar 4).</text>
`;

  svg += `  </g>\n`;
}

svg += `</svg>\n`;

const outPath = resolve(__dirname, 'fig3_l3_headroom.svg');
writeFileSync(outPath, svg);
console.log('Wrote:', outPath, `${W}x${H}`);
