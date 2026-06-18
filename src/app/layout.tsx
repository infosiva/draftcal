import Script from 'next/script'
import type { Metadata } from 'next'
import './globals.css'
import SharedNavbar from '@/components/SharedNavbar'
import Footer from '../../components/Footer'
import DesignEffects from '@/components/DesignEffects'
import AnimatedBackground from '@/components/AnimatedBackground'
import ChatBot from '@/components/ChatBot'
import FeedbackWidget from '@/components/FeedbackWidget'
import { getSiteFlags } from '@/lib/flags'
import BackToTop from '@/components/BackToTop'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import type { BrandConfig } from '@/components/SharedNavbar'
import CookieConsent from "../../components/CookieConsent"
import StickyFooterCTA from "../../components/StickyFooterCTA"
import { siteConfig } from '@/site.config'
import { loadSiteTheme, buildThemeStyleTag, isWidgetHidden } from '@/lib/theme-loader'

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
  metadataBase: new URL(siteConfig.url),
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [flags, theme] = await Promise.all([
    getSiteFlags('draftcal'),
    loadSiteTheme('draftcal'),
  ])

  const themeCSS = buildThemeStyleTag(theme, {
    background: '#fffbf5',
    primary: '#d97706',
    secondary: '#b45309',
  })

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Calistoga&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --theme-primary: #d97706;
            --theme-secondary: #b45309;
            --theme-base: #fffbf5;
            --background: #fffbf5;
            --surface-1: #ffffff;
            --surface-2: #fffbf5;
            --foreground: #0f172a;
            --text-2: #78350f;
            --border-default: rgba(217,119,6,0.14);
            --border-strong: rgba(217,119,6,0.28);
            --border: #fde68a;
            --accent: #d97706;
            --accent-2: #b45309;
            --radius: 0.75rem;
            --radius-lg: 1.25rem;
            --radius-xl: 2rem;
          }
          body { background: var(--background, #fffbf5) !important; color: var(--foreground, #0f172a); font-family: 'Inter', system-ui, sans-serif !important; }
          h1, h2, h3, .display { font-family: 'Calistoga', serif !important; letter-spacing: -0.02em; }
          .glass {
            background: rgba(255,251,245,0.85) !important;
            border-color: rgba(217,119,6,0.10) !important;
            backdrop-filter: blur(20px) saturate(140%);
          }
          .platform-twitter  { color: #38bdf8; background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); }
          .platform-linkedin { color: #818cf8; background: rgba(129,140,248,0.08); border-color: rgba(129,140,248,0.2); }
          .platform-instagram{ color: #f472b6; background: rgba(244,114,182,0.08); border-color: rgba(244,114,182,0.2); }
          @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          ${themeCSS}
        `}} />
      </head>
      <body className="flex flex-col min-h-screen">
        <DesignEffects />
        <SharedNavbar brand={brand} />
        <main className="flex-1 pt-16">{children}</main>
        <Footer siteName={siteConfig.name} />
        {flags.chatbot && !isWidgetHidden(theme, 'chatbot') && <ChatBot />}
        {!isWidgetHidden(theme, 'backToTop') && <BackToTop accentColor="#d97706" />}
        {!isWidgetHidden(theme, 'cookieConsent') && <CookieConsent />}
        {!isWidgetHidden(theme, 'stickyFooterCTA') && <StickyFooterCTA />}
        <FloatingChatWrapper />
        <Script defer data-domain="draftcal.app" src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        <Script defer data-site="draftcal.app" src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" />
        <FeedbackWidget siteName="DraftCal" accentColor="#d97706" position="left" />
      </body>
    </html>
  )
}
