#!/bin/bash
# Usage: bash docs/paper/run-v5.sh
# V5 of docs/PAPER_VERIFICATION_PLAN.md (practice seeds 101-116 only, report-only), plus amendment A1's inert-package check.
set -u
cd "$(dirname "$0")/../.."
OUT=evidence/microverse/paper-v5
mkdir -p $OUT
SEEDS=$(seq -s, 101 116)
l2() { MV_SET=L2 MV_ARMS=${3:-META,SHAM,EVOR,FIXED} MV_WORLD="{\"brainSwitch\":{\"mul\":[1,$1],\"switch\":$2}}" node microverse/p13parts.mjs 101-116; }
l2 12 0.001  > $OUT/l2-base.json
l2 8 0.001   > $OUT/l2-lowcost.json
l2 16 0.001  > $OUT/l2-highcost.json
l2 12 0.0005 > $OUT/l2-slowswitch.json
l2 12 0.002  > $OUT/l2-fastswitch.json
MV_META='{"leanGenes":{"tasteCap":16,"tastePrune":2,"tasteZ":3,"moveCap":12,"movePrune":0.5,"moveZ":3}}' l2 12 0.001 META,SHAM > $OUT/l2-inert.json
sched() { echo "{\"ruleSchedule\":[[\"pairs\",$1],[\"staircase\",$1],[\"triples\",$1],[\"single\",$1]]}"; }
for E in 3000 2000 4500; do
  for B in TASTEONLY MOVEONLY; do MV_WORLD="$(sched $E)" node microverse/solo.mjs SELF $B $SEEDS > $OUT/g7c-$B-epoch$E.json; done
done
echo V5 DONE
