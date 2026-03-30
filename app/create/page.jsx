'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
})

function InputField({ label, id, placeholder, value, onChange, hint, error, required, ...rest }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-blue-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl bg-[#0d1525] border text-sm text-white placeholder-gray-600
          transition-all duration-200 outline-none
          focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15
          ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/8 hover:border-white/15'}`}
        required={required}
        {...rest}
      />
      {hint && !error && (
        <p className="text-xs text-gray-600">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

function SuccessCard({ id }) {
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${id}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-blue-500/25 bg-blue-500/8 p-8 text-center space-y-5"
      style={{ boxShadow: '0 0 40px rgba(59,130,246,0.12)' }}
    >
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full border border-blue-500/30 bg-blue-500/15 flex items-center justify-center">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-1">Identity Created!</h2>
        <p className="text-sm text-gray-400">Your Orbit Identity is live and ready to share.</p>
      </div>

      {/* ID display */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/40 bg-blue-500/15">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="font-mono font-bold text-blue-300 tracking-widest">{id}</span>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          href={`/u/${id}`}
          className="btn-primary w-full justify-center text-sm"
        >
          View Your Profile
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <button
          onClick={() => navigator.clipboard?.writeText(profileUrl)}
          className="btn-outline w-full justify-center text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Profile Link
        </button>
      </div>

      <p className="text-xs text-gray-600">
        Save your ID — you'll need it to access your profile later.
      </p>
    </motion.div>
  )
}

export default function CreatePage() {
  const [form, setForm] = useState({ name: '', github: '', discord: '', skills: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [createdId, setCreatedId] = useState(null)

  const update = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    else if (form.name.trim().length < 2) e.name = 'At least 2 characters.'

    if (!form.github.trim()) e.github = 'GitHub username is required.'
    else if (!/^[a-zA-Z0-9-]{1,39}$/.test(form.github.trim().replace(/^@/, ''))) {
      e.github = 'Invalid GitHub username format.'
    }

    if (!form.discord.trim()) e.discord = 'Discord username is required.'
    if (!form.skills.trim()) e.skills = 'At least one skill is required.'

    return e
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          github: form.github.trim().replace(/^@/, ''),
          discord: form.discord.trim(),
          skills: form.skills.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setCreatedId(data.id)
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100">
      <Navbar />

      <main className="section-padding pt-32 max-w-2xl mx-auto">
        {/* Page header */}
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Orbit Identity
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Create Your{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Developer Identity
            </span>
          </h1>

          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
            One profile to prove your Hack Orbit contributions. Share it, scan it, own it.
          </p>
        </motion.div>

        {/* Form / Success */}
        <AnimatePresence mode="wait">
          {createdId ? (
            <SuccessCard key="success" id={createdId} />
          ) : (
            <motion.div
              key="form"
              {...fadeUp(0.15)}
              className="rounded-2xl border border-white/8 bg-[#111827] p-6 sm:p-8 space-y-5"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
            >
              {/* Subtle top border glow */}
              <div
                className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(59,130,246,0.4), transparent)',
                }}
              />

              <InputField
                label="Full Name"
                id="name"
                placeholder="e.g. Arjun Sharma"
                value={form.name}
                onChange={update('name')}
                error={errors.name}
                required
              />

              <InputField
                label="GitHub Username"
                id="github"
                placeholder="e.g. arjun-dev"
                value={form.github}
                onChange={update('github')}
                hint="Your GitHub handle — without the @"
                error={errors.github}
                required
                autoComplete="off"
                autoCapitalize="off"
              />

              <InputField
                label="Discord Username"
                id="discord"
                placeholder="e.g. arjun#1234 or arjun.dev"
                value={form.discord}
                onChange={update('discord')}
                hint="Your Discord handle or username"
                error={errors.discord}
                required
              />

              <InputField
                label="Skills"
                id="skills"
                placeholder="e.g. React, TypeScript, Node.js, Python"
                value={form.skills}
                onChange={update('skills')}
                hint="Comma-separated — keep it relevant to what you build"
                error={errors.skills}
                required
              />

              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/25 bg-red-500/8 text-red-400 text-sm"
                >
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {serverError}
                </motion.div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Identity…
                  </>
                ) : (
                  <>
                    Create Orbit Identity
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-600 text-center pt-1">
                By creating an identity, you agree to Hack Orbit's community guidelines.
                Your GitHub contributions are fetched publicly from the GitHub API.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info cards */}
        {!createdId && (
          <motion.div {...fadeUp(0.3)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                ),
                title: 'Unique ID',
                desc: 'Get a permanent HO-XXXX identifier',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Contribution Proof',
                desc: 'Auto-fetches your Hack Orbit GitHub stats',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 0h.01M19 20h.01M19 8h.01" />
                  </svg>
                ),
                title: 'QR Card',
                desc: 'Shareable QR code links to your profile',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/6 bg-[#0f1623] p-4 flex flex-col gap-2"
              >
                <span className="text-blue-400">{item.icon}</span>
                <span className="text-sm font-semibold text-white">{item.title}</span>
                <span className="text-xs text-gray-500 leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}
