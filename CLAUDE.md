# ShopFront: Project Rules for Claude

## What this project is
ShopFront lets small local businesses (bakeries, salons, tutors, clinics, shops) get a live, mobile-friendly storefront in minutes, with bookings or orders and online payments. One multi-tenant app serves many business categories.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS for all styling
- Supabase for auth, Postgres database and image storage
- Stripe (test mode) for payments and subscriptions
- Deployed on Vercel from GitHub (`main` branch auto-deploys)
- Playwright for end-to-end tests

## Design rules
- Follow `DESIGN.md` for every piece of UI: colors, type, spacing, components.
- Mobile-first: write the base styles for phones, then add `sm:` and `md:` for larger screens.
- Use Tailwind classes only. No inline styles and no extra CSS files.
- Keep pages simple and uncluttered. One primary action per screen.
- Meet the accessibility rules in `DESIGN.md`.

## Code rules
- TypeScript everywhere. Avoid `any`.
- Prefer Server Components. Add `"use client"` only when needed (state, effects, event handlers).
- Put reusable UI in `components/` and helpers in `lib/`.
- The Supabase client lives in `lib/supabase.ts`. Import it from there; don't create new clients elsewhere.
- Keep files small and readable. Short comments for anything non-obvious.

## Secrets and safety
- Never hardcode API keys. Read them from environment variables.
- `.env.local` is never committed. Document new variables in `.env.example`.
- Only variables starting with `NEXT_PUBLIC_` are visible in the browser. Stripe secret keys and the Supabase service role key must never use that prefix.
- Stripe stays in test mode for the hackathon.

## Workflow
- Small commits with clear messages.
- Before finishing a task, check the page works on a phone-width screen.
- After changes that affect the main flow (sign up, create shop, buy something), run the Playwright tests.
