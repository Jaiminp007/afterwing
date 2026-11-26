#!/usr/bin/env node
// Generates Figure 1: Bounded self-improvement ladder overview diagram (SVG).
// Reads docs/paper/figures/stats_summary.json so headline numbers stay synced to committed JSON.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stats = JSON.parse(readFileSync(resolve(__dirname, 'stats_summary.json'), 'utf8'));

const g7t = stats.datasets.g7c.vsTASTEONLY;
const g7m = stats.datasets.g7c.vsMOVEONLY;
const l2e = stats.datasets.flyRsiL2['META-EVOR'];
const l2s = stats.datasets.flyRsiL2['META-SHAM'];
const l2f = stats.datasets.flyRsiL2['META-FIXED'];
const l2relE = stats.datasets.flyRsiL2.relPctVsEVOR;
const l2relS = stats.datasets.flyRsiL2.relPctVsSHAM;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrapLines(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if (cur.length + 1 + w.length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

const rungs = [
  {
    badge: 'L0',
    title: 'Lifetime Learning',
    status: 'SHOWN (G1–G4)',
    statusType: 'pass',
    mechanism: 'Logistic taste learner (Walsh masks, 32-slot replay, confidence gate) and eligibility-trace movement Q-learner. Learned weights reset at birth.',
    evidence: 'G1–G4 closed across two fresh-seed finals (50001–50008 and 60001–60008; G4 FIXED vs FROZEN 8/8 in both finals).',
    caveat: 'Default 40×40 Microverse; G3 movement benefit is mostly innate instinct; G1–G6 finals reproduce bit for bit at their commits.',
  },
  {
    badge: 'L1',
    title: 'In-World Program Self-Revision',
    status: 'SHOWN (G5, G6, G7c)',
    statusType: 'pass',
    mechanism: 'Flies add/prune Walsh taste masks and optional movement senses from residual evidence; masks and evidence are inherited.',
    evidence: `G5 (vs FIXED & SHAM, 8/8) and G6 (rediscovery, gain 0.394 / 0.362) closed. G7c (94001–94096, n=96): +${g7t.reported.meanDiff.toFixed(2)} vs TASTEONLY (${g7t.wins}/96, 95% CI [${g7t.ci95[0].toFixed(2)}, ${g7t.ci95[1].toFixed(2)}]), +${g7m.reported.meanDiff.toFixed(2)} vs MOVEONLY (${g7m.wins}/96).`,
    caveat: 'G7 failed twice (3/8, 5/8) and G7b missed (p = .0119); G7c is a new test with redesigned moveAddInit = 2.',
  },
  {
    badge: 'L2',
    title: 'In-Life Reviser Tuning (Fly-RSI L2)',
    status: 'SHOWN (95001–95048)',
    statusType: 'pass',
    mechanism: 'Hand-written rule switches taste and movement reviser genes (cap, prune, z) between two preset packages from a perfect brain-cost price reading.',
    evidence: `Fresh seeds 95001–95048 (n=48): +${l2e.mean.toFixed(2)} vs EVO-R (${l2e.wins}/48, +${l2relE.toFixed(1)}%), +${l2s.mean.toFixed(2)} vs SHAM (${l2s.wins}/48, +${l2relS.toFixed(1)}%), +${l2f.mean.toFixed(2)} vs FIXED (${l2f.wins}/48); exact p ≤ 1.5e-7; replicated on new seeds.`,
    caveat: 'Constructed brainSwitch world (×1/×12, switch .001); perfect price cue (reads simulator state); packages taken from headroom oracle.',
  },
  {
    badge: 'L3',
    title: 'Bounded Compounding (≥ 1.5× L1 Payoff)',
    status: 'NOT SHOWN (0 FINALS)',
    statusType: 'fail',
    mechanism: 'Requires L2 control to make L1 self-revision pay ≥ 1.5× more (plus factorial mean and sign gates in L3-I through L3-III).',
    evidence: 'All 8 designs/screens missed prespecified bars: L3 (1.44×), L3b (1.444×), L3c (stopped, confound), L3-I scr1 (f = −0.45, 19/48), L3-I scr2 (0/16), L3-II (+1.37 vs BLIND), L3-III (d = −5.81, 1/16), L3-IV-H0 (dO = +0.49 / −1.91 vs bar 4).',
    caveat: 'Zero L3 finals run; reserved banks (97001–, 763001–, 852001–, 874001–) untouched. Post-hoc diagnosis: concave ecology & founder-singleton overhead.',
  },
];

// Precompute wrapped lines and vertical layout cleanly
const mainX = 28, mainW = 690, maxChars = 98;
let curY = 76;
const gapY = 18;
for (const r of rungs) {
  r.mechLines = wrapLines('Mechanism: ' + r.mechanism, maxChars);
  r.evidLines = wrapLines('Evidence: ' + r.evidence, maxChars);
  r.cavLines = wrapLines('Caveat: ' + r.caveat, maxChars + 5);
  const bodyLines = r.mechLines.length + r.evidLines.length + r.cavLines.length;
  r.y = curY;
  r.h = 46 + bodyLines * 14.5 + 14;
  curY += r.h + gapY;
}

const W = 990;
const H = curY + 26;

const colors = {
  passBg: '#f0f7f4',
  passBorder: '#2a7b5f',
  passBadge: '#1f624b',
  failBg: '#fdf2f2',
  failBorder: '#b83b3b',
  failBadge: '#9b2c2c',
  sideBg: '#f4f6fa',
  sideBorder: '#4c6788',
  sideBadge: '#3b5370',
  text: '#1a202c',
  muted: '#4a5568',
  lightMuted: '#64748b',
  arrow: '#475569',
};

let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Helvetica Neue, Arial, DejaVu Sans, sans-serif">
  <defs>
    <marker id="arrowDown" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M1,1 L5,9 L9,1 z" fill="${colors.arrow}"/>
    </marker>
    <marker id="arrowRight" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M1,1 L9,5 L1,9 z" fill="${colors.sideBorder}"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
  <text x="28" y="32" font-size="18" font-weight="700" fill="${colors.text}">Microverse Prespecified Self-Improvement Ladder (L0 to L3)</text>
  <text x="28" y="52" font-size="12" fill="${colors.muted}">Single closed 40×40 torus breeding world; plans frozen in git before runs; finals run once on fresh seeds.</text>
`;

const connectorX = mainX + 32;

function renderStyledLines(lines, x, startY, fontSize, fill, prefixBold) {
  let out = '';
  lines.forEach((line, idx) => {
    const y = startY + idx * 14.5;
    if (idx === 0 && prefixBold && line.startsWith(prefixBold)) {
      const rest = line.slice(prefixBold.length);
      out += `    <text x="${x}" y="${y.toFixed(1)}" font-size="${fontSize}" fill="${fill}"><tspan font-weight="700">${esc(prefixBold)}</tspan>${esc(rest)}</text>\n`;
    } else {
      out += `    <text x="${x}" y="${y.toFixed(1)}" font-size="${fontSize}" fill="${fill}">${esc(line)}</text>\n`;
    }
  });
  return out;
}

for (let i = 0; i < rungs.length; i++) {
  const r = rungs[i];
  const isPass = r.statusType === 'pass';
  const bg = isPass ? colors.passBg : colors.failBg;
  const border = isPass ? colors.passBorder : colors.failBorder;
  const badgeCol = isPass ? colors.passBadge : colors.failBadge;
  const dash = isPass ? '' : ' stroke-dasharray="6,4"';

  if (i > 0) {
    const prev = rungs[i - 1];
    svg += `  <line x1="${connectorX}" y1="${prev.y + prev.h + 1}" x2="${connectorX}" y2="${r.y - 3}" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowDown)"/>\n`;
  }

  let ty = r.y + 52;
  svg += `  <g>
    <rect x="${mainX}" y="${r.y}" width="${mainW}" height="${r.h}" rx="7" fill="${bg}" stroke="${border}" stroke-width="1.8"${dash}/>
    <rect x="${mainX + 12}" y="${r.y + 11}" width="40" height="24" rx="4" fill="${badgeCol}"/>
    <text x="${mainX + 32}" y="${r.y + 28}" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">${r.badge}</text>
    <text x="${mainX + 64}" y="${r.y + 28}" font-size="14.2" font-weight="700" fill="${colors.text}">${esc(r.title)}</text>
    <rect x="${mainX + mainW - 182}" y="${r.y + 11}" width="170" height="22" rx="11" fill="${badgeCol}"/>
    <text x="${mainX + mainW - 97}" y="${r.y + 26}" font-size="10.6" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(r.status)}</text>
`;
  svg += renderStyledLines(r.mechLines, mainX + 14, ty, 10.8, colors.text, 'Mechanism:');
  ty += r.mechLines.length * 14.5 + 3;
  svg += renderStyledLines(r.evidLines, mainX + 14, ty, 10.8, colors.text, 'Evidence:');
  ty += r.evidLines.length * 14.5 + 3;
  svg += renderStyledLines(r.cavLines, mainX + 14, ty, 10.2, colors.muted, 'Caveat:');
  svg += `  </g>\n`;
}

// Right side column aligned with main rungs
const sideX = mainX + mainW + 24;
const sideW = W - sideX - 24;

// Box 1: Ecology specs aligned with L0
const b0y = rungs[0].y, b0h = rungs[0].h;
svg += `  <g>
    <rect x="${sideX}" y="${b0y}" width="${sideW}" height="${b0h}" rx="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <text x="${sideX + 12}" y="${b0y + 22}" font-size="11.8" font-weight="700" fill="${colors.text}">Closed Ecology Specs</text>
    <text x="${sideX + 12}" y="${b0y + 42}" font-size="10.3" fill="${colors.muted}">• 40×40 torus, cap 400 flies</text>
    <text x="${sideX + 12}" y="${b0y + 58}" font-size="10.3" fill="${colors.muted}">• 20,000 ticks; maxAge 1,200</text>
    <text x="${sideX + 12}" y="${b0y + 74}" font-size="10.3" fill="${colors.muted}">• 8-bit Walsh food rules (3k)</text>
    <text x="${sideX + 12}" y="${b0y + 90}" font-size="10.3" fill="${colors.muted}">• 16 odor kinds redrawn / 100t</text>
    <text x="${sideX + 12}" y="${b0y + 106}" font-size="10.3" fill="${colors.muted}">• Balanced 8 good / 8 bad kinds</text>
  </g>
`;

// Box 2: P11b aligned with L1
const b1y = rungs[1].y, b1h = rungs[1].h;
svg += `  <line x1="${mainX + mainW + 2}" y1="${b1y + b1h / 2}" x2="${sideX - 4}" y2="${b1y + b1h / 2}" stroke="${colors.sideBorder}" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arrowRight)"/>\n`;
svg += `  <g>
    <rect x="${sideX}" y="${b1y}" width="${sideW}" height="${b1h}" rx="7" fill="${colors.sideBg}" stroke="${colors.sideBorder}" stroke-width="1.5"/>
    <rect x="${sideX + 10}" y="${b1y + 10}" width="44" height="20" rx="4" fill="${colors.sideBadge}"/>
    <text x="${sideX + 32}" y="${b1y + 24}" font-size="10.8" font-weight="700" fill="#ffffff" text-anchor="middle">P11b</text>
    <text x="${sideX + 62}" y="${b1y + 24}" font-size="11.8" font-weight="700" fill="${colors.text}">External L2 Search</text>
    <text x="${sideX + 10}" y="${b1y + 45}" font-size="10.2" fill="${colors.text}">Hand-written climber over L1</text>
    <text x="${sideX + 10}" y="${b1y + 60}" font-size="10.2" fill="${colors.text}">taste reviser from R_P12.</text>
    <text x="${sideX + 10}" y="${b1y + 80}" font-size="10.3" font-weight="700" fill="${colors.passBadge}">PASSED (80001–80048):</text>
    <text x="${sideX + 10}" y="${b1y + 96}" font-size="10.2" fill="${colors.text}">+5.73 vs R_P12 (48/48);</text>
    <text x="${sideX + 10}" y="${b1y + 111}" font-size="10.2" fill="${colors.muted}">vs R0 −0.54 (n.s.). In-world search.</text>
    <text x="${sideX + 10}" y="${b1y + 127}" font-size="9.6" fill="${colors.lightMuted}">Start set after H1/H2 failed.</text>
  </g>
`;

// Box 3: P13b related line aligned with L2
const b2y = rungs[2].y, b2h = rungs[2].h;
svg += `  <line x1="${mainX + mainW + 2}" y1="${b2y + b2h / 2}" x2="${sideX - 4}" y2="${b2y + b2h / 2}" stroke="${colors.sideBorder}" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arrowRight)"/>\n`;
svg += `  <g>
    <rect x="${sideX}" y="${b2y}" width="${sideW}" height="${b2h}" rx="7" fill="${colors.sideBg}" stroke="${colors.sideBorder}" stroke-width="1.5"/>
    <rect x="${sideX + 10}" y="${b2y + 10}" width="58" height="20" rx="4" fill="${colors.sideBadge}"/>
    <text x="${sideX + 39}" y="${b2y + 24}" font-size="10.5" font-weight="700" fill="#ffffff" text-anchor="middle">P13b</text>
    <text x="${sideX + 76}" y="${b2y + 24}" font-size="11.5" font-weight="700" fill="${colors.text}">Related Rungs</text>
    <text x="${sideX + 10}" y="${b2y + 44}" font-size="10.1" font-weight="700" fill="${colors.failBadge}">A1 (reviser): NOT SHOWN</text>
    <text x="${sideX + 10}" y="${b2y + 58}" font-size="10" fill="${colors.muted}">9 designs bounded below gate;</text>
    <text x="${sideX + 10}" y="${b2y + 72}" font-size="10" fill="${colors.muted}">P13b-1 (+5.96) &amp; 2b (+1.24)</text>
    <text x="${sideX + 10}" y="${b2y + 86}" font-size="10" fill="${colors.muted}">passed; 3/3a/3b failed.</text>
    <text x="${sideX + 10}" y="${b2y + 105}" font-size="10.1" font-weight="700" fill="${colors.sideBadge}">A3 (10th): PASSED (93001–)</text>
    <text x="${sideX + 10}" y="${b2y + 120}" font-size="10" fill="${colors.text}">+9.48 vs EVO-R, +8.86 vs SHAM</text>
    <text x="${sideX + 10}" y="${b2y + 134}" font-size="9.6" fill="${colors.muted}">Tunes acceptAt, NOT reviser.</text>
  </g>
`;

// Box 4: Guardrails aligned with L3
const b3y = rungs[3].y, b3h = rungs[3].h;
svg += `  <g>
    <rect x="${sideX}" y="${b3y}" width="${sideW}" height="${b3h}" rx="7" fill="#fffbeb" stroke="#d97706" stroke-width="1.2"/>
    <text x="${sideX + 12}" y="${b3y + 22}" font-size="11.5" font-weight="700" fill="#92400e">Audit &amp; Scope Guardrails</text>
    <text x="${sideX + 12}" y="${b3y + 42}" font-size="10.2" fill="#78350f">• All rules &amp; menus hand-written</text>
    <text x="${sideX + 12}" y="${b3y + 58}" font-size="10.2" fill="#78350f">• Git-frozen ≠ external pre-reg</text>
    <text x="${sideX + 12}" y="${b3y + 74}" font-size="10.2" fill="#78350f">• L0–L2 bounded; not open-ended</text>
    <text x="${sideX + 12}" y="${b3y + 90}" font-size="10.2" fill="#78350f">• No L3 bank spent (0 finals)</text>
    <text x="${sideX + 12}" y="${b3y + 106}" font-size="10.2" fill="#78350f">• Exact p only (runner MC defective)</text>
    <text x="${sideX + 12}" y="${b3y + 122}" font-size="10.2" fill="#78350f">• All failed attempts disclosed</text>
  </g>

  <text x="28" y="${H - 12}" font-size="10.2" fill="${colors.lightMuted}">Generated deterministically by docs/paper/figures/fig1_ladder.mjs from committed evidence/microverse/*.json and docs/*_LOG.md.</text>
</svg>
`;

const outPath = resolve(__dirname, 'fig1_ladder.svg');
writeFileSync(outPath, svg);
console.log('Wrote:', outPath, `${W}x${H}`);
