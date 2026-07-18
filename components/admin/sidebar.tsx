"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, ShoppingBag, Package, Tags, ClipboardList, History, Users, Scissors, Settings, LogOut, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Inventory", href: "/admin/inventory", icon: ClipboardList },
  { label: "Stock Log", href: "/admin/stock-logs", icon: History },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Garment Types", href: "/admin/garment-types", icon: Scissors },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-64 bg-navy min-h-screen flex flex-col shadow-raised transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-navy-light/40">
          <Link href="/admin" className="text-xl font-bold text-gold tracking-wide">
            JENDAVE
          </Link>
          <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                  active
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-gold" : "text-gold/80"}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-navy-light/40">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/50 hover:text-red-300 hover:bg-white/5 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
