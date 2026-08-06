import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { escapeHtml } from './escapeHtml.js';

const ROOT = process.cwd();
const PARTIALS_DIR = join(ROOT, 'frontend', 'partials');
const TEMPLATES_DIR = join(ROOT, 'frontend', 'templates');
const PUBLIC_DIR = join(ROOT, 'public');
const CSS_DIR = join(PUBLIC_DIR, 'css');

let cached = null;

function readPartial(name) {
  return readFileSync(join(PARTIALS_DIR, name), 'utf8');
}

function resolveStylesheet() {
  try {
    const manifest = JSON.parse(readFileSync(join(CSS_DIR, 'manifest.json'), 'utf8'));
    if (manifest.stylesheet) return manifest.stylesheet;
  } catch {
    // fall through
  }
  try {
    const file = readdirSync(CSS_DIR).find((f) => f.startsWith('styles.') && f.endsWith('.css'));
    if (file) return `/css/${file}`;
  } catch {
    // fall through
  }
  return '/css/styles.css';
}

function loadPartials() {
  if (cached) return cached;
  const head = readPartial('head.html').replaceAll('{{CSS_HREF}}', resolveStylesheet());
  cached = {
    head,
    nav: readPartial('nav.html'),
    footer: readPartial('footer.html'),
  };
  return cached;
}

const TOKEN_RE = /\{\{[A-Z_]+\}\}/g;

function fillTemplate(source, data) {
  return source.replace(TOKEN_RE, (token) => {
    const key = token.slice(2, -2);
    return data[key] !== undefined ? String(data[key]) : token;
  });
}

export function renderTemplate(templateName, data = {}) {
  const partials = loadPartials();
  const source = readFileSync(join(TEMPLATES_DIR, templateName), 'utf8');
  let html = fillTemplate(source, data);
  html = html.replaceAll('{{HEAD}}', partials.head);
  html = html.replaceAll('{{NAV}}', partials.nav);
  html = html.replaceAll('{{FOOTER}}', partials.footer);
  return html;
}

export function renderSimplePage({ title, description, bodyContent }) {
  const partials = loadPartials();
  return `<!doctype html>
<html lang="en">
  <head>
${partials.head}
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="noindex" />
  </head>
  <body>
${partials.nav}
    <main id="main">${bodyContent}</main>
${partials.footer}
    <script type="module" src="/js/main.js"></script>
  </body>
</html>`;
}

export function notFoundPage(memberId) {
  return renderSimplePage({
    title: 'Member Not Found — Hack Orbit',
    description: 'The requested member profile does not exist.',
    bodyContent: `
      <section class="section orbital" aria-labelledby="nf-title">
        <div class="container" style="max-width: 640px; text-align: center">
          <span class="eyebrow">Not found</span>
          <h1 id="nf-title">No member found for ${escapeHtml(memberId)}.</h1>
          <p class="lead" style="margin: 16px auto 32px">The profile you're looking for may have been removed or the ID may be incorrect.</p>
          <a class="btn btn--primary btn--lg" href="/">Back to home</a>
        </div>
      </section>`,
  });
}

export function renderProfileBody(member) {
  const skills = Array.isArray(member.skills) ? member.skills : [];
  const contributions = Array.isArray(member.contributions) ? member.contributions : [];
  const badges = (Array.isArray(member.badges) ? member.badges : []).filter((b) => b && b.status === 'active');
  const certificates = Array.isArray(member.certificates) ? member.certificates : [];
  const projects = Array.isArray(member.projects) ? member.projects : [];

  const badgesHtml =
    badges.length > 0
      ? badges
          .map(
            (b) => `
            <span class="badge-tile">
              <img src="${escapeHtml(b.icon_url || '/assets/logo/logo.svg')}" alt="${escapeHtml(b.name)} badge" width="40" height="40" loading="lazy" />
              <span class="badge-tile__name">${escapeHtml(b.name)}</span>
              <span class="badge-tile__date">${escapeHtml(b.awarded_at ? new Date(b.awarded_at).toISOString().slice(0, 10) : '')}</span>
            </span>`
          )
          .join('')
      : '<p class="muted">No badges yet — make your first contribution to get started.</p>';

  const contributionsHtml =
    contributions.length > 0
      ? `<ul class="contribution-list">
          ${contributions
            .map(
              (c) => `
            <li class="contribution-item">
              <span class="contribution-item__type">${escapeHtml(c.type || 'other')}</span>
              <span class="contribution-item__repo">${c.reference_url ? `<a href="${escapeHtml(c.reference_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.repo || '')}</a>` : escapeHtml(c.repo || '')}</span>
              <time class="contribution-item__date" datetime="${escapeHtml(c.occurred_at || '')}">${escapeHtml(c.occurred_at ? new Date(c.occurred_at).toISOString().slice(0, 10) : '')}</time>
            </li>`
            )
            .join('')}
        </ul>`
      : `
        <div class="callout callout--info">
          <p>No contributions yet — <a class="link-arrow" href="/contribute">see how to get started →</a></p>
        </div>`;

  const certificatesHtml =
    certificates.length > 0
      ? `<ul class="contribution-list">
          ${certificates
            .map(
              (c) => `
            <li class="contribution-item">
              <span class="chip ${c.status === 'valid' ? 'chip--green' : 'chip--red'}">${escapeHtml(c.status || 'valid')}</span>
              <span class="contribution-item__repo"><a href="/verify-result/${escapeHtml(c.certificate_id)}">${escapeHtml(c.certificate_id)}</a></span>
              <span class="contribution-item__date">${escapeHtml(c.issue_date || '')}</span>
            </li>`
            )
            .join('')}
        </ul>`
      : '<p class="muted">No certificates issued yet.</p>';

  const projectsHtml =
    projects.length > 0
      ? `<ul class="contribution-list">
          ${projects
            .map(
              (p) => `
            <li class="contribution-item">
              <span class="chip ${p.type === 'official' ? 'chip--blue' : 'chip--green'}">${p.type === 'official' ? 'Official' : 'Community'}</span>
              <span class="contribution-item__repo">${p.repo_url ? `<a href="${escapeHtml(p.repo_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}</a>` : escapeHtml(p.name)}</span>
              <span class="contribution-item__date">${escapeHtml(p.status || '')}</span>
            </li>`
            )
            .join('')}
        </ul>`
      : '<p class="muted">No projects associated yet.</p>';

  return `
    <nav class="container breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Member ${escapeHtml(member.member_id)}</span>
    </nav>
    <section class="section--tight" aria-labelledby="profile-name">
      <div class="container">
        <div class="profile-header">
          <img class="profile-avatar" src="${escapeHtml(member.avatar_url || '/assets/logo/logo.svg')}" alt="Avatar of ${escapeHtml(member.display_name)}" width="128" height="128" />
          <div>
            <h1 id="profile-name" class="profile-header__name">${escapeHtml(member.display_name)}</h1>
            <span class="profile-header__id">${escapeHtml(member.member_id)}${member.is_founder ? ' · Founder' : ''}</span>
            <div class="profile-header__meta">
              ${member.github_username ? `<span class="chip chip--neutral">GitHub: ${escapeHtml(member.github_username)}</span>` : ''}
              <span class="chip chip--neutral">Joined ${escapeHtml(member.joined_at ? new Date(member.joined_at).toISOString().slice(0, 10) : '')}</span>
            </div>
            ${member.bio ? `<p class="lead" style="margin-top: 20px; max-width: 68ch">${escapeHtml(member.bio)}</p>` : ''}
            ${skills.length ? `<div class="skill-list" style="margin-top: 20px">${skills.map((s) => `<span class="chip chip--purple">${escapeHtml(s)}</span>`).join('')}</div>` : ''}
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="contributions-title">
      <div class="container">
        <h2 id="contributions-title" class="mono" style="font-family: var(--font-serif); margin-bottom: 24px">Contributions</h2>
        ${contributionsHtml}
      </div>
    </section>

    <section class="section" aria-labelledby="badges-title" style="background: var(--surface-container-low)">
      <div class="container">
        <h2 id="badges-title" class="mono" style="font-family: var(--font-serif); margin-bottom: 24px">Badges</h2>
        <div class="badge-row">${badgesHtml}</div>
      </div>
    </section>

    <section class="section" aria-labelledby="certificates-title">
      <div class="container">
        <h2 id="certificates-title" class="mono" style="font-family: var(--font-serif); margin-bottom: 24px">Certificates</h2>
        ${certificatesHtml}
      </div>
    </section>

    <section class="section" aria-labelledby="projects-title" style="background: var(--surface-container-low)">
      <div class="container">
        <h2 id="projects-title" class="mono" style="font-family: var(--font-serif); margin-bottom: 24px">Projects</h2>
        ${projectsHtml}
      </div>
    </section>`;
}

export function renderVerifyResultBody(cert) {
  const row = (dt, dd) =>
    `<div class="cert-card__row"><dt>${dt}</dt><dd>${dd}</dd></div>`;
  const statusChip =
    cert.status === 'valid'
      ? '<span class="chip chip--green">Valid</span>'
      : '<span class="chip chip--red">Revoked</span>';

  return `
    <section class="section" aria-labelledby="verify-result-title">
      <div class="container" style="max-width: 640px">
        <div class="cert-card">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap">
            <h1 id="verify-result-title" class="card__title" style="margin:0">${statusChip} Certificate record</h1>
            <span class="mono" style="font-size: var(--text-xs); color: var(--text-muted)">${escapeHtml(cert.certificate_id)}</span>
          </div>
          <dl>
            ${row('Certificate ID', `<span class="mono">${escapeHtml(cert.certificate_id)}</span>`)}
            ${row('Status', statusChip)}
            ${row('Certificate type', escapeHtml(cert.type_label || cert.type))}
            ${row('Recipient', escapeHtml(cert.recipient_name || ''))}
            ${row('Member ID', `<span class="mono">${escapeHtml(cert.member_id || '')}</span>`)}
            ${row('Issued by', escapeHtml(cert.issued_by || 'Hack Orbit'))}
            ${cert.collaborating_org ? row('In collaboration with', escapeHtml(cert.collaborating_org)) : ''}
            ${cert.event_name ? row('Event', escapeHtml(cert.event_name)) : ''}
            ${row('Achievement', escapeHtml(cert.achievement_description || ''))}
            ${row('Issue date', escapeHtml(cert.issue_date || ''))}
          </dl>
        </div>
        <div class="callout callout--info" style="margin-top: 32px">
          <p>Verification shows metadata only. No certificate file is downloadable from this page.</p>
        </div>
      </div>
    </section>`;
}
