"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Badge } from "@/components/ui/badge";
import { ClickableRow } from "@/components/admin/clickable-row";
import { Package, ShoppingBag, TrendingUp, DollarSign, AlertTriangle, Calendar, RefreshCw, Star } from "lucide-react";
import Image from "next/image";
import type { OrderStatus } from "@/lib/types";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    serviceType: string;
    createdAt: string;
    user: { name: string };
  }>;
  revenueChange: number;
  ordersChange: number;
  lowStockCount: number;
  lowStockItems: Array<{ id: number; name: string; stock: number; imageUrl?: string | null }>;
  ordersByStatus: Record<string, number>;
  topProducts: Array<{ id: number; name: string; imageUrl?: string | null; totalSold: number; revenue: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAYMENT_VERIFIED: "Verified",
  PROCESSING: "Processing",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "text-amber-600 bg-amber-50 border-amber-200",
  PAYMENT_VERIFIED: "text-blue-600 bg-blue-50 border-blue-200",
  PROCESSING: "text-indigo-600 bg-indigo-50 border-indigo-200",
  READY_FOR_PICKUP: "text-teal-600 bg-teal-50 border-teal-200",
  OUT_FOR_DELIVERY: "text-purple-600 bg-purple-50 border-purple-200",
  COMPLETED: "text-emerald-600 bg-emerald-50 border-emerald-200",
  CANCELLED: "text-red-600 bg-red-50 border-red-200",
};

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

const DashboardPage = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateRange === "custom") {
        if (customStart) params.set("start", customStart);
        if (customEnd) params.set("end", customEnd);
      } else {
        params.set("range", dateRange);
      }
      const res = await fetch(`/api/admin/dashboard?${params}`);
      if (!res.ok) throw new Error("Failed to load dashboard");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      change: stats?.ordersChange,
      color: "text-navy",
      bg: "bg-navy/5",
    },
    {
      label: "Revenue",
      value: stats ? `₱${Number(stats.totalRevenue).toFixed(2)}` : "₱0.00",
      icon: DollarSign,
      change: stats?.revenueChange,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: TrendingUp,
      color: "text-gold-dark",
      bg: "bg-gold/10",
    },
    {
      label: "Low Stock",
      value: stats?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: (stats?.lowStockCount ?? 0) > 0 ? "text-red-600" : "text-emerald-600",
      bg: (stats?.lowStockCount ?? 0) > 0 ? "bg-red-50" : "bg-emerald-50",
      href: "/admin/inventory",
    },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
            <p className="text-sm text-muted mt-1">Overview of your embroidery shop</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            suppressHydrationWarning
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy bg-white border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setDateRange(preset.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                dateRange === preset.value
                  ? "bg-navy text-white"
                  : "bg-white border border-border text-muted hover:text-navy hover:border-navy/30"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setDateRange("custom")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              dateRange === "custom"
                ? "bg-navy text-white"
                : "bg-white border border-border text-muted hover:text-navy hover:border-navy/30"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline-block mr-1" />
            Custom
          </button>
          {dateRange === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border rounded-lg bg-white"
              />
              <span className="text-muted text-xs">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2 py-1.5 text-xs border border-border rounded-lg bg-white"
              />
              <button
                onClick={fetchStats}
                className="px-3 py-1.5 text-xs font-medium bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {loading && !stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse p-5 h-full">
                <div className="h-16 bg-surface rounded-lg" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-5">
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <button onClick={fetchStats} className="text-sm text-navy hover:underline">
                Try again
              </button>
            </div>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.label}
                    onClick={() => card.href && router.push(card.href)}
                    className={`text-left ${card.href ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <Card className="p-5 h-full hover:shadow-raised transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted font-medium uppercase tracking-wider">{card.label}</p>
                          <p className={`text-2xl font-bold mt-1 ${card.label === "Low Stock" && (stats?.lowStockCount ?? 0) > 0 ? "text-red-600" : "text-foreground"}`}>
                            {card.value}
                          </p>
                          {card.change !== undefined && (
                            <p className={`text-xs mt-1 ${card.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {card.change >= 0 ? "+" : ""}{card.change}% vs previous
                            </p>
                          )}
                          {card.label === "Low Stock" && (stats?.lowStockCount ?? 0) > 0 && (
                            <p className="text-[11px] text-red-500 mt-1">View in Inventory →</p>
                          )}
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>

            {/* Orders by Status */}
            {stats && Object.keys(stats.ordersByStatus).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => router.push(`/admin/orders?status=${status}`)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:shadow-sm ${
                      STATUS_COLORS[status] ?? "text-muted bg-white border-border"
                    }`}
                  >
                    {STATUS_LABELS[status] ?? status.replace(/_/g, " ")}
                    <span className="font-bold">{count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Orders */}
            <Card className="overflow-x-auto">
              <div className="px-4 py-3.5 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
              </div>
              {stats && stats.recentOrders.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-navy/[0.04]">
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Order</th>
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Customer</th>
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Type</th>
                      <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Total</th>
                      <th className="text-center px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <ClickableRow key={order.id} href={`/admin/orders/${order.id}`}>
                        <td className="px-4 py-3.5">
                          <span className="text-navy font-medium">#{order.orderNumber.slice(0, 8)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-muted">{order.user.name}</td>
                        <td className="px-4 py-3.5 capitalize text-muted">
                          {order.serviceType.toLowerCase().replace("_", " ")}
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium">₱{Number(order.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-center"><Badge status={order.status as OrderStatus} /></td>
                      </ClickableRow>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState icon="inbox" title="No orders yet" message="Orders will appear here once customers start placing them." />
              )}
            </Card>

            {/* Top Selling Products */}
            {stats && stats.topProducts.length > 0 && (
              <Card className="overflow-x-auto">
                <div className="px-4 py-3.5 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold-dark" /> Top Selling Products
                  </h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-navy/[0.04]">
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Product</th>
                      <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Sold</th>
                      <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((p, i) => (
                      <tr key={p.id} className="border-b border-border/50 text-sm hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted w-5 shrink-0">#{i + 1}</span>
                            {p.imageUrl ? (
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-surface shrink-0 ring-1 ring-border/50">
                                <Image src={p.imageUrl} alt={p.name} fill sizes="32px" className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0 ring-1 ring-border/50">
                                <Package className="w-3.5 h-3.5 text-muted/50" />
                              </div>
                            )}
                            <span className="font-medium text-sm truncate max-w-[200px]">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold">{p.totalSold}</td>
                        <td className="px-4 py-3.5 text-right text-muted">₱{Number(p.revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
