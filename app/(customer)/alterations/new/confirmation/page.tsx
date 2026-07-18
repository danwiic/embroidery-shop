"use client";

import { Check } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Order = {
  id: string;
  orderNumber: string;
  estimatedCompletion?: string;
  pickupDate?: string;
};

const Confirmation = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then(setOrder)
        .catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="mt-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy mt-4">Order Submitted!</h1>
        <p className="text-muted mt-2">
          Your alteration order has been received. We'll notify you when it's being processed.
        </p>

        {order && (
          <div className="mt-6 bg-white rounded-xl border border-border p-5 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Order Number</span>
              <span className="font-medium">#{order.orderNumber.slice(0, 8)}</span>
            </div>
            {order.estimatedCompletion && (
              <div className="flex justify-between">
                <span className="text-muted">Estimated Completion</span>
                <span>{new Date(order.estimatedCompletion).toLocaleDateString()}</span>
              </div>
            )}
            {order.pickupDate && (
              <div className="flex justify-between">
                <span className="text-muted">Pickup Schedule</span>
                <span>{new Date(order.pickupDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 space-x-4">
          <Link
            href="/orders"
            className="inline-block px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light"
          >
            My Orders
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 border border-navy text-navy rounded-lg text-sm font-medium hover:bg-navy hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const AlterationConfirmationPage = () => (
  <ErrorBoundary>
    <Suspense>
      <Confirmation />
    </Suspense>
  </ErrorBoundary>
);

export default AlterationConfirmationPage;
