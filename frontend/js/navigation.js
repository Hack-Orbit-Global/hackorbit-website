export function initNavigation() {
  const toggle = document.querySelector('.nav__toggle');
  const drawer = document.querySelector('.nav-drawer');
  if (!toggle || !drawer) return;

  let lastFocused = null;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add('is-open'));
      lastFocused = document.activeElement;
      const first = drawer.querySelector('a, .nav-mobile__toggle');
      if (first) first.focus();
    } else {
      drawer.classList.remove('is-open');
      drawer.hidden = true;
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    }
  }

  toggle.addEventListener('click', () => setOpen(drawer.hidden));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!drawer.hidden) setOpen(false);
      else closeAllDropdowns();
    }
  });

  const focusables = drawer.querySelectorAll('a, .nav-mobile__toggle');
  if (focusables.length > 0) {
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    drawer.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const currentIndex = Array.prototype.indexOf.call(focusables, document.activeElement);
        if (currentIndex === -1) return;
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    });
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 961 && !drawer.hidden) setOpen(false);
  });

  // Mobile accordion panels
  drawer.querySelectorAll('.nav-mobile__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.classList.toggle('is-open', !open);
    });
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.nav-group.is-open').forEach((g) => g.classList.remove('is-open'));
  document.querySelectorAll('.nav-dropdown__toggle[aria-expanded="true"]').forEach((b) =>
    b.setAttribute('aria-expanded', 'false')
  );
}

export function initDropdowns() {
  const groups = document.querySelectorAll('.nav-group');

  groups.forEach((group) => {
    const toggle = group.querySelector('.nav-dropdown__toggle');
    if (!toggle) return;

    function open() {
      closeAllDropdowns();
      group.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
    function close() {
      group.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (group.classList.contains('is-open')) close();
      else open();
    });

    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        open();
        const firstLink = group.querySelector('.nav-dropdown__link');
        if (firstLink) firstLink.focus();
      } else if (e.key === 'Escape') {
        close();
        toggle.focus();
      }
    });

    group.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
        toggle.focus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-group')) closeAllDropdowns();
  });
}

export function initActiveNav() {
  const path = (location.pathname || '/').replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link, .nav-drawer__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const clean = href.split('#')[0].replace(/\/$/, '') || '/';
    if (clean === path) {
      link.setAttribute('aria-current', 'page');
    }
  });
}
