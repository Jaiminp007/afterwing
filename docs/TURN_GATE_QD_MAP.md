# Turn-gate QD transfer map — BH is the binding constraint; actor-side hypothesis specified

Date: 2026-10-26. Read-only (zero new worlds; frozen uniform/gain seg1
rows, attempts 02–09, 33 episodes). Two analyses: the licensed geometry
follow-up (§1, inconclusive) and a QD illumination of frozen rows (§2,
new artifact + reframing). §3 specifies the next probe (not executed).

## 1. Codebook geometry: inconclusive (honest negative)

HB cues pooled (n=60) vs Hamming-distance proxies (12-of-16 entry
codebooks are dense: 51/60 cues sit at dConflict=1 — low predictor
variance structurally limits this test):

- dConflict (min distance to test-harmful entry): r = −0.204
  (WRONG-signed vs discriminability prediction; d=1: 0.325, d=2: 0.255).
- dCarry (min distance to train-harmful entries): r = +0.178
  (right-signed, far too weak to license anything, p≈0.17).
- dSupport: r = −0.056 (zero).

Verdict: discriminability-via-Hamming is NOT supported as the residue
explanation. The test is weak (coarse predictor), so this is
inconclusive rather than falsifying — but nothing here licenses a
perceptual line. Geometry moves to the back of the queue.

## 2. QD transfer map (retrospective archive of frozen rows)

Descriptor: (HB-correctness, BH-correctness) per pair-episode, 5×5 grid;
elite per cell = max (HB+BH)/2 with provenance. 33 episodes
(24 uniform + 9 gain seg1).

```
BH 0.8-1.0 |  .   .   .   .   .
   0.6-0.8 |  .   .   .   .   .
   0.4-0.6 |  .   .   .   .   .
   0.2-0.4 | 24  30  35   .   .
   0.0-0.2 | 18  28  34  39   .
             ------------- HB→
             .0  .2  .4  .6  .8
```

Elites: (0,0)=05uni .18 | (0,1)=08uni .24 | (1,0)=06uni .28 |
(1,1)=09uni .30 | (2,0)=07gain .34 | (2,1)=03uni .35 |
(3,0)=09gain .39 (HB=0.65, BH=0.13).

Readings (descriptive, frozen data):

- **7/25 cells occupied; the entire BH>0.4 region is empty.** BH
  acquisition (mean ≈0.20 everywhere) is the binding constraint —
  worse than the HB floor the program has been forensically examining.
  The floor is two-dimensional and we have been staring at the
  better axis.
- **Frontier trades off:** the best-HB episode (09gain, HB=0.65) has
  the WORST BH (0.13). HB gains do not transfer to BH; they may
  compete (turn circuitry shared? or exposure reallocation).
- **Gain holds the HB frontier** (cells 2,0 and 3,0) but only along
  the bottom row — it pushes extinction, not acquisition.
- **Archive value:** the 7 elites (with line/seed provenance) are a
  retrospective QD archive: future active search can mutate from
  elites, target the 18 empty cells (novelty), and use cell-occupancy
  as the diversity metric that V1d's herding failure lacked
  (47/48 stampede → archiveQD as the standard antidote, now
  initialized zero-world).

## 3. Specified next hypothesis: BH failure is actor-side (not executed)

BH pattern (cruise into newly-harmful cues at ~80%, re-encounter
without learning to turn, per the −0.75 endogeneity gradient) localizes
the failure to TURNING, not to valuing: the critic may well learn harm
(values drop) while the actor keeps cruising (policy inertia against
the greedy .5-threshold/.75-prior cruise default).

Discriminator (requires new instrumentation — future frozen plan):
log per-cue predicted values at seg end alongside behavior. Values
correct + behavior wrong → actor-side (fix: policy/threshold
plasticity). Values wrong → learner-side (fix: stronger negative
updates). Frozen rows contain neither per-cue values nor per-tick
streams (history = {seed} only), so this is NOT answerable read-only —
it is specified here to prevent a fourth blind analytic, not executed.

No new experimental line is licensed by this turn. Cumulative unchanged
(zero new worlds). No RSI claim.
