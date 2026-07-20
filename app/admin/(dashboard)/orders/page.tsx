"use client";

import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageLoader } from "@/components/ui/page-loader";
import { Pagination } from "@/components/ui/pagination";
import { ClickableRow } from "@/components/admin/clickable-row";
import { OrderDetailModal } from "@/components/admin/order-detail-modal";
import { useAdminOrders } from "@/lib/hooks/use-api";
import { Search } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

const STATUSES = [
  "", "PENDING_PAYMENT", "PAYMENT_VERIFIED", "PROCESSING",
  "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED",
];

const OrdersContent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("status") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");

  const { data: result, isLoading } = useAdminOrders(filter, searchQuery, page);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orders = result?.data ?? [];
  const totalPages = result?.pagination?.totalPages ?? 1;
  const total = result?.pagination?.total ?? 0;

  if (!session || session.user?.role !== "ADMIN") return null;

  const navTo = (updates: Record<string, string | undefined>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "" || value === "1") p.delete(key);
      else p.set(key, value);
    }
    router.push(`/admin/orders?${p.toString()}`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-foreground">Orders</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
          <input type="text" defaultValue={searchQuery}
            onKeyDown={(e) => { if (e.key === "Enter") navTo({ q: (e.target as HTMLInputElement).value || undefined, page: "1" }); }}
            placeholder="Search by order # or customer..."
            className="w-full pl-9 pr-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30 transition-colors" />
        </div>
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

      <Card className="overflow-x-auto mt-4">
        {isLoading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <EmptyState icon="search" title="No orders found"
            message={filter ? `No orders with status "${filter.replace(/_/g, " ")}".` : searchQuery ? `No orders matching "${searchQuery}".` : "No orders have been placed yet."}
            action={filter || searchQuery ? { label: "Clear filter", onClick: () => router.push("/admin/orders") } : undefined}
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

      <Pagination page={page} totalPages={totalPages} total={total}
        onPageChange={(p) => navTo({ page: String(p) })} />

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
