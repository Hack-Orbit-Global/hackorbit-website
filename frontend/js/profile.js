import { apiGet, apiPatch, apiPost, redirectTo } from './api.js';
import { escapeHtml } from './components.js';

function setStatus(text) {
  const el = document.getElementById('settings-status');
  if (el) el.textContent = text;
}

function populateForm(member) {
  const form = document.getElementById('settings-form');
  if (!form) return;
  form.elements.display_name.value = member.display_name || '';
  form.elements.bio.value = member.bio || '';
  form.elements.skills.value = Array.isArray(member.skills) ? member.skills.join(', ') : '';
  form.elements.linkedin_url.value = member.linkedin_url || '';
  form.elements.other_links.value = Array.isArray(member.other_links) ? member.other_links.join(', ') : '';
  form.hidden = false;
}

function initSettings() {
  const form = document.getElementById('settings-form');
  if (!form) return;

  (async () => {
    const session = await apiGet('/api/auth/session').catch(() => null);

    if (!session || !session.authenticated) {
      setStatus('You need to sign in to edit your profile.');
      document.getElementById('settings-save')?.closest('.form-actions')?.remove();
      return;
    }

    if (session.status !== 'verified' || !session.member_id) {
      setStatus('Finish verifying your identity before editing your profile.');
      return;
    }

    const link = document.getElementById('profile-link');
    if (link) link.textContent = `/profile/${session.member_id}`;

    try {
      const member = await apiGet(`/api/members/${encodeURIComponent(session.member_id)}`);
      populateForm(member);
      setStatus('');
    } catch {
      populateForm({});
      setStatus('Could not load your current profile. You can still save changes.');
    }
  })();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = form.querySelector('.form-status');
    const save = document.getElementById('settings-save');
    if (!form.elements.display_name.value.trim()) {
      form.querySelector('.form-group').classList.add('has-error');
      return;
    }

    const skills = form.elements.skills.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const otherLinks = form.elements.other_links.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    save.disabled = true;
    save.setAttribute('aria-busy', 'true');
    if (status) status.textContent = 'Saving…';

    try {
      await apiPatch('/api/members/me', {
        display_name: form.elements.display_name.value.trim(),
        bio: form.elements.bio.value.trim(),
        skills,
        linkedin_url: form.elements.linkedin_url.value.trim(),
        other_links: otherLinks,
      });
      if (status) status.textContent = 'Saved. Your profile is up to date.';
    } catch (err) {
      if (status) status.textContent = err.message || 'Failed to save. Please try again.';
    } finally {
      save.disabled = false;
      save.removeAttribute('aria-busy');
    }
  });

  const logout = document.getElementById('logout-btn');
  if (logout) {
    logout.addEventListener('click', async () => {
      await apiPost('/api/auth/logout');
      redirectTo('/');
    });
  }
}

document.addEventListener('DOMContentLoaded', initSettings);
