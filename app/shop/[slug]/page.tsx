"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
          className="inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          Go to ShopFront
        </Link>
      </div>
    );
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            {shop.category}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {shop.name}
          </h1>
          {shop.description && (
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">{shop.description}</p>
          )}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-5">
        <section className="md:col-span-3">
          <h2 className="text-xl font-semibold text-zinc-900">What we offer</h2>
          {items.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
              <p className="text-base text-zinc-600">Nothing listed yet. Check back soon.</p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-zinc-900">{item.name}</h3>
                    <span className="text-base font-semibold text-zinc-900">
                      {formatPrice(item.price_cents)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
                  )}
                  <span className="mt-3 inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                    {item.kind}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="md:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">Place a request</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Send your details and {shop.name} will get back to you.
            </p>

            {sent ? (
              <div role="status" className="mt-6 rounded-xl bg-zinc-50 p-4">
                <p className="text-base font-medium text-green-600">Request sent!</p>
                <p className="mt-1 text-sm text-zinc-600">The shop will contact you soon.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-700"
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
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
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
                  className="inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send request"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-sm text-zinc-500 sm:px-6">
          Powered by{" "}
          <Link href="/" className="font-medium text-teal-600 hover:text-teal-700">
            ShopFront
          </Link>
        </div>
      </footer>
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
