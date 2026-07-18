"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAlterationWizard } from "@/lib/contexts/alteration-wizard";

const MEASUREMENT_FIELDS: Record<string, { key: string; label: string }[]> = {
  PANTS: [
    { key: "waist", label: "Waist (cm)" },
    { key: "hip", label: "Hip (cm)" },
    { key: "thighWidth", label: "Thigh Width (cm)" },
    { key: "inseam", label: "Inseam (cm)" },
    { key: "length", label: "Length (cm)" },
    { key: "legOpening", label: "Leg Opening Width (cm)" },
  ],
  SHIRT: [
    { key: "shoulder", label: "Shoulder (cm)" },
    { key: "chest", label: "Chest (cm)" },
    { key: "waist", label: "Waist (cm)" },
    { key: "sleeveLength", label: "Sleeve Length (cm)" },
    { key: "shirtLength", label: "Shirt Length (cm)" },
  ],
  SHORTS: [
    { key: "waist", label: "Waist (cm)" },
    { key: "hip", label: "Hip (cm)" },
    { key: "length", label: "Length (cm)" },
  ],
  MILITARY_UNIFORM: [
    { key: "shoulder", label: "Shoulder (cm)" },
    { key: "chest", label: "Chest (cm)" },
    { key: "waist", label: "Waist (cm)" },
    { key: "sleeveLength", label: "Sleeve Length (cm)" },
    { key: "shirtLength", label: "Uniform Length (cm)" },
    { key: "pantsWaist", label: "Pants Waist (cm)" },
    { key: "pantsLength", label: "Pants Length (cm)" },
  ],
};

const FIT_OPTIONS = [
  { value: "SLIM", label: "Slim Fit" },
  { value: "REGULAR", label: "Regular Fit" },
  { value: "RELAXED", label: "Relaxed Fit" },
  { value: "WIDE", label: "Wide Fit" },
];

const GARMENT_SLUG_TO_KEY: Record<string, string> = {
  pants: "PANTS",
  "military-uniform": "MILITARY_UNIFORM",
  shirt: "SHIRT",
  shorts: "SHORTS",
};

const MeasurementsForm = () => {
  const router = useRouter();
  const { garmentTypeId, slug, photo, measurements: savedMeasurements, fitPreference: savedFit, setMeasurements, setFitPreference } = useAlterationWizard();

  if (!garmentTypeId) {
    router.replace("/alterations/new");
    return null;
  }

  const fieldKey = GARMENT_SLUG_TO_KEY[slug] ?? "PANTS";
  const fields = MEASUREMENT_FIELDS[fieldKey] ?? MEASUREMENT_FIELDS.PANTS;
  const needsFit = fieldKey === "PANTS";

  const [measurements, setLocalMeasurements] = useState<Record<string, string>>(savedMeasurements);
  const [fitPreference, setLocalFit] = useState(savedFit || "REGULAR");
  const [sizeGuideUrl, setSizeGuideUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats) => {
        const match = cats.find((c: any) => c.slug === slug);
        if (match?.sizeGuideUrl) setSizeGuideUrl(match.sizeGuideUrl);
      });
  }, [slug]);

  const allFilled = fields.every((f) => measurements[f.key]?.trim());

  const handleNext = () => {
    if (!allFilled) return;
    setMeasurements(measurements);
    setFitPreference(fitPreference);
    router.push("/alterations/new/review");
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/alterations/new/photo" className="text-sm text-navy-light hover:text-navy inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-navy mt-2">Enter Measurements</h1>

      {sizeGuideUrl && (
        <div className="mt-4">
          <p className="text-xs text-muted font-medium mb-2 uppercase tracking-wider">Size Guide</p>
          <div className="relative w-full max-h-64 border border-border bg-surface"><Image src={sizeGuideUrl} alt="Size guide" fill className="object-contain rounded-lg" /></div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium text-navy">{f.label}</label>
            <input
              type="number"
              step="0.1"
              value={measurements[f.key] ?? ""}
              onChange={(e) =>
                setLocalMeasurements({ ...measurements, [f.key]: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
        ))}

        {needsFit && (
          <div>
            <label className="text-sm font-medium text-navy">Fit Preference</label>
            <select
              value={fitPreference}
              onChange={(e) => setLocalFit(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              {FIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!allFilled}
        className="w-full mt-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {allFilled ? "Next: Review" : "Fill in all measurements"}
      </button>
    </div>
  );
};

const AlterationMeasurementsPage = () => (
  <ErrorBoundary>
    <MeasurementsForm />
  </ErrorBoundary>
);

export default AlterationMeasurementsPage;
