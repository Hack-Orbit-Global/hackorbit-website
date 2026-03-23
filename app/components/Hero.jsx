'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

function OrbitRing({ size, duration, delay, dotColor, lineOpacity = 0.15 }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="rounded-full border"
        style={{
          width: size,
          height: size,
          borderColor: `rgba(59,130,246,${lineOpacity})`,
          position: 'relative',
        }}
      >
        <motion.div
          className="absolute w-3 h-3 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            marginTop: -6,
            marginLeft: -6,
            background: dotColor,
            boxShadow: `0 0 12px ${dotColor}`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear',
            delay,
          }}
          transformTemplate={({ rotate }) =>
            `translateX(-50%) translateY(-50%) rotate(${rotate}) translateX(${size / 2}px) rotate(-${rotate})`
          }
        />
      </div>
    </div>
  )
}

function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 4,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0F19]"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 bg-hero-glow pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <StarField />

      {/* Orbit rings centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="relative" style={{ width: 600, height: 600 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[220px] h-[220px] rounded-full border border-blue-500/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[350px] h-[350px] rounded-full border border-purple-500/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[520px] h-[520px] rounded-full border border-blue-500/5" />
          </div>
          <OrbitRing size={220} duration={8} delay={0} dotColor="#3B82F6" lineOpacity={0} />
          <OrbitRing size={350} duration={14} delay={2} dotColor="#8B5CF6" lineOpacity={0} />
          <OrbitRing size={520} duration={22} delay={1} dotColor="#60A5FA" lineOpacity={0} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-5 sm:px-8 max-w-4xl mx-auto pt-24">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          {...fadeUp(0.1)}
        >
          <motion.div
            className="relative w-20 h-20 sm:w-24 sm:h-24"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src="/logo.png"
              alt="Hack Orbit Logo"
              fill
              sizes="96px"
              priority
              className="object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div className="flex justify-center mb-6" {...fadeUp(0.2)}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
            Open Source Developer Community
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
          {...fadeUp(0.3)}
        >
          Build in Public.{' '}
          <span className="text-gradient-blue">Build Together.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          {...fadeUp(0.4)}
        >
          Hack Orbit is a community of developers building real projects in the open — collaborating across hackathons, open-source contributions, and lifelong learning.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          {...fadeUp(0.5)}
        >
          <a
            href="https://discord.gg/GVNnacYENf"
            className="btn-primary text-base px-7 py-3.5 w-full sm:w-auto justify-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* Discord icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Join Community
          </a>
          <a
            href="#projects"
            className="btn-outline text-base px-7 py-3.5 w-full sm:w-auto justify-center"
          >
            Explore Projects
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          {...fadeUp(0.65)}
        >
          {[
            { value: '500+', label: 'Developers' },
            { value: '20+', label: 'Projects' },
            { value: '10+', label: 'Hackathons' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-gradient-blue">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="mt-10 text-xs sm:text-sm text-gray-500 font-medium tracking-widest uppercase"
          {...fadeUp(0.75)}
        >
          Build – Contribute – Orbit Together
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-hidden="true"
      >
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
