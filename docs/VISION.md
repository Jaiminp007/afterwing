# Afterwing's long-term goal

The goal is an artificial-life sandbox whose agents can learn from experience, improve their own learning, and eventually exhibit richer cognition. A future world could begin with two agents on Earth, expand to other planets, and support studies of adaptation, cooperation, culture, and societies over long periods.

Recursive self-improvement means an agent can propose and evaluate changes to its own learning or decision system. The current compact model changes acquired connection weights and evolves inherited traits; it does not yet redesign its learning algorithm. Human-like cognition and a planetary world are research aspirations, not capabilities demonstrated by this code.

Progress should be tied to observable milestones:

- A repeatable benefit from lifetime learning on held-out tasks, including a loss of benefit under memory reset.
- Persistent adaptation across changing tasks without losing earlier useful behavior.
- Bounded, checkpointable proposals for controller changes, assessed against independent evaluations and compute budgets.
- Richer bodies and environments only after the simpler models can be measured and explained.
- Population, social, and cultural studies with explicit models and controls. Results from artificial agents must not be presented as a recreation of actual human evolution.

The observatory supports this work by showing measured senses, actions, energy, family history, and interventions. The compact controller and the separate MaleCNS connectome runtime remain distinct model tracks.

The autonomous-learning implementation now supplies bounded parameter search,
engineered memory tasks, and a separate ecological transfer gate. Its fixed
proposal algorithm is external to the individual fly's controller. This is a
research step toward the vision, not an implementation of recursive algorithm
self-modification. Continual retention across distinct tasks is now met for the odor-taste skill (see the table).

A separate offline algorithm selector now has one prospectively accepted forecast-learning kernel revision, with migration from retained own experience and automatic self-application to its preference learner. This has not yet shown repeated improvements, better recursive-search productivity, or an embodied fly-controller benefit. See [the exact scope and audit](ALGORITHM_UPGRADE.md). The full RSI goal remains open.

## Milestone status (2026-11-14)

Full sentence-by-sentence audit: [VISION_COMPLETE_AUDIT_V1](VISION_COMPLETE_AUDIT_V1.md).

| Milestone | Status |
|---|---|
| Lifetime benefit on held-out tasks + loss under reset | Met |
| Persistent adaptation, within-task (changing codebooks) | Met |
| Persistent adaptation, across distinct tasks | Met for the odor-taste skill: orthogonal code keeps 104–109% of earlier tasks' skill vs 84–93% before, two banks ([results](M2_DISTINCT_RESULTS_V1.md)); survival unchanged |
| Bounded, checkpointable controller-change proposals | Met: proposals evaluated on fresh worlds under budgets; accepted revisions since 2026-11-11 ([RSI V1](RSI_SEARCH_RESULTS_V1.md), [V4](RSI_GUIDED_RESULTS_V1.md)). The accepted revisions improve a taste-prediction readout, not survival. In these worlds, taste skill does not change energy or survival ([review](fable-review/FABLE_REVIEW.md), H4) |
| Richer bodies only after simpler models are explained | Gate correctly shut (body transfer failed) |
| Population, social, cultural studies with controls | Met as studies: two first-generation inheritance channels, with stated bounds |
| Observatory and separate model tracks | Met |
| Recursive self-improvement | Not met. P5–P7 (2026-11-15) were scored by a surrogate evaluator (the fly's taste learner run on simulated tasting streams), on constructed staircase tasks, with hand-written primitive genes. On that setup, three parts are shown: learned search beats blind search on unseen problems ([P5](RSI_P5_RESULTS.md): 12/12 libraries, p = 0.00024); starting from blind moves only, the system invents moves and relies on them, +9.2 over the same training without invention ([P6](RSI_P6_RESULTS.md) C2); and the gain transfers to an unseen rule family, +14.9 ([P6](RSI_P6_RESULTS.md) C3). Two parts are not shown. Revising its own update rule (level 2) failed in P6 (p = 0.082) and in its replication P6b (p = 0.144). Benefit to the embodied fly failed in P7: better-found taste programs did not change embodied energy (A − B −0.03; [P6b/P7](RSI_P6B_P7_RESULTS.md)). Earlier: V4 passed a narrow demo: an improver reweighting a hand-written move menu beat the fixed one within one world family ([V4](RSI_GUIDED_RESULTS_V1.md)). The stronger three-criterion test failed in V5, V6 and V7. V6's row-level passes are withdrawn: they do not hold at the library level and come from one evidence-guided move in one library ([V5](RSI_V5_RESULTS.md), [V6](RSI_V6_RESULTS.md), [V7](RSI_V7_RESULTS.md), [review](fable-review/FABLE_REVIEW.md)) |

All measurable milestones except recursive self-improvement are met, within the bounds stated in each results doc.
Human-like cognition, planetary worlds and long-run societies remain research
aspirations, as stated above.
