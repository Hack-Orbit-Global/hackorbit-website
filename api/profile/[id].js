import { callAppsScript } from '../../lib/appsScriptClient.js';
import { isMemberId } from '../../lib/validation/validate.js';
import { renderTemplate, notFoundPage, renderProfileBody } from '../../lib/html/renderPage.js';
import { getBaseUrl } from '../../lib/http.js';

const CERT_TYPES = {
  participation: 'Participation',
  winner: 'Hackathon Winner',
  finalist: 'Finalist',
  volunteer: 'Volunteer',
  organiser: 'Organiser',
  contributor: 'Contributor',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const { id } = req.query;
  if (!isMemberId(id)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(notFoundPage(id));
  }

  let member;
  try {
    member = await callAppsScript('getMember', { member_id: id });
  } catch (err) {
    if (err.code === 'MEMBER_NOT_FOUND') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(notFoundPage(id));
    }
    console.error('[profile/[id]]', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(notFoundPage(id));
  }

  const siteUrl = getBaseUrl(req);
  const profileUrl = `${siteUrl}/profile/${id}`;
  const displayName = member.display_name || 'Hack Orbit member';
  const certTypes = (Array.isArray(member.certificates) ? member.certificates : []).map((c) => ({
    ...c,
    type_label: CERT_TYPES[c.type] || c.type,
  }));

  const memberData = {
    ...member,
    certificates: certTypes,
  };

  const skillText = Array.isArray(member.skills) && member.skills.length ? member.skills.join(', ') : '';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: displayName,
    identifier: member.member_id,
    memberOf: { '@type': 'Organization', name: 'Hack Orbit' },
    description: skillText ? `Hack Orbit member ${member.member_id}. ${skillText}.` : `Hack Orbit member ${member.member_id}.`,
  });

  const html = renderTemplate('profile.template.html', {
    PAGE_TITLE: `${displayName} — Hack Orbit Member ${member.member_id}`,
    META_DESCRIPTION: `Public Hack Orbit profile for ${displayName} (${member.member_id}). ${skillText || 'Verified open-source contributions.'}`.slice(0, 158),
    CANONICAL_URL: profileUrl,
    OG_TITLE: `${displayName} — Hack Orbit Member ${member.member_id}`,
    OG_DESCRIPTION: skillText ? `Hack Orbit member with skills in ${skillText}.` : `Verified Hack Orbit member ${member.member_id}.`,
    OG_IMAGE: `${siteUrl}/assets/logo/logo.svg`,
    JSONLD: jsonLd,
    BODY_CONTENT: renderProfileBody(memberData),
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=300');
  res.end(html);
}
