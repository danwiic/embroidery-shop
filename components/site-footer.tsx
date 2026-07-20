"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { Mail, Phone, MapPin, Package, Scissors } from "lucide-react";
import { useSettings } from "@/lib/hooks/use-api";

export const SiteFooter = () => {
  const { data: s } = useSettings();

  return (
    <footer className="bg-navy text-white/70 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <SiteLogo
            href="/"
            className="inline-block"
            textClassName="text-lg font-bold text-gold tracking-wide"
          />
          <p className="text-sm mt-3 leading-relaxed text-white/50">
            {s?.aboutText || "Quality tailoring, military uniforms, and ready-made apparel."}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-gold transition-colors inline-flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Products</Link></li>
            <li><Link href="/services" className="hover:text-gold transition-colors inline-flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5" /> Alterations</Link></li>
            <li><Link href="/orders" className="hover:text-gold transition-colors">My Orders</Link></li>
            <li><Link href="/cart" className="hover:text-gold transition-colors">Cart</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Contact</h3>
          <ul className="space-y-3 text-sm">
            {s?.shopPhone && (
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gold/60" />
                <span>{s.shopPhone}</span>
              </li>
            )}
            {s?.shopEmail && (
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gold/60" />
                <span>{s.shopEmail}</span>
              </li>
            )}
            {s?.shopAddress && (
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gold/60" />
                <span>{s.shopAddress}</span>
              </li>
            )}
          </ul>
        </div>

        {/* About */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Account</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/profile" className="hover:text-gold transition-colors">Profile</Link></li>
            <li><Link href="/notifications" className="hover:text-gold transition-colors">Notifications</Link></li>
            {s?.shopEmail && <li><a href={`mailto:${s.shopEmail}`} className="hover:text-gold transition-colors">Support</a></li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        &copy; {new Date().getFullYear()} {s?.shopName || "JENDAVE"}. All rights reserved.
      </div>
    </footer>
  );
};
