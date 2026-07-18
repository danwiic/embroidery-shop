"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Scissors, Ruler, Camera, CreditCard, Shirt, SlidersHorizontal, ChevronRight, ArrowRight } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

type GarmentType = { id: number; name: string };

const steps = [
  { icon: Ruler, label: "Take Measurements", desc: "Enter your exact body measurements for a perfect fit." },
  { icon: Scissors, label: "Choose Fit", desc: "Select your preferred fit — slim, regular, or loose." },
  { icon: Camera, label: "Upload Photo", desc: "Snap a photo of the garment so we know what we're working with." },
  { icon: CreditCard, label: "Confirm & Pay", desc: "Review your order, pay securely, and we'll handle the rest." },
];

const ServicesContent = () => {
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);

  useEffect(() => {
    fetch("/api/admin/garment-types")
      .then((r) => r.json())
      .then(setGarmentTypes)
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="text-center px-4 py-16 bg-gradient-to-b from-white via-white to-gold/[0.03]">
        <div className="w-12 h-0.5 bg-gold/60 rounded-full mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-navy tracking-tight">Resizing & Alteration Services</h1>
        <p className="text-muted mt-3 max-w-lg mx-auto text-sm leading-relaxed">
          Professional tailoring for military uniforms, pants, shirts, shorts, and more.
          Custom-fit guaranteed.
        </p>
        <Link
          href="/alterations/new"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-navy text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-raised hover:bg-navy-light transition-all"
        >
          Start an Alteration <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Garment types */}
      <section className="bg-white border-y border-border py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-10">
            <div className="h-px w-8 bg-gold/40" />
            <h2 className="text-lg font-semibold text-navy text-center">What We Offer</h2>
            <div className="h-px w-8 bg-gold/40" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(garmentTypes.length > 0 ? garmentTypes : [
              { id: 1, name: "Pants" },
              { id: 2, name: "Shorts" },
              { id: 3, name: "Shirt" },
              { id: 4, name: "Military Uniform" },
            ]).map((g) => (
              <Link key={g.id} href="/alterations/new"
                className="group bg-white rounded-xl shadow-card p-5 hover:shadow-raised transition-all border border-transparent hover:border-gold/30"
              >
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                  <Shirt className="w-5 h-5 text-gold-dark" />
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-navy transition-colors">{g.name}</h3>
                <p className="text-xs text-muted mt-1">Professional resizing and fit adjustment.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fit options */}
      <section className="py-16 px-4 bg-gradient-to-b from-gold/[0.02] to-surface">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-10">
            <div className="h-px w-8 bg-gold/40" />
            <h2 className="text-lg font-semibold text-navy text-center">Fit Preferences</h2>
            <div className="h-px w-8 bg-gold/40" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Slim Fit", desc: "A closer, tailored silhouette. Perfect for a modern, sharp look.", icon: SlidersHorizontal },
              { label: "Regular Fit", desc: "A classic, comfortable cut with room to move. Our most popular option.", icon: SlidersHorizontal },
              { label: "Loose Fit", desc: "A relaxed, easy fit. Extra room through the seat and thigh.", icon: SlidersHorizontal },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="bg-white rounded-xl shadow-card p-5 border border-transparent hover:border-gold/20 transition-all">
                  <Icon className="w-5 h-5 text-gold-dark mb-2" />
                  <h3 className="text-sm font-semibold text-foreground">{f.label}</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-border py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-10">
            <div className="h-px w-8 bg-gold/40" />
            <h2 className="text-lg font-semibold text-navy text-center">How It Works</h2>
            <div className="h-px w-8 bg-gold/40" />
          </div>
          <div className="grid sm:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-gold-dark" />
                  </div>
                  <div className="w-6 h-0.5 bg-gold/30 mx-auto mb-2" />
                  <p className="text-xs text-gold-dark font-semibold uppercase tracking-wide">Step {i + 1}</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 px-4 bg-gradient-to-b from-surface to-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-navy">Ready for a Perfect Fit?</h2>
          <p className="text-sm text-muted mt-2">
            Start your alteration request — it only takes a few minutes.
          </p>
          <Link
            href="/alterations/new"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-navy text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-raised hover:bg-navy-light transition-all"
          >
            Get Started <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

const ServicesPage = () => (
  <ErrorBoundary>
    <ServicesContent />
  </ErrorBoundary>
);

export default ServicesPage;
