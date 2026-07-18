"use client";

import { ArrowLeft } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAlterationWizard } from "@/lib/contexts/alteration-wizard";

const PaymentForm = () => {
  const router = useRouter();
  const { garmentTypeId, photo, fitPreference, pickupDate, serviceFee, estimatedCompletion, measurements, paymentMethod, paymentRef, setPaymentMethod, setPaymentRef, reset } = useAlterationWizard();
  const [localMethod, setLocalMethod] = useState(paymentMethod);
  const [localRef, setLocalRef] = useState(paymentRef);
  const [submitting, setSubmitting] = useState(false);

  if (!garmentTypeId) {
    router.replace("/alterations/new");
    return null;
  }

  const handleSubmit = async () => {
    if (!localRef.trim()) return;
    setSubmitting(true);
    setPaymentMethod(localMethod);
    setPaymentRef(localRef);

    const body = {
      garmentTypeId,
      garmentPhotoUrl: photo,
      fitPreference,
      pickupDate,
      serviceFee: Number(serviceFee),
      paymentMethod: localMethod,
      paymentRef: localRef,
      estimatedCompletion,
      measurements: Object.fromEntries(
        Object.entries(measurements).map(([k, v]) => [k, v ? Number(v) : null]),
      ),
    };

    const res = await fetch("/api/orders/alteration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const order = await res.json();
      reset();
      router.push(`/alterations/new/confirmation?id=${order.id}`);
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to submit order");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/alterations/new/review" className="text-sm text-navy-light hover:text-navy inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-navy mt-2">Payment</h1>
      <p className="text-muted text-sm mt-1">
        Send payment to the shop&apos;s GCash or Maya, then enter the reference number.
      </p>

      <div className="mt-6 bg-white rounded-xl border border-border p-5 space-y-4">
        <div className="flex gap-3">
          {["GCash", "Maya"].map((method) => (
            <label
              key={method}
              className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium cursor-pointer text-center transition-colors ${
                localMethod === method
                  ? "border-navy bg-navy/5 text-navy"
                  : "border-border text-muted hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="pm"
                value={method}
                checked={localMethod === method}
                onChange={(e) => setLocalMethod(e.target.value)}
                className="sr-only"
              />
              {method}
            </label>
          ))}
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Payment Reference Number</label>
          <input
            type="text"
            value={localRef}
            onChange={(e) => setLocalRef(e.target.value)}
            placeholder="Enter reference number"
            required
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <p className="text-lg font-bold text-navy">
          Total: ₱{Number(serviceFee).toFixed(2)}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!localRef || submitting}
        className="w-full mt-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light disabled:opacity-50 transition-colors"
      >
        {submitting ? "Submitting..." : "Submit Order"}
      </button>
    </div>
  );
};

const AlterationPaymentPage = () => (
  <ErrorBoundary>
    <PaymentForm />
  </ErrorBoundary>
);

export default AlterationPaymentPage;
