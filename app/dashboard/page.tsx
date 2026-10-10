"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Shop = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
};

const CATEGORIES = [
  { value: "retail", label: "Retail shop" },
  { value: "bakery", label: "Bakery / food" },
  { value: "salon", label: "Salon / beauty" },
  { value: "tutor", label: "Tutor / classes" },
  { value: "clinic", label: "Clinic / health" },
  { value: "other", label: "Other" },
];

function makeSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "shop"}-${suffix}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("retail");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? "");

      const { data: rows, error } = await supabase
        .from("shops")
        .select("id, name, slug, category, description")
        .eq("owner_id", data.user.id)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setShops(rows ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("shops")
      .insert({
        owner_id: userId,
        name,
        slug: makeSlug(name),
        category,
        description: description || null,
      })
      .select("id, name, slug, category, description")
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setShops((prev) => [data, ...prev]);
      setName("");
      setDescription("");
      setCategory("retail");
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
            ShopFront
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-500 sm:inline">{email}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Your shops</h1>
        <p className="mt-2 text-base text-zinc-600">
          Create a shop to get started. Add products or services next.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">Create a shop</h2>
            <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-zinc-900">
                  Shop name
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sweet Crumbs Bakery"
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-sm font-medium text-zinc-900">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium text-zinc-900">
                  Short description (optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh cakes and breads baked every morning."
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
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create shop"}
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-4">
            {shops.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
                <p className="text-base text-zinc-600">No shops yet.</p>
                <p className="mt-1 text-sm text-zinc-500">Your first shop will appear here.</p>
              </div>
            ) : (
              shops.map((shop) => (
                <article
                  key={shop.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold text-zinc-900">{shop.name}</h3>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                      {shop.category}
                    </span>
                  </div>
                  {shop.description && (
                    <p className="mt-2 text-base leading-7 text-zinc-600">{shop.description}</p>
                  )}
                  <p className="mt-3 text-sm text-zinc-500">/shop/{shop.slug}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/${shop.id}`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                    >
                      Manage
                    </Link>
                    <Link
                      href={`/shop/${shop.slug}`}
                      target="_blank"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
                    >
                      View storefront
                    </Link>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
