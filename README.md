# ShopFront

**Your shop, online in 10 minutes.**

ShopFront lets small local businesses (bakeries, salons, tutors, clinics, retail shops) get a live, mobile-friendly storefront without any coding. The owner signs up, creates a shop, adds products or services with prices, and shares one link. Customers browse on their phone and send requests, which the owner confirms or declines from a dashboard.

**Live demo:** https://shopfront-sandy.vercel.app

## The problem
Most small local businesses have no web presence because building a site is too hard or too expensive. ShopFront is one multi-tenant platform that serves many industries from the same app.

## Features
- Email sign up and login (Supabase Auth)
- Create shops in any category: bakery, salon, tutor, clinic, retail, other
- Add products or services with prices in INR
- Public storefront at `/shop/<shop-slug>`, designed mobile-first
- Customer request form (name, contact, item, preferred time, note)
- Owner dashboard to confirm or decline requests
- Row Level Security: strangers can browse and send requests, but only the owner can edit or read requests
- Pricing section (Free and Pro); payments planned via Stripe test mode

## Tech stack
| Area | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), TypeScript |
| Styling | Tailwind CSS, with a documented design system in `DESIGN.md` |
| Backend | Supabase (Auth + Postgres + Row Level Security) |
| Hosting | Vercel, auto-deployed from GitHub |
| Source control | GitHub |
| Planned | Stripe (test mode), Playwright end-to-end tests |

## Run it locally
```bash
git clone https://github.com/prakhyath-10/shopfront.git
cd shopfront
npm install
```

Create a `.env.local` file (see `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

Create the database tables by running `schema.sql` in the Supabase SQL Editor, then:
```bash
npm run dev
```
Open http://localhost:3000.

## Project structure
```
app/
  page.tsx              Landing page
  login/page.tsx        Sign up and sign in
  dashboard/page.tsx    List shops, create a shop
  dashboard/[id]/       Manage items and customer requests
  shop/[slug]/          Public storefront
lib/supabase.ts         Shared Supabase client
DESIGN.md               Design system (colors, type, components)
CLAUDE.md               Project rules for AI-assisted development
```

## Built with
Claude for AI-assisted development, following the design rules in `DESIGN.md` and `CLAUDE.md`.

## Roadmap
- Stripe checkout for customers and a Pro subscription for owners
- Image uploads for products (Supabase Storage)
- Playwright end-to-end tests in GitHub Actions
- Custom shop domains
