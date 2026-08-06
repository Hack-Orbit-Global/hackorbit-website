export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function renderProjectCard(p) {
  const official = p.type === 'official';
  return `
    <article class="project-card">
      <div class="project-card__media">
        <span class="project-card__tag chip ${official ? 'chip--blue' : 'chip--green'}">${official ? 'Official' : 'Community'}</span>
        <img src="${escapeHtml(p.image || '/assets/logo/logo.svg')}" alt="${escapeHtml(p.name)}" width="600" height="338" loading="lazy" />
      </div>
      <div class="project-card__body">
        <h3 class="project-card__title">${escapeHtml(p.name)}</h3>
        <p class="project-card__desc">${escapeHtml(p.description)}</p>
        <div class="project-card__meta">
          <span>${escapeHtml(p.status || 'active')}</span>
          ${p.repo_url ? `<a href="${escapeHtml(p.repo_url)}" target="_blank" rel="noopener noreferrer">Repository →</a>` : ''}
        </div>
      </div>
    </article>`;
}

export function initProjectFilters() {
  const tabs = document.querySelectorAll('.filter-tab[data-filter]');
  const grid = document.getElementById('projects-grid');
  const dataEl = document.getElementById('projects-data');
  if (!tabs.length || !grid) return;

  let projects = [];
  if (dataEl) {
    try {
      const parsed = JSON.parse(dataEl.textContent);
      projects = Array.isArray(parsed) ? parsed : [];
    } catch {
      projects = [];
    }
  }

  const emptyState = `
    <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 64px 32px">
      <h3 class="card__title">Projects are being seeded.</h3>
      <p class="card__text" style="max-width: 52ch; margin: 12px auto 24px">
        Hack Orbit's official repositories are currently being set up. As soon as projects
        launch, they'll appear here with clear official/community labelling.
      </p>
      <a class="btn btn--primary" href="/contribute">Get ready to contribute</a>
    </div>`;

  function render(filter) {
    if (!projects.length) {
      grid.innerHTML = emptyState;
      return;
    }
    const list = filter === 'all' ? projects : projects.filter((p) => p.type === filter);
    grid.innerHTML = list.map(renderProjectCard).join('');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
      render(tab.dataset.filter);
    });
  });

  render('all');
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = ['name', 'email', 'subject', 'message'];
  const submitBtn = document.getElementById('contact-submit');
  const status = form.querySelector('.form-status');

  function getValue(name) {
    return form.elements[name] ? form.elements[name].value.trim() : '';
  }

  function validate() {
    const values = {};
    let valid = true;
    for (const f of fields) {
      const group = form.querySelector(`.form-group:has(#contact-${f})`);
      const value = getValue(f);
      values[f] = value;
      const ok = f === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.length > 0;
      if (!ok) {
        valid = false;
        if (group) group.classList.add('has-error');
      } else if (group) {
        group.classList.remove('has-error');
      }
    }
    return { valid, values };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { valid, values } = validate();
    if (!valid) {
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }
    const subject = encodeURIComponent(values.subject);
    const body = encodeURIComponent(`${values.name} <${values.email}>\n\n${values.message}`);
    const mailto = `mailto:hello@hackorbit.example?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email app…';
    window.location.href = mailto;
  });

  for (const f of fields) {
    const input = form.elements[f];
    if (input) input.addEventListener('input', () => validate());
  }
}

function init() {
  initProjectFilters();
  initContactForm();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}
