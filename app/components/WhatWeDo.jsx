'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Open Source Projects',
    description:
      "We maintain and contribute to open-source projects that solve real problems. From developer tools to community platforms, everything we build is public, forkable, and free.",
    gradient: 'from-blue-600/20 to-blue-600/5',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(59,130,246,0.2)] hover:border-blue-500/50',
    tag: 'Open Source',
    tagColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Hackathons & Challenges',
    description:
      'Regular time-boxed hacking events where you team up, prototype fast, and ship something real. Great for learning new stacks and connecting with fellow builders.',
    gradient: 'from-purple-600/20 to-purple-600/5',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.2)] hover:border-purple-500/50',
    tag: 'Events',
    tagColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
      </svg>
    ),
    title: 'Community Collaboration',
    description:
      'A network of developers helping each other — code reviews, pair programming sessions, brainstorming, and mentorship woven into every corner of the community.',
    gradient: 'from-blue-600/20 to-purple-600/10',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(59,130,246,0.2)] hover:border-blue-500/50',
    tag: 'Community',
    tagColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: 'Build in Public',
    description:
      "We share our journey, our wins, our failures. Building in public means others learn from your process — and you build an audience and reputation as you grow.",
    gradient: 'from-purple-600/20 to-blue-600/5',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    hoverGlow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.2)] hover:border-purple-500/50',
    tag: 'Philosophy',
    tagColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
]

export default function WhatWeDo() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="what-we-do"
      ref={ref}
      aria-labelledby="whatwedo-heading"
      className="section-padding bg-[#0d1120] relative overflow-hidden"
    >
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">
            What We Do
          </span>
          <h2
            id="whatwedo-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight"
          >
            Four pillars of{' '}
            <span className="text-gradient-blue">Hack Orbit</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
            Everything we do revolves around helping developers build better, faster, and together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list" aria-label="Feature pillars">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              role="listitem"
              className={`group relative p-7 rounded-2xl border bg-gradient-to-br ${f.gradient} ${f.borderColor} ${f.hoverGlow} transition-all duration-300 overflow-hidden`}
              style={{ backgroundColor: '#111827' }}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 * i }}
              aria-label={f.title}
            >
              <div className="flex items-start gap-5">
                <div className={`shrink-0 w-13 h-13 rounded-xl bg-white/5 ${f.accentColor} flex items-center justify-center p-3 border border-white/10 transition-transform duration-300 group-hover:scale-110`}>
                  {f.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-bold text-lg">{f.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${f.tagColor}`}>
                      {f.tag}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
