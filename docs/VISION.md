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
self-modification. Continual retention across distinct tasks remains open.

A separate offline algorithm selector now has one prospectively accepted forecast-learning kernel revision, with migration from retained own experience and automatic self-application to its preference learner. This has not yet shown repeated improvements, better recursive-search productivity, or an embodied fly-controller benefit. See [the exact scope and audit](ALGORITHM_UPGRADE.md). The full RSI goal remains open.

## Milestone status (2026-11-08)

Full sentence-by-sentence audit: [VISION_COMPLETE_AUDIT_V1](VISION_COMPLETE_AUDIT_V1.md).

| Milestone | Status |
|---|---|
| Lifetime benefit on held-out tasks + loss under reset | Met |
| Persistent adaptation, within-task (changing codebooks) | Met |
| Persistent adaptation, across distinct tasks | Met for the odor-taste skill: orthogonal code keeps 104–109% of earlier tasks' skill vs 84–93% before, two banks ([results](M2_DISTINCT_RESULTS_V1.md)); survival unchanged |
| Bounded, checkpointable controller-change proposals | Met: proposals evaluated on fresh worlds under budgets; accepted revisions since 2026-11-11 ([RSI V1](RSI_SEARCH_RESULTS_V1.md), [V4](RSI_GUIDED_RESULTS_V1.md)) |
| Richer bodies only after simpler models are explained | Gate correctly shut (body transfer failed) |
| Population, social, cultural studies with controls | Met as studies: two first-generation inheritance channels, with stated bounds |
| Observatory and separate model tracks | Met |
| Recursive self-improvement | Not met. A narrow meta-learning demo passed: an improver reweighting a hand-written move menu beat the fixed one within one world family ([V4](RSI_GUIDED_RESULTS_V1.md)). The stronger test failed all three criteria: moves invented from primitives did not help, a revised update rule did not help, and nothing transferred to an unseen threshold-rule family ([V5](RSI_V5_RESULTS.md)). V6 passed two of three: invented moves helped (15–4) and transferred to the unseen family (14–1); the revised update rule missed (14–7, p = 0.095) ([V6](RSI_V6_RESULTS.md)). V7 (budget 12, 72 pairs, fresh bank) failed all three (p = 0.087, 0.38, 0.31). It reused V6's trained libraries, and only one of the three libraries was good, so V6's passes do not hold up ([V7](RSI_V7_RESULTS.md)) |

All measurable milestones except recursive self-improvement are met, within the bounds stated in each results doc.
Human-like cognition, planetary worlds and long-run societies remain research
aspirations, as stated above.
