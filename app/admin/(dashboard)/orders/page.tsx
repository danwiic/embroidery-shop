"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ClickableRow } from "@/components/admin/clickable-row";
import { OrderDetailModal } from "@/components/admin/order-detail-modal";
import type { OrderStatus } from "@prisma/client";

type Order = {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string };
};

const STATUSES = [
  "", "PENDING_PAYMENT", "PAYMENT_VERIFIED", "PROCESSING",
  "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED",
];

const OrdersContent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("status") ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") return;
    const url = filter ? `/api/admin/orders?status=${filter}` : "/api/admin/orders";
    fetch(url).then((r) => r.json()).then(setOrders).catch(() => {});
  }, [session, filter]);

  if (!session || session.user?.role !== "ADMIN") return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Orders</h1>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => router.push(s ? `/admin/orders?status=${s}` : "/admin/orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === s
                ? "bg-navy text-white shadow-sm"
                : "bg-white text-muted hover:bg-gray-100 border border-border"
            }`}
          >
            {s ? s.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden mt-4">
        {orders.length === 0 ? (
          <EmptyState icon="search" title="No orders found"
            message={filter ? `No orders with status "${filter.replace(/_/g, " ")}".` : "No orders have been placed yet."}
            action={filter ? { label: "Clear filter", onClick: () => router.push("/admin/orders") } : undefined}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-navy/[0.04]">
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Type</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Total</th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <ClickableRow key={order.id} href="" onClick={() => setSelectedId(order.id)}>
                  <td className="px-4 py-3.5">
                    <span className="text-navy font-medium">#{order.orderNumber.slice(0, 8)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{order.user.name}</td>
                  <td className="px-4 py-3.5 capitalize text-muted">{order.serviceType.toLowerCase().replace("_", " ")}</td>
                  <td className="px-4 py-3.5 text-right font-medium">₱{Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-center"><Badge status={order.status as OrderStatus} /></td>
                  <td className="px-4 py-3.5 text-right text-muted text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <OrderDetailModal orderId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};

const AdminOrdersPage = () => (
  <ErrorBoundary>
    <Suspense fallback={null}>
      <OrdersContent />
    </Suspense>
  </ErrorBoundary>
);

export default AdminOrdersPage;
