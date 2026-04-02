(function () {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  let theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  const updateThemeIcon = () => {
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    themeToggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3c0 0-1.2 6.8 9.79 9.79Z"></path></svg>';
  };
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateThemeIcon();
    });
  }

  const header = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    if (!header) return;
    header.classList.toggle('site-header--scrolled', window.scrollY > 18);
  }, { passive: true });

  const menuBtn = document.querySelector('[data-mobile-menu-btn]');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('mobile-nav--open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.innerHTML = open
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('mobile-nav--open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
      });
    });
  }

  const observerTargets = document.querySelectorAll('.reveal, .reveal-stagger');
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    observerTargets.forEach(function (el) { observer.observe(el); });
  } else {
    observerTargets.forEach(function (el) {
      el.classList.add('reveal--visible');
      el.classList.add('reveal-stagger--visible');
    });
  }

  const form = document.getElementById('contact-form');
  const launchButtons = document.querySelectorAll('[data-launch-mailto]');
  const emailTarget = 'carrolgarrett55@gmail.com';

  function buildMailto() {
    if (!form) return 'mailto:' + emailTarget;
    const data = new FormData(form);
    const fullName = (data.get('fullName') || '').toString().trim();
    const business = (data.get('business') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();
    const interest = (data.get('interest') || '').toString().trim();
    const revenue = (data.get('revenue') || '').toString().trim();
    const urgency = (data.get('urgency') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    const subject = encodeURIComponent((interest || 'Garcar Enterprise inquiry') + (business ? ' — ' + business : ''));
    const body = encodeURIComponent([
      'Name: ' + fullName,
      'Business: ' + business,
      'Email: ' + email,
      'Phone: ' + phone,
      'Primary interest: ' + interest,
      'Monthly revenue range: ' + revenue,
      'Urgency: ' + urgency,
      '',
      'Current bottleneck / context:',
      message
    ].join('\n'));

    return 'mailto:' + emailTarget + '?subject=' + subject + '&body=' + body;
  }

  launchButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const status = document.getElementById('form-status');
      if (form && !form.reportValidity()) {
        if (status) status.textContent = 'Fill the required fields first, then launch your email app.';
        return;
      }
      const href = buildMailto();
      if (status) status.textContent = 'Opening your email app with your message prefilled. If nothing opens, use the direct email link below.';
      window.location.href = href;
    });
  });
})();
