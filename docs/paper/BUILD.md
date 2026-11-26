# Building the PDF

1. Regenerate numbers and figures (no simulations run):
   `node docs/paper/verify.mjs`, then `node docs/paper/figures/fig1_ladder.mjs` (and fig2, fig3).
2. Convert the SVG figures to PDF with headless Chrome: `node docs/paper/figures/svg2pdf.mjs`.
3. Compile with [Tectonic](https://tectonic-typesetting.github.io/) 0.15 from `docs/paper/`:
   `tectonic -X compile main.tex`. Any pdflatex + bibtex toolchain also works.

The built paper is committed as `Patel-2026-Microverse-bounded-self-improvement.pdf`.
