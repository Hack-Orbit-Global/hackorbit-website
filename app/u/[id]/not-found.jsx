import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100">
      <Navbar />
      <main className="section-padding pt-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto space-y-6">
          {/* ID badge with question mark */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="font-mono text-sm text-gray-500 tracking-widest">HO-????</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              This Orbit Identity doesn't exist yet — or the ID might be incorrect.
              Double-check the link or create your own identity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/create" className="btn-primary text-sm justify-center">
              Create Your Identity
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/" className="btn-outline text-sm justify-center">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
