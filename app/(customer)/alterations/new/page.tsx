"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAlterationWizard } from "@/lib/contexts/alteration-wizard";

type GarmentType = { id: number; name: string; slug: string };

const AlterationNewPage = () => {
  const router = useRouter();
  const { setGarmentType, garmentTypeId } = useAlterationWizard();
  const [types, setTypes] = useState<GarmentType[]>([]);
  const [selected, setSelected] = useState<number>(garmentTypeId);

  useEffect(() => {
    fetch("/api/admin/garment-types")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error("Invalid response");
        setTypes(data);
      })
      .catch(() => {
        setTypes([
          { id: 1, name: "Pants", slug: "pants" },
          { id: 2, name: "Military Uniform", slug: "military-uniform" },
          { id: 3, name: "Shirt", slug: "shirt" },
          { id: 4, name: "Shorts", slug: "shorts" },
        ]);
      });
  }, []);

  const handleNext = () => {
    if (!selected) return;
    const t = types.find((t) => t.id === selected);
    setGarmentType(selected, t?.slug ?? "");
    router.push("/alterations/new/photo");
  };

  return (
    <div className="max-w-lg mx-auto py-6">
      <h1 className="text-2xl font-bold text-navy">Alteration Service</h1>
      <p className="text-muted mt-1 text-sm">Select the garment type to alter</p>

      <div className="grid grid-cols-2 gap-4 mt-6">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`p-6 rounded-xl border text-center transition-colors ${
              selected === t.id
                ? "border-navy bg-navy/5 text-navy"
                : "border-border bg-white text-muted hover:bg-gray-50"
            }`}
          >
            <p className="font-medium">{t.name}</p>
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!selected}
        className="w-full mt-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light disabled:opacity-50 transition-colors"
      >
        Next: Upload Photo
      </button>
    </div>
  );
};

const AlterationNewPageWrapper = () => (
  <ErrorBoundary>
    <AlterationNewPage />
  </ErrorBoundary>
);

export default AlterationNewPageWrapper;
