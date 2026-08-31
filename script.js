/* ============================================================
   Ben Nguyen — field sketchbook
   1. scroll reveals (pencil draws, washes bloom)
   2. the river draws with scroll
   3. a paper plane glides down the page
   4. flower notes (tap / hover)
   5. a slim white swoosh behind the cursor
   ============================================================ */
(() => {
  "use strict";

  const doc = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isStatic = /[?&]static\b/.test(location.search);   // screenshot mode
  if (isStatic) doc.classList.add("static");

  /* ---------- 1. reveals ---------- */
  const revealables = document.querySelectorAll("[data-reveal]");
  if (reduced || isStatic || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach((el) => io.observe(el));
  }

  /* ---------- nav shadow ---------- */
  const nav = document.querySelector(".nav");
  const onNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onNav();

  /* ---------- 2. river progress ---------- */
  const riverSec = document.getElementById("notes");
  const riverSvg = document.querySelector(".river-svg-line");
  const updateRiver = () => {
    if (!riverSec || !riverSvg) return;
    const r = riverSec.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the section top reaches the bottom of the viewport, 1 when its bottom passes ~70% up
    const p = Math.round(Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh * 0.7))) * 50) / 50;
    if (p === updateRiver.last) return;          // quantized: repaint ~50 times total, not every frame
    updateRiver.last = p;
    riverSvg.style.setProperty("--river", p);
  };

  /* ---------- 3. paper plane ---------- */
  const planeLayer = document.getElementById("plane-layer");
  const planePath = document.getElementById("plane-path");
  const plane = document.getElementById("plane");
  let planeLen = 0, planeTarget = 0, planeNow = 0, planeRaf = 0;
  const wantPlane = window.matchMedia("(min-width: 721px)").matches;
  if (planePath && plane && !reduced && wantPlane) {
    planeLen = planePath.getTotalLength();
    const place = (p) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const a = planePath.getPointAtLength(p * planeLen);
      const b = planePath.getPointAtLength(Math.min(planeLen, p * planeLen + 0.6));
      const x = a.x * vw / 100, y = a.y * vh / 100;
      const ang = Math.atan2((b.y - a.y) * vh / 100, (b.x - a.x) * vw / 100) * 180 / Math.PI;
      plane.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(ang + 16).toFixed(1)}deg)`;
    };
    const tick = () => {
      planeNow += (planeTarget - planeNow) * 0.08;
      place(planeNow);
      if (Math.abs(planeTarget - planeNow) > 0.0005) planeRaf = requestAnimationFrame(tick);
      else planeRaf = 0;
    };
    const updatePlane = () => {
      const max = doc.scrollHeight - window.innerHeight;
      planeTarget = max > 0 ? window.scrollY / max : 0;
      if (isStatic) { planeNow = planeTarget; place(planeNow); return; }
      if (!planeRaf) planeRaf = requestAnimationFrame(tick);
    };
    window.addEventListener("resize", updatePlane, { passive: true });
    planeLayer.__update = updatePlane;
    updatePlane();
  }

  /* ---------- scroll fan-out ---------- */
  let scrollRaf = 0;
  const onScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      onNav(); updateRiver();
      if (planeLayer && planeLayer.__update) planeLayer.__update();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateRiver();

  /* ---------- 4. flower notes ---------- */
  const flowers = Array.from(document.querySelectorAll(".flower"));
  const closeAll = (except) => flowers.forEach((f) => { if (f !== except) f.setAttribute("aria-expanded", "false"); });
  flowers.forEach((f) => {
    f.addEventListener("click", (e) => {
      const open = f.getAttribute("aria-expanded") === "true";
      closeAll(f);
      f.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".flower")) closeAll(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  /* ---------- 5. a slim white swoosh behind the cursor ---------- */
  const canvas = document.getElementById("paint");
  if (canvas && !reduced && !isStatic && window.matchMedia("(pointer: fine)").matches) {
    const ctx = canvas.getContext("2d");
    const LIFE = 520;                      // ms a point stays on the ribbon
    const pts = [];
    let dpr = 1, w = 0, h = 0, raf = 0;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const draw = (now) => {
      ctx.clearRect(0, 0, w, h);
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      if (pts.length > 2) {
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        // one short segment per point so the ribbon tapers and fades toward the tail
        for (let i = 1; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          const age = (now - b.t) / LIFE;              // 0 at the head, 1 at the tail
          const k = 1 - age;
          const mx0 = (pts[i - 1].x + a.x) / 2, my0 = (pts[i - 1].y + a.y) / 2;
          const mx1 = (a.x + b.x) / 2, my1 = (a.y + b.y) / 2;
          ctx.beginPath();
          ctx.moveTo(mx0, my0);
          ctx.quadraticCurveTo(a.x, a.y, mx1, my1);
          ctx.lineWidth = 0.8 + 3 * k;
          ctx.strokeStyle = `rgba(255,255,255,${(0.98 * k * k).toFixed(3)})`;
          ctx.stroke();
        }
      }
      raf = pts.length ? requestAnimationFrame(draw) : 0;
    };

    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const last = pts[pts.length - 1];
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 3) return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > 40) pts.shift();
      if (!raf) raf = requestAnimationFrame(draw);
    }, { passive: true });
  }
})();
