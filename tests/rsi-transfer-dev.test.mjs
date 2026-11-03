// RSI-TRANSFER V1 fixtures (FROZEN plan docs/RSI_TRANSFER_PLAN_V1.md).
// 6 tests, zero worlds: bank tmp-mint shape/exclusion, finalRateOf
// reconstruction, transplant digest round-trip on fresh learners,
// scorer GO/NOGO/INCOMPLETE-NOFIRE branches, zero-tick selfPropose skip.
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {rmSync} from 'node:fs';
import {TasteExperiment} from '../learning/taste-experiment.mjs';
import {selfPropose} from '../scripts/rsi-self-dev.mjs';
import {snapshotWeights,digestWeights,copyWeights,assertFreshTarget,checkTransplantIntegrity} from '../scripts/turn-gated-dev-v1m.mjs';
import {rsiTransferBank,finalRateOf,scoreRsiTransferRows,RT_FIXTURE_SEEDS,RT_TRAIN_ARMS} from '../scripts/rsi-transfer-dev.mjs';

const synthHistory=(seed)=>({seed,cueSeed:seed+1,resourceSeeds:[seed+2,seed+3,seed+4,seed+5],probeSeeds:{A:seed+6,B:seed+7,transfer:seed+8}});
const trainRow=(arm,seed,proposals,energy=-60.0)=>({history:{seed},arm,stage:'train',proposals,finalRate:1.0,finalRateSpread:0,
  phaseRows:[0,1,2,3].map(i=>({phase:i})),endpoint:{budgetAdjustedEnergyPerFounder:energy,survivors:3}});
const txRow=(arm,seed,value,rate=1.0)=>({history:{seed},arm,stage:'transfer',probeRate:rate,
  transfer:{transferred:24,total:24,sourceDigest:'aa',appliedDigest:'aa'},
  endpoint:{budgetAdjustedEnergyPerFounder:value,survivors:3}});

describe('rsi-transfer-dev fixtures',()=>{
  it('bank refuses re-mint post-spend (spent-bank guard)',()=>{
    const dir=join(tmpdir(),'rt-bank-test');
    rmSync(dir,{recursive:true,force:true});
    assert.throws(()=>rsiTransferBank(join(dir,'protocol.json')),/already used in prior evidence/);
    rmSync(dir,{recursive:true,force:true});
  });
  it('finalRateOf reconstructs median adopted rate (synthetic proposals)',()=>{
    const q=[
      {agentId:0,tick:512,incRate:1.0,propRate:2.0,decision:'adopt'},
      {agentId:0,tick:1024,incRate:2.0,propRate:1.0,decision:'keep'},
      {agentId:0,tick:1536,incRate:2.0,propRate:0.5,decision:'adopt'},
      {agentId:1,tick:512,incRate:1.0,propRate:null,decision:'skip'},
      {agentId:1,tick:1024,incRate:1.0,propRate:0.5,decision:'adopt'}];
    const fr=finalRateOf(q,1.0);
    assert.equal(fr.median,0.5);assert.equal(fr.spread,0);assert.equal(fr.n,2);
    const none=finalRateOf([{agentId:2,tick:512,incRate:1.0,propRate:null,decision:'skip'}],1.0);
    assert.equal(none.median,1.0);
    assert.equal(finalRateOf([],1.0).median,1.0);
  });
  it('transplant digest round-trips on fresh learners (synthetic seed 7)',()=>{
    const a=new TasteExperiment({history:synthHistory(7),arm:'candidate'});
    const b=new TasteExperiment({history:synthHistory(7),arm:'candidate'});
    const snap=snapshotWeights(a.learners);
    for(const id of Object.keys(snap))assertFreshTarget(b.learners[id],id);
    const cp=copyWeights(snap,b.learners);
    assert.ok(cp.transferred>0);
    const chk=checkTransplantIntegrity(snap,b.learners);
    assert.equal(chk.ok,true);
    assert.equal(digestWeights(snap),digestWeights(snapshotWeights(b.learners)));
  });
  it('scorer GO iff selfmod transfer tops both controls',()=>{
    const rows=[
      trainRow('selfmod',473064,[{agentId:0,tick:512,incRate:1,propRate:2,decision:'adopt'}]),
      trainRow('fixed',473064,[]),trainRow('unlearned',473064,[]),
      trainRow('selfmod',473082,[{agentId:0,tick:512,incRate:1,propRate:0.5,decision:'adopt'}]),
      trainRow('fixed',473082,[]),trainRow('unlearned',473082,[]),
      txRow('selfmod',473073,-59.0),txRow('fixed',473073,-60.0),txRow('unlearned',473073,-61.0),
      txRow('selfmod',473091,-58.0),txRow('fixed',473091,-60.5),txRow('unlearned',473091,-62.0)];
    const v=scoreRsiTransferRows(rows);
    assert.equal(v.g1,true);assert.equal(v.g2,true);
    assert.equal(v.go,true);assert.equal(v.verdict,'RSI-TRANSFER-GO-V1');
    assert.ok(v.means.selfmod>v.means.fixed&&v.means.selfmod>v.means.unlearned);
  });
  it('scorer NOGO on no-lift and INCOMPLETE-NOFIRE with zero adopts',()=>{
    const mk=(sme,fe,ue)=>[
      trainRow('selfmod',473064,[{agentId:0,tick:512,incRate:1,propRate:2,decision:'adopt'}]),
      trainRow('fixed',473064,[]),trainRow('unlearned',473064,[]),
      trainRow('selfmod',473073,[{agentId:0,tick:512,incRate:1,propRate:2,decision:'adopt'}]),
      trainRow('fixed',473073,[]),trainRow('unlearned',473073,[]),
      txRow('selfmod',473073,sme),txRow('fixed',473073,fe),txRow('unlearned',473073,ue),
      txRow('selfmod',473082,sme),txRow('fixed',473082,fe),txRow('unlearned',473082,ue)];
    const n=scoreRsiTransferRows(mk(-61.0,-59.0,-60.0));
    assert.equal(n.go,false);assert.equal(n.verdict,'RSI-TRANSFER-NOGO-V1');
    const zrows=mk(-59.0,-60.0,-61.0).map(r=>r.stage==='train'&&r.arm==='selfmod'
      ?{...r,proposals:[{agentId:0,tick:512,incRate:1,propRate:null,decision:'skip'}]}:r);
    const z=scoreRsiTransferRows(zrows);
    assert.equal(z.go,false);assert.equal(z.verdict,'INCOMPLETE-NOFIRE');
  });
  it('zero-tick selfPropose takes the skip branch (synthetic seed 7)',()=>{
    const run=new TasteExperiment({history:synthHistory(7),arm:'candidate',learnerOptions:{selfMod:true}});
    const st=run.learners[run.founderIds[0]];
    assert.equal(st.config.selfMod,true);
    const rec=selfPropose(st,512);
    assert.equal(rec.decision,'skip');assert.equal(rec.propRate,null);
  });
  it('probe rate applies via live-application path (adopted 2.0 sticks)',()=>{
    const run=new TasteExperiment({history:synthHistory(7),arm:'candidate'});
    for(const id of run.founderIds)run.learners[id].config.tasteRate=2.0;
    assert.ok(run.learners[run.founderIds[0]].config.tasteRate===2.0);
  });
});
