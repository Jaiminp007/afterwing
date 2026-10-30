// MATE-ENERGY fixtures (G5 gate). Zero bank worlds: synthetic rows, temp-dir
// bank, short-run plumbing checks (bar default + explicit; no mating possible
// either way in 200 ticks). Union-excluded via tests/*.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {TasteExperiment} from '../learning/taste-experiment.mjs';
import {BT_LEARNER_OPTIONS,BT_PRICING} from '../scripts/body-transfer.mjs';
import {mateEnergyDevBank,scoreMateEnergyRows} from '../scripts/mate-energy-dev.mjs';

const mkRow=(arm,seed,births)=>({history:{seed},arm,
  bar:arm==='bar50'?50:65,matingDecoupled:true,
  endpoint:{budgetAdjustedEnergyPerFounder:-60.0,survivors:12},births});

test('scorer GO on >=1 birth either arm, with arm-split interpretation',()=>{
  const seeds=[404001,404010,404019,404028];
  const goFifty=[...seeds.map(s=>mkRow('bar65',s,0)),...seeds.map((s,i)=>mkRow('bar50',s,i===0?3:0))];
  const v=scoreMateEnergyRows(goFifty);
  assert.equal(v.go,true);
  assert.equal(v.verdict,'MATE-ENERGY-GO');
  assert.equal(v.bar50Total,3);
  assert.equal(v.bar65Total,0);
  assert.ok(v.interpretation.includes('energy bar'));
  const goBoth=[...seeds.map((s,i)=>mkRow('bar65',s,i===0?1:0)),...seeds.map((s,i)=>mkRow('bar50',s,i===1?2:0))];
  const vb=scoreMateEnergyRows(goBoth);
  assert.equal(vb.go,true);
  assert.ok(vb.interpretation.includes('undiscriminating'));
});

test('scorer NOGO when zero both; INVALID on bad audit',()=>{
  const seeds=[404001,404010,404019,404028];
  const flat=[...seeds.map(s=>mkRow('bar65',s,0)),...seeds.map(s=>mkRow('bar50',s,0))];
  const n=scoreMateEnergyRows(flat);
  assert.equal(n.go,false);
  assert.equal(n.verdict,'MATE-ENERGY-NOGO');
  const bad=flat.map((r,i)=>i===0?{...r,bar:999}:r);
  const iv=scoreMateEnergyRows(bad);
  assert.equal(iv.go,false);
  assert.equal(iv.verdict,'INVALID');
  const short=flat.slice(0,7);
  const is=scoreMateEnergyRows(short);
  assert.equal(is.go,false);
  assert.equal(is.verdict,'INVALID');
});

test('bar plumbing: default 65, explicit passthrough, short runs complete',()=>{
  const history={seed:402001,cueSeed:402002,resourceSeeds:[402003,402004,402005,402006]};
  const mk=(extra)=>new TasteExperiment({history,arm:'candidate',learnerOptions:{...BT_LEARNER_OPTIONS},
    cruiseSpeed:0,body:'N',pricing:{...BT_PRICING},emit:null,reproduction:true,matingActionRequired:false,...extra});
  const d=mk({});
  assert.equal(d.world.config.matingEnergyBar,65);
  const e=mk({matingEnergyBar:50});
  assert.equal(e.world.config.matingEnergyBar,50);
  for(let t=0;t<200&&!e.finished;t++)e.step();
  assert.ok(Number.isInteger(e.world.totals.births));
  const a=mk({matingEnergyBar:65});
  for(let t=0;t<200&&!a.finished;t++)a.step();
  for(let t=0;t<200&&!d.finished;t++)d.step();
  assert.equal(a.endpoint().budgetAdjustedEnergyPerFounder,d.endpoint().budgetAdjustedEnergyPerFounder);
  assert.equal(a.endpoint().scalarOperations,d.endpoint().scalarOperations);
});

test('bank builds 36-unique on 404001-404036 and registers spent+self exclusions',()=>{
  const dir=mkdtempSync(join(tmpdir(),'mate-energy-bank-'));
  const p=mateEnergyDevBank(join(dir,'protocol.json'));
  assert.equal(p.experiment,'mate-energy-dev');
  assert.equal(p.histories.length,4);
  const flat=p.histories.flatMap(h=>[h.seed,h.cueSeed,...h.resourceSeeds,h.probeSeeds.A,h.probeSeeds.B,h.probeSeeds.transfer]);
  assert.equal(new Set(flat).size,36);
  assert.equal(Math.min(...flat),404001);
  assert.equal(Math.max(...flat),404036);
  for(const s of [381001,400001,402001,404001])assert.ok(p.excludedSeeds.includes(s),`missing exclusion ${s}`);
  assert.deepEqual(mateEnergyDevBank(join(dir,'protocol.json')),p);
});
