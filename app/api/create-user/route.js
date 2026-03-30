import { NextResponse } from 'next/server'

// Simple rate limiting via in-memory store (resets on cold start)
// For production, use Upstash Redis or similar
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 3            // max 3 submissions per minute per IP

function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count++
  return false
}

function generateId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  let result = 'HO-'
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function sanitize(str) {
  return str.trim().replace(/[<>]/g, '')
}

export async function POST(request) {
  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, github, discord, skills } = body

  // --- Validation ---
  if (!name || !github || !discord || !skills) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const cleanName = sanitize(String(name))
  const cleanGithub = sanitize(String(github)).replace(/^@/, '')
  const cleanDiscord = sanitize(String(discord))
  const cleanSkills = sanitize(String(skills))

  if (cleanName.length < 2 || cleanName.length > 80) {
    return NextResponse.json({ error: 'Name must be 2–80 characters.' }, { status: 400 })
  }

  if (!/^[a-zA-Z0-9-]{1,39}$/.test(cleanGithub)) {
    return NextResponse.json({ error: 'Invalid GitHub username format.' }, { status: 400 })
  }

  if (cleanDiscord.length < 2 || cleanDiscord.length > 60) {
    return NextResponse.json({ error: 'Discord username must be 2–60 characters.' }, { status: 400 })
  }

  if (cleanSkills.length < 2 || cleanSkills.length > 400) {
    return NextResponse.json({ error: 'Skills must be 2–400 characters.' }, { status: 400 })
  }

  // --- Generate ID ---
  const id = generateId()
  const createdAt = new Date().toISOString()

  // --- Persist to Google Sheets via Apps Script ---
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL
  if (!scriptUrl) {
    console.error('[create-user] GOOGLE_SCRIPT_URL not set')
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 })
  }

  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        id,
        name: cleanName,
        github: cleanGithub,
        discord: cleanDiscord,
        skills: cleanSkills,
        createdAt,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[create-user] Apps Script error:', text)
      return NextResponse.json({ error: 'Failed to save identity. Try again.' }, { status: 502 })
    }

    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[create-user] Fetch error:', err)
    return NextResponse.json({ error: 'Network error reaching database.' }, { status: 503 })
  }
}
