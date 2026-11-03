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
failure. Pairing rule (R800 — Moncada 2015, behavioral tagging):
persistence is SCHEDULED — weak tag + strong event nearby in time
or no capture. Check the schedule before judging the memory: no
strong event near the tag → no capture expected, verdict or not. Dominance ratio (R793 — Cui 2024, sufficient AND
necessary): measure the training ensemble's DOMINANCE in the
transfer context, not yes/no reactivation — tune dominance, tune
specificity; mossy suppression pairs with transmodulation as the
inhibitory counterpart. Context-overlap covariate (R792 — Doyle 2024): measure
encoding-stimulus overlap FIRST — gap-without-overlap is
encoding-coverage, never memory failure; the probe cannot judge
retrieval it never enabled. Interchange verification (R792 —
Geiger 2021): verify the encoder's abstraction by interchange
intervention (swap the representation, test the behavior), never
by correlation. No new probes, no new worlds, no re-scoring — a
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

Plasticity proviso (R793 — CODA-Prompt 2023): freeze the encoder
ONLY after end-to-end decomposition training — frozen keys that
never learned to decompose cannot serve new tasks. Separation
needs its own learning phase; a separation freeze without one is
pre-falsified. Decomposition protocol (R794 — Kirsch 2018):
routing AND modules learned jointly end-to-end (no diversity
forcing), freeze after specialization turns interpretable. The
proviso satisfied constructively — the training half found, not
invented.

Discovery framing (R793 — Scholkopf 2021, CRL): the
return-distribution abstraction is a causal variable to DISCOVER
from low-level observations, never assume — and interchange
intervention is how discovery is verified. The diagnostic's
primary measure inherits the field's central problem.

TTC re-reading (R799 — Clopath 2008, tag-trigger-consolidate):
acquisition TAGS (silent mark), transfer TRIGGERS (capture
event), retention CONSOLIDATES (late stabilization) — one model's
three phases, not three literatures. The diagnostic's job is now
FIND THE TAGS: which traces were tagged but never triggered
(acquisition without transfer opportunity), which triggered
without tags (transfer probes with nothing to capture). Cross-
tagging explains mixed cases. Six gating rounds re-read as six
attempts at the trigger phase of a cycle the program never knew
it was in.

Meta-transfer re-reading (R795 — Bengio 2019): adaptation SPEED
to sparse shifts as the meta-objective — correct structure =
changes concentrated in few mechanisms = sparse gradients. Every
transfer gap re-read as disentanglement data filed as failure:
the diagnostic reports WHERE the gradients concentrated, not
just whether transfer cleared the bar.

Late-phase proviso (R800 — Kleim 2004): synaptogenesis and map
reorganization arrive in the SLOW phase; fast-early refines
existing structure only. The program's 1792-tick phases may all
be fast phase — transfer tested on an early substrate, judged as
if late. Structure needs the slow phase; every transfer reading
carries this calendar proviso until a line runs long enough to
void it.

Transfer formalism (R792 — Barreto 2016, successor features): the
A→transfer structure (fixed dynamics, changing rewards) is the
successor-features scenario natively: carry dynamics-knowledge,
reweight rewards. The bar above "beat reset": performance
guarantees before any learning. No program line has met it; now
the bar is named, and the diagnostic tests successor-structure
transfer (does dynamics-knowledge cross?) separately from reward
reweighting (do the weights adapt?).

Fifth split voice (R792 — DualPrompt 2022, title record):
general-prompt shared + expert-prompts specific, rehearsal-free.
With ATC, successor features, Go/No-Go, and consequence classes,
shared-general + specific-expert converges across paradigms from
proposal to regularity — the program's gated rounds are the
anomaly to explain, not the baseline to extend.

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
