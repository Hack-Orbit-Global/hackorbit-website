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
      const first = drawer.querySelector('a');
      if (first) first.focus();
    } else {
      drawer.classList.remove('is-open');
      drawer.hidden = true;
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    }
  }

  toggle.addEventListener('click', () => setOpen(drawer.hidden));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) setOpen(false);
  });

  const links = drawer.querySelectorAll('a');
  if (links.length > 0) {
    const first = links[0];
    const last = links[links.length - 1];
    drawer.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
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
    if (window.innerWidth >= 769 && !drawer.hidden) setOpen(false);
  });
}
