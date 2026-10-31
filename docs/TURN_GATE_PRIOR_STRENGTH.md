# Turn-gate prior-strength dissociation — overshadowing null, LI/PH split, two-track program

Date: 2026-10-26. Read-only (zero new worlds; frozen uniform-seg1 rows,
attempts 02–09 + frozen train weights). Two batteries: the round-21
Kamin top-move (per-channel overshadowing on frozen weight vectors —
NULL) and a train-pre-exposure battery (STRONG dissociation).

## 1. Overshadowing battery: null (honest)

Phi encoding recovered: taste phi = [1, 4 linear bits, 6 pairwise, 4
triple, 1 quad] = 16 dims (orthogonal config); rows carry full
taste/actor vectors per agent, so per-bit carried votes are exact.
HB cues (n=60), carried train weights:

- r(correctness, carried total) = +0.133; harm-vote +0.177;
  benign-vote +0.167 — right-signed, weak. Prior strength matters
  slightly; not the story.
- r(correctness, vote CONCENTRATION) = **+0.076** — the Kamin
  prediction (blocked/redundant channels carry the error) FAILS.
- r(correctness, harmful-NEIGHBOR anchor) = **+0.053** — the elemental-
  interference version FAILS too.

Elemental concentration does not explain the floor. The weights source
is validated (meaningful votes, right signs) and stays open for other
questions — but overshadowing is out.

## 2. Pre-exposure battery: LI/PH dissociation (strong)

Per-cue TRAIN contacts vs seg1 correctness, controlling test contacts
(prevalence path):

| direction | raw r | partial (∣testC) | LOO range | quintiles |
|---|---|---|---|---|
| HB (fear→benign) | −0.221 | **−0.173** | −0.12…−0.26 | flat then q5 dip 0.25 |
| BH (liking→harm) | +0.240 | **+0.535** | +0.48…+0.58 | monotonic 0.18→0.22 |

HB: more aversive pre-exposure → harder extinction (latent-inhibition-
like, modest). BH: more appetitive pre-exposure → FASTER harm learning
(Pearce-Hall-like, strong, raw=log robust). Same manipulation,
opposite effects — a textbook double dissociation:

- BH: strong prior liking + harm violation = LARGE error → fast update.
  The rate scales with prior strength (+0.54). Prior strength is an
  engine, not a brake.
- HB: strong prior fear + benign violation = slow update anyway
  (−0.17). Appetitive learning is intrinsically slower (negativity
  bias: bad is stronger than good) and strong harm priors retard it
  further (LI).

## 3. Unification: why both floors coexist

- BH level (mean 0.20) with fast prior-scaled value learning (+0.54)
  = values learn, BEHAVIOR doesn't follow → the actor-side hypothesis,
  now supported by mechanism (this doc) + measurement (SDT, round 23).
  Doubly licensed.
- HB level (0.33) with slow value learning (−0.17) + stuck behavior =
  mixed: value-side AND actor-side components.
- Gain's BH failure reframed: gain multiplies errors, but weakly-liked
  cues' violations stay sub-threshold FOR THE ACTOR — consistent with
  actor-side (a value knob can't fix a policy block). The frontier
  trade-off (best HB ↔ worst BH) is two different blocks, not one.

## 4. Program moves (specified, not executed)

Single-knob hope is dead: HB needs VALUE-side help (associability-reset
/ antiprior / appetitive-boost line — Mackintosh arm of round 21),
BH needs ACTOR-side help (threshold-plasticity line — Daw/SDT arm of
round 23). The next freeze is one of these two (actor-side
instrumented test first: per-cue values + d′/c, all specified in
TURN_GATE_QD_MAP §3). No line licensed by analysis alone. Cumulative
unchanged. No RSI claim.
