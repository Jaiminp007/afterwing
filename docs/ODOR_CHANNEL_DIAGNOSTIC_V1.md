# ODOR CHANNEL DIAGNOSTIC SPEC V1 (re-analysis, zero new worlds)

Date: 2026-11-02. Status: SPECIFIED, not executed. Source: R789
(Mukherjee 2019 — NMDAR creates stimulus-specific memory, LTCC
maintains it; maintenance-without-specificity = generalization).

## Question

Which channel failed in R1/R3/R5/R6: the specific channel
(NMDAR-like — stimulus-specific memory never formed, so nothing
specific could transfer) or the general channel (LTCC-like —
specific memory formed but maintenance generalized it away)? The
six rounds' verdicts (transfer gaps + retention ratios) cannot
distinguish these; the distinction decides what any reopened odor
line must fix.

## Method (read-only, spent rows only)

Re-read the recorded transfer probes (5 modes) + A/B retention
rows from R1/R3/R5/R6 evidence: classify each arm's retained
behavior as specific (transfer-current ≈ transfer on trained
contexts only, sharp context tuning) vs generalized (flat transfer
across contexts, specificity lost). Reactivation probe (R790 —
Tayler 2011): test whether transfer contexts reactivate the
training ensemble's trace (probe-response similarity) —
reactivation failure is the specific form of general-channel
failure. No new probes, no new worlds, no re-scoring — a
diagnostic overlay, not a verdict change.

## Structural answer (R790 — Stooke 2020, ATC decoupling)

If the diagnostic finds entanglement (one head carrying both
channels), the specified refactor is separation, not another
gate: representation learned contrastively and frozen, policy
learned reward-driven on top. Multi-task encoders generalizing
downstream is the existence proof. This supersedes gating as the
default next operation — gate only what separation cannot divide.

Encoder specification (R791 — Liu 2021, return-based contrast):
the representation channel learns return-DISTRIBUTION structure
(aggregating similar-return state-action pairs = the abstraction),
the policy learns on top. This fuses decoupling with the
distributional voices and the 97%-negative landscape: abstract the
returns, then act. Any separation freeze names its contrastive
rule and its return-aggregation, or it separates nothing.

Gate redirect (R791 — Zhang 2017, rethinking generalization):
memorization and generalization coexist, so transfer gates must
test the ENCODER's abstraction (return-distributions), never the
policy's specificity. A verdict that punishes policy memorization
misreads deep learning; the diagnostic reports encoder-abstraction
as its primary measure.

## Null to rule out (R790 — Asok 2019, adaptive generalization)

Before any failure classification: rule out the gate bug —
generalization as adaptation (appropriate response to non-identical
contexts) punished by a specificity-demanding gate. The diagnostic
reports adaptiveness-vs-failure as its first cut; a gap that is
the system working must not be filed as the system broken.

## What it licenses

If the failure is specific-channel (nothing specific formed):
fix acquisition (the B-lane was right to look at learning).
If general-channel (specifics formed, maintenance generalized):
fix consolidation/maintenance (the B-lane looked in the wrong
place — the stop hypotheses were never the problem; the keeper
was). Either way the next odor line starts from a classified
failure instead of a measured gap.
