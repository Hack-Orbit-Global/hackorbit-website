/**
 * GET /api/get-user?id=HO-XXXX
 *
 * Secure proxy route between the client and Google Apps Script.
 * GOOGLE_SCRIPT_URL is never exposed to the browser.
 */

import { NextResponse } from 'next/server'
import { getUserById } from '../../lib/sheets'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = (searchParams.get('id') || '').trim().toUpperCase()

  console.log(`[GET /api/get-user] Requested ID: "${id}"`)

  // Validate ID format before hitting the database
  if (!id || !/^HO-[A-Z0-9]{4}$/.test(id)) {
    console.warn(`[GET /api/get-user] Invalid ID format: "${id}"`)
    return NextResponse.json(
      { error: 'Invalid ID format. Expected: HO-XXXX' },
      { status: 400 }
    )
  }

  const { user, error } = await getUserById(id)

  if (error) {
    console.error(`[GET /api/get-user] Error for ID "${id}":`, error)

    // Distinguish 404 from server errors
    const isNotFound =
      error.toLowerCase().includes('not found') ||
      error.toLowerCase().includes('no user')

    return NextResponse.json(
      { error },
      { status: isNotFound ? 404 : 503 }
    )
  }

  console.log(`[GET /api/get-user] Returning user: ${user.name} (${user.id})`)
  return NextResponse.json(user)
}
