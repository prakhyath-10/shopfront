# ShopFront Design System: Clean & Minimal

A calm, professional look that works for any business: bakery, salon, tutor, clinic or shop. Lots of white space, soft grays, one accent color.

## Principles
- Mobile-first. Design for a 375px phone, then scale up.
- One primary action per screen.
- Generous white space. When unsure, add more padding, not more elements.
- Content first: photos, names and prices matter more than decoration.
- No more than 2 font weights per screen.

## Colors
| Role | Light value | Tailwind class |
|---|---|---|
| Page background | #FAFAFA | `bg-zinc-50` |
| Card / surface | #FFFFFF | `bg-white` |
| Primary text | #18181B | `text-zinc-900` |
| Secondary text | #71717A | `text-zinc-500` |
| Border | #E4E4E7 | `border-zinc-200` |
| Accent (buttons, links) | #0D9488 | `bg-teal-600`, `text-teal-600` |
| Accent hover | #0F766E | `hover:bg-teal-700` |
| Success | #16A34A | `text-green-600` |
| Error | #DC2626 | `text-red-600` |

Use the accent color sparingly: primary buttons, links and active states only.

## Typography
- Font: Geist Sans (already set up by Next.js). Mono only for code.
- Page title: `text-3xl font-semibold tracking-tight`
- Section heading: `text-xl font-semibold`
- Body: `text-base text-zinc-600 leading-7`
- Small / caption: `text-sm text-zinc-500`

## Spacing & Layout
- Page container: `mx-auto w-full max-w-5xl px-4 sm:px-6`
- Section spacing: `py-12 sm:py-20`
- Gap between related items: `gap-4`; between sections: `gap-8`
- Cards: `rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm`

## Components
**Primary button**
`inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700`

**Secondary button**
`inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50`

**Input**
`h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20`

**Badge**
`rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600`

## Accessibility
- Text contrast at least 4.5:1 against its background.
- Every interactive element has a visible focus state.
- Tap targets at least 44px high (`h-11`).
- All images need meaningful `alt` text.
- Never rely on color alone to show status; add text or an icon.

## Motion
- Keep it subtle: `transition-colors` or `transition-shadow`, 150 to 200ms.
- No auto-playing animations.
