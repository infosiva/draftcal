"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useGate } from '@/lib/shared/useGate'
import RegisterGate from '@/lib/shared/RegisterGate'
import { siteConfig } from '@/site.config'
import type { ContentOverrides } from '@/lib/content'

// ── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS = ["Twitter/X", "LinkedIn", "Instagram", "Facebook", "TikTok"];
const TONE_DIAL = ["Professional", "Balanced", "Casual"] as const;
type ToneDial = typeof TONE_DIAL[number];

const PLATFORM_META: Record<string, { color: string; bg: string; border: string; icon: string; short: string }> = {
  "Twitter/X":  { color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.3)",  icon: "𝕏",  short: "X" },
  "LinkedIn":   { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",  icon: "in", short: "LI" },
  "Instagram":  { color: "#f472b6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.3)", icon: "◉",  short: "IG" },
  "Facebook":   { color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.3)", icon: "f",  short: "FB" },
  "TikTok":     { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)", icon: "♪",  short: "TT" },
};

const TYPE_LABELS: Record<string, string> = {
  tip: "Tip", story: "Story", question: "Question",
  promo: "Promo", bts: "Behind scenes", poll: "Poll", carousel: "Carousel",
};

const CHAR_LIMITS: Record<string, number> = {
  'Twitter/X': 280, 'LinkedIn': 3000, 'Instagram': 2200, 'Facebook': 63206, 'TikTok': 2200,
};

// ── Types ────────────────────────────────────────────────────────────────────
interface PlatformTips { best_times: string[]; max_hashtags: number; format_tip: string }
interface PostIdea {
  platform: string; date: string; time: string; content: string;
  hashtags: string[]; type: string; hook?: string;
  engagement_tip?: string; platform_tips?: PlatformTips;
}

// ── Hero calendar data ───────────────────────────────────────────────────────
const HERO_CALENDAR_POSTS: Array<{ day: number; platform: keyof typeof PLATFORM_META; snippet: string; type: string }> = [
  { day: 1,  platform: "Instagram",  snippet: "POV: Your Sunday now includes a month of content 🗓️",            type: "story" },
  { day: 2,  platform: "LinkedIn",   snippet: "3 things I stopped doing that doubled my engagement rate",         type: "tip" },
  { day: 3,  platform: "Twitter/X",  snippet: "Hot take: consistency > virality. Every. Single. Time.",           type: "tip" },
  { day: 4,  platform: "TikTok",     snippet: "The content secret nobody talks about (hint: batch everything)",   type: "bts" },
  { day: 5,  platform: "Instagram",  snippet: "Save this if you've ever stared at a blank screen for 20 mins 👆", type: "carousel" },
  { day: 8,  platform: "LinkedIn",   snippet: "I generated 30 days of content in under a minute. Here's how.",    type: "promo" },
  { day: 9,  platform: "Twitter/X",  snippet: "Creators who post daily earn 7× more than those who don't. Data.",  type: "tip" },
  { day: 10, platform: "TikTok",     snippet: "Day 10 of posting every day — what changed 🎬",                   type: "story" },
  { day: 11, platform: "Instagram",  snippet: "This is the only content calendar you'll ever need",               type: "promo" },
  { day: 12, platform: "LinkedIn",   snippet: "The best time to post on LinkedIn in 2025 (tested, not guessed)",  type: "tip" },
  { day: 15, platform: "Twitter/X",  snippet: "I asked AI to write my captions for a month. Here's the result",   type: "story" },
  { day: 16, platform: "Instagram",  snippet: "5 hooks that stopped the scroll for my last 5 posts 🪝",           type: "carousel" },
  { day: 17, platform: "TikTok",     snippet: "Why I quit manually writing captions (and what I do instead)",     type: "bts" },
  { day: 22, platform: "LinkedIn",   snippet: "The content calendar system that keeps me consistent effortlessly", type: "tip" },
  { day: 23, platform: "Twitter/X",  snippet: "Your content is good. Your consistency isn't. Fix that first.",     type: "tip" },
  { day: 28, platform: "Instagram",  snippet: "Month wrap-up: 28 posts, 0 stress, 1 AI tool. Recap 👇",           type: "story" },
];

const CAL_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HERO_POST_MAP = new Map(HERO_CALENDAR_POSTS.map(p => [p.day, p]));

// Mobile week posts (day 8-14)
const MOBILE_WEEK_POSTS = HERO_CALENDAR_POSTS.filter(p => p.day >= 8 && p.day <= 14);

// ── Sample generated posts for right-column preview ──────────────────────────
const SAMPLE_POSTS: PostIdea[] = [
  {
    platform: "Instagram", date: "May 12", time: "9:00 AM",
    hook: "POV: You just generated 30 days of content in 28 seconds 🚀",
    content: "I dropped my brand into DraftCal, picked my vibe, and watched AI write 30 posts across Instagram, TikTok, and LinkedIn. Each one had a different hook style, optimal hashtags, and engagement tips. My content strategy used to take a Sunday. Now it takes less time than brewing coffee.",
    hashtags: ["contentcreator", "AItools", "socialmedia", "creatoreconomy"],
    type: "story",
    engagement_tip: "Use carousel format — saves get 3× higher reach than static posts.",
  },
  {
    platform: "Twitter/X", date: "May 13", time: "11:00 AM",
    hook: "Hot take: consistency beats virality every time.",
    content: "90% of creators quit before they see results. The ones who win show up every single day — even when nobody's watching. Schedule your content. Build the habit. Win the long game.",
    hashtags: ["buildinpublic", "creatoreconomy", "growthhacks"],
    type: "tip",
    engagement_tip: "Reply to your first 5 comments within 1 hour for major reach boost.",
  },
  {
    platform: "LinkedIn", date: "May 14", time: "8:00 AM",
    hook: "I generated a month of LinkedIn content in under a minute. Here's what happened.",
    content: "Dropped it into DraftCal. Selected my tone, my niche, and hit generate. 30 platform-optimized posts — hooks, hashtags, engagement tips included. The future of content creation is here.",
    hashtags: ["marketing", "contentmarketing", "LinkedInTips", "productivityhacks"],
    type: "promo",
    engagement_tip: "Add a poll at the end to double your comment rate.",
  },
];

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button onClick={copy}
      className="btn-press text-xs px-2.5 py-1 rounded-lg border transition-all"
      style={{
        borderColor: copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)',
        background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
        color: copied ? '#86efac' : 'rgba(255,255,255,0.4)',
      }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

// ── Pro modal ─────────────────────────────────────────────────────────────────
function ProModal({ onClose, onCheckout, loading }: { onClose: () => void; onCheckout: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,12,4,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="rounded-2xl border p-8 max-w-sm w-full text-center"
        style={{ background: 'linear-gradient(135deg, #061409 0%, #040d06 100%)', borderColor: 'rgba(34,197,94,0.25)', boxShadow: '0 0 60px rgba(34,197,94,0.12)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', boxShadow: '0 0 30px rgba(34,197,94,0.35)' }}>
          ✦
        </div>
        <h3 className="text-xl font-black mb-2">Go Pro — $10/mo</h3>
        <p className="text-sm mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Unlimited calendars, schedule directly to all platforms, and never run out of content again.
        </p>
        <div className="space-y-2 mb-6 text-left">
          {['Unlimited content generations', 'Schedule to all 5 platforms', 'Full analytics dashboard', 'Brand voice memory', 'Team seats'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ color: '#22c55e' }}>✓</span> {f}
            </div>
          ))}
        </div>
        <button onClick={onCheckout} disabled={loading}
          className="btn-press w-full py-3 rounded-xl font-bold text-sm mb-3 transition-all flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? (
            <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Redirecting...</>
          ) : 'Upgrade to Pro — $10/mo'}
        </button>
        <button onClick={onClose} className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ── Platform toggle tabs ───────────────────────────────────────────────────────
const PREVIEW_PLATFORMS = ["LinkedIn", "X/Twitter", "Instagram"] as const;
type PreviewPlatform = typeof PREVIEW_PLATFORMS[number];

const PREVIEW_META: Record<PreviewPlatform, { key: string; charLimit: number; hashtagStyle: string; lineBreaks: boolean; tip: string }> = {
  "LinkedIn":  { key: "LinkedIn",  charLimit: 3000, hashtagStyle: "inline", lineBreaks: true,  tip: "Add 3–5 industry hashtags at the end. Double line breaks improve readability." },
  "X/Twitter": { key: "Twitter/X", charLimit: 280,  hashtagStyle: "inline", lineBreaks: false, tip: "Keep under 280 chars. 1–2 hashtags max. Short sentences win." },
  "Instagram": { key: "Instagram", charLimit: 2200, hashtagStyle: "block",  lineBreaks: true,  tip: "Put hashtags after a line break. Use 10–20 targeted tags for reach." },
};

function formatForPlatform(content: string, hashtags: string[], platform: PreviewPlatform): string {
  const meta = PREVIEW_META[platform];
  if (platform === "X/Twitter") {
    const tags = hashtags.slice(0, 2).map(h => `#${h}`).join(' ');
    const base = content.length + (tags ? tags.length + 1 : 0) <= 280
      ? `${content}${tags ? ' ' + tags : ''}`
      : content.slice(0, 277 - (tags ? tags.length + 1 : 0)) + '…' + (tags ? ' ' + tags : '');
    return base;
  }
  if (platform === "Instagram") {
    const tags = hashtags.map(h => `#${h}`).join(' ');
    return `${content}\n.\n.\n.\n${tags}`;
  }
  // LinkedIn
  const tags = hashtags.slice(0, 5).map(h => `#${h}`).join(' ');
  return `${content}\n\n${tags}`;
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, index, showAnalytics, onSchedule }: { post: PostIdea; index: number; showAnalytics: boolean; onSchedule: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState<PreviewPlatform>("LinkedIn");

  const previewMeta = PREVIEW_META[previewPlatform];
  const formattedContent = formatForPlatform(post.content, post.hashtags || [], previewPlatform);
  const charLimit = previewMeta.charLimit;
  const charCount = formattedContent.length;
  const charPct = Math.min(100, Math.round((charCount / charLimit) * 100));
  const charOver = charCount > charLimit;

  const nativeMeta = PLATFORM_META[post.platform];
  const fullText = formattedContent;

  return (
    <div className="card-hover rounded-xl border flex flex-col"
      style={{ borderColor: 'rgba(34,197,94,0.1)', background: 'rgba(255,255,255,0.025)' }}>

      {/* Platform toggle tabs */}
      <div className="px-4 pt-3 pb-0 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {PREVIEW_PLATFORMS.map(p => {
            const isActive = previewPlatform === p;
            const tabMeta = PLATFORM_META[PREVIEW_META[p].key];
            return (
              <button key={p} onClick={() => setPreviewPlatform(p)}
                className="btn-press text-[10px] px-2 py-1 rounded-lg border transition-all font-semibold"
                style={{
                  color: isActive ? (tabMeta?.color ?? '#86efac') : 'rgba(255,255,255,0.3)',
                  background: isActive ? (tabMeta?.bg ?? 'rgba(34,197,94,0.1)') : 'transparent',
                  borderColor: isActive ? (tabMeta?.border ?? 'rgba(34,197,94,0.3)') : 'rgba(255,255,255,0.06)',
                }}>
                {p}
              </button>
            );
          })}
        </div>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{post.date} · {post.time}</span>
      </div>

      {/* Native platform badge */}
      <div className="px-4 pt-2 pb-1">
        <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-semibold"
          style={{ color: nativeMeta?.color, background: nativeMeta?.bg, borderColor: nativeMeta?.border }}>
          {nativeMeta?.icon} generated for {post.platform}
        </span>
      </div>

      {post.hook && (
        <div className="px-4 pb-2">
          <p className="text-xs font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.9)' }}>&ldquo;{post.hook}&rdquo;</p>
        </div>
      )}

      <div className="px-4 pb-3 flex-1">
        <p className={`text-xs leading-relaxed whitespace-pre-line ${!expanded ? 'line-clamp-4' : ''}`}
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          {formattedContent}
        </p>
        {formattedContent.length > 200 && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-[10px] mt-1 transition-colors"
            style={{ color: 'rgba(34,197,94,0.7)' }}>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Platform tip */}
      <div className="mx-4 mb-3 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{previewPlatform}: </span>
          {previewMeta.tip}
        </p>
      </div>

      {post.engagement_tip && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <p className="text-[10px] leading-snug" style={{ color: 'rgba(134,239,172,0.8)' }}>
            <span className="font-semibold">Tip: </span>{post.engagement_tip}
          </p>
        </div>
      )}

      {/* Char count bar */}
      <div className="px-4 pb-2 flex items-center gap-2">
        <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${charPct}%`, background: charOver ? '#ef4444' : charPct > 80 ? '#fbbf24' : 'rgba(34,197,94,0.6)' }} />
        </div>
        <span className="text-[10px] font-mono" style={{ color: charOver ? '#f87171' : 'rgba(255,255,255,0.2)' }}>
          {charCount}/{charLimit}
        </span>
      </div>

      <div className="px-4 pb-4 pt-1 border-t flex items-center gap-2 flex-wrap"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{TYPE_LABELS[post.type] || post.type}</span>
        <div className="ml-auto flex gap-1.5">
          <button onClick={onSchedule}
            className="btn-press text-xs px-2.5 py-1 rounded-lg border transition-all"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}>
            Schedule (Pro)
          </button>
          <CopyButton text={fullText} />
        </div>
      </div>
    </div>
  );
}

// ── Hero calendar grid cell ───────────────────────────────────────────────────
function CalCell({ day, post }: { day: number; post?: typeof HERO_CALENDAR_POSTS[0] }) {
  const meta = post ? PLATFORM_META[post.platform] : null;
  const isToday = day === 12;

  return (
    <div className="rounded-lg p-1.5 flex flex-col gap-1 min-h-[56px] transition-all"
      style={{
        background: isToday ? 'rgba(34,197,94,0.12)' : post ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
        border: `1px solid ${isToday ? 'rgba(34,197,94,0.4)' : post ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
      }}>
      <span className="text-[10px] font-semibold leading-none"
        style={{ color: isToday ? '#86efac' : post ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>
        {day}
      </span>
      {post && meta && (
        <>
          <span className="text-[9px] leading-tight line-clamp-2"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            {post.snippet.length > 40 ? post.snippet.slice(0, 40) + '…' : post.snippet}
          </span>
          <span className="text-[8px] px-1 py-0.5 rounded-full self-start font-semibold"
            style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
            {meta.short}
          </span>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DraftCalPage({ overrides }: { overrides: ContentOverrides }) {
  const { count: gateCount, showGate, increment: gateIncrement, onRegistered, dismissGate, isRegistered } = useGate('socialscribe', 2);
  const remaining = Math.max(0, 3 - gateCount);
  const isLimited = !isRegistered && gateCount >= 3;

  const [topic, setTopic] = useState("");
  const [heroNiche, setHeroNiche] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["Twitter/X", "LinkedIn", "Instagram"]);
  const [tone, setTone] = useState<ToneDial>("Balanced");
  const [weeks, setWeeks] = useState(2);
  const [posts, setPosts] = useState<PostIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [showProModal, setShowProModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const generatorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (localStorage.getItem('draftcal-pro') === '1') setIsPro(true);
    const savedTone = localStorage.getItem('draftcal_tone') as ToneDial | null;
    if (savedTone && TONE_DIAL.includes(savedTone)) setTone(savedTone);
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === '1') {
      setIsPro(true);
      localStorage.setItem('draftcal-pro', '1');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleUpgrade = useCallback(async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { setCheckoutLoading(false); }
  }, []);

  const togglePlatform = (p: string) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleToneChange = useCallback((t: ToneDial) => {
    setTone(t);
    localStorage.setItem('draftcal_tone', t);
  }, []);

  async function generate(overrideTopic?: string) {
    const t = overrideTopic ?? topic;
    if (!t) return;
    const allowed = await gateIncrement();
    if (!allowed) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, platforms, tone, weeks }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error || 'Something went wrong. Please try again.');
      } else {
        setPosts(data.posts || []);
        setFilterPlatform("All");
        setFilterType("All");
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    } catch {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleHeroGenerate() {
    if (!heroNiche) return;
    setTopic(heroNiche);
    generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    generate(heroNiche);
  }

  function copyAll() {
    const text = posts.map(p =>
      `[${p.platform}] ${p.date} ${p.time}\n${p.content}\n${p.hashtags?.map(h => '#' + h).join(' ') || ''}`
    ).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
  }

  function downloadCSV() {
    const header = 'Platform,Date,Time,Type,Hook,Content,Hashtags\n';
    const rows = posts.map(p => [
      p.platform, p.date, p.time, p.type,
      `"${(p.hook || '').replace(/"/g, '""')}"`,
      `"${p.content.replace(/"/g, '""')}"`,
      `"${(p.hashtags || []).map(h => '#' + h).join(' ')}"`
    ].join(',')).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-calendar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredPosts = posts.filter(p => {
    if (filterPlatform !== "All" && p.platform !== filterPlatform) return false;
    if (filterType !== "All" && p.type !== filterType) return false;
    return true;
  });

  const types = posts.length > 0 ? [...new Set(posts.map(p => p.type))] : [];

  const headline = overrides.headline ?? 'Draft a week of posts in 5 minutes — scheduled, platform-ready, no $200/mo tool needed.';
  const subheadline = overrides.subheadline ?? 'AI writes platform-optimized posts for LinkedIn, X, and Instagram from a single brief.';
  const ctaLabel = overrides.cta ?? 'Generate →';

  return (
    <>
      {showGate && (
        <RegisterGate
          freeUsed={gateCount}
          freeLimit={3}
          freeFeature="calendars"
          lockedFeature="unlimited calendar generations"
          accentColor="#22c55e"
          site="socialscribe"
          onSuccess={onRegistered}
          onDismiss={dismissGate}
        />
      )}
      {showProModal && (
        <ProModal onClose={() => setShowProModal(false)} onCheckout={handleUpgrade} loading={checkoutLoading} />
      )}

      {/* Pro badge in fixed position when pro */}
      {isPro && (
        <div className="fixed top-20 right-4 z-40 text-[10px] px-3 py-1 rounded-full font-bold"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white' }}>
          PRO ✦
        </div>
      )}

      <div className="min-h-screen text-white relative overflow-x-hidden"
        style={{ background: '#040d06' }}>

        {/* Emerald glow bg blobs */}
        <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 0 }}>
          <div className="absolute rounded-full blur-3xl opacity-20"
            style={{ width: 600, height: 400, top: '-100px', left: '-100px', background: 'radial-gradient(ellipse, #16a34a 0%, transparent 70%)' }} />
          <div className="absolute rounded-full blur-3xl opacity-10"
            style={{ width: 500, height: 500, top: '40%', right: '-150px', background: 'radial-gradient(ellipse, #22c55e 0%, transparent 70%)' }} />
          <div className="absolute rounded-full blur-3xl opacity-8"
            style={{ width: 400, height: 300, bottom: '20%', left: '30%', background: 'radial-gradient(ellipse, #4ade80 0%, transparent 70%)' }} />
        </div>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">

          {/* Badge */}
          <div className="flex justify-center mb-6 fade-up">
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border"
              style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)', color: '#86efac' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              Free to generate · No account needed
            </span>
          </div>

          {/* Split layout: headline left, calendar right (desktop) */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* LEFT — headline + niche input */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="font-black leading-[1.08] tracking-tight mb-4 fade-up delay-100"
                  style={{ fontSize: 'clamp(1.2rem, 2.8vw, 2rem)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.95)' }}>Draft a week of posts </span>
                  <span style={{ background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 60%, #86efac 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    in 5 minutes
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.95)' }}> — scheduled, platform-ready, no $200/mo tool needed.</span>
                </h1>
                <p className="text-base leading-relaxed fade-up delay-200"
                  style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 460 }}>
                  {subheadline}
                </p>
              </div>

              {/* NICHE INPUT — the hero CTA */}
              <div className="fade-up delay-300">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'rgba(134,239,172,0.7)' }}>
                  What&apos;s your niche?
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={heroNiche}
                    onChange={e => setHeroNiche(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleHeroGenerate()}
                    placeholder="e.g. fitness coaching, SaaS startup, travel creator…"
                    className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      color: 'rgba(255,255,255,0.9)',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(34,197,94,0.2)')}
                  />
                  <button
                    onClick={handleHeroGenerate}
                    disabled={!heroNiche || loading}
                    className="btn-press px-5 py-3 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: heroNiche ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(34,197,94,0.2)',
                      color: heroNiche ? 'white' : 'rgba(134,239,172,0.5)',
                      cursor: heroNiche ? 'pointer' : 'not-allowed',
                      boxShadow: heroNiche ? '0 0 24px rgba(34,197,94,0.3)' : 'none',
                    }}>
                    {loading ? '…' : ctaLabel}
                  </button>
                </div>
                <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {remaining} free generations left · No credit card needed
                </p>
              </div>

              {/* Platform pills */}
              <div className="flex flex-wrap gap-2 fade-up delay-400">
                {Object.entries(PLATFORM_META).map(([label, meta]) => (
                  <span key={label}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium"
                    style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
                    <span className="font-bold text-[11px]">{meta.icon}</span> {label}
                  </span>
                ))}
              </div>

              {/* "30 days in 5 minutes" callout */}
              <div className="flex items-center gap-4 fade-up delay-500">
                {[
                  { label: '30 days', sub: 'of content' },
                  { label: '5 min', sub: 'to generate' },
                  { label: '5 platforms', sub: 'supported' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-lg font-black" style={{ color: '#22c55e' }}>{stat.label}</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Calendar grid (desktop only) */}
            <div className="hidden lg:block fade-up delay-200">
              <div className="rounded-2xl p-5 border"
                style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(34,197,94,0.15)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>May 2025</span>
                  <div className="flex items-center gap-2">
                    {Object.entries(PLATFORM_META).slice(0, 3).map(([label, meta]) => (
                      <span key={label} className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
                        {meta.icon} {meta.short}
                      </span>
                    ))}
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>+2 more</span>
                  </div>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="text-center text-[9px] font-semibold py-1"
                      style={{ color: 'rgba(255,255,255,0.25)' }}>{d}</div>
                  ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7 gap-1">
                  {CAL_DAYS.map(day => (
                    <CalCell key={day} day={day} post={HERO_POST_MAP.get(day)} />
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t flex items-center gap-1 flex-wrap"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>AI-generated:</span>
                  {Object.entries(PLATFORM_META).map(([label, meta]) => (
                    <span key={label} className="flex items-center gap-1 text-[9px]"
                      style={{ color: meta.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile week strip (lg:hidden) */}
          <div className="lg:hidden mt-8 fade-up delay-400">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'rgba(134,239,172,0.6)' }}>
              This week — AI-scheduled
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
              {MOBILE_WEEK_POSTS.map((post, i) => {
                const meta = PLATFORM_META[post.platform];
                return (
                  <div key={i} className="flex-shrink-0 rounded-xl p-3 border"
                    style={{
                      width: 200,
                      scrollSnapAlign: 'start',
                      background: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(34,197,94,0.12)',
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ color: meta?.color, background: meta?.bg, border: `1px solid ${meta?.border}` }}>
                        {meta?.icon} {post.platform}
                      </span>
                      <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Day {post.day}</span>
                    </div>
                    <p className="text-[11px] leading-snug line-clamp-3"
                      style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {post.snippet}
                    </p>
                    <div className="mt-2 text-[9px] px-1.5 py-0.5 rounded inline-block"
                      style={{ background: 'rgba(34,197,94,0.08)', color: 'rgba(134,239,172,0.6)' }}>
                      {TYPE_LABELS[post.type] || post.type}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-wrap items-center justify-center gap-0">
            {[
              { n: "1", label: "Tell us your niche", sub: "Brand, topic, or industry" },
              { n: "→", label: "", sub: "", arrow: true },
              { n: "2", label: "Pick platforms + tone", sub: "Instagram, LinkedIn, TikTok…" },
              { n: "→", label: "", sub: "", arrow: true },
              { n: "3", label: "AI generates 30 days", sub: "Hooks, hashtags, tips" },
              { n: "→", label: "", sub: "", arrow: true },
              { n: "4", label: "Copy, export, or schedule", sub: "One click to any tool" },
            ].map((step, i) => step.arrow ? (
              <span key={i} className="text-sm mx-3 hidden sm:block" style={{ color: 'rgba(34,197,94,0.4)' }}>→</span>
            ) : (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl reveal"
                style={{ minWidth: 160 }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                  {step.n}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{step.label}</div>
                  <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SAMPLE POSTS ─────────────────────────────────────────────── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="text-center mb-8 reveal">
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(134,239,172,0.6)' }}>
              Sample AI-generated posts
            </p>
            <h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>
              What your calendar looks like
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_POSTS.map((post, i) => (
              <PostCard key={i} post={post} index={i} showAnalytics={false} onSchedule={() => setShowProModal(true)} />
            ))}
          </div>
        </section>

        {/* ── AI GENERATOR ──────────────────────────────────────────────── */}
        <section id="generator" ref={generatorRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <div className="text-center mb-8 reveal">
            <h2 className="text-3xl font-black mb-2">
              <span style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Generate your calendar
              </span>
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {remaining} free generation{remaining !== 1 ? 's' : ''} left today
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Config panel */}
            <div className="space-y-5">
              <div className="rounded-2xl border p-6"
                style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(34,197,94,0.12)' }}>
                <h3 className="font-bold text-sm mb-5" style={{ color: 'rgba(255,255,255,0.85)' }}>Configure your calendar</h3>
                <div className="space-y-5">

                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>Brand / Topic</label>
                    <textarea
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. SaaS startup for freelancers, fitness coaching for busy moms…"
                      rows={3}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,0.4)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(34,197,94,0.15)')}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>Platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(p => {
                        const meta = PLATFORM_META[p];
                        const active = platforms.includes(p);
                        return (
                          <button key={p} onClick={() => togglePlatform(p)}
                            className="btn-press px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              color: active ? meta?.color : 'rgba(255,255,255,0.45)',
                              background: active ? meta?.bg : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${active ? meta?.border : 'rgba(255,255,255,0.08)'}`,
                            }}>
                            {meta?.icon} {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>Tone</label>
                    <div className="flex rounded-lg overflow-hidden border"
                      style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
                      {TONE_DIAL.map((t, i) => (
                        <button key={t} onClick={() => handleToneChange(t)}
                          className="btn-press flex-1 py-2 text-xs font-semibold transition-all"
                          style={{
                            color: tone === t ? '#fff' : 'rgba(255,255,255,0.45)',
                            background: tone === t ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.02)',
                            borderRight: i < TONE_DIAL.length - 1 ? '1px solid rgba(34,197,94,0.15)' : 'none',
                          }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Weeks — <span style={{ color: '#22c55e' }}>{weeks}w</span>
                    </label>
                    <input type="range" min={1} max={4} value={weeks}
                      onChange={e => setWeeks(Number(e.target.value))}
                      className="w-full accent-green-500" />
                    <div className="flex justify-between text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      <span>1w</span><span>2w</span><span>3w</span><span>4w</span>
                    </div>
                  </div>

                  {isLimited ? (
                    <div className="w-full py-3.5 rounded-xl border text-center"
                      style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
                      <p className="text-sm font-semibold" style={{ color: '#86efac' }}>Daily limit reached (3 free / day)</p>
                      <button onClick={() => setShowProModal(true)}
                        className="text-xs mt-0.5 transition-colors hover:opacity-80"
                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Upgrade to Pro for unlimited →
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => generate()} disabled={!topic || loading}
                      className="btn-press w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      style={{
                        background: topic ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(34,197,94,0.15)',
                        color: topic ? 'white' : 'rgba(134,239,172,0.4)',
                        cursor: (!topic || loading) ? 'not-allowed' : 'pointer',
                        boxShadow: topic ? '0 0 25px rgba(34,197,94,0.25)' : 'none',
                        opacity: loading ? 0.8 : 1,
                      }}>
                      {loading ? (
                        <><div className="w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Generating…</>
                      ) : `Generate calendar (${remaining} left)`}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick actions when posts available */}
              {posts.length > 0 && (
                <div className="rounded-xl border p-4 flex gap-2"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(34,197,94,0.1)' }}>
                  <button onClick={copyAll}
                    className="btn-press flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                    style={{ borderColor: 'rgba(34,197,94,0.2)', color: 'rgba(134,239,172,0.7)', background: 'rgba(34,197,94,0.06)' }}>
                    Copy all
                  </button>
                  <button onClick={downloadCSV}
                    className="btn-press flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.03)' }}>
                    Export CSV
                  </button>
                </div>
              )}
            </div>

            {/* Results grid */}
            <div className="lg:col-span-2">
              {posts.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <div className="flex gap-1.5 flex-wrap">
                    {["All", ...platforms].map(p => (
                      <button key={p} onClick={() => setFilterPlatform(p)}
                        className="btn-press text-xs px-3 py-1 rounded-full border transition-all"
                        style={{
                          color: filterPlatform === p ? '#86efac' : 'rgba(255,255,255,0.4)',
                          background: filterPlatform === p ? 'rgba(34,197,94,0.1)' : 'transparent',
                          borderColor: filterPlatform === p ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.1)',
                        }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  {types.length > 0 && (
                    <>
                      <div className="h-4 w-px mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                      <div className="flex gap-1.5 flex-wrap">
                        {["All", ...types].map(t => (
                          <button key={t} onClick={() => setFilterType(t)}
                            className="btn-press text-xs px-3 py-1 rounded-full border transition-all"
                            style={{
                              color: filterType === t ? '#86efac' : 'rgba(255,255,255,0.4)',
                              background: filterType === t ? 'rgba(34,197,94,0.08)' : 'transparent',
                              borderColor: filterType === t ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)',
                            }}>
                            {TYPE_LABELS[t] || t}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {filteredPosts.length} posts
                  </span>
                </div>
              )}

              {apiError && (
                <div className="rounded-2xl border p-6 text-center mb-4"
                  style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
                  <p className="font-semibold mb-1" style={{ color: '#fca5a5' }}>Could not generate calendar</p>
                  <p className="text-sm" style={{ color: 'rgba(252,165,165,0.7)' }}>{apiError}</p>
                </div>
              )}

              {filteredPosts.length > 0 ? (
                <div ref={resultsRef} className="grid sm:grid-cols-2 gap-4">
                  {filteredPosts.map((post, i) => (
                    <PostCard key={i} post={post} index={i} showAnalytics={false} onSchedule={() => setShowProModal(true)} />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="h-48 rounded-2xl border flex items-center justify-center"
                  style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No posts match the current filter</p>
                </div>
              ) : (
                <div className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-4"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(34,197,94,0.08)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    📅
                  </div>
                  <p className="text-sm max-w-xs text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Describe your brand above and click generate to fill your content calendar
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {["Copy each post with 1 click", "Platform-specific hashtags", "Engagement tips included", "Export to CSV"].map(f => (
                      <span key={f} className="text-[10px] px-2.5 py-1 rounded-full border"
                        style={{ borderColor: 'rgba(34,197,94,0.15)', color: 'rgba(134,239,172,0.5)', background: 'rgba(34,197,94,0.05)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────── */}
        <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="text-center mb-10 reveal">
            <h2 className="text-3xl font-black mb-2">
              <span style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Simple pricing
              </span>
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>3 free calendars per day · No card required</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="rounded-2xl border p-8"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: 'rgba(255,255,255,0.25)' }}>Free</div>
              <div className="text-4xl font-black mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>$0</div>
              <div className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.2)' }}>forever</div>
              <ul className="space-y-2.5 mb-7">
                {['3 calendars / day', '5 platforms', 'Up to 4 weeks', 'Engagement tips', 'Copy & export'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="w-full py-3 rounded-xl border text-center text-sm font-bold"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.25)' }}>
                Current plan
              </div>
            </div>
            {/* Pro */}
            <div className="rounded-2xl border p-8 relative overflow-hidden"
              style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.25)', boxShadow: '0 0 40px rgba(34,197,94,0.08)' }}>
              <div className="absolute top-4 right-4 text-[10px] px-2.5 py-1 rounded-full font-bold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>
                Most popular
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: '#86efac' }}>Pro</div>
              <div className="text-4xl font-black mb-0" style={{ color: 'white' }}>$10</div>
              <div className="text-sm mb-6" style={{ color: '#22c55e' }}>/month</div>
              <ul className="space-y-2.5 mb-7">
                {['Unlimited calendars', 'All 5 platforms', 'Scheduling links', 'Full analytics dashboard', 'Brand voice memory', 'Team seats'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <span style={{ color: '#22c55e' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowProModal(true)}
                className="btn-press w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', boxShadow: '0 0 25px rgba(34,197,94,0.3)' }}>
                Go Pro ✦
              </button>
            </div>
          </div>
        </section>

        {/* ── VS COMPARISON ────────────────────────────────────────────── */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="text-center mb-8 reveal">
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(134,239,172,0.6)' }}>How we compare</p>
            <h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>
              AI generation vs. manual scheduling
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border"
            style={{ borderColor: 'rgba(34,197,94,0.12)', background: 'rgba(255,255,255,0.02)' }}>
            <table className="w-full" style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Feature', 'DraftCal', 'Buffer', 'Later', 'Hootsuite'].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: i === 1 ? '#86efac' : 'rgba(255,255,255,0.3)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI content generation', '✓ Full month', '✗', '✗', 'Partial'],
                  ['Platform hooks & hashtags', '✓ Auto', 'Manual', 'Manual', 'Manual'],
                  ['Engagement tips per post', '✓ Built-in', '✗', '✗', '✗'],
                  ['30-day calendar in seconds', '✓', 'Manual', 'Manual', 'Manual'],
                  ['Free tier', '3/day', '3 channels', '1 profile', '30 days'],
                  ['Price (pro)', '$10/mo', '$18/mo', '$18/mo', '$99/mo'],
                ].map(row => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {row.map((cell, i) => (
                      <td key={i} style={{
                        padding: '11px 16px',
                        fontWeight: i === 0 ? 600 : 400,
                        color: i === 1
                          ? (['✓ Full month', '✓ Auto', '✓ Built-in', '✓', '3/day', '$10/mo'].includes(cell) ? '#86efac' : 'rgba(255,255,255,0.6)')
                          : cell === '✗' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </>
  );
}
