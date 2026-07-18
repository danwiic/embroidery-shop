"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";

const CheckoutPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fulfillment: "PICKUP",
    deliveryAddress: "",
    paymentMethod: "GCash",
    paymentRef: "",
  });

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unitPrice = (item: any) => Number(item.variant?.price ?? item.product.price);
  const total = items.reduce(
    (sum, item: any) => sum + unitPrice(item) * item.quantity,
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.paymentRef.trim()) {
      alert("Please enter the payment reference number");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const order = await res.json();
      router.push(`/orders/${order.id}`);
    } else {
      const data = await res.json();
      alert(data.error ?? "Checkout failed");
    }
    setSubmitting(false);
  };

  if (loading) return <p className="text-muted">Loading...</p>;
  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-foreground">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {items.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="font-medium">
                  ₱{(unitPrice(item) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Delivery or Pickup
          </h2>
          <div className="flex gap-2">
            {["PICKUP", "DELIVERY"].map((opt) => (
              <label
                key={opt}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium cursor-pointer text-center transition-all ${
                  form.fulfillment === opt
                    ? "border-navy bg-navy/5 text-navy shadow-sm"
                    : "border-border text-muted hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value={opt}
                  checked={form.fulfillment === opt}
                  onChange={(e) => setForm({ ...form, fulfillment: e.target.value })}
                  className="sr-only"
                />
                {opt === "PICKUP" ? "Store Pickup" : "Delivery"}
              </label>
            ))}
          </div>
          {form.fulfillment === "DELIVERY" && (
            <textarea
              placeholder="Enter your delivery address"
              value={form.deliveryAddress}
              onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
              required
              rows={3}
              className="mt-3 w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30 transition-colors"
            />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Payment</h2>
          <p className="text-xs text-muted mb-3">
            Send payment to the shop's GCash or Maya, then enter the reference number.
          </p>
          <div className="flex gap-2 mb-3">
            {["GCash", "Maya"].map((pm) => (
              <label
                key={pm}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium cursor-pointer text-center transition-all ${
                  form.paymentMethod === pm
                    ? "border-navy bg-navy/5 text-navy shadow-sm"
                    : "border-border text-muted hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={pm}
                  checked={form.paymentMethod === pm}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="sr-only"
                />
                {pm}
              </label>
            ))}
          </div>
          <Input
            placeholder="Payment reference number"
            value={form.paymentRef}
            onChange={(e) => setForm({ ...form, paymentRef: e.target.value })}
            required
          />
        </Card>

        <Button type="submit" disabled={submitting} className="w-full" size="lg">
          {submitting ? "Placing Order..." : `Pay ₱${total.toFixed(2)}`}
        </Button>
      </form>
    </div>
  );
};

const CheckoutPageWrapper = () => (
  <ErrorBoundary>
    <CheckoutPage />
  </ErrorBoundary>
);

export default CheckoutPageWrapper;
