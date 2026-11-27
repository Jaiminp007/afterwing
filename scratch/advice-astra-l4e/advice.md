# L4-E: do not register

The question was whether a hierarchy can increase the gain from learning by 1.5x when every fly gets the same memory and compute. In this batch culture even an oracle that knows which food sign is favored next falls short. The single-level Bayesian learner gained 11.91 flies over FIXED. ORACLE3 needed a gain of 17.865 and delivered 15.27. I stopped at the tuning screen. No seed in 3217-3232 was run.

| Arm (number of tuning settings) | Mean late flies, 3201-3216 | Held-out, 3217-3232 |
|---|---:|---|
| NOREV (1); best FIXED (15) | 70.77; 70.77 | Not run |
| Constant L2 (24) | 72.70 | Not run |
| IDBD, AutoStep, RMS (36 each) | 70.46; 72.33; 72.19 | Not run |
| Hard and soft DIRECT (72 each) | 77.97; 78.78 | Not run |
| Quantized recurrent Bayes (6) | 69.38 | Not run |
| Finite-history Bayes (9), best at 12 tastes | **82.68** | Not run |
| ORACLE3 (12); full-write oracle (3) | **86.04**; 87.25 | Not run |
| Matched META3, inferred from identical DIRECT machine | 74.93 | Not run |
| SHAM3, EVO-R3, RESET, factorial shadow | No endpoints | Not run |

**Oracle d4 = -2.595 flies**, paired SD 0.998, ratio **1.282x**, 0 positive, 16 negative, no ties. Exact one-sided sign-flip p = 65,536/65,536 = 1. Even the full-write diagnostic fell short on all 16 seeds, d4 = -1.379, ratio 1.384x. These are next-taste oracles, not upper bounds on lifetime fecundity.

**Matched META3 d4 = -13.703 flies**, ratio **0.349x**, 0 positive, 16 negative, no ties, exact p = 1. This is a tuning result inferred without running an additional cell. With the best constant L2 substrate, the predeclared matched hard DIRECT configuration has identical bite and birth tables to META3 at every address. Both initialize identically. Its 16 measured populations therefore apply to META3 exactly. The independently tuned hard DIRECT family winner in the table uses a different substrate. Both p-values use integer contrasts in 1/200-fly units with `docs/paper/stats.mjs`; neither is confirmatory. Held-out d4, ratio, signs and p are unmeasured.

**Budget and mechanism.** One unsigned 16-bit word per fly holds a four-bit L1 taste prediction and 12 learner bits. Every bite costs two shifts, two bitwise ORs, and one 16-bit lookup. Each policy gets the same immutable 512 KiB bite table and 2 MiB birth table; the tables compile from public laws without seed data. Birth takes one lookup and resets the taste weight. Common feeding and demographic work cannot write controller state. Only the oracles receive a hidden-state bit; neither sees a future draw.

Food quality follows a hidden sign, rate of change, and change in that rate. L2 corrects its velocity estimate from consecutive tastes. L3 scores two contrary L2 predictions on the next taste, then changes how L2 carries that correction forward. The flat reader can use those same inherited bits to write the velocity directly. Another flat reader used its entire 12-bit memory for recent tastes and compiled the exact public posterior for that window. Thus a same-budget single-level learner **can** match META3, and a different one beat it here. A broad unknown lineage prior alone cannot prevent the first equivalence if inheritance stays fair.

**Fresh-final pass probability: 0% with these locks and the unchanged gates.** The selected FIXED transport is zero and the L1 weight starts at zero. FIXED and NOREV therefore produce identical populations on every possible seed. Their required positive lower-rung contrast cannot pass. This is an identity, not a power estimate. The oracle failure independently rules out recommending registration.

**Exposure.** 322 configurations on all 16 tuning seeds, 5,152 full cells. Two 64-pulse fixtures on 3201, neither reaching a late count. Of the full cells, 99 extinct colonies remained in the scores (all in losing settings), 66 before the late window. No cell hit the population cap. The endpoint averages 100 late colony counts in a constructed pulse-feeding culture, not the original spatial ecology.

**Files created:** `protocol.md`, `machine.mjs`, `culture.mjs`, `experiment.mjs`, `check.mjs`, `started.json` (every setting and seed), `tuning.ndjson` (every row), `screen.json`, `audit.mjs`, `oracle.html`, `decisions.tsv`, `advice.md`. No tracked edits or commits.
