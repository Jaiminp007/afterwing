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

## Round 7 — curiosity, criticality, homeostasis, collective transition physics

- **Episodic curiosity via reachability (1810.02274).** Novelty bonus =
  environment steps to reach the observation from memory (dynamics-aware);
  defeats couch-potato self-gratification. → Our exploration is TAXED
  (M-ORIGIN), never bonused; prediction-error bonuses would fail HERE
  (stochastic ecology → noise-chasing). Reachability, not prediction error,
  is the design that survives our setting.
- **Large-scale curiosity (1808.04355).** Pure curiosity aligns with
  hand-designed rewards; random features suffice; FAILS in stochastic
  setups. → Second vote for reachability-over-prediction-error in our world.
- **Maximum dynamic range at criticality (0906.0527) + foundations
  (2306.05635) + avalanches review (2111.07479).** Critical state maximizes
  input dynamic range via E/I balance; deviations = frozen or stampede. →
  DIAGNOSTIC LENS on V1d (queued analysis, zero new worlds): 47/48 adopts
  at ONE checkpoint is a supercritical stampede, not 47 independent votes —
  effective N ≈ checkpoints-with-variation, not agent-decisions. Would
  dissolve the residual mystique around "28 persistent adopts" (correlated
  copies of boundary events). Strengthens the closure honestly.
- **SPICED (2509.17439).** Synaptic homeostasis: strengthen discriminative
  traces, WEAKEN detrimental ones, RENORMALIZE globally, preferentially
  replay discriminative traces. → Three upgrades beyond our consolidation:
  (a) renormalization pass (we only ever ADD learning — no homeostatic
  set-point), (b) discriminative replay prioritization (ours is
  uniform+tournament), (c) suppress detrimental replay. (a) is most novel.
- **Snowflake yeast geometry (1802.03615) + E. coli self-organization
  (2503.03001).** Physical constraints (packing, stress) shape the path
  more than selection does. → For mating: ENCOUNTER RATE (26-unit radius
  in 1000×640 with 24 diffusing flies) may be the binding constraint —
  even with the channel fixed, births could be vanishingly rare. Reframes
  MATE-ACT V1's NOGO branch in advance: "no births" may mean "no
  encounters" → density/ecology, not gating. (Analytic encounter-rate
  estimate possible from diffusion; queued.)
- **Emergence of structured behaviors (1802.07461) + curiosity survey
  (1802.10546).** Adversarial challenge of the world model → ego-motion,
  attention, gathering, WITHOUT extrinsic reward. → Developmental play
  pattern; curriculum-via-curiosity framing for generated ecologies.
- **Avalanches theory (2111.07479).** Scale-free cascades from interacting
  wave modes — background for the criticality lens above.

## Round 8 — curricula, consensus, signaling games, modularity, culture

- **Teacher-Student Curriculum (1707.00183).** Teacher samples subtasks by
  LEARNING-PROGRESS SLOPE; revisits tasks where performance DROPS
  (anti-forgetting). Solved an otherwise-unsolvable maze, 10x faster than
  uniform. → THE scheduler for generated ecologies (Phase 2 of that line;
  needs ecologies to schedule first).
- **House-hunting trilogy (1505.03799, 1408.4487, 2105.00883).** Distributed
  consensus with Ω(log n) bound; optimal via nest-size info; DDM individual
  choice + quorum + recruitment; collective FAR less error-prone than
  individuals. → Quorum-based consensus protocols for sociality (assess →
  recruit → quorum → commit). Fourth independent arrival of drift-diffusion
  (foraging, AIF, collective choice, house-hunting): DDM is THE canonical
  individual decision mechanism — the leaky-integrator proposal is now
  quadruply motivated.
- **Signaling games (1103.5818, 2201.11680).** RL converges to shared
  lexicons (no synonym+homonym correspondences); SUPERLINEAR feedback
  (Metcalfe's law) matches linguistics. → Protocol learning rule: reinforce
  successful communication superlinearly. Concrete update for channel-4.
- **Modularity evolution (1211.5646, 1302.4267).** Modularity growth rate
  tracks environmental FLUCTUATION rate (fluctuation-dissipation); PRODUCT-
  rule (multiplicative) mutations → sparseness naturally, sum-rule does
  NOT. → (a) Our A/B/C/return-A fluctuation SHOULD induce modularity
  (taste blocks 4/5 already are modules?); (b) any resumed evolutionary
  search must use product-rule mutations; (c) costly connections (our 96-dim
  billing!) independently induce modularity — coherence check passed.
- **CCE navigators (2206.06281).** Minimal architecture (goal-direction +
  social proximity + route memory) SUFFICES for cumulative culture;
  experienced+naive pairing improves BOTH (regression to the goal).
  Lesioning proximity/memory kills it. → Design requirements for a future
  lineage track: proximity sensing + route memory + cross-generational
  pairing (not just inheritance).
- **Pheromones→Policies (2509.20095).** Stigmergic signals = distributed RL
  (cross-learning); persistent trails LOCK IN obsolete choices; a minority
  of pheromone-INSENSITIVE explorers restores plasticity (heterogeneity as
  design!). → Recruitment design with lock-in guard: keep an explorer caste
  (reset/unlearned agents as functional explorers?); heterogeneity, not
  uniformity, is the design principle.

## Round 9 — immunity, individuality, heuristics-as-inference, courtship honesty, quorum physics

- **Emergence of Individuality (2006.05842).** Intrinsic reward for being
  IDENTIFIABLE (classifier predicts agent from observation); promotes
  behavioral diversity in MARL, beats baselines. → Direct attack on our
  all-arms-identical uniformity: reward agents for being distinguishable.
  Implementable (classifier agent←behavior + self-prediction bonus).
  Genuinely new objective for the program.
- **Danger Theory AIS (0801.3549).** Respond to DAMAGE signals, not
  non-self. → Our deaths are energy-depletion (endogenous danger already
  logged: harmfulEaten, toxinDamage, crashes). Trigger protection /
  consolidation on damage, not novelty — different trigger than
  surprise-gating, using existing signals.
- **Free Energy Heuristics (2606.15877).** PROVEN: active inference under
  uncertain precision IS take-the-best (fast-and-frugal). Our greedy 0.5
  threshold is ALREADY the optimal computation for high-meta-uncertainty
  environments; more deliberation manufactures false confidence. →
  Converts the decision-machinery closure from empirical ("we failed to
  improve it") to THEOREM-BACKED ("improvement by deliberation is provably
  wrong here"). The V1a–V1d arc ends in a theorem, not just a null.
- **Volvocine phototaxis (2207.10405).** Adaptive response TUNED to the
  colony's rotation period (separation of timescales). → Principle:
  adaptation rates should match ecology timescales (our 512-tick phases).
  Grounds tau/surprise-window choices mechanistically instead of
  arbitrarily.
- **Synthetic quorum sensing (2502.13919).** Density-conditioned motility →
  absorbing transitions / atypical phase separation. → Density-gated
  behavior (slow down when crowded; display only above density) is
  physically grounded collective decision WITHOUT explicit protocol.
  Implementable via existing Spatial machinery.
- **Handicap → dimorphism (1509.08158).** Costly ornaments MUST be costly
  to stay honest; dimorphism emerges. → Courtship displays should be
  SEX-DIFFERENTIATED (males display, females choose) and energy-burning.
  Upgrades Option C with Zahavian teeth.
- **OML representations (1905.12588) + IB theory (2305.18887).** Learn
  representations that accelerate FUTURE learning; IB controls
  generalization error rigorously. → V1b material for consolidation (if
  V1 ever goes); 96-dim billing already prices the IB tradeoff.
- **Flocking + turning (1403.1202) + Vicsek foundations.** Polarized turns
  via conserved rotational info; Vicsek dissipates it. → Our per-agent
  turning discards coordination info; collective turning is unexplored.

## Round 10 — formal plasticity, development guides evolution, social allostasis

- **Evolutionary Le Chatelier (2607.20915).** Plasticity (fast) + genetic
  assimilation (slow relaxation of self-generated stress) via timescale
  separation IN THE PRICE EQUATION. → FORMALIZES the BALDWIN design
  (fast weights = plastic displacement; slow = relaxation) that V1 tested
  with a void metric. V1b (importance-weighted, proper reference) now has
  a formal backbone, not just intuition.
- **Differential canalization (1711.07387).** Only robustness-conferring
  traits assimilate; CONTROLLERS keep tinkering within permissive BODIES.
  → Profound scoping result: bodies SHOULD be stable, controllers plastic —
  our fixed bodies + plastic weights match the ENDPOINT, not a limitation.
  Reframes body-transfer: evolve bodies for robustness, never for policy.
- **Surprise-as-stress (2406.08471).** Cortisol-like stress hormone as
  allostatic mediator of prediction errors. → Concretizes the chain:
  surpriseEma = cortisol analog gating consolidation. Implementable
  neuromodulation, no new machinery.
- **Social allostasis (2508.12791).** Leverage environmental AND SOCIAL
  noise for reconfiguration (cortisol + oxytocin analogues). → Social
  signals as REGULATORY inputs, not just information. Oxytocin-analog =
  affiliation channel design.
- **Plasticity-led GRN review (2208.00649).** GRNs ≈ RNNs; criteria
  checklist for claiming plasticity-led adaptation. → Audit standard for
  any future Baldwin claim.
- **Darwinian→Lamarckian holobiont (1612.03567).** Two-level selection
  produces inheritable acquired adaptation. → Formal justification for
  V1b-with-vertical-transmission (transmit slowTaste, not just births);
  transmission-mode tracking per RITHMS (2502.07366).
- **Clune modularity (1207.2743) + rate effect (1501.04708).** DIRECT
  selection on connection COST → modular + evolvable networks; horizontal
  transfer couples with modularity. → Our 96-dim billing ALREADY imposes
  the modularity pressure (unmeasured — weights aren't archived; note as
  instrumentation gap). Supports cross-lineage transfer design.
- **Developmental world models (2301.05832).** Dream + predictive coding
  for cognitive development. Reinforces dream-model evaluation.

## Round 11 — bet-hedging, predictive coding, stickiness, developmental evaluation

- **Extinction in bet-hedging models (2406.11482).** KEY NUMBER: a 4x
  population increase beats switching from max-growth to min-extinction
  strategy; agent models converge to collective behavior only at N>=100
  (ours: N=24 — BELOW the threshold where collective models even apply).
  → Stop tuning strategy, grow N. Strongest quantitative support yet for
  the population track; our lines tune dials in a regime where dials
  provably matter less than headcount.
- **Bet-hedging expanding populations (1810.01142).** Bet-hedging favored
  in colonizing/spatially-structured populations, NEVER in well-mixed
  ones. → Our well-mixed ecology selects AGAINST diversification; frontier
  or patch-structured ecologies would select for it. Design note for
  generated ecologies (spatial structure first, then diversity).
- **Division of labour → multicellularity (1111.4597).** Mathematical core:
  compartmentalizing incompatible processes creates new fitness maxima
  (unicellular optima become saddles); transition evolves via ONE heritable
  parameter — STICKINESS (adhesion propensity). → Concrete minimal knob
  for our transition: heritable co-location affinity; select on group
  output. Plus: our generalist flies (forage+learn+reproduce in one body)
  may needCASTES (foragers vs reproducers) — division of labour as the
  unlock, not better generalists.
- **Predictive coding theories (2112.10048) + active PC (2210.13461).**
  Rao-Ballard hierarchy (top-down predictions, bottom-up errors);
  hierarchical world models + compositional representations + planning.
  → Organizes our surprise machinery hierarchically (cue-level vs
  value-level errors); reinforces dream-model evaluation.
- **SEDRo (2009.01810).** Developmental test battery (fetus→12mo) as
  evaluation. → Evaluate developmental PROGRESSION (our A/B/C/return-A as
  a crude battery), not just endpoints.
- **Honest misses (disclosed, NOT cited):** 1803.08829 fetched as comets,
  not symbol emergence (search-index collision — dropped); IB-control
  query duplicated round-5 hits (no new content).

## Round 11 — dream-model limits, canalization, embodiment scaling

- **MuZero interpretability (2306.00840, 2411.04580).** Value-equivalent
  models (not reconstruction); dynamics degrade over long sims but
  planning corrects errors; better latents in board games than Atari. →
  Recipe for dream-model evaluation: value-equivalent, SHORT horizon +
  replan, don't trust long rollouts. Direct implementable constraints.
- **Morphological computation vs integrated info (2108.00904).**
  ANTAGONISTIC: more body-computation → less brain-integration needed.
  → Formal backing for simple controllers: our greedy threshold exploits
  body+ecology computation; learned weights add integration load without
  proportional gain. Keep brains simple ON PURPOSE.
- **Embodiment scaling (2505.05753).** 1000 embodiments; cross-embodiment
  generalization beats data scaling; morphology co-design. → Redesigns
  VISION M4: train ACROSS many bodies, not transfer once to P/Q. Our
  body-transfer line tested the weak version.
- **Canalizing networks (q-bio/0701025, 1902.00056, 1101.1893, CANA).**
  Fitness = attractor robustness → global max always reachable, huge
  neutral spaces; canalizing depth controls attractor counts/basins;
  modular RBNs nearer criticality with more attractors. → Lens on frozen
  behavior: V1d stampede = HIGH canalization (one attractor); CANA
  tooling exists for measuring it. New runs could map policy attractors
  per arm — a repurposing of the WHAT-RETAINS line with teeth.
