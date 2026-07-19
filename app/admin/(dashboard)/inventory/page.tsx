"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageLoader } from "@/components/ui/page-loader";
import { ClipboardList, Package } from "lucide-react";

type Variant = {
  id: number;
  size?: string;
  color?: string;
  price?: string | null;
  stock: number;
};
type Product = {
  id: number;
  name: string;
  stock: number;
  price: string;
  color?: string;
  size?: string;
  category: { name: string };
  variants?: Variant[];
};

const BASE_SENTINEL = -1;

const InventoryContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [change, setChange] = useState("");
  const [note, setNote] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalStock = (p: Product) =>
    p.variants && p.variants.length > 0
      ? p.variants.reduce((sum, v) => sum + v.stock, 0) +
        (p.color || p.size ? p.stock : 0)
      : p.stock;

  const handleManage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !change) return;
    setSaving(true);
    const qty = parseInt(change);
    if (isNaN(qty) || qty <= 0) return;
    const finalChange = mode === "remove" ? -qty : qty;
    const res = await fetch(`/api/admin/products/${selected.id}/stock-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        change: finalChange,
        note: note.trim(),
        variantId:
          selectedVariantId && selectedVariantId !== BASE_SENTINEL
            ? selectedVariantId
            : undefined,
      }),
    });
    if (res.ok) {
      setManageOpen(false);
      setChange("");
      setNote("");
      fetchProducts();
    }
    setSaving(false);
  };

  const hasBase = (p: Product | null) => !!(p?.color || p?.size);

  const openManage = (p: Product, m: "add" | "remove") => {
    setSelected(p);
    setMode(m);
    setChange("");
    setNote("");
    if (p.variants && p.variants.length > 0) {
      setSelectedVariantId(p.variants[0].id);
    } else if (hasBase(p)) {
      setSelectedVariantId(BASE_SENTINEL);
    } else {
      setSelectedVariantId(null);
    }
    setManageOpen(true);
  };

  if (loading)
    return <PageLoader />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-5 h-5 text-muted" />
        <h1 className="text-xl font-semibold text-foreground">Inventory</h1>
      </div>

      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <EmptyState
            icon="products"
            title="No products yet"
            message="Add products to start tracking inventory."
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-navy/[0.04]">
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">
                  Variants
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 text-sm hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-3.5 font-medium">{p.name}</td>
                  <td className="px-4 py-3.5 text-muted">{p.category.name}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`font-semibold ${p.stock > 10 ? "text-emerald-600" : p.stock > 0 ? "text-amber-600" : "text-red-600"}`}
                    >
                      {totalStock(p)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-left text-xs text-muted">
                    {p.variants && p.variants.length > 0
                      ? [
                          ...(p.color || p.size
                            ? [
                                `${[p.size, p.color].filter(Boolean).join(" / ")} (${p.stock})`,
                              ]
                            : []),
                          ...p.variants.map(
                            (v) =>
                              `${v.size ?? ""}${v.size && v.color ? " / " : ""}${v.color ?? ""} (${v.stock})`,
                          ),
                        ].join(", ")
                      : p.color || p.size
                        ? `${[p.size, p.color].filter(Boolean).join(" / ")} (${p.stock})`
                        : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => openManage(p, "add")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-navy border border-navy/30 hover:bg-navy/5 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" /> Manage Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={!!manageOpen}
        onClose={() => setManageOpen(false)}
        title={`Manage Stock — ${selected?.name ?? ""}`}
        footer={
          <>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setManageOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="manage-form"
              disabled={
                saving ||
                !change ||
                (mode === "remove" &&
                  (() => {
                    const currentStock =
                      selectedVariantId !== null &&
                      selectedVariantId !== BASE_SENTINEL
                        ? (selected?.variants?.find(
                            (v) => v.id === selectedVariantId,
                          )?.stock ?? 0)
                        : (selected?.stock ?? 0);
                    return (parseInt(change) || 0) > currentStock;
                  })())
              }
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <form id="manage-form" onSubmit={handleManage} className="space-y-4">
          {(selected?.variants && selected.variants.length > 0) ||
          hasBase(selected) ? (
            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
                Stock target
              </legend>
              {hasBase(selected) && selected?.color && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="variant"
                    checked={selectedVariantId === BASE_SENTINEL}
                    onChange={() => setSelectedVariantId(BASE_SENTINEL)}
                    className="accent-navy"
                  />
                  {[selected?.size, selected?.color]
                    .filter(Boolean)
                    .join(" / ")}{" "}
                  (base, {selected?.stock})
                </label>
              )}
              {selected?.variants?.map((v) => (
                <label
                  key={v.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="radio"
                    name="variant"
                    checked={selectedVariantId === v.id}
                    onChange={() => {
                      setSelectedVariantId(v.id);
                    }}
                    className="accent-navy"
                  />
                  {[v.size, v.color].filter(Boolean).join(" / ")} ({v.stock})
                </label>
              ))}
            </fieldset>
          ) : null}
          {selected?.variants &&
            selected.variants.length > 0 &&
            selectedVariantId === null && (
              <p className="text-xs text-red-600">
                Select a variant to manage stock.
              </p>
            )}
          <p className="text-sm text-muted">
            Current stock:{" "}
            <span className="font-semibold text-foreground">
              {selectedVariantId !== null && selectedVariantId !== BASE_SENTINEL
                ? (selected?.variants?.find((v) => v.id === selectedVariantId)
                    ?.stock ?? 0)
                : (selected?.stock ?? 0)}
            </span>
          </p>
          <p className="text-sm text-muted">
            After change:{" "}
            <span className="font-semibold text-foreground">
              {(selectedVariantId !== null &&
              selectedVariantId !== BASE_SENTINEL
                ? (selected?.variants?.find((v) => v.id === selectedVariantId)
                    ?.stock ?? 0)
                : (selected?.stock ?? 0)) +
                (mode === "add" ? 1 : -1) * (parseInt(change) || 0)}
            </span>
          </p>
          <div className="flex gap-2">
            {(["add", "remove"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  mode === m
                    ? m === "add"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-red-400 bg-red-50 text-red-700"
                    : "border-border text-muted bg-white"
                }`}
              >
                {m === "add" ? "+ Add" : "− Remove"}
              </button>
            ))}
          </div>
          <Input
            label="Quantity"
            type="number"
            min="1"
            required
            value={change}
            onChange={(e) => setChange(e.target.value)}
            placeholder="e.g. 10"
          />
          {mode === "remove" &&
            (() => {
              const currentStock =
                selectedVariantId !== null &&
                selectedVariantId !== BASE_SENTINEL
                  ? (selected?.variants?.find((v) => v.id === selectedVariantId)
                      ?.stock ?? 0)
                  : (selected?.stock ?? 0);
              return (
                (parseInt(change) || 0) > currentStock && (
                  <p className="text-xs text-red-600">
                    Cannot remove more than current stock ({currentStock}).
                  </p>
                )
              );
            })()}
          <Input
            label="Reason (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              mode === "add"
                ? "e.g. Delivery from supplier"
                : "e.g. Damaged, returned"
            }
          />
        </form>
      </Modal>
    </div>
  );
};

const AdminInventoryPage = () => (
  <ErrorBoundary>
    <InventoryContent />
  </ErrorBoundary>
);
export default AdminInventoryPage;
