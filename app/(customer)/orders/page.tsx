"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ArrowRight } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

type Order = {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
};

const OrdersContent = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-gold/30" />
        <h1 className="text-xl font-semibold text-navy">My Orders</h1>
        <div className="h-px flex-1 bg-gold/30" />
      </div>

      {orders.length === 0 ? (
        <Card className="p-6 md:p-12">
          <EmptyState
            icon="orders"
            title="No orders yet"
            message="Place your first order to see it here."
            action={{ label: "Browse Products", href: "/products" }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="group block">
              <div className="bg-white rounded-xl shadow-card p-5 hover:shadow-raised transition-all border border-transparent hover:border-gold/30">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground group-hover:text-navy transition-colors">
                        Order #{order.orderNumber.slice(0, 8)}
                      </p>
                      <ArrowRight className="w-3.5 h-3.5 text-muted/30 group-hover:text-gold-dark group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-muted mt-1 capitalize">
                      {order.serviceType.toLowerCase().replace("_", " ")} &middot; {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <Badge status={order.status as OrderStatus} />
                    <p className="text-sm font-semibold text-gold-dark mt-1.5">₱{Number(order.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const OrdersPage = () => (
  <ErrorBoundary>
    <OrdersContent />
  </ErrorBoundary>
);

export default OrdersPage;
