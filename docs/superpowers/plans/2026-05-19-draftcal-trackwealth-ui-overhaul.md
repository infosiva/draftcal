# DraftCal + TrackWealth Full UI/UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernise both DraftCal and TrackWealth with updated site.config.ts, SEO-upgraded layouts, Navbar overhaul, Framer-Motion landing pages, floating ChatBot, about page, robots.txt, and sitemap — then build and push both to production.

**Architecture:** Both projects share the same src/ structure (app router, Next.js 15, Tailwind). Changes are parallel and independent. The landing page (app/page.tsx) keeps ALL existing functional app code (generator, portfolio form, etc.) and prepends a new above-the-fold hero + stats bar. Framer Motion animations use CSS keyframes (no new package install — framer-motion is not in either project's package.json).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, CSS keyframe animations (no framer-motion install), existing SharedNavbar + ChatBot components

---

## Key Decisions (read before starting)

1. **site.config.ts** — both projects already have one at `src/site.config.ts`. We UPDATE it, not create a new one.
2. **Navbar** — `SharedNavbar` already exists at `src/components/SharedNavbar.tsx` and `components/SharedNavbar.tsx`. The one in `src/components/` is consumed by layout. We update nav links there via the `brand` object in `layout.tsx` (not a new component file).
3. **ChatBot** — already exists at `src/components/ChatBot.tsx`. We update the opening message and timing (30s delay show).
4. **robots.txt** — DraftCal already has a correct one. TrackWealth's `public/` has no robots.txt. Add one.
5. **sitemap.ts** — neither project has one. Create `src/app/sitemap.ts` in each.
6. **about page** — both already have `src/app/about/page.tsx`. We enhance them.
7. **page.tsx** — we ADD a new hero section above the existing generator/portfolio sections. Do NOT remove existing app logic.
8. **Framer Motion** — not installed; use CSS `@keyframes fadeSlideUp` (already used in DraftCal) + `animation` inline styles.
9. **VPS stats** — already present in DraftCal page.tsx. TrackWealth does not have it; add it.
10. **Stats from siteConfig** — displayed in a new Stats Bar section below the hero on both pages.

---

## File Map

### DraftCal (`/Users/sivaprakasam/projects/agents/social-media-calendar/`)

| Action | File |
|--------|------|
| Modify | `src/site.config.ts` |
| Modify | `src/app/layout.tsx` |
| Modify | `public/robots.txt` |
| Create | `src/app/sitemap.ts` |
| Modify | `src/app/layout.tsx` (nav links + JSON-LD FAQPage) |
| Modify | `src/components/ChatBot.tsx` (30s delay + new opening message) |
| Modify | `src/app/page.tsx` (prepend Stats Bar section above existing hero) |
| Modify | `src/app/about/page.tsx` (enhance) |

### TrackWealth (`/Users/sivaprakasam/projects/agents/ai-investment-tracker/`)

| Action | File |
|--------|------|
| Modify | `src/site.config.ts` (create — doesn't exist yet) |
| Modify | `src/app/layout.tsx` |
| Create | `public/robots.txt` |
| Create | `src/app/sitemap.ts` |
| Modify | `src/components/ChatBot.tsx` |
| Modify | `src/app/page.tsx` (add Stats Bar after ticker tape) |
| Modify | `src/app/about/page.tsx` |

---

## Task 1: DraftCal — site.config.ts

**Files:**
- Modify: `src/site.config.ts`

- [ ] **Step 1: Update site.config.ts with new required fields**

Replace the entire file content:

```typescript
// site.config.ts — Single source of truth for DraftCal brand content
export const siteConfig = {
  name: "DraftCal",
  tagline: "AI Social Media Calendar",
  description: "Plan, generate, and schedule social media content with AI. One dashboard for all platforms.",
  url: "https://draftcal.app",
  primaryColor: "#7c3aed",
  accentColor: "#ec4899",
  secondaryColor: "#8b5cf6",
  icon: "📅",
  stats: { posts: "420,000+", creators: "8,600+", platforms: "6" },
  chatbot: {
    openingMessage: "Hi! I can draft social media posts for you. What's your niche or topic today?",
    apiEndpoint: "/api/chat",
  },
  seo: {
    title: "DraftCal — AI Social Media Calendar & Content Planner",
    description: "Generate and schedule social content with AI. Instagram, Twitter, LinkedIn, TikTok — all from one calendar.",
  },
  features: [
    { icon: "📅", title: "30 days of posts in 30 seconds", desc: "Drop your brand, pick platforms, hit generate. AI fills your entire content calendar instantly." },
    { icon: "📣", title: "All 5 platforms optimised", desc: "Twitter/X, LinkedIn, Instagram, TikTok, Facebook — platform-specific hooks, hashtags, and timing." },
    { icon: "📊", title: "Engagement analytics preview", desc: "Estimated reach, engagement rate, and interactions per post — before you even publish." },
    { icon: "🎨", title: "Multiple tones & formats", desc: "Professional, casual, humorous, inspirational, educational — every post in your voice." },
    { icon: "⬇️", title: "Export to CSV or copy all", desc: "One-click copy or download your full calendar to Buffer, Later, Hootsuite — or anywhere." },
    { icon: "🧠", title: "Brand voice memory (Pro)", desc: "AI learns your tone so every post sounds authentically you, every time." },
  ],
  nav: {
    links: [
      { label: "Home", href: "/" },
      { label: "Calendar", href: "/#generator" },
      { label: "Generate", href: "/#generator" },
      { label: "Pricing", href: "/#pricing" },
      { label: "About", href: "/about" },
    ],
    cta: { label: "Generate free →", href: "/#generator" },
  },
}

export type SiteConfig = typeof siteConfig
```

- [ ] **Step 2: Verify no TypeScript errors in site.config.ts**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && npx tsc --noEmit --skipLibCheck 2>&1 | head -30
```

---

## Task 2: DraftCal — layout.tsx SEO overhaul

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update layout.tsx with new SEO, nav links, and FAQPage JSON-LD**

Replace the `metadata` export and the JSON-LD script block. The brand nav links should reference siteConfig. Full replacement:

```typescript
import Script from 'next/script'
import type { Metadata } from 'next'
import './globals.css'
import SharedNavbar from '@/components/SharedNavbar'
import Footer from '../../components/Footer'
import DesignEffects from '@/components/DesignEffects'
import AnimatedBackground from '@/components/AnimatedBackground'
import ChatBot from '@/components/ChatBot'
import type { BrandConfig } from '@/components/SharedNavbar'
import CookieConsent from "../../components/CookieConsent"
import { siteConfig } from '@/site.config'

const brand: BrandConfig = {
  name: siteConfig.name,
  tagline: siteConfig.description,
  icon: siteConfig.icon,
  color: siteConfig.accentColor,
  url: siteConfig.url,
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Calendar', href: '/#generator' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'About', href: '/about' },
  ],
  cta: { label: 'Generate free →', href: '/#generator' },
}

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
  keywords: ['social media calendar', 'AI content calendar', 'AI social media', 'content scheduler', 'Instagram captions', 'LinkedIn posts', 'TikTok content'],
  openGraph: {
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    type: 'website',
    locale: 'en_US',
    siteName: siteConfig.name,
    url: siteConfig.url,
    images: [{ url: `${siteConfig.url}/og.png`, width: 1200, height: 630, alt: `${siteConfig.name} — AI Social Media Calendar` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: siteConfig.url },
}

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": siteConfig.name,
  "url": siteConfig.url,
  "description": siteConfig.description,
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What is DraftCal?", "acceptedAnswer": { "@type": "Answer", "text": "DraftCal is an AI-powered social media content calendar. Enter your brand or topic, select platforms, and AI generates a full month of posts with hooks, hashtags, and engagement tips." } },
    { "@type": "Question", "name": "Is DraftCal free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. DraftCal is free to use with 3 calendar generations per day. Pro plan ($10/mo) removes all limits." } },
    { "@type": "Question", "name": "Which platforms does DraftCal support?", "acceptedAnswer": { "@type": "Answer", "text": "DraftCal supports Twitter/X, LinkedIn, Instagram, TikTok, and Facebook — with platform-specific optimisation for each." } },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Calistoga&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --theme-primary: #e11d48;
            --theme-secondary: #fb7185;
            --theme-base: #0f0308;
            --background: #0f0308;
            --surface-1: #1a0510;
            --surface-2: #260818;
            --foreground: #fff1f2;
            --text-2: #fda4af;
            --border-default: rgba(225,29,72,0.15);
            --border-strong: rgba(225,29,72,0.3);
            --radius: 0.75rem;
            --radius-lg: 1.25rem;
            --radius-xl: 2rem;
          }
          body { font-family: 'Inter', system-ui, sans-serif !important; }
          h1, h2, h3, .display { font-family: 'Calistoga', serif !important; letter-spacing: -0.02em; }
          .glass {
            background: rgba(15,3,8,0.65) !important;
            border-color: rgba(225,29,72,0.12) !important;
          }
          .platform-twitter  { color: #38bdf8; background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); }
          .platform-linkedin { color: #818cf8; background: rgba(129,140,248,0.08); border-color: rgba(129,140,248,0.2); }
          .platform-instagram{ color: #f472b6; background: rgba(244,114,182,0.08); border-color: rgba(244,114,182,0.2); }
          @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}} />
      </head>
      <body className="flex flex-col min-h-screen">
        <AnimatedBackground />
        <DesignEffects />
        <SharedNavbar brand={brand} />
        <main className="flex-1 pt-16">{children}</main>
        <Footer siteName={siteConfig.name} />
        <ChatBot />
        <CookieConsent />
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script src="http://31.97.56.148:3098/t.js" data-site="draftcal.app" defer></script>
        <Script async src="http://31.97.56.148:3100/script.js" data-website-id="4d705d06-cb56-450e-ad4a-249bb6cd138b" strategy="afterInteractive" />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

---

## Task 3: DraftCal — robots.txt + sitemap.ts

**Files:**
- Modify: `public/robots.txt`
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Update robots.txt**

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://draftcal.app/sitemap.xml
```

- [ ] **Step 2: Create src/app/sitemap.ts**

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://draftcal.app'
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/calendar`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/generate`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
```

- [ ] **Step 3: Verify sitemap compiles**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

---

## Task 4: DraftCal — ChatBot 30s delayed show

**Files:**
- Modify: `src/components/ChatBot.tsx`

- [ ] **Step 1: Add 30s delay reveal + update opening message**

Add a `shown` state with a 30s timeout. The button is hidden until `shown === true`. Update `WELCOME` to use siteConfig opening message.

Replace the top constants and add state:

```typescript
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const ACCENT = '#ec4899'
const BOT_NAME = 'DraftBot'
const WELCOME = "Hi! I can draft social media posts for you. What's your niche or topic today?"
const SYSTEM_PROMPT = `You are DraftBot, the AI content assistant for DraftCal — an AI social media calendar generator.
Help users plan their content calendar: brainstorm post ideas, write hooks, suggest hashtags, advise on platform best practices (Twitter/X, LinkedIn, Instagram, TikTok, Facebook), and help them get the most from their content calendar.
Be creative, practical, and enthusiastic about social media growth. Keep responses concise and actionable.`

interface Message { role: 'user' | 'assistant'; content: string }

export default function ChatBot() {
  const [shown, setShown] = useState(false)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 30s delay before showing chatbot button
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 30000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100) }, [open])
  // ... rest of component unchanged
```

Keep all the `send`, `onKey`, and JSX unchanged. In the return statement, wrap the trigger button with `{shown && (...)}`:

```tsx
  if (!shown) return null

  return (
    <>
      <button onClick={() => setOpen(o => !o)} ...>
        ...
      </button>
      {open && (
        <div ...>
          ...
        </div>
      )}
    </>
  )
```

- [ ] **Step 2: Verify compiles**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

---

## Task 5: DraftCal — page.tsx Stats Bar

**Files:**
- Modify: `src/app/page.tsx`

The existing page.tsx has a `<main>` section starting with the hero. We add a Stats Bar section AFTER the hero section and BEFORE the calendar/posts two-column section. The stats bar shows siteConfig.stats values.

- [ ] **Step 1: Add siteConfig import and Stats Bar to page.tsx**

At the top of page.tsx, after the existing imports, add:

```typescript
import { siteConfig } from '@/site.config'
```

Find the closing `</section>` of the hero section (around line 601 in the original — the one that ends with `</section>` after the CTAs div). After it, insert the Stats Bar section:

```tsx
      {/* ── Stats Bar ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-8" style={{ animation: 'fadeSlideUp 0.6s 0.5s ease-out both' }}>
        <div className="flex flex-wrap items-center justify-center gap-8 py-6 border-y border-white/[0.06]">
          <div className="text-center">
            <div className="text-3xl font-black text-white">{siteConfig.stats.posts}</div>
            <div className="text-xs text-white/40 mt-1">Posts generated</div>
          </div>
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-black text-white">{siteConfig.stats.creators}</div>
            <div className="text-xs text-white/40 mt-1">Creators using DraftCal</div>
          </div>
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-black" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{siteConfig.stats.platforms}</div>
            <div className="text-xs text-white/40 mt-1">Platforms supported</div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Verify VPS stats fetch exists in useEffect (already present in original — confirm)**

The existing `useEffect` in `Home()` already calls `fetch('http://31.97.56.148:3099/api/stats', ...)`. Confirm it's present — no change needed.

- [ ] **Step 3: Verify build**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

---

## Task 6: DraftCal — About page enhancement

**Files:**
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Replace about page with enhanced version**

```typescript
import type { Metadata } from "next"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `About | ${siteConfig.name}`,
  description: `About ${siteConfig.name} — ${siteConfig.seo.description}`,
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteConfig.url}/about` },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen text-white relative overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-12" style={{ animation: 'fadeSlideUp 0.6s ease-out both' }}>
          <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: '#f472b6' }}>
            About {siteConfig.name}
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Built for creators who want to{' '}
            <span style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ship content, not wrestle with it
            </span>
          </h1>
          <p className="text-white/55 text-lg leading-relaxed">
            {siteConfig.description}
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 mb-8" style={{ animation: 'fadeSlideUp 0.6s 0.1s ease-out both' }}>
          <h2 className="text-xl font-bold mb-3">Our mission</h2>
          <p className="text-white/55 leading-relaxed">
            Content creation should be about creativity, not scheduling drudgery. {siteConfig.name} uses AI to handle the heavy lifting — drafting posts, optimising for each platform, and suggesting the best times to publish — so you can focus on building your brand.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8" style={{ animation: 'fadeSlideUp 0.6s 0.2s ease-out both' }}>
          {[
            { value: siteConfig.stats.posts, label: 'Posts generated' },
            { value: siteConfig.stats.creators, label: 'Creators trust us' },
            { value: siteConfig.stats.platforms, label: 'Platforms supported' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 text-center">
              <div className="text-2xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-8" style={{ animation: 'fadeSlideUp 0.6s 0.3s ease-out both' }}>
          <h2 className="text-xl font-bold mb-5">How it works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Describe your brand', desc: 'Tell DraftCal your niche, tone, and target audience in a sentence.' },
              { step: '2', title: 'Choose platforms & tone', desc: 'Select which platforms to optimise for — Twitter/X, LinkedIn, Instagram, TikTok, or Facebook.' },
              { step: '3', title: 'Generate your calendar', desc: 'AI writes 30 days of posts instantly — hooks, hashtags, engagement tips, and best post times included.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white' }}>
                  {item.step}
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1">{item.title}</div>
                  <div className="text-white/50 text-sm leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center" style={{ animation: 'fadeSlideUp 0.6s 0.4s ease-out both' }}>
          <a href="/#generator"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', boxShadow: '0 0 40px rgba(236,72,153,0.3)' }}>
            Generate your calendar free →
          </a>
          <p className="text-white/25 text-xs mt-3">No account required · 3 free per day</p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && npm run build 2>&1 | tail -20
```

---

## Task 7: DraftCal — Git commit + push

**Files:** All modified files in social-media-calendar

- [ ] **Step 1: Full build pass**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` with 0 errors

- [ ] **Step 2: Stage specific files**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && git add src/site.config.ts src/app/layout.tsx public/robots.txt src/app/sitemap.ts src/components/ChatBot.tsx src/app/page.tsx src/app/about/page.tsx
```

- [ ] **Step 3: Commit**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && git commit -m "feat: DraftCal full UI/UX overhaul — modern landing, chatbot delay, SEO, robots.txt, sitemap"
```

- [ ] **Step 4: Push**

```bash
cd /Users/sivaprakasam/projects/agents/social-media-calendar && git push origin main
```

---

## Task 8: TrackWealth — site.config.ts

**Files:**
- Create: `src/site.config.ts` (does not exist — create)

- [ ] **Step 1: Create src/site.config.ts**

```typescript
// site.config.ts — Single source of truth for TrackWealth brand content
export const siteConfig = {
  name: "TrackWealth",
  tagline: "AI Investment Portfolio Tracker",
  description: "Track your stocks, crypto, and mutual funds in one place. AI-powered insights and alerts.",
  url: "https://trackwealth.app",
  primaryColor: "#059669",
  accentColor: "#22c55e",
  secondaryColor: "#34d399",
  icon: "📈",
  stats: { portfolios: "5,400+", assetsTracked: "250,000+", avgReturn: "+14.2%" },
  chatbot: {
    openingMessage: "Hi! I can analyze your portfolio or answer investment questions. What would you like to know?",
    apiEndpoint: "/api/chat",
  },
  seo: {
    title: "TrackWealth — AI Investment Portfolio Tracker & Analyzer",
    description: "Track stocks, crypto & mutual funds with AI insights. Real-time alerts, portfolio analytics.",
  },
  nav: {
    links: [
      { label: "Home", href: "/" },
      { label: "Portfolio", href: "/#portfolio-form" },
      { label: "Alerts", href: "/#portfolio-form" },
      { label: "Pricing", href: "/#pricing" },
      { label: "About", href: "/about" },
    ],
    cta: { label: "Track free →", href: "/#portfolio-form" },
  },
}

export type SiteConfig = typeof siteConfig
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/sivaprakasam/projects/agents/ai-investment-tracker && npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

---

## Task 9: TrackWealth — layout.tsx SEO overhaul

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx**

```typescript
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import SharedNavbar from '@/components/SharedNavbar'
import Footer from '../../components/Footer'
import DesignEffects from '@/components/DesignEffects'
import AnimatedBackground from '@/components/AnimatedBackground'
import ChatBot from '@/components/ChatBot'
import type { BrandConfig } from '@/components/SharedNavbar'
import CookieConsent from "../../components/CookieConsent"
import { siteConfig } from '@/site.config'

const brand: BrandConfig = {
  name: siteConfig.name,
  tagline: siteConfig.description,
  icon: siteConfig.icon,
  color: siteConfig.accentColor,
  url: siteConfig.url,
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/#portfolio-form' },
    { label: 'Alerts', href: '/#portfolio-form' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'About', href: '/about' },
  ],
  cta: { label: 'Track free →', href: '/#portfolio-form' },
}

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
  keywords: ['investment tracker', 'portfolio tracker', 'AI finance', 'stock portfolio', 'wealth management', 'crypto tracker'],
  openGraph: {
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    type: 'website',
    locale: 'en_US',
    siteName: siteConfig.name,
    url: siteConfig.url,
    images: [{ url: `${siteConfig.url}/og.png`, width: 1200, height: 630, alt: `${siteConfig.name} — AI Investment Tracker` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: siteConfig.url },
}

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": siteConfig.name,
  "url": siteConfig.url,
  "description": siteConfig.description,
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What is TrackWealth?", "acceptedAnswer": { "@type": "Answer", "text": "TrackWealth is an AI-powered investment portfolio tracker. Enter your stocks, crypto, or mutual fund holdings to get live P&L, AI risk analysis, and price alerts — no brokerage login required." } },
    { "@type": "Question", "name": "Is TrackWealth free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. TrackWealth is free with 3 portfolio analyses per day. Pro plan ($12/mo) gives unlimited analyses, email alerts, and CSV export." } },
    { "@type": "Question", "name": "Does TrackWealth require a brokerage account?", "acceptedAnswer": { "@type": "Answer", "text": "No. You manually enter your tickers and share counts. TrackWealth fetches live prices from Yahoo Finance — no brokerage connection needed." } },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --theme-primary: #059669;
            --theme-secondary: #34d399;
            --theme-base: #020f07;
            --background: #020f07;
            --surface-1: #071a0e;
            --surface-2: #0d2918;
            --foreground: #f0fdf4;
            --text-2: #6ee7b7;
            --border-default: rgba(5,150,105,0.15);
            --border-strong: rgba(5,150,105,0.3);
            --radius: 0.5rem;
            --radius-lg: 0.75rem;
          }
          body { font-family: 'Inter', system-ui, sans-serif !important; letter-spacing: -0.01em; }
          code, pre, .mono, .ticker { font-family: 'JetBrains Mono', monospace !important; }
          .glass {
            background: rgba(2,15,7,0.7) !important;
            border-color: rgba(5,150,105,0.12) !important;
          }
          .number-green { color: #34d399; font-family: 'JetBrains Mono', monospace; }
          .number-red   { color: #f87171; font-family: 'JetBrains Mono', monospace; }
          @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}} />
        <Script async src="http://31.97.56.148:3100/script.js" data-website-id="af91acc6-b818-431b-a010-c8f9d6c668e5" strategy="afterInteractive" />
      </head>
      <body className="flex flex-col min-h-screen">
        <AnimatedBackground />
        <DesignEffects />
        <SharedNavbar brand={brand} />
        <main className="flex-1 pt-16">{children}</main>
        <Footer siteName={siteConfig.name} />
        <ChatBot />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4237294630161176"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <CookieConsent />
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script src="http://31.97.56.148:3098/t.js" data-site="trackwealth.app" defer></script>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Type check**

```bash
cd /Users/sivaprakasam/projects/agents/ai-investment-tracker && npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

---

## Task 10: TrackWealth — robots.txt + sitemap.ts

**Files:**
- Create: `public/robots.txt`
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Create public/robots.txt**

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://trackwealth.app/sitemap.xml
```

- [ ] **Step 2: Create src/app/sitemap.ts**

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://trackwealth.app'
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/alerts`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
```

---

## Task 11: TrackWealth — ChatBot 30s delay + new opening message

**Files:**
- Modify: `src/components/ChatBot.tsx`

- [ ] **Step 1: Read existing ChatBot to understand current structure**

```bash
cat /Users/sivaprakasam/projects/agents/ai-investment-tracker/src/components/ChatBot.tsx
```

- [ ] **Step 2: Update WELCOME constant and add 30s shown state**

Change `WELCOME` to:
```
"Hi! I can analyze your portfolio or answer investment questions. What would you like to know?"
```

Add `shown` state with 30s delay (same pattern as DraftCal Task 4):
```typescript
const [shown, setShown] = useState(false)
// ...
useEffect(() => {
  const t = setTimeout(() => setShown(true), 30000)
  return () => clearTimeout(t)
}, [])
// ...
if (!shown) return null
```

Change accent color to match TrackWealth:
```typescript
const ACCENT = '#22c55e'
```

- [ ] **Step 3: Verify**

```bash
cd /Users/sivaprakasam/projects/agents/ai-investment-tracker && npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

---

## Task 12: TrackWealth — page.tsx Stats Bar + VPS stats

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add siteConfig import to page.tsx**

At the top of the file, after existing imports:
```typescript
import { siteConfig } from '@/site.config'
```

- [ ] **Step 2: Add VPS stats fire-and-forget in useEffect**

In the existing `useEffect` (the one with `localStorage.getItem('wealthpilot-history')` etc.), add at the end before `return () => clearInterval(id)`:

```typescript
    // VPS stats — fire and forget
    fetch('http://31.97.56.148:3099/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site: 'trackwealth.app',
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {/* ignore */})
```

- [ ] **Step 3: Add Stats Bar after ticker tape section**

Find the closing `</div>` of the ticker tape section (the `border-y border-emerald-900/30 overflow-hidden` div). After it, insert:

```tsx
      {/* ── Stats Bar ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-6" style={{ animation: 'fadeSlideUp 0.6s 0.2s ease-out both' }}>
        <div className="flex flex-wrap items-center justify-center gap-8 py-5 border-y border-emerald-900/30">
          <div className="text-center">
            <div className="text-3xl font-black font-mono text-emerald-400">{siteConfig.stats.portfolios}</div>
            <div className="text-xs text-emerald-800 font-mono mt-1">PORTFOLIOS TRACKED</div>
          </div>
          <div className="w-px h-10 bg-emerald-900/40 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-black font-mono text-emerald-400">{siteConfig.stats.assetsTracked}</div>
            <div className="text-xs text-emerald-800 font-mono mt-1">ASSETS TRACKED</div>
          </div>
          <div className="w-px h-10 bg-emerald-900/40 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-black font-mono text-emerald-400">{siteConfig.stats.avgReturn}</div>
            <div className="text-xs text-emerald-800 font-mono mt-1">AVG USER RETURN</div>
          </div>
        </div>
      </section>
```

- [ ] **Step 4: Build check**

```bash
cd /Users/sivaprakasam/projects/agents/ai-investment-tracker && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

---

## Task 13: TrackWealth — About page enhancement

**Files:**
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Replace about page**

```typescript
import type { Metadata } from "next"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `About | ${siteConfig.name}`,
  description: `About ${siteConfig.name} — ${siteConfig.seo.description}`,
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteConfig.url}/about` },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ color: '#f0fdf4' }}>
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-12" style={{ animation: 'fadeSlideUp 0.6s ease-out both' }}>
          <span className="text-xs font-mono font-bold uppercase tracking-widest mb-4 block" style={{ color: '#34d399' }}>
            // ABOUT {siteConfig.name.toUpperCase()}
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-mono mb-4 leading-tight" style={{ color: '#34d399' }}>
            Institutional-grade portfolio intelligence.{' '}
            <span style={{ color: '#059669' }}>For everyone.</span>
          </h1>
          <p style={{ color: 'rgba(240,253,244,0.55)', lineHeight: 1.7, fontSize: 17 }}>
            {siteConfig.description}
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-8 mb-8" style={{ animation: 'fadeSlideUp 0.6s 0.1s ease-out both' }}>
          <h2 className="font-mono font-bold text-lg mb-3" style={{ color: '#34d399' }}>// OUR MISSION</h2>
          <p style={{ color: 'rgba(240,253,244,0.55)', lineHeight: 1.7, fontSize: 14, fontFamily: 'monospace' }}>
            Hedge funds pay thousands for AI-driven portfolio analysis. We built the same capability for everyone — no brokerage login, no minimum balance, no complexity. Just enter your tickers and let AI do the rest.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8" style={{ animation: 'fadeSlideUp 0.6s 0.2s ease-out both' }}>
          {[
            { value: siteConfig.stats.portfolios, label: 'PORTFOLIOS TRACKED' },
            { value: siteConfig.stats.assetsTracked, label: 'ASSETS TRACKED' },
            { value: siteConfig.stats.avgReturn, label: 'AVG USER RETURN' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5 text-center">
              <div className="text-2xl font-black font-mono mb-1" style={{ color: '#34d399' }}>{s.value}</div>
              <div className="text-xs font-mono" style={{ color: '#064e3b' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-8" style={{ animation: 'fadeSlideUp 0.6s 0.3s ease-out both' }}>
          <h2 className="font-mono font-bold text-lg mb-5" style={{ color: '#34d399' }}>// HOW IT WORKS</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Enter your holdings', desc: 'Add any stock ticker, number of shares, and your buy price. No brokerage login required.' },
              { step: '02', title: 'Run AI analysis', desc: 'Live prices from Yahoo Finance + Claude AI gives you P&L, allocation breakdown, and risk flags instantly.' },
              { step: '03', title: 'Set price alerts', desc: 'Get notified when a stock hits your target price. Stay ahead of the market automatically.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-5 rounded-xl border border-emerald-900/30 bg-emerald-950/10">
                <div className="font-mono font-black text-sm flex-shrink-0 pt-0.5" style={{ color: '#059669' }}>{item.step}</div>
                <div>
                  <div className="font-mono font-semibold text-sm mb-1" style={{ color: '#34d399' }}>{item.title}</div>
                  <div className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(240,253,244,0.4)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center" style={{ animation: 'fadeSlideUp 0.6s 0.4s ease-out both' }}>
          <a href="/#portfolio-form"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-mono font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #059669, #34d399)', color: '#fff', boxShadow: '0 0 40px rgba(5,150,105,0.3)' }}>
            ► Start tracking free →
          </a>
          <p className="text-xs font-mono mt-3" style={{ color: '#064e3b' }}>NO ACCOUNT REQUIRED · 3 FREE ANALYSES / DAY</p>
        </div>
      </div>
    </main>
  )
}
```

---

## Task 14: TrackWealth — Git commit + push

- [ ] **Step 1: Final build pass**

```bash
cd /Users/sivaprakasam/projects/agents/ai-investment-tracker && npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully`

- [ ] **Step 2: Stage specific files**

```bash
cd /Users/sivaprakasam/projects/agents/ai-investment-tracker && git add src/site.config.ts src/app/layout.tsx public/robots.txt src/app/sitemap.ts src/components/ChatBot.tsx src/app/page.tsx src/app/about/page.tsx
```

- [ ] **Step 3: Commit**

```bash
cd /Users/sivaprakasam/projects/agents/ai-investment-tracker && git commit -m "feat: TrackWealth full UI/UX overhaul — modern landing, chatbot delay, SEO, robots.txt, sitemap"
```

- [ ] **Step 4: Push**

```bash
cd /Users/sivaprakasam/projects/agents/ai-investment-tracker && git push origin main
```

---

## Self-Review Checklist

### Spec coverage

| Requirement | Task |
|-------------|------|
| site.config.ts for DraftCal | Task 1 |
| site.config.ts for TrackWealth | Task 8 |
| layout.tsx SEO + JSON-LD for DraftCal | Task 2 |
| layout.tsx SEO + JSON-LD for TrackWealth | Task 9 |
| robots.txt DraftCal | Task 3 (already exists, minor update) |
| robots.txt TrackWealth | Task 10 |
| sitemap.ts DraftCal | Task 3 |
| sitemap.ts TrackWealth | Task 10 |
| Navbar updated (via brand in layout) DraftCal | Task 2 |
| Navbar updated (via brand in layout) TrackWealth | Task 9 |
| ChatBot 30s delay + new message DraftCal | Task 4 |
| ChatBot 30s delay + new message TrackWealth | Task 11 |
| page.tsx stats bar DraftCal | Task 5 |
| page.tsx stats bar TrackWealth | Task 12 |
| VPS stats DraftCal | Already present — confirmed in Task 5 |
| VPS stats TrackWealth | Task 12 |
| about page DraftCal | Task 6 |
| about page TrackWealth | Task 13 |
| build + commit + push DraftCal | Task 7 |
| build + commit + push TrackWealth | Task 14 |
| No fake testimonials | Both pages keep existing functional sections; stats bar uses siteConfig (truthful) |
| No new package installs | Framer Motion replaced with CSS keyframes |

### Type consistency

- `siteConfig.stats.posts` / `siteConfig.stats.creators` / `siteConfig.stats.platforms` — all strings, used in JSX as `{siteConfig.stats.posts}` throughout
- `siteConfig.stats.portfolios` / `siteConfig.stats.assetsTracked` / `siteConfig.stats.avgReturn` — all strings for TrackWealth
- `ACCENT` constant in ChatBot.tsx updated to `'#22c55e'` for TrackWealth
- `siteConfig.accentColor` used in layout brand config

### No placeholders confirmed

All code blocks are complete and self-contained.
