# ACQUISITION GATING CASE V1 (candidate, unlicensed — zero worlds)

Date: 2026-11-02. Status: CASE SPECIFIED, not scoped, not frozen.
Source: R783 (van Swieten & Bogacz 2020 — motivation scales both
choice AND plasticity; formal framework, first of its kind).

## The untested axis

Every gate in the program modulates CHOICE (act/stop, go/no-go).
None modulates the LEARNING RATE by motivational state. The
candidate class: acquisition-gating — plasticity gain as a function
of hunger (desired-minus-current resource): learn fast when hungry
(high need = high value of information), consolidate when sated
(low need = protect what holds). This is distinct from:
- threshold-tuning (Wu S6K, R782 — acts on ACTION threshold);
- viability-gating (R3–R6 — acts on action SELECTION).
Those gate what the learner DOES; this gates how fast the learner
CHANGES.

## Frozen-form candidate (R784 — Bogacz 2017)

Utility = hunger-scaled positive consequences minus effort. The
gain function takes this form: multiply the positive (reward) term
by the hunger scalar, leave the effort/discount terms unscaled,
with hard bounds so gain cannot explode the weights. The ceiling
of the class (not its entry): meta-plasticity — the gain itself
as a learned parameter, after dopamine neurons that learn their
own activity level. Architecture rule (R785 — Ben-Iwhiwhu 2022,
modular neuromodulation): gain lives in its OWN module beside the
actor, never entangled in the policy weights. A scoping starts at
the fixed-gain form and must earn the learned-gain form.

## What a case needs (not a plan)

A future scoping must name: the gain function (frozen formula of
the hunger scalar → plasticity multiplier, with bounds so gain
cannot explode the weights), the billing (gain application cost),
and the falsifier (no transfer lift vs the ungated twin at matched
budgets = close; lift without retention = the retention⇏transfer
dissociation again, close with cause). Until then this is a
specified case, not a queue entry.
