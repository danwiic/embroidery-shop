import type { OrderStatus } from "@prisma/client";

const STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PAYMENT_VERIFIED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  READY_FOR_PICKUP: "bg-green-100 text-green-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
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

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status] ?? "bg-gray-100 text-gray-800"}`}
  >
    {LABELS[status] ?? status}
  </span>
);
