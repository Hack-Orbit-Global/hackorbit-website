'use client'

import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

function StatCard({ value, label, delay, color }) {
  const colorClasses =
    color === 'purple'
      ? 'from-purple-600/10 to-purple-600/5 border-purple-500/20'
      : 'from-blue-600/10 to-blue-600/5 border-blue-500/20'

  const valueColor = color === 'purple' ? 'text-purple-400' : 'text-blue-400'

  return (
    <motion.div
      {...fadeUp(delay)}
      className={`rounded-xl border bg-gradient-to-br p-4 text-center ${colorClasses}`}
    >
      <div className={`text-2xl font-extrabold tabular-nums ${valueColor}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </motion.div>
  )
}

export default function ContributionStats({ contributions, error }) {
  if (error) {
    return (
      <div className="rounded-xl border border-white/5 bg-surface/50 p-4 text-center">
        <p className="text-sm text-gray-500">
          Could not load GitHub contributions.{' '}
          <span className="text-gray-600 text-xs">{error}</span>
        </p>
      </div>
    )
  }

  const { commitCount = 0, prCount = 0, mergedPrCount = 0 } = contributions

  const hasAny = commitCount > 0 || prCount > 0 || mergedPrCount > 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={commitCount} label="Commits" delay={0.1} color="blue" />
        <StatCard value={prCount} label="Pull Requests" delay={0.15} color="purple" />
        <StatCard value={mergedPrCount} label="Merged PRs" delay={0.2} color="blue" />
      </div>

      {!hasAny && (
        <p className="text-xs text-gray-600 text-center italic">
          No Hack Orbit contributions found on GitHub yet.
        </p>
      )}
    </div>
  )
}
