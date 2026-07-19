"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shirt } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  productImageUrl?: string | null;
};

export function ProductMarquee() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("/api/categories?withProducts=true")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  const loop = [...categories, ...categories];

  return (
    <div
      className="relative overflow-hidden py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setHoveredKey(null); }}
      role="list"
      aria-label="Product categories"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />

      <div
        className="flex gap-4 w-max motion-reduce:!animate-none"
        style={{
          animation: "jendave-marquee 32s linear infinite",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {loop.map((cat, i) => {
          const key = `${cat.id}-${i}`;
          const isActive = hoveredKey === key;
          return (
            <Link
              key={key}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              role="listitem"
              tabIndex={0}
              onMouseEnter={() => setHoveredKey(key)}
              onFocus={() => { setPaused(true); setHoveredKey(key); }}
              className={`shrink-0 w-92 rounded-xl border bg-white transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold-dark no-underline ${
                isActive
                  ? "border-gold-dark shadow-raised scale-105 z-20"
                  : "border-border scale-100"
              }`}
            >
              <div className="aspect-[4/3] rounded-t-xl bg-surface flex items-center justify-center overflow-hidden">
                {cat.productImageUrl ? (
                  <div className="relative w-full h-full"><Image src={cat.productImageUrl} alt={cat.name} fill sizes="368px" className="object-cover" /></div>
                ) : (
                  <Shirt className={`w-8 h-8 ${isActive ? "text-gold-dark" : "text-muted/50"}`} />
                )}
              </div>
              <div className="p-3">
                <p className="text-xs uppercase tracking-wide text-gold-dark font-semibold">
                  {cat.name}
                </p>
                <p className="text-sm font-medium text-navy mt-0.5">Shop now</p>
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes jendave-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
