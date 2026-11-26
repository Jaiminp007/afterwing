# Building the PDF

1. Regenerate every number (no simulations run): `node docs/paper/verify.mjs`.
2. Regenerate Figure 2 and the ledger appendix:
   `node docs/paper/figures/compute_stats.mjs`, `node docs/paper/figures/fig2_g7c_l2_diffs.mjs`,
   `node docs/paper/attempts2tex.mjs`.
3. Convert the SVG figures to PDF with headless Chrome: `node docs/paper/figures/svg2pdf.mjs`.
4. Compile with [Tectonic](https://tectonic-typesetting.github.io/) 0.15 from `docs/paper/`:
   `tectonic -X compile main.tex`. Any pdflatex + bibtex toolchain also works. Figure 1 is TikZ.

The built paper is committed as `microverse-bounded-self-improvement.pdf`. Figures 1 and 3 of the
first draft (`fig1_ladder`, `fig3_l3_headroom`) are no longer used.
