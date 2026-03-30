import { NextResponse } from 'next/server'

const ORG = 'Hack-Orbit-Global'

// Server-side cache (per cold start, good enough for Vercel edge)
const cache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

async function githubFetch(url, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'HackOrbit-Website/1.0',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

export async function GET(request, { params }) {
  const { username } = params

  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return NextResponse.json({ error: 'Invalid GitHub username.' }, { status: 400 })
  }

  const cacheKey = username.toLowerCase()
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=300' },
    })
  }

  const token = process.env.GITHUB_TOKEN

  try {
    const [commitsRes, prsRes, mergedRes] = await Promise.allSettled([
      githubFetch(
        `https://api.github.com/search/commits?q=author:${username}+org:${ORG}&per_page=1`,
        token
      ),
      githubFetch(
        `https://api.github.com/search/issues?q=author:${username}+org:${ORG}+type:pr&per_page=1`,
        token
      ),
      githubFetch(
        `https://api.github.com/search/issues?q=author:${username}+org:${ORG}+type:pr+is:merged&per_page=1`,
        token
      ),
    ])

    const data = {
      commitCount: commitsRes.status === 'fulfilled' ? (commitsRes.value.total_count ?? 0) : 0,
      prCount: prsRes.status === 'fulfilled' ? (prsRes.value.total_count ?? 0) : 0,
      mergedPrCount: mergedRes.status === 'fulfilled' ? (mergedRes.value.total_count ?? 0) : 0,
    }

    cache.set(cacheKey, { ts: Date.now(), data })

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=300' },
    })
  } catch (err) {
    console.error('[github/[username]] error:', err)
    return NextResponse.json({ error: 'Failed to fetch GitHub data.' }, { status: 503 })
  }
}
