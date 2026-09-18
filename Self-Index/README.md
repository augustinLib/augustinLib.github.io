# Self-Index project page

Static research project page for **Self-Evolving Search Index**, matching the Bulma-based BESPOKE and SPIKE pages in this repository. No build step is required.

From the repository root, run `python3 -m http.server 8000`, then open `http://localhost:8000/Self-Index/`.

## Content and assets

- `index.html`: authors, resource links, overview, framework, and performance highlights.
- `static/css/index.css`: project styling and mobile layout.
- `static/images/self_index_example.png`: unmodified `figure/case_study_v2.png` from the supplied paper source.
- `static/images/self_index_method.png`: unmodified `figure/method_figure_v3.png` from the supplied paper source.
- `static/pdfs/self-index.pdf`: a local copy of the supplied `view.pdf`. The Paper button links to [arXiv:2609.19656](https://arxiv.org/abs/2609.19656).

The paper PDF and accompanying LaTeX archive are the content sources. Author order, affiliations, and contribution notes follow `main.tex`. The motivation in “Why Self-Index?” follows `010introduction.tex`; the four mechanisms below the framework figure follow `030method.tex`. The Code URL comes from `000abstract.tex`; the arXiv URL was provided by the author.

Performance claims are sourced from `table/rq1-bright.tex` (BGE and BM25 relative gains), `table/rq2-bcp.tex` and `table/online-cost.tex` (Kimi-K2.5 with BM25), and `table/rq3-mem.tex` (Query → Slice). Percentages are relative changes; reported means may be rounded. Online cost does not include offline index construction.

## Attribution

Based on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template), adopted from [Nerfies](https://nerfies.github.io/), as used by the existing project pages. The website template is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
