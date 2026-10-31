# TURN-GATE status (cue-conditioned turning, now transfer)

V1 GO (replication, 0.81-0.83, unlearned flat). Adjudicated: V1 phases use
DISJOINT cue sets (A:0-3, B:4-7, C:8-11) with per-history shuffled valences —
so V1 already proved cross-context learning; untested is SAME-agent transfer
to a NEW history (new codebook shuffle; frozen V1 rows: 6-7 flipped cues of
~9 decisive shared per pair; optimal disjoint cover totals 19).

- 2026-10-26: `docs/TURN_GATE_PLAN_V1.md` FROZEN (DESIGN ONLY). Verified
  read-only: 10 arena contexts; S-GATE symmetric billing precedent;
  transfer 0.0 zero-control. Instrument: same join collector as CUE
  (cue+action+intake per tick, no new engine code).
- 2026-10-29: Phase-A EXECUTED → **GO**. G1 join 1.00 everywhere; G2a
  turn|harm−turn|ben 0.81–0.83 on 6/6 histories (bar ≥0.5); G2b unlearned
  flat ≈0.00. 12 mains, all caps, no crash, no resume.
- 2026-10-30: Phase-B FROZEN as `docs/TURN_GATE_PLAN_V1B.md` (cross-history
  transfer via in-memory checkpoint-carryover: 3 pairs × (train + transferred
  test + unlearned test) = 9 mains on fresh bank 407001–407054 verified
  clean — 406xxx held in reserve for V1c; G1 transplant-integrity +
  G0 training gate + G2a ≥0.3 transfer gap + G2b unlearned flat) +
  `docs/TURN_GATE_PLAN_V1B_AMENDMENT_A1.md` (pre-execution: pairing-rule
  fixture replaced by transplant-integrity-checker unit; experiment
  unchanged). Instrument + fixtures green, triage clean, bank built.
- 2026-10-31: Phase-B EXECUTED → **GO**. G1 join 1.00 everywhere; G0 train
  0.8128/0.8239/0.8170; G2a transferred mean 0.5779 (0.5178/0.5469/0.6689);
  G2b unlearned ≈0.00. 9 mains, all caps, no crash on rows; 1-token
  post-run bookkeeping NameError fixed separately + resume scored with
  zero rows recomputed (dual provenance). See
  `docs/TURN_GATE_RESULTS_V1B.md`. V1c probe under its own frozen plan —
  implemented (see Phase-C IMPLEMENTED below), not yet executed.
- 2026-10-31: Phase-C FROZEN as `docs/TURN_GATE_PLAN_V1C.md` (DESIGN ONLY).
  Read-only post-hoc of frozen V1b rows: transfer tax = uncorrected-flip
  residue (same-val 0.94–0.95, flipped 0.51–0.62, train-self 0.91).
  V1c replicates V1b design on fresh bank 408001–408054 (moved from 406xxx
  by Amendment A2; re-verified clean at build) with identical gates +
  pre-registered DESCRIPTIVE flip-split (same-val ≥0.85 AND flipped in
  [0.4,0.7] confirms mechanism; full relearning or pure replay falsifies
  it).
- 2026-10-31: Phase-C IMPLEMENTED (`scripts/turn-gated-dev-v1c.mjs` +
  `tests/turn-gated-dev-v1c.test.mjs` 8/8 green; triage at 6-pristine
  baseline; bank `evidence/turn-gated-dev/fresh-03/` built 408001–408054
  post-fixtures). Amendments pre-code: A1 flip-split metric = contact-
  weighted correctness (band unchanged; gap-scale would misfire) + A2 bank
  range + reserve-masking rule (never print literal future ranges) +
  bank-test lifecycle conversions (V1b test → post-spend refusal per RSI
  precedent; V1c test → post-build refusal + read-only bank checks).
- 2026-10-31: Phase-C EXECUTED → **GO, mechanism CONFIRMED**. G1 join
  1.00 everywhere; G0 train 0.813/0.830/0.809; G2a transferred mean 0.609
  (0.519/0.739/0.567); G2b unlearned ≈0.00. Flip-split replicates V1b
  structure on the fresh bank (same-val 0.941–0.952, flipped 0.527–0.682;
  both falsifiers avoided; lens-consistency within pairs). 9 mains, all
  caps, single clean run (`redone: []`). Mechanism PROMOTED to replicated
  finding (V1b+V1c, n=6 pairs, two banks) — not an intervention, not RSI.
  Next: extended-run / IB-capacity / GS-hyperparameter probes under their
  own frozen plans — not started.
- 2026-10-31: Phase-D FROZEN as `docs/TURN_GATE_PLAN_V1D.md` (DESIGN ONLY).
  Plastic-vs-rigid adjudication: 12 mains (train + transferred-seg1 gated
  V1c-replication + transferred-seg2 descriptive exposure-doubling via
  second transplant of seg1-end weights + unlearned) on fresh bank
  409001–409054 (verified clean pre-freeze, 0 hits; re-verify at build).
  Continuation impossible (runs terminate at phase end) so seg2 = fresh
  run + transplant. Interpretive bands pre-registered (≥0.85 converged /
  [0.4,0.7] rigid / <0.4 degraded), non-gating by necessity (first 2×
  measurement). Next: implement, then single attempt.
- 2026-10-31: Phase-D IMPLEMENTED (`scripts/turn-gated-dev-v1d.mjs` +
  `tests/turn-gated-dev-v1d.test.mjs` 8/8 green; triage at 6-pristine
  baseline; bank `evidence/turn-gated-dev/fresh-04/` built 409001–409054
  post-fixtures). Seg1 rows persist weights (second-transplant source);
  scorer requires seg2 triple fail-closed; seg2Summary/classifySeg2 pure +
  tested (CONVERGED/RIGID/DEGRADED/INDETERMINATE + delta). Bank test →
  post-build refusal + read-only bank checks.
- 2026-10-31: Phase-D EXECUTED → **GO, PARTIAL CONVERGENCE**. G1 join
  1.00 x12; G0 train 0.827/0.833/0.826 (4th replication); G2a seg1 mean
  0.548; G2b unlearned flat. Seg1 mechanism replicates (3rd time). Seg2:
  flipped +0.08/+0.12/+0.19 everywhere (mean 0.587→0.709), classes
  INTERMEDIATE/RIGID/INTERMEDIATE — tax shrinks ~1/3 per doubling,
  neither hypothesis fully supported. 12 mains, all caps, `redone: []`.
  Two documented patches: (1) pre-run 1-line seg1-weights fix after
  pair-0 crash, partial dir removed, restarted clean (single
  provenance); (2) post-run classifier INTERMEDIATE branch + analytic
  string-only relabel (numerics verified identical). Tax = slow-to-
  correct residue. Next: V1e 4x/asymptote probe (may gate on
  convergence) under its own frozen plan — not started, no RSI claim.
- 2026-10-31: Phase-E FROZEN as `docs/TURN_GATE_PLAN_V1E.md` (DESIGN ONLY).
  Vanish-vs-floor adjudication: 18 mains (train + seg1 gated + seg2/seg3/
  seg4 descriptive via 3rd/4th transplants + unlearned) on fresh bank
  410001–410054 (verified clean pre-freeze, 0 hits; re-verify at build).
  Seg1-gated verdict (comparability); convergence gate DECLINED with
  pre-registered reasoning (extrapolation predicts seg4 ~0.84 borderline;
  trajectory more informative than threshold; descriptive CONVERGED
  answers the question either way). Trajectory prediction recorded:
  ~1/3 closure per doubling. Next: implement, then single attempt.
