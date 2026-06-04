'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface NavLink { label: string; href: string; external?: boolean }
export interface BrandConfig {
  name: string; tagline: string; icon: string; color: string; url: string
  navLinks?: NavLink[]; cta?: { label: string; href: string }
}

export default function SharedNavbar({ brand }: { brand: BrandConfig }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const links = brand.navLinks ?? []
  const cta = brand.cta ?? { label: 'Try free', href: '/' }

  return (
    <>
      <nav
        style={{ '--accent': brand.color } as React.CSSProperties}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
          ${scrolled
            ? 'bg-white/90 backdrop-blur-2xl border-b border-black/[0.06]'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group select-none">
            <span
              className="text-lg leading-none transition-transform duration-200 group-hover:scale-110"
              aria-hidden
            >
              {brand.icon}
            </span>
            <span className="font-semibold text-sm tracking-tight" style={{ color: '#111111' }}>
              {brand.name}
            </span>
          </Link>

          {/* Desktop links */}
          {links.length > 0 && (
            <div className="hidden md:flex items-center gap-0.5">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  target={l.external ? '_blank' : undefined}
                  rel={l.external ? 'noopener noreferrer' : undefined}
                  className="px-3 py-1.5 text-[13px] rounded-md transition-all duration-150"
                  style={{ color: '#64748b' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link
              href={cta.href}
              className="px-3.5 py-1.5 text-[13px] font-bold rounded-lg transition-all duration-150 hover:-translate-y-px active:scale-[0.97]"
              style={{
                color: '#ffffff',
                background: '#f97316',
              }}
            >
              {cta.label}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-md transition-colors"
            style={{ color: '#64748b' }}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className={`block w-5 h-px bg-current transition-all duration-200 origin-center ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-all duration-200 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-all duration-200 origin-center ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${open ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 right-0 backdrop-blur-2xl border-b transition-all duration-300 ease-out ${open ? 'translate-y-0' : '-translate-y-full'}`}
          style={{ background: 'rgba(255,255,255,0.98)', borderColor: '#e2e8f0' }}
        >
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b" style={{ borderColor: '#f1f5f9' }}>
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <span className="text-lg">{brand.icon}</span>
              <span className="font-semibold text-sm" style={{ color: '#111111' }}>{brand.name}</span>
            </Link>
            <button onClick={() => setOpen(false)} className="p-1.5 transition-colors" style={{ color: '#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="px-5 py-4 flex flex-col gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-2 py-2.5 text-sm rounded-lg transition-all"
                style={{ color: '#64748b' }}
              >
                {l.label}
              </Link>
            ))}
            <div className="h-px my-2" style={{ background: '#f1f5f9' }} />
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-bold rounded-lg text-center transition-all"
              style={{ color: '#ffffff', background: '#f97316' }}
            >
              {cta.label}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
