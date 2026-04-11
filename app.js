(function () {
  'use strict';

  /* ── Scroll header ── */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    if (!header) return;
    header.classList.toggle('header--scrolled', window.scrollY > 18);
  }, { passive: true });

  /* ── Mobile menu ── */
  const menuBtn = document.querySelector('[data-mobile-menu-btn]');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('mobile-nav--open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('mobile-nav--open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Intersection observer: reveal + stagger ── */
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains('reveal')) {
          entry.target.classList.add('reveal--visible');
        }
        if (entry.target.classList.contains('reveal-stagger')) {
          entry.target.classList.add('reveal-stagger--visible');
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { observer.observe(el); });
  } else {
    targets.forEach(function (el) {
      el.classList.add('reveal--visible', 'reveal-stagger--visible');
    });
  }

  /* ── Counter animation ── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const isDecimal = target % 1 !== 0;
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    const cObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        cObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObserver.observe(el); });
  }

  /* ── Smooth scroll for nav links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
