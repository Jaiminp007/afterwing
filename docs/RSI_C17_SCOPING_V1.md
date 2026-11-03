# RSI C17 SCOPING V1 (candidate: non-oracle input reassignment; NOT FROZEN)

Date: 2026-11-02. Zero worlds. Status: SCOPED-CANDIDATE. No bank built,
no fixtures, no attempt. Nothing here authorizes execution.

## Provenance

Two-round consult with gpt-6-astra (Codex harness), tasked with
transfer-time HB-lift mechanisms outside the closed families
(weight-revision C13/C15, pooled-vote inference C16, gain/target/timing).
Round 1 returned 4 mechanisms; round 2 adjudicated objections.
This doc records the outcome and the exact open items before any freeze.

## Kills (no worlds spent)

- **Mechanism 2 (persistent defensive dynamical state): KILLED
  zero-world, confirmed by consultant.** Transfer transplants weights
  into provably fresh agents: eligibility traces zeroed, experience
  buffers empty, ticks zero, motor pending null (all assertion-checked
  in `turn-gated-dev-v1*.mjs` `assertFreshTarget` + `taste-energy.mjs`
  terminal zeroing). Only weights cross the transfer boundary. Its own
  falsifier condition is met. No run.
- **Mechanism 4 (harmful-subspace projection): WITHDRAWN from C17 by
  consultant.** Under random 96-dim codebooks it has no justified
  HB-selective prediction (fails the direction-first bar). Rehomed to
  the input-side/DTR track: it needs structured/shared-feature cues to
  be explicit and testable — a new substrate, not a C17 run.
- **Mechanism 3 (external episodic inhibition): DEPRIORITIZED.**
  Consultant agrees the oracle version is compensation, not
  unlearning; the observation-driven variant is feasible but weaker
  mechanistically (installs the desired action directly). Shelf.

## Candidate: non-oracle input reassignment (mechanism 1, variant b)

Freeze weights. Maintain a cue-indexed memory of the agent's OWN
observed outcomes; permit surrogate reassignment only after direct
beneficial evidence for that cue, no pooling across cues. Surrogates
are fixed norm-matched vectors selected from frozen-controller probes
by max turn propensity across sampled states; retain only if
subsequent cue-specific outcomes support. Control: shuffled surrogate
assignments under identical evidence/exposure budgets. Prediction:
HB lift tracks correctly-indexed reassignment, not generic recoding.

## Scoping answers resolved (analytic, zero worlds)

- **Q1 observability: PASSES at aggregate.** Exact-transfer HB
  correctness ≈ 0.29 (V1m exact arm 0.2884) ⇒ ~29% of HB encounters
  already cruise, so intake evidence accrues on a minority of trials.
  Per-cue heterogeneity expected: 100%-turn cues yield no evidence
  ever (consultant-flagged limit, pre-accepted as a boundary).
- **Q2 learning-state during transfer: CLOSED 2026-11-02
  (analytic).** Plasticity is ON during transfer eval: candidate
  arm never freezes (`taste-experiment.mjs` freeze applies only to
  frozen/reset arms; `acquisition:true` default in
  `taste-energy.mjs:59`; no window gating for candidate). So the
  wound (HB ~0.29 exact) is measured WITH live learning — failure
  DESPITE ongoing plasticity. Freeze recommendation: keep the
  standard protocol (plasticity ON, matching all prior transfer
  legs — comparability preserved); the memory is an OVERLAY, and
  the shuffled control isolates the addressing effect from any
  generic overlay effect. The memory's value must come from
  input-addressability, not extra learning signal.

## Open items before any freeze (all must close)

- **Q3 surrogate-bank procedure: CLOSED at shape level 2026-11-02
  (analytic); numerics deferred to freeze.** (a) Bank: K fixed
  random 96-dim vectors, norm-matched to mean codebook-vector norm
  (magnitude preserved, only direction changes). (b) Probe: each
  bank vector presented to the FROZEN transplanted controller across
  S states sampled from the wounded policy's own transfer rollouts
  (ecologically valid, not a synthetic grid); turn propensity =
  fraction of turn decisions, mean over states, max-over-states
  reported as robustness diagnostic. (c) Selection: for a
  beneficial-evidenced cue, the bank vector with MINIMUM mean turn
  propensity (cruise-address). CORRECTION to the consult sketch,
  which said "maximum": maximum-turn would address beneficial cues
  to turn — the wound direction. Scoping adopts min-mean; the
  deviation is recorded here, not silently made. (d) Evidence gate:
  reassignment only after direct beneficial evidence for that cue
  (cruise + intake observed, threshold count deferred); no pooling
  across cues. (e) Retention: keep iff post-assignment
  cue-specific intake rate beats pre-assignment baseline, else
  revert to the original vector. (f) Billing: every probe decision
  billed through `m` like all inference (symmetric billing); memory
  read/write ops billed per op. Deferred numerics (K, S, evidence
  threshold, retention window, cap math) belong in the frozen plan.
- **Q4 direction-first bar: CLOSED 2026-11-02 (analytic).**
  Pre-registered conjunctive gates, all TRUE (same legs, same bank,
  same ticks as the exact baseline): (G0 applicability) the memory
  fires on >=1 HB cue (evidence gate reached); else
  INCOMPLETE-unfirable — the mechanism never engaged, a
  substrate-observability fact, not a negative on the mechanism.
  (G1 direction) HB lift > +0.10 on the correctly-indexed arm vs
  exact-transfer baseline. (G2 exclusivity) BH stays within +/-0.07
  of exact baseline (prior BH-noise band); pooled/general recoding
  ruled out by cue-specific firing. (G3 control) the
  shuffled-surrogate arm — SAME number of reassignments at the
  same ticks under the same evidence thresholds, only the target
  differs (random bank vector vs min-turn vector), per the C7
  CORRECTION dose-match precedent — shows HB lift <= +0.03; else
  the lift is generic-recoding and the unlearning claim is INVALID.
  BH-flat is a veto, not a secondary metric.
- **Q5 budget/caps:** mains count, tick caps, op caps, single attempt,
  fresh bank range — per C-series discipline (≤22 mains pattern).
- **Q6 verdict mapping: CLOSED with Q4 (see G0–G3 + retention).**
  GO iff G0+G1+G2+G3 plus train-side intact within noise; NOGO if
  G1 fails with G0 met; INVALID if G3 fails or dose mismatches;
  INCOMPLETE if G0 fails. Fail-closed throughout.

## Verdict

SCOPED-CANDIDATE (Q1–Q4 + Q6 closed). C17 remains UNLICENSED until Q5
closes in a frozen plan. The C17-bar (genuinely new + non-pooled external-or-max +
direction-first) is provisionally met on paper: input-side (unmapped
locus), cue-specific external probe statistic, HB-first prediction.
No bank, no fixtures, no attempt authorized by this doc.
