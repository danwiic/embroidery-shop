"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, XCircle, AlertTriangle } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/contexts/toast";

type Order = {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  totalAmount: string;
  paymentMethod: string;
  paymentRef: string;
  fulfillment?: string;
  deliveryAddress?: string;
  pickupDate?: string;
  estimatedCompletion?: string;
  garmentType?: { name: string };
  fitPreference?: string;
  createdAt: string;
  items?: { id: string; quantity: number; price: string; product: { name: string } }[];
  statusHistory?: { id: string; status: string; note?: string; createdAt: string }[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment", PAYMENT_VERIFIED: "Payment Verified",
  PROCESSING: "Processing", READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 border border-amber-200",
  PAYMENT_VERIFIED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PROCESSING: "bg-navy/5 text-navy border border-navy/20",
  READY_FOR_PICKUP: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  OUT_FOR_DELIVERY: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  COMPLETED: "bg-surface text-muted border border-border",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
};

const OrderDetailContent = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setOrder(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to cancel");
      }
      addToast("success", "Order cancelled successfully");
      setCancelOpen(false);
      fetchOrder();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p className="text-muted">Loading...</p>;
  if (!order) return <p className="text-red-600">Order not found</p>;

  const canCancel = order.status === "PENDING_PAYMENT";

  return (
    <div className="max-w-lg mx-auto py-6">
      <Link href="/orders" className="text-sm text-navy-light hover:text-navy inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> My Orders
      </Link>

      <div className="mt-4 bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-navy">Order #{order.orderNumber.slice(0, 8)}</h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-surface text-muted border border-border"}`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        {canCancel && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium">You can cancel this order</p>
              <p className="text-xs text-amber-700 mt-0.5">Cancellation is available while the order is pending payment.</p>
            </div>
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted">Type</span><span className="capitalize">{order.serviceType.toLowerCase().replace("_", " ")}</span></div>
          {order.serviceType === "ALTERATION" && (<>
            <div className="flex justify-between"><span className="text-muted">Garment</span><span>{order.garmentType?.name}</span></div>
            {order.fitPreference && <div className="flex justify-between"><span className="text-muted">Fit</span><span className="capitalize">{order.fitPreference.toLowerCase()}</span></div>}
            {order.pickupDate && <div className="flex justify-between"><span className="text-muted">Pickup</span><span>{new Date(order.pickupDate).toLocaleDateString()}</span></div>}
            {order.estimatedCompletion && <div className="flex justify-between"><span className="text-muted">Est. Completion</span><span>{new Date(order.estimatedCompletion).toLocaleDateString()}</span></div>}
          </>)}
          {order.serviceType === "READY_MADE" && (<>
            {order.fulfillment && <div className="flex justify-between"><span className="text-muted">Fulfillment</span><span className="capitalize">{order.fulfillment.toLowerCase()}</span></div>}
            {order.deliveryAddress && <div className="flex justify-between"><span className="text-muted">Delivery to</span><span className="text-right max-w-[200px]">{order.deliveryAddress}</span></div>}
          </>)}
          <div className="flex justify-between"><span className="text-muted">Payment</span><span>{order.paymentMethod} ({order.paymentRef})</span></div>
          <div className="flex justify-between pt-2 border-t border-border font-bold text-navy"><span>Total</span><span>₱{Number(order.totalAmount).toFixed(2)}</span></div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-semibold text-navy mb-2">Items</p>
            <div className="space-y-1 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>₱{(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canCancel && (
          <div className="mt-4 pt-4 border-t border-border">
            <button onClick={() => setCancelOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors">
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          </div>
        )}
      </div>

      {/* Status timeline */}
      <div className="mt-4 bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-navy mb-3">Updates</h2>
        <div className="space-y-3">
          {order.statusHistory?.map((h) => (
            <div key={h.id} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-navy mt-1.5 shrink-0" />
              <div>
                <p className="font-medium">{STATUS_LABELS[h.status]}</p>
                {h.note && <p className="text-muted text-xs mt-0.5">{h.note}</p>}
                <p className="text-xs text-muted mt-0.5">{new Date(h.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel confirmation modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Order"
        footer={<>
          <Button type="button" variant="outlined" onClick={() => setCancelOpen(false)}>Keep Order</Button>
          <Button type="submit" form="cancel-form" disabled={cancelling}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800">
            {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
          </Button>
        </>}>
        <form id="cancel-form" onSubmit={handleCancel} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">Are you sure?</p>
              <p className="text-sm text-muted mt-1">This action cannot be undone. Your order will be cancelled and any payment will be refunded according to our policy.</p>
            </div>
          </div>
          <Input label="Reason (optional)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Why are you cancelling?" />
        </form>
      </Modal>
    </div>
  );
};

const OrderDetailPage = ({ params }: { params: Promise<{ id: string }> }) => (
  <ErrorBoundary><OrderDetailContent params={params} /></ErrorBoundary>
);
export default OrderDetailPage;
