import fs from 'node:fs';

const { data } = JSON.parse(fs.readFileSync(new URL('analysis.json', import.meta.url)));
const max = Math.ceil(Math.max(...data.map(d => Math.max(d.gates.room.mean, d.gates.need))));
const labels = ['L4-H', 'Draw 1', 'Draw 2', 'Draw 3'];
const bar = (v, cls) => `<div class="track"><i class="${cls}" style="width:${100 * v / max}%"></i></div><b>${v.toFixed(2)}</b>`;
const rows = data.map((d, i) => `<section><strong>${labels[i]}</strong><div class="bars">
${bar(d.gates.room.mean, 'room')}${bar(d.gates.need, 'need')}</div></section>`).join('');
fs.writeFileSync(new URL('gate-room.html', import.meta.url), `<!doctype html><meta charset="utf-8">
<style>
body{font:14px var(--font-sans,sans-serif);color:var(--foreground)}
.legend{display:flex;flex-wrap:wrap;gap:4px 16px;margin:0 0 12px;font-size:12px}
.legend span:before{content:'';display:inline-block;width:12px;height:7px;margin-right:5px;background:var(--chart-1)}
.legend span+span:before,.need{background:var(--chart-2)}
section{display:grid;grid-template-columns:55px 1fr;align-items:center;gap:8px;margin-bottom:12px}
.bars{display:grid;grid-template-columns:1fr 38px;align-items:center;gap:2px 8px}
.track{height:10px;border-left:1px solid var(--border);background:var(--muted)}i{display:block;height:10px}
.room{background:var(--chart-1)}b{font:12px var(--font-mono,monospace);text-align:right}
p{font-size:12px;margin:8px 0;color:var(--muted-foreground)}
</style><div class="legend"><span>Hindsight gain from choosing a gate per world</span><span>Gain L3 needs</span></div>
${rows}<p>Mean late-population difference in flies; 16 paired tuning worlds per family. Bars share a zero baseline.</p>`);
