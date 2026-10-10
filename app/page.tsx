import Link from "next/link";
import { CursorGlow, LiveBadge } from "@/components/live-effects";

const SECTORS = [
  { name: "Bakeries & food", text: "Menu, prices and pre-orders" },
  { name: "Salons & beauty", text: "Services and appointment requests" },
  { name: "Tutors & classes", text: "Sessions, fees and bookings" },
  { name: "Clinics & health", text: "Services and visit requests" },
  { name: "Retail shops", text: "Catalog and order requests" },
  { name: "Anything local", text: "If you sell it, ShopFront fits" },
];

const STEPS = [
  { n: "1", title: "Sign up", text: "Create your free account in under a minute." },
  { n: "2", title: "Add your shop", text: "Pick a category, add products or services with prices." },
  { n: "3", title: "Share your link", text: "Customers browse on their phone and send requests." },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["1 shop", "Up to 10 products or services", "Customer requests", "Shareable storefront link"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    features: [
      "Unlimited shops and listings",
      "Online payments with Stripe",
      "Custom shop link",
      "Priority support",
    ],
    cta: "Go Pro",
    highlight: true,
  },
];

export default function Home() {
  const btnPrimary =
    "inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700";
  const btnSecondary =
    "inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50";

  return (
    <div className="min-h-screen bg-zinc-50">
      <CursorGlow />
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight text-zinc-900">ShopFront</span>
          <Link href="/login" className={btnSecondary}>
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            Built for local businesses
          </span>
          <div className="mt-4 flex justify-center">
            <LiveBadge />
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Your shop, online in 10 minutes
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600">
            No coding, no designer, no big bill. Add what you sell, share one link, and start
            receiving customer requests from any phone.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className={btnPrimary}>
              I&apos;m a shop owner: start free
            </Link>
            <Link href="/shops" className={btnSecondary}>
              I&apos;m a customer: browse shops
            </Link>
          </div>
        </section>

        <section id="sectors" className="border-y border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
            <h2 className="text-center text-xl font-semibold text-zinc-900">
              One platform, every kind of local business
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {SECTORS.map((s) => (
                <li
                  key={s.name}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-base font-semibold text-zinc-900">{s.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
          <h2 className="text-center text-xl font-semibold text-zinc-900">How it works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-medium text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-500">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="pricing" className="border-y border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
            <h2 className="text-center text-xl font-semibold text-zinc-900">
              Simple pricing
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-500">
              Start free. Upgrade when your shop grows.
            </p>
            <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-2xl border bg-white p-6 shadow-sm ${
                    p.highlight ? "border-teal-600" : "border-zinc-200"
                  }`}
                >
                  <h3 className="text-base font-semibold text-zinc-900">{p.name}</h3>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                    {p.price}{" "}
                    <span className="text-sm font-normal text-zinc-500">{p.period}</span>
                  </p>
                  <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-600">
                    {p.features.map((f) => (
                      <li key={f}>&#10003; {f}</li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link href="/login" className={p.highlight ? btnPrimary : btnSecondary}>
                      {p.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-zinc-500">
              Payments run in Stripe test mode for this demo.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Ready to open your online shop?
            </h2>
            <p className="mt-3 text-base text-zinc-600">Free to start. No card needed.</p>
            <div className="mt-6">
              <Link href="/login" className={btnPrimary}>
                Create your shop
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-sm text-zinc-500 sm:px-6">
          &copy; ShopFront. Made for local businesses.
        </div>
      </footer>
    </div>
  );
}
