# Open Questions, Discrepancies, and Editorial Decisions Needed

## Status after Opus 5.5 review (2026-11-25)

- **#3 (G7c rounding):** disclosed in Section 3.4 and the limitations; Table 3 needs no extra footnote.
- **#4 (scorer):** superseded. No p-value now comes from runner output or Scorer v2; `verify.mjs` computes exact p-values, and Scorer v2 turned out to be defective too (period 2^17). No verdict changes.
- **#5 (missing raw data):** resolved. G1–G6 finals were committed from the local evidence store; P11b and G7b were rerun at their own commits and reproduce exactly.
- **#7 (title):** changed to "a ladder of prospectively specified tests" (author may override).
- **#8 (author):** Jaimin Patel, jaimin.patel.9568@gmail.com, no affiliation.
- **#9 (bibliography):** resolved; PMLR page range and ICLR 2019 venue confirmed online, other fields set to the standard citation.
- **#10 (PDF):** built with Tectonic; figures converted with headless Chrome; see BUILD.md.
- **Still for the human author:** #11 (appendix or not).
- **#2 (VISION.md "to about 40%"):** still wrong in `docs/VISION.md`; worth a one-word fix there ("by about 40%").

This file lists ambiguities, minor repository discrepancies caught while auditing the codebase, and editorial choices that need confirmation from the human author (Jaimin Patel) and co-author (Opus 5.5).

## 1. Discrepancies Found in the Repository (Repo Wins)

1. **`docs/VISION.md` predates `L3-IV-H0` (7 vs. 8 L3 designs/screens).**
   - `docs/VISION.md:109` and `docs/VISION.md:119` (last updated in commit `7d1443f` right after L3-III) list seven L3 designs/screens (`L3, L3b, L3c, two L3-I screens, L3-II, L3-III`).
   - `docs/FLY_RSI_GOALS.md:395-429` and `docs/FLY_RSI_LOG.md:226-303` (commits `12b8e7f` through `16b4372`) add the eighth screen, `L3-IV-H0`, plus Gemini 4 Neon's post-hoc diagnosis.
   - **Action taken in draft:** The paper reports all eight screens and cites the `16b4372` post-hoc diagnosis, matching both the latest repo state and the brief.

2. **`docs/VISION.md:117` wording on L3-II (`BLIND` narrowing `ORACLE`'s advantage "to about 40%" vs. "by about 40%").**
   - From `evidence/microverse/fly-rsi-l3ii-stageA.json`: `ORACLE = 58.286`, `S50 = 56.002`, `BLIND = 56.912`. Thus `ORACLE − S50 = +2.284`, `BLIND − S50 = +0.910` (`39.8%` of `2.284`), and `ORACLE − BLIND = +1.373` (`60.1%` of `2.284`).
   - `VISION.md:117` says BLIND "narrowed that advantage (to about 40% of the oracle's gain over the best fixed split)", which flips the complement (40% was *removed*, leaving 60% remaining).
   - **Action taken in draft:** `main.tex` (Section 5.3) states "erasing roughly 40% of `ORACLE`'s population advantage over `S50`," which matches the raw JSON arithmetic.

3. **G7c stored `diffs` precision (`0.1` rounding) and missing per-seed extinction flags in `solo.mjs`.**
   - `microverse/solo.mjs:21` saves `diffs: d.map(x => +x.toFixed(1))` (rounded to 1 decimal place) while computing `meanDiff`, `positive`, and `p` on unrounded `d`. It also omits per-seed arm populations and explicit `extinct` flags.
   - In `g7c-final-94001-94096-vs-TASTEONLY.json`, the mean of the 0.1-rounded `diffs` is `2.140` (vs. reported `2.14`), and 3 seeds have rounded `diff === 0`. Our bootstrap 95% CIs (`[+1.48, +2.82]` and `[+8.76, +10.07]`) and Scorer v2 checks necessarily operate on those committed 0.1-rounded `diffs`.
   - **Decision needed:** Is the disclosure in Section 3.4 and Section 6.4 sufficient, or should Table 3 also carry a table footnote about the 0.1-rounded stored diffs?

4. **Pre-L3-I float-LCG scorer bug shifted P13b-3a's $p$-value (`0.01909` vs. `0.03121`).**
   - `microverse/p13parts.mjs:32` and `microverse/solo.mjs:20` used floating-point `(r * 1103515245 + 12345) >>> 0` and reported `ge / total` (allowing `p = 0`).
   - Re-running Scorer v2 (`Math.imul`, `(ge + 1) / (draws + 1)`) in `compute_stats.mjs` confirmed every passing test (G7c, Fly-RSI L2, P13b-1, P13b-2b, P13b A3), while on failing P13b-3a `p` shifted from reported `0.01909` to `0.03121` (and `0.03290` under 500,000 unbiased xorshift32 draws). Both fail `p < 0.01`.
   - **Decision needed:** Confirm that reporting both `p_v2` and original reported `p` in Tables 3–4 (while preserving historical pass/fail verdicts unchanged) is the desired convention.

5. **Uncommitted raw JSON for G1–G6 finals, G7b, and P11b.**
   - Because `.gitignore` ignores `/evidence/`, raw JSON files were committed only starting with P13b parts (`90001–90048`). Consequently, G1–G6 Final Runs 1 & 2 (`50001–50008`, `60001–60008`), G7b (`70001–70048`), and P11b (`80001–80048`) have no committed raw JSON and therefore no bootstrap 95% CIs in this draft (we strictly obeyed the rule not to run new simulations).
   - **Decision needed:** Should we keep G7b and P11b logged-only (as in this draft), or would the human author later authorize deterministic replay of those already-spent banks solely to archive raw JSON and add CIs?

6. **G1–G6 version drift after G7c (`da995b0` vs. `dd0ea19`).**
   - G1–G6 were closed on fresh seeds at `da995b0` before G7c added `moveAddInit = 2`. Under `dd0ea19`, G1–G7 passed the universal suite on practice seeds `101–108` (`evidence/microverse/suite-dev-1795046397911.json`), but no third fresh-seed final was run for G1–G6.
   - **Action taken:** Disclosed explicitly in Section 4.1 and Section 6.6.

---

## 2. Editorial and Submission Decisions Needed

7. **Title phrasing: "pre-registered" vs. "git-frozen" / "prospectively registered".**
   - The working title uses "a pre-registered ladder", while Section 3.1 explicitly warns that committing plans to local git before runs is *not* third-party external pre-registration (like OSF).
   - **Decision needed:** Keep "pre-registered" in the title (with immediate clarification in the Abstract and Section 3.1), or soften the title wording to "a git-frozen ladder" or "a prospectively specified ladder" to preempt reviewer pushback?

8. **Author block, affiliation, and contact information.**
   - `main.tex` currently lists `Jaimin Patel` (from git commit authorship) with a subtitle noting AI assistance detailed in Section 8, and omits affiliation and email.
   - **Decision needed:** Provide exact affiliation/email formatting, and confirm venue/arXiv authorship policy (arXiv does not allow AI models in the `\author` field; disclosing them in a dedicated section matches arXiv policy).

9. **Bibliography `TODO-VERIFY` items in `docs/paper/refs.bib`.**
   - Five entries carry `note = {TODO-VERIFY: ...}` for secondary fields that were not independently checked against publisher front matter:
     - `efron1993bootstrap`: Chapman & Hall (1993) vs. Chapman & Hall/CRC reprint imprint.
     - `miconi2018differentiable`: exact PMLR vol. 80 page range.
     - `miconi2020backpropamine`: whether to cite ICLR 2019 proceedings or arXiv:2002.10585 (2020).
     - `schmidhuber2007godel`: book chapter copyright year (2006 vs. 2007).
     - `yaeger1994polyworld`: exact SFI Studies volume number and page range (`pp. 263--298`).
   - All 26 entries are real papers verified from primary sources, and all 26 are cited in `main.tex`.

10. **SVG-to-PDF conversion for LaTeX compilation.**
    - Because LaTeX, matplotlib, and Inkscape/rsvg-convert are not installed on this machine, `figures/fig1_ladder.svg`, `fig2_g7c_l2_diffs.svg`, and `fig3_l3_headroom.svg` are committed as standalone vector SVGs, and `main.tex` uses extensionless `\includegraphics[width=\textwidth]{figures/fig1_ladder}` so converting `.svg` to `.pdf` lets `pdflatex` compile cleanly without editing `main.tex`.
    - **Decision needed:** Convert SVGs to PDFs on a build machine with Inkscape/rsvg-convert/Chrome headless and verify rendered page layout, table widths, and figure typography before arXiv upload.

11. **Whether to inline `attempts.md` as a LaTeX Appendix in `main.tex`.**
    - Currently `main.tex` includes summary Table 6 and points to `docs/paper/attempts.md` in the repository for the full 60+ row chronological forking-paths ledger. Converting `attempts.md` into an Appendix in `main.tex` would make the arXiv PDF self-contained at the cost of ~3–4 extra pages.
