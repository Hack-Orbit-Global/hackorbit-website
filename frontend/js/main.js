import { initNavigation } from './navigation.js';

function initFooterYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = year;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFooterYear();
});
