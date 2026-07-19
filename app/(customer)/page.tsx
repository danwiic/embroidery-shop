"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Scissors, Shirt, ShoppingCart, Package, ArrowRight } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProductMarquee } from "@/components/product-marquee";

type Product = {
  id: number;
  name: string;
  price: string;
  imageUrl?: string;
  category: { name: string };
};

const LandingContent = () => {
  const { data: session } = useSession();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [shopName, setShopName] = useState("JENDAVE");

  useEffect(() => {
    fetch("/api/products?take=4")
      .then((r) => r.json())
      .then(setFeatured)
      .catch(() => {});
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { if (data.shopName) setShopName(data.shopName); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session) {
      fetch("/api/cart")
        .then((r) => r.json())
        .then((data) => setCartCount(data?.items?.length ?? 0))
        .catch(() => {});
    }
  }, [session]);

  return (
    <div className="flex-1 flex flex-col top-0">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-white">
        <div className="w-12 h-0.5 bg-gold/60 rounded-full mb-6" />
        <p className="text-xs uppercase tracking-[0.15em] text-gold-dark font-semibold mb-3">
          Embroidery & Alterations Shop
        </p>
        <h1 className="text-5xl font-bold text-navy tracking-wider relative inline-block">
          {shopName}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gold rounded-full" />
        </h1>
        <p className="text-base text-muted mt-6 max-w-md">
          Quality tailoring, military uniforms, and ready-made apparel
        </p>

        {session ? (
          <div className="flex flex-wrap gap-3 mt-8 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-raised hover:bg-navy-light transition-all"
            >
              <Package className="w-4 h-4" /> Shop Products
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-navy rounded-lg text-sm font-medium hover:bg-navy/5 transition-colors"
            >
              <ArrowRight className="w-4 h-4" /> My Orders
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-navy rounded-lg text-sm font-medium hover:bg-navy/5 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" /> Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 mt-8">
            <Link
              href="/products"
              className="px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-raised hover:bg-navy-light transition-all"
            >
              Browse Products
            </Link>
            <Link
              href="/services"
              className="px-6 py-2.5 border border-border text-navy rounded-lg text-sm font-medium hover:bg-navy/5 transition-colors"
            >
              Alteration Services
            </Link>
          </div>
        )}

        <div className="w-full mt-12">
                  <ProductMarquee />
                </div>
      </section>

      <section className="bg-gradient-to-b from-white to-gold/[0.02] border-t border-border py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="h-px w-8 bg-gold/40" />
            <h2 className="text-lg font-semibold text-navy text-center">Our Services</h2>
            <div className="h-px w-8 bg-gold/40" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Link href="/alterations/new" className="group block bg-white rounded-xl shadow-card p-6 hover:shadow-raised transition-all border border-transparent hover:border-gold/30">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                <Scissors className="w-5 h-5 text-gold-dark" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-navy transition-colors">Resizing & Alteration</h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Professional resizing for pants, shirts, shorts, and military uniforms. Custom measurements and fit preferences.
              </p>
            </Link>
            <Link href="/products" className="group block bg-white rounded-xl shadow-card p-6 hover:shadow-raised transition-all border border-transparent hover:border-gold/30">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                <Shirt className="w-5 h-5 text-gold-dark" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-navy transition-colors">Ready-Made Products</h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Shop military uniforms, shirts, pants, shorts, caps, and belts. Available in various sizes and colors.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-gradient-to-b from-gold/[0.02] to-surface border-t border-border py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-gold/40" />
                <h2 className="text-lg font-semibold text-navy">Featured Products</h2>
              </div>
              <Link href="/products" className="text-sm text-gold-dark hover:text-gold font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-xl shadow-card p-4 hover:shadow-raised transition-all border border-transparent hover:border-gold/30">
                  <div className="aspect-square bg-surface rounded-lg mb-3 flex items-center justify-center text-muted text-sm overflow-hidden group-hover:ring-1 group-hover:ring-gold/30 transition-all">
                    {p.imageUrl ? (
                      <div className="relative w-full h-full"><Image src={p.imageUrl} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>
                    ) : (
                      "No image"
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-navy transition-colors">{p.name}</p>
                  <p className="text-xs text-muted mt-0.5">{p.category.name}</p>
                  <p className="text-sm font-semibold text-gold-dark mt-1">₱{Number(p.price).toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const LandingPage = () => (
  <ErrorBoundary>
    <LandingContent />
  </ErrorBoundary>
);

export default LandingPage;
