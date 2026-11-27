# L4-D adversarial review: do not register

1. **The comparison, not the positive META3 effect, breaks.** Against Gemini's locked DIR_Q_DIAG, the new held-out d4 is +1.80. Against the strongest flat learner selected on tuning, it is **-17.72 flies** (paired SD 1.75, seed-bootstrap 95% CI [-18.53, -16.87], 0/16 positive, exact one-sided sign-flip p=1). META3 gains 3.94 flies over FIXED; block Kalman gains 14.44. The ratio is 0.273x, not 1.5x. Even ORACLE3's d4 against block Kalman is -13.40, 0/16.

| Held-out arm, seeds 3417-3432 | Mean late flies |
|---|---:|
| Block Kalman, reset hazard .015, no inheritance | **102.73** |
| ORACLE3, supplied reward frame | 96.55 |
| Ungated block ICA + Autostep, inherited frame | 94.01 |
| Full raw Kalman, process variance .01, no inheritance | 93.36 |
| META3 | **92.22** |
| Ungated block ICA + Autostep, newborn frame reset | 90.68 |
| META3_RESET | 90.09 |
| AUTO | 89.96 |
| EVO_J25 | 89.84 |
| DIR_Q_DIAG, supplied reward frame | 89.71 |
| FIXED / META3OFF (two arms) | 88.28 / 88.28 |
| SHAM3 | 88.03 |
| Finite-history sphere Bayes, 16 tastes, approximate | 52.31 |

2. **The counterexample fits the budget.** Block Kalman compares the two public eight-bit blocks by predictive likelihood and mixes continued versus newly drawn coefficients. It gets only its own accepted `(odor, noisy taste)`, starts at zero, and never receives the active block, clock, or Q*. Its two covariance matrices, means, scratch vectors and odds use 161 doubles beyond the common predictor, fewer than Q alone (256). Mean elapsed time per field run was 11.5 s versus META3's 21.1 s under parallel load; this is not an exact FLOP match. If block knowledge or mixture updates are ruled out, full raw Kalman still gives d4 **-3.67**, 0/16, using only a matrix-times-error update. The short-chain Bayesian reader used the true one-boundary latent geometry and local elapsed times; its poor result is not a bound on Bayes.

3. **DIR_Q_DIAG discards the oracle's useful information.** It compresses each Q* column to `sum(q^4)`, so its raw diagonal cannot express signed off-diagonal couplings. RAWL2 also learns its rates on raw axes before applying them to frame axes. A flat reader using `dw = Q' diag(alpha) Q x delta`, with rates learned on `Qx`, reproduces ORACLE3's raw weights within 2.3e-15 across 256 unclipped fixture bites. ORACLE3 is an oracle-input diagnostic, not an admissible blind competitor.

4. **The mediation criterion fails.** Q contains reward directions, though not the current sign or mode. META3 reads high-pass taste weights **and their slow level**; step-size spread gates the rotation, but the signal does not measure whether an L2 decision improved later performance. Ungated ICA uses those weights without reading step-size differences and beats META3 with frame inheritance (d4 -4.65, 0/16). Both ICA arms retain L2 inheritance. Giving the flat learner its frame is fair when META3 inherits one. Grouping META3's own state into one transition exactly reproduces it; a meaningful comparator class specifies observations, resource bounds, inheritance, and named update rules, not the number of state labels.

5. **The endpoint holds; some control interpretations do not.** The endpoint averages 100 population samples at ticks 10,100 through 20,000, retaining extinctions (none occurred here). I found no Q*/mode read by META3. On seed 3401, rule, odor codes and patch layouts matched across four arms at 164 checkpoints, including a block change. Rule/patch RNGs are separate from behavior and mutation; taste noise shares the fly's behavior RNG, so different policies do not get identical bite noise. A birth fixture confirmed Q, maturity, beta and v copy; weights and eligibility traces reset. META3OFF matched FIXED population on every original and review holdout seed, **not** skill bit-for-bit. Component clipping breaks universal rotation invariance (12 versus 12.5 in a boundary fixture). P01 uses a static oracle, and with P01=P00 the reported “factorial” recycles d4. SHAM's permuted writes hurt AUTO by 1.93 flies, 16/16; RESET keeps rates indexed to a discarded frame. EVO has independent mutation RNG, E0, standing variation and tuning, but only birth-time rotations.

6. **Decision.** Do not spend a final bank. My fresh 48-seed all-gates pass forecast is **<1%** with the declared challengers, a judgment rather than a calibrated probability. A future L4 attempt needs a target-free L3 object and feedback on realized L2 performance. Predeclare budget and inheritance parity, gate the strongest named flat reader, use matched AUTO as P10, test clipping and birth remapping, and distinguish sham damage from benefit above no-write. An inherited representation-learning result can be reported separately.

**Exposure and files.** All 12 tuning arms ran on every seed 3401-3416: ICA inherited/reset each at .06/.16; full Kalman .01/.05 and RLS forgetting .95; block hazards .015/.06/.14; sphere windows 8/16. The 14 table arms ran exactly once on every seed 3417-3432 (224 cells). Short FIXED startup/timing and audit probes used 3401 only, including synthetic META3OFF and ORACLE3 updates. Earlier seeds were read from Gemini's artifact, never rerun. `arms.mjs`, `run.mjs`, `score.mjs`, `audit.mjs` are executable evidence; `tune-started.json`, `tune.ndjson`, `lock.json`, `held-started.json`, `held.ndjson`, `scores.json`, `audit.json`, `holdout.html`, and `decisions.tsv` are the record. No tracked edits or commit.
