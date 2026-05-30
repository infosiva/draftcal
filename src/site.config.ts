// site.config.ts — Single source of truth for DraftCal brand content
export const siteConfig = {
  name: "DraftCal",
  tagline: "Draft a week of posts in 5 minutes — scheduled, platform-ready, no $200/mo tool needed.",
  description: "AI writes platform-optimized posts for LinkedIn, X, and Instagram from a single brief. No Buffer, no Hootsuite, no $200/mo.",
  url: "https://draftcal.app",
  primaryColor: "#7c3aed",
  accentColor: "#ec4899",
  secondaryColor: "#8b5cf6",
  icon: "📅",
  stats: { posts: "AI-powered", creators: "Free to start", platforms: "5 Platforms" },
  chatbot: {
    openingMessage: "Give me your brand or topic and I'll generate 30 days of platform-optimised posts right now.",
    apiEndpoint: "/api/chat",
  },
  seo: {
    title: "DraftCal — AI Social Media Calendar | Schedule a Week in 5 Minutes",
    description: "AI social media calendar that drafts a week of posts for LinkedIn, X, and Instagram in minutes. Free alternative to Buffer and Hootsuite.",
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
