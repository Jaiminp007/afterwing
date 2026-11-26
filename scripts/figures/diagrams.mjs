// Hand-drawn explanatory diagrams. Shapes pass through a small displacement filter so lines wobble like
// ink; text stays crisp. Every fact shown here is from microverse/sim.mjs, config.mjs or the logs.
const W = 920;
const defs = `<defs>
  <filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter>
  <filter id="ink2" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
  <marker id="arr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M1 1.5 9 5 1 8.5" fill="none" stroke="#2b2a1e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>
  <marker id="arrf" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M1 1.5 9 5 1 8.5" fill="none" stroke="#8a8566" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>
  <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#c9c2a0" stroke-width="2"/></pattern>
</defs>`;
const svg = (h, inner) => `<svg width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" xmlns="http://www.w3.org/2000/svg">${defs}${inner}</svg>`;
const fly = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#ink2)">
  <ellipse cx="-6" cy="-3" rx="9" ry="5" transform="rotate(-28 -6 -3)" fill="#d4a373"/>
  <ellipse cx="6" cy="-3" rx="9" ry="5" transform="rotate(28 6 -3)" fill="#ccd5ae" style="mix-blend-mode:multiply"/>
  <ellipse cx="0" cy="3" rx="3.4" ry="7.5" fill="#2b2a1e"/><circle cx="0" cy="-6" r="3.1" fill="#2b2a1e"/>
  <circle cx="-1.5" cy="-6.6" r="1" fill="#b5452e"/><circle cx="1.5" cy="-6.6" r="1" fill="#b5452e"/></g>`;

// 1. How a smell becomes food or poison.
export function odorRule(page) {
  const bits = [1, 0, 1, 1, 0, 0, 1, 0], pm = bits.map(b => (b ? 1 : -1));
  const bx = i => 24 + i * 36, by = 172, S = 26;
  const terms = [[[1, 2], '#a8652f'], [[3, 7], '#3a6ea5'], [[0, 4], '#6b8e23']];
  const cardX = 380, cardW = 220, cy = [96, 186, 276];
  let s = '';
  s += `<text x="0" y="28" font-size="14" fill="#5f5b45">Hidden rule for this stretch of time <tspan class="mono" fill="#2b2a1e" font-size="15">(pairs)</tspan>:</text>
        <text x="0" y="54" class="mono" font-size="18" fill="#2b2a1e">nutritious when  b2·b3 + b4·b8 + b1·b5  &lt; 0</text>`;
  s += `<text x="${bx(0)}" y="${by - 22}" font-size="14" font-weight="600" fill="#2b2a1e">One smell = 8 bits</text>`;
  s += `<g filter="url(#ink2)">` + bits.map((b, i) => `<rect x="${bx(i)}" y="${by}" width="${S}" height="${S}" rx="4" fill="${b ? '#2b2a1e' : '#fffdf2'}" stroke="#2b2a1e" stroke-width="1.6"/>`).join('') + `</g>`;
  s += bits.map((b, i) => `<text x="${bx(i) + S / 2}" y="${by + S + 20}" text-anchor="middle" class="mono" font-size="12.5" fill="#5f5b45" dy="6">b${i + 1}</text>
     <text x="${bx(i) + S / 2}" y="${by + S + 50}" text-anchor="middle" class="mono" font-size="15" font-weight="500" fill="${pm[i] > 0 ? '#2b2a1e' : '#b5452e'}">${pm[i] > 0 ? '+1' : '−1'}</text>`).join('');
  s += `<text x="${bx(0)}" y="${by + S + 80}" class="hand" font-size="21" fill="#5f5b45">on = +1, off = −1</text><text x="${bx(0)}" y="${by + S + 104}" class="hand" font-size="21" fill="#5f5b45">colour marks show which bits each term uses</text>`;
  terms.forEach(([[a, b], col], k) => {
    const y = cy[k], v = pm[a] * pm[b];
    for (const i of [a, b]) s += `<rect x="${bx(i) + 3}" y="${by + S + 5}" width="${S - 6}" height="4" rx="2" fill="${col}"/>`;
    s += `<g filter="url(#ink)"><rect x="${cardX}" y="${y - 30}" width="${cardW}" height="60" rx="10" fill="#faedcd" stroke="${col}" stroke-width="1.8"/></g>
      <text x="${cardX + 18}" y="${y - 4}" class="mono" font-size="16" font-weight="500" fill="#2b2a1e">b${a + 1}·b${b + 1}</text>
      <text x="${cardX + 18}" y="${y + 18}" class="mono" font-size="13.5" fill="#5f5b45">(${pm[a] > 0 ? '+1' : '−1'})(${pm[b] > 0 ? '+1' : '−1'}) = <tspan fill="${v > 0 ? '#2b2a1e' : '#b5452e'}" font-weight="500">${v > 0 ? '+1' : '−1'}</tspan></text>`;
    s += `<path d="M${cardX + cardW + 4} ${y} C ${cardX + cardW + 50} ${y}, 640 186, 676 186" fill="none" stroke="#2b2a1e" stroke-width="1.4" stroke-opacity=".55" filter="url(#ink2)"/>`;
  });
  const sum = terms.reduce((a, [[x, y]]) => a + pm[x] * pm[y], 0);
  s += `<text x="${cardX}" y="40" dy="0" font-size="0"></text>`;
  s += `<text x="724" y="122" text-anchor="middle" font-size="14" font-weight="600" fill="#2b2a1e">add them up</text>
    <g filter="url(#ink)"><circle cx="724" cy="186" r="46" fill="#fffdf2" stroke="#2b2a1e" stroke-width="1.8"/></g>
    <text x="724" y="198" text-anchor="middle" class="serif" font-size="36" fill="#b5452e">${sum < 0 ? '−' : '+'}${Math.abs(sum)}</text>
    <path d="M772 186 H812" stroke="#2b2a1e" stroke-width="1.6" marker-end="url(#arr)" filter="url(#ink2)"/>
    <g filter="url(#ink)"><rect x="818" y="150" width="100" height="72" rx="12" fill="#e9edc9" stroke="#6b8e23" stroke-width="2"/></g>
    <circle cx="868" cy="174" r="7" fill="#6b8e23"/>
    <text x="868" y="204" text-anchor="middle" font-size="15" font-weight="600" fill="#2b2a1e">nutritious</text>
    <text x="868" y="246" text-anchor="middle" class="mono" font-size="13" fill="#5f5b45">−${Math.abs(sum)} &lt; 0</text>`;
  s += `<text x="${cardX}" y="350" class="hand" font-size="23" fill="#a8652f">the flies never see this formula; they have to discover it</text>`;
  return { width: 1000, html: page({ width: 1000, title: 'How a smell becomes food or poison',
    sub: 'Every food kind smells like an 8-bit code. A hidden rule multiplies some bits together, adds the products, and the sign decides nutritious or toxic.',
    body: svg(370, s),
    note: 'Every 3,000 ticks the rule changes family: pairs → staircase → triples → single, then repeats. The 16 food codes are redrawn every 100 ticks. Source: microverse/sim.mjs, microverse/config.mjs.' }) };
}

// 2. What passes from parent to offspring.
export function inheritance(page) {
  const card = (x, title, subtitle) => `<g filter="url(#ink)"><rect x="${x}" y="20" width="330" height="330" rx="16" fill="#fffdf2" stroke="#2b2a1e" stroke-width="1.6"/></g>
    ${fly(x + 34, 54, 1.25)}<text x="${x + 58}" y="52" font-size="17" font-weight="600" fill="#2b2a1e">${title}</text>
    <text x="${x + 58}" y="72" font-size="13" fill="#5f5b45">${subtitle}</text>`;
  const chips = (x, y, list, fill) => { let cx = x, out = ''; for (const c of list) { const w = 14 + c.length * 8.2; out += `<rect x="${cx}" y="${y}" width="${w}" height="26" rx="6" fill="${fill}"/><text x="${cx + w / 2}" y="${y + 17.5}" text-anchor="middle" class="mono" font-size="12.5" fill="#2b2a1e">${c}</text>`; cx += w + 6; } return out; };
  const feats = ['b2·b3', 'b4·b8', 'b1', 'b5·b7'];
  const section = (x, y, head) => `<text x="${x + 24}" y="${y}" font-size="12.5" font-weight="600" letter-spacing=".02em" fill="#5f5b45">${head}</text>`;
  const L = 20, R = 570;
  let s = card(L, 'Parent', 'end of its life') + card(R, 'Offspring', 'at birth');
  for (const [x, child] of [[L, false], [R, true]]) {
    s += `<rect x="${x + 12}" y="92" width="306" height="166" rx="10" fill="#e9edc9"/>`;
    s += section(x, 116, 'LEARNING PROGRAM');
    s += `<text x="${x + 24}" y="140" font-size="13" fill="#45432f">features it pays attention to</text>` + chips(x + 24, 150, feats, '#fefae0');
    s += `<text x="${x + 24}" y="202" font-size="13" fill="#45432f">reviser settings</text><text x="${x + 24}" y="222" class="mono" font-size="12.5" fill="#2b2a1e">cap 16 · prune 2 · threshold 3</text>`;
    s += `<text x="${x + 24}" y="246" font-size="13" fill="#45432f">evidence about each feature</text>`;
    s += section(x, 286, 'LEARNED WEIGHTS');
    const ws = child ? ['0', '0', '0', '0'] : ['+0.82', '−1.31', '+0.40', '−0.12'];
    s += ws.map((v, i) => `<text x="${x + 24 + i * 72}" y="316" class="mono" font-size="15" fill="${child ? '#8a8566' : '#2b2a1e'}">${v}</text>`).join('');
    if (child) s += `<text x="${x + 24}" y="340" class="hand" font-size="20" fill="#8a8566">starts from zero, learns again</text>`;
  }
  s += `<path d="M362 170 C 420 150, 480 150, 560 170" fill="none" stroke="#2b2a1e" stroke-width="2.2" marker-end="url(#arr)" filter="url(#ink)"/>
    <text x="461" y="136" text-anchor="middle" class="hand" font-size="24" fill="#6b8e23">copied</text>
    <text x="461" y="196" text-anchor="middle" class="hand" font-size="18" fill="#5f5b45">small mutations at birth</text>
    <path d="M362 306 C 420 318, 500 318, 560 306" fill="none" stroke="#8a8566" stroke-width="1.8" stroke-dasharray="5 6" marker-end="url(#arrf)" filter="url(#ink2)"/>
    <g stroke="#b5452e" stroke-width="3" stroke-linecap="round" filter="url(#ink2)"><path d="M448 300 L474 326"/><path d="M474 300 L448 326"/></g>
    <text x="461" y="350" text-anchor="middle" class="hand" font-size="22" fill="#b5452e">not passed on</text>`;
  return { width: 1000, html: page({ width: 1000, title: 'Offspring inherit how to learn, not what was learned',
    sub: 'A newborn gets its parent’s learning program: which features it watches, how it revises them, and the evidence so far. Every learned weight starts at zero.',
    body: svg(370, s),
    note: 'Feature names and settings are illustrative; the settings shown are the simulator defaults (tasteCap 16, tastePrune 2, tasteZ 3). Source: microverse/sim.mjs.' }) };
}

// 3. The L0–L3 ladder as a staircase.
export function ladder(page) {
  const steps = [
    ['L0', 'Lifetime learning', 'A fly gets better at telling food from poison during its own life.', 'shown · G4', true],
    ['L1', 'Program revision', 'Lineages add and drop the features their learning uses.', 'shown · G5, G7c', true],
    ['L2', 'Reviser tuning', 'Flies retune the settings of their own reviser in life.', 'shown · 44/48', true],
    ['L3', 'Compounding', 'Each level makes the next pay off ≥ 1.5× more.', 'not shown · best 1.44×', false],
  ];
  const sw = 222, base = 410, rise = 58;
  let s = `<path d="M0 ${base} H${W}" stroke="#2b2a1e" stroke-width="1.6" filter="url(#ink2)"/>`;
  steps.forEach(([k, t, d, st, ok], i) => {
    const x = i * (sw + 10), top = base - 70 - i * rise;
    s += `<g filter="url(#ink)"><rect x="${x}" y="${top}" width="${sw}" height="${base - top}" rx="8" fill="${ok ? '#ccd5ae' : 'url(#hatch)'}" stroke="#2b2a1e" stroke-width="1.6" ${ok ? '' : 'stroke-dasharray="7 6"'}/></g>`;
    s += `<text x="${x + 16}" y="${top + 32}" class="mono" font-size="15" font-weight="500" fill="#2b2a1e">${k}</text>`;
    s += ok ? `<g filter="url(#ink2)"><circle cx="${x + sw - 26}" cy="${top + 27}" r="13" fill="#fefae0" stroke="#6b8e23" stroke-width="1.8"/><path d="M${x + sw - 32} ${top + 27} l4.5 4.5 l8-9" fill="none" stroke="#6b8e23" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`
      : `<g filter="url(#ink2)"><circle cx="${x + sw - 26}" cy="${top + 27}" r="13" fill="#fefae0" stroke="#b5452e" stroke-width="1.8"/><path d="M${x + sw - 31} ${top + 22} l10 10 M${x + sw - 21} ${top + 22} l-10 10" stroke="#b5452e" stroke-width="2.2" stroke-linecap="round"/></g>`;
    const ty = top - 104;
    s += `<text x="${x + 2}" y="${ty}" class="serif" font-size="23" fill="#2b2a1e">${t}</text>`;
    const words = d.split(' '); let line = '', lines = [];
    for (const wd of words) { if ((line + ' ' + wd).trim().length > 30) { lines.push(line.trim()); line = wd; } else line += ' ' + wd; } lines.push(line.trim());
    s += lines.map((l, j) => `<text x="${x + 2}" y="${ty + 24 + j * 19}" font-size="13.5" fill="#5f5b45">${l}</text>`).join('');
    s += `<text x="${x + 2}" y="${ty + 24 + lines.length * 19 + 6}" font-size="13" font-weight="600" fill="${ok ? '#5a7a1c' : '#b5452e'}">${st}</text>`;
  });
  s += `<text x="${3 * (sw + 10) + 8}" y="${base - 30}" class="hand" font-size="21" fill="#8a8566">four designs tried,</text><text x="${3 * (sw + 10) + 8}" y="${base - 8}" class="hand" font-size="21" fill="#8a8566">none cleared the bar</text>`;
  return { width: 1000, html: page({ width: 1000, title: 'The ladder Afterwing is climbing',
    sub: 'Each rung is a stronger kind of self-improvement. A rung counts as shown only after it passes a pre-registered test on fresh worlds.',
    body: svg(430, s),
    note: 'L0–L2 shown on fresh seeds; L3 never cleared its practice bar, so it had no final run. Records: docs/MICROVERSE_LOG.md, docs/FLY_RSI_LOG.md.' }) };
}

// 4. How every result is produced.
export function protocol(page) {
  const steps = [
    ['Write it down', 'Goal, measure and pass bar are fixed before any test.'],
    ['Practice', 'Tune on practice seeds only, never final ones.'],
    ['Freeze', 'Code and settings are committed and fixed.'],
    ['One final', 'Run once on fresh seeds nobody has used.'],
    ['Report', 'Pass, or record it as not shown.'],
  ];
  const nw = 164, gap = 25, y = 70, nh = 172;
  let s = '';
  steps.forEach(([t, d], i) => {
    const x = i * (nw + gap), hl = i === 3;
    s += `<g filter="url(#ink)"><rect x="${x}" y="${y}" width="${nw}" height="${nh}" rx="12" fill="${hl ? '#faedcd' : '#fffdf2'}" stroke="${hl ? '#a8652f' : '#2b2a1e'}" stroke-width="${hl ? 2.2 : 1.6}"/></g>
      <circle cx="${x + 26}" cy="${y + 28}" r="13" fill="${hl ? '#d4a373' : '#ccd5ae'}"/><text x="${x + 26}" y="${y + 33}" text-anchor="middle" class="mono" font-size="13" font-weight="500" fill="#2b2a1e">${i + 1}</text>
      <text x="${x + 16}" y="${y + 70}" class="serif" font-size="20" fill="#2b2a1e">${t}</text>`;
    const words = d.split(' '); let line = '', lines = [];
    for (const wd of words) { if ((line + ' ' + wd).trim().length > 20) { lines.push(line.trim()); line = wd; } else line += ' ' + wd; } lines.push(line.trim());
    s += lines.map((l, j) => `<text x="${x + 16}" y="${y + 94 + j * 18}" font-size="13" fill="#5f5b45">${l}</text>`).join('');
    if (i < steps.length - 1) s += `<path d="M${x + nw + 3} ${y + nh / 2} H${x + nw + gap - 3}" stroke="#2b2a1e" stroke-width="1.6" marker-end="url(#arr)" filter="url(#ink2)"/>`;
  });
  const px = 1 * (nw + gap);
  s += `<path d="M${px + nw - 30} ${y - 4} C ${px + nw - 30} ${y - 46}, ${px + 30} ${y - 46}, ${px + 30} ${y - 6}" fill="none" stroke="#a8652f" stroke-width="1.8" marker-end="url(#arr)" filter="url(#ink2)"/>
    <text x="${px + nw / 2}" y="${y - 40}" text-anchor="middle" class="hand" font-size="21" fill="#a8652f">fix and retest</text>`;
  const fx = 3 * (nw + gap);
  s += `<text x="${fx + nw / 2}" y="${y + nh + 34}" text-anchor="middle" class="hand" font-size="22" fill="#a8652f">one shot, no reruns</text>`;
  s += `<g filter="url(#ink2)"><rect x="0" y="${y + nh + 64}" width="${W}" height="58" rx="10" fill="#e9edc9"/></g>
    <text x="20" y="${y + nh + 98}" font-size="14" fill="#2b2a1e"><tspan font-weight="600">Controls a self-improver must beat:</tspan>  a fixed program  ·  random rewrites  ·  mutation only  ·  a matched sham</text>`;
  return { width: 1000, html: page({ width: 1000, title: 'How every result is earned',
    sub: 'Ideas are tuned on practice worlds, then judged once on worlds nobody has seen. A miss stays a miss.',
    body: svg(y + nh + 132, s),
    note: 'Scores are paired solo runs: each lineage lives alone in the same seeded world, and its score is the mean population over ticks 10,000–20,000. p-values are one-sided sign-flip tests. Protocol: docs/MICROVERSE_GOALS.md.' }) };
}
