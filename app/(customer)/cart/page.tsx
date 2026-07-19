"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageLoader } from "@/components/ui/page-loader";

type CartItem = {
  id: string;
  quantity: number;
  color?: string;
  size?: string;
  variant?: { id: number; size?: string; color?: string; price?: string | null; stock: number };
  product: { id: number; name: string; price: string; imageUrl?: string; stock: number };
};

const CartContent = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const router = useRouter();

  const fetchCart = () => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => { setItems(data.items ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const prev = items;
    setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) setItems(prev);
  };

  const removeItem = async (itemId: string) => {
    setRemoving(itemId);
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== itemId));
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (!res.ok) setItems(prev);
    setRemoving(null);
  };

  const total = items.reduce((sum, item) => sum + Number(item.variant?.price ?? item.product.price) * item.quantity, 0);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-gold/30" />
        <h1 className="text-xl font-semibold text-navy">Shopping Cart</h1>
        <div className="h-px flex-1 bg-gold/30" />
      </div>

      {items.length === 0 ? (
        <Card className="p-6 md:p-12">
          <EmptyState
            icon="cart"
            title="Your cart is empty"
            message="Looks like you haven't added anything yet."
            action={{ label: "Browse Products", href: "/products" }}
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => {
              const unitPrice = Number(item.variant?.price ?? item.product.price);
              const maxStock = item.variant?.stock ?? item.product.stock;
              return (
                <div key={item.id} className="group bg-white rounded-xl shadow-card p-4 flex items-center gap-4 hover:shadow-raised transition-all border border-transparent hover:border-gold/20">
                  <Link href={`/products/${item.product.id}`} className="w-20 h-20 bg-surface rounded-lg flex items-center justify-center text-xs text-muted shrink-0 overflow-hidden ring-1 ring-border/50 group-hover:ring-gold/30 transition-all">
                    {item.product.imageUrl ? (
                      <div className="relative w-full h-full"><Image src={item.product.imageUrl} alt="" fill sizes="80px" className="object-cover rounded-lg" /></div>
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-muted/50" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.id}`} className="text-sm font-medium text-foreground hover:text-navy transition-colors">
                      {item.product.name}
                    </Link>
                    {(item.variant?.size || item.variant?.color) && (
                      <p className="text-xs text-muted mt-0.5">{item.variant.size}{item.variant.size && item.variant.color ? " / " : ""}{item.variant.color}</p>
                    )}
                    {!item.variant && item.color && <p className="text-xs text-muted mt-0.5">{item.color}</p>}
                    <p className="text-sm font-semibold text-gold-dark mt-1">₱{unitPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                      className="px-2.5 py-1.5 text-muted hover:text-navy hover:bg-gray-50 text-sm disabled:text-muted/30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center py-1.5 text-sm font-medium border-x border-border tabular-nums">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={item.quantity >= maxStock}
                      className="px-2.5 py-1.5 text-muted hover:text-navy hover:bg-gray-50 text-sm disabled:text-muted/30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-foreground w-24 text-right tabular-nums">
                    ₱{(unitPrice * item.quantity).toFixed(2)}
                  </p>
                  <button onClick={() => removeItem(item.id)} disabled={removing === item.id}
                    className="p-2 rounded-lg text-muted/50 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-colors" title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-card p-5 flex items-center justify-between border border-transparent hover:border-gold/20 transition-all">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide font-medium">Total</p>
              <p className="text-xl font-bold text-navy mt-0.5">₱{total.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/products" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-muted hover:text-navy rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
              <Button onClick={() => router.push("/checkout")}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CartPage = () => (
  <ErrorBoundary>
    <CartContent />
  </ErrorBoundary>
);

export default CartPage;
