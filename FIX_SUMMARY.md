# 8think bot fix — local NLP waiter (no API)

## What was wrong
The "brain freeze" message was the catch-all reply whenever the LLM call failed. On your live Vercel deployment (https://netrik-mu.vercel.app), none of `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `EMERGENT_LLM_KEY`, or `OPENAI_API_KEY` were valid / reachable, so `lib/llm.js` threw and every chat turn fell back to:

> *"Hmm, I'm having a tiny brain freeze — could you say that one more time? I'm right here."*

## The fix (as you asked — no external API, our own NLP)
Replaced the LLM dependency with a local rule-based NLP engine that runs entirely inside your Next.js API route. Zero external calls, zero API keys needed, works on Vercel and anywhere Node runs.

### Files added
- `lib/local-nlp-waiter.js` — the new engine (~480 lines, no deps)
- `tests/test_local_nlp_waiter.mjs` — 33 conversational scenarios, **all 33 pass**

### Files modified
- `app/api/[[...path]]/route.js`
  - swapped `import { llmChat }` → `import { localWaiterReply }`
  - `aiWaiterReply()` now calls the local engine (still returns `{reply, actions, raw}`)
  - removed the "brain freeze" try/catch in **both** chat handlers (demo-mode + supabase-backed)

### What the bot now handles
Greetings, menu browsing, recommendations ("what's popular", "surprise me"), item adds with quantity ("add 2 truffle pasta", "three chocolate lava cake"), category browsing, allergies / vegan / gluten-free, spice level (mild/medium/hot/extra-hot), wants/avoids ("extra cheese", "no onion"), place order, UPI payment, cart summary, thanks, goodbye, small talk, jokes, "who are you", help, FAQs (hours / location / wifi / washroom / real waiter), and a graceful context-aware fallback. **No scenario produces "brain freeze".**

## How to deploy this

### Option A — push the branch from Emergent (I already created it locally)
```bash
# From your machine, in a fresh clone:
git clone https://github.com/bidyadharsahu/demo-qr.git
cd demo-qr
# Apply the patch I generated:
git am /path/to/0001-fix-chat-replace-LLM-with-local-NLP-waiter-no-more-b.patch
git push origin fix/local-nlp-waiter
# Then open a PR on GitHub, or merge to main and Vercel will auto-deploy.
```

The patch file is at: **`/app/0001-fix-chat-replace-LLM-with-local-NLP-waiter-no-more-b.patch`**

### Option B — copy the individual files
- Replace `app/api/[[...path]]/route.js` in your repo with the contents of `/app/route.js.NEW`
- Add the file `/app/local-nlp-waiter.js` as `lib/local-nlp-waiter.js` in your repo
- Optionally add the test at `tests/test_local_nlp_waiter.mjs`
- Commit & push to `main` → Vercel auto-deploys.

### Env vars on Vercel
You can now **delete** `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `EMERGENT_LLM_KEY`, `OPENAI_API_KEY` — they're no longer used. Keep your Supabase keys.

## Verification
```bash
cd demo-qr
node tests/test_local_nlp_waiter.mjs
# → Total: 33   Pass: 33   Fail: 0
```

After deploying, open https://netrik-mu.vercel.app/order/abb4643f-c039-4b46-b090-6416bf7391ba and try:
- "hi"
- "what do you recommend?"
- "add 2 truffle pasta"
- "make it hot"
- "place my order"
- "pay by UPI"

Every turn returns a relevant, varied, human-sounding reply — no API, no brain freeze.
