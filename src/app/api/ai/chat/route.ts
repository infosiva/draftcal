import { NextRequest, NextResponse } from 'next/server'
import { AI_LIMITER } from '@/lib/rateLimit'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const limited = AI_LIMITER.check(req); if (limited) return limited

  const { messages } = await req.json()
  const userMsg = messages?.[messages.length - 1]?.content || ''

  const groqKey = process.env.GROQ_API_KEY || ''
  if (!groqKey) return NextResponse.json({ text: 'AI service unavailable.' }, { status: 503 })

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant for this application. Keep responses concise and helpful.' },
          { role: 'user', content: userMsg },
        ],
        max_tokens: 300,
      }),
    })
    const data = await res.json()
    let text = data.choices?.[0]?.message?.content as string | undefined
    if (!text) {
      // Groq returned nothing usable (retired model / bad key / rate limit): fall back to Gemini
      const gk = process.env.GEMINI_API_KEY
      if (gk) {
        try {
          const gr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${gk}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemInstruction: { parts: [{ text: 'You are a helpful AI assistant for this application. Keep responses concise and helpful.' }] }, contents: [{ role: 'user', parts: [{ text: userMsg }] }], generationConfig: { maxOutputTokens: 400, temperature: 0.6 } }),
          })
          if (gr.ok) text = (await gr.json()).candidates?.[0]?.content?.parts?.[0]?.text
        } catch { /* fall through */ }
      }
    }
    if (!text) return NextResponse.json({ text: 'Chat is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ text: 'Try again in a moment!' })
  }
}
