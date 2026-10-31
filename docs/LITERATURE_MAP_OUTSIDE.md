# Outside literature map (researched 2026-10-30/31; rounds 1-20 arXiv, rounds 21-30 OpenAlex journals/books)

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

## Round 12 — scalable dreams, reachability-free exploration, in-silico transitions

- **DreamerV2 (2010.02193) + DayDreamer (2206.14176) + Dreamer 4
  (2509.24527).** Behaviors learned PURELY in imagination (discrete
  latents); human-level Atari; real-robot learning without resets in 1
  hour; Minecraft diamonds from offline data. → Dream-model evaluation is
  sufficient for policy learning, not just ranking — and works from
  offline data (our frozen archives ARE offline data). Concrete path:
  train a latent world model on frozen trajectories, evaluate/shape
  candidates inside it, zero new worlds for the model build.
- **WorldGym (2506.00613).** Policies evaluated by Monte Carlo rollouts IN
  the world model; rankings preserved vs real. → THE evaluation protocol
  for our eval problem: keep the frozen one-at-a-time live eval for GO
  verdicts, but use dream-rollouts for SEARCH (propose in the dream, prove
  live). Directly answers V1b's eval bottleneck without live cost.
- **RND (1810.12894) + anti-exploration (2301.13616).** Reachability-free
  novelty bonus (prediction error vs fixed random target); SOTA hard
  exploration. Anti-RND: penalize OOD for offline RL (novelty AVOIDANCE).
  → Both directions now on the table: seek novelty where safe
  (reachability-gated), avoid it where lethal. Our agents die exploring —
  the anti-exploration half may matter more here than exploration.
- **In-silico transitions (1403.3217).** Virtual cells/groups evolving
  complex interactions beyond isolated entities; models as windows on the
  possible AND the actual. → Methodological license: our whole program IS
  this — but the paper reminds us to explore the POSSIBLE (counterfactual
  ecologies/morphologies), not just replay the actual BT world.

## Round 13 — canalization math that runs without simulation, death as group adaptation

- **Canalization and robustness without simulation (1607.04474).**
  c-sensitivity generalizes Derrida values to canalizing functions;
  robustness computable WITHOUT running the network. → Upgrades the
  Round-12 CANA lens from tooling to arithmetic: score frozen policies'
  robustness analytically instead of sampling trajectories. (Still needs
  archived weights — instrumentation gap stands, now precisely specified:
  archive per-agent weights at phase boundaries.)
- **Canalizing dynamics: fewer, bigger basins (1904.00056).** Higher
  canalizing depth → fewer attractors, smaller attractors, LARGER basins
  (explicit formulas). → Testable prediction for our lines: the more
  canalized the policy (V1d stampede = extreme), the larger its basin
  (harder to knock out of it — explains transfer stickiness AND rigidity).
  Selection implication: canalize the robust core, keep the periphery
  flexible. Design rule for future architectures: canalizing core +
  plastic periphery, not uniform plasticity.
- **Geometry of programmed death (1403.7556).** Programmed cell death
  enables group reproduction via snowflake geometry; death is adaptive AT
  THE GROUP LEVEL while costly individually. → Reframes our mortality:
  what if deaths are load-bearing for collective dynamics (clearing
  space? resetting patches)? Before assuming death = failure, check
  whether survivor-only lineages outperform — a frozen-data question
  (compare survivors' descendants... requires lineage tracking we lack).
  Noted as instrumentation requirement, not a claim.
- **Process note (anti-duplication rule).** Rounds 10–12 re-fetched
  already-mapped papers (Dreamer set, RND, in-silico transitions now
  appear in two rounds' worth of fetches). Rule going forward: grep the
  map for each candidate ID BEFORE fetching abstracts; fetch only
  unmapped IDs. This round followed it (3 fetched, 9 skipped as
  duplicates).

## Round 14 — free-energy foundations, bottlenecks, randomization-transfer, reservoirs, niche memory, affordances, predictive maps, basal computation

Outside-the-box round: the frameworks UNDERNEATH our existing pieces
(FEP behind AIF-DDM/FEH; IB behind capacity talk; randomization behind
codebook shuffles; replay's computational meaning; aneural computation).

- **FEP core monograph (1906.10184).** Friston's "a free energy principle
  for a particular physics": Markov blankets compose ensembles across
  spatiotemporal scales; Bayesian mechanics for autonomous things. →
  Our agents ARE particulars (sensorimotor blanket = the agent/ecology
  cut VISION needs formalized). Positions FEH (greedy beats deliberation)
  as an FEP agent with imprecise beliefs — the divergence point between
  the two is now statable: which variational objective survives explicit
  energy billing? Licensed: formulate greedy-0.5 AS an FEP agent and find
  where predictions differ (design work, zero worlds).
- **FEP technical underpinning (2002.04501).** Reply to Biehl et al:
  solenoidal coupling in sparsely-coupled blanket systems; exact vs
  approximate Bayesian inference. → Our replay does exact bookkeeping on
  approximate states — this paper names that regime. The blanket
  formalism gives language for founder-vs-ecology separation (substrate
  language for VISION milestone 4).
- **Information bottleneck, original (physics/0004057).** Tishby: relevant
  information = what signal x carries about y; squeeze through a limited
  code. → Our taste policy (3 floats!) is an extreme bottleneck; IB is the
  principled measure of what those numbers must carry. Licensed: compute
  I(weights; future intake) on FROZEN rows (read-only, zero worlds) as a
  capacity diagnostic — are 3 floats sufficient or saturated?
- **Deep IB (1503.02406).** Layer-wise input/output information; optimal
  architecture/width from IB bifurcations; generalization bounds. →
  Bifurcations predict PHASE CHANGES in optimal capacity. Hypothesis-only
  lens on the V1d stampede (47/48 simultaneous adopts): over-capacity
  collapse at a bifurcation, not just saturation.
- **Domain randomization (1703.06907).** Tobin et al.: train on randomized
  sim; the real world appears as just another variation; 1.5cm real-world
  detection from sim only. → Our per-history codebook shuffle IS domain
  randomization over valence assignments; V1b/V1c transfer = sim-to-real
  where "real" = held-out randomization. Validates the shuffle design
  from the transfer literature's standard trick; V1c tests whether
  randomization-trained policies transfer.
- **Reservoir forecasting + generalized synchronization (2102.08930).**
  Pre-training GS test guides reservoir hyperparameters; Lyapunov-exponent
  reproduction as "well trained" metric. → Fixed random reservoir +
  trained readout rhymes with our tiny-weight + replay architecture.
  Licensed: a GS-style pre-training test for BT_LEARNER_OPTIONS — a
  principled alternative to frozen-by-convention hyperparameters.
- **Outsourcing memory through niche construction (2209.00476).** Lee:
  universal scaling law for optimal memory duration from memory precision
  × environmental rate (remembering-vs-forgetting trade-off). → Our replay
  window (recent/older buffers, 4 passes) is a memory-duration choice the
  law can judge. Licensed: measure codebook volatility vs retention on
  frozen rows (read-only) — are we over- or under-remembering?
- **Niche-construction dynamics (2305.09369).** Nisioti: NC in adaptable
  populations across diverse niches; evolution usually ignores the
  reciprocal environment-modification loop. → Our MATE line is adaptable
  populations + diverse histories WITHOUT the NC loop closed (food
  depletes = modification, but is it inheritable change?). Licensed:
  check whether depletion patterns constitute NC in our ecology
  (read-only row analysis, zero worlds).
- **SAVOR skill affordances (2506.02353).** Skill affordances from
  visuo-haptic perception for FOOD ACQUISITION under temporal variability
  (steak firms as it cools). → Our turn-gating IS a skill affordance
  (turn-suitability of a cue-context) in our exact domain with the same
  nonstationarity. Gives V1/V1b a name + literature; no new claim.
- **Hippocampus as successor representation (2006.11975).** Predictive map
  theory: TD value decomposes into reward × expected state occupancy;
  CA1 firing = transition probability. → Names what our replayPasses=4
  COMPUTE: multi-step backup ≈ SR construction. Instrumentation note
  (third occurrence): we don't archive replay buffers/SR — needed for any
  SR diagnostic (cf. rounds 12, 13).
- **Bioelectric algorithms (1809.10046).** TCS applied to developmental
  bioelectricity: computation in voltage patterns, aneural. → The
  arXiv-available Levin-adjacent work; positions our aneural 3-float
  controllers in the basal-cognition spectrum (Levin proper is
  journal-side, noted not mapped).
- **Scope note (honest misses).** Searched but unmapped (journal-side or
  noise): Levin proper (no arXiv presence), Still thermodynamics-of-
  prediction (no arXiv hit under multiple queries), somatic/neural-
  Darwinism formalizations (noise), autopoiesis-artificial (noise),
  echo-state-as-such (noise; reservoir covered instead), bio-sleep
  consolidation (noise; PER/HER/CLS stand), herding/information cascades
  (noise; quorum/recruitment-cascade coverage stands), Kuramoto sync
  (deferred — our stampede is common-shock, not coupled oscillation).

## Round 15 — meta-learning cores, body variation, group selection, finite populations, degeneracy

Load-bearing adjacent (gradient meta-learners we must position against)
plus far-field (assortment, punishment, finiteness, degeneracy). One
candidate (1910.06933, MLS assortment) caught by the anti-duplication
grep — already mapped, dropped. Rule working as intended.

- **MAML (1703.03400).** Finn: parameters explicitly trained so a few
  gradient steps generalize to new tasks. → Our V1c transfer IS few-shot
  adaptation (1792 ticks on a held-out codebook) with NO gradients and NO
  outer loop — zeroth-order in-agent meta-learning. The comparison that
  matters (future line, not claim): sample-efficiency of carried-weights
  vs MAML-style initializations on the same transfer task.
- **RL² (1611.02779).** Duan: slow RL learns a fast RL algorithm encoded
  in RNN weights. → Our architecture inverted: FIXED update rule
  (taste/actor critics), LEARNED weights. The RSI endgame — learning the
  update rule itself — is RL²'s setup with evolution as the slow loop.
  Frame V1b–V1d as characterizing the fast loop before attempting to
  learn it (slow/fast split made explicit).
- **Morphological variation in ER (2208.02809).** Carvalho: expose
  controllers to morphological/sensor variation for robustness and
  reality-gap crossing; method for choosing variation ranges. →
  Variation-exposure = our shuffle logic applied to bodies/sensors.
  Licensed (read-only, zero worlds): apply their range analysis to our
  flip-count vs transfer data across frozen V1b–V1d rows — is the tax
  proportional to variation distance?
- **Morpho-evolution with learning (2411.18423).** Le Goff: co-generate
  robot designs + controllers via EAs with intrinsic motivation. →
  Body+controller co-design on the Vision trajectory (milestone 4
  substrate + qualifier). Direction noted, no plan.
- **Altruistic punishment + cultural MLS (2405.18419).** Cooney: punishment
  and group competition in CONCERT promote cooperation where neither
  suffices alone (Boyd/Gintis/Bowles/Richerson formalized). → Costly
  mechanisms that stabilize cooperation — design vocabulary for the
  courtship/recruitment channel (currently mechanism-free). With the
  mapped 1910.06933 (assortment×group selection): structure + incentives,
  both formalized, both unbuilt.
- **Cooperation on networks (1003.0088).** Konno: b/c > ⟨knn⟩ (not ⟨k⟩);
  regular graphs favor cooperation most. → Our encounter problem is
  STRUCTURAL (0.05–0.15/main, P(0)~60%): who meets whom, how often.
  Density was tried (MATE-DENSE backfired via energy); STRUCTURE ≠
  density — assortment/topology is the untried axis. Licensed: assortative
  encounter structures as a future mating-line knob.
- **Finite populations destroy waves (2006.00397).** Griffin: finite
  spatial replicator qualitatively differs from infinite (traveling waves
  destroyed); fluid limit justifies diffusion terms. → Formal sibling for
  our drift-barrier note: N=24 finite-size effects aren't just noise,
  they're REGIME changes. Caution on all population-line interpretations;
  infinite-population intuitions do not transfer.
- **Degeneracy (0907.0510).** Whitacre: degeneracy (many-to-one
  genotype→phenotype) builds neutral networks that ENABLE evolvability;
  design principles decide whether robustness leads there. → Our
  12-cue→binary-turn mapping is degenerate; same-val retention (0.95)
  may ride neutral ridges while flips fall off them. Hypothesis-only
  (needs genotype sampling we lack).
- **Instrumentation demand (4th occurrence).** Rounds 12–14 plus this one
  converge: archive per-agent weights (and replay buffers) at phase
  boundaries. IB capacity, SR diagnostics, neutral-ridge analysis, GS
  hyperparameter tests ALL need them. Stated once, firmly: the next
  instrument that doesn't archive weights must justify the omission.
- **Scope-note misses.** Hamilton/inclusive-fitness, Zahavi/costly
  signaling, Waddington/assimilation, Gigerenzer/ecological-rationality
  (concept already ours via FEH), Still thermo-of-prediction, herd
  behavior, bio-sleep, autopoiesis, echo-state — journal-side or noise.

## Round 16 — learnability of foraging, rational inattention, sparse collectives, choice redundancy, morphological computation

Two more duplicates caught by the grep (2004.10671 normative patch
foraging + 1802.10546 curiosity survey — both already mapped with entries
covering the intended points). Dropped before fetching. Rule working.

- **Patch foraging in deep RL (2210.08085).** Wispinski: patch foraging
  has a KNOWN optimal solution yet is hard to discover with current deep
  RL; first demonstration that ML agents CAN learn it. → The mapped
  normative theory (2004.10671) says what optimal IS; this says learning
  it is HARD. Our agents face the same task with 3-float policies and 4
  replay passes — the learnability gap (optimal vs learnable) is now the
  right frame for the foraging line, not optimality alone. Licensed:
  compare our policies' residence times against MVT on frozen rows
  (read-only, zero worlds) — are they optimal, satisficing, or stuck?
- **Revealed RI + revealed preference (2106.14486).** Pattanayak:
  equivalence map between rational-inattention tests and classical
  revealed preference (payoff monotonicity unifies both). → Foundations:
  information-acquisition rationality and utility maximization are the
  SAME test under the map. Our FEH result (greedy beats deliberation)
  can be stated in either language — pick the one that makes the
  sharpest prediction for the next line.
- **Robust RI games (2306.09964).** Denti: flexible information
  acquisition REDUCES welfare vs predetermined information, yet the two
  regimes are behaviorally INDISTINGUISHABLE in most environments. →
  Direct formal sibling of FEH: deliberation costs welfare while matching
  behavior — exactly our greedy-0.5 finding (simpler wins, same
  outcomes). The welfare gap without a behavioral gap explains WHY
  selection favors the cheaper rule. Cite as the mechanism behind the
  theorem, not just an analogy.
- **Sparse-neighborhood collective motion (2404.18675).** Haghsheno:
  multiplicative-noise Vicsek variant with MORE individual movement in
  sparsely populated neighborhoods; built for the low-velocity,
  low-density regime. → Our encounter regime (0.05–0.15/main, P(0)~60%)
  IS the sparse neighborhood. The model's density-dependent individuality
  (lonely particles move differently) is a testable alternative to our
  diffusion estimate: do our flies' encounter rates follow the sparse
  correction? Licensed: refit the encounter estimate with the sparse
  term (read-only, zero worlds).
- **Female choice under conflict (1807.09131).** Li: choice depletes
  variance and can go redundant; fit males sire unfit daughters under
  GxE/sexual antagonism. → Echoes our exact-copy NOGO from the choice
  side: transmission without variation leaves nothing to choose AND
  nothing to gain — choice redundancy is the same null from the other
  direction. Strengthens the case that the mating line needs inherited
  VARIATION first (mutation+lineage), not better choice protocols.
- **Quantifying morphological computation (1503.05113).** Ghazi-Zahedi:
  information decomposition of the sensorimotor loop measuring how much
  body+environment contribute to behavior. → The missing measure for
  Vision milestone 4 / BODY_TRANSFER: transfer failure (V2 FAIL-body)
  vs transfer success (TURN-GATE) can be stated as morphological
  computation NOT vs DOES transfer. Licensed: compute the decomposition
  on frozen body-transfer rows (read-only) — is the learned policy in
  the weights or in the body-environment loop?
- **Scope-note misses.** Charnov MVT original, Gigerenzer ecological
  rationality, Stearns life-history, Trivers parental investment,
  Der homeokinesis proper, Still thermo-of-prediction — journal-side or
  noise. Bio-sleep, herd, autopoiesis, echo-state remain unmapped
  (standing).

## Round 17 — information structure, delayed generalization, capacity minimality, dreams as regularization, macroscales

One duplicate caught pre-fetch (1810.02274 episodic curiosity — mapped
with a covering entry). Rule working.

- **PID, original (1004.2515).** Williams & Beer: redundancy as minimum
  information any source provides per outcome; lattice over source sets
  (redundant/unique/synergistic). → The missing lens on our cue
  codebooks: are the 12 cues redundant (same message 12 ways),
  synergistic (meaning only in combination), or unique? Flip effects
  should differ by PID component — a flipped redundant cue is backed up,
  a flipped synergistic cue breaks the combination. Licensed: PID of the
  codebook vs transfer correctness on frozen rows (read-only, zero
  worlds) — predicts WHICH cues resist extinction before running a
  world. Directly serves the floor-attribution follow-up.
- **Grokking (2201.02177).** Power et al.: flat memorization then SUDDEN
  perfect generalization, well past overfitting; smaller datasets need
  more optimization. → The learning-dynamics contrast case for our
  saturating curve (fast-then-flat vs flat-then-jump). Our agents never
  grok flipped cues (no late jumps through seg4) — why not? Hypothesis:
  grokking needs overparameterized memorization capacity first; our
  3-float policies cannot memorize, so there is nothing to grok FROM.
  Testable reading: capacity floor, not data floor. Note as lens, not
  claim.
- **Lottery ticket (1803.03635).** Frankle & Carbin: dense nets contain
  sparse trainable subnetworks (winning tickets) findable by pruning. →
  Capacity-minimality sibling for IB (Round 14) and degeneracy (Round
  15): are our tiny policies minimal, or do they contain dead weight?
  Licensed: magnitude-prune frozen policies (read-only, zero worlds) and
  test whether transfer survives — if yes, the policy is redundant and
  the floor may live in the redundant part.
- **Overfitted brain (2007.09560).** Hoel: dreams evolved to assist
  generalization (anti-overfitting via corrupted/noisy replay). →
  Dream-thread upgrade (Rounds 11–12: Dreamer/WorldGym as evaluators):
  dreams are not just simulators but REGULARIZERS. Our replay (4
  passes/observe, exact replays) is the opposite of corrupted — it may
  OVERFIT the train codebook, which would explain rigidity on flipped
  cues. Licensed: noisy-replay variant as a V1h+ candidate (explicitly
  behind surprise-gating in the queue, not a new line now).
- **Macroscale search (1908.07565).** Griebenow: finding the most
  informative macroscale of a network (spectral clustering over the
  exponential scale space). → Operationalizes the Hoel program (causal
  emergence) that the map cites but never uses: which level of our
  system carries the transfer effect — weights, cue-behavior mappings,
  or lineage statistics? The V1b–V1e verdicts live at the behavioral
  level (gaps); the weights level is unarchived (instrumentation gap,
  6th occurrence). Licensed: when weights ARE archived, the macroscale
  test is which level predicts transfer — until then, stated as the
  question, not answered.
- **Scope-note misses.** Krakauer individuality, Ay predictive
  information, Caraco risk-sensitive foraging, Hamilton inclusive
  fitness, Zahavi signaling, Waddington assimilation, Stearns life
  history — journal-side or noise. Hoel proper enters via the dreams
  paper, not the monograph.

## Round 18 — planning as inference, progressive retention, small-population genetics

One duplicate caught pre-write (1706.02556 surprise search — already
mapped with a covering entry that anticipates the surprise-machinery
point). Rule working (5th catch).

- **Control as inference (1805.00909).** Levine: RL/optimal control
  reformulated as probabilistic inference (tutorial + review). → The
  framework that states WHEN greedy is optimal: planning-as-inference
  with exact posteriors vs approximations. Our FEH result (greedy 0.5
  wins under uncertain precision) is an instance — the tutorial gives
  the conditions to check rather than re-derive. Licensed: write our
  turn policy as the inference it approximates and name the gap
  (design note, zero worlds).
- **Progressive networks (1606.04671).** Rusu et al.: freeze old columns,
  add new ones with lateral connections — immune to forgetting, transfer
  via reuse. → The architecture our transplant ALREADY resembles
  (frozen train weights transplanted into a fresh agent that keeps
  learning). The difference: progressive nets GROW columns; we OVERWRITE
  one set. The design space between them (freeze + transplant + grow?)
  is now statable. Licensed: a freeze-plus-grow variant as a future
  retention architecture (not a line yet).
- **Muller's ratchet rate (1206.6782).** Neher: the fittest class is lost
  by rare fluctuations; quantitative rate of the clicks. → Small-population
  genetics for our N=24 lines: asexual founders accumulate load by
  fluctuation, not just selection. Formalizes WHY the mating track
  matters beyond encounters — recombination is the ratchet escape.
  Licensed: track fittest-class loss across generations in the mating
  line once inherited variation exists (measurement spec, not started).
- **Small-noise ratchet (2606.15842).** Heinzel: Fleming-Viot SDE
  approximation with explicit fluctuation-size parameter. → The
  quantitative regime complement to Neher: WHEN does the ratchet click
  fast vs slow as a function of fluctuation size? Our founders are few
  and noisy — this is the parameter regime that decides whether a
  lineage degrades within our experimental horizons. Same license as
  above (one measurement spec, two papers).
- **Scope-note misses.** Der homeokinesis proper, Ay predictive
  information, GARD compositional inheritance, Waddington assimilation,
  Stearns life history, Hamilton inclusive fitness, Zahavi signaling —
  journal-side or noise. Surprise search correctly excluded (mapped).

## Round 19 — islands, drift in subdivisions, genotype-phenotype navigability, NK ruggedness

No duplications (all IDs grepped clean, including substring variants).
Rate-limit lesson institutionalized: verify HTTP status per batch, pipe
instead of temp files (MSYS/Windows temp mismatch), back off on 429
rather than retry-looping.

- **Dynamic island model (1801.01620).** Meng: spectral-clustering
  islands with migration policies to preserve diversity against
  convergence. → Our 6 histories ARE islands with ZERO migration. The
  paper supplies the missing piece as design space, not prescription:
  what migration topology/rate would connect our lineages without
  collapsing their divergence? Licensed: island-with-migration as a
  future mating-line topology (unblocks lineage mixing without
  panmixia).
- **Neutral drift in subdivided populations (q-bio/0606037).** Blythe:
  fixation probabilities/times under drift in subdivided populations;
  general formula via forwards-backwards duality; language change obeys
  the same math as biology. → Two gifts: (1) fixation-time SCALING with
  subpopulation count — how long a lineage needs to be observed before
  drift-vs-selection is adjudicable (our N=24, 6-island design sits
  inside this formalism); (2) the language parallel licenses treating
  our transmitted weights as utterances (cultural-evolution math
  applies directly to maternal copying). Licensed: compute expected
  fixation times for our bank geometry (read-only, zero worlds).
- **Phenotype-size distributions (1702.00351).** Manrubia: navigability
  requires astronomically large genotype networks (same phenotype,
  drift-connected); exhaustive counts for RNA/protein. → Our policies
  are 3-float + tiny actor/critic maps — is the neutral network around
  a working policy large enough to drift on, or is every step lethal?
  This decides whether mutation (V1b's σ=0.05) explores or breaks.
  Licensed: neutral-neighborhood sampling of frozen V1 weights
  (read-only perturbation analysis, zero worlds) — measure the fraction
  of ±σ neighbors that preserve transfer performance.
- **Muddling through NK landscapes (2006.08333).** Chanda: under high
  complexity (pervasive interdependence), cluster-local moves beat
  global search; more clusters → better. → Small mutations are
  cluster-local moves; our σ=0.05 is muddling, not jumping. Predicts
  V1b's outcome shape: gradual improvement where the landscape is
  locally smooth, stalls where epistasis is dense. The floor-attribution
  follow-up (which cues resist) can now be framed as epistatic-density
  mapping.
- **NK fitness landscape, K/N→α regime (2508.12464).** Chen: statistical
  physics of the Kauffman model at proportional epistasis. → The formal
  sibling: as K/N grows, the landscape undergoes phase change to
  uncorrelated ruggedness (no gradient to follow). Our cue codebooks
  (12 cues × 4 bits interacting through one policy) sit somewhere on
  this axis — unknown where. Licensed: estimate effective K/N from
  frozen cue-ablation rows (read-only); if high, expect V1b's
  single-step mutations to stall (needs recombination, not point
  mutation — back to the mating line's deepest question).
- **Scope-note misses.** DeWitt costs-of-plasticity, Ay predictive
  information, GARD compositional inheritance, Waddington assimilation,
  Stearns life history, Hamilton inclusive fitness, Zahavi signaling,
  Der homeokinesis — journal-side or noise. EES proper unmapped (no
  arXiv presence under multiple queries).

## Round 20 — continual learning canon, meta-learning first-order, population-based training, learned optimizers, QD via CMA-ES

No new tools needed: `id_list` batch-verifies known papers in one call.
Anti-duplication: full-ID greps (substring "04474" hit is the round-13
canalization paper 1607.04474, not the LSTM optimizer 1606.04474).

- **Dark Experience Replay (2004.07211).** Buzzega: rehearsal + knowledge
  distillation on buffered logits, no task boundaries (general
  continual learning). → Our replay is rehearsal WITHOUT distillation.
  DER's prescription is precise: match old OUTPUTS on replayed inputs,
  not just replay inputs. Licensed V1h-alternative: "dark" replay
  (distill) vs implemented noisy replay (corrupt) — two distinct
  anti-overfitting operators, testable head-to-head on a fresh bank.
- **GEM (1706.08840).** Lopez-Paz: episodic memory with gradient
  constraints + forward/backward TRANSFER metrics. → We have phases
  (A/B/C) and no transfer metrics. Licensed: compute GEM-style
  forward/backward transfer on frozen phase rows (read-only, zero
  worlds) — are the V1 phases helping or hurting each other?
- **Reptile (1803.02999).** Nichol: first-order meta-learning —
  initializations that fine-tune fast. → Our transplanted weights ARE
  initializations; the V1b–V1e transfer gaps ARE Reptile's objective
  (post-adaptation performance). Reframes the whole transfer line as a
  meta-learning evaluation, with Reptile's update as a candidate
  improvement over checkpoint-carryover (move toward fast-adapting
  weights, not just trained weights).
- **PBT (1711.09846).** Jaderberg: population + hyperparameters jointly
  optimized; exploit (copy better members' weights) + explore (mutate
  hyperparameters). → This is our mating/inheritance line in ML form:
  V1's exact copy = exploit WITHOUT explore; V1b's mutated copy = full
  exploit+explore on WEIGHTS (ours) rather than hyperparameters
  (theirs). Licensed reading of V1b as a 2-member PBT run — and the
  obvious V1c+: periodic copying from the better arm (full PBT loop,
  not just parallel arms).
- **Learned optimizers (1606.04474).** Andrychowicz: LSTMs AS optimizers,
  learned by gradient descent, beating hand-designed ones on-task and
  generalizing. → The RSI endgame at optimizer level (RL² was
  algorithm-level, round 15). Positions V1g's surprise-gating as one
  hand-designed optimizer component; the learned-optimizer path would
  discover the gating (or better) automatically. Thesis-level framing,
  not a line.
- **CMA-ME (1912.02400).** Fontaine: QD via CMA-ES emitters — rapid
  illumination of continuous behavior spaces. → Direct upgrade path
  for the licensed-but-undesigned QD archive: CMA-ME over
  cue-response-profile space instead of MAP-Elites. Noted as the
  implementation choice when the archive line freezes.
- **Scope-note misses.** Population-genetics on arXiv is thin (island/
  fixation/soft-sweep/assortment queries all noise); the field lives in
  journals — future mapping there needs a different discipline (reviews
  or textbooks, not live arXiv). Same for EES proper, Der homeokinesis,
  GARD, Waddington, Stearns, Hamilton, Zahavi.

## Round 21 — associative learning canon I: prediction error, blocking, attention, comparison

New discipline (answers round 20's scope-note): OpenAlex live API for
journals/books/arXiv-alien classics. Two-pass: relevance-ranked search,
then exact-title second pass; books/chapters with no OpenAlex record are
cited [canon] with full biblio; critiques preserved where found. The
classics reframe our floor in one move: our tasteUpdate IS a delta rule,
our transfer IS a devaluation test, our gain IS Pearce-Hall.

- **Rescorla & Wagner 1972 [canon].** "A theory of Pavlovian
  conditioning." In Black & Prokasy (Eds.), Classical Conditioning II
  (Appleton-Century-Crofts). The delta rule: associative change =
  salience × (outcome − expectation). → Our tasteUpdate is Rescorla-
  Wagner on 96-dim phi. Fifty years of RW boundary conditions now apply
  to us wholesale — blocking and overshadowing below are not bugs but
  PREDICTED phenomena of our architecture. Supporting records: "Equilibria
  of the Rescorla-Wagner model" (2003, 200 cites, formal analysis) +
  "The widespread influence of the Rescorla-Wagner model" (1996 review).
- **Kamin 1967/69.** "Predictability, surprise, attention, and
  conditioning" (symposium vol., 1485 cites). BLOCKING: prior training
  of A blocks learning about redundant B in AB compounds. → TOP MOVE:
  per-channel frozen-weights overshadowing test (zero worlds, NEW data
  source — rows carry full taste/actor vectors per agent). Map phi dims
  to cue bits; the prediction is sharp: error concentrates on cues whose
  flipped bit sits in a low-|weight| channel (learning was blocked by a
  more salient channel in train). Elemental interference, not rigidity.
- **Mackintosh 1975 [canon].** "A theory of attention" (Psych Rev).
  Associability tracks PREDICTIVENESS (good predictors gain attention,
  poor ones lose it) — fixed by history, changes slowly. → The anti-gain
  theory: flipped cues lost associability in train and cannot regain it
  fast. Decides the next intervention: if Mackintosh holds, we need an
  ASSOCIABILITY-RESET line; if Pearce-Hall holds, keep the gain.
  Supporting: "Toward a Unified Model of Attention" (2001, 309 cites).
- **Pearce & Hall 1980 [canon].** "A model for Pavlovian learning"
  (Psych Rev). Associability tracks SURPRISE/novelty (uncertain outcomes
  command processing). → We REDISCOVERED Pearce-Hall without knowing it:
  surprise-gating (V1f–V1i) IS associability ∝ surprise. Frames the
  deployed instrument as independent validation of a 45-year-old theory
  and licenses PH's further predictions (e.g., associability should fall
  as test becomes predictable — check gain-firing decay across segments,
  read-only). Supporting: PALMS simulator (2026, executable RW/PH models
  — could cross-check our learner against analytic RW, zero worlds).
- **Miller & Matzel 1988 [canon].** "The comparator hypothesis"
  (Psych Learn Motiv 22). Performance = comparison among associations,
  not readout of one — the learning-vs-performance distinction,
  formalized 1988. → This IS our critic-vs-actor split with 40 years of
  precedent: values can be correct while behavior is wrong (comparator
  output), exactly the BH actor-side hypothesis. Strengthens the
  specified per-cue-values test. Supporting: "Overshadowing and latent
  inhibition counteract each other" (1998, 83 cites, comparator
  support) + "Local context and the comparator hypothesis" (1993).
- **Pearce 1987 [canon].** "A model for stimulus generalization"
  (Psych Rev). Configural theory: compounds act as wholes, generalization
  by similarity. → Our linear learner is ELEMENTAL by construction
  (sums phi features); Pearce gives the rival ontology. If the
  overshadowing test (Kamin bullet) comes back positive, elemental wins
  and the fix is channel reweighting; if negative, configural
  (unique-cue) coding becomes the licensed architecture change.
  Supporting: "Summation: assessment of a configural theory" (1997) +
  "connectionist theory of configural" (2002, 228 cites).
- **Scope-note misses.** Wagner SOP (1981) unqueried (standard operating
  procedures — memory-prime theory, would refine the replay-timing
  question); Couvillon/Bitterman insect-learning canon unmapped.

## Round 22 — extinction canon: context, inhibition, reconsolidation, pre-exposure, spacing

Extinction is not unlearning — a century of evidence the program has been
rederiving. Every bullet converts a floor observation into a textbook
phenomenon with a prescribed manipulation.

- **Bouton 2004.** "Context and behavioral processes in extinction"
  (Learn Mem, 1808 cites; record title has an OpenAlex ": Table 1"
  artifact). Extinction is CONTEXT-GATED and fragile (renewal,
  reinstatement, spontaneous recovery); the original memory is never
  erased. → The transfer floor is EXPECTED under Bouton: test
  performance = competition between train and test memories, and the
  "tax" is retrieval failure, not learning failure. Prediction ready
  to check read-only: return-to-train segments should RESTORE old
  behavior (renewal) — V1d/V1e seg structures may already contain it.
  Supporting: Bouton 2006 "Contextual and temporal modulation" (671).
- **Craske et al. 2014.** "Maximizing exposure therapy: an inhibitory
  learning approach" (Behav Res Ther, 2337 cites). Extinction = NEW
  inhibitory learning that competes at retrieval; optimize it by
  maximizing mismatch (expectancy violation), varying context, dropping
  safety signals. → Our gain maximizes mismatch (expectancy violation
  by construction) — Craske validates the instrument AND prescribes
  the next knobs: context variation during seg1 and safety-signal
  removal. Clinical-to-ecology translation precedent.
- **Nader, Schafe & LeDoux 2000.** "Fear memories require protein
  synthesis in the amygdala for reconsolidation after retrieval"
  (Nature, 2706 cites). Retrieved memories go LABILE and must
  reconsolidate; blockade in the window erases. → Our replay
  REACTIVATES train associations continuously — reconsolidation theory
  says each reactivation opens a plasticity window our live+replay mix
  may already exploit, and a replay-SUPPRESSION window post-reactivation
  is the control experiment that proves it (future line, cheap: gate
  replay off for N ticks after large-error contacts).
- **Lubow 1973/76.** Latent inhibition + conditioned attention theory
  (book; "Latent inhibition and conditioned attention theory" 1976,
  732 cites). Pre-exposure to a stimulus RETARDS subsequent conditioning
  to it. → Novel read-only prediction: flip difficulty ∝ train-phase
  contacts per cue (pre-exposure magnitude). Correlate train contacts
  with seg1 correctness on frozen rows — if LI holds, the floor is
  partly train-inflicted and train-duration becomes a knob.
- **Quirk et al. 2000.** "The role of ventromedial prefrontal cortex
  in the recovery of extinguished fear" (J Neurosci, 957 cites).
  Extinction has its OWN circuit (infralimbic), dissociable from the
  fear circuit. → Anatomical precedent for actor-side: separate
  extinction machinery that can fail while values are intact. If our
  per-cue-values test localizes actor-side, Quirk is the biological
  twin (IL ≈ actor-side plasticity locus).
- **Urcelay, Wheeler & Miller 2009.** "Spacing extinction trials
  alleviates renewal and spontaneous recovery" (97 cites). Massed
  extinction is fragile; spaced persists. → FREE manipulation for a
  future line: redistribute the same seg1 ticks (spaced encounters)
  instead of adding ticks — tests whether the floor is a scheduling
  artifact at zero extra world-cost.
- **Scope-note misses.** Bouton 1993/2002 ambiguity papers (context
  canon statements, no clean record hit); Hermans evaluative-conditioning
  renewal (2019 reinstatement record seen, marginal).

## Round 23 — habit vs goal-directed, devaluation, arbitration, signal detection

The round that renames our floor: a transfer test with flipped valences
IS an outcome-devaluation test, and devaluation-insensitivity IS habit —
by the field's own operational definition since 1981.

- **Adams & Dickinson 1981 [canon].** "Instrumental responding
  following reinforcer devaluation" (QJ Exp Psych 33B:109–121). The
  paradigm: train action→outcome, DEVALUE the outcome, test in
  extinction. Insensitivity = habit (S–R); sensitivity = goal-directed
  (A–O). → Our BH condition (train-benign → test-harmful) is LITERALLY
  devaluation, and 80% cruising is devaluation-INSENSITIVITY: the BH
  floor is habitual control by definition. One sentence reframes three
  turns of forensics — and the prescription is the field's: shift the
  MB/MF balance (Daw bullet), don't just amplify errors.
- **Dickinson & Balleine 1994.** "Motivational control of goal-directed
  action" (Anim Learn Behav, 1005 cites). Canonical A–O vs S–R
  statement (contingency + value knowledge). → Checklist for our agents:
  contingency knowledge (do turn rates track cue validity? yes, 0.81) vs
  value updating (BH: no). Failure localizes to the VALUE arm —
  converges with the actor-side hypothesis from a second tradition.
  Supporting: "goal-directed account of action slips" (2022 — "reliance
  on old contingencies" = our carried policy, in humans).
- **Daw, Niv & Dayan 2005.** "Uncertainty-based competition between
  prefrontal and dorsolateral striatal systems" (Nat Neurosci, 2533
  cites). Model-based/model-free ARBITRATION by uncertainty. → The
  missing instrument in our architecture: we have no arbitrator (cruise
  default + greedy threshold). A future line gets its design here —
  uncertainty-gated switching between carried policy and live values,
  with Daw's uncertainty signatures as the readout checklist.
- **Tolman 1948 [canon].** "Cognitive maps in rats and men" (Psych
  Rev 55:189–208). Latent learning: maps form without reinforcement.
  → Model-based lineage head for the dream-model project (maps learned
  off-line, used on-line) — ancestry, not a line. Supporting modern
  commentary records exist ("Re-Charting," 2024) but the original has
  no clean OpenAlex record.
- **Green & Swets 1966 [canon].** Signal Detection Theory and
  Psychophysics (Wiley). Sensitivity (d′) vs criterion (c) — the
  FORMAL critic-vs-actor split, 60 years old. → This is the MEASUREMENT
  framework for the specified actor-side test: report d′ and c per cue
  separately. Criterion shifts with stable d′ = actor-side, proven in
  one analysis. Supporting: 1969 operant-behavior review (145 cites) +
  1967 Science review of the book.
- **Tricomi, Balleine & O'Doherty 2009.** Dorsolateral striatum in
  human habit learning (J Neurosci, 769 cites). Habit has a locus
  (DLS); goal-directed has another (DMS/vmPFC). → Translation
  precedent (rat→human) for our learner→actor mapping, and a reminder
  that the dissociation is anatomical, not just computational.
- **Scope-note misses.** Balleine & Dickinson 1998 (goal-directed
  follow-up, no clean hit — the 1994 covers it); De Wit & Dickinson
  2009 (human devaluation, unqueried).

## Round 24 — hippocampal replay canon, sleep functions, prioritization

Replay is not our invention: the hippocampus does it (forward AND
reverse, awake AND asleep), and the normative theory of WHAT to replay
was derived independently — converging with our surprise-gating.

- **Wilson & McNaughton 1993 [canon].** "Dynamics of the hippocampal
  ensemble code for space" (Science 261:1055–1058; record via 1994
  erratum + "Mismatch correction" 1996, 445 cites). Ensemble
  reactivation during sleep. → Biological precedent for the replay
  buffer itself: offline reactivation of waking patterns is conserved
  machinery, not an ML hack. Our uniform replay = the null biological
  model (undifferentiated reactivation).
- **Diba & Buzsaki 2007.** "Forward and reverse hippocampal
  place-cell sequences during ripples" (Nat Neurosci, 1205 cites).
  Reverse replay runs BACKWARD from outcome — credit assignment by
  construction. → NEW OPERATOR (distinct from noisy/dark/downscale):
  reverse-order replay ( worthy of a future head-to-head: uniform vs
  reverse vs surprise-prioritized on one bank). Our replay is
  direction-agnostic; biology isn't.
- **Karlsson & Frank 2009 [canon].** "Awake replay of remote
  experiences in the hippocampus" (Neuron). Replay happens DURING
  behavior, biased to remote/needed experience. → Validates our ONLINE
  replay (replay interleaved with acting, not just offline) and suggests
  the remote-bias: replay what's NOT currently encountered (complements
  live input — the theoretical parent of rarity-prioritization).
  Supporting: "Task demands predict a dynamic switch in awake replay
  content" (2017, 129 cites) + "content of hippocampal replay"
  (2017, 178 cites).
- **Mattar & Daw 2018.** "Prioritized memory access explains planning
  and hippocampal replay" (Nat Neurosci, 393 cites). NORMATIVE:
  replay what maximizes Bellman-error utility (gain + need). →
  Independent derivation of surprise-gating from first principles: their
  normative theory and our empirical instrument CONVERGE (prediction-
  error prioritization). Strongest external validation the deployed
  instrument has. Also prescribes the missing term: NEED (our gain has
  surprise but no need — a need-weighted gain is the licensed upgrade).
- **Diekelmann & Born 2010.** "The memory function of sleep"
  (Nat Rev Neurosci, 3751 cites). Consolidation canon: sleep replays
  stabilize declarative/skill memory; same-val retention is the
  predicted outcome. → Our 0.95 same-val retention MATCHES the
  consolidation signature — the transfer line preserves what sleep
  preserves. Positions seg1-test as a (failed) reconsolidation probe.
- **Tononi & Cirelli 2003/06 [canon].** Synaptic Homeostasis Hypothesis
  (Soc Neurosci abstr 2003; Sleep Med Rev 2006): sleep = GLOBAL
  DOWNSCALING preserving relative weights — anti-entrenchment by
  design. → NEW OPERATOR (fourth): downscaling replay (multiply by
  <1 per replay pass). Extinction-favoring, distinct from corrupt
  (noisy), match-outputs (dark), reverse. Head-to-head candidate.
  Controversy preserved: "Why I Am Not SHY" (Hobson, 34 cites) +
  "Time to Be SHY?" (Heller, 113 cites) — the hypothesis is contested,
  use it as an operator, not a truth.
- **Scope-note misses.** Foster & Wilson 2006 (reverse replay, unqueried
  — Diba covers it); Girardeau et al. 2009 (ripple disruption impairs
  memory — causal proof, unqueried).

## Round 25 — foraging/search theory, collective inhibition, honest signaling, grounded metrics

Search, collectives, mating, measurement: one round of formalisms the
program has been missing (patch-leaving rules, sparse search, quorum
mechanics, signal honesty, behavioral distance).

- **Charnov 1976 [canon].** "Optimal foraging, the marginal value
  theorem" (Theor Pop Biol 9:129–136). Leave a patch when marginal
  intake drops to the environmental average. → THE benchmark our
  turn/cruise policy lacks: MVT-optimal leaving vs our greedy threshold.
  The encounter problem (mates, food) is patch-encounter; GUD (giving-up
  density) is the measurable our rows can approximate. Supporting:
  hummingbird MVT test (1978, 239 cites) + "Optimal giving-up times"
  (213 cites).
- **Vergassola, Villermaux & Shraiman 2007.** "Infotaxis as a strategy
  for searching without gradients" (Nature, 890 cites). Optimal search
  for sparse nondirectional cues = maximize expected information gain.
  → Formalizes the mate-encounter problem (rare, odor-free targets):
  infotaxis is the optimal policy our random-walk foragers don't
  implement — bounds how much encounters could improve. Supporting:
  multi-agent collaborative infotaxis (2019 — the population-track
  version, when mating reopens).
- **Seeley et al. 2011.** "Stop signals provide cross inhibition in
  collective decision-making by honeybee swarms" (Science, 327 cites).
  Quorum + CROSS-INHIBITION (stop signals against rival sites) prevents
  stampedes; decision without central control. → THE named herding
  antidote for V1d's 47/48 stampede: cross-inhibition between options,
  not just diversity maintenance. Design pattern for the next selection
  line, with implementability proven in minimal agents: kilobot
  translation (2024, 12 cites).
- **Zahavi 1975 [canon].** "Mate selection — a selection for a
  handicap" (J Theor Biol 53:205–214). Honest signals must be COSTLY
  (waste is the guarantee). → Designs the channel-4 courtship gate:
  cheap signals WILL be ignored (predicts Option-A failure mode + fix —
  make courtship displays energetically costly to be credible). And the
  round-20 scope-miss is closed (it was journal-side, as predicted).
  Controversy preserved: "Handicap mechanism does not work" (1986,
  128 cites) + "erroneous hypothesis" (2019, 111 cites) — contested,
  use as design constraint, not truth.
- **Ferns, Panangaden & Precup 2011.** "Bisimulation metrics for
  continuous MDPs" (SIAM J Control Optim, 100 cites). Behavioral
  distance: states are close if they imply the same futures. →
  REPLACES Hamming for the geometry retry (round 21's honest
  inconclusive): confusability = bisimulation distance under the
  carried policy, not bit distance. The right metric was in the
  literature all along.
- **Andersson 1994 [canon] + Viswanathan et al. 1999 [canon].**
  Sexual Selection (Princeton, the mate-choice canon) + "Optimizing
  the success of random searches" (Nature, Lévy-flight optimum).
  → Revival-rationale pieces for the cold tracks: choice (Andersson —
  our mating has NO choice; add it) + search (Lévy/Humphries-2012-
  in-situ 338 cites — our foragers' walk vs optimal sparse search).
  Supporting: reviews-of-Andersson records + Humphries in-situ test.
- **Scope-note misses.** Maynard Smith & Szathmáry transitions
  (individuality canon for RSI definitions, unqueried); Boyd & Richerson
  dual inheritance (horizontal-transmission line, unqueried); Todorov
  optimal feedback control (motor track, cold).

## Round 26 — action and body: the actor-side canon (active inference, somatic markers, allostasis)

The VALUE-PROBE verdict (values 1.0, behavior 0.09) is a problem the
field has owned for decades: how actions follow (or ignore) values.
This round is the actor's library.

- **Friston 2010.** "The free-energy principle: a unified brain
  theory?" (Nat Rev Neurosci, 8087 cites). Action as inference:
  policies minimize EXPECTED free energy (pragmatic + epistemic
  value). → Our threshold implements a degenerate policy (fixed .5 +
  cruise prior, no epistemics). Friston gives the FORMAL actor-side:
  replace the greedy threshold with EFE policy selection; turn becomes
  information-seeking where values are uncertain (BH cues!) and
  pragmatic where certain. Future instrument, fully specified by the
  theory.
- **Parr, Pezzulo & Friston 2022.** "Active Inference" (MIT Press
  tutorial papers, 246 cites). Implementable active inference (generative
  model + EFE + pymdp-style updates). → The HOW for the Friston bullet:
  a discrete-state active-inference agent on our 12-cue codebook is a
  weekend build once the line freezes — no new math required.
- **Damasio 1994 [canon].** Descartes' Error (Putnam). Somatic marker:
  bodily states bias decisions before reason concludes. → Our actor
  ignores the body (threshold fixed while energy swings −20 to −60).
  Design: energy-gated threshold (somatic marker as a number — turn
  criterion falls as reserves fall? or rises?). Supporting: origin-of-
  markers record + German review of the book (proof of canon).
- **Sterling & Eyer 1988 / McEwen tradition [canon + record].**
  Allostasis (predictive regulation) vs homeostasis (reactive).
  Supporting: "Allostasis, Homeostats, and the Nature of Stress"
  (2002, 373 cites). → Frames BH failure as missing ALLOSTASIS: our
  agents turn only AFTER harm (reactive); allostatic agents turn BEFORE
  (predicted). Licensed read-only analytic (specified): turn timing vs
  first-harm-contact per BH cue on frozen rows — anticipation test.
- **Seth 2013.** "Interoceptive inference, emotion, and the embodied
  self" (Trends Cogn Sci, 1816 cites) + 2014 homeostasis/decision
  follow-up. Valuation OF the body (interoceptive prediction errors as
  feelings that guide choice). → Our critic is taste-only; Seth says
  add the interoceptive channel (energy-trajectory value). The actor
  would then have TWO value streams — the BH block might be their
  conflict (taste says harm, body says "still rich"), testable once
  per-cue values log both.
- **Clark 2013.** "Whatever next? Predictive brains, situated agents"
  (Behav Brain Sci, 5925 cites). The predictive-processing manifesto.
  → Positions our delta-rule learner inside the PP tradition (ancestor,
  not rival) and imports its open problems (precision-weighting =
  gain by another name — our surprise-gating is precision dynamics!).

## Round 27 — modulation: cue-gated replay, arousal law, plasticity brakes, loss

What turns learning up/down/off — and the number for our asymmetry.

- **Rasch et al. 2007 [canon].** Odor cues during slow-wave sleep
  prompt declarative consolidation (Science). Cue-triggered replay:
  REPLAY WHAT'S CUED. → Alternative prioritization operator (fifth,
  alongside uniform/noisy/dark/downscale/reverse): cue-gated replay —
  present cue X, replay X-records. Our cues ARE odors; translation is
direct. Supporting: odor-cueing-during-SWS review (2013) + 2017 odor-
  cueing study (cueing works independently of sleep stage — gating by
  cue, not state).
- **Yerkes & Dodson 1908 [canon].** Rapidity of habit formation vs
  stimulus strength (J Comp Neurol Psych). Inverted-U arousal:
  performance rises then FALLS with drive. → Our gain is monotonic;
  YD says fit the inverted-U to the gain-dose data (V1g already records
  overdose readings — the program measures YD without naming it).
  Read-only, specified: dose-response curve over frozen gain arms.
- **Bavelier et al. 2010.** "Removing brakes on adult brain
  plasticity" (J Neurosci, 589 cites). Brakes (inhibition, perineuronal
  nets, epigenetic) accumulate and must be LIFTED — distinct from
  excitation. → The floor as EXCESS BRAKING: train-phase inhibition
  accumulates (LI-like!) and gain shouts over it instead of releasing
  it. New intervention family: brake-lifting (disinhibition) vs gain
  (excitation) — mechanistically different, head-to-head-able.
- **Hensch 2005 [canon].** Critical-period plasticity in local cortical
  circuits (Nat Rev Neurosci). Sensitive periods are GATED windows
  (open/close by molecular brakes). → Our phases are arbitrary tick
  counts (1792); Hensch asks whether train/test should align to
  plasticity windows (open on novelty, close on consolidation) — phase
  design becomes a variable, not a constant.
- **Kahneman & Tversky 1979 [canon].** Prospect theory (Econometrica).
  Losses loom larger than gains (λ≈2). → QUANTIFIES the negativity-bias
  unification (prior-strength doc): measure λ on frozen rows as the
  harm-update/benign-update magnitude ratio. The asymmetry gets a
  number and a 45-year-old name. Supporting: neural prospect theory
  (2005, 404 cites) + large-scale replication (2020, 327 — the effect
  is real).
- **Walker (and Stickgold) 2005.** Sleep-dependent consolidation review
  (1854 cites) + system-consolidation follow-up. → Second-lab consensus
  behind Diekelmann (round 24): sleep preserves what was learned (our
  0.95 same-val retention, again). Consolidation is now triple-sourced.

## Round 28 — evolvability: can weight-inheritance ever compound?

The mating line's deepest question (round 19's flag: if the map is
rugged, point mutations stall). This round answers when they don't.

- **Hinton & Nowlan 1987 [canon].** "How learning can guide evolution"
  (Complex Systems). Needle-in-haystack + learning smooths the fitness
  landscape → evolution finds what search cannot. → THE computational
  Baldwin demo — our BALDWIN line rederived it uncited. Compare now:
  their smoothing result vs our return-A floor (0 ticks) — did we fail
  where they succeeded, and is the difference the landscape (needle)
  or the learner? Supporting: 2024 commentary + [Re] reproduction
  records (proof + reproducibility).
- **Crispo 2007 [canon].** Baldwin effect / genetic assimilation
  conditions (Am Nat). Assimilation needs selection on the learned
  trait + heritable variation. → Explains V1's exact-copy null from
  theory: one-generation windows provide neither (no selection
  differential on transmitted weights, no variation) — the null was
  OVERDETERMINED. Assimilation bar for any revival: multi-generation
  selection + standing variation, both absent to date. Supporting:
  2017 assimilation review (64 cites) + canalization reassessment.
- **Wagner / Ciliberti GRN canon [canon + records].** Vast neutral
  networks in regulatory maps (robustness → drift → innovation).
  Supporting: "Evolution of evolvability in GRNs" (2008, 256 cites).
  → Answers round 19: point mutations stall on RUGGED maps but FLOW on
  neutral-rich ones. Prescription for mating revival: measure the
  NEUTRAL FRACTION of our weight→behavior map first (phenotypic
  neighborhood sampling on frozen weights, read-only, specified) — if
  high, drift works and V1b's σ was simply too small a step.
- **Maynard Smith & Szathmáry 1995 [canon].** Major Transitions
  (Oxford). New inheritance channels at each transition (genes →
  epigenetics → language). → Thesis framing: our program adds channels
  one at a time (vertical done; horizontal next per Boyd, round 30) —
  that IS life's own sequence. Supporting: Revisited volume (2011,
  221 cites) + contemporary book review (proof of 1995 canon).
- **Via / plasticity-costs tradition.** Reaction-norm evolution under
  costs and limits. Supporting: 1987 heterogeneity paper (252 cites)
  + "Constraints on the evolution of phenotypic plasticity" (2015,
  691 cites — the costs canon). → Transmission fidelity has COSTS we
  never modeled (exact copy is free; noisy copy was free too). Design
  axis for revival: costly fidelity (pay per bit?) — selection then
  tunes the rate instead of us guessing σ=0.05.
- **Scope-note misses.** Drake 1991 (mutation-rate evolution —
  transmissionNoise's σ has a literature, unqueried); Simpson 1953
  (Baldwin canon statement, unqueried — Hinton covers the mechanism).

## Round 29 — collective search, origins, minimal agents (quorum, stigmergy, swarms, lipid worlds)

How collectives coordinate without central control, what inheritance
looked like before genomes, and proof minimal evolved agents surprise.

- **Segrè, Ben-Eli & Lancet 2001.** "The Lipid World" (Orig Life
  Evol Biosph, 618 cites). Compositional inheritance: noisy,
  collective, genome-free — and SELECTABLE in simulation. → The
  counterexample to "exact copy required": GARD systems evolve with
  noisy compositional transmission. Direct attack on the mating null:
  inherit a SET/distribution (composition), not a vector (exact
  weights). Supporting: 20-year retrospective (2019 — the program is
  alive).
- **Hordijk (and Steel) 2004 [canon] + 2010 review.** Autocatalytic
  (RAF) sets: formal detection algorithms for closure (J Theor Biol
  2004; "Autocatalytic Sets and the Origin of Life" 2010, 166 cites).
  → Closure detection as a MEASURE: run RAF detection on the frozen
  agent+ecology interaction graph — is our system reflexively
  autocatalytic? Outside-the-box autonomy metric for VISION (specified,
  not executed).
- **Kriegman et al. 2020 [canon].** Computer-designed Xenobots (PNAS).
  Evolved morphology + emergent behavior in minimal agents (cilia-less
  locomotion nobody designed). → Proof minimal evolved agents surprise
  their designers — our founders are comparably minimal. The sim→real
  pipeline is the dream-model analog in another substrate. Supporting:
  ethics/applications review (the discussion exists, engage it before
  any real-world step).
- **Miller & Bassler 2001 [canon].** Quorum-sensing review (Annu Rev
  Microbiol). Density-dependent gene regulation: bacteria SOLVE density
  by coordinating (light, virulence, sporulation switch on quorum).
  → MATE-DENSE backfired at 3× because our agents can't sense density.
  Design: quorum switch (density-gated behavior — disperse/forage-shift
  above threshold) for the next density line. Supporting: bench-to-
  bedside + yeast QS reviews (mechanism breadth).
- **Theraulaz & Bonabeau 1999 [canon].** Stigmergy review (Artificial
  Life). Coordination via environment modification (termite pillars,
  ant trails). → Food depletion IS a stigmergic channel our agents
  already WRITE (eat) but never READ. Design: depletion-gradient
  sensing (follow/avoid grazed patches) — new sensory channel, zero new
  physics.
- **Kennedy & Eberhart 1995 [canon].** Particle swarm optimization
  (Proc IEEE ICNN). Velocity + personal/global bests; diversity via
  topology. → Optimizer zoo for selection lines: PSO's diversity
  mechanics (neighborhood topologies prevent stampedes!) vs V1d's 47/48
  herding — GBest/LBest as the named alternative to archive-QD.
  Supporting: highly-cited optimizer records (the zoo is real).
- **Scope-note misses.** Dorigo ACO (1996 thesis — pheromone optimization,
  unqueried; PSO covers the zoo); Kauffman 1993 Origins of Order
  (canon, unqueried — RAF covers the formalism).

## Round 30 — mating ecology, inheritance channels, thesis metrics (Trivers to Rosen)

The revival-rationale shelf for the cold tracks, plus the number VISION
is missing (selection's information gain) and the definition it needs
(closure).

- **Trivers 1972 [canon].** Parental investment and sexual selection
  (in Campbell (Ed.), Sexual Selection and the Descent of Man).
  Investment asymmetry → operational sex ratio → competition/choosiness.
  → Our mating has ZERO asymmetry (all founders 65.0, courtship free)
  → predicts NO selectivity (matches: random attempts). Design: costly
  courtship (Zahavi, round 25) + differential allocation to CREATE the
  asymmetry that creates choice. Supporting: modern Trivers-theory
  records (the canon is taught, not buried).
- **Emlen & Oring 1977 [canon].** Mating-systems ecology (Science).
  Resource distribution → mating system (uniform → scramble; clumped →
  harems/territories). → Our uniform food predicts scramble (matches).
  Testable: clumped-food regime → territorial mating structure (a
designed ecology experiment, not a tweak). Supporting: Lande 1980
  polygenic dimorphism review (1887 cites — the G-matrix machinery for
  the inheritance track: genetic covariances our weight-copying lacks).
- **Odling-Smee, Laland & Feldman 2003 [canon].** Niche Construction
  (Oxford). Ecological inheritance: modified environments persist
  across generations. → Our worlds RESET per generation (no ecological
  inheritance). Design: carry-over worlds (depleted/structured persists
  → newborns inherit the niche + the weights — two channels, one
  experiment). Supporting: Monographs in Population Biology review
  record.
- **Boyd & Richerson 1985 [canon].** Culture and the Evolutionary
  Process (Chicago). Dual inheritance: genetic + cultural channels with
  distinct dynamics (conformity, prestige, horizontal spread). → Our
  transmission is vertical-only; the mate encounter could carry
  BEHAVIOR (copy the living), not just weights (copy the dead) —
  horizontal/oblique channel, faster than genetic, testable against
  vertical in one design. Supporting: contemporary reviews (proof).
- **Frank 2008/09.** "Natural selection maximizes Fisher information"
  (J Evol Biol, 156 cites). Selection = information accumulation with
  a rate. → THE thesis metric: bounded RSI = accelerating Fisher-
  information gain per selection event. VISION's success criterion
  stops being prose and starts being a number — measure it per line,
  retrospectively first (frozen rows have the distributions).
- **Rosen 1991 [canon].** Life Itself (Columbia). (M,R)-systems:
  closure to efficient causation — an agent is CLOSED (every catalyst
  made within). → FORMAL autonomy for VISION's "autonomous": test
  our TasteExperiment+world for closure (with the RAF check, round 29 —
  two independent formalisms, same question). Supporting: closure-
  simulation + biosemiotics-defense records (the formalism is worked,
  not poetry).
- **Scope-note misses.** Gibson 1979 / Lee 1976 tau (direct perception —
  motor track cold); Todorov OFC / Harris–Wolpert signal-noise (motor
  canon — cold); Cronin assembly theory (controversial, unqueried);
  Nowak cooperation rules (multi-agent futures); Haig imprinting
  (conflict theory, distant).
