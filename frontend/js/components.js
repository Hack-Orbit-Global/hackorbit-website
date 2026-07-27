// HTML escaping helper to prevent XSS
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// Date formatter helper
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Render dynamic contribution list item
export function renderContributionItem(c) {
  const safeRepo = escapeHtml(c.repo);
  const safeType = escapeHtml(c.type).toUpperCase().replace('_', ' ');
  const safeUrl = escapeHtml(c.reference_url);
  const safeDate = formatDate(c.occurred_at);

  return `
    <li class="contribution-item card" style="margin-bottom: var(--spacing-4); padding: var(--spacing-4);">
      <div class="flex justify-between items-center">
        <div>
          <span class="badge badge-neutral" style="margin-right: var(--spacing-2);">${safeType}</span>
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-primary" style="font-weight: 500;">${safeRepo}</a>
        </div>
        <time class="text-muted text-mono" style="font-size: 0.8125rem;" datetime="${c.occurred_at}">${safeDate}</time>
      </div>
    </li>
  `;
}
