'use client'

const BADGE_DEFINITIONS = [
  {
    id: 'first-pr',
    label: 'First PR',
    description: 'Opened first pull request to Hack Orbit',
    check: ({ prCount }) => prCount >= 1,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
    color: 'blue',
  },
  {
    id: 'ten-commits',
    label: '10+ Commits',
    description: 'Made 10 or more commits to Hack Orbit repos',
    check: ({ commitCount }) => commitCount >= 10,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    color: 'purple',
  },
  {
    id: 'top-contributor',
    label: 'Top Contributor',
    description: '5+ merged PRs in Hack Orbit',
    check: ({ mergedPrCount }) => mergedPrCount >= 5,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    id: 'active-builder',
    label: 'Active Builder',
    description: '3+ open PRs to Hack Orbit repos',
    check: ({ prCount }) => prCount >= 3,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: 'purple',
  },
  {
    id: 'core-member',
    label: 'Core Member',
    description: '20+ commits and 3+ merged PRs',
    check: ({ commitCount, mergedPrCount }) => commitCount >= 20 && mergedPrCount >= 3,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    color: 'blue',
  },
]

const colorMap = {
  blue: {
    container: 'border-blue-500/30 bg-blue-500/10',
    icon: 'text-blue-400',
    label: 'text-blue-300',
    dot: 'bg-blue-400',
  },
  purple: {
    container: 'border-purple-500/30 bg-purple-500/10',
    icon: 'text-purple-400',
    label: 'text-purple-300',
    dot: 'bg-purple-400',
  },
}

export default function BadgeList({ contributions }) {
  const earned = BADGE_DEFINITIONS.filter((b) => b.check(contributions))

  if (earned.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No badges earned yet — start contributing to Hack Orbit repos!
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {earned.map((badge) => {
        const c = colorMap[badge.color]
        return (
          <div
            key={badge.id}
            title={badge.description}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 cursor-default ${c.container}`}
          >
            <span className={c.icon}>{badge.icon}</span>
            <span className={c.label}>{badge.label}</span>
          </div>
        )
      })}
    </div>
  )
}
