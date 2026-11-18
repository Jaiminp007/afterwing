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

Survival: in the opt-in many-odor world, taste skill changes survival strongly. Lifetime learning gives +4 to +8 survivors of 24, and the true structure gives +9 to +14, on 12/12 rules ([P14](RSI_P14_RESULTS.md)). The pre-registered milestone failed, but its no-skill arm turned out to be a non-eater: it tasted only 3–4 times per life. The intended comparison, a better program against the default learner, replicated on fresh rules in [P14b](RSI_P14B_RESULTS.md): +5.15 survivors (8.65 → 13.79 of 24), 12/12 rules, p = 0.00024. Its gates were chosen after P14.

## Final status (2026-11-16)

This is the honest end state of the measurable milestones, following the independent Fable review.

**Met.**
- Lifetime benefit on held-out tasks, with loss under reset.
- Persistent adaptation (odor-taste skill).
- Bounded, checkpointable controller proposals.
- A better taste program raises survival over the default learner: +5.15 of 24 ([P14b](RSI_P14B_RESULTS.md)). This is a replication; its gates were chosen after [P14](RSI_P14_RESULTS.md).
- Observatory, and separate model tracks.
- Population and social studies, as first-generation studies.

**Met in bounded form.**
- Recursive self-improvement offline, P5–P10. Search, invention and transfer happen in a calibrated surrogate. The found programs beat blind search in the embodied fly.
- In-lineage self-revision of the fly's own taste program ([P12](RSI_P12_RESULTS.md)). Lineages learn from their own experience, with no surrogate. Self-pruning repairs a badly set reviser ([P13](RSI_P13_RESULTS.md)).

**Not shown.**
- Level 2 in the embodied fly: [P11](RSI_P11_RESULTS.md) failed to replicate the surrogate result P9.
- In-life self-revision: data-limited at about 33 tastings per life ([exploration](RSI_INLIFE_EXPLORATION.md)).
- Recursion inside the lineage, i.e. the lineage tuning its own reviser (P13).
- Body transfer (V1–V3).
- A body change that raises survival through information: the sip body, [P15](RSI_P15_RESULTS.md). It tripled taste labels but did not raise survival, because the bottleneck is the representation, not label count.
- A generic richer representation: all pairwise terms from birth, [P16](RSI_P16_RESULTS.md). +0.97 survivors overall (bar 1.25). It gave +2.13 on the pairs family, which it expresses exactly, and −0.18 on the staircase family, so it is a family-specific prior.
- Selection between generations: not tested. A 4-rule exploration found no benefit, because the lineage relay already finds nearly all target terms without selection ([exploration](RSI_P17_SELECTION_EXPLORATION.md)).

Per the Fable review (2026-11-17), nothing honest remains to try in this world. A further step would need a different world or task, chosen for its own reasons and with its own stopping rule.

**Scope.**
- Every positive result from P8 on holds only in the opt-in many-odor world (`odorShiftEvery`), on constructed tasks.
- The default 12-odor world does not reward taste structure (P7).
- Human-like cognition, planetary worlds and long-run societies remain research aspirations.

## Microverse (2026-11-17)

The microverse is a separate, closed world (`microverse/`) where flies breed, learn and die continuously. A goal ladder was fixed in advance ([goals](MICROVERSE_GOALS.md), [log](MICROVERSE_LOG.md)) and worked in fix-and-retest loops on practice seeds. A goal counts as closed only after passing on fresh seeds.

- **Closed:** G1–G6, on two fresh final runs with validity checks:
  - the world is livable;
  - taste matters;
  - movement matters;
  - learning in life helps;
  - self-improving flies out-compete fixed flies, a random-revision sham and mutation-only evolution in a shared world;
  - after rule changes, skill is rediscovered.
- **Not shown:** G7, a separate benefit of self-revising movement on top of taste. It failed twice as registered, and its lower-drift re-test G7b just missed (p = .012).

These results are for a constructed world with hand-written operators. They show bounded, in-world self-improvement, not open-ended intelligence.

**Level 2 in the microverse (2026-11-17,** [goals](MICROVERSE_L2_GOALS.md), [log](MICROVERSE_L2_LOG.md)**).**

P11 and P13 were re-asked as new tests, P11b and P13b; the originals stay failed.

- **P11b PASSED.** The system's own level-2 search over its taste reviser started from the pre-tuning reviser. It rediscovered forgetting and pruning, and the found reviser beat the start by +5.73 flies on 48/48 fresh worlds, matching the designer's hand-tuning.
- **P13b split into parts (one final, 48 fresh worlds).** P13b-1 PASSED: the lineage's own in-life tuning beat no tuning by +5.96 flies (46/48). P13b-2 failed: it did not beat blind mutation (+.53, p .13). P13b-3 failed: it did not beat a coin-flip sham (−.02). So P13b itself is not shown; the gain comes from trial plus selection, not the fly's evidence. A new test, P13b-2b (more frequent trials, fresh seeds 91001–91048), PASSED: +1.24 over blind mutation, p .0024. Its edge over a coin-flip sham (+.25) is not significant. P13b-3 (own evidence beats a coin flip) is blocked: a perfect-judgment oracle does no better than the coin flip (−.42), so there is no headroom. Split further, with a new shadow-trial rule (the fly compares a copy of its learner with the trial setting on the same tastings), its parts failed on fresh seeds 92001–92048: keep accuracy .504 (p .019, bar .01), and genes no closer to R* (p .41).
- **P13b complete: not achievable (nine designs bounded below the gate).** A lineage tuning its own reviser from its own experience did not beat free evolution and a matched sham by the frozen margin. A headroom check shows why: the best reviser setting is stable in this world, so evolution finds it. Even perfect in-life tracking in a fast-switching variant adds only about .66 flies.

Labels: the climber, the meta-rules and the search grid are hand-written. The start point was set after the first headroom checks failed. Fable review was unavailable for this line.

