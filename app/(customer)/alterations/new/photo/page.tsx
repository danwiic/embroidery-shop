"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAlterationWizard } from "@/lib/contexts/alteration-wizard";

const PhotoUpload = () => {
  const router = useRouter();
  const { photo, setPhoto, categoryId } = useAlterationWizard();
  const [image, setImage] = useState<string>(photo);
  const [uploading, setUploading] = useState(false);

  if (!categoryId) {
    router.replace("/alterations/new");
    return null;
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploading(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        setImage(data.url);
      } catch {
        setImage(base64);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (!image) return;
    setPhoto(image);
    router.push("/alterations/new/measurements");
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/alterations/new" className="text-sm text-navy-light hover:text-navy inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-navy mt-2">Upload Garment Photo</h1>
      <p className="text-muted mt-1 text-sm">
        Take a clear photo of the garment you want altered
      </p>

      <div className="mt-6">
        {image ? (
          <div className="space-y-4">
            <div className="relative w-full h-80 border border-border"><Image src={image} alt="Garment" fill sizes="(max-width: 768px) 100vw, 600px" className="object-contain rounded-xl" /></div>
            <button onClick={() => setImage("")} className="text-sm text-muted hover:text-navy">
              Remove photo
            </button>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-navy transition-colors">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <p className="text-muted text-sm">{uploading ? "Uploading..." : "Click to select a photo"}</p>
          </label>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!image}
        className="w-full mt-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light disabled:opacity-50 transition-colors"
      >
        Next: Measurements
      </button>
    </div>
  );
};

const AlterationPhotoPage = () => (
  <ErrorBoundary>
    <PhotoUpload />
  </ErrorBoundary>
);

export default AlterationPhotoPage;
