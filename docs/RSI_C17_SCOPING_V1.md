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

- **Q3 surrogate-bank procedure:** exact probe protocol for max-turn
  propensity, norm-matching, bank size, billing through `m`.
- **Q4 direction-first bar:** pre-registered HB-only prediction
  (BH must stay flat), pooled-vote ban holds (cue-specific only),
  shuffled-control dose-match per the C7 CORRECTION precedent.
- **Q5 budget/caps:** mains count, tick caps, op caps, single attempt,
  fresh bank range — per C-series discipline (≤22 mains pattern).
- **Q6 verdict mapping:** GO only on HB lift > +0.10 with BH flat AND
  shuffled control null; else NOGO/INVALID per fail-closed rules.

## Verdict

SCOPED-CANDIDATE (Q1, Q2 closed). C17 remains UNLICENSED until Q3–Q6
close in a frozen plan. The C17-bar (genuinely new + non-pooled external-or-max +
direction-first) is provisionally met on paper: input-side (unmapped
locus), cue-specific external probe statistic, HB-first prediction.
No bank, no fixtures, no attempt authorized by this doc.
