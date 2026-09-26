# Ben Nguyen — a field sketchbook

[bennguyen.cv](https://bennguyen.cv/) is a static personal website. No build step,
framework, third-party fonts, or analytics. GitHub Pages serves `main` at the root;
`CNAME` retains the custom domain and `.nojekyll` disables Jekyll processing.

## Local preview

Run `python3 -m http.server 8765 --bind 127.0.0.1` in this directory and open
`http://127.0.0.1:8765`. `node --check script.js` checks JavaScript syntax.
`?static` freezes animation for visual inspection.

## Design and behavior

- Paper, pencil, watercolor, and locally bundled Computer Modern type. The font
  license is in `fonts/OFL.txt`.
- Inline SVG symbols use the `#wash`, `#wash-big`, and `#pencil` filters. Draw-on
  progress (`--draw`) and paint opacity (`--wet`) are inherited into symbols.
- The introduction leads to four project cards, research experience, a question
  garden, activities, and contact information.
- Projects and flower notes use native `details`/`summary` disclosures. All
  content, contact links, and the CV remain available without JavaScript.
- JavaScript adds project filters, active navigation, email copying, and optional
  decorative motion. Links into filtered-out projects restore the cards and open
  the matching story. Escape closes a focused disclosure.
- The motion button stores only a local preference. System reduced-motion
  settings always take precedence. Animation work stops while idle or paused.
- Small screens use a two-row navigation and single-column project gallery.
  Expanded mobile flower notes span the garden width.

## Content and assets

Facts are grounded in `../Ben_Nguyen_CV.tex` and `../Ben_Nguyen_Resume.tex`
(September 2026). Keep research stages explicit: CAR-T QC is a proposed,
unvalidated architecture with a manuscript in preparation; Bughouse is in
development. Do not imply publication, clinical validation, or public source code
where none is available. BinIt was a team project.

`assets/Ben_Nguyen_CV.pdf` is a public copy of the current academic CV with the
phone number removed. Regenerate that public copy after CV changes; do not copy
the private PDF unchanged. It was compiled with Tectonic and visually checked.

`assets/social-card.svg` is the editable source for the 1200 × 630 sharing image
`assets/social-card.png`, rendered from the same illustration vocabulary. The
page includes canonical, Open Graph, Twitter card, and Person metadata. Keep
`sitemap.xml` and the displayed update date aligned with substantive edits.
`404.html` returns visitors to the sketchbook using absolute asset paths.

## Verification before publishing

Check project filters; links into filtered cards; native disclosures and Escape;
copy-email feedback; CV download; saved motion preferences; keyboard focus;
320, 390, 768, 1024, and 1440px layouts; and the browser console. Check local asset
and anchor targets, metadata syntax, `git diff --check`, and the PDF visually.
After pushing, confirm the GitHub Pages deployment matches the new commit and
that the live homepage, PDF, social preview, sitemap, and custom 404 respond.

The original July 2026 Nujabes edition is kept locally in the ignored
`_v1-nujabes/` directory.
