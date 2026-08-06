import { apiGet } from './api.js';
import { escapeHtml, formatDate } from './components.js';

function statusChip(status) {
  if (status === 'valid') return '<span class="chip chip--green">Valid</span>';
  if (status === 'revoked') return '<span class="chip chip--red">Revoked</span>';
  return '<span class="chip chip--neutral">Pending</span>';
}

function renderResult(cert, found) {
  const resultEl = document.getElementById('verify-result');
  if (!resultEl) return;

  if (!found || !cert) {
    resultEl.innerHTML = `
      <div class="callout callout--warning" role="status">
        <p>No certificate found with this ID. Check the ID and try again.</p>
      </div>`;
    return;
  }

  resultEl.innerHTML = `
    <div class="cert-card" role="status">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap">
        <h2 class="card__title" style="margin:0">${statusChip(cert.status)} Certificate record</h2>
        <span class="mono" style="font-size: var(--text-xs); color: var(--text-muted)">${escapeHtml(cert.certificate_id)}</span>
      </div>
      <dl>
        <div class="cert-card__row">
          <dt>Certificate ID</dt><dd class="mono">${escapeHtml(cert.certificate_id)}</dd>
        </div>
        <div class="cert-card__row">
          <dt>Status</dt><dd>${statusChip(cert.status)}</dd>
        </div>
        <div class="cert-card__row">
          <dt>Certificate type</dt><dd>${escapeHtml(cert.type_label || cert.type)}</dd>
        </div>
        <div class="cert-card__row">
          <dt>Recipient</dt><dd>${escapeHtml(cert.recipient_name || '')}</dd>
        </div>
        <div class="cert-card__row">
          <dt>Member ID</dt><dd class="mono">${escapeHtml(cert.member_id || '')}</dd>
        </div>
        <div class="cert-card__row">
          <dt>Issued by</dt><dd>${escapeHtml(cert.issued_by || 'Hack Orbit')}</dd>
        </div>
        ${cert.collaborating_org ? `
        <div class="cert-card__row">
          <dt>In collaboration with</dt><dd>${escapeHtml(cert.collaborating_org)}</dd>
        </div>` : ''}
        ${cert.event_name ? `
        <div class="cert-card__row">
          <dt>Event</dt><dd>${escapeHtml(cert.event_name)}</dd>
        </div>` : ''}
        <div class="cert-card__row">
          <dt>Achievement</dt><dd>${escapeHtml(cert.achievement_description || '')}</dd>
        </div>
        <div class="cert-card__row">
          <dt>Issue date</dt><dd>${escapeHtml(formatDate(cert.issue_date))}</dd>
        </div>
      </dl>
    </div>`;
}

async function lookup(id) {
  const statusEl = document.getElementById('verify-status');
  const button = document.querySelector('#verify-form button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  }
  if (statusEl) statusEl.textContent = 'Looking up certificate…';
  try {
    const data = await apiGet(`/api/verify?id=${encodeURIComponent(id)}`);
    renderResult(data && data.certificate, data && data.found);
    if (statusEl) statusEl.textContent = '';
  } catch (err) {
    if (statusEl) statusEl.textContent = err.message || 'Verification failed. Please try again.';
  } finally {
    if (button) {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  }
}

function initVerify() {
  const form = document.getElementById('verify-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = form.elements.id.value.trim();
    if (!id) return;
    const url = new URL(window.location.href);
    url.searchParams.set('id', id);
    window.history.replaceState({}, '', url);
    lookup(id);
  });

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    form.elements.id.value = id;
    lookup(id);
  }
}

document.addEventListener('DOMContentLoaded', initVerify);
