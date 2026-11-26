#!/usr/bin/env node
// Generates Figure 2: Per-seed paired differences for G7c (n=96) and Fly-RSI L2 (n=48).
// Reads committed JSON in evidence/microverse/ and stats_summary.json directly.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '../../..');
const EV = name => JSON.parse(readFileSync(resolve(REPO, 'evidence/microverse', name), 'utf8'));
const stats = JSON.parse(readFileSync(resolve(__dirname, 'stats_summary.json'), 'utf8'));

const g7tJson = EV('g7c-final-94001-94096-vs-TASTEONLY.json');
const g7mJson = EV('g7c-final-94001-94096-vs-MOVEONLY.json');
const l2Json = EV('fly-rsi-l2-final-95001-95048.json');

const l2Seeds = Object.keys(l2Json.perSeed).map(Number).sort((a, b) => a - b);

const panels = [
  {
    id: 'A',
    row: 0, col: 0, span: 1.5,
    title: 'A. G7c: SELF − TASTEONLY (94001–94096, n = 96)',
    diffs: [...g7tJson.diffs].sort((a, b) => a - b),
    stat: stats.datasets.g7c.vsTASTEONLY,
    gate: 0.7,
    gateLabel: 'bar ≥ 0.7',
    ymin: -10, ymax: 14, yTicks: [-10, -5, 0, 5, 10],
    sub: `mean +${stats.datasets.g7c.vsTASTEONLY.reported.meanDiff.toFixed(2)} [+${stats.datasets.g7c.vsTASTEONLY.ci95[0].toFixed(2)}, +${stats.datasets.g7c.vsTASTEONLY.ci95[1].toFixed(2)}] · 66/96 wins (3 ties) · exact p = 9.4e-9`,
  },
  {
    id: 'B',
    row: 0, col: 1.5, span: 1.5,
    title: 'B. G7c: SELF − MOVEONLY (94001–94096, n = 96)',
    diffs: [...g7mJson.diffs].sort((a, b) => a - b),
    stat: stats.datasets.g7c.vsMOVEONLY,
    gate: 0.7,
    gateLabel: 'bar ≥ 0.7',
    ymin: -2, ymax: 23, yTicks: [0, 5, 10, 15, 20],
    sub: `mean +${stats.datasets.g7c.vsMOVEONLY.reported.meanDiff.toFixed(2)} [+${stats.datasets.g7c.vsMOVEONLY.ci95[0].toFixed(2)}, +${stats.datasets.g7c.vsMOVEONLY.ci95[1].toFixed(2)}] · 96/96 wins · exact p = 1.3e-29`,
  },
  {
    id: 'C',
    row: 1, col: 0, span: 1,
    title: 'C. L2: META − EVO-R (95001–95048, n = 48)',
    diffs: l2Seeds.map(s => l2Json.perSeed[s].META - l2Json.perSeed[s].EVOR).sort((a, b) => a - b),
    stat: stats.datasets.flyRsiL2['META-EVOR'],
    gate: 1.0,
    gateLabel: 'bar ≥ 1.0',
    ymin: -6, ymax: 12, yTicks: [-5, 0, 5, 10],
    sub: `+${stats.datasets.flyRsiL2['META-EVOR'].mean.toFixed(2)} [+${stats.datasets.flyRsiL2['META-EVOR'].ci95[0].toFixed(2)}, +${stats.datasets.flyRsiL2['META-EVOR'].ci95[1].toFixed(2)}] · 44/48 (+${stats.datasets.flyRsiL2.relPctVsEVOR.toFixed(1)}%)`,
  },
  {
    id: 'D',
    row: 1, col: 1, span: 1,
    title: 'D. L2: META − SHAM (95001–95048, n = 48)',
    diffs: l2Seeds.map(s => l2Json.perSeed[s].META - l2Json.perSeed[s].SHAM).sort((a, b) => a - b),
    stat: stats.datasets.flyRsiL2['META-SHAM'],
    gate: 1.0,
    gateLabel: 'bar ≥ 1.0',
    ymin: -6, ymax: 12, yTicks: [-5, 0, 5, 10],
    sub: `+${stats.datasets.flyRsiL2['META-SHAM'].mean.toFixed(2)} [+${stats.datasets.flyRsiL2['META-SHAM'].ci95[0].toFixed(2)}, +${stats.datasets.flyRsiL2['META-SHAM'].ci95[1].toFixed(2)}] · 39/48 (+${stats.datasets.flyRsiL2.relPctVsSHAM.toFixed(1)}%)`,
  },
  {
    id: 'E',
    row: 1, col: 2, span: 1,
    title: 'E. L2: META − FIXED (95001–95048, n = 48)',
    diffs: l2Seeds.map(s => l2Json.perSeed[s].META - l2Json.perSeed[s].FIXED).sort((a, b) => a - b),
    stat: stats.datasets.flyRsiL2['META-FIXED'],
    gate: 0.0,
    gateLabel: 'bar > 0',
    ymin: -6, ymax: 12, yTicks: [-5, 0, 5, 10],
    sub: `+${stats.datasets.flyRsiL2['META-FIXED'].mean.toFixed(2)} [+${stats.datasets.flyRsiL2['META-FIXED'].ci95[0].toFixed(2)}, +${stats.datasets.flyRsiL2['META-FIXED'].ci95[1].toFixed(2)}] · 43/48 (+${stats.datasets.flyRsiL2.relPctVsFIXED.toFixed(1)}%)`,
  },
];

const W = 1040, H = 640;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Helvetica Neue, Arial, DejaVu Sans, sans-serif">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
  <text x="24" y="30" font-size="17" font-weight="700" fill="#1a202c">Per-Seed Paired Population Differences: G7c (L1) and Fly-RSI L2 Finals</text>
  <text x="24" y="49" font-size="11.5" fill="#4a5568">Seeds sorted by paired difference (mean late flies, ticks 10,100–20,000). Solid dark line: mean; blue band: 95% bootstrap CI (20,000 resamples); dashed orange: prespecified bar.</text>
`;

function drawPanel(p) {
  const marginX = 24, gapX = 20;
  const totalInnerW = W - 2 * marginX;
  const unitW = (totalInnerW - 2 * gapX) / 3;
  const boxX = marginX + p.col * (unitW + gapX);
  const boxW = p.span === 1.5 ? (totalInnerW - gapX) / 2 : unitW;
  const boxY = p.row === 0 ? 68 : 346;
  const boxH = 252;

  const padL = 44, padR = 14, padT = 46, padB = 34;
  const plotX = boxX + padL;
  const plotY = boxY + padT;
  const plotW = boxW - padL - padR;
  const plotH = boxH - padT - padB;

  const yMap = v => plotY + plotH * (1 - (v - p.ymin) / (p.ymax - p.ymin));
  const y0 = yMap(0);
  const n = p.diffs.length;
  const barStep = plotW / n;
  const barW = Math.max(1.8, barStep * 0.72);

  let g = `  <g>
    <rect x="${boxX.toFixed(1)}" y="${boxY}" width="${boxW.toFixed(1)}" height="${boxH}" rx="6" fill="#fafbfc" stroke="#d8dee6" stroke-width="1"/>
    <text x="${(boxX + 12).toFixed(1)}" y="${boxY + 20}" font-size="12" font-weight="700" fill="#1a202c">${esc(p.title)}</text>
    <text x="${(boxX + 12).toFixed(1)}" y="${boxY + 35}" font-size="9.8" fill="#475569">${esc(p.sub)}</text>
`;

  for (const tk of p.yTicks) {
    const yy = yMap(tk);
    g += `    <line x1="${plotX.toFixed(1)}" y1="${yy.toFixed(1)}" x2="${(plotX + plotW).toFixed(1)}" y2="${yy.toFixed(1)}" stroke="${tk === 0 ? '#64748b' : '#e2e8f0'}" stroke-width="${tk === 0 ? 1.2 : 0.8}"/>\n`;
    g += `    <text x="${(plotX - 6).toFixed(1)}" y="${(yy + 3.5).toFixed(1)}" font-size="9.8" fill="#475569" text-anchor="end">${tk}</text>\n`;
  }

  const yCiHi = yMap(p.stat.ci95[1]);
  const yCiLo = yMap(p.stat.ci95[0]);
  g += `    <rect x="${plotX.toFixed(1)}" y="${yCiHi.toFixed(1)}" width="${plotW.toFixed(1)}" height="${Math.max(1.2, yCiLo - yCiHi).toFixed(1)}" fill="#2563eb" fill-opacity="0.16"/>\n`;

  for (let i = 0; i < n; i++) {
    const val = p.diffs[i];
    const x = plotX + i * barStep + (barStep - barW) / 2;
    const yv = yMap(val);
    const top = Math.min(y0, yv);
    const h = Math.abs(yv - y0);
    const col = val > 0 ? '#1f7a63' : val < 0 ? '#c44545' : '#94a3b8';
    if (h < 0.8) {
      g += `    <rect x="${x.toFixed(2)}" y="${(y0 - 0.8).toFixed(2)}" width="${barW.toFixed(2)}" height="1.6" fill="#64748b"/>\n`;
    } else {
      g += `    <rect x="${x.toFixed(2)}" y="${top.toFixed(2)}" width="${barW.toFixed(2)}" height="${h.toFixed(2)}" fill="${col}" fill-opacity="0.82"/>\n`;
    }
  }

  const yg = yMap(p.gate);
  if (p.gate > 0) {
    g += `    <line x1="${plotX.toFixed(1)}" y1="${yg.toFixed(1)}" x2="${(plotX + plotW).toFixed(1)}" y2="${yg.toFixed(1)}" stroke="#d97706" stroke-width="1.4" stroke-dasharray="5,3"/>\n`;
  }
  // Clean pill tag for gate label at top-left above bars so it never collides with bars
  const pillX = plotX + 4;
  const pillY = plotY + 2;
  g += `    <rect x="${pillX.toFixed(1)}" y="${pillY.toFixed(1)}" width="62" height="15" rx="3" fill="#fffbeb" stroke="#d97706" stroke-width="0.9"/>\n`;
  g += `    <text x="${(pillX + 31).toFixed(1)}" y="${(pillY + 10.8).toFixed(1)}" font-size="8.8" font-weight="700" fill="#b45309" text-anchor="middle">${esc(p.gateLabel)}</text>\n`;

  const ym = yMap(p.stat.mean);
  g += `    <line x1="${plotX.toFixed(1)}" y1="${ym.toFixed(1)}" x2="${(plotX + plotW).toFixed(1)}" y2="${ym.toFixed(1)}" stroke="#1e3a8a" stroke-width="1.8"/>\n`;

  g += `    <text x="${(plotX + plotW / 2).toFixed(1)}" y="${(boxY + boxH - 9).toFixed(1)}" font-size="9.8" fill="#475569" text-anchor="middle">Sorted seed rank (1 to ${n})</text>\n`;
  if (p.col === 0) {
    g += `    <text x="${(boxX + 13).toFixed(1)}" y="${(plotY + plotH / 2).toFixed(1)}" font-size="9.8" fill="#475569" text-anchor="middle" transform="rotate(-90 ${(boxX + 13).toFixed(1)} ${(plotY + plotH / 2).toFixed(1)})">Δ late flies</text>\n`;
  }

  g += `  </g>\n`;
  return g;
}

for (const p of panels) svg += drawPanel(p);

svg += `  <g transform="translate(24, 616)">
    <rect x="0" y="-9" width="12" height="10" fill="#1f7a63" fill-opacity="0.82"/>
    <text x="17" y="0" font-size="10.2" fill="#334155">Positive seed (win)</text>
    <rect x="130" y="-9" width="12" height="10" fill="#c44545" fill-opacity="0.82"/>
    <text x="147" y="0" font-size="10.2" fill="#334155">Negative seed (loss)</text>
    <line x1="268" y1="-4" x2="290" y2="-4" stroke="#1e3a8a" stroke-width="2"/>
    <text x="296" y="0" font-size="10.2" fill="#334155">Sample mean</text>
    <rect x="380" y="-9" width="16" height="10" fill="#2563eb" fill-opacity="0.18"/>
    <text x="402" y="0" font-size="10.2" fill="#334155">95% bootstrap CI</text>
    <line x1="504" y1="-4" x2="526" y2="-4" stroke="#d97706" stroke-width="1.5" stroke-dasharray="5,3"/>
    <text x="532" y="0" font-size="10.2" fill="#334155">Prespecified bar</text>
    <text x="646" y="0" font-size="9.6" fill="#64748b">Note: G7c per-seed diffs stored at 0.1 resolution by solo.mjs.</text>
  </g>
</svg>
`;

const outPath = resolve(__dirname, 'fig2_g7c_l2_diffs.svg');
writeFileSync(outPath, svg);
console.log('Wrote:', outPath, `${W}x${H}`);
