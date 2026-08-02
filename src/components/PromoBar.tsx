'use client'

/**
 * PromoBar — inline "have a promo code?" toggle + unlocked-state banner.
 * Uses existing lib/promoCode.ts (server) + hooks/usePromo.ts (client) backend.
 */

import { useState } from 'react'
import { usePromo } from '@/hooks/usePromo'

export default function PromoBar({ accentColor = 'var(--accent)' }: { accentColor?: string }) {
  const { isUnlocked, daysLeft } = usePromo()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'invalid'>('idle')

  if (isUnlocked) {
    return (
      <div
        className="mx-auto max-w-md text-center text-sm font-medium rounded-full px-4 py-2 mb-4"
        style={{ background: `color-mix(in srgb, ${accentColor} 14%, transparent)`, color: accentColor }}
      >
        🎉 Pro access active — {daysLeft} day{daysLeft === 1 ? '' : 's'} remaining
      </div>
    )
  }

  async function submit() {
    if (!code.trim()) return
    setStatus('checking')
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.valid) {
        window.location.reload()
      } else {
        setStatus('invalid')
      }
    } catch {
      setStatus('invalid')
    }
  }

  return (
    <div className="text-center mb-4 text-sm">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: accentColor }}
        >
          Have a promo code?
        </button>
      ) : (
        <div className="inline-flex items-center gap-2">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setStatus('idle') }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Enter code"
            className="rounded-md border px-3 py-1.5 text-sm"
            style={{ borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)` }}
          />
          <button
            onClick={submit}
            disabled={status === 'checking'}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: accentColor }}
          >
            {status === 'checking' ? '...' : 'Apply'}
          </button>
        </div>
      )}
      {status === 'invalid' && <p className="text-red-500 text-xs mt-1">Invalid code</p>}
    </div>
  )
}
