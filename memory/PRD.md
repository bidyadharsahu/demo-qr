# netrik-mu (demo-qr) — 8think bot fix

## Problem (original)
User reported that the chatbot at https://netrik-mu.vercel.app/order/abb4643f-c039-4b46-b090-6416bf7391ba
was stuck — every reply was "Hmm, I'm having a tiny brain freeze — could you say that one more time?"
Root cause: LLM API keys on Vercel (Groq/OpenRouter/Emergent/OpenAI) were absent or failing, so
`lib/llm.js` threw, and the chat route fell back to the canned brain-freeze message.

User request: "I will not use API, I want our own LLM model — make a Natural Language model that
will work instead of an AI API and make sure it works perfectly."

## Delivered (Feb 2026)
- `lib/local-nlp-waiter.js` — zero-dependency, rule-based conversational engine that lives inside
  the Next.js API route. Handles greetings, menu browsing, recommendations, quantified item adds,
  allergies, spice level, wants/avoids, notes, place order, UPI payment, cart/total, small talk,
  jokes, FAQ (hours/location/wifi/washroom/human waiter), and a varied context-aware fallback.
  Never throws. Never says "brain freeze".
- `app/api/[[...path]]/route.js` — rewired to use `localWaiterReply`. Removed LLM import and
  brain-freeze try/catch from both demo-mode and supabase-backed chat handlers.
- `tests/test_local_nlp_waiter.mjs` — 33 scenario tests; all pass.

## Architecture (relevant to chat)
- Next.js 14 app router, catch-all API route at `app/api/[[...path]]/route.js`.
- Two runtime modes: demo-mode (in-memory DB) and supabase-backed. Both updated.
- Same request shape: `POST /api/chat  { sessionId, restaurantId, tableId, message, menu, cart, stage }`
- Same response shape: `{ reply, actions }`, where `actions` can include `add_items`, `set_allergy`,
  `set_spicy`, `set_wants`, `set_avoids`, `set_notes`, `ask_instructions`, `place_order`, `pay_now`.

## What's implemented
- [x] Local NLP waiter engine (Feb 2026)
- [x] Menu-aware item detection with qty parsing ("2", "two", "a couple of", etc.)
- [x] Intent detection (20+ intents) with priority ordering
- [x] Varied response templates chosen deterministically by hashed input (no repetition)
- [x] Cart-context replies (empty cart, totals)
- [x] Full removal of "brain freeze" fallback
- [x] 33-case regression test, all green

## Backlog (P1/P2)
- P1: Push the branch `fix/local-nlp-waiter` to GitHub and merge → Vercel auto-deploy.
- P2: Optional — add more localized FAQ data per restaurant (opening hours, address from Supabase row).
- P2: Optional — expand recommendation logic with tags (`popular: true`, `signature: true`) on menu rows.
- P2: Optional — remove `lib/llm.js` entirely once user confirms the local bot meets all needs.

## Deliverables on disk (inside Emergent workspace)
- Patch: `/app/0001-fix-chat-replace-LLM-with-local-NLP-waiter-no-more-b.patch`
- Engine: `/app/local-nlp-waiter.js`   (→ drop into `lib/local-nlp-waiter.js` in the repo)
- New route: `/app/route.js.NEW`       (→ replace `app/api/[[...path]]/route.js`)
- Test: `/app/test_local_nlp_waiter.mjs`
- Summary: `/app/FIX_SUMMARY.md`

## User's deployment targets
- GitHub: bidyadharsahu/demo-qr (branch `fix/local-nlp-waiter` prepared locally; needs user's push)
- Vercel: netrik-mu.vercel.app (auto-deploys on push to main)
- Emergent preview: not applicable for this Next.js repo (user works directly on the GitHub/Vercel setup)
