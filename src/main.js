import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.remove('no-js');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (v, dec) => v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ---------- Chrome: menu, toast, scroll rail ---------- */
const menuBtn = $('.nav-menu-btn'), mega = $('#mega');
function setMenu(open) {
  mega.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  if (open && !reduced) {
    gsap.from($$('.tile', mega), { y: 24, autoAlpha: 0, duration: .55, stagger: .06, ease: 'power3.out' });
    $$('.tile', mega).forEach(animateWidgets);
  }
}
menuBtn.addEventListener('click', () => setMenu(mega.hidden));
$('.mega-close').addEventListener('click', () => { setMenu(false); menuBtn.focus(); });
mega.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mega.hidden) { setMenu(false); menuBtn.focus(); } });
document.addEventListener('pointerdown', e => { if (!mega.hidden && !mega.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false); });
$$('.tile-bars i').forEach((bar, i) => bar.style.setProperty('--i', [2, 3, 3, 4, 5, 6][i]));
$('.toast button').addEventListener('click', () => $('.toast').classList.add('is-hidden'));

/* ---------- Card micro-animations (each runs once, loops stay light) ---------- */
function crossfadeLoop(items, period = 2.4) {
  if (items.length < 2 || reduced) return;
  let i = 0;
  gsap.set(items.slice(1), { autoAlpha: 0 });
  gsap.delayedCall(period, function next() {
    const from = items[i]; i = (i + 1) % items.length; const to = items[i];
    gsap.to(from, { autoAlpha: 0, y: -10, duration: .4, ease: 'power2.in' });
    gsap.fromTo(to, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .6, delay: .25, ease: 'power3.out' });
    gsap.delayedCall(period, next);
  });
}
// Running card: one run after another, each route drawn as it appears.
function runCycle(slides) {
  const draw = slide => gsap.fromTo($('.run-route', slide), { strokeDashoffset: 180 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });
  draw(slides[0]);
  let i = 0;
  gsap.set(slides.slice(1), { autoAlpha: 0 });
  gsap.delayedCall(3.4, function next() {
    const from = slides[i]; i = (i + 1) % slides.length; const to = slides[i];
    gsap.to(from, { autoAlpha: 0, y: -10, duration: .4, ease: 'power2.in' });
    gsap.fromTo(to, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .6, delay: .2, ease: 'power3.out' });
    draw(to);
    gsap.delayedCall(3.4, next);
  });
}
function animateWidgets(scope) {
  if (scope.dataset.animated) return;
  scope.dataset.animated = '1';
  $$('[data-count-to]', scope).forEach(el => {
    const to = parseFloat(el.dataset.countTo), dec = Number(el.dataset.decimals || 0);
    if (reduced) { el.textContent = fmt(to, dec); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v, dec); } });
  });
  if (reduced) return;
  const slides = $$('.run-slide', scope);
  if (slides.length) runCycle(slides);
  $$('.macros i', scope).forEach((bar, i) => gsap.from(bar, { scaleX: 0, duration: 1, delay: .1 * i, ease: 'expo.out' }));
  const bars = $$('.bars i', scope);
  if (bars.length) gsap.from(bars, { scaleY: 0, duration: .9, stagger: .07, ease: 'expo.out' });
  crossfadeLoop($$('.ex-cycle img', scope));
  crossfadeLoop($$('.ex-label span', scope));
  crossfadeLoop($$('.tile-cycle span', scope), 2);
  const ringValue = $('.ring-value', scope);
  if (ringValue) gsap.from(ringValue, { strokeDashoffset: 364.4, duration: 1.6, ease: 'power2.out' });
  const fan = $$('.fan > *', scope);
  if (fan.length) gsap.from(fan, { rotate: 0, xPercent: -50, x: 0, duration: 1.1, ease: 'back.out(1.6)', stagger: .05 });
}

if (reduced) {
  document.documentElement.classList.add('reduced');
  document.body.classList.remove('is-loading');
  $$('.card, .tile').forEach(animateWidgets);
} else {
  /* ---------- Smooth scroll, synced with ScrollTrigger ---------- */
  const lenis = new Lenis({ lerp: .1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* ---------- Intro: mark draws, fills, then the screen shatters outward ---------- */
  const shards = $$('.loader-shards polygon').map(p => {
    const pts = p.getAttribute('points').trim().split(/\s+/).map(xy => xy.split(',').map(Number));
    const cx = pts.reduce((s, q) => s + q[0], 0) / 3, cy = pts.reduce((s, q) => s + q[1], 0) / 3;
    return { el: p, dx: (cx - 50) * 2.4, dy: (cy - 50) * 2.4 };
  });
  gsap.set('.hero-title span', { yPercent: 110 });
  gsap.set('.hero-mark', { yPercent: 70 });
  gsap.set(['.hero-cta', '.nav', '.toast', '.rail'], { autoAlpha: 0, y: 16 });
  const intro = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete() { document.body.classList.remove('is-loading'); $('.loader')?.remove(); lenis.start(); },
  });
  intro
    .from('.loader-word', { autoAlpha: 0, scale: .85, duration: .3 })
    .to('.loader-word', { autoAlpha: 0, duration: .18 }, '+=.12')
    .to('.loader-mark use', { strokeDashoffset: 0, duration: .75, stagger: .08, ease: 'power2.inOut' }, '<')
    .to('.loader-mark', { fill: '#d1f34a', duration: .22 }, '-=.18')
    .to('.loader-mark', { scale: 1.2, autoAlpha: 0, duration: .32, ease: 'power2.in' }, '+=.08');
  shards.forEach(({ el, dx, dy }, i) => intro.to(el, { x: dx, y: dy, rotate: i % 2 ? 22 : -22, scale: .7, duration: .8, ease: 'power4.in' }, `-=${i ? .76 : .2}`));
  intro
    .to('.hero-title span', { yPercent: 0, duration: 1, stagger: .08, ease: 'expo.out' }, '-=.45')
    .to('.hero-mark', { yPercent: 0, duration: 1.2, ease: 'back.out(1.3)' }, '-=.85')
    .to(['.hero-cta', '.nav', '.toast', '.rail'], { autoAlpha: 1, y: 0, duration: .6, stagger: .06, ease: 'power3.out' }, '-=.9');

  /* ---------- Rail: progress through the whole page ---------- */
  gsap.to('.rail-dot', { y: 56, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  const mm = gsap.matchMedia();

  /* ---------- Hero leaves upward, the mark keeps rising (desktop; on phones the hero simply scrolls) ---------- */
  mm.add('(min-width: 901px)', () => {
    const leave = () => ({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true });
    gsap.to('.hero-title', { yPercent: -30, ease: 'none', scrollTrigger: leave() });
    // `y`, not `yPercent`: the intro owns yPercent, and a shared property would replay the rise backwards on scroll
    gsap.to('.hero-mark', { y: () => -$('.hero-mark').getBoundingClientRect().height * .18, ease: 'none', scrollTrigger: leave() });
  });

  /* ---------- Story: the pinned phone metamorphosis (desktop) ---------- */
  mm.add('(min-width: 901px)', () => {
    const phone = $('.story .phone'), cards = $$('.story .card');
    gsap.set(cards, { yPercent: 130, autoAlpha: 0 });
    gsap.set(phone, { scale: .9, rotateX: 30, rotateZ: -9, y: '8vh', transformPerspective: 1400 });
    let widgetsStarted = false;
    gsap.timeline({ scrollTrigger: { trigger: '.story', start: 'top top', end: '+=300%', pin: '.story-stage', scrub: 1 } })
      .to(phone, { scale: 1, rotateX: 0, rotateZ: 0, y: 0, duration: 1, ease: 'power2.out' })
      .to('.screen-b', { opacity: 1, duration: .4 }, '+=.15')
      .to({}, { duration: .5 })
      .to('.screen-c', { opacity: 1, duration: .4 })
      .to(cards, { yPercent: 0, autoAlpha: 1, duration: .9, stagger: .12, ease: 'power3.out' }, '<.1')
      .call(() => { if (!widgetsStarted) { widgetsStarted = true; cards.forEach(animateWidgets); } })
      .to({}, { duration: .4 });
  });
  // Mobile: no pin, each card animates as it arrives.
  mm.add('(max-width: 900px)', () => {
    $$('.story .card').forEach(card => ScrollTrigger.create({ trigger: card, start: 'top 85%', once: true, onEnter: () => animateWidgets(card) }));
  });

  /* ---------- Full-bleed scene: pinned on desktop so the headline never slides under the nav ---------- */
  mm.add('(min-width: 901px)', () => {
    gsap.fromTo('.scene-img', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.scene', start: 'top top', end: '+=70%', pin: true, scrub: true } });
  });
  mm.add('(max-width: 900px)', () => {
    // Phones show the whole photo under the headline: it opens up as it scrolls in rather than moving out of its slot
    gsap.fromTo('.scene-img', { clipPath: 'inset(12% 8% 12% 8% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.scene-img', start: 'top bottom', end: 'center center', scrub: true } });
  });
  // The update chip steps aside once the footer comes in, instead of covering it.
  ScrollTrigger.create({ trigger: '.foot', start: 'top bottom', onToggle: self => gsap.to('.toast', { autoAlpha: self.isActive ? 0 : 1, y: self.isActive ? 12 : 0, duration: .4, ease: 'power2.out' }) });
  gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top 55%' } })
    .from('.scene-title', { yPercent: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' })
    .from('.scene-mark', { scale: 0, rotate: -25, duration: .7, ease: 'back.out(2.2)' }, '-=.6');

  /* ---------- Bento sections rise into place ---------- */
  // Cards arrive with their section, not after a long empty scroll.
  for (const [section, start] of [['.progress', 'top 72%'], ['.free-grid', 'top 96%']]) {
    const items = $$(`${section} .card, ${section} .phone-slot--static`);
    gsap.from(items, { y: 60, autoAlpha: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: section, start }, onComplete: () => items.forEach(animateWidgets) });
  }
  gsap.timeline({ scrollTrigger: { trigger: '.free', start: 'top 60%' } })
    .from('.free-title', { yPercent: 50, autoAlpha: 0, duration: 1, ease: 'expo.out' })
    .from('.free-mark', { scale: 0, rotate: 20, duration: .7, ease: 'back.out(2.2)' }, '-=.6');
  gsap.to('.iso-phone', { y: -18, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
  gsap.fromTo('.iso-phone', { rotateZ: -40 }, { rotateZ: -24, ease: 'none', scrollTrigger: { trigger: '.iso', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Closing card grows to full size ---------- */
  gsap.from('.jump-card', { scale: .9, borderRadius: 60, ease: 'none', scrollTrigger: { trigger: '.jump', start: 'top bottom', end: 'top 20%', scrub: true } });
  gsap.from('.jump-title', { yPercent: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.jump-card', start: 'top 55%' } });
  gsap.from('.duo-card', { y: 70, autoAlpha: 0, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.duo', start: 'top 85%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
}
