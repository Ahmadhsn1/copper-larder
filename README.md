# The Copper Larder — AI Host Demo

A demo AI chat widget ("Hannah") for a fictional Birmingham bistro, built to show a restaurant owner what an
AI host on their own site could feel like. Full spec: [`CopperLarderSpec.md`](./CopperLarderSpec.md).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript, Tailwind v4
- Gemini 2.0 Flash via `@google/genai`, streamed over SSE
- Supabase (Postgres) — `conversations`, `leads`, `cache`, `rate_limit_counters`, all RLS-locked to the
  service-role key only

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Required env vars (see `.env.example`):

| Var | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API (anon/publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API keys → Legacy anon/service_role keys (**required** — every table has RLS enabled with no policies, so the app cannot read or write anything without this key; without it `/api/chat` and `/api/lead` fail closed with a graceful fallback message) |
| `IP_HASH_SALT` | any random string — used to salt-hash requester IPs before they're stored |

## Structure

```
app/page.tsx                  landing page (hero, menu, about, reviews, footer)
app/demo/dashboard/page.tsx   internal sales dashboard — unauthenticated, direct-URL only
app/api/chat/route.ts         chat pipeline: caps → complaint detection → intercepts → cache → Gemini
app/api/lead/route.ts         callback-request capture
components/widget/            the floating chat widget (Launcher, ChatWindow, Message, CallbackCard, useChat)
components/landing/           landing page sections
components/dashboard/         dashboard's live-refresh wrapper
lib/                          restaurant data, system prompt, intercepts, rate limiting, cache, Supabase clients
```

## Notes

- `/demo/dashboard` is intentionally unauthenticated — reachable only if you know the URL, not linked from
  any nav. Fine for a sales demo; add real auth before this goes anywhere public.
- This repo is **private** and its `.env.local` is committed intentionally (owner's request, for convenience).
  If it's ever made public, rotate every key in it first.
