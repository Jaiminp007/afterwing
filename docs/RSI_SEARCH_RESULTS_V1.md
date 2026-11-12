# Bounded self-improving search: results V1

Date: 2026-11-11. Script: `scripts/rsi-search.mjs`, evaluator
`learning/taste-program-eval.mjs`. Data (local, gitignored):
`evidence/rsi-search/run-20261111.{json,log}`. Wall time 42 minutes,
about 2,300 embodied worlds.

## Setup

- Level 0, the fly's taste learner. A program is {feature code: pairwise or
  identity, step size, replays per live update, memory size, prior}.
  Changing the code changes which odors share learned information, so this
  counts as a bounded learning-algorithm redesign, not just tuning.
- Level 1, the proposer. It holds weights for which dimension to mutate and
  which value to try.
- A revision is accepted only if the candidate beats the incumbent on 6 dev
  histories (mean gain > 0, at least 4/6 paired wins) and then again on 6
  fresh confirmation histories.
- After each search, the proposer rewrites its own weights from its own
  record of accepted and rejected proposals.
- Score = each surviving fly's own taste discrimination over tasks A, B and
  C at the end of C (acquisition and retention together).

## Results by gate

**(a) Successive accepted revisions: MET (2).** Both were found by the loop,
not by hand, and each was confirmed on fresh histories:

1. step 0.5 -> 4 (normal world, confirmation gain +0.178)
2. pairwise -> identity code (short world, +0.075)

The loop rediscovered the identity code from M2 without being told about it.

**(d) Learning-algorithm redesign: MET (bounded).** Revision 2 changes the
representation, not only a rate. The revision space itself is fixed and
hand-written.

**Proposer self-revision: happened.** v0 -> v1 -> v2. Mutation mass moved to
code and step, and value mass to identity and step 4.

**(b) Better subsequent search: NOT MET against the copy control.** Mean
final score on 3 held-out problems x 3 search seeds, budget 8:

| arm | mean final score |
|---|---|
| fixed proposer, default start | 0.329 |
| revised proposer, default start | 0.387 |
| fixed proposer, copied best program | 0.461 |
| revised proposer, copied best program | 0.461 |

The revised proposer beats the fixed one (most clearly in the normal world).
Copying the best program beats both, and searching from the copy finds no
further improvement except one replays change. The gain is explained by
carried knowledge, not by a better improver. The landscape has one
dominant direction (identity code with a large step wins in every world
tested), so there is little left to search for after the first discovery.

**(c) Embodied benefit: WEAK.** Best program {identity, step 4} vs default
on 32 fresh histories:

| measure | better / worse histories |
|---|---|
| taste skill (0.614 vs 0.432) | 31 / 1 |
| survivors (4.06 vs 3.75 of 24) | 15 / 7 |
| energy | 21 / 11 |

The skill gain is clear. The survival and energy gains are directional and
short of significance (sign test, p of about 0.07).

## Verdict

Bounded RSI is partially demonstrated: an autonomous loop made two successive
validated revisions to the fly's learning algorithm, one of them
representational, and revised its own search policy. Full RSI as gated is not
met. The improved search does not beat simply copying the improvement, and
the survival benefit is not significant. To pass (b), the revision space has
to keep producing new improvements after the first ones (a space that
compounds), for example operators that compose new feature codes instead of
choosing from a fixed list.
