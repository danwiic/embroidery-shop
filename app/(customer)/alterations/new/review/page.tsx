"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAlterationWizard } from "@/lib/contexts/alteration-wizard";

const GARMENT_NAMES: Record<string, string> = {
  pants: "Pants",
  "military-uniform": "Military Uniform",
  shirt: "Shirt",
  shorts: "Shorts",
};

const FIT_LABELS: Record<string, string> = {
  SLIM: "Slim Fit",
  REGULAR: "Regular Fit",
  RELAXED: "Relaxed Fit",
  WIDE: "Wide Fit",
};

const ReviewForm = () => {
  const router = useRouter();
  const { slug, photo, fitPreference, measurements, pickupDate, setPickupDate, serviceFee, setServiceFee, estimatedCompletion, setEstimatedCompletion, categoryId } = useAlterationWizard();

  if (!categoryId) {
    router.replace("/alterations/new");
    return null;
  }

  const [localPickup, setLocalPickup] = useState(pickupDate);
  const [localServiceFee, setLocalServiceFee] = useState(serviceFee);
  const [localEstimatedCompletion, setLocalEstimatedCompletion] = useState(estimatedCompletion);

  const handleNext = () => {
    setPickupDate(localPickup);
    setServiceFee(localServiceFee);
    setEstimatedCompletion(localEstimatedCompletion);
    router.push("/alterations/new/payment");
  };

  const nextAvailableDate = new Date();
  nextAvailableDate.setDate(nextAvailableDate.getDate() + 3);

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/alterations/new/measurements" className="text-sm text-navy-light hover:text-navy inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-navy mt-2">Review Your Order</h1>

      <div className="mt-6 bg-white rounded-xl border border-border p-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Garment</span>
          <span>{GARMENT_NAMES[slug] ?? slug}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Fit</span>
          <span>{FIT_LABELS[fitPreference] ?? fitPreference}</span>
        </div>
        <div>
          <span className="text-muted">Photo:</span>
          {photo && (
            <div className="relative h-32 mt-2"><Image src={photo} alt="Garment" fill sizes="(max-width: 768px) 100vw, 600px" className="object-contain rounded-lg" /></div>
          )}
        </div>
        {Object.keys(measurements).length > 0 && (
          <div>
            <span className="text-muted">Measurements:</span>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {Object.entries(measurements).map(([key, val]) => (
                <p key={key} className="capitalize">
                  {key.replace(/([A-Z])/g, " $1")}: {val} cm
                </p>
              ))}
            </div>
          </div>
        )}
        <div className="border-t border-border pt-3">
          <label className="text-sm font-medium text-navy">Pickup Date</label>
          <input
            type="date"
            value={localPickup}
            onChange={(e) => setLocalPickup(e.target.value)}
            min={nextAvailableDate.toISOString().split("T")[0]}
            required
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div className="border-t border-border pt-3">
          <label className="text-sm font-medium text-navy">Estimated Completion</label>
          <input
            type="date"
            value={localEstimatedCompletion}
            onChange={(e) => setLocalEstimatedCompletion(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div className="border-t border-border pt-3 flex justify-between font-bold text-navy">
          <span>Service Fee</span>
          <span>₱{Number(localServiceFee).toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!localPickup || !localEstimatedCompletion}
        className="w-full mt-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light disabled:opacity-50 transition-colors"
      >
        Next: Payment
      </button>
    </div>
  );
};

const AlterationReviewPage = () => (
  <ErrorBoundary>
    <ReviewForm />
  </ErrorBoundary>
);

export default AlterationReviewPage;
