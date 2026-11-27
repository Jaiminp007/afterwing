# Ruling on the L4-I proposal (Fable 5.2, conceptual judge, 2026-11-27)

**Verdict: accept, with four amendments. The filter is legitimate. It will not rescue META3.** I ran no experiments. The numbers are re-read from `results/l4h/*.ndjson`.

## (a) The filter is a scope condition

It uses depth-1 and depth-2 arms only, runs before any L3 arm, and has a fixed m and K. Stage B and the final use fresh seeds and locked arms, so d₄ there is unbiased for the family that got through. Selection changes which family is tested, and the claim says so.

The selection works against META3. d₄ = 2(META3 − L2BEST) − (L2BEST − FIXED), so a larger L2 gain g raises the bar. At n = 48 the standard error of d₄ was 0.18 flies, so a pass needs META3 − L2BEST ≳ (g + 0.42)/2. That is 1.2 flies at g = 2. In L4-H the best LMS and the best of all 75 configs were 1.8 flies apart.

L2BEST is the best of about 60 configs on 16 seeds, so its tuning gain is inflated by a few tenths of a fly. On fresh seeds this helps META3 slightly: the denominator shrinks, and META3 can re-tune an overfit rate. EVOR gates the second effect. The first is the real risk, because the scorer tests only mean(L2BEST − FIXED) > 0 (`l4h-score.mjs:103`). A gain near zero would let a small META3 gain pass as "1.5×".

Amendments:
1. Stage B and the final gate L2BEST − FIXED at p < .01, like every other contrast.
2. Admissibility is m = 1 fly and p < .01 on the tuning seeds. m = 2 mostly raises L3's bar.
3. Each draw has a new third party, who gets the identical brief and nothing about earlier draws. Report all K draws with their L2 gains. If none is admissible, the result is "precondition not met", reported as such.
4. The static sweep must end at an interior optimum, and META3's clamp must equal the swept range. In L4-H, L2BEST sat at the edge (offset −3) and META3 could reach −6, which the sweep never covered.

## (b) The brief is blind, and it adds nothing

It names a property of worlds, not a learner or a parameter. But the L4-H family already had that property: fast spans of 100–520 ticks alternate with slow spans of 650–1,900, inside a life of about 1,400 ticks, and L2 gained 0.00. Do not sharpen the brief further. A brief that says what should be adapted is the world model.

## (c) Not a theorem, but three reasons that compound

1. **The hill is flat at the top.** L2's gain is the height of the J(rate) curve above its foot at rate → 0. L3's gain is what moving around the top earns. In L4-H a 400-fold change in rate moved the population 1.56 flies, monotonically. Against a tuned static rate, L3 can only win where the best rate differs across worlds or over time. A clairvoyant per-world static rate was worth +0.23 flies on the tuning seeds, selection noise included.
2. **Inheritance at L2 takes L3's job.** Class F members inherit their L2 state (log q, log R). The rate then sets averaging across generations, and its best value is "slow". That is why the sweep ran to the edge.
3. **SPSA cannot track within a life.** A fly takes about 680 bites, so about 42 pairs. Each pair gives one sign from 16 noisy squared errors, and the rate reaches the error only through log q, then the gain, then w. In stage B META3's rate ended at −6.03 (SD 0.39 across seeds) and the coin-flip sham's at −6.07 (SD 0.38). L3 extracted no signal, and the dither alone cost 0.14 flies.

So META3 can find one constant per lineage, slowly. The sweep and EVOR find the same constant.

## (d) The design I would accept

L4-I as amended, plus two items frozen before the first draw:

- **Headroom screen, from L2-only data.** After the A2 sweep, U = mean over tuning seeds of (best offset per seed − L2BEST). U is biased upward. If U < g/2, the family is logged as a FAIL and no bank is spent. This is a futility stop, so there is no redraw.
- **A first-order L3.** A hypergradient on L2's rate (an IDBD-style trace through L2), declared as a second L3 candidate and locked in A3 by the tuning mean. It uses every bite. The adversary sees it and may extend Class F.

This fixes reason 3 only. Reasons 1 and 2 stand.

## (e) Odds

- **L4-I as proposed: about 1%.** Some family is admissible in three draws at m = 2 (about 40%), stage B passes given that (about 3%), and the final then passes (about 70%).
- **With (d) and m = 1: about 3%.**

The run is still worth more than L4-H. An admissible family with d₄ ≤ 0 is a clean negative, which L4-H was not, because its denominator was zero.
