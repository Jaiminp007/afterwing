// A stronger challenge fixed after initial exploratory feedback. Reuse the
// exact world and batch machinery, but keep the original result digest intact.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let src=readFileSync(new URL('./kernel.mjs',import.meta.url),'utf8');
function sub(x,y) { assert.equal(src.split(x).length,2); src=src.replace(x,()=>y); }
sub("const labels=['U','DECK',...levels,'ADAPT','ORACLE','COIN','EVO0','EVO10','EVO50'];",
  "const labels=['B1_D006','B4_D03','B12_D03','B12_D12','R2','R4'];");
sub('f.last=p?.last??0;', 'f.recent=p?p.recent.slice():[]; f.last=p?.last??0;');
sub('for(let i=0;i<12;i++)f.alpha[i]=1+.994*(f.alpha[i]-1);',
  "const d=({B4_D03:.03,B12_D03:.03,B12_D12:.12})[this.mode]??.006; for(let i=0;i<12;i++)f.alpha[i]=1+(1-d)*(f.alpha[i]-1);");
sub("if(mode==='LEGACY') {bits(m,i=>{a[i]=Math.min(30,a[i]+4);});return;}",`
    if(mode.startsWith('B')) {
      const boost=+mode.slice(1).split('_')[0];
      bits(m,i=>{a[i]=Math.min(30,a[i]+boost);});return;
    }
    if(mode==='R2'||mode==='R4') {
      if(f.recent[0]!==m) {
        f.recent=[m,...f.recent.filter(q=>q!==m)].slice(0,+mode[1]);
      }
      a.fill(1);
      for(const q of f.recent) bits(q,i=>{a[i]=25;});
      return;
    }
`);
sub("['../../microverse/l3v.mjs','./world.mjs','./kernel.mjs']", "['../../microverse/l3v.mjs','./world.mjs','./kernel.mjs','./challenge.mjs']");
sub("new URL('./kernel.ndjson',import.meta.url)","new URL('./challenge.ndjson',import.meta.url)");
src=src.replaceAll('import.meta.url',JSON.stringify(import.meta.url));
for(const p of ['./world.mjs','../../microverse/l3v.mjs']) sub(`from '${p}'`,`from '${new URL(p,import.meta.url).href}'`);
await import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
