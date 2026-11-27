// Interval-overlap bank audit: node scripts/bank-audit.mjs <lo> <hi>
// Scans text artifacts (outside .git, node_modules, venvs, runtime autosaves) for numeric
// ranges (a-b, a–b, a..b, "a to b", abbreviated upper ends) and bare numbers, and reports
// any that overlap, enclose or fall inside [lo, hi].
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
const [lo, hi] = process.argv.slice(2).map(Number);
if (!(lo <= hi)) { console.error('usage: bank-audit.mjs lo hi'); process.exit(2); }
const EXT = new Set(['.md', '.json', '.mjs', '.js', '.txt', '.py', '.csv', '.ts', '.tex', '.sh']);
const SKIP = /(^|\/)(\.git|node_modules|\.venv[^/]*|runtime-snapshot)(\/|$)|autosave\.json$/;
const hits = []; let files = 0;
function expandHi(a, b) { // "985001–08" style abbreviated upper end
  if (b.length < a.length) return Number(a.slice(0, a.length - b.length) + b);
  return Number(b);
}
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (SKIP.test(p)) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (EXT.has(extname(e)) && st.size < 50e6) {
      files++;
      const t = readFileSync(p, 'utf8');
      const re = /(\d{3,})\s*(?:-|–|—|\.\.|to)\s*(\d{1,})/g; let m;
      while ((m = re.exec(t))) { const a = Number(m[1]), b = expandHi(m[1], m[2]); if (b >= a && a <= hi && b >= lo) hits.push([p, m[0]]); }
      const re2 = /\b(\d{5,7})\b/g;
      while ((m = re2.exec(t))) { const v = Number(m[1]); if (v >= lo && v <= hi) hits.push([p, m[0]]); }
    }
  }
}
walk(process.argv[4] ?? '.');
console.log(`scanned ${files} files for overlap with ${lo}-${hi}: ${hits.length} hits`);
for (const [p, s] of hits.slice(0, 50)) console.log(`  ${p}: ${s}`);
process.exit(hits.length ? 1 : 0);
