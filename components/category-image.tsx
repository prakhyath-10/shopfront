"use client";

import { useState } from "react";

// Stock photos from Unsplash (free to use). If one fails to load, the
// gradient behind it shows instead, so the layout never breaks.
const IMAGES: Record<string, string> = {
  bakery: "photo-1509440159596-0249088772ff",
  salon: "photo-1560066984-138dadb4c035",
  tutor: "photo-1503676260728-1c00da094a0b",
  clinic: "photo-1576091160399-112ba8d25d1d",
  retail: "photo-1441986300917-64674bd600d8",
  other: "photo-1441986300917-64674bd600d8",
};

export function CategoryImage({
  category,
  alt,
  className,
  width = 1000,
}: {
  category: string;
  alt: string;
  className?: string;
  width?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const id = IMAGES[category] ?? IMAGES.other;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
