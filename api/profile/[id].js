/**
 * api/profile/[id].js
 * GET /profile/:member_id
 * Server-renders a complete HTML profile page via the template system.
 */
'use strict';
const { callAppsScript }  = require('../../lib/appsScriptClient');
const { renderPage }      = require('../../lib/html/renderPage');
const { escapeHtml }      = require('../../lib/html/escapeHtml');

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateString; }
}

function buildSkillTags(skills) {
  if (!skills) return '';
  return skills.split(',').map(s => s.trim()).filter(Boolean)
    .map(s => `<span class="badge badge-neutral">${escapeHtml(s)}</span>`).join(' ');
}

function buildContributionsList(contribs) {
  if (!contribs?.length) return '<li style="color:var(--color-text-secondary);font-size:.875rem;">No contributions tracked yet.</li>';
  return contribs.slice(0, 10).map(c => `
    <li class="card" style="margin-bottom:var(--spacing-3);padding:var(--spacing-3) var(--spacing-4);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem">
        <div>
          <span class="badge badge-neutral" style="margin-right:.5rem;">${escapeHtml(c.type?.toUpperCase().replace('_',' '))}</span>
          <a href="${escapeHtml(c.reference_url)}" target="_blank" rel="noopener noreferrer" class="text-primary" style="font-weight:500;">${escapeHtml(c.repo)}</a>
        </div>
        <time class="text-mono text-muted" style="font-size:.75rem;" datetime="${escapeHtml(c.occurred_at)}">${formatDate(c.occurred_at)}</time>
      </div>
    </li>`).join('');
}

function buildBadgesList(badges) {
  if (!badges?.length) return '<span class="text-muted" style="font-size:.875rem;">No badges yet.</span>';
  return badges.map(b => `
    <div title="${escapeHtml(b.description)}" style="display:flex;flex-direction:column;align-items:center;gap:.25rem;width:72px;">
      <img src="${escapeHtml(b.icon_url)}" alt="${escapeHtml(b.name)} badge" style="width:48px;height:48px;border-radius:50%;border:2px solid var(--color-border);">
      <span style="font-size:.6875rem;text-align:center;color:var(--color-text-secondary);">${escapeHtml(b.name)}</span>
    </div>`).join('');
}

function buildCertsList(certs) {
  if (!certs?.length) return '<p class="text-muted" style="font-size:.875rem;">No certificates issued yet.</p>';
  return certs.map(c => `
    <div class="card" style="margin-bottom:var(--spacing-3);padding:var(--spacing-3) var(--spacing-4);display:flex;justify-content:space-between;align-items:center;">
      <div>
        <span class="text-mono" style="font-size:.75rem;color:var(--color-primary);font-weight:600;">${escapeHtml(c.certificate_id)}</span>
        <p style="font-weight:500;margin-top:.25rem;">${escapeHtml(c.event_name || c.type)}</p>
      </div>
      <a href="/verify-result/${escapeHtml(c.certificate_id)}" class="btn btn-secondary" style="padding:.25rem .75rem;font-size:.75rem;">View</a>
    </div>`).join('');
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  // Extract :id from URL — Vercel passes it via req.query
  const memberId = (req.query?.id || '').toUpperCase();
  if (!/^HO-\d{6}$/.test(memberId)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(renderPage('profile.template.html', {
      DISPLAY_NAME:       'Not Found',
      MEMBER_ID:          memberId,
      BIO:                'The requested member profile does not exist.',
      AVATAR_URL:         '',
      SKILLS_TAGS_HTML:   '',
      GITHUB_LINK_HTML:   '',
      LINKEDIN_LINK_HTML: '',
      CONTRIBUTIONS_COUNT: '0',
      BADGES_COUNT:       '0',
      CERTIFICATES_COUNT: '0',
      JOINED_AT:          'N/A',
      IS_FOUNDER_BADGE_HTML: '',
      CONTRIBUTIONS_LIST_HTML: '',
      BADGES_LIST_HTML:   '',
      CERTIFICATES_LIST_HTML: '',
    }));
  }

  try {
    const data = await callAppsScript('getMember', { member_id: memberId });
    const m    = data.member;

    const html = renderPage('profile.template.html', {
      DISPLAY_NAME:       m.display_name,
      MEMBER_ID:          m.member_id,
      BIO:                m.bio || '',
      AVATAR_URL:         m.avatar_url || '',
      SKILLS_TAGS_HTML:   buildSkillTags(m.skills),
      GITHUB_LINK_HTML:   m.github_username
        ? `<a href="https://github.com/${escapeHtml(m.github_username)}" target="_blank" rel="noopener noreferrer" class="text-mono text-primary" style="font-size:.875rem;font-weight:600;">GitHub ↗</a>`
        : '',
      LINKEDIN_LINK_HTML: m.linkedin_url
        ? `<a href="${escapeHtml(m.linkedin_url)}" target="_blank" rel="noopener noreferrer" class="text-mono text-muted" style="font-size:.875rem;">LinkedIn ↗</a>`
        : '',
      IS_FOUNDER_BADGE_HTML: m.is_founder
        ? `<span class="badge badge-success" style="position:absolute;bottom:-8px;right:-8px;">Founder</span>`
        : '',
      CONTRIBUTIONS_COUNT: String(m.contributions?.length ?? 0),
      BADGES_COUNT:       String(m.badges?.length ?? 0),
      CERTIFICATES_COUNT: String(m.certificates?.length ?? 0),
      JOINED_AT:          formatDate(m.joined_at),
      CONTRIBUTIONS_LIST_HTML: buildContributionsList(m.contributions),
      BADGES_LIST_HTML:   buildBadgesList(m.badges),
      CERTIFICATES_LIST_HTML: buildCertsList(m.certificates),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    res.status(200).send(html);
  } catch (err) {
    if (err.error_code === 'MEMBER_NOT_FOUND') {
      return res.status(404).send('<h1>Member not found</h1>');
    }
    console.error('[profile/[id]]', err);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
};
