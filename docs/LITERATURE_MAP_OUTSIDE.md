# Outside literature map (researched 2026-10-30, arXiv)

Twelve papers read at abstract level, selected for the program's three open
problems: (P1) substrate saturation — nothing beats the base rule;
(P2) mating structurally impossible — zero births ever;
(P3) evaluation overfits — selected configs lose live.
Each entry: what it says → what it means for us.

## Self-improvement: how others get headroom

- **Darwin Gödel Machine (2505.22954).** Open-ended evolution of
  self-improving coding agents: archive of diverse agents, foundation-model
  proposes new versions, empirical validation per change (SWE tasks).
  → They succeed where we got 0/8 because their TASK SPACE has infinite
  headroom (coding) while ours is a fixed saturated foraging ecology.
  Lesson for P1: headroom lives in the task distribution, not the
  optimizer. Our program has never varied the ecology itself.
- **Mendel GM (2608.07645).** Single-trajectory mutation is weak;
  reaction-norm (multi-task) + cross-lineage hybridization win. → Our lines
  are single-lineage with no cross-lineage information flow. If selection
  ever resumes, seed from multiple lineages, not one.
- **RRSI (2609.24972).** Harness RSI overfits training tasks; fixed by
  regularization: annealed proposer budgets, critic + pruner (reject
  small/expensive/stale edits). → Our V1b harm is their disease exactly:
  our 1%-better adopt rule has no pruner, so it adopts noise. Any future
  selection rule needs a minimum effect size + cost-awareness. Lesson for P3.
- **Red Queen GM (2606.26294).** Co-evolve agents AND their evaluators;
  fixed evaluators go stale (non-stationary utilities). Anchored with
  complementary signals (human grades). → Our eval is fixed (one-step
  error). If selection resumes, the evaluator must adapt too — but ours has
  no anchor; gaming risk is unaddressed. Lesson for P3, with a warning.
- **SGM (2510.10232).** Replace proof-of-improvement with statistical
  certification (e-values, Hoeffding) + a GLOBAL error budget across
  rounds (Confirm-Triggered Harmonic Spending). → We run dozens of tests at
  face value with no familywise control. V1c's +0.21 on n=4 is plausibly a
  look-elsewhere effect — SGM's framework says so formally. Lesson for P3:
  future bars need confidence + a program-level error budget.
- **Bounded RSI blueprint (1312.6764).** Autocatalysis/endogeny/
  reflectivity seed; value-driven scheduling. → Vocabulary, not machinery.
  Noted for the "bounded" framing only.

## Open-endedness: what the substrate needs

- **OEE Requirements, Taylor (1507.07403).** Five requirements; #1 is
  ROBUSTLY REPRODUCTIVE INDIVIDUALS. → We fail #1 at the foundation
  (zero births, structurally). The literature says open-endedness is
  IMPOSSIBLE without it. This promotes the mating block from "a closed
  track" to the load-bearing wall of VISION milestones 4–5.
- **AI-GAs, Clune (1905.10985).** Three pillars: (1) meta-learn
  architectures, (2) meta-learn learning algorithms, (3) GENERATE
  ENVIRONMENTS. → We did (2)-lite in a FIXED environment with a FIXED
  architecture. Pillar (3) is entirely missing. OMNI-EPIC (2405.15568)
  shows environments + rewards generated in code, filtered by learnability
  + interestingness. Our BT ecology has been byte-identical for the whole
  program. Lesson for P1: the next substrate is generated, not tuned.
- **Avida (adap-org/9405003).** Digital organisms, local 2D interactions;
  reproduction is the CORE LOOP (copy-with-mutation on execution), not a
  gated exception. → Our mating is a 6-condition Rube Goldberg gate
  including an unreachable action. Avida's design answer to P2: make
  reproduction the default (surplus-triggered copy), not the exception.
- **Embodied Evolution review (1709.08992).** On-line distributed evolution
  in swarms; mating/selection protocols are DESIGNED (mate choice, energy
  transfer, opportunistic exchange), never assumed. → Our program assumed
  mating would "happen" once energy sufficed. It won't without a protocol.
  Lesson for P2: design the mating protocol explicitly.
- **VeLO worth-it? (2310.18191).** 4000 TPU-months for a learned optimizer
  that doesn't beat tuned Adam; generality claims collapse under honest
  benchmarks. → Our mirror: 7,491 worlds of learning-knob tuning that ties
  tasteRate=1. The field already ran our experiment at 1000× cost with the
  same null. Verdict: the optimizer-tuning era is closed HERE too — with
  better baselines than VeLO had (we ran fixed/random/copied controls).

## What changes in the program

1. Mating verdict (this turn): STRUCTURAL, now literature-backed — Taylor
   #1 + Avida + embodied-evolution all say reproduction must be designed,
   never assumed. Fix direction: actuation redesign (Avida-style default),
   not motivation.
2. New rule (proposed): no future selection bar without a minimum effect
   size + program-level error accounting (RRSI + SGM). V1c's +0.21 would
   not have passed it.
3. Next substrate (proposed): generated ecologies (AI-GAs pillar 3), not
   new knobs in BT. This is the outside-the-box line the literature
   points to — frozen plan required before any bank contact.

## Round 2 — lateral angles (researched 2026-10-30)

- **POET (1901.01753).** Paired environment-agent coevolution; environments
  generated challenging-but-solvable with stepping-stone TRANSFER between
  problems. → Design for the generated-ecologies line: coevolve difficulty
  with capability (not naive randomization), and transfer solutions across
  ecologies — our lines never transfer anything but the base config.
- **PowerPlay (1112.5309).** Continually invent the SIMPLEST still-unsolvable
  task + the solver mod that solves it, provably retaining old skills. →
  Task-generation rule with anti-forgetting built in; re-validation on all
  prior tasks. Curriculum-shaped, VISION-shaped.
- **MAP-Elites (1504.04909).** Illuminate, don't optimize: archive elites
  across user-chosen behavior dimensions. → Directly applicable to OUR
  frozen archive (7,500+ worlds): a QD archive over turn-profile /
  foraging-signature dimensions would show diversity we HAVE but never
  selected for. Zero new worlds. (Lehman & Stanley's abandon-objectives
  lesson: our G-bars may CAUSE the saturation — archive behaviors instead.)
- **Surprise Search (1706.02556).** Select deviation from EXPECTED behavior
  (predictive model of search history); beats objective search. → We HAVE
  surprise machinery (surpriseEma)! Select configs that SURPRISE the
  predictor rather than minimize error — unexploitable the way our eval
  was. Concrete future selection rule.
- **World Models (1803.10122) + RWM for policy evolution (1809.01999).**
  Train the agent ENTIRELY in its own dream, transfer back. → Fixes our
  eval problem a third way (after live-only: overfits; faithful-mix:
  honest but blind to counterfactuals): evaluate candidate configs by
  dreaming. Our agents are tiny (11–96 dims) — a dream model at that
  scale (next-obs MLP) is oddly tractable HERE.
- **Cully et al. (1407.3501).** Precompute a behavior-performance MAP
  offline (MAP-Elites), adapt online by Bayesian SELECTION over the map
  (<2 min, no weight relearning). → M-RELEARN's ceiling (relearning costs
  nothing) says our agents should adapt by SELECTION from a repertoire,
  not gradient updates. New intervention class: repertoire + selection.
- **Generative Agents (2304.03442).** 25 agents, memory + reflection →
  emergent sociality (party spreading) with ZERO reproduction. → M5 does
  NOT require mating. Lateral track: sociality via the EXISTING signal
  channel (index 4, costed, currently constant 0) + co-location — decoupled
  from the reproduction block entirely.
- **Bedau/Ecolab (nlin/0004026).** Class-4 (unbounded diversity) needs
  dynamics that reduce connectivity over time; conservative operators bound
  diversity (class 1/2). → Our per-line ties (all arms ±0.07, reset≡
  trained) read as class-1/2: no persistent adaptive activity. The
  boundedness is in the OPERATOR (rate dials are ultra-conservative), not
  the selection. To get class-3 dynamics we must REWIRE (new pathways —
  e.g., actually wiring channels 3/4 to something), not re-tune.
- **MCC, Brant & Stanley 2017 (GECCO, from knowledge).** Reproduce iff a
  MINIMAL criterion is met (reach the goal at all, however badly), then
  open-ended search. → The mating-gate alternative: replace our
  6-condition gate with ONE survival milestone. Fires often, still
  selective, preserves lineage.
- **Polyworld, Yaeger (Alife, from knowledge).** Embodied mating via
  COURTSHIP: approach + visual display + mutual acceptance; dances evolve.
  → Agency-preserving mating WITHOUT overloading foraging actions: use
  approach (movement, exists) + signal burst (channel 4, exists but dead)
  + mutual proximity. New Option C for the actuation line (see below).

## Outside-the-box moves now on the table

1. **Mating Option C (courtship via channel 4)** — recommended primary for
   the licensed actuation line: agency-preserving, no foraging confound
   (unlike A), no agency removal (unlike B), ALife-precented. Uses two
   channels that already exist (movement + signal).
2. **QD archive of the frozen record** — zero new worlds; map what
   behavioral diversity 7,500 worlds already contain.
3. **Surprise-gated selection** — unexploitable successor to error-gated
   adoption, using our own surprise machinery.
4. **Dream-model evaluation** — candidate configs evaluated in a learned
   forward model instead of replayed past.
5. **Repertoire + selection adaptation** — MAP-Elites behavior map + online
   Bayesian selection instead of weight relearning.
6. **Sociality without mating** — signal channel + co-location → emergent
   coordination; M5 decoupled from the reproduction block.

## Round 3 — coordination without reproduction, evo-devo, non-reward drives

- **Baldwin: Meta-Learning by the Baldwin Effect (1806.07917) + Revival
  (1702.08411).** Learning guides evolution; learned behaviors become
  innate (genetic accommodation); learning ability itself is easily
  selected for. → OUR `consolidationRate` is 0 EVERYWHERE — the slow-weight
  tracking machinery exists, fully plumbed (`slowTaste`, replay-mode mutual
  tracking, checkpoint validation), but never switched on. WHAT-RETAINS
  closed direction-protection; consolidation (slow tracking) is a DIFFERENT
  mechanism, never tested. Concrete line: consolidationRate ∈ {0, small,
  large} × relearning/return-A-rebound metrics. Zero engine changes
  (config knob only). The highest-value concrete proposal this round.
- **Recruitment cascades (2610.24865).** Foraging recruitment as contagion:
  finder triggers linear-threshold cascade on the communication network;
  self-limiting via crowding; percolation decides local vs swarm-wide.
  Emergent patch-leaving + Lévy search fall out untuned. → Design for the
  signal channel: find → broadcast → threshold-follow. No mating needed.
  Gives dead channel 4 a function.
- **Emergent Comm + World Models (2002.09604).** Messages grounded in
  PREDICTED future observations ("enhanced observation"); positive
  signalling/listening losses. → Fuses our dream-model + communication
  threads: signal = predicted food direction. Concrete protocol design.
- **Iterated learning NIL (2002.01365).** Compositional protocols emerge
  via transmission bottlenecks; give learning-speed advantages amplified
  over generations. → Frames WHY lineage matters (cumulative culture) —
  supporting argument for unblocking mating, not a workaround. (Warning:
  2404.04286 — iterated learning also AMPLIFIES bias; errors compound.)
- **Empowerment (1310.1863, 1406.1767).** Channel capacity actions→sensors
  as task-independent utility; can motivate restructuring the environment
  itself. → Alternative selection criterion (with surprise-search):
  maximize future options. Implementable-ish via own transition counts.
- **Stigmergy learning (1811.08210).** Indirect coordination via state
  traces; distance-regulated. → Our food-depletion trails ARE stigmergic
  traces; noted, secondary to direct recruitment.
- **Quorum sensing (1412.7767).** Feedbacks resolve 2+ more density ranges.
  → Design pattern for density-gated behavior (don't court when alone).
  Relevant to mating-protocol efficiency.

## New concrete moves (ranked)

1. **Baldwin-consolidation line** — config-only, no engine work, sharp
   hypothesis (slow tracking retains what direction-anchoring couldn't),
   metrics exist (return-A rebound, relearning speed with headroom TBD).
   Recommended next freeze.
2. **Recruitment cascade via channel 4** — signal-on-find +
   threshold-follow; sociality track without mating; gives channel 4 a job.
3. **Surprise/empowerment-gated selection** — unexploitable successors to
   error-gated adoption.
4. **Dream-model evaluation** — evaluate candidates in a learned forward
   model (counterfactual configs, not replayed past).
5. **Repertoire + selection adaptation (Cully)** — MAP-Elites behavior map
   + online Bayesian selection instead of weight relearning.
6. **MCC-style minimal mating gate** — replace the 6-condition gate with
   one survival milestone (feeds the actuation line's Option B refinement).

## Round 6 — exploration machinery, transitions, communication learning

- **Go-Explore (1901.10995) + Latent (2208.14928).** Remember states →
  RETURN to the frontier without re-exploring → explore onward; works in
  deterministic simulators (ours are seeded!). Latent version needs no
  hand-designed cells. → Directly addresses M-RELEARN's ceiling (resets
  cost nothing because behavior is already there): DON'T reset to zero,
  return to the frontier. Our anchors (atA/atB/atC) are half the machinery;
  missing: archive interesting states + relaunch FROM them. Concrete line.
- **RIAL (1605.06676) + MACC (2006.07200) + comm review (1911.05438).**
  Centralized learning, decentralized execution (matches our runner);
  counterfactual credit for speakers; SOCIAL loss — agents must be trained
  to LISTEN, not just speak. Our protocol sketches only specify speaking.
  Entropy-based protocol metrics; account signal costs (we bill energy!).
- **Assembly Theory (2206.02279).** Assembly Index (minimal construction
  steps) × copy number = selection quantified. → Formalizes our
  replication logic: TURN-GATE 6/6 = high copy number = genuine selection;
  V1c +0.21 (n=4, vanished at n=8) = low assembly = noise. Use AT as the
  language for future GO bars.
- **Autocatalytic structure (1205.0584).** Decompose into subsets;
  evolvability/enablement/emergence; applies to entire ecologies. → Our
  lines ARE autocatalytic subsets (each verdict enables the next plan).
  Look for the program's autocatalytic CORE (what self-sustains?).
- **MLS assortment/reciprocity (1910.06933).** Within-group mechanisms
  SYNERGIZE with between-group selection. → Our 8 histories are already
  isolated lineages (groups!); program-level line selection IS group
  selection. Formal MLS framing for "select at the right level."
- **First major transition, MLS view (2608.22348).** Transition REQUIRES
  coupling replication to division + suppressing pure-replication
  selection. Replicators (selfish) + reproducers (compartments) must unite.
  → Deepest diagnosis yet: our system has NEITHER half (weights aren't
  inherited; flies can't divide). VERIFIED in code: `syncNewbornLearners`
  (`taste-experiment.mjs:34-49`) creates newborns with FRESH ZERO weights
  — no vertical transmission. So even MATE-ACT V1 births would NOT cross
  the transition. Phase 2 MUST wire inheritance (parental weights ±
  mutation), not just birth events. This reframes the whole mating track.
- **Minimax-regret UED refinement (2402.12284).** Regret-maximizing levels
  STAGNATE at the bound; BLP/ReMiDi continues learning. → Design rule
  for generated ecologies: naive regret saturates (like our G-bars);
  require level-perfect refinement.

- **PER (1511.05952) + ReaPER (2506.18482).** Prioritize replay by
  significance (TD-error), reliability-adjusted. → OUR replay is uniform +
  tournament; the knobs EXIST (`replaySkip`, `replaySurpriseGain` — both 0).
  Concrete config-only line: surprise-prioritized replay (replay what
  surprises). Upgrades exactly the machinery V1c proved load-bearing.
- **HER (1707.01495).** Relabel failures with achieved goals (implicit
  curriculum for sparse rewards). → Less applicable (our rewards are dense),
  noted.
- **Universal SF (2001.04025) + limitations (1708.00102).** Decouple
dynamics features from reward → transfer across goals. → Principled
  redesign for the transfer line (R-GAP failed on billing AND on
  entanglement). Bigger machinery; future.
- **Differentiable plasticity (1804.02464) + Backpropamine (2002.10585).**
  LEARN the plasticity rule (Hebbian coeffs + neuromodulatory gating) —
  outperforms static on maze exploration + meta-learning. → Our rule is
  hand-designed; the menu could include PARAMETERIZED plasticity tuned by
  the in-agent loop itself (per-weight rates, not global dials). V1e-shaped.
- **Neuromodulated Meta-Learning (2411.06746).** Flexible per-task
  structure; no universal pattern. → Our streams=1 everywhere; structure
  knobs (streams, hysteresis, controller) unexplored. Architecture vein.
- **AIF-DDM (2508.04435).** Active inference + drift-diffusion; effort =
  habit-vs-optimal conflict. → Full formalism for the DDM decision
  mechanism (round 4): leaky evidence + conflict-metered threshold.
- **Alignment-free evasion (2509.11083).** Attraction+repulsion WITHOUT
  alignment suffices for collective evasion. → Social coordination needs
  only simple local rules — SIMPLIFIES recruitment design (no complex
  protocol).
- **Hanabi conventions + QMIX + COMA (already mapped round 4, abstracts
  confirmed).** Conventions = opt-in multi-step cooperative actions;
  QMIX monotonic team factorization (needs a team objective we lack);
  COMA counterfactual baselines (our runner is centralized training
  already). MARL toolkit for the sociality track, ordered by readiness:
  conventions first (design-only), COMA second (needs team reward),
  QMIX last (needs factorization machinery).

## Round 4 — consolidation neuroscience, drift, credit assignment, foraging

- **EWC nuts-and-bolts (2105.04093).** Fisher-weighted consolidation:
  protect what mattered, not everything equally. → Upgrades BALDWIN:
  importance-weighted slow weights with OUR surpriseEma as the importance
  proxy (surprising = informative = worth protecting). Concrete V1b.
- **CTDL (1905.02636) + CLS-ER (2201.12604).** Fast pattern-separated
  (SOM, TD-updated) + slow distributed (DNN); dual semantic memories,
  no task boundaries. → Our architecture is INVERTED (fast distributed,
  slow averaged, no separation; streams=1). Architecture direction: give
  the fast system pattern separation.
- **Normative patch foraging (2004.10671) + evidence accumulation
  (1809.05023).** Bayesian residence times; drift-diffusion patch
  decisions (drift rate + threshold = strategies). → Our greedy 0.5
  threshold is a degenerate DDM with zero accumulation. New decision
  mechanism: leaky cue integrator + threshold (small instrument change,
  testable). MVT as the normative bar for the foraging line.
- **World Models unlock foraging (2512.12548).** Model-based agents
  converge to MVT; anticipation > reward-max. Reinforces dream-model
  evaluation + MVT bar.
- **COMA (1705.08926).** Counterfactual baselines (marginalize one
  agent's action) for multi-agent credit assignment; centralized training,
  decentralized execution — our runner IS centralized. → How a fly knows
  if ITS signal helped. Concrete MARL design for sociality.
- **QMIX (1803.11485).** Monotonic team-value factorization — needs a team
  objective we lack (total biomass?). Conditional note.
- **Hanabi conventions (2412.06333).** Augment action space with opt-in
  multi-step cooperative conventions. → Formal precedent for courtship-as-
  convention (MATE-ACT Phase 2): predefined opt-in sequences over existing
  channels. Strengthens Option C.
- **Phylogenetic diversity (2108.12586).** Lineage-aware metrics predict
  EA success better than richness/evenness. → QD the archive by
  LINEAGE, not just behavior.
- **From knowledge (flagged, not arXiv-fetched): Lynch drift-barrier —
  selection cannot beat drift in tiny populations. OUR n=24 founders with
  ±0.07-level effects is a DRIFT-DOMINATED regime by population genetics,
  independent of mechanism.** This reframes V1d's null a third way
  (saturated substrate AND drift-dominated sampling) and re-prioritizes
  population size with quantitative teeth: selection needs N≫24 or
  effects ≫ drift. Yet another reason mating matters.
- **From knowledge: MODES toolbox (Dolson et al.) — change/novelty/
  complexity potential metrics, runnable on frozen artifacts; Keramati
  homeostatic RL (setpoint defense — our energy billing IS a homeostatic
  loop); Mirollo-Strogatz pulse sync (decentralized coordination
  primitive for channel 4); RIAL (discrete emergent comm — ours would be
  RIAL-style, no differentiability needed).
