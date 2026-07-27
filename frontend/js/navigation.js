export function initNavigation() {
  const toggleBtns = document.querySelectorAll('.mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  
  if (toggleBtns.length === 0 || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('show');
    toggleBtns.forEach(btn => btn.setAttribute('aria-expanded', 'true'));
    
    // Focus first link in drawer
    const focusable = drawer.querySelectorAll('a, button, input, select, textarea');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    toggleBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    
    // Return focus to first toggle button
    toggleBtns[0].focus();
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  });

  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Set active class on navigation items based on window location
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && (currentPath === href || (href !== '/index.html' && currentPath.includes(href)))) {
      item.classList.add('active');
    }
  });
}
