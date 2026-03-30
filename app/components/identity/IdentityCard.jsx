'use client'

import { motion } from 'framer-motion'
import QRCode from './QRCode'
import BadgeList from './BadgeList'
import ContributionStats from './ContributionStats'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

function SkillBubble({ skill }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-blue-500/25 bg-blue-500/8 text-blue-300 bg-blue-500/10">
      {skill}
    </span>
  )
}

function GitHubIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  )
}

export default function IdentityCard({ user, contributions, contributionError, qrSvg }) {
  const skills = user.skills
    ? user.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const profileUrl = `https://hackorbitglobal.vercel.app/u/${user.id}`

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* ── Main Identity Card ── */}
      <motion.div
        {...fadeUp(0)}
        className="relative rounded-2xl border border-white/10 bg-[#111827] overflow-hidden"
        style={{ boxShadow: '0 0 0 1px rgba(59,130,246,0.08), 0 8px 40px rgba(0,0,0,0.5)' }}
      >
        {/* Subtle top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(139,92,246,0.5), transparent)',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative p-6 sm:p-8">

          {/* ── Top section: ID info + QR side-by-side ── */}
          <div className="flex items-start justify-between gap-4">

            {/* Left: ID badge, name, handles */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Orbit ID badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-300 text-xs font-mono font-semibold tracking-wider">
                  {user.id}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {user.name}
              </h1>

              {/* Handles */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <GitHubIcon />
                  <span className="truncate">@{user.github}</span>
                </a>
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <DiscordIcon />
                  <span className="truncate">{user.discord}</span>
                </span>
              </div>
            </div>

            {/* Right: QR code — always top-right, fixed size */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="p-2.5 rounded-xl bg-white border border-white/20"
                style={{ lineHeight: 0 }}>
                <QRCode svgString={qrSvg} size={100} id={user.id} />
              </div>
              <span className="text-[10px] text-gray-600 font-mono tracking-wide">scan · share</span>
            </div>

          </div>

          {/* Divider */}
          <div className="my-5 border-t border-white/5" />

          {/* ── Skills ── */}
          {skills.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <SkillBubble key={skill} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* ── Footer meta ── */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600">Hack</span>
              <span
                className="text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Orbit
              </span>
              <span className="text-xs text-gray-600">· Orbit Identity</span>
            </div>
            {user.createdAt && (
              <span className="text-xs text-gray-700">
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Badges ── */}
      <motion.div {...fadeUp(0.1)} className="rounded-2xl border border-white/8 bg-[#0f1623] p-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Badges
        </h2>
        <BadgeList contributions={contributions || { commitCount: 0, prCount: 0, mergedPrCount: 0 }} />
      </motion.div>

      {/* ── Contributions ── */}
      <motion.div {...fadeUp(0.2)} className="rounded-2xl border border-white/8 bg-[#0f1623] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Hack Orbit Contributions
          </h2>
          <a
            href={`https://github.com/orgs/Hack-Orbit-Global/repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            view org →
          </a>
        </div>
        <ContributionStats
          contributions={contributions || { commitCount: 0, prCount: 0, mergedPrCount: 0 }}
          error={contributionError}
        />
      </motion.div>

      {/* ── Share row ── */}
      <motion.div {...fadeUp(0.3)} className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-600 font-mono truncate">{profileUrl}</span>
        <button
          onClick={() => navigator.clipboard?.writeText(profileUrl)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 flex-shrink-0 ml-3"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy link
        </button>
      </motion.div>
    </div>
  )
}
