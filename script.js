/* A small, dependency-free layer over a fully readable HTML sketchbook. */
(() => {
  'use strict';
  const doc = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopQuery = window.matchMedia('(min-width: 721px)');
  const isStatic = new URLSearchParams(location.search).has('static');
  const motionButton = document.querySelector('.motion-toggle');
  let savedQuiet = false;
  try { savedQuiet = localStorage.getItem('sketchbook-quiet') === 'true'; } catch { /* Storage is optional. */ }
  let quiet = savedQuiet || motionQuery.matches || isStatic;
  let scrollFrame = 0;
  let paintFrame = 0;
  const points = [];
  const revealables = [...document.querySelectorAll('[data-reveal]')];
  const revealAll = () => revealables.forEach(el => el.classList.add('is-in'));
  doc.classList.add('js');
  doc.classList.toggle('static', isStatic);

  function applyMotion() {
    doc.classList.toggle('quiet', quiet);
    motionButton.hidden = isStatic;
    motionButton.disabled = motionQuery.matches;
    motionButton.title = motionQuery.matches ? 'Animations are paused by your system’s reduced-motion setting.' : 'Turn decorative animation on or off';
    motionButton.setAttribute('aria-pressed', String(quiet));
    motionButton.querySelector('[data-motion-label]').textContent = motionQuery.matches ? 'reduced motion' : quiet ? 'motion paused' : 'pause motion';
    motionButton.querySelector('span').textContent = quiet ? '▷' : 'Ⅱ';
    if (quiet) {
      revealAll();
      cancelAnimationFrame(paintFrame);
      paintFrame = 0;
      points.length = 0;
    }
  }
  applyMotion();
  motionButton.addEventListener('click', () => {
    // A system preference remains the minimum level of motion reduction.
    quiet = motionQuery.matches ? true : !quiet;
    savedQuiet = quiet;
    try { localStorage.setItem('sketchbook-quiet', String(quiet)); } catch { /* Still works for this visit. */ }
    applyMotion();
    updateScroll();
  });
  motionQuery.addEventListener('change', () => {
    quiet = savedQuiet || motionQuery.matches || isStatic;
    applyMotion();
    updateScroll();
  });

  if (quiet || !('IntersectionObserver' in window)) revealAll();
  else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px 40px 0px' });
    revealables.forEach(el => observer.observe(el));
  }

  const nav = document.querySelector('.nav');
  const navLinks = [...document.querySelectorAll('.nav nav a[href^="#"]')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
  const river = document.querySelector('.river-svg-line');
  const riverSection = document.getElementById('notes');
  const plane = document.getElementById('plane');
  const planePath = document.getElementById('plane-path');
  const planeLength = planePath?.getTotalLength() || 0;
  let lastRiverProgress = -1;

  function updateScroll() {
    scrollFrame = 0;
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    let current = -1;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * .4) current = i;
    });
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) current = sections.length - 1;
    navLinks.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (quiet) return;
    const rect = riverSection.getBoundingClientRect();
    const progress = Math.round(Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight * .7))) * 50) / 50;
    if (progress !== lastRiverProgress) {
      river.style.setProperty('--river', progress);
      lastRiverProgress = progress;
    }
    if (desktopQuery.matches && planeLength) {
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      const a = planePath.getPointAtLength(p * planeLength);
      const b = planePath.getPointAtLength(Math.min(planeLength, p * planeLength + .6));
      const angle = Math.atan2((b.y - a.y) * window.innerHeight, (b.x - a.x) * window.innerWidth) * 180 / Math.PI;
      plane.style.transform = `translate(${a.x * window.innerWidth / 100}px, ${a.y * window.innerHeight / 100}px) rotate(${angle + 16}deg)`;
    }
  }
  function requestScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(requestScroll).observe(document.querySelector('main'));
  updateScroll();

  // Filtering is an enhancement; all four project cards are present in the HTML.
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-category]')];
  document.querySelector('.project-tools').hidden = false;
  function filterProjects(category) {
    projects.forEach(project => { project.hidden = category !== 'all' && project.dataset.category !== category; });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    const count = projects.filter(project => !project.hidden).length;
    document.querySelector('.filter-count').textContent = category === 'all' ? `Showing all ${count} projects` : `Showing ${count} ${category} projects`;
    requestScroll();
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  function revealLinkedProject() {
    const id = location.hash.slice(1);
    const target = projects.find(project => project.id === id);
    if (!target) return;
    const wasHidden = target.hidden;
    if (wasHidden) filterProjects('all');
    target.querySelector('details').open = true;
    target.classList.add('is-in');
    if (wasHidden) target.scrollIntoView({ behavior: quiet ? 'instant' : 'smooth', block: 'start' });
  }
  window.addEventListener('hashchange', revealLinkedProject);
  revealLinkedProject();
  // A repeated anchor should reveal a project even when its hash has not changed.
  document.querySelectorAll('a[href^="#project-"]').forEach(link => link.addEventListener('click', () => {
    const target = projects.find(project => '#' + project.id === link.getAttribute('href'));
    if (target?.hidden) filterProjects('all');
    if (target) target.querySelector('details').open = true;
  }));

  const flowers = [...document.querySelectorAll('.flower')];
  flowers.forEach(flower => flower.addEventListener('toggle', () => {
    if (flower.open) flowers.forEach(other => { if (other !== flower) other.open = false; });
  }));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const active = document.activeElement?.closest('details[open]');
    if (active) {
      active.open = false;
      active.querySelector('summary').focus();
    }
  });

  const copyButton = document.getElementById('copy-email');
  const status = document.getElementById('copy-status');
  if (navigator.clipboard?.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('benguyen1247@gmail.com');
        status.textContent = 'Email address copied. Say hello whenever you like.';
      } catch {
        status.textContent = 'Couldn’t copy automatically. You can select the email address above.';
      }
    });
  }

  // Preserve the subtle brush trail, with no work while idle or in quiet mode.
  const canvas = document.getElementById('paint');
  const ctx = canvas?.getContext('2d');
  if (ctx && window.matchMedia('(pointer: fine)').matches && !isStatic) {
    let width = 0, height = 0;
    function resizePaint() {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      while (points.length && now - points[0].t > 520) points.shift();
      ctx.lineCap = 'round';
      for (let i = 1; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1], k = 1 - (now - b.t) / 520;
        ctx.beginPath();
        ctx.moveTo((points[i - 1].x + a.x) / 2, (points[i - 1].y + a.y) / 2);
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
        ctx.lineWidth = .8 + 3 * k;
        ctx.strokeStyle = `rgba(255,255,255,${.8 * k * k})`;
        ctx.stroke();
      }
      paintFrame = points.length && !quiet ? requestAnimationFrame(draw) : 0;
    }
    resizePaint();
    window.addEventListener('resize', resizePaint, { passive: true });
    window.addEventListener('pointermove', event => {
      if (quiet || event.pointerType !== 'mouse' || document.hidden) return;
      const last = points.at(-1);
      if (last && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 3) return;
      points.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      if (points.length > 40) points.shift();
      if (!paintFrame) paintFrame = requestAnimationFrame(draw);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(paintFrame);
        paintFrame = 0;
        points.length = 0;
        ctx.clearRect(0, 0, width, height);
      }
    });
  }
})();
