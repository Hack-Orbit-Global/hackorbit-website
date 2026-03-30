/**
 * app/lib/sheets.js
 *
 * Server-only utility for fetching Orbit Identity data from Google Apps Script.
 *
 * WHY THIS EXISTS:
 *   Next.js server components must NOT call their own API routes via HTTP —
 *   it creates an extra network hop that breaks in development (wrong base URL)
 *   and adds unnecessary latency in production.
 *
 *   Instead, both the server component (/u/[id]/page.jsx) and the API proxy
 *   (/api/get-user/route.js) import this utility directly.
 *
 * This file runs exclusively on the server. GOOGLE_SCRIPT_URL is never
 * sent to the client.
 */

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL

/**
 * Fetch a single Orbit Identity user by ID from Google Sheets.
 *
 * @param {string} id  e.g. "HO-J4ZC"
 * @returns {{ user: object|null, error: string|null }}
 */
export async function getUserById(id) {
  console.log(`[sheets.getUserById] Fetching ID: ${id}`)

  if (!SCRIPT_URL) {
    console.error('[sheets.getUserById] GOOGLE_SCRIPT_URL is not set in environment variables.')
    return { user: null, error: 'Server misconfiguration: GOOGLE_SCRIPT_URL missing.' }
  }

  let url
  try {
    url = new URL(SCRIPT_URL)
    url.searchParams.set('action', 'get')
    url.searchParams.set('id', id.toUpperCase())
  } catch (err) {
    console.error('[sheets.getUserById] Invalid GOOGLE_SCRIPT_URL:', SCRIPT_URL, err)
    return { user: null, error: 'Server misconfiguration: invalid script URL.' }
  }

  let res
  try {
    res = await fetch(url.toString(), {
      // Next.js cache: revalidate every 60 seconds
      next: { revalidate: 60 },
      headers: {
        // Apps Script can be picky — send a plain accept header
        Accept: 'application/json',
      },
    })
  } catch (err) {
    console.error('[sheets.getUserById] Network error calling Apps Script:', err)
    return { user: null, error: 'Network error reaching database.' }
  }

  console.log(`[sheets.getUserById] Apps Script response status: ${res.status}`)

  // Apps Script always returns 200 even for errors, but check anyway
  if (!res.ok) {
    const text = await res.text().catch(() => '(unreadable)')
    console.error(`[sheets.getUserById] Non-OK response (${res.status}):`, text)
    return { user: null, error: `Database returned HTTP ${res.status}.` }
  }

  let data
  try {
    const raw = await res.text()
    console.log('[sheets.getUserById] Raw Apps Script response:', raw)
    data = JSON.parse(raw)
  } catch (err) {
    console.error('[sheets.getUserById] Failed to parse Apps Script JSON:', err)
    return { user: null, error: 'Database returned invalid JSON.' }
  }

  // Apps Script returns { error: "..." } for not-found or bad requests
  if (data.error) {
    console.warn(`[sheets.getUserById] Apps Script returned error: ${data.error}`)
    return { user: null, error: data.error }
  }

  // Validate that the response has the expected shape
  if (!data.id || !data.name) {
    console.warn('[sheets.getUserById] Unexpected response shape:', data)
    return { user: null, error: 'Unexpected response from database.' }
  }

  console.log(`[sheets.getUserById] Successfully fetched user: ${data.name} (${data.id})`)
  return { user: data, error: null }
}
