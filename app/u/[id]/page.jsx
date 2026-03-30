import { notFound } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import IdentityCard from '../../components/identity/IdentityCard'
import { getUserById as fetchUserById } from '../../lib/sheets'

// ─── QR Code (server-side, using qrcode npm package) ───────────────────────
// The custom hand-rolled QR generator was producing invalid codes.
// qrcode is the battle-tested standard — correct Reed-Solomon ECC every time.

async function generateQRSvg(text) {
  try {
    const QRCode = (await import('qrcode')).default
    const svg = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 200,
      color: { dark: '#111827', light: '#FFFFFF' },
    })
    return svg
  } catch (err) {
    console.error('[generateQRSvg] Failed to generate QR code:', err)
    return null
  }
}

// ─── Data Fetching ────────────────────────────────────────────────────────────
// fetchUserById is imported at the top from '../../lib/sheets'.
// No self-HTTP: server components import utilities directly.

const GITHUB_ORG = 'Hack-Orbit-Global'

async function getGitHubContributions(github) {
  console.log(`[ProfilePage] Fetching GitHub contributions for: ${github}`)
  const token = process.env.GITHUB_TOKEN

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'HackOrbit-Website/1.0',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  try {
    const [commitsRes, prsRes, mergedRes] = await Promise.allSettled([
      fetch(
        `https://api.github.com/search/commits?q=author:${github}+org:${GITHUB_ORG}&per_page=1`,
        { headers, next: { revalidate: 300 } }
      ),
      fetch(
        `https://api.github.com/search/issues?q=author:${github}+org:${GITHUB_ORG}+type:pr&per_page=1`,
        { headers, next: { revalidate: 300 } }
      ),
      fetch(
        `https://api.github.com/search/issues?q=author:${github}+org:${GITHUB_ORG}+type:pr+is:merged&per_page=1`,
        { headers, next: { revalidate: 300 } }
      ),
    ])

    const parse = async (settled) => {
      if (settled.status !== 'fulfilled') return 0
      if (!settled.value.ok) {
        console.warn('[ProfilePage] GitHub API non-OK:', settled.value.status)
        return 0
      }
      const json = await settled.value.json().catch(() => ({}))
      return json.total_count ?? 0
    }

    const data = {
      commitCount: await parse(commitsRes),
      prCount: await parse(prsRes),
      mergedPrCount: await parse(mergedRes),
    }

    console.log(`[ProfilePage] GitHub contributions:`, data)
    return { data, error: null }
  } catch (err) {
    console.error('[ProfilePage] GitHub fetch error:', err)
    return { data: null, error: 'GitHub API unavailable.' }
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const id = (params.id || '').toUpperCase()
  const { user } = await fetchUserById(id)
  if (!user) return { title: 'Profile Not Found | Hack Orbit' }
  return {
    title: `${user.name} (${user.id}) | Hack Orbit`,
    description: `${user.name}'s Hack Orbit developer identity. Skills: ${user.skills}`,
    openGraph: {
      title: `${user.name} — Orbit Identity`,
      description: `${user.name}'s Hack Orbit developer profile · ${user.id}`,
      url: `https://hackorbitglobal.vercel.app/u/${user.id}`,
      siteName: 'Hack Orbit',
    },
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function ProfilePage({ params }) {
  const id = (params.id || '').toUpperCase()

  console.log(`[ProfilePage] Rendering profile for ID: "${id}"`)

  // Validate format before hitting DB
  if (!id || !/^HO-[A-Z0-9]{4}$/.test(id)) {
    console.warn(`[ProfilePage] Invalid ID format: "${id}"`)
    notFound()
  }

  const { user, error: userError } = await fetchUserById(id)

  if (userError) {
    console.error(`[ProfilePage] Failed to load user "${id}":`, userError)
    // Show an informative error rather than a blank crash
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-100">
        <Navbar />
        <main className="section-padding pt-32 flex items-center justify-center">
          <div className="text-center max-w-sm space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/25 bg-red-500/10">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-300 text-xs font-mono">{id}</span>
            </div>
            <p className="text-white font-semibold">Could not load profile</p>
            <p className="text-gray-500 text-sm leading-relaxed">{userError}</p>
            <a href="/" className="btn-outline text-sm inline-flex mx-auto">
              ← Back to Home
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    console.warn(`[ProfilePage] No user found for ID: "${id}"`)
    notFound()
  }

  // Fetch GitHub contributions
  const { data: contributions, error: contributionError } = await getGitHubContributions(user.github)

  // Generate QR SVG server-side
  const profileUrl = `https://hackorbitglobal.vercel.app/u/${user.id}`
  const qrSvg = await generateQRSvg(profileUrl)

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100">
      <Navbar />

      <main className="section-padding pt-28 sm:pt-32">
        {/* Background glow */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.06) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-xs text-gray-600">
            <a href="/" className="hover:text-gray-400 transition-colors">Home</a>
            <span>/</span>
            <span className="text-gray-500">Orbit Identity</span>
            <span>/</span>
            <span className="font-mono text-gray-500">{user.id}</span>
          </div>

          <IdentityCard
            user={user}
            contributions={contributions}
            contributionError={contributionError}
            qrSvg={qrSvg}
          />

          {/* CTA for non-members */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600 mb-3">Want your own Orbit Identity?</p>
            <a href="/create" className="btn-primary text-sm inline-flex">
              Create Yours Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
