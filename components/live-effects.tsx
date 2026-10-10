"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

/** Smooth cursor: a dot, a trailing ring and a soft glow. Desktop mouse only. */
export function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let mx = -100,
      my = -100,
      rx = -100,
      ry = -100,
      gx = -100,
      gy = -100,
      scale = 1,
      target = 1,
      raf = 0;

    const setOpacity = (v: string) => {
      [glow, ring, dot].forEach((r) => {
        if (r.current) r.current.style.opacity = v;
      });
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      setOpacity("1");
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element | null;
      const interactive = !!el?.closest("a,button,select,input,textarea,label,[role='button']");
      target = interactive ? 1.8 : 1;
      if (ring.current) {
        ring.current.style.backgroundColor = interactive ? "rgba(20,184,166,0.15)" : "transparent";
      }
    };

    const onLeave = () => setOpacity("0");

    const tick = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      scale += (target - scale) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px,${my}px,0)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${scale})`;
      if (glow.current) glow.current.style.transform = `translate3d(${gx}px,${gy}px,0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={glow}
        style={{ opacity: 0 }}
        className="pointer-events-none fixed left-0 top-0 z-40 -ml-32 -mt-32 hidden h-64 w-64 rounded-full bg-teal-400/25 blur-3xl transition-opacity duration-300 md:block"
      />
      <div
        ref={ring}
        style={{ opacity: 0 }}
        className="pointer-events-none fixed left-0 top-0 z-50 -ml-5 -mt-5 hidden h-10 w-10 rounded-full border-2 border-teal-500/70 transition-colors duration-200 md:block"
      />
      <div
        ref={dot}
        style={{ opacity: 0 }}
        className="pointer-events-none fixed left-0 top-0 z-50 -ml-1 -mt-1 hidden h-2 w-2 rounded-full bg-teal-600 md:block"
      />
    </>
  );
}

/** Pulsing green dot with the real number of shops on the platform. */
export function LiveBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("shops")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setCount(count ?? 0));
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      {count === null
        ? "Live"
        : `${count} ${count === 1 ? "shop" : "shops"} live on ShopFront`}
    </span>
  );
}
