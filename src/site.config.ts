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
  stats: { posts: "AI-powered", creators: "Free to start", platforms: "5 Platforms" },
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
