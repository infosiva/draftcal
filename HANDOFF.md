# HANDOFF — draftcal
**Date:** 2026-10-07  **Status:** prod-ready gate file checks

## ai-core status (2026-10-07)
- Not on ai-core yet (exemption, stated honestly): AI calls use the local free-first chain in `src/lib/ai.ts` / `src/app/api/chat`. No document upload, RAG, memory or per-tenant budgets in this app today, so no ai-core feature applies. If any of those are added, extend/consume ai-core (`agents/ai-core`) instead of a local copy.
