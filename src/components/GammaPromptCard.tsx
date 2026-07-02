'use client'
// Gamma-style fullscreen prompt card — big textarea, immersive bg, instant generation.
// Drop into any project that has a prompt-in → content-out flow.
// Usage:
//   <GammaPromptCard
//     label="Trip Planner"
//     placeholder="Plan a 5-day trip to Tokyo in April, solo traveller, mid-range budget..."
//     onSubmit={async (prompt) => { /* call your /api/generate route */ }}
//     bgImage="/hero-bg.png"   // optional — your generated hero-bg.png
//     accentColor="#0ea5e9"
//   />

import { useState, useRef, useEffect } from 'react'

export type GammaPromptCardProps = {
  label: string
  labelBadge?: string           // e.g. "LAB" or "AI" or "BETA"
  placeholder: string
  onSubmit: (prompt: string) => Promise<void>
  bgImage?: string              // path to hero-bg.png or CSS gradient
  bgGradient?: string           // fallback if no image
  accentColor?: string          // button + focus ring
  outputSlot?: React.ReactNode  // rendered below card after submit
  suggestions?: string[]        // clickable example prompts
}

export default function GammaPromptCard({
  label,
  labelBadge,
  placeholder,
  onSubmit,
  bgImage,
  bgGradient = 'linear-gradient(135deg, #0f1f0f 0%, #0a1628 50%, #0d1f1a 100%)',
  accentColor = '#0ea5e9',
  outputSlot,
  suggestions = [],
}: GammaPromptCardProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 240) + 'px'
  }, [prompt])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    setLoading(true)
    try {
      await onSubmit(prompt.trim())
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  function handleSuggestion(s: string) {
    setPrompt(s)
    textareaRef.current?.focus()
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: bgGradient,
          ...(bgImage ? {
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}),
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-0 bg-black/45" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{label}</span>
              {labelBadge && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: accentColor + '20', color: accentColor }}
                >
                  {labelBadge}
                </span>
              )}
            </div>
            {prompt && (
              <button
                type="button"
                onClick={() => { setPrompt(''); setSubmitted(false) }}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* Textarea */}
          <div className="px-6 pb-4">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent) }}
              placeholder={placeholder}
              rows={3}
              className="w-full resize-none outline-none text-gray-800 placeholder:text-gray-400 text-[15px] leading-relaxed bg-transparent"
              style={{ minHeight: 72, maxHeight: 240 }}
              autoFocus
            />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !prompt && (
            <div className="px-6 pb-4 flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Submit bar */}
          <div
            className="px-6 py-4 flex items-center justify-between border-t border-gray-100"
          >
            <span className="text-xs text-gray-400">⌘ + Enter to generate</span>
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{
                background: loading ? '#94a3b8' : accentColor,
                boxShadow: loading ? 'none' : `0 4px 16px ${accentColor}55`,
                transform: 'scale(1)',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  Generate
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Output slot — appears below card after submit */}
        {submitted && outputSlot && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {outputSlot}
          </div>
        )}
      </div>
    </div>
  )
}
