'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const cards = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Open-Source Collaboration',
    description: 'Every project lives in the open. Contribute code, review PRs, or start something new with teammates across the globe.',
    color: 'blue',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Hackathons & Challenges',
    description: 'Regular hackathons and sprints push your skills forward. Ship real products, win recognition, and learn at velocity.',
    color: 'purple',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
      </svg>
    ),
    title: 'Community Learning',
    description: "Learn from peers, mentors, and real-world projects. You're never building alone — the community grows with you.",
    color: 'blue',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: 'Build in Public',
    description: 'Share your progress, document your journey, and build your reputation while creating real impact in the ecosystem.',
    color: 'purple',
  },
]

const colorMap = {
  blue: {
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/20',
    glow: 'hover:border-blue-500/50 hover:shadow-[0_8px_32px_rgba(59,130,246,0.18)]',
  },
  purple: {
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    border: 'border-purple-500/20',
    glow: 'hover:border-purple-500/50 hover:shadow-[0_8px_32px_rgba(139,92,246,0.18)]',
  },
}

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="about"
      ref={ref}
      aria-labelledby="about-heading"
      className="section-padding bg-[#0B0F19] relative"
    >
      <div
        className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Who We Are
          </span>
          <h2
            id="about-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight"
          >
            A community built for{' '}
            <span className="text-gradient-blue">builders</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Hack Orbit was born from a simple belief: the best way to learn is to build real things with real people. We're a global, open-source developer community where collaboration, shipping, and learning happen in public every day.
          </p>
        </motion.div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          role="list"
          aria-label="Community pillars"
        >
          {cards.map((card, i) => {
            const c = colorMap[card.color]
            return (
              <motion.article
                key={card.title}
                role="listitem"
                className={`group p-6 rounded-2xl border bg-[#111827] card-hover cursor-default ${c.border} ${c.glow} transition-all duration-300`}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * i }}
                aria-label={card.title}
              >
                <div className={`w-12 h-12 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  {card.icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
