# NONLINEAR STEERING HEAD — DESIGN V1 (candidate B, NOT AUTHORIZED)

Date: 2026-11-02. Zero worlds. Status: DESIGN ONLY — no license,
no bank, no code, no fixtures, no execution. Promoted by round-4
NO-GO (frozen falsifier: ARCHITECTURE, not signal). This doc scopes
the design space; a frozen dev plan comes only after the design
settles, then implementation, then fixtures, then one execution.

## Requirement (from the R4 falsifier)

The linear 2×D head cannot express the guard's viability gate:
guarded wins 5/8 while every learned variant (environmental,
rehearsed, guard-informed, behavior-cloned) loses to it by
~0.55. The new head must be able to represent a viability-gated
branch structure (go-iff-viable) while remaining billable,
checkpointable, freezable, resettable, and probe-compatible
(fork copies `state.steering.weights` — any new params must live
there with matching choose/validate/update).

## Candidate architectures

### B1 — Gated pair (recommended default)
Two 2×10 linear heads: `go` branch and `stop` branch, selected by
`guard.viable` (hard switch, computed — not learned — from the
same `overlapGuard`). When viable: action = argmax(go·phi); else
action = 0 (stop) with no learning update (acquisition-gated by
the same flag). Billing: values 2×(2·2·10) worst case + update
on the active branch only (same per-op rate). This is the guard
policy *internalized* as architecture rather than imitated as
behavior (R4) or informed as input (R3). Falsifier carries over:
if B1 still loses to guarded, the gap is not even branch
structure — candidate B as a family closes.

### B2 — Threshold units
Single head with learned thresholds on the viability scalar
(soft gate: sigmoid(k·(margin−θ))). More expressive than B1,
less interpretable, harder billing (exp ops). Fallback if B1's
hard switch proves too rigid in scoping.

### B3 — Small MLP (2-layer, ≤16 hidden units)
Most expressive, least interpretable, biggest instrument change
(caps on hidden size frozen at plan time). Last resort — licensed
only if B1 AND B2 both close with the gap intact.

## Addendum A1 (2026-11-02, zero worlds — supersedes the B3 sketch above)

R779 (Li et al. 2025, tiny RNNs): 1–4 unit recurrent networks match
larger nets on reward-learning tasks and are interpreted via dynamical
systems. B3 is therefore refined from "small MLP" to TINY RECURRENT
HEAD (1–4 units, recurrence over the feature stream, dynamics-
interpretable): expressiveness from recurrence, not width; billable
size; the viability-gated strategy linear heads cannot express is a
dynamical object (state-dependent switching), which is exactly what
recurrence represents natively. The MLP sketch is retained above as
the superseded record, not deleted. B3 still needs its fresh rationale
and remains queued behind its own gate (no B3 on gating grounds —
R6 falsifier stands); this addendum sharpens WHAT B3 would be, not
WHETHER it runs.

## Constraints (all candidates)

- Features stay the R3 10-dim set (guard channels included —
  B internalizes what R3 merely observed).
- Fixed curriculum (round-1 table): single-variable vs R1-learned
  is lost (architecture differs), so the comparator set must
  include R3-learned-guard too (input-only) to separate
  architecture from information cleanly.
- Frozen/reset/transfer probes unchanged (weights live in
  `state.steering.weights`; fork/validate/freeze/reset generalized
  by shape, not dim — same pattern as the R3 dim parameterization).
- Billing: 1 scalar op per op, honestly counted; caps from
  R3/R4 actuals × margin at freeze time.

## Open questions (close before any freeze)

1. B1 vs B2 vs B3 selection (default B1; B2/B3 need a reason).
2. Learning rule for the gated branches (per-branch delta rule
   mirroring the live update? frozen form TBD).
3. Acquisition gating semantics (no update when stopped — does
   the stopped branch starve? pre-register the answer).
4. Verdict mapping (transfer gate + retentions + beat-guarded?
   B1 internalizes the guard, so beat-guarded returns as the bar —
   frozen at plan time).

## What this is not

Not a plan (no frozen numbers), not licensed, not scoped for
execution. The next artifact is a scoping doc once the design
settles, following the R2/R3 pattern.
