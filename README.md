# Ben Nguyen — personal site (field-sketchbook edition)

Static, no build step: `index.html` + `styles.css` + `script.js` + `fonts/`.

- Open `index.html` directly, or serve it: `python3 -m http.server` in this folder.
- Type: Computer Modern (CM Unicode, SIL OFL — see `fonts/OFL.txt`), bundled locally.
- Every illustration is inline SVG in `index.html` (`<symbol>`s in the `<defs>` block).
  Washes use the `#wash` / `#wash-big` filters; contours use `#pencil`. Paths carry
  `pathLength="1"` so the draw-on animation is a single CSS rule (`--draw`), and
  wash opacity is `--wet`; both are inherited into `<use>` shadow trees from `[data-reveal]`.
- `?static` in the URL freezes motion and shows everything (used for screenshots).
- `prefers-reduced-motion`: no drifting, no plane, no paint; everything drawn at once.
- Previous version (Nujabes watercolor, 2026-07) is archived in `_v1-nujabes/`.

Facts on the page come from `../Ben_Nguyen_CV.tex`; no phone number is published.

September 2026: original layout and interactions retained, with factual corrections,
a fourth taped-in project for BinIt, and CV download links. The public CV in
`assets/Ben_Nguyen_CV.pdf` omits the phone number; regenerate a public copy when
the source CV changes rather than publishing the private PDF unchanged.
