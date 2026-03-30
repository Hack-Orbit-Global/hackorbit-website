import { notFound } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import IdentityCard from '../../components/identity/IdentityCard'
import { getUserById as fetchUserById } from '../../lib/sheets'

// ─── Inline QR SVG generator (zero npm deps, server-only) ────────────────────
// Minimal port of the QR code spec for byte-mode URLs, ECC level M
// Sufficient for URLs up to ~80 chars (HO profile URLs are ~40 chars)

function generateQRSvg(text) {
  try {
    const matrix = buildQRMatrix(text)
    if (!matrix) return null

    const SIZE = matrix.length
    const CELL = 6
    const QUIET = 20
    const TOTAL = SIZE * CELL + QUIET * 2

    const rects = []
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (matrix[r][c]) {
          rects.push(
            `<rect x="${QUIET + c * CELL}" y="${QUIET + r * CELL}" width="${CELL}" height="${CELL}"/>`
          )
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TOTAL} ${TOTAL}" width="${TOTAL}" height="${TOTAL}"><rect x="${QUIET - 4}" y="${QUIET - 4}" width="${SIZE * CELL + 8}" height="${SIZE * CELL + 8}" rx="4" fill="white"/><g fill="#111827">${rects.join('')}</g></svg>`
  } catch {
    return null
  }
}

// ─── QR Matrix Builder ────────────────────────────────────────────────────────

function buildQRMatrix(text) {
  // Encode text as UTF-8 bytes
  const bytes = []
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    if (c < 0x80) bytes.push(c)
    else if (c < 0x800) { bytes.push(0xC0|(c>>6)); bytes.push(0x80|(c&0x3F)) }
    else { bytes.push(0xE0|(c>>12)); bytes.push(0x80|((c>>6)&0x3F)); bytes.push(0x80|(c&0x3F)) }
  }

  // Pick version (minimum that fits)
  const dataCapacities = {
    // version: [L, M, Q, H] byte capacity
    1:[17,14,11,7], 2:[32,26,20,14], 3:[53,42,32,24], 4:[78,62,46,34],
    5:[106,84,60,44], 6:[134,106,74,58], 7:[154,122,86,64], 8:[192,152,108,84],
    9:[230,180,130,98], 10:[271,213,151,119]
  }
  let version = null
  for (let v = 1; v <= 10; v++) {
    if (bytes.length <= dataCapacities[v][1]) { version = v; break }
  }
  if (!version) return null

  const mc = version * 4 + 17
  const modules = Array.from({ length: mc }, () => new Array(mc).fill(null))

  // Finder patterns
  const placeFinderPattern = (row, col) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      if (row+r < 0 || mc <= row+r || col+c < 0 || mc <= col+c) continue
      modules[row+r][col+c] =
        (r>=0&&r<=6&&(c===0||c===6)) || (c>=0&&c<=6&&(r===0||r===6)) || (r>=2&&r<=4&&c>=2&&c<=4)
    }
  }
  placeFinderPattern(0,0); placeFinderPattern(mc-7,0); placeFinderPattern(0,mc-7)

  // Timing patterns
  for (let i = 8; i < mc-8; i++) {
    if (modules[i][6]===null) modules[i][6] = i%2===0
    if (modules[6][i]===null) modules[6][i] = i%2===0
  }

  // Alignment patterns
  const ALIGN_POS = [[],[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]]
  const pos = ALIGN_POS[version] || []
  for (let i = 0; i < pos.length; i++) for (let j = 0; j < pos.length; j++) {
    const r=pos[i], c=pos[j]
    if (modules[r][c]!==null) continue
    for (let dr=-2;dr<=2;dr++) for (let dc=-2;dc<=2;dc++)
      modules[r+dr][c+dc] = dr===-2||dr===2||dc===-2||dc===2||(dr===0&&dc===0)
  }

  // Dark module
  modules[mc-8][8] = true

  // Build data bits
  const bits = []
  // Mode: byte
  bits.push(0,1,0,0)
  // Length
  const lenBits = version < 10 ? 8 : 16
  for (let i=lenBits-1;i>=0;i--) bits.push((bytes.length>>i)&1)
  // Data
  for (const byte of bytes) for (let i=7;i>=0;i--) bits.push((byte>>i)&1)
  // Terminator
  bits.push(0,0,0,0)
  while (bits.length%8!==0) bits.push(0)

  // ECC params table (version, ECLevel=M)
  const ECC_M = {
    1:{totalCodewords:26,ecCodewordsPerBlock:10,blocks:1},
    2:{totalCodewords:44,ecCodewordsPerBlock:16,blocks:1},
    3:{totalCodewords:70,ecCodewordsPerBlock:26,blocks:1},
    4:{totalCodewords:100,ecCodewordsPerBlock:18,blocks:2},
    5:{totalCodewords:134,ecCodewordsPerBlock:24,blocks:2},
    6:{totalCodewords:172,ecCodewordsPerBlock:16,blocks:4},
    7:{totalCodewords:196,ecCodewordsPerBlock:18,blocks:4},
    8:{totalCodewords:242,ecCodewordsPerBlock:22,blocks:2},
    9:{totalCodewords:292,ecCodewordsPerBlock:22,blocks:3},
    10:{totalCodewords:346,ecCodewordsPerBlock:26,blocks:4},
  }
  const ecc = ECC_M[version]
  const dataCodewords = ecc.totalCodewords - ecc.blocks * ecc.ecCodewordsPerBlock
  const byteData = []
  for (let i=0;i<bits.length;i+=8) {
    let b=0; for(let j=0;j<8;j++) b=(b<<1)|(bits[i+j]||0); byteData.push(b)
  }
  while (byteData.length < dataCodewords) {
    byteData.push(byteData.length%2===0?0xEC:0x11)
  }

  // Generate ECC blocks using GF(256)
  const GF_EXP = new Uint8Array(512)
  const GF_LOG = new Uint8Array(256)
  {let x=1; for(let i=0;i<255;i++){GF_EXP[i]=x;GF_LOG[x]=i;x<<=1;if(x&0x100)x^=0x11D}
  for(let i=255;i<512;i++) GF_EXP[i]=GF_EXP[i-255]}
  const gfMul=(a,b)=>a&&b?GF_EXP[GF_LOG[a]+GF_LOG[b]]:0
  const gfPoly=(d)=>{let p=[1];for(let i=0;i<d;i++){const q=[0,...p];for(let j=0;j<p.length;j++)q[j]^=gfMul(p[j],GF_EXP[i]);p=q}return p}
  const rs=(data,ecLen)=>{const g=gfPoly(ecLen);const msg=[...data,...new Array(ecLen).fill(0)];for(let i=0;i<data.length;i++){const c=msg[i];if(c)for(let j=0;j<g.length;j++)msg[i+j]^=gfMul(g[j],c)}return msg.slice(data.length)}

  const blockSize = Math.floor(dataCodewords/ecc.blocks)
  const extraBlocks = dataCodewords % ecc.blocks
  const dcBlocks = [], ecBlocks = []
  let offset = 0
  for (let i=0;i<ecc.blocks;i++) {
    const blen = blockSize + (i < extraBlocks ? 1 : 0)
    const block = byteData.slice(offset, offset+blen); offset+=blen
    dcBlocks.push(block)
    ecBlocks.push(rs(block, ecc.ecCodewordsPerBlock))
  }

  const interleaved = []
  const maxDC = Math.max(...dcBlocks.map(b=>b.length))
  for(let i=0;i<maxDC;i++) for(const b of dcBlocks) if(i<b.length) interleaved.push(b[i])
  const maxEC = ecc.ecCodewordsPerBlock
  for(let i=0;i<maxEC;i++) for(const b of ecBlocks) interleaved.push(b[i])

  // Convert to bits
  const finalBits = []
  for (const byte of interleaved) for(let i=7;i>=0;i--) finalBits.push((byte>>i)&1)
  while(finalBits.length < ecc.totalCodewords*8) finalBits.push(0)

  // Format info (mask 0, EC level M = 00)
  const ecBits=0, maskPattern=0
  const formatData=(ecBits<<3)|maskPattern
  const G15=(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|1
  const G15_MASK=(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1)
  const getBCHDigit=d=>{let n=0;while(d){n++;d>>>=1}return n}
  let fmtD=formatData<<10
  while(getBCHDigit(fmtD)-getBCHDigit(G15)>=0) fmtD^=G15<<(getBCHDigit(fmtD)-getBCHDigit(G15))
  const fmtBits=((formatData<<10)|fmtD)^G15_MASK

  // Place format info
  for(let i=0;i<15;i++){
    const m=((fmtBits>>i)&1)===1
    if(i<6) modules[i][8]=m; else if(i<8) modules[i+1][8]=m; else modules[mc-15+i][8]=m
    if(i<8) modules[8][mc-i-1]=m; else if(i<9) modules[8][15-i]=m; else modules[8][15-i-1]=m
  }

  // Data placement
  const maskFn=(r,c)=>(r+c)%2===0 // mask 0
  let bitIdx=0, row=mc-1, inc=-1
  for(let col=mc-1;col>0;col-=2){
    if(col===6) col--
    while(true){
      for(let c=0;c<2;c++){
        const cc=col-c
        if(modules[row][cc]===null){
          let dark=bitIdx<finalBits.length&&finalBits[bitIdx]===1; bitIdx++
          if(maskFn(row,cc)) dark=!dark
          modules[row][cc]=dark
        }
      }
      row+=inc
      if(row<0||mc<=row){row-=inc;inc=-inc;break}
    }
  }

  return modules
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
  const qrSvg = generateQRSvg(profileUrl)

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
