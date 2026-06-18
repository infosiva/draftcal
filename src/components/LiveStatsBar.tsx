'use client'
import { useEffect, useState } from 'react'

interface Stats { eventsScheduled: number; draftsCreated: number; invitesSent: number }

export default function LiveStatsBar() {
  const [stats, setStats] = useState<Stats>({ eventsScheduled: 0, draftsCreated: 0, invitesSent: 0 })

  useEffect(() => {
    fetch('/api/session-stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  if (!stats.eventsScheduled && !stats.draftsCreated && !stats.invitesSent) return null

  return (
    <div className="border-y py-3 px-5" style={{ background: 'var(--surface-2,#fffbf5)', borderColor: 'var(--border,#fde68a)' }}>
      <div className="mx-auto flex max-w-5xl justify-center gap-8 flex-wrap">
        {stats.eventsScheduled > 0 && (
          <div className="text-center">
            <span className="block text-[20px] font-black" style={{ color: 'var(--accent,#d97706)' }}>{stats.eventsScheduled}</span>
            <span className="text-[11px] text-slate-500">events scheduled this session</span>
          </div>
        )}
        {stats.draftsCreated > 0 && (
          <div className="text-center">
            <span className="block text-[20px] font-black" style={{ color: 'var(--accent,#d97706)' }}>{stats.draftsCreated}</span>
            <span className="text-[11px] text-slate-500">drafts created</span>
          </div>
        )}
      </div>
    </div>
  )
}
