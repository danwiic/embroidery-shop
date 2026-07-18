"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Badge } from "@/components/ui/badge";
import { ClickableRow } from "@/components/admin/clickable-row";
import { Package, ShoppingBag, TrendingUp, DollarSign, Calendar, RefreshCw } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

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
}

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

const DashboardPage = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse p-5">
                <div className="h-16 bg-surface rounded-lg" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-5">
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={fetchStats}
                className="text-sm text-navy hover:underline"
              >
                Try again
              </button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.label} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted font-medium uppercase tracking-wider">{card.label}</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">{card.value}</p>
                        {card.change !== undefined && (
                          <p className={`text-xs mt-1 ${card.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {card.change >= 0 ? "+" : ""}{card.change}% vs previous period
                          </p>
                        )}
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card>
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
                    {stats.recentOrders.slice(0, 10).map((order) => (
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
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
