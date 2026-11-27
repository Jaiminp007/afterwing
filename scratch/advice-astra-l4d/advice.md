# Stop L4-D at the oracle screen

Could a fly improve how it learns tastes without handing a direct learner the same advantage? In this four-odor culture, the best same-information direct learner beat even the oracle restricted to changing the meta-rate. Do not register this design. No held-out seed was run.

| Arm (best tuning setting in family) | Mean late flies, 3101-3116 | 3117-3132 |
|---|---:|---|
| NOREV, no taste update | 64.947 | Not run |
| FIXED, scalar alpha = 1/8 | 72.711 | Not run |
| Static heterogeneous steps | 61.365 | Not run |
| IDBD, initial alpha = 1/32, theta = 1/4 | 73.146 | Not run |
| AutoStep | 73.021 | Not run |
| RMS | 72.728 | Not run |
| DIRECT, reads the same delayed branch-loss score | 71.585 | Not run |
| BAYES-DIRECT, likelihood filter with public hazards | **81.854** | Not run |
| ORACLE3, true state but only a theta write | **74.808** | Not run |
| Full-alpha oracle, diagnostic only | 87.120 | Not run |
| META3, SHAM3, EVO-R3, RESET, factorial shadow | Not run | Not run |

**Oracle d4 = -11.618 flies** (paired SD 0.836), ratio **0.229x**, 0 positive, 16 negative, no ties. Exact one-sided sign-flip p = 65536/65536 = 1, using `docs/paper/stats.mjs` on integer contrasts and checked by enumeration. These are tuning statistics after selection. To clear 1.5x, ORACLE3 needed 86.426 flies. Against just locked IDBD it would have appeared to win at 4.82x, because IDBD gained only 0.435 fly over FIXED. There is no measured META3 d4, ratio, sign count or p. My probability of passing every gate in an independently run 48-seed final with the unchanged design is **below 1%** (judgment, not a power estimate).

**Design.** In each seed, two odors have volatile nutritional sign with reliable tastes; two have stable sign with noisy tastes. The groups swap roles 42-61 times. A fly uses a taste prediction to decide whether to pay a random price for food. L1 changes its prediction only through a per-odor gradient step. L2 uses IDBD to adjust that step from its prediction-error history. On a taste, L3 saves the predictions that two alternative L2 meta-rates would have produced. On the next taste of that odor it scores both predictions against the same observation. The inherited score sets L2's next meta-rate; it cannot set a feeding decision. These counterfactuals identify the one-step effect of an L2 write, not an effect on lifetime fitness. The endpoint uses World4's 100 late population counts, but this is a well-mixed culture, not the original spatial ecology.

**Why it fails.** The best constant rate for latent-probability prediction error was 1/32 in the stable role and 1/2 in the volatile role. Relative to NOREV, one population-tuned constant captured only 35.0% of the full-alpha oracle gain, but 78.7% of the theta-only oracle gain. The world gave different rates real value; restricting L3 to changing the *speed of IDBD* left little of it accessible. Even the full-alpha diagnostic had only +0.694 fly of d4 against BAYES-DIRECT. That diagnostic used hidden information and does not qualify as L3.

BAYES-DIRECT inherited four posterior probabilities per odor, used the public transition and noise laws but no latent labels, and projected its forecast onto a legal L1 step. No learner bypassed L1. No universal separation is possible: a direct rule can use the same delayed loss, step and trace to compute exactly the same next step as META3. A predeclared finite comparator class permits a claim *relative to that class*; it cannot invalidate the joint-state argument. Here even that narrower claim lacks oracle support.

**Exposure.** 79 arms on each of 3101-3116, 1,264 full cells; no extinctions or cap ticks. One NOREV, seven scalar rates, 12 static heterogeneous, 20 IDBD, eight AutoStep, six RMS, 18 DIRECT, three Bayesian direct, three theta oracles, one full-alpha oracle. `screen.json` lists every setting and mean; `tuning.ndjson` contains every seed/arm row. Four 256-tick control fixtures on 3101 were run twice before tuning; no fixture reached a late sample. No other ecological seed, registration, tracked edit or commit.

**Files created here:** `protocol.md`, `garden.mjs`, `experiment.mjs`, `check.mjs`, `started.json`, `tuning.ndjson`, `screen.json`, `audit.mjs`, `oracle.html`, `decisions.tsv`, `advice.md`.
