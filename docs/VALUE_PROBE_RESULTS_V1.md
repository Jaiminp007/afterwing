# VALUE-PROBE Results V1 — ACTOR-SIDE (values know harm; behavior doesn't turn)

Date: 2026-10-26. Plan: `docs/VALUE_PROBE_PLAN_V1.md` (no amendments).
Bank: `evidence/value-probe-dev/fresh-01/` (6 histories, 421001–421054).
Evidence: `evidence/value-probe-dev/attempt-01/`. Single attempt, 9/9
mains, `redone: []`, ledger exact (9/0/16128/387072/1.43e9).

## Verdict: VALUE-PROBE-ACTOR-SIDE (→ threshold-plasticity freeze licensed)

- **G1 integrity ✓** — 9/9 complete, join ≥ 0.99 all rows, exact ledger.
- **G0 train-learned ✓** — train behavior gaps 0.819/0.815/0.817
  (replicates the V1 0.81–0.83 reference exactly; the triple learned).
- **G-validity ✓** — train-end probe value-correctness **1.0 × 3 pairs**
  (the readout reproduces known knowledge perfectly); unlearned d′ =
  **0 × 3** (criterion −1.47 = the always-cruise prior, as expected).
  The instrument reads values faithfully; the verdict is not a probe
  artifact. Null-hygiene clean (all arms zero manipulation tallies).
- **G-gap on BH: value 1.0 vs behavior 0.086 → gap +0.914** (bar >+0.2,
  value bar ≥0.6). All three pairs: values {1.0, 1.0, 1.0}, late-third
  avoidance {0.085, 0.056, 0.115}. Uniform — not a fluke, not a pair
  effect. **Values perfectly know harm; the actor cruises anyway.**

## The mirror: HB is learner-side (descriptive, pre-registered)

HB cues: value-correctness {0, 0.33, 0.33} (values still say harmful —
the carried prior persists IN VALUES) vs behavior ~0.49–0.51 all pairs.
Behavior runs AHEAD of values on HB (extinction expresses behaviorally
before values flip), while on BH behavior LAGS values completely. The
double dissociation predicted by the prior-strength analysis is
confirmed in both directions:

- BH (acquire avoidance): learner knows (1.0), actor won't (0.09) →
  policy/threshold block. The floor is downstream of values.
- HB (extinguish avoidance): learner doesn't know yet (0.22), behavior
  half-knows (0.49) → value-side lag + behavior lead. Mixed, as
  predicted (HB partial −0.17 value-side component).

Single-knob hope stays dead (same conclusion, new evidence): the two
floors have opposite value/behavior orderings, so no uniform
value-knob fixes BH and no uniform policy-knob fixes HB.

## Program moves (licensed, not executed)

Per the frozen plan, ACTOR-SIDE licenses freezing (never executing) a
threshold-plasticity line: uncertainty-gated switching between carried
policy and live values (Daw 2005 arbitration signatures as readout),
i.e., plasticity in the ACTOR (threshold/criterion), not the critic.
HB's value-side lag separately licenses the associability-reset freeze
(Mackintosh arm). Both freezes are future turns. Cumulative 7638 + 9 =
7647 (+9 ledgered; per-line authoritative). No RSI claim.
