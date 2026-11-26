// Convert the figure SVGs to vector PDFs for pdflatex/tectonic, using headless Chrome.
// Usage: node docs/paper/figures/svg2pdf.mjs [path-to-chrome]
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const chrome = process.argv[2] ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
for (const f of readdirSync(dir).filter(x => x.endsWith('.svg'))) {
  const svg = readFileSync(dir + f, 'utf8'), m = svg.match(/<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/);
  const [w, h] = [+m[1], +m[2]], html = dir + f.replace('.svg', '.tmp.html'), pdf = dir + f.replace('.svg', '.pdf');
  writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>@page{size:${w}px ${h}px;margin:0}html,body{margin:0;padding:0}svg{display:block}</style>${svg}`);
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, pathToFileURL(html).href], { stdio: 'ignore' });
  rmSync(html);
  console.log(`${f} -> ${f.replace('.svg', '.pdf')} (${w}x${h})`);
}
