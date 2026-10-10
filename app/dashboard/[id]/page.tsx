"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Shop = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

type Item = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  kind: string;
  active: boolean;
};

type Booking = {
  id: string;
  customer_name: string;
  customer_contact: string;
  starts_at: string | null;
  note: string | null;
  status: string;
  created_at: string;
  item_id: string | null;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function ManageShop() {
  const params = useParams<{ id: string }>();
  const shopId = params.id;
  const router = useRouter();

  const [shop, setShop] = useState<Shop | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [kind, setKind] = useState("product");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data: shopRow } = await supabase
        .from("shops")
        .select("id, name, slug, category")
        .eq("id", shopId)
        .eq("owner_id", userData.user.id)
        .maybeSingle();

      if (!shopRow) {
        router.replace("/dashboard");
        return;
      }
      setShop(shopRow);

      const { data: itemRows } = await supabase
        .from("items")
        .select("id, name, description, price_cents, kind, active")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      setItems(itemRows ?? []);

      const { data: bookingRows } = await supabase
        .from("bookings")
        .select("id, customer_name, customer_contact, starts_at, note, status, created_at, item_id")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      setBookings(bookingRows ?? []);

      setLoading(false);
    }
    load();
  }, [shopId, router]);

  // Live updates: new customer requests appear instantly
  useEffect(() => {
    const channel = supabase
      .channel(`bookings-${shopId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings", filter: `shop_id=eq.${shopId}` },
        (payload) => {
          setBookings((prev) => [payload.new as Booking, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId]);

  async function handleAddItem(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("items")
      .insert({
        shop_id: shopId,
        name,
        description: description || null,
        price_cents: Math.round(Number(price || 0) * 100),
        kind,
      })
      .select("id, name, description, price_cents, kind, active")
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setItems((prev) => [data, ...prev]);
      setName("");
      setPrice("");
      setDescription("");
      setKind("product");
    }
    setSaving(false);
  }

  async function handleDeleteItem(id: string) {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) setError(error.message);
    else setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function setBookingStatus(id: string, status: "confirmed" | "cancelled") {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) setError(error.message);
    else setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  if (loading || !shop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="text-sm font-medium text-teal-300 hover:text-teal-200">
            &larr; All shops
          </Link>
          <Link
            href={`/shop/${shop.slug}`}
            target="_blank"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            View storefront
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{shop.name}</h1>
        <p className="mt-2 text-sm text-zinc-500">Public link: /shop/{shop.slug}</p>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-zinc-900 p-4 text-white shadow-sm">
            <p className="text-xs font-medium text-zinc-400">Listings</p>
            <p className="mt-1 text-3xl font-semibold">{items.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
            <p className="text-xs font-medium text-zinc-500">Pending</p>
            <p className="mt-1 text-3xl font-semibold text-amber-600">
              {bookings.filter((b) => b.status === "pending").length}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
            <p className="text-xs font-medium text-zinc-500">Confirmed</p>
            <p className="mt-1 text-3xl font-semibold text-teal-600">
              {bookings.filter((b) => b.status === "confirmed").length}
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section className="flex flex-col gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900">Add a product or service</h2>
              <form onSubmit={handleAddItem} className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="iname" className="text-sm font-medium text-zinc-900">
                    Name
                  </label>
                  <input
                    id="iname"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Chocolate cake (1 kg)"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="iprice" className="text-sm font-medium text-zinc-900">
                      Price (INR)
                    </label>
                    <input
                      id="iprice"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="650"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ikind" className="text-sm font-medium text-zinc-900">
                      Type
                    </label>
                    <select
                      id="ikind"
                      value={kind}
                      onChange={(e) => setKind(e.target.value)}
                      className={inputClass}
                    >
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="idesc" className="text-sm font-medium text-zinc-900">
                    Description (optional)
                  </label>
                  <textarea
                    id="idesc"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
                >
                  {saving ? "Adding..." : "Add"}
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold text-zinc-900">Your listings</h2>
              {items.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing added yet.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="text-base font-semibold text-zinc-900">{item.name}</p>
                      <p className="text-sm text-zinc-500">
                        {formatPrice(item.price_cents)} &middot; {item.kind}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
              Customer requests
              <span className="relative flex h-2 w-2" title="Live updates on">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
            </h2>
            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
                <p className="text-base text-zinc-600">No requests yet.</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Share your storefront link to start receiving them.
                </p>
              </div>
            ) : (
              bookings.map((b) => {
                const item = items.find((i) => i.id === b.item_id);
                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-semibold text-zinc-900">{b.customer_name}</p>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                        {b.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{b.customer_contact}</p>
                    {item && <p className="mt-1 text-sm text-zinc-600">For: {item.name}</p>}
                    {b.starts_at && (
                      <p className="mt-1 text-sm text-zinc-500">
                        {new Date(b.starts_at).toLocaleString("en-IN")}
                      </p>
                    )}
                    {b.note && <p className="mt-2 text-sm text-zinc-600">{b.note}</p>}
                    {b.status === "pending" && (
                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={() => setBookingStatus(b.id, "confirmed")}
                          className="inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setBookingStatus(b.id, "cancelled")}
                          className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function ManageShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      }
    >
      <ManageShop />
    </Suspense>
  );
}
