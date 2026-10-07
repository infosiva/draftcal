# HANDOFF — draftcal
**Date:** 2026-10-07  **Status:** prod-ready gate file checks

## ai-core status (2026-10-07)
- Not on ai-core yet (exemption, stated honestly): AI calls use the local free-first chain in `src/lib/ai.ts` / `src/app/api/chat`. No document upload, RAG, memory or per-tenant budgets in this app today, so no ai-core feature applies. If any of those are added, extend/consume ai-core (`agents/ai-core`) instead of a local copy.


## OWASP LLM Top 10 dispositions (gate item 45, 2026-10-07; list recalled from memory, unverified)
- LLM01 prompt injection: lib/guard.ts present, NOT yet wired into routes; no output filtering or tool sandbox review done. PARTIAL.
- LLM02 sensitive info disclosure: `redact()` helper available; not applied to every log. PARTIAL.
- LLM04/10 DoS / unbounded consumption: per-IP rate limit where present; token budgets not enforced. PARTIAL.
- LLM05 improper output handling: model output rendered as text; not audited for HTML sinks. UNVERIFIED.
- LLM06 excessive agency: no tool-calling agents audited. UNVERIFIED.
- Others (supply chain, poisoning, embeddings, misinformation): not assessed.


## ANIMATED SCOPE (gate items 19/21, derived from code 2026-10-07)
- Moves: AnimatedBackground (ambient hero/background); CSS keyframes: badgeFloat, blink, borderSpin, calCellIn, db-bounce, db-slide, db-slide-bottom, fadeIn; transitions on interactive elements.
- Trigger: page load (ambient) and hover/press (interactive). Reduced motion: honoured via prefers-reduced-motion block.
- STATUS: scope documented from existing code only. Skill-stack passes (ui-ux-pro-max, emil-design-eng, impeccable critique, review-animations) and 375/1280 screenshot review are NOT yet run for this app. Item 21 stays OPEN until they are.

## Item 21 visual pass (2026-10-07)
- Done: aurora bg, gradient h1 accents + gradient CTA, rise/sheen/glow entry motion, :active scale(.97), 44px targets, reduced-motion block, animated calendar demo (calCellIn). CSS-only, no deps.
- Screenshots read: 375x812 and 1280x800, no horizontal scroll (sw=cw). CTA above fold on both.
- Skills invoked as tools: taste-skill, emil-design-eng, animate, fixing-accessibility.
- TODO: invoke ui-ux-pro-max as a tool (not run; applied by rule only).
- TODO: run impeccable audit (not run).
- TODO: mobile page is 5766px tall below hero (fit-in-viewport only met for the hero); cookie banner/feedback FAB overlap the fold.
- SKILL-STACK: not done (ui-ux-pro-max + impeccable audit pending)
