'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
})

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    label: 'Unique HO-XXXX ID',
    color: 'blue',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    label: 'GitHub Contribution Proof',
    color: 'purple',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    label: 'Badges & Recognition',
    color: 'blue',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 0h.01M19 20h.01M19 8h.01" />
      </svg>
    ),
    label: 'Scannable QR Card',
    color: 'purple',
  },
]

export default function OrbitIdentitySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const anim = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  })

  return (
    <section
      ref={ref}
      id="orbit-identity"
      aria-label="Orbit Identity"
      className="section-padding relative overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div {...anim(0)} className="text-center mb-12">
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              New — Orbit Identity
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Your Developer Identity,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Proven On-Chain
            </span>
          </h2>

          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            Create a permanent developer profile that showcases your real contributions to Hack Orbit.
            One link. One QR. Everything verifiable.
          </p>
        </motion.div>

        {/* Card preview + features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Preview card */}
          <motion.div {...anim(0.1)}>
            <div
              className="rounded-2xl border border-white/10 bg-[#111827] p-6 relative overflow-hidden"
              style={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.08), 0 12px 48px rgba(0,0,0,0.5)' }}
            >
              {/* Glow line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(59,130,246,0.6), transparent)',
                }}
              />

              {/* Mock card content */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="font-mono text-blue-300 text-xs font-semibold tracking-wider">HO-A7X2</span>
                  </div>
                  <div className="text-lg font-bold text-white">Your Name Here</div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>@github-handle</span>
                    <span>discord#1234</span>
                  </div>
                </div>

                {/* Mini QR placeholder */}
                <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm1 1v5h5V4H4zm1 1h3v3H5V5zm8-2h7v7h-7V3zm1 1v5h5V4h-5zm1 1h3v3h-3V5zM3 13h7v7H3v-7zm1 1v5h5v-5H4zm1 1h3v3H5v-3zm8 0h2v2h-2v-2zm3 0h1v1h-1v-1zm1 1h1v1h-1v-1zm-3 1h1v1h-1v-1zm2 0h2v2h-2v-2zm2 1h1v1h-1v-1zm-4 1h2v2h-2v-2zm3 0h1v2h-1v-2z"/>
                  </svg>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {['React', 'TypeScript', 'Node.js', 'Python'].map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full text-xs border border-blue-500/20 bg-blue-500/8 text-blue-300">
                    {s}
                  </span>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[['12', 'Commits'], ['3', 'PRs'], ['2', 'Merged']].map(([v, l]) => (
                  <div key={l} className="rounded-lg border border-white/5 bg-white/3 p-2.5 text-center">
                    <div className="text-base font-bold text-blue-400 tabular-nums">{v}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>

              {/* Watermark */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-700">Hack<span className="text-gray-600">Orbit</span> · Orbit Identity</span>
                <div className="flex gap-1">
                  {['First PR', 'Active Builder'].map((b) => (
                    <span key={b} className="text-xs px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/8 text-purple-400">{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature list + CTA */}
          <motion.div {...anim(0.15)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map(({ icon, label, color }) => {
                const isBlue = color === 'blue'
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                      isBlue
                        ? 'border-blue-500/15 bg-blue-500/5 hover:border-blue-500/30'
                        : 'border-purple-500/15 bg-purple-500/5 hover:border-purple-500/30'
                    }`}
                  >
                    <span className={isBlue ? 'text-blue-400' : 'text-purple-400'}>{icon}</span>
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <Link href="/create" className="btn-primary w-full justify-center">
                Create Your Identity
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-center text-xs text-gray-600">
                Free for all Hack Orbit community members · No account required
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
