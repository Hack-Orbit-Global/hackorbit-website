/**
 * GET /api/user/[id]
 *
 * Kept for backwards compatibility. Uses the shared sheets utility.
 */

import { NextResponse } from 'next/server'
import { getUserById } from '../../../lib/sheets'

export async function GET(request, { params }) {
  const id = (params.id || '').trim().toUpperCase()

  console.log(`[GET /api/user/${id}] Request received`)

  if (!id || !/^HO-[A-Z0-9]{4}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format.' }, { status: 400 })
  }

  const { user, error } = await getUserById(id)

  if (error) {
    const isNotFound = error.toLowerCase().includes('not found')
    return NextResponse.json({ error }, { status: isNotFound ? 404 : 503 })
  }

  return NextResponse.json(user)
}
