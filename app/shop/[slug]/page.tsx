"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CursorGlow } from "@/components/live-effects";
import { CategoryImage } from "@/components/category-image";

type Shop = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
};

type Item = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  kind: string;
};

type Theme = {
  hero: string;
  button: string;
  text: string;
  soft: string;
  focus: string;
  avatar: string;
  label: string;
};

const THEMES: Record<string, Theme> = {
  bakery: {
    hero: "from-amber-100 via-orange-50 to-rose-100",
    button: "bg-amber-600 hover:bg-amber-700",
    text: "text-amber-700",
    soft: "bg-amber-50",
    focus: "focus:border-amber-600 focus:ring-amber-600/20",
    avatar: "bg-amber-100 text-amber-700",
    label: "Bakery & food",
  },
  salon: {
    hero: "from-rose-100 via-fuchsia-50 to-pink-100",
    button: "bg-rose-600 hover:bg-rose-700",
    text: "text-rose-700",
    soft: "bg-rose-50",
    focus: "focus:border-rose-600 focus:ring-rose-600/20",
    avatar: "bg-rose-100 text-rose-700",
    label: "Salon & beauty",
  },
  tutor: {
    hero: "from-indigo-100 via-sky-50 to-blue-100",
    button: "bg-indigo-600 hover:bg-indigo-700",
    text: "text-indigo-700",
    soft: "bg-indigo-50",
    focus: "focus:border-indigo-600 focus:ring-indigo-600/20",
    avatar: "bg-indigo-100 text-indigo-700",
    label: "Tutor & classes",
  },
  clinic: {
    hero: "from-teal-100 via-emerald-50 to-cyan-100",
    button: "bg-teal-600 hover:bg-teal-700",
    text: "text-teal-700",
    soft: "bg-teal-50",
    focus: "focus:border-teal-600 focus:ring-teal-600/20",
    avatar: "bg-teal-100 text-teal-700",
    label: "Clinic & health",
  },
  retail: {
    hero: "from-violet-100 via-purple-50 to-indigo-100",
    button: "bg-violet-600 hover:bg-violet-700",
    text: "text-violet-700",
    soft: "bg-violet-50",
    focus: "focus:border-violet-600 focus:ring-violet-600/20",
    avatar: "bg-violet-100 text-violet-700",
    label: "Retail shop",
  },
  other: {
    hero: "from-zinc-200 via-zinc-50 to-zinc-100",
    button: "bg-zinc-900 hover:bg-zinc-800",
    text: "text-zinc-700",
    soft: "bg-zinc-100",
    focus: "focus:border-zinc-900 focus:ring-zinc-900/20",
    avatar: "bg-zinc-200 text-zinc-700",
    label: "Local business",
  },
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function Storefront() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [shop, setShop] = useState<Shop | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [itemId, setItemId] = useState("");
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: shopRow } = await supabase
        .from("shops")
        .select("id, name, slug, category, description")
        .eq("slug", slug)
        .maybeSingle();

      if (!shopRow) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setShop(shopRow);

      const { data: itemRows } = await supabase
        .from("items")
        .select("id, name, description, price_cents, kind")
        .eq("shop_id", shopRow.id)
        .eq("active", true)
        .order("created_at", { ascending: true });

      setItems(itemRows ?? []);
      setLoading(false);
    }
    load();
  }, [slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!shop) return;
    setSending(true);
    setError(null);

    const { error } = await supabase.from("bookings").insert({
      shop_id: shop.id,
      item_id: itemId || null,
      customer_name: customerName,
      customer_contact: customerContact,
      starts_at: when ? new Date(when).toISOString() : null,
      note: note || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
      setCustomerName("");
      setCustomerContact("");
      setItemId("");
      setWhen("");
      setNote("");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (notFound || !shop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Shop not found</h1>
        <p className="text-base text-zinc-600">This link may be wrong or the shop was removed.</p>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Go to ShopFront
        </Link>
      </div>
    );
  }

  const t = THEMES[shop.category] ?? THEMES.other;

  const inputClass = `h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${t.focus}`;

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 md:pb-0">
      <CursorGlow />
      {/* Hero */}
      <header className={`relative overflow-hidden bg-gradient-to-br ${t.hero}`}>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-pulse rounded-full bg-white/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
        <CategoryImage
          category={shop.category}
          alt=""
          width={1200}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 [mask-image:linear-gradient(to_left,black,transparent)] md:inset-y-0 md:left-auto md:right-0 md:w-1/2 md:opacity-100"
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
          <span
            className={`inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${t.text}`}
          >
            {t.label}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-6xl md:max-w-[55%]">
            {shop.name}
          </h1>
          {shop.description && (
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-700 md:max-w-[50%]">{shop.description}</p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#request"
              className={`inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-semibold text-white shadow-md transition-colors ${t.button}`}
            >
              Send a request
            </a>
            <a
              href="#offers"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white/80 px-7 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-white"
            >
              See what we offer
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl items-start gap-10 px-4 py-12 sm:px-6 md:grid-cols-5 md:py-16">
        {/* Offers */}
        <section id="offers" className="scroll-mt-6 md:col-span-3">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">What we offer</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {items.length} {items.length === 1 ? "listing" : "listings"} available
          </p>

          {items.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
              <p className="text-base text-zinc-600">Nothing listed yet. Check back soon.</p>
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold ${t.avatar}`}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-zinc-900">{item.name}</h3>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${t.soft} ${t.text}`}>
                        {formatPrice(item.price_cents)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm leading-6 text-zinc-600">{item.description}</p>
                    )}
                    <span className="mt-3 inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-600">
                      {item.kind}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Request form */}
        <section id="request" className="scroll-mt-6 md:sticky md:top-6 md:col-span-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-zinc-900">Place a request</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Share your details and {shop.name} will get back to you.
            </p>

            {sent ? (
              <div role="status" className={`mt-6 rounded-2xl p-5 ${t.soft}`}>
                <p className={`text-base font-semibold ${t.text}`}>Request sent!</p>
                <p className="mt-1 text-sm text-zinc-600">The shop will contact you soon.</p>
                <button
                  onClick={() => setSent(false)}
                  className={`mt-4 text-sm font-semibold ${t.text}`}
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cname" className="text-sm font-medium text-zinc-900">
                    Your name
                  </label>
                  <input
                    id="cname"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ccontact" className="text-sm font-medium text-zinc-900">
                    Phone or email
                  </label>
                  <input
                    id="ccontact"
                    required
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {items.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="citem" className="text-sm font-medium text-zinc-900">
                      What are you interested in?
                    </label>
                    <select
                      id="citem"
                      value={itemId}
                      onChange={(e) => setItemId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Not sure yet</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({formatPrice(item.price_cents)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cwhen" className="text-sm font-medium text-zinc-900">
                    Preferred date and time (optional)
                  </label>
                  <input
                    id="cwhen"
                    type="datetime-local"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cnote" className="text-sm font-medium text-zinc-900">
                    Note (optional)
                  </label>
                  <textarea
                    id="cnote"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={`w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${t.focus}`}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className={`inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-60 ${t.button}`}
                >
                  {sending ? "Sending..." : "Send request"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 text-center text-sm text-zinc-500 sm:px-6">
          Powered by{" "}
          <Link href="/" className={`font-semibold ${t.text}`}>
            ShopFront
          </Link>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <a
          href="#request"
          className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white shadow-md ${t.button}`}
        >
          Send a request
        </a>
      </div>
    </div>
  );
}

export default function StorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      }
    >
      <Storefront />
    </Suspense>
  );
}
