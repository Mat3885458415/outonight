import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

// ── Star field ────────────────────────────────────────────────────────────────
function useStars(count = 60) {
  return useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    top:      Math.random() * 85,
    left:     Math.random() * 100,
    size:     Math.random() * 2.5 + 0.8,
    opacity:  Math.random() * 0.5 + 0.15,
    duration: Math.random() * 4 + 3,
    delay:    Math.random() * 4,
  })), [])
}

// ── Login sheet ───────────────────────────────────────────────────────────────
function LoginSheet({ onLogin, onClose }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  const handleApple = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: 'https://outonight.vercel.app' } })
  }

  const handleEmail = async () => {
    setLoading(true); setError('')
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else if (data.session) onLogin(data.session)
    setLoading(false)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-[32px] border-t border-white/10 bg-[#0D0E1A] pb-10"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-5">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="px-6">
          <h2 className="mb-1 text-center text-2xl font-bold tracking-tight">
            {isSignUp ? 'Join Outonight' : 'Welcome back'}
          </h2>
          <p className="mb-7 text-center text-sm text-white/40">
            {isSignUp ? 'Create your free account' : 'Sign in to your account'}
          </p>

          {/* Social */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleApple}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 text-sm font-medium transition active:scale-[0.97]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
            <button
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 text-sm font-medium transition active:scale-[0.97]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.65 4.57 1.7l3.4-3.4A11.95 11.95 0 0 0 12 .9C8.09.9 4.7 3.03 2.84 6.18l2.43 3.58z"/>
                <path fill="#34A853" d="M16.04 18.01A7.02 7.02 0 0 1 12 19.1c-2.89 0-5.37-1.73-6.57-4.25l-2.42 3.57C4.72 21 8.1 23.1 12 23.1c2.93 0 5.73-1.07 7.83-3l-3.79-2.09z"/>
                <path fill="#4A90D9" d="M19.83 20.1C22.04 18.01 23.5 14.9 23.5 12c0-.73-.1-1.5-.24-2.2H12v4.67h6.5c-.3 1.5-1.14 2.73-2.46 3.54l3.79 2.09z"/>
                <path fill="#FBBC05" d="M5.43 14.85A7.1 7.1 0 0 1 4.9 12c0-.99.18-1.94.5-2.82L2.97 5.6A11.93 11.93 0 0 0 .9 12c0 1.96.48 3.8 1.32 5.42l3.21-2.57z"/>
              </svg>
              Google
            </button>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30">or with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-3">
            {isSignUp && (
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/60 transition"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            )}
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/60 transition"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/60 transition"
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}

          <button
            onClick={handleEmail}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-[0_6px_24px_rgba(124,77,255,0.35)] transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-xs text-white/40">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="cursor-pointer text-violet-400 underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </span>
          </p>
        </div>
      </motion.div>
    </>
  )
}

// ── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage({ onLogin }) {
  const [showLogin, setShowLogin]       = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled]   = useState(false)
  const [isIOS, setIsIOS]               = useState(false)
  const [showIOSHint, setShowIOSHint]   = useState(false)
  const stars = useStars(55)

  useEffect(() => {
    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
      !!window.navigator.standalone
    )
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)

    const handler = e => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) { setShowIOSHint(true); return }
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setInstallPrompt(null)
    }
  }

  const features = [
    { emoji: '🍺', label: 'Bars',   sub: 'Best spots in Zlín'    },
    { emoji: '🎉', label: 'Events', sub: 'Parties every night'   },
    { emoji: '👥', label: 'Plans',  sub: 'See who\'s going out'  },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07080C] text-white">

      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-700/25 blur-[130px]" />
        <div className="absolute top-1/2 -left-32 h-[350px] w-[350px] rounded-full bg-indigo-700/15 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-fuchsia-700/10 blur-[120px]" />
      </div>

      {/* ── Stars ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map(s => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, opacity: s.opacity }}
            animate={{ opacity: [s.opacity, s.opacity * 3, s.opacity] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center px-6 pb-16 pt-14">

        {/* Logo icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-7 flex h-20 w-20 items-center justify-center rounded-[28px] border border-violet-500/30 bg-gradient-to-br from-violet-600/25 to-indigo-700/20 text-4xl shadow-[0_0_40px_rgba(124,77,255,0.25)]"
        >
          🌙
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mb-3 text-center text-[56px] font-black leading-none tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 45%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          OUTONIGHT
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 text-center text-[15px] leading-relaxed text-white/50"
        >
          Discover bars, parties & restaurants<br />
          <span className="text-violet-300/80">made for TBU Zlín students</span>
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10 flex w-full gap-3"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="flex flex-1 flex-col items-center gap-2 rounded-[20px] border border-white/8 bg-white/[0.04] px-2 py-4"
            >
              <span className="text-2xl">{f.emoji}</span>
              <p className="text-xs font-semibold text-white/90">{f.label}</p>
              <p className="text-center text-[10px] leading-tight text-white/35">{f.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.4 }}
          className="relative mb-10 w-full max-w-[260px]"
        >
          {/* Glow under mockup */}
          <div className="absolute -bottom-6 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-full bg-violet-600/25 blur-2xl" />

          <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-md">
            {/* Top bar */}
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[11px] border border-violet-500/30 bg-violet-600/20 text-[15px]">🌙</div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-violet-300/60">Outonight</p>
                <p className="text-[11px] font-semibold">Tonight in Zlín</p>
              </div>
            </div>

            {/* Mock event cards */}
            {[
              { emoji: '🎵', name: 'DJ Night', venue: 'Music Bar', going: 24, color: 'from-violet-500/20 to-indigo-500/20' },
              { emoji: '🍹', name: 'Cocktail Thursday', venue: 'Sky Bar', going: 18, color: 'from-sky-500/20 to-cyan-500/20' },
              { emoji: '🎸', name: 'Live Music', venue: 'Rock Café', going: 11, color: 'from-rose-500/20 to-orange-500/20' },
            ].map((ev, i) => (
              <motion.div
                key={ev.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="mb-2 flex items-center gap-2.5 rounded-[14px] bg-white/[0.06] p-2.5"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br ${ev.color} text-[17px]`}>{ev.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold">{ev.name}</p>
                  <p className="text-[9px] text-white/40">{ev.venue}</p>
                </div>
                <span className="shrink-0 rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-medium text-violet-300">{ev.going}</span>
              </motion.div>
            ))}

            {/* Mock bottom nav */}
            <div className="mt-3 flex gap-1.5">
              {['🏠', '🧭', '🗺️', '👤'].map((icon, i) => (
                <div key={icon} className={`flex flex-1 items-center justify-center rounded-[10px] py-2 text-[13px] ${i === 0 ? 'bg-white text-[#0B0C11]' : 'bg-white/[0.06]'}`}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55 }}
          className="w-full space-y-3"
        >
          <button
            onClick={() => setShowLogin(true)}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-[15px] font-bold text-white shadow-[0_8px_32px_rgba(109,40,217,0.4)] transition active:scale-[0.98]"
          >
            <span className="relative z-10">Join the night →</span>
            <div className="absolute inset-0 bg-white/0 transition group-active:bg-white/10" />
          </button>

          {!isInstalled && (
            <button
              onClick={handleInstall}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] py-4 text-[13px] font-medium text-white/70 transition active:scale-[0.98] active:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v13"/><path d="M7 12l5 5 5-5"/>
                <path d="M3 18v1a2 2 0 002 2h14a2 2 0 002-2v-1"/>
              </svg>
              {isIOS ? 'Add to Home Screen (iOS)' : 'Install App'}
            </button>
          )}

          {isInstalled && (
            <p className="text-center text-xs text-emerald-400/70">✓ App installed on your device</p>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-[11px] text-white/20"
        >
          Zlín · Czech Republic · TBU Students
        </motion.p>
      </div>

      {/* ── iOS install hint ── */}
      <AnimatePresence>
        {showIOSHint && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-white/12 bg-[#1A1B26]/95 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">📱</span>
              <p className="font-semibold text-sm">Install on iPhone</p>
            </div>
            <p className="text-xs text-white/55 leading-relaxed">
              1. Open in <span className="font-semibold text-white/80">Safari</span><br />
              2. Tap the <span className="font-semibold text-white/80">Share</span> button{' '}
              <span className="inline-block rounded bg-white/10 px-1 text-xs">⎙</span> at the bottom<br />
              3. Select <span className="font-semibold text-white/80">"Add to Home Screen"</span>
            </p>
            <button
              onClick={() => setShowIOSHint(false)}
              className="mt-3 rounded-xl bg-violet-600/20 px-4 py-1.5 text-xs font-medium text-violet-300"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Login sheet ── */}
      <AnimatePresence>
        {showLogin && (
          <LoginSheet onLogin={onLogin} onClose={() => setShowLogin(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
