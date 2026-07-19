"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { ShoppingCart, Package, LogOut, User, Bell, Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";

export const CustomerNav = () => {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [notifUnread, setNotifUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/cart")
        .then((r) => r.json())
        .then((data) => setCartCount(data?.items?.length ?? 0))
        .catch(() => {});
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setNotifUnread(data?.unread ?? 0))
        .catch(() => {});
    }
  }, [session]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-card">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <SiteLogo href="/" />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {session ? (
            <>
              <NavLink href="/products" icon={Package}>Products</NavLink>
              <NavLink href="/orders">Orders</NavLink>
              <Link href="/profile" className="p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors" title="My Account">
                <User className="w-5 h-5" />
              </Link>
              <Link href="/notifications" className="relative p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors" title="Notifications">
                <Bell className="w-5 h-5" />
                {notifUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-navy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {notifUnread}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-navy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              <span className="flex items-center gap-1.5 ml-2 px-3 py-1.5 text-muted text-xs border-l border-border">
                <User className="w-3.5 h-3.5" />
                {session.user?.name}
              </span>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2 text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-1.5 text-sm text-muted hover:text-navy transition-colors">Sign In</Link>
              <Link href="/register" className="px-4 py-1.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light shadow-sm hover:shadow-raised transition-all">Register</Link>
            </>
          )}
        </nav>

        {/* Mobile icons + hamburger */}
        <div className="flex lg:hidden items-center gap-1">
          {session && (
            <>
              <Link href="/notifications" className="relative p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors" title="Notifications">
                <Bell className="w-5 h-5" />
                {notifUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-navy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{notifUnread}</span>
                )}
              </Link>
              <Link href="/cart" className="relative p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-navy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{cartCount}</span>
                )}
              </Link>
            </>
          )}
          <button onClick={() => setMobileOpen(true)} className="p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors" title="Menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm" onClick={closeMobile} />
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
              <span className="font-semibold text-navy text-base">Menu</span>
              <button onClick={closeMobile} className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm">
              <MobileLink href="/" onClick={closeMobile}>Home</MobileLink>
              <MobileLink href="/services" onClick={closeMobile}>Services</MobileLink>
              <MobileLink href="/products" onClick={closeMobile}>Products</MobileLink>
              {session && <MobileLink href="/orders" onClick={closeMobile}>Orders</MobileLink>}
              {session && <MobileLink href="/cart" onClick={closeMobile}>Cart{cartCount > 0 && ` (${cartCount})`}</MobileLink>}
              {session && <MobileLink href="/notifications" onClick={closeMobile}>Notifications{notifUnread > 0 && ` (${notifUnread})`}</MobileLink>}
              {session && <MobileLink href="/profile" onClick={closeMobile}>My Account</MobileLink>}
              {session && <MobileLink href="/alterations/new" onClick={closeMobile}>Alteration Service</MobileLink>}
            </nav>
            <div className="border-t border-border px-3 py-4">
              {session ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted px-3">Signed in as <span className="font-medium text-foreground">{session.user?.name}</span></p>
                  <button onClick={() => { signOut({ callbackUrl: "/" }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={closeMobile} className="flex-1 text-center px-3 py-2 text-sm text-muted hover:text-navy border border-border rounded-lg transition-colors">Sign In</Link>
                  <Link href="/register" onClick={closeMobile} className="flex-1 text-center px-3 py-2 text-sm bg-navy text-white rounded-lg font-medium hover:bg-navy-light transition-colors">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({
  href,
  children,
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <Link
    href={href}
    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors"
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </Link>
);

const MobileLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <Link href={href} onClick={onClick} className="block px-3 py-2.5 text-sm text-foreground hover:text-navy hover:bg-navy/[0.04] rounded-lg transition-colors">
    {children}
  </Link>
);
