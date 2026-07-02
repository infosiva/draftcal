'use client'
import { useState } from 'react'
import GammaPromptCard from './GammaPromptCard'

const SUGGESTIONS = [
  'Content calendar for a SaaS startup, LinkedIn + Twitter, 2 weeks, professional tone',
  'Instagram + TikTok content for a fitness brand, 4 weeks, motivational',
  'Twitter campaign for a new mobile app launch, 1 week, casual',
  'LinkedIn thought leadership posts for a consultant, monthly, expert tone',
]

type CalendarPost = { date: string; platform: string; content: string; hashtags: string[] }

export default function GammaHero() {
  const [posts, setPosts] = useState<CalendarPost[]>([])
  const [error, setError] = useState('')

  async function handlePrompt(prompt: string) {
    setError(''); setPosts([])

    // Parse natural language into draftcal fields
    const platformMap: Record<string, string[]> = {
      linkedin: ['LinkedIn'], twitter: ['Twitter/X'], instagram: ['Instagram'],
      tiktok: ['TikTok'], facebook: ['Facebook'],
    }
    const lower = prompt.toLowerCase()
    const platforms = Object.entries(platformMap)
      .filter(([key]) => lower.includes(key))
      .flatMap(([, v]) => v)
    const weeks = lower.includes('month') ? 4 : lower.includes('2 week') ? 2 : 1
    const tone = lower.includes('professional') || lower.includes('expert') ? 'professional'
      : lower.includes('casual') || lower.includes('fun') ? 'casual'
      : lower.includes('motivat') ? 'motivational' : 'balanced'
    const topic = prompt.replace(/\b(linkedin|twitter|instagram|tiktok|facebook|week|month|professional|casual|tone|content|calendar|for|a|an|the)\b/gi, '').trim()

    const res = await fetch('/api/generate-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: topic || prompt,
        platforms: platforms.length ? platforms : ['LinkedIn', 'Twitter/X'],
        tone,
        weeks,
      }),
    })

    if (!res.ok) { setError('Generation failed — try again'); return }
    const data = await res.json()
    if (data.posts) setPosts(data.posts)
    else if (data.calendar) setPosts(data.calendar)
    else setError(data.error || 'Unexpected response')
  }

  return (
    <GammaPromptCard
      label="DraftCal"
      labelBadge="AI"
      placeholder="Content calendar for a SaaS startup, LinkedIn + Twitter, 2 weeks, professional tone..."
      onSubmit={handlePrompt}
      bgImage="/hero-bg.png"
      bgGradient="linear-gradient(135deg, #0a1628 0%, #0f1f3d 50%, #060e1f 100%)"
      accentColor="#2563eb"
      suggestions={SUGGESTIONS}
      outputSlot={
        error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
        ) : posts.length ? (
          <CalendarOutput posts={posts} />
        ) : null
      }
    />
  )
}

function CalendarOutput({ posts }: { posts: CalendarPost[] }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.96)' }}>
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Your content calendar</h2>
        <p className="text-gray-400 text-sm">{posts.length} posts across {[...new Set(posts.map(p => p.platform))].join(', ')}</p>
      </div>
      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {posts.slice(0, 8).map((post, i) => (
          <div key={i} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{post.platform}</span>
              <span className="text-xs text-gray-400">{post.date}</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
            {post.hashtags?.length > 0 && (
              <p className="text-xs text-blue-500 mt-1">{post.hashtags.map(h => `#${h}`).join(' ')}</p>
            )}
          </div>
        ))}
        {posts.length > 8 && (
          <div className="p-4 text-center text-sm text-blue-600">
            + {posts.length - 8} more posts — <a href="/calendar" className="underline">view full calendar</a>
          </div>
        )}
      </div>
    </div>
  )
}
