'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    number: '01',
    title: 'Join the Community',
    description: 'Jump into our Discord, introduce yourself, and explore what others are building. A warm welcome awaits.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    number: '02',
    title: 'Pick a Project',
    description: 'Browse our GitHub, find something that excites you. Whether you code, design, write, or test — there\'s a place for you.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: 'purple',
  },
  {
    number: '03',
    title: 'Start Contributing',
    description: 'Open an issue, submit a PR, share your progress publicly. Every contribution matters and gets recognized.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: 'blue',
  },
]

export default function Contribute() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="contribute"
      ref={ref}
      aria-labelledby="contribute-heading"
      className="section-padding bg-[#0d1120] relative overflow-hidden"
    >
      {/* Glow top-right */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[400px] bg-gradient-radial from-purple-600/10 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Get Involved
          </span>
          <h2
            id="contribute-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight"
          >
            Three steps to{' '}
            <span className="text-gradient-blue">orbit with us</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
            Contributing is simple. No gatekeeping, no bureaucracy — just builders helping builders.
          </p>
        </motion.div>

        {/* Steps */}
        <ol className="relative" aria-label="Contribution steps">
          {/* Connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/40 via-purple-500/40 to-blue-500/10 hidden md:block" aria-hidden="true" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.li
                key={step.number}
                className="relative flex items-start gap-6 group"
                initial={{ opacity: 0, x: -24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * i }}
              >
                {/* Step circle */}
                <div
                  className={`shrink-0 relative z-10 w-16 h-16 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 group-hover:scale-105 ${
                    step.color === 'blue'
                      ? 'bg-blue-500/15 border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                      : 'bg-purple-500/15 border-purple-500/30 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                  }`}
                  aria-hidden="true"
                >
                  <span className={`text-xs font-bold mb-0.5 ${step.color === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {step.number}
                  </span>
                  <span className={step.color === 'blue' ? 'text-blue-400' : 'text-purple-400'}>
                    {step.icon}
                  </span>
                </div>

                {/* Content */}
                <div className={`flex-1 p-6 rounded-2xl border bg-[#111827] transition-all duration-300 ${
                  step.color === 'blue'
                    ? 'border-blue-500/15 group-hover:border-blue-500/40 group-hover:shadow-[0_4px_24px_rgba(59,130,246,0.1)]'
                    : 'border-purple-500/15 group-hover:border-purple-500/40 group-hover:shadow-[0_4px_24px_rgba(139,92,246,0.1)]'
                }`}>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.li>
            ))}
          </div>
        </ol>

        {/* CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a
            href="https://github.com/Hack-Orbit-Global"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-base px-8 py-4 inline-flex"
          >
            Start Contributing
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
