import assert from 'node:assert/strict';
import { readFileSync,writeFileSync } from 'node:fs';
import { signflip } from '../../docs/paper/stats.mjs';

const read=f=>readFileSync(new URL(f,import.meta.url),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const seeds=Array.from({length:16},(_,i)=>2101+i), mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const controls=['ADAPT','COIN','EVO0','EVO10','EVO50'];
const grid={
  cue:['LEGACY','JOINT','A','B','MIX25','MIX50','MIX75','BANK_A','BANK_B'],
  vol:['LEGACY','D0005','D03','D12','D48'],
  kernel:['LEGACY','LAST','DILUTE','M0','M1','M2','M3','M4','ALL','B1_D006','B4_D03','B12_D03','B12_D12','R2','R4'],
};
const datasets={
  cue:[...read('rows.ndjson'),...read('extra.ndjson').filter(r=>r.design==='cue')],
  vol:read('extra.ndjson').filter(r=>r.design==='vol'),
  kernel:[...read('kernel.ndjson'),...read('challenge.ndjson')],
};
const summarize=z=>{
  const avg=mean(z), sd=Math.sqrt(z.reduce((s,x)=>s+(x-avg)**2,0)/15);
  return {mean:avg/100,sd:sd/100,se:sd/400,wins:z.filter(x=>x>0).length,ties:z.filter(x=>x===0).length,
    p:signflip(z,1),min:Math.min(...z)/100,max:Math.max(...z)/100,bySeed:z.map(x=>x/100)};
};
const out={seeds,endpoint:'mean live flies at 10100:100:20000, zeros included; d4 NOT divided by 2',designs:{}};
for(const [d,rows] of Object.entries(datasets)) {
  const oracles=d==='cue'?['ORACLE_ROUTE']:d==='vol'?['ORACLE_ROUTE','CHANGE']:['ORACLE'];
  const labels=['U','DECK',...grid[d],...controls,...oracles];
  const tab=new Map;
  for(const r of rows) {
    const key=r.seed+':'+r.arm;
    assert.ok(seeds.includes(r.seed)&&labels.includes(r.arm)&&Number.isInteger(r.sum)&&r.n===100);
    assert.ok(r.hi<=400&&r.sum>=0&&r.sum<=r.hi*r.n&&r.tel.bites>0);
    assert.ok(!tab.has(key));tab.set(key,r);
  }
  assert.equal(tab.size,seeds.length*labels.length);
  for(const s of seeds) assert.equal(new Set(labels.map(a=>tab.get(s+':'+a).schedule)).size,1);
  const P=(a,s)=>tab.get(s+':'+a).sum, vals=a=>seeds.map(s=>P(a,s));
  const endpoint=a=>mean(vals(a))/100, pick=arr=>arr.reduce((a,b)=>endpoint(b)>endpoint(a)?b:a);
  const F=pick(['U','DECK']),M=pick(grid[d]),E=pick(['EVO0','EVO10','EVO50']);
  const diff=(x,y)=>summarize(seeds.map(s=>P(x,s)-P(y,s)));
  const gate=(x,m=M)=>summarize(seeds.map(s=>2*P(x,s)-3*P(m,s)+P(F,s)));
  out.designs[d]={cells:rows.length,means:Object.fromEntries(labels.map(a=>[a,endpoint(a)])),fixed:F,meta:M,evo:E,
    ratio:(endpoint('ADAPT')-endpoint(F))/(endpoint(M)-endpoint(F)),baseGain:diff(M,F),adaptiveMargin:diff('ADAPT',M),
    coinMargin:diff('ADAPT','COIN'),evoMargin:diff('ADAPT',E),d4:gate('ADAPT'),vsFrozen:gate('ADAPT','LEGACY'),
    oracle:Object.fromEntries(oracles.map(a=>[a,gate(a)])),extinctions:rows.filter(r=>r.extinct).length,
    maxSampledPopulation:Math.max(...rows.map(r=>r.hi)),adaptiveAlignment:mean(seeds.map(s=>tab.get(s+':ADAPT').aligned)),
    averageSkill:Object.fromEntries([F,M,'ADAPT',...oracles].map(a=>[a,mean(seeds.map(s=>tab.get(s+':'+a).skill))]))};
}
writeFileSync(new URL('./score.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
for(const [name,a] of Object.entries(out.designs)) {
  console.log(name,a.cells,a.fixed,a.meta,a.means, 'd4',a.d4.mean,'SE',a.d4.se,'wins',a.d4.wins,'p',a.d4.p,'ratio',a.ratio,'alignment',a.adaptiveAlignment,
    'oracle d4',Object.fromEntries(Object.entries(a.oracle).map(([k,x])=>[k,x.mean])));
}
