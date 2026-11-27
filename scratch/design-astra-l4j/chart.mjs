import fs from 'node:fs';
import { read, here } from './batch.mjs';
const h=read('analysis.json').hold,f=h.families,F=f.LINEAR_1.mean,fmt=n=>n.toFixed(2);
const data=[['Structural L2',f['BEAM_0.12_0.5'].mean,'#478998'],['Flat fixed-share',f['BSHARE_0.02_0.06'].mean,'#65746b'],
  ['Flat joint filter',f.JOINT_top.mean,'#52695c'],['Oracle-driven L2',f.B_ORACLE_LAW.mean,'#d77534'],
  ['Unpruned axis oracle',f.FULL_ORACLE.mean,'#b96335'],['Required',h.needed,'#303330']];
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>*{box-sizing:border-box}body{margin:0;padding:20px;color:#262d28;background:#faf8f2;font:15px Georgia,serif}h1{font-size:23px;margin:0 0 6px}p{margin:0 0 14px}.r{display:grid;grid-template-columns:minmax(110px,155px) 1fr 46px;gap:8px;align-items:center;margin:9px 0}.track{background:#eae9df}.bar{height:13px}.n{font-variant-numeric:tabular-nums;text-align:right}small{color:#4c554c}</style>
<h1>Regime information falls short of the gate</h1><p>Gain in mean late flies over FIXED (${fmt(F)}). Sixteen held-out worlds.</p>
${data.map(([name,x,c])=>`<div class="r"><span>${name}</span><div class="track"><div class="bar" style="width:${(x-F)/20*100}%;background:${c}"></div></div><span class="n">+${fmt(x-F)}</span></div>`).join('')}
<small>Required gain = 1.5 times the flat joint filter's gain. Oracle minus flat: +${fmt(h.beamOverFlat.mean)} flies; required extra: +${fmt(h.flatNeed.mean)}.</small>`;
fs.writeFileSync(here('gate.html'),html);
