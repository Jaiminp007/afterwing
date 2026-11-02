# TRANSFER MECHANISM MAP V1 (what lifts besides lossy)

Date: 2026-11-02. Zero worlds. Follows SYNTHESIS ADDENDUM V4's
reframe (open question is now transfer-side). Tried mechanisms
with verdicts; predicted-null extensions (predictions, NOT
verdicts — never run, never claimed); what would license new work.

## Tried (measured lifts, closed)

- Surprise-gated gain (live+replay mix): +0.10–0.26, DEPLOYED
  (V1h/V1i). Mechanism: extinction (replays high-error records).
- Lossy transplant α=0.25 (plateau 0.05–0.25): +0.13–0.26,
  DEPLOYED (V1j/V1l/V1m/V1n). Mechanism: unlearning (shrinks
  preserved avoidance). Replicates on fresh banks (C15 exact
  0.31/0.62 vs lossy 0.95/0.91).
- Threat-gated replay (TS): flat (+0.004), NOGO (acquisition-side,
  engaged-but-inert).
- Damage-gated replay (DAMAGE-GATE): flat (+0.015), NOGO.
- Dose curve (V1m/V1n): monotone shrinkage, plateau ~0.95, no peak
  (variance ~0.02 — no interior optimum to exploit).
- Rate dial 2.0 (C12): null (−0.05/+0.02, update-rule family null).
- Sparse mask 0.5 (C14/C15): null on exact (−0.04/−0.02), zero on
  lossy (−0.004/−0.016). Target-selection closed.

## Predicted-null extensions (NOT run, NOT verdicts — predictions)

- Sparse × lossy (mask on working transfer): predicted null by
  C14 (mask null) + C15 (operators add zero to lossy) jointly.
  Filed as prediction so nobody spends a bank testing it without
  a new rationale.
- Per-parameter rates × lossy: same joint logic, predicted null.
- Threat/damage × lossy: acquisition-side mechanisms on a
  transfer already fixed — predicted null (wrong side of the
  wound).

## Addendum 2026-11-02 (R348: input-side locus + TTA taxonomy)

- New LOCUS (Guo/diffusion-TTA): adapt INPUTS (transform target
  toward source) instead of weights. Every mechanism in the map
  above is weight-side (gains/scales/masks/transplants all rewrite
  weights or their updates). Input-side is outside that locus —
  the first such idea on record. UNLICENSED (needs a generative
  model of the train world = substrate work) but it re-partitions
  the hunt: weight-side (mapped, largely closed) vs input-side
  (unmapped, one candidate).
- TTA taxonomy (Liang survey) adopted as the hunt's map: update
  weights/statistics (tried) vs adapt inputs (untried) vs adapt
  prototypes (ProtoTTA — closest analog to niche-model weights;
  needs a prototype-update rule, unlicensed).
- sTTT (Su) names our transfer setting (sequential inference +
  adaptation) but does not change the C14-bar ruling on test-time
  firing (protocol framing; same channel).

## What would license transfer-side work

A mechanism aimed at HB-extinction with a rationale NEITHER gain-
modulation NOR target-selection NOR transplant-scaling — i.e., a
third unlearning mechanism (surprise and lossy are two; threat was
the third candidate and failed). The bar: direction-first (targets
HB specifically), falsifiable both ways, fresh bank. None known —
the map stays open, not empty.
