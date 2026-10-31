# Turn-gate practice adjudication — contact gradients are endogenous; no exposure line licensed

Date: 2026-10-26. Read-only (zero new worlds, zero new seeds; frozen
rows from turn-gated-dev attempts 02–09 + frozen banks untouched).
Question: is the transfer floor (harm→ben stall ≈0.3–0.4 at 1×)
practice-limited (rare cues under-exposed) or rigid (cues unlearnable)?

## 1. HB contact gradient: +0.5, robust — but not causal

Pooled HB (train-harmful → test-benign) cues, uniform-seg1 arms,
8 lines × 3 pairs (n=60):

- Pearson r(correctness, log-contact) = **+0.505**, Spearman +0.492.
- Quintiles monotonic: 0.247 / 0.258 / 0.300 / 0.342 / 0.424
  (contacts 759→2276).
- Leave-one-line-out r = 0.450–0.568: no single line drives it.

## 2. BH gradient is opposite-signed: −0.75 → exposure is endogenous

Same pooling for BH (train-benign → test-harmful, n=58):
r = **−0.752**, mean correctness 0.202. Same-valence control
(benign→benign): flat (r=−0.03, turn rate 0.051 = baseline).

The opposite signs are exactly what behavior→exposure endogeneity
predicts and what practice-alone cannot explain:

- HB (test-benign): correct = cruise (stay) → more contacts. ✓ positive.
- BH (test-harmful): correct = turn (leave) → fewer contacts. ✓ negative.
- Practice-alone predicts MORE contacts help BOTH directions. BH
  rejects that (more contacts → much worse acquisition is absurd as
  a practice effect, perfect as endogeneity: stuck agents re-encounter).

Contact counts in frozen summaries are measured POST-behavior, so the
totals cannot identify a practice effect. The HB gradient is consistent
with "rare cues under-practiced" AND with "failed cues over-sampled by
stuck behavior" — the data do not separate them.

## 3. Gain test: the manipulable floor component is contact-orthogonal

If contacts were the binding constraint, an intervention that raises
learning-per-contact should substitute for contacts and FLATTEN the
gradient. Surprise-gain (attempts 07–09, n=19+19 HB cues) does not:

- Uniform seg1: r=0.668, mean 0.283.
- Gain seg1: r=0.677, mean 0.409 (**+0.126 lift, zero flattening**).

Gain lifts every contact level equally — the working channel is
independent of exposure. The residual floor keeps the same
contact-dependence, so the residual is not contact-explained either.
(Endogeneity-only predicted steepen-or-same + lift; observed same +
lift: consistent.)

## Verdicts (all negative-preservation; no new line)

1. **Noisy replay NOT licensed.** It was queued as an anti-overfitting
   probe, but the diagnosed problem is weak-signal/under-correction,
   not overfitting-from-too-much-exact-replay; nothing in this analysis
   suggests corrupting the few updates rare cues get would help.
2. **Naive exposure-extension NOT licensed.** The gradient that seemed
   to motivate it is endogenous (proof above), and V1d/V1e already show
   segments help but saturate — no new evidence for a further extension.
3. **No new experimental line this turn.** The practice-vs-rigidity
   question is NOT answerable from frozen summaries (no time-resolved
   per-cue data exists in any row; history = {seed} only).

## Specified next analytic (licensed, read-only, not executed)

Codebook geometry vs per-cue correctness on frozen banks: for each
transferred HB cue, correlate correctness with (a) distance to the
nearest conflicting-valence entry, (b) distance to its train-valence
prototype region. If hard cues are geometrically confusable, the
residue is discriminability-limited (instrument: perceptual, not
mnemonic). Codebooks reconstruct deterministically from frozen bank
seeds (no new worlds). That analysis — not a new line — is the next
step, preserving "last analytic step before any structural line."
