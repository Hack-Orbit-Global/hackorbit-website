import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = params

  // Validate ID format
  if (!id || !/^HO-[A-Z0-9]{4}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format.' }, { status: 400 })
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL
  if (!scriptUrl) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 })
  }

  try {
    const url = new URL(scriptUrl)
    url.searchParams.set('action', 'get')
    url.searchParams.set('id', id)

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // cache for 60s
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Database error.' }, { status: 502 })
    }

    const data = await res.json()

    if (!data || !data.id) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[user/[id]] error:', err)
    return NextResponse.json({ error: 'Failed to fetch user.' }, { status: 503 })
  }
}
