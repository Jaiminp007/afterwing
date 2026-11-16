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

A separate offline algorithm selector now has one prospectively accepted forecast-learning kernel revision, with migration from retained own experience and automatic self-application to its preference learner. This has not yet shown repeated improvements, better recursive-search productivity, or an embodied fly-controller benefit. See [the exact scope and audit](ALGORITHM_UPGRADE.md). The full RSI goal remains open in that line; the bounded RSI result is the P5–P10 line in the table below.

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
| Recursive self-improvement | Met in a bounded form (P5–P10, 2026-11-15). The search and its self-improvement run offline, not inside the individual fly. P5–P7 were scored by a surrogate evaluator (the fly's taste learner run on simulated tasting streams), on constructed staircase tasks, with hand-written primitive genes. On that setup, three parts are shown: learned search beats blind search on unseen problems ([P5](RSI_P5_RESULTS.md): 12/12 libraries, p = 0.00024); starting from blind moves only, the system invents moves and relies on them, +9.2 over the same training without invention ([P6](RSI_P6_RESULTS.md) C2); and the gain transfers to an unseen rule family, +14.9 ([P6](RSI_P6_RESULTS.md) C3). A benefit to the embodied fly is shown in an opt-in many-odor world, with the surrogate calibrated to measured embodied statistics. The programs it found raised embodied energy by +2.85 over blind search (12/12 rules, p = 0.00024) and by +2.54 over no search (p = 0.002) ([P8](RSI_P8_RESULTS.md)). In the default 12-odor world this failed (P7, A − B −0.03; [P6b/P7](RSI_P6B_P7_RESULTS.md)). Revising its own improvement rule (level 2) failed over the original update-rule space: P6 (p = 0.082) and its replication P6b (p = 0.144). It passed in the surrogate in [P9](RSI_P9_RESULTS.md), where the space included the move-invention operator, added after diagnosis. Its embodied replication failed (P11). The system's own hill climber chose two-gene invention, which beat U0 by +5.39 on 32 fresh libraries and an unseen rule family (p = 0.00064). The gain is concentrated in the 6 libraries where U0 failed to discover the key move. The parts were then tested jointly in one system in [P10](RSI_P10_RESULTS.md), which passed. The system used the P9 rule U*, started from blind moves and invented its own, and was applied to an unseen rule family. Its programs were installed in the embodied fly in the many-odor world, where they beat blind search by +3.59 energy (12/12 rules, p = 0.00024) and no search by +3.76 (p = 0.0005). It invented its top move in 11/12 libraries. The embodied effect of the level-2 revision alone is not shown: P10 gave +1.48 (p = 0.051, reported only), and the pre-registered 32-rule test [P11](RSI_P11_RESULTS.md) gave +0.38 (p = 0.19). In-life self-revision inside the fly was explored and stopped as data-limited ([exploration](RSI_INLIFE_EXPLORATION.md)). With about 33 tastings per lifetime, even oracle additions at the fly's own decision times gain only +2.4 energy, and the fly's own evidence cannot find the right terms. Across generations it works: in [P12](RSI_P12_RESULTS.md), fly lineages revised their own taste program from their own experience, with no offline search or surrogate. Each generation inherited its parent's program and evidence, but not learned values. After 8 generations they held nearly all target terms and gained +3.54 energy over unrevised lineages and +3.28 over a matched sham (24/24 rules on every gate). This is in-lineage, not in-life, and the revision operator is the one invented offline, now run by the flies themselves. Recursion inside the lineage, where the lineage tunes its own reviser, was tested in [P13](RSI_P13_RESULTS.md) and is not shown. Lineages that start with a bad threshold recovered +1.84 of a 2.39 gap through self-pruning of features their own weights did not support, but a sham with copied threshold steps recovered as much (+0.06, p = 0.32). Earlier: V4 passed a narrow demo: an improver reweighting a hand-written move menu beat the fixed one within one world family ([V4](RSI_GUIDED_RESULTS_V1.md)). The stronger three-criterion test failed in V5, V6 and V7. V6's row-level passes are withdrawn: they do not hold at the library level and come from one evidence-guided move in one library ([V5](RSI_V5_RESULTS.md), [V6](RSI_V6_RESULTS.md), [V7](RSI_V7_RESULTS.md), [review](fable-review/FABLE_REVIEW.md)) |

All measurable milestones are met, within the bounds stated in each results doc. Recursive self-improvement is met only in the bounded form described in its row: offline search, constructed tasks, and an opt-in many-odor world.
Human-like cognition, planetary worlds and long-run societies remain research
aspirations, as stated above.
