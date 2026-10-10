"use client";

import { useEffect, useMemo, useState } from "react";
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
  items: { count: number }[] | null;
};

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "bakery", label: "Bakery & food" },
  { value: "salon", label: "Salon & beauty" },
  { value: "tutor", label: "Tutors & classes" },
  { value: "clinic", label: "Clinics & health" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

const LOOKS: Record<string, { strip: string; text: string }> = {
  bakery: { strip: "from-amber-200 to-rose-200", text: "text-amber-700" },
  salon: { strip: "from-rose-200 to-fuchsia-200", text: "text-rose-700" },
  tutor: { strip: "from-indigo-200 to-sky-200", text: "text-indigo-700" },
  clinic: { strip: "from-teal-200 to-emerald-200", text: "text-teal-700" },
  retail: { strip: "from-violet-200 to-indigo-200", text: "text-violet-700" },
  other: { strip: "from-zinc-200 to-zinc-300", text: "text-zinc-700" },
};

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("shops")
        .select("id, name, slug, category, description, items(count)")
        .order("created_at", { ascending: false });
      setShops((data as unknown as Shop[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shops.filter((s) => {
      const matchCat = category === "all" || s.category === category;
      const matchText =
        !q || s.name.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [shops, query, category]);

  const groups = CATEGORIES.slice(1)
    .map((c) => ({ ...c, shops: filtered.filter((s) => s.category === c.value) }))
    .filter((g) => g.shops.length > 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <CursorGlow />

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
            ShopFront
          </Link>
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Shop owner? Sign in
          </Link>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Discover local shops
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-8 text-zinc-600">
            Browse trusted local businesses and send a request in seconds.
          </p>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shops..."
              aria-label="Search shops"
              className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 md:max-w-sm"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`h-10 rounded-full px-4 text-sm font-medium transition-colors ${
                    category === c.value
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading shops...</p>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-base text-zinc-600">No shops match your search.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {groups.map((g) => (
              <section key={g.value}>
                <div className="flex items-baseline justify-between border-b border-zinc-200 pb-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                    {g.label}
                  </h2>
                  <span className="text-sm text-zinc-500">
                    {g.shops.length} {g.shops.length === 1 ? "shop" : "shops"}
                  </span>
                </div>

                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {g.shops.map((s) => {
                    const look = LOOKS[s.category] ?? LOOKS.other;
                    const count = s.items?.[0]?.count ?? 0;
                    return (
                      <li key={s.id}>
                        <Link
                          href={`/shop/${s.slug}`}
                          className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                          <div
                            className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${look.strip}`}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-6xl font-semibold text-white/80">
                              {s.name.charAt(0).toUpperCase()}
                            </span>
                            <CategoryImage
                              category={s.category}
                              alt={s.name}
                              width={800}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-zinc-800 shadow-sm">
                              {g.label}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-zinc-900">{s.name}</h3>
                            <p className="mt-1 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-600">
                              {s.description ?? "Visit this shop to see what they offer."}
                            </p>
                            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                              <span className="text-xs font-medium text-zinc-500">
                                {count} {count === 1 ? "listing" : "listings"}
                              </span>
                              <span className={`text-sm font-semibold ${look.text}`}>
                                View shop &rarr;
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-zinc-500 sm:px-6">
          Photos from Unsplash &middot; Powered by ShopFront
        </div>
      </footer>
    </div>
  );
}
