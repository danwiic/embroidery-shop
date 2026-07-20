import type { OrderStatus } from "@/lib/types";

const STYLES: Record<string, string> = {
  PENDING_PAYMENT: "text-amber-700 bg-amber-50 border border-amber-200",
  PAYMENT_VERIFIED: "text-emerald-700 bg-emerald-50 border border-emerald-200",
  PROCESSING: "text-navy bg-navy/5 border border-navy/20",
  READY_FOR_PICKUP: "text-emerald-700 bg-emerald-50 border border-emerald-200",
  OUT_FOR_DELIVERY: "text-emerald-700 bg-emerald-50 border border-emerald-200",
  COMPLETED: "text-muted bg-surface border border-border",
  CANCELLED: "text-red-700 bg-red-50 border border-red-200",
};

const LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAYMENT_VERIFIED: "Payment Verified",
  PROCESSING: "Processing",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const Badge = ({ status }: { status: OrderStatus }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status] ?? "text-muted bg-surface border border-border"}`}
  >
    {LABELS[status] ?? status}
  </span>
);
