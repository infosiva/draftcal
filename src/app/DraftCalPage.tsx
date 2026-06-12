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
        borderColor: copied ? '#fed7aa' : '#e2e8f0',
        background: copied ? '#fff7ed' : '#f8fafc',
        color: copied ? '#c2410c' : '#64748b',
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
      style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>

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
        <span className="text-[10px]" style={{ color: '#94a3b8' }}>{post.date} · {post.time}</span>
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
          <p className="text-xs font-semibold leading-snug" style={{ color: '#111111' }}>&ldquo;{post.hook}&rdquo;</p>
        </div>
      )}

      <div className="px-4 pb-3 flex-1">
        <p className={`text-xs leading-relaxed whitespace-pre-line ${!expanded ? 'line-clamp-4' : ''}`}
          style={{ color: '#374151' }}>
          {formattedContent}
        </p>
        {formattedContent.length > 200 && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-[10px] mt-1 transition-colors"
            style={{ color: '#f97316' }}>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Platform tip */}
      <div className="mx-4 mb-3 px-3 py-2 rounded-lg"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <p className="text-[10px] leading-snug" style={{ color: '#64748b' }}>
          <span className="font-semibold" style={{ color: '#374151' }}>{previewPlatform}: </span>
          {previewMeta.tip}
        </p>
      </div>

      {post.engagement_tip && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg"
          style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <p className="text-[10px] leading-snug" style={{ color: '#c2410c' }}>
            <span className="font-semibold">Tip: </span>{post.engagement_tip}
          </p>
        </div>
      )}

      {/* Char count bar */}
      <div className="px-4 pb-2 flex items-center gap-2">
        <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${charPct}%`, background: charOver ? '#ef4444' : charPct > 80 ? '#f59e0b' : '#f97316' }} />
        </div>
        <span className="text-[10px] font-mono" style={{ color: charOver ? '#dc2626' : '#94a3b8' }}>
          {charCount}/{charLimit}
        </span>
      </div>

      <div className="px-4 pb-4 pt-1 border-t flex items-center gap-2 flex-wrap"
        style={{ borderColor: '#f1f5f9' }}>
        <span className="text-[10px]" style={{ color: '#94a3b8' }}>{TYPE_LABELS[post.type] || post.type}</span>
        <div className="ml-auto flex gap-1.5">
          <button onClick={onSchedule}
            className="btn-press text-xs px-2.5 py-1 rounded-lg border transition-all"
            style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#64748b' }}>
            Schedule (Pro)
          </button>
          <CopyButton text={fullText} />
        </div>
      </div>
    </div>
  );
}

// ── June 2026 calendar data (editorial hero) ──────────────────────────────────
const JUNE_PILLS: Record<number, { label: string; bg: string; color: string }> = {
  9:  { label: 'Instagram Reel', bg: '#fce7f3', color: '#be185d' },
  11: { label: 'Twitter Thread', bg: '#dbeafe', color: '#1d4ed8' },
  13: { label: 'LinkedIn Post',  bg: '#e0e7ff', color: '#3730a3' },
  16: { label: 'TikTok',         bg: '#111111', color: '#ffffff' },
  23: { label: 'Facebook Post',  bg: '#dcfce7', color: '#15803d' },
};
const JUNE_AI_CELL = 20; // cell that shows "AI generating..."
// June 2026 starts on Monday (weekday index 0 = Mon)
const JUNE_START_DOW = 0; // Monday
const JUNE_DAYS = 30;

// ── Editorial calendar cell ───────────────────────────────────────────────────
function EditorialCalCell({ day, animIdx }: { day: number | null; animIdx: number }) {
  const pill = day ? JUNE_PILLS[day] : null;
  const isAI = day === JUNE_AI_CELL;
  const isToday = day === 4; // June 4 = "today"

  if (!day) {
    return <div className="rounded-lg min-h-[52px]" style={{ background: '#f1f5f9' }} />;
  }

  return (
    <div
      className="rounded-lg p-1.5 flex flex-col gap-1 min-h-[52px] transition-all"
      style={{
        background: isToday ? '#fff7ed' : '#ffffff',
        border: `1px solid ${isToday ? '#f97316' : '#e2e8f0'}`,
        animationDelay: `${animIdx * 30}ms`,
        animation: 'calCellIn 0.35s cubic-bezier(0.23,1,0.32,1) both',
      }}
    >
      <span
        className="text-[10px] font-bold leading-none"
        style={{ color: isToday ? '#f97316' : '#64748b' }}
      >
        {day}
      </span>
      {isAI && (
        <span
          className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold self-start"
          style={{ background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa', animation: 'pulse 1.5s ease-in-out infinite' }}
        >
          ✨ AI…
        </span>
      )}
      {pill && !isAI && (
        <span
          className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold self-start leading-tight"
          style={{
            background: pill.bg,
            color: pill.color,
            animation: `pillPop 0.4s cubic-bezier(0.23,1,0.32,1) ${animIdx * 30 + 80}ms both`,
          }}
        >
          {pill.label}
        </span>
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

      <style>{`
        @keyframes calCellIn {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pillPop {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        .hero-editorial {
          background: #fafafa;
          background-image: radial-gradient(ellipse 60% 50% at 100% 0%, rgba(249,115,22,0.07) 0%, transparent 70%);
        }
        .hero-btn-orange {
          background: #f97316;
          color: #fff;
          transition: background 150ms, transform 150ms;
        }
        .hero-btn-orange:hover { background: #ea6c0a; }
        .hero-btn-orange:active { transform: scale(0.97); }
        .hero-btn-ghost {
          background: transparent;
          border: 1.5px solid #e2e8f0;
          color: #374151;
          transition: border-color 150ms, background 150ms, transform 150ms;
        }
        .hero-btn-ghost:hover { border-color: #f97316; background: #fff7ed; color: #f97316; }
        .hero-btn-ghost:active { transform: scale(0.97); }
        .hero-input:focus {
          outline: none;
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
        }
        .platform-icon {
          width: 28px; height: 28px;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800;
        }
      `}</style>

      <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#fafafa' }}>

        {/* Subtle orange radial in top-right corner only */}
        <div
          className="fixed pointer-events-none"
          aria-hidden="true"
          style={{
            zIndex: 0,
            top: 0, right: 0,
            width: 700, height: 500,
            background: 'radial-gradient(ellipse 60% 55% at 100% 0%, rgba(249,115,22,0.09) 0%, transparent 70%)',
          }}
        />

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="hero-editorial relative z-10 pt-20 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">

            {/* Badge */}
            <div className="flex justify-start mb-6">
              <div className="flex flex-wrap gap-2">
                {['AI-powered scheduling', 'Free to start', 'No credit card'].map(pill => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-2 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest"
                    style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#c2410c' }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Split layout */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">

              {/* LEFT panel */}
              <div className="flex flex-col gap-7">

                {/* Headline */}
                <div>
                  <h1
                    className="font-black tracking-tight leading-none mb-4"
                    style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.0, color: '#111111' }}
                  >
                    Generate{' '}
                    <span style={{ color: '#f97316' }}>30 days</span>
                    {' '}of social content in{' '}
                    <span style={{ color: '#f97316' }}>30 seconds</span>
                    {' '}with AI
                  </h1>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: '#64748b', maxWidth: 480, fontSize: '1.0625rem' }}
                  >
                    Drop your brand. Pick your platforms. Watch AI fill your entire content calendar
                    with scroll-stopping posts — hooks, hashtags, engagement tips included.
                  </p>
                </div>

                {/* Platform checkboxes */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                    Pick your platforms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Instagram', checked: true,  bg: '#fce7f3', color: '#be185d', icon: '◉' },
                      { label: 'TikTok',    checked: true,  bg: '#f0fdf4', color: '#15803d', icon: '♪' },
                      { label: 'Twitter/X', checked: true,  bg: '#eff6ff', color: '#1d4ed8', icon: '𝕏' },
                      { label: 'LinkedIn',  checked: false, bg: '#eef2ff', color: '#3730a3', icon: 'in' },
                      { label: 'Facebook',  checked: false, bg: '#f5f3ff', color: '#5b21b6', icon: 'f'  },
                    ].map(p => (
                      <span
                        key={p.label}
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-full"
                        style={{
                          background: p.checked ? p.bg : '#f1f5f9',
                          color: p.checked ? p.color : '#94a3b8',
                          border: `1.5px solid ${p.checked ? p.color + '40' : '#e2e8f0'}`,
                        }}
                      >
                        {p.checked && <span style={{ color: p.color }}>✓</span>}
                        <span className="text-[11px]">{p.icon}</span>
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Brand input + CTA */}
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={heroNiche}
                    onChange={e => setHeroNiche(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleHeroGenerate()}
                    placeholder="Your brand or niche — e.g. fitness coaching, travel creator…"
                    className="hero-input w-full rounded-xl px-4 py-3.5 text-sm"
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      color: '#111111',
                      fontSize: '0.9375rem',
                    }}
                  />
                  <button
                    onClick={handleHeroGenerate}
                    disabled={!heroNiche || loading}
                    className="hero-btn-orange w-full py-4 rounded-xl font-black text-base"
                    style={{
                      opacity: (!heroNiche || loading) ? 0.5 : 1,
                      cursor: (!heroNiche || loading) ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {loading ? 'Generating…' : 'Generate my calendar free →'}
                  </button>
                  <button
                    onClick={() => setShowProModal(true)}
                    className="hero-btn-ghost w-full py-3 rounded-xl font-semibold text-sm"
                  >
                    See Pro Plan — $10/mo →
                  </button>
                  <p className="text-[11px] text-center" style={{ color: '#94a3b8' }}>
                    {remaining} free generation{remaining !== 1 ? 's' : ''} left · No credit card needed
                  </p>
                </div>

                {/* Platform icons row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { icon: '◉',  bg: '#fce7f3', color: '#be185d', label: 'Instagram' },
                    { icon: '♪',  bg: '#f0fdf4', color: '#15803d', label: 'TikTok'    },
                    { icon: '𝕏',  bg: '#eff6ff', color: '#1d4ed8', label: 'Twitter/X' },
                    { icon: 'in', bg: '#eef2ff', color: '#3730a3', label: 'LinkedIn'  },
                    { icon: 'f',  bg: '#f5f3ff', color: '#5b21b6', label: 'Facebook'  },
                  ].map(p => (
                    <div
                      key={p.label}
                      className="platform-icon"
                      style={{ background: p.bg, color: p.color }}
                      title={p.label}
                    >
                      {p.icon}
                    </div>
                  ))}
                  <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>5 platforms supported</span>
                </div>
              </div>

              {/* RIGHT panel — June 2026 calendar preview */}
              <div className="hidden lg:block">
                <div
                  className="rounded-2xl p-5 border"
                  style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                >
                  {/* Calendar header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm font-black" style={{ color: '#111111' }}>June 2026</span>
                      <span
                        className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa' }}
                      >
                        AI-filled
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: 'IG',  bg: '#fce7f3', color: '#be185d' },
                        { label: 'TT',  bg: '#f0fdf4', color: '#15803d' },
                        { label: 'X',   bg: '#eff6ff', color: '#1d4ed8' },
                        { label: 'LI',  bg: '#eef2ff', color: '#3730a3' },
                      ].map(p => (
                        <span
                          key={p.label}
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: p.bg, color: p.color }}
                        >
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div
                        key={d}
                        className="text-center text-[9px] font-bold py-1 uppercase tracking-wider"
                        style={{ color: '#94a3b8' }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid — June 2026 starts Monday */}
                  {(() => {
                    const cells: (number | null)[] = [
                      ...Array(JUNE_START_DOW).fill(null),
                      ...Array.from({ length: JUNE_DAYS }, (_, i) => i + 1),
                    ];
                    // pad to full weeks
                    while (cells.length % 7 !== 0) cells.push(null);
                    return (
                      <div className="grid grid-cols-7 gap-1">
                        {cells.map((day, idx) => (
                          <EditorialCalCell key={idx} day={day} animIdx={day ?? 0} />
                        ))}
                      </div>
                    );
                  })()}

                  {/* Legend */}
                  <div
                    className="mt-3 pt-3 border-t flex items-center gap-3 flex-wrap"
                    style={{ borderColor: '#f1f5f9' }}
                  >
                    {Object.entries(JUNE_PILLS).map(([, pill]) => (
                      <span
                        key={pill.label}
                        className="flex items-center gap-1 text-[9px] font-semibold"
                        style={{ color: pill.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pill.color }} />
                        {pill.label}
                      </span>
                    ))}
                    <span className="text-[9px]" style={{ color: '#f97316' }}>✨ AI generating…</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile — 4-card snap scroll strip */}
            <div className="lg:hidden mt-8">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#f97316' }}>
                Your June — AI-scheduled
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
                {Object.entries(JUNE_PILLS).map(([day, pill], i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 rounded-xl p-3 border"
                    style={{
                      width: 180,
                      scrollSnapAlign: 'start',
                      background: '#ffffff',
                      borderColor: '#e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: pill.bg, color: pill.color }}
                      >
                        {pill.label}
                      </span>
                      <span className="text-[9px]" style={{ color: '#94a3b8' }}>Jun {day}</span>
                    </div>
                    <p className="text-[11px] leading-snug" style={{ color: '#374151' }}>
                      AI-generated post ready to publish
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12" style={{ borderTop: '1px solid #f1f5f9' }}>
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
              <span key={i} className="text-sm mx-3 hidden sm:block" style={{ color: '#f97316' }}>→</span>
            ) : (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl reveal"
                style={{ minWidth: 160 }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#f97316' }}>
                  {step.n}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#111111' }}>{step.label}</div>
                  <div className="text-[11px]" style={{ color: '#94a3b8' }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SAMPLE POSTS ─────────────────────────────────────────────── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16" style={{ background: '#f8fafc' }}>
          <div className="text-center mb-8 reveal pt-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: '#f97316' }}>
              Sample AI-generated posts
            </p>
            <h2 className="text-2xl font-black" style={{ color: '#111111' }}>
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
          <div className="text-center mb-8 reveal pt-8">
            <h2 className="text-3xl font-black mb-2" style={{ color: '#111111' }}>
              Generate your calendar
            </h2>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              {remaining} free generation{remaining !== 1 ? 's' : ''} left today
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Config panel */}
            <div className="space-y-5">
              <div className="rounded-2xl border p-6"
                style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h3 className="font-bold text-sm mb-5" style={{ color: '#111111' }}>Configure your calendar</h3>
                <div className="space-y-5">

                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: '#94a3b8' }}>Brand / Topic</label>
                    <textarea
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. SaaS startup for freelancers, fitness coaching for busy moms…"
                      rows={3}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        color: '#111111',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: '#94a3b8' }}>Platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(p => {
                        const meta = PLATFORM_META[p];
                        const active = platforms.includes(p);
                        return (
                          <button key={p} onClick={() => togglePlatform(p)}
                            className="btn-press px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              color: active ? meta?.color : '#94a3b8',
                              background: active ? meta?.bg : '#f1f5f9',
                              border: `1px solid ${active ? meta?.border : '#e2e8f0'}`,
                            }}>
                            {meta?.icon} {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: '#94a3b8' }}>Tone</label>
                    <div className="flex rounded-lg overflow-hidden border"
                      style={{ borderColor: '#e2e8f0' }}>
                      {TONE_DIAL.map((t, i) => (
                        <button key={t} onClick={() => handleToneChange(t)}
                          className="btn-press flex-1 py-2 text-xs font-semibold transition-all"
                          style={{
                            color: tone === t ? '#ffffff' : '#64748b',
                            background: tone === t ? '#f97316' : '#f8fafc',
                            borderRight: i < TONE_DIAL.length - 1 ? '1px solid #e2e8f0' : 'none',
                          }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: '#94a3b8' }}>
                      Weeks — <span style={{ color: '#f97316' }}>{weeks}w</span>
                    </label>
                    <input type="range" min={1} max={4} value={weeks}
                      onChange={e => setWeeks(Number(e.target.value))}
                      className="w-full accent-orange-500" />
                    <div className="flex justify-between text-[10px] mt-1" style={{ color: '#cbd5e1' }}>
                      <span>1w</span><span>2w</span><span>3w</span><span>4w</span>
                    </div>
                  </div>

                  {isLimited ? (
                    <div className="w-full py-3.5 rounded-xl border text-center"
                      style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                      <p className="text-sm font-semibold" style={{ color: '#c2410c' }}>Daily limit reached (3 free / day)</p>
                      <button onClick={() => setShowProModal(true)}
                        className="text-xs mt-0.5 transition-colors hover:opacity-80"
                        style={{ color: '#94a3b8' }}>
                        Upgrade to Pro for unlimited →
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => generate()} disabled={!topic || loading}
                      className="btn-press w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      style={{
                        background: topic ? '#f97316' : '#f1f5f9',
                        color: topic ? 'white' : '#94a3b8',
                        cursor: (!topic || loading) ? 'not-allowed' : 'pointer',
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
                  style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                  <button onClick={copyAll}
                    className="btn-press flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                    style={{ borderColor: '#fed7aa', color: '#c2410c', background: '#fff7ed' }}>
                    Copy all
                  </button>
                  <button onClick={downloadCSV}
                    className="btn-press flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                    style={{ borderColor: '#e2e8f0', color: '#64748b', background: '#f8fafc' }}>
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
                          color: filterPlatform === p ? '#f97316' : '#64748b',
                          background: filterPlatform === p ? '#fff7ed' : '#f8fafc',
                          borderColor: filterPlatform === p ? '#fed7aa' : '#e2e8f0',
                        }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  {types.length > 0 && (
                    <>
                      <div className="h-4 w-px mx-1" style={{ background: '#e2e8f0' }} />
                      <div className="flex gap-1.5 flex-wrap">
                        {["All", ...types].map(t => (
                          <button key={t} onClick={() => setFilterType(t)}
                            className="btn-press text-xs px-3 py-1 rounded-full border transition-all"
                            style={{
                              color: filterType === t ? '#f97316' : '#64748b',
                              background: filterType === t ? '#fff7ed' : '#f8fafc',
                              borderColor: filterType === t ? '#fed7aa' : '#e2e8f0',
                            }}>
                            {TYPE_LABELS[t] || t}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <span className="ml-auto text-xs" style={{ color: '#94a3b8' }}>
                    {filteredPosts.length} posts
                  </span>
                </div>
              )}

              {apiError && (
                <div className="rounded-2xl border p-6 text-center mb-4"
                  style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                  <p className="font-semibold mb-1" style={{ color: '#b91c1c' }}>Could not generate calendar</p>
                  <p className="text-sm" style={{ color: '#dc2626' }}>{apiError}</p>
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
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>No posts match the current filter</p>
                </div>
              ) : (
                <div className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-4"
                  style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                    📅
                  </div>
                  <p className="text-sm max-w-xs text-center" style={{ color: '#64748b' }}>
                    Describe your brand above and click generate to fill your content calendar
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {["Copy each post with 1 click", "Platform-specific hashtags", "Engagement tips included", "Export to CSV"].map(f => (
                      <span key={f} className="text-[10px] px-2.5 py-1 rounded-full border"
                        style={{ borderColor: '#fed7aa', color: '#c2410c', background: '#fff7ed' }}>
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
        <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20" style={{ background: '#f8fafc', paddingTop: '3rem' }}>
          <div className="text-center mb-10 reveal">
            <h2 className="text-3xl font-black mb-2" style={{ color: '#111111' }}>
              Simple pricing
            </h2>
            <p className="text-sm" style={{ color: '#94a3b8' }}>3 free calendars per day · No card required</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="rounded-2xl border p-8"
              style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: '#94a3b8' }}>Free</div>
              <div className="text-4xl font-black mb-1" style={{ color: '#111111' }}>$0</div>
              <div className="text-sm mb-6" style={{ color: '#94a3b8' }}>forever</div>
              <ul className="space-y-2.5 mb-7">
                {['3 calendars / day', '5 platforms', 'Up to 4 weeks', 'Engagement tips', 'Copy & export'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
                    <span style={{ color: '#94a3b8' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="w-full py-3 rounded-xl border text-center text-sm font-bold"
                style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
                Current plan
              </div>
            </div>
            {/* Pro */}
            <div className="rounded-2xl border p-8 relative overflow-hidden"
              style={{ background: '#111111', borderColor: '#111111', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
              <div className="absolute top-4 right-4 text-[10px] px-2.5 py-1 rounded-full font-bold"
                style={{ background: '#f97316', color: '#ffffff' }}>
                Most popular
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: '#f97316' }}>Pro</div>
              <div className="text-4xl font-black mb-0" style={{ color: 'white' }}>$10</div>
              <div className="text-sm mb-6" style={{ color: '#f97316' }}>/month</div>
              <ul className="space-y-2.5 mb-7">
                {['Unlimited calendars', 'All 5 platforms', 'Scheduling links', 'Full analytics dashboard', 'Brand voice memory', 'Team seats'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <span style={{ color: '#f97316' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowProModal(true)}
                className="hero-btn-orange btn-press w-full py-3 rounded-xl font-bold text-sm">
                Go Pro ✦
              </button>
            </div>
          </div>
        </section>

        {/* ── VS COMPARISON ────────────────────────────────────────────── */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="text-center mb-8 reveal">
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: '#f97316' }}>How we compare</p>
            <h2 className="text-2xl font-black" style={{ color: '#111111' }}>
              AI generation vs. manual scheduling
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border"
            style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
            <table className="w-full" style={{ fontSize: 13, color: '#374151', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Feature', 'DraftCal', 'Buffer', 'Later', 'Hootsuite'].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: i === 1 ? '#f97316' : '#94a3b8',
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
                  <tr key={row[0]} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {row.map((cell, i) => (
                      <td key={i} style={{
                        padding: '11px 16px',
                        fontWeight: i === 0 ? 600 : 400,
                        color: i === 1
                          ? (['✓ Full month', '✓ Auto', '✓ Built-in', '✓', '3/day', '$10/mo'].includes(cell) ? '#f97316' : '#374151')
                          : cell === '✗' ? '#cbd5e1' : '#64748b',
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
