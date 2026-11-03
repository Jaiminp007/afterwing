# CENSORING MEASUREMENT DEBT V1 (analytic, zero worlds)

Date: 2026-11-02. Source: R779 (Pan et al. 2026, CTPS — absence of
observed success in a time-limited episode is right-censoring, not
failure; progress estimates that ignore it bias).

## The debt

Every verdict gate in the program treats dead flies as zeros
(endpoint comparisons with survivors counted separately at best).
Deaths are right-censored trajectories: success unobserved because
observation ended, not because the policy failed. Gates that count
censored trajectories as failures bias against policies that keep
flies alive longer in hard regimes (they accumulate more exposure
to censoring) and bias toward policies that die fast with a few
early gains.

## The method (R780 upgrade — Goldberg & Kosorok 2012, censored Q-learning)

The debt graduates from complaint to bounded formalism: multistage
Q-learning with survival times as rewards, adjusted for censoring,
flexible stages, finite-sample generalization bounds, convergence to
optimal expected survival when the optimal Q-function is in the
approximation space. The first adopting line runs censored-Q on its
probes (new measurement, never a re-scoring) and reports whether any
closed margin changes shape — with bounds, not vibes.

## Standing recommendation (not a re-scoring license)

No closed verdict is re-scored under this note (anti-shopping
stands — the gates were frozen and the outcomes hold as recorded).
For FUTURE probes: record per-tick survival alongside energy;
report restricted-mean (time-to-success / time-to-death) curves
per arm; treat death as censoring in the transfer comparison.
The first line that adopts this becomes the test of whether any
closed margin (e.g., B1/B2 transfer gaps, R4's −0.57) changes
shape under survival analysis — a new measurement, not a
re-interpretation.
