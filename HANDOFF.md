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
