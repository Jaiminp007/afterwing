# L4-F stopped at the oracle screen

**L4 is not shown.** The best mapping from true deme tempo to the L2 update gained 4.43 live flies over FIXED. The strongest single-level learner gained 13.92, so the oracle needed 20.88. Even against the best constant alone, the oracle reached only 1.073x its gain. No META3, donor-deme SHAM3, RESET, factorial, or held-out run was licensed.

Four demes began with 18 flies each. Each generation lasted 80 odor encounters. The hidden food rule was a signed pair among 12 bits. The fast and slow demes redrew it with probabilities 1/64 and 1/640 per encounter. Pairs of demes exchanged tempos with probability 1/8 per generation. Across the 16 worlds, 990 fast and 84 slow redraws occurred. Feeding profit determined local fecundity. Five percent of juvenile slots attempted migration, favoring more productive foreign demes. The endpoint was total live newborns averaged over generations 13 to 24, not prediction accuracy or a spatial-ecology replication.

L2 used the original L3-V taste, validation, alpha decay, and boost code. The proposed L3 would inherit only six parameter weights. Credit would go to the setting whose actual L2 prior predicted the next newly validated admission. Its reusable state contained no target bits. The oracle knew tempo but not which pair to propose.

| Family | Winning setting | Mean late flies |
|---|---|---:|
| NOREV | No L1 | 61.58 |
| FIXED | Uniform | 63.70 |
| Constant L2 | delta .06, beta 20 | 67.83 |
| EVO-R3, standing variation | Birth mutation .15 | 67.28 |
| Surprise-reset | .06, 20; threshold .5 x uniform | 67.86 |
| IDBD-style | Initial .06, 4; meta step .5 | 67.99 |
| Finite-history Bayes | 32 tastes; no uniform mixture | **77.63** |
| ORACLE | Slow (.006, 4); fast (.06, 20) | **68.13** |

EVO's predeclared constant-genotype fallback scored 67.83. Bayes used past noisy tastes and the public transition law, not true tempo or target. It steered the same six-candidate L1. It recorded 27,133 correct admissions to the oracle's 7,957 across the 16 seeds. These totals include differences in population size.

**Oracle d4 = -16.456 flies**, paired SD 3.673, range -22.667 to -9.333. Ratio of mean gains **0.318x** against the required 1.5x. Signs: 0 positive, 16 negative, 0 ties (11 positive required). One-sided exact sign-flip p = 65,536/65,536 = 1 using `docs/paper/stats.mjs` on integer contrasts in units of 1/24 fly, independently checked by exhaustive enumeration. This is descriptive after tuning, not confirmatory.

**Exposure:** 73 configurations on every seed 3301 through 3316, 1,168 complete endpoints. The six constant runs also supplied the six diagonal cases among the 36 oracle mappings. No extinct colonies were excluded. The scripted taste fixture used 3301 twice, without an ecology endpoint. Seeds 3317 through 3332 were untouched. All candidates and all census rows are in `started.json` and `tuning.ndjson`.

**Fresh-final pass probability:** 0% under the hard-stop protocol, because no final can run. If the stop were waived, my judgment is below 1%, not an empirical power estimate; the learned controller was never measured. The result closes this attempt, not the question of whether some other ecology could support mediation.

Files created here: `protocol.md`, `ecology.mjs`, `screen.mjs`, `started.json`, `worlds.ndjson`, `tuning.ndjson`, `result.json`, `audit.mjs`, `decisions.tsv`, `oracle.html`, and this report. No tracked edits or commits.
