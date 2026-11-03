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

## Executed re-reading 1 (2026-11-02, read-only: code + bank + verdicts)

VERIFIED (code): transfer probes zero observation.cue and set
odorPresent=false (odor-routed-experiment step), same history/codebook
unpresented, new resource seed, 256 ticks, frozen current vs reset.
VERIFIED (code): viability = energy vs travel-cost (overlapGuard) —
odor-independent, so the gate functions in-probe; B1/B2 transfer
failure is NOT forced-stop-by-zeroed-odor.
VERIFIED (verdicts): transfer-current MINUS transfer-reset means:
R1 +0.42, R2 −1.20, R3 −0.52, R4 +0.40, R5 −0.70, R6 −0.95.
INFERENCE (licensed by the three verifieds): the transfer regime
differs from training in MODALITY, not just instances — odor-present
training, odor-free probe. Cue-trace retrieval is disabled by design
(cues absent; Doyle: no overlap → no retrieval expected), so the test
measures non-cue carryover only. Negative gaps = the D-config's
odor-present specialization ACTIVELY HARMS odor-free foraging
(interference, not forgetting) — strongest exactly where D was most
specialized (R2 rehearsal, R5/R6 gating), absent where it wasn't
(R1 plain, R4 student). The probe punishes specialization: gate-bug
cousin (Asok) — is odor-free robustness the right demand of an
odor-guided learner? Future lines: probe WITH odor (fair cue test),
or claim odor-free robustness explicitly (own falsifier), or accept
the gate-bug reading. The six NO-GOs stand; what they MEAN changed.

## Executed re-reading 2 (2026-11-02, read-only: spent R5/R6 traces)

Mean alive-fly energy per 256-tick bin, all 8 acquisition histories:
R5 53.0 → 28.9 → 21.3; R6 53.0 → 28.9 → 20.2 (early → mid → late).
No late plateau — still declining (late-mid slope ≈ −8 per 512
ticks). Consistent with the B4-gate base rate (97%-negative deltas):
the runs end mid-dynamics, never at equilibrium. The late-phase
proviso is unrefuted and sharpened: nothing in the traces suggests
1792 ticks reached the slow phase where Kleim-structure appears.
Calendar proviso stands.

R7 sharpening (2026-11-02 — R7-INCOMPLETE-EXTINCT): the colony
died at tick 1911/3584 under R1 conditions extended. The proviso
now has a precondition: SLOW-PHASE STRUCTURE REQUIRES SURVIVAL.
The question is no longer just "does structure arrive with time"
but "can the colony live long enough to find out" — persistence
(VISION-2) fails at the colony level before the memory level.
Any line invoking the proviso must first show survival to slow-
phase ticks under its regime; otherwise the proviso is not
unresolved, it is inapplicable.

## Executed re-reading 5 (2026-11-02, read-only: spent R1/R5/R6 traces)

Alive flies per 256-tick bin (24 founders, 8/8 histories each arm):
ALL arms hold 24 through bin 4 (ticks 0–1279), then collapse in
bins 5–6 — R1 ends [1–4], R5 [1–5], R6 [1–5], same cliff shape
everywhere. Mortality is a synchronized LATE CLIFF, not attrition;
head-independent (gated heads die no faster). Combined with R7
(dead 1911 in doubled-phase-B): lifespan limit ≈1300–1900 ticks
regardless of phase — the colony has a maximum AGE, and slow-phase
structure is unreachable not because phases are short but because
lifespan is short. Specification sharpened: lifespan extension
(slower burn / better intake economics) precedes slow-phase
structure. The next line must first keep agents alive past ~1900
ticks; only then does the slow phase exist to be measured.

## Executed re-reading 6 (2026-11-02, read-only: spent R1 traces)

Per-capita energy economics by phase (physical events, 8 histories):
A intake 0.0217 cost 0.0482 net −0.0265; B 0.0160/0.0479/−0.0319;
C 0.0126/0.0466/−0.0340 (events 98k→62k as flies die); D
0.1171/0.0492/+0.0679 (only ~6k events — remnant feasts). Costs
FLAT every phase (~0.048); intake halves A→C. The cliff is
STARVATION ECONOMICS, not senescence: fixed burn, declining
return; the D-feast arrives for a remnant too small to matter.
A survival line must fix the A→C intake decline (or the fixed
burn), not D — specified HOW, not just "live longer."

## Executed re-reading 7 (2026-11-02, read-only: spent R1 anchors)

Depletion vs efficiency, decided: food amount GROWS 332.7 → 433.3
→ 561.5 → 649.1 across A/B/C/D (fill 0.37 → 0.65; regrowth
outpaces use) while intake halves and all 18–20 deaths are
energy-caused. DEPLETION REFUTED — the colony starves surrounded
by growing food. EFFICIENCY COLLAPSE confirmed: the agents get
worse at finding food that increasingly exists. Mechanism
specified: per-phase resource reshuffling (new seeds each phase)
invalidates spatial memory every phase boundary while steering
acts on stale maps — re-acquisition lags reshuffling, intake
ratchets down, the colony bleeds out. HYPOTHESIS (not finding):
that is the transfer wound at within-run scale — one phenomenon
(transfer tax, rehearsal cost, starvation) in three clothes.
Discriminator, pre-registered: a line that preserves maps across
reshuffles must SIMULTANEOUSLY lift transfer-tax, rehearsal-cost,
AND starvation if unity holds; if it fixes one but not the others,
the wounds are distinct mechanisms and the unity claim dies.

## Executed re-reading 11 (2026-11-02, read-only: spent R1 D-anchor)

Uniform-pessimism attractor CONFIRMED — the shared attractor named:
all 24 flies' taste weights mean-negative (−0.40 to −1.29,
positive fraction only 0.27–0.46); present-bank likewise negative.
Plain TD on 97%-negative deltas teaches "everything is bad",
identically, in every seed: the convergent misdirection MECHANISM
(rule, not data). Transfer as uniform avoidance explains flat
transfer without invoking forgetting. Fixes specified (not
executed): (a) reward centering/baselining (subtract background
loss so deltas aren't 97% negative); (b) distributional encoding
(optimism survives in upper quantiles — Dabney); (c) separate
Go/No-Go matrices (positives learned where the negative flood
doesn't reach — Bogacz/A5).
A survival line fixes re-acquisition speed (or stops the maps
going stale), never the food supply.

## Executed re-reading 12 (2026-11-02, read-only: spent R10 D-anchors)

The flood has an ADDRESS. Go/No-Go weight means per history: Go
7/8 positive (−0.022 to +0.596), No-Go 8/8 NEGATIVE (−0.231 to
−1.099). The old uniform-pessimism (single matrix −0.40 to −1.29,
R11) did not disappear — it was SORTED: positives live in Go,
the flood lives in No-Go, uniformly, on every history.
Architectural separation HOLDS (each matrix learned what it was
shown and nothing else). What remains is purely readout price:
the difference carries the lesson but taxes acquisition (R10 5/8,
one short). Any next rationale starts here — the negativity is
confined, named, and measured per history, not a fog over the
whole palate.

## Executed re-reading 13 (2026-11-02, read-only: spent R10 rows + r1plain)

The acquisition price is HISTORY-idiosyncratic, not phase-owned.
Per-history centered-minus-R1 diffs (A/B/transfer): no phase
concentrates the losses (A 3/8 clearly negative, B 5/8, transfer
3/8 — different histories in each set). Extremes coexist:
3285880790 wins everywhere (+2.36/+1.19/+3.42), 3170855589 wins
transfer (+2.77) while bleeding acquisition (−1.59/−2.49 — carriage
WITHOUT preservation), and 1172370180 preserves acquisition (+0.64)
while losing transfer (−3.68 — preservation WITHOUT carriage). A
phase-gated readout fix is NOT licensed by this cut (ruled out, not
merely unscoped): the next rationale must be history-adaptive or
readout-global, or it is curve-fitting to phases.

## Executed re-reading 9 (2026-11-02, read-only: spent R1 anchors)

Weight-norm drift across A/B/C/D anchors (flies 1/10/11 shown,
pattern holds): taste 2.6–4.4 → 4.2–5.3 → 6.0–7.5 → frozen;
steering 0.004–0.021 throughout (near-zero); banks tiny;
absent-bank 0.0 until D. NO collapse anywhere — unlearning-by-
norm-decay REFUTED. Two findings instead: (1) R1 is taste-driven
with a VESTIGIAL steering head (the celebrated +0.42 rides on
~zero steering weights — the head never learned, the palate did);
(2) intake-per-accept halves DESPITE monotonically growing taste
norms → misdirection, not decay (confident wrong, or right
weights in a reshuffled world). Next specified step: direction,
not magnitude — do the grown weights point anywhere useful
(compare vs probe-successful rows, read-only)?

## Executed re-reading 10 (2026-11-02, read-only: spent R1 anchors+rows)

Mean taste-vector direction vs transfer outcome (8 histories, median
split on transfer-current energy): within-bottom-4 cosine 0.58,
within-top-4 0.38, across 0.28 — with mean norms EQUAL (5.58 vs
5.50). Failures learned just as much, in a SHARED wrong direction;
successes learned diversely. Anna Karenina with magnitude
controlled: convergent misdirection, idiosyncratic success. The
shared-wrong direction across different seeds points at the RULE
(shared update/architecture converging to one attractor), not the
data — fix the rule, not the bank. (n=8, descriptive; no claim
beyond the pattern.)

## Executed re-reading 8 (2026-11-02, read-only: spent R1 traces)

Stale-map by distance: REFUTED. Mean recommended distance by
phase: 44.2 → 41.4 → 41.7 → 43.2 (flat); accept-rate 0.53 →
0.58 → 0.54 (flat; D 1.00 = odor-free accept-all). Intake collapse
is NOT longer trips or fewer acceptances — intake PER ACCEPT
halves (0.041 → 0.028 → 0.023) while food grows. The wound is meal
quality/discrimination, not travel or choosiness. Next specified
step (not executed): anchor weight-drift across A/B/C/D
(taste-bank norms in spent anchors) — if taste weights collapse,
the mechanism is learned-taste unlearning, tying retention +
discrimination + starvation into one intermediates file.

## Executed re-reading 3 (2026-11-02, read-only: spent R1/R2/R5/R6 traces)

Pairing-rule schedule check (Moncada: strong events near tags?):
intake share by acquisition thirds — R1(+0.42) [0.47,0.31,0.22],
R2(−1.20) [0.41,0.30,0.30], R5(−0.70) [0.45,0.30,0.26],
R6(−0.95) [0.45,0.30,0.25]. All front-loaded; late share does NOT
separate positive from negative transfer (R2 highest late share,
worst transfer). NULL result, honestly recorded: intake timing at
third-granularity carries no transfer signal. Rule unrefuted (tags
unmeasured — thirds are not tag times) but unconfirmed; the
schedule check needs tag times, not bins. Front-loading everywhere
is consistent with re-reading 2 (early phase does the eating).

## Executed re-reading 4 (2026-11-02, read-only: spent R1/R5/R6 traces)

Pairing rule at tag granularity (Moncada: top-5% intake ticks within
±64 of phase boundaries 512/1024/1536): R1(+0.42) 0.182, R5(−0.70)
0.213, R6(−0.95) 0.213. Second null — no separation favoring positive
transfer (R1 lowest). Finding upgraded: the pairing rule is UNTESTABLE
on spent traces without a tag operationalization (phase boundaries are
candidate tags, not measured tags). The diagnostic's probe needs a
frozen definition of "tag" in trace terms before it can run — currently
unspecified. Two nulls banked; the rule stands unrefuted, unconfirmed,
and now precisely untestable-as-stated.

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
