"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { ShoppingCart, Package, LogOut, User, Bell } from "lucide-react";

export const CustomerNav = () => {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [notifUnread, setNotifUnread] = useState(0);

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

  return (
    <header className="sticky top-0 z-50 bg-white shadow-card">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-navy tracking-wide">
          JENDAVE
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {session ? (
            <>
              <NavLink href="/products" icon={Package}>
                Products
              </NavLink>
              <NavLink href="/orders">Orders</NavLink>
              <Link
                href="/profile"
                className="p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors"
                title="My Account"
              >
                <User className="w-5 h-5" />
              </Link>
              <Link
                href="/notifications"
                className="relative p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-navy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {notifUnread}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative p-2 text-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors"
              >
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
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm text-muted hover:text-navy transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light shadow-sm hover:shadow-raised transition-all"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
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
