# Do not register L4-C

The question was whether measuring the causal yield of an L2 write gives META3 an advantage that an equally informed proposal scorer cannot capture. The season oracle failed the headroom screen. I stopped without running a held-out seed.

| Arm (highest tuning mean within family) | 2701-2716, mean live flies | 2717-2732 |
|---|---:|---|
| FIXED deck | 54.738 | Not run |
| Scalar L2, decay .03 / boost 12 / cap 60 | 57.180 | Not run |
| PAIRX, gain 1 | 57.532 | Not run |
| Transition memory, gain 8 | 57.495 | Not run |
| Static kernel, spread strength 4 | 57.269 | Not run |
| DIRECT, soft overlap gain 4 | **57.567** | Not run |
| Oracle, strength 4 | 57.093 | Not run |
| META3 / SHAM3 / EVO-R3 / RESET / factorial shadow | Not run | Not run |

**Oracle d4 was -1.889 flies**, SD 2.054, with 3 positive, 13 negative and no ties. Exact upper-tail sign-flip p = 65433/65536 = .99843. Gain ratio was **0.832x**, not 1.5x. DIRECT gained 2.829 flies over FIXED; the oracle needed 58.981 and reached 57.093. Even against scalar alone, oracle d4 was -1.308. These are tuning statistics after selection, not confirmation. There is no measured META3 d4, ratio, sign count or p.

**What failed.** Targets shared one receptor in one season and excluded both in the other, inside a hidden four-receptor patch. Each seed experienced both seasons. Every arm received the same randomized assignment/yield records generated from its own common-garden ancestry; no population-wide score was broadcast. Per garden, 5,000 shared calibration ticks preceded 5,000 on-policy assay ticks. The endpoint averages 100 assay population samples, not 100 samples from a single uninterrupted late population.

On one third of eligible validations in expectation, a fair coin assigned a reinforce or spread write, held for 120 ticks. Only 163 of 2,984 randomized windows yielded any newly proposed, validated mask. Reinforce versus spread yielded .077 versus .054 validations/window in the reuse season, but .045 versus .045 in the exclusion season. The probes used strength 20; the strength-20 oracle also failed (d4 -2.055). Changing target overlap did not reliably reverse the useful write. Even letting hindsight pick strength, direction **or no extra write** separately per season gave 57.500, d4 -1.481. Oracle telemetry verified 9,508 correctly routed assay writes; no garden went extinct in the corrected screen.

DIRECT read exactly those assignment-labeled, discounted yield estimates at proposal time. Its best variant only mildly tilted overlap versus disjoint proposals on top of the locked scalar. It exceeded the season oracle by 0.474 flies on tuning. This is **not** evidence it empirically matches META3: that comparison was deliberately not run. It is evidence against a useful payoff from this choice of write. I would put the unchanged design's chance of passing all gates on a fresh 48-seed final at **under 1%** (subjective, not a power estimate or an oracle upper bound).

**Exposure.** 28 arms x 16 tuning seeds = 448 valid cells: FIXED; six scalars; three PAIRX; three transition; six DIRECT (three gains x hard/soft); six fixed kernels (two directions x three strengths); three oracles. `screen.json` gives every setting/mean; `rows.ndjson` gives every paired result. An earlier 448 cells on the same seeds were invalid: the outcome array overwrote the fly's `y` coordinate, preventing feeding. Every outcome was zero; no policy effect informed a change. The invalid rows and code are preserved separately. Partial diagnostics used only 2701: synthetic META3/SHAM-write, RESET and DIRECT checks, broken-versus-base scalar movement for 601 steps, and a corrected 5,000-tick common calibration. The failed worker-launch attempt ran no cells. No other ecological seeds, tracked edits, or commits.

**Files created**, all in this directory: `protocol.md`, `base.mjs`, `world.mjs`, `experiment.mjs`, `check.mjs`, `inspect.mjs`, `plot.mjs`, `decisions.tsv`, `records.ndjson`, `rows.ndjson`, `screen.json`, `diagnostics.json`, `margin.html`, `advice.md`; `invalid-coordinate/{world-before-fix.mjs,records.ndjson,rows.ndjson}`.
