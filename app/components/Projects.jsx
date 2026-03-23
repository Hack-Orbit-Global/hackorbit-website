'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const projects = [
  {
    name: 'TaxGuide',
    description:
      'An open-source platform simplifying tax filing for individuals and freelancers. Streamlined workflows, smart calculations, and clear guidance — no accountant needed.',
    tags: ['Next.js', 'Finance', 'TypeScript'],
    stars: '124',
    forks: '38',
    color: 'blue',
    github: 'https://github.com/Hack-Orbit-Global/',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    name: 'Micro Learning Platform',
    description:
      'Bite-sized lessons for developers on-the-go. Open-source LMS focused on mobile-first microlearning with spaced repetition and community-generated content.',
    tags: ['React', 'Node.js', 'EdTech'],
    stars: '89',
    forks: '22',
    color: 'purple',
    github: 'https://github.com/Hack-Orbit-Global/',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    name: 'Influencer Platform',
    description:
      'A transparent, open-source platform connecting developers who create content with brands and communities. Analytics, deal management, and audience insights built-in.',
    tags: ['Vue.js', 'PostgreSQL', 'SaaS'],
    stars: '67',
    forks: '15',
    color: 'blue',
    github: 'https://github.com/Hack-Orbit-Global/',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
]

const colorMap = {
  blue: {
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    tagBg: 'bg-blue-500/10 text-blue-300',
    border: 'border-blue-500/20',
    hover: 'hover:border-blue-500/50 hover:shadow-[0_8px_40px_rgba(59,130,246,0.2)]',
  },
  purple: {
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    tagBg: 'bg-purple-500/10 text-purple-300',
    border: 'border-purple-500/20',
    hover: 'hover:border-purple-500/50 hover:shadow-[0_8px_40px_rgba(139,92,246,0.2)]',
  },
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="projects"
      ref={ref}
      aria-labelledby="projects-heading"
      className="section-padding bg-[#0B0F19] relative"
    >
      <div
        className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent pointer-events-none"
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
            Our Projects
          </span>
          <h2
            id="projects-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight"
          >
            Things we're{' '}
            <span className="text-gradient-blue">building right now</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
            Real projects, real code, built in the open. Fork them, contribute to them, or start your own.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list" aria-label="Current projects">
          {projects.map((project, i) => {
            const c = colorMap[project.color]
            return (
              <motion.article
                key={project.name}
                role="listitem"
                className={`group flex flex-col p-6 rounded-2xl border bg-[#111827] ${c.border} ${c.hover} transition-all duration-300`}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * i }}
              >
                <div className={`w-12 h-12 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  {project.icon}
                </div>

                <h3 className="text-white font-bold text-lg mb-2">{project.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{project.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5" aria-label="Technologies">
                  {project.tags.map((tag) => (
                    <span key={tag} className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.tagBg}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats + GitHub */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-gray-500 text-xs">
                    <span className="flex items-center gap-1" aria-label={`${project.stars} stars`}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {project.stars}
                    </span>
                    <span className="flex items-center gap-1" aria-label={`${project.forks} forks`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                      </svg>
                      {project.forks}
                    </span>
                  </div>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                    aria-label={`View ${project.name} on GitHub`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* More projects CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a
            href="https://github.com/Hack-Orbit-Global"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            View All on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  )
}
