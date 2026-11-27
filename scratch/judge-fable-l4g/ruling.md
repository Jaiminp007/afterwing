# Ruling on the L4-G proposal (Fable 5.2, conceptual judge, 2026-11-27)

**Verdict: reject definition 1. Reject world 2 as an L4. It can support a second L3-type result.** I ran no experiments. This is argument from the proposal and the L4-D/E/F records.

## (a) Definition 1 smuggles in the result

Counting the floats that cross birth is the right budget. The fault is banning learned summaries on the flat side only. A raw buffer holds one life of evidence about Σ, and META3's summary holds every ancestor's. Item 2 then builds a world where one life cannot estimate Σ, so META3's edge is informational and built in. That is not "same information". It is the "lacks u" boundary again. Pre-declare this instead.

**Class F.** Same observation stream. Any within-life algorithm, world model included. B floats cross birth, B equal to META3's inherited state, written by any rule from the fly's observations, errors and weight estimates. One exclusion keeps META3 itself out (Astra's point): no component that rewrites another adaptive component's update from that component's realized performance. L2best is the best member of F, built by an adversary on tuning seeds and locked in stage A.

## (b) Mediation fails, and this is L3 improving L1

- **Content.** E[w | frame] = 0 is the wrong test. The frame is the support of w's prior, so I(w; frame) is large. Operational test: hand the object to a Bayes-optimal L1. If that L1 improves, the object has target-level content. Here it does.
- **Signal.** Weight innovations are L1 data. Step sizes are L2's state, not its outcome. In the L4-D review, ICA that never read step sizes beat META3 (94.01 vs 92.22, 16/16).
- **Level.** Σ holds still within a life, so the best rates in the frame are near-constants set by the eigenvalues. L2 has nothing to track. Frame plus an inherited rate vector is a preconditioner on L1.

Arms that would prove the gain runs through L2, each gated at p < .01:

1. **FROZEN-L2.** META3's frame and the parent's final rates, in-life L2 learning off.
2. **CONSUMER-SWAP.** META3's own learned frame given to a Kalman L1 as prior covariance, no L2.
3. **DIRECT-FRAME.** The same frame update fed ŵ outer products only, no step sizes.
4. **Factorial** f₄ = 2(P11 − P01) − 3(P10 − P00), with P10 = matched raw-axis Autostep and P01 = FROZEN-L2. With isotropic rates P01 equals P00 by rotation invariance and the factorial recycles d₄, as in L4-D.
5. Report SHAM − AUTO. A sham that hurts relative to no-write is void.

## (c) Strongest challenger

Not the Lamarckian L2 copy. Raw-axis rates can only express diag(Σ), so it is weak when Σ is rotated. Gate it anyway, on the flat side as an L2best candidate. Nothing in it learns about L2. It is L2 with a longer memory. META3 may inherit rates too, for parity.

The strongest is **INH-Σ Kalman**. Its B floats hold a rank-k factor of Σ̂, updated across generations by streaming PCA on end-of-task ŵ, and used in life as the prior covariance of an exact switching Kalman regression. Second is **W-FIFO**, the last k ancestral end-of-task weight vectors, whose span approximates the frame. W-FIFO also shows that definition 1's raw-versus-learned line cannot be drawn cleanly.

## (d) Fatal flaw and odds

The world is linear-Gaussian. Given Σ̂, the Kalman filter is MSE-optimal, and LMS plus Autostep in a frame is a diagonal approximation of it. So META3 ≤ INH-Σ Kalman up to estimation noise, and d₄ ≤ 0 under Class F. INH-Σ Kalman is a learner plus an inherited prior, the same depth as L3-V.

Item 3 is right that a high-dimensional hyperparameter escapes the log K bound. But that headroom belongs to inheritance, and any learner that inherits claims it. It argues for L3.

- **Under Class F: ≤ 3%** that a well-built version passes a fresh final.
- **Under definition 1 as written: about 50%** that the numbers pass (in L4-D a raw Kalman with no inheritance still beat META3 on 16/16). A pass would be "an inherited task-family prior beats raw buffer, genome and sham", a named L3-type claim. It may not be called "L4 shown" or "RSI completed".

**Screen before any build.** On tuning seeds, compare ORACLE3 (true frame given to L2) with ORACLE-Kalman (true Σ given to L1). If the oracle's d₄ is negative, stop.

**The one satisfiable form I would accept.** Blind worlds. Every arm, META3 included, is frozen as general-purpose code before a third party draws the world family, so no arm carries the world model. Class F becomes a declared library at equal B. My odds there are about 5%.
