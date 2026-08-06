import { apiGet, apiPost, redirectTo } from './api.js';

const STEP_ORDER = ['google', 'github', 'discord'];

function stepEl(step) {
  return document.querySelector(`.step[data-step="${step}"]`);
}

function providerEl(provider) {
  return document.querySelector(`.provider-connect[data-provider="${provider}"]`);
}

function setStepState(step, state) {
  const el = stepEl(step);
  if (!el) return;
  el.classList.toggle('is-active', state === 'active');
  el.classList.toggle('is-complete', state === 'complete');
}

function setProviderState(provider, state, meta) {
  const btn = providerEl(provider);
  if (!btn) return;
  const label = btn.querySelector('[data-status-label]');
  if (state === 'connected') {
    btn.disabled = true;
    label.className = 'chip chip--green';
    label.textContent = meta || 'Connected';
  } else if (state === 'ready') {
    btn.disabled = false;
    label.className = 'chip chip--neutral';
    label.textContent = meta || 'Connect';
  } else {
    btn.disabled = true;
    label.className = 'chip chip--neutral';
    label.textContent = meta || 'Locked';
  }
}

function applyState(session) {
  const linked = {
    google: !!(session && session.google_linked),
    github: !!(session && session.github_linked),
    discord: !!(session && session.discord_linked),
  };

  STEP_ORDER.forEach((step, index) => {
    const done = linked[step];
    const previousDone = index === 0 || linked[STEP_ORDER[index - 1]];
    setStepState(step, done ? 'complete' : previousDone ? 'active' : 'pending');
  });

  setProviderState('google', linked.google ? 'connected' : 'ready', linked.google ? 'Connected' : 'Connect');
  setProviderState('github', linked.github ? 'connected' : linked.google ? 'ready' : 'locked');
  setProviderState('discord', linked.discord ? 'connected' : linked.github ? 'ready' : 'locked');

  const status = document.getElementById('join-status');
  const finalize = document.getElementById('finalize-btn');

  if (session && session.status === 'verified' && session.member_id) {
    if (status) {
      status.textContent = `You're a verified Hack Orbit member (${session.member_id}).`;
    }
    if (finalize) {
      finalize.disabled = true;
      finalize.textContent = 'View your profile';
    }
    return;
  }

  if (finalize) {
    const allLinked = linked.google && linked.github && linked.discord;
    finalize.disabled = !allLinked;
    if (allLinked) {
      finalize.textContent = 'Complete verification';
    }
  }

  if (status) {
    if (!linked.google) status.textContent = 'Start by connecting your Google account to begin verification.';
    else if (!linked.github) status.textContent = 'Now connect your GitHub account. This links future contributions to your Member ID.';
    else if (!linked.discord) status.textContent = 'Almost there — connect your Discord account.';
    else status.textContent = 'All accounts connected. Complete verification to receive your Member ID.';
  }
}

async function refresh() {
  const session = await apiGet('/api/auth/session').catch(() => null);
  applyState(session && session.authenticated ? session : null);
}

async function handleProviderClick(provider) {
  const btn = providerEl(provider);
  if (!btn || btn.disabled) return;
  if (provider === 'google') {
    redirectTo('/api/auth/google/start');
  } else {
    redirectTo(`/api/auth/${provider}/connect`);
  }
}

function initJoin() {
  const finalize = document.getElementById('finalize-btn');
  if (!finalize) return;

  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');
  if (oauthError) {
    const status = document.getElementById('join-status');
    const messages = {
      google_failed: 'Google sign-in did not complete. Please try again.',
      github_failed: 'Could not link your GitHub account. Please try again.',
      github_already_linked: 'That GitHub account is already linked to another Hack Orbit member.',
      discord_failed: 'Could not link your Discord account. Please try again.',
      discord_already_linked: 'That Discord account is already linked to another Hack Orbit member.',
      unauthenticated: 'Your session expired. Reconnect your Google account to continue.',
      state_mismatch: 'Security check failed. Please start the connection again.',
      session_expired: 'Your session expired. Please sign in again.',
    };
    if (status) status.textContent = messages[oauthError] || 'Something went wrong. Please try again.';
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url);
  }

  document.querySelectorAll('.provider-connect').forEach((btn) => {
    btn.addEventListener('click', () => handleProviderClick(btn.dataset.provider));
  });

  finalize.addEventListener('click', async () => {
    finalize.disabled = true;
    finalize.setAttribute('aria-busy', 'true');
    try {
      const result = await apiPost('/api/identity/finalize');
      if (result && result.member_id) {
        redirectTo(`/profile/${encodeURIComponent(result.member_id)}`);
        return;
      }
      throw new Error('No member ID returned');
    } catch (err) {
      const status = document.getElementById('join-status');
      if (status) status.textContent = err.message || 'Verification failed. Please try again.';
      finalize.disabled = false;
      finalize.removeAttribute('aria-busy');
    }
  });

  refresh();
}

document.addEventListener('DOMContentLoaded', initJoin);
