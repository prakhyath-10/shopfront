"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CursorGlow } from "@/components/live-effects";

type Shop = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
};

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "bakery", label: "Bakery & food" },
  { value: "salon", label: "Salon & beauty" },
  { value: "tutor", label: "Tutors" },
  { value: "clinic", label: "Clinics" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

const LOOKS: Record<string, { strip: string; text: string; badge: string }> = {
  bakery: { strip: "from-amber-200 to-rose-200", text: "text-amber-700", badge: "bg-amber-50 text-amber-700" },
  salon: { strip: "from-rose-200 to-fuchsia-200", text: "text-rose-700", badge: "bg-rose-50 text-rose-700" },
  tutor: { strip: "from-indigo-200 to-sky-200", text: "text-indigo-700", badge: "bg-indigo-50 text-indigo-700" },
  clinic: { strip: "from-teal-200 to-emerald-200", text: "text-teal-700", badge: "bg-teal-50 text-teal-700" },
  retail: { strip: "from-violet-200 to-indigo-200", text: "text-violet-700", badge: "bg-violet-50 text-violet-700" },
  other: { strip: "from-zinc-200 to-zinc-300", text: "text-zinc-700", badge: "bg-zinc-100 text-zinc-700" },
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
        .select("id, name, slug, category, description")
        .order("created_at", { ascending: false });
      setShops(data ?? []);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-zinc-50">
      <CursorGlow />
      <header className="border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
            ShopFront
          </Link>
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Shop owner? Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Discover local shops
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-8 text-zinc-600">
          Browse bakeries, salons, tutors and clinics near you, then send a request in seconds.
        </p>

        <div className="mt-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shops..."
            aria-label="Search shops"
            className="h-12 w-full max-w-md rounded-full border border-zinc-200 bg-white px-5 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          <div className="mt-4 flex flex-wrap gap-2">
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

        {loading ? (
          <p className="mt-12 text-sm text-zinc-500">Loading shops...</p>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-base text-zinc-600">No shops match your search.</p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((s) => {
              const look = LOOKS[s.category] ?? LOOKS.other;
              return (
                <li key={s.id}>
                  <Link
                    href={`/shop/${s.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div
                      className={`flex h-28 items-center justify-center bg-gradient-to-br ${look.strip}`}
                    >
                      <span className="text-5xl font-semibold text-white/90">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="p-5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${look.badge}`}
                      >
                        {s.category}
                      </span>
                      <h2 className="mt-3 text-lg font-semibold text-zinc-900">{s.name}</h2>
                      {s.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600">
                          {s.description}
                        </p>
                      )}
                      <p className={`mt-4 text-sm font-semibold ${look.text}`}>
                        Visit shop &rarr;
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
