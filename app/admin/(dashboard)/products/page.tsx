"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, Package, Pencil, Trash2, X } from "lucide-react";

type Category = { id: number; name: string };
type ProductImage = { id: number; url: string; order: number };

type ProductVariant = { id: number; size?: string; color?: string; price?: string | null; stock: number };

type Product = {
  id: number;
  name: string;
  price: string;
  stock: number;
  color?: string;
  size?: string;
  description?: string;
  imageUrl?: string;
  categoryId: number;
  images: ProductImage[];
  category: Category;
  variants?: ProductVariant[];
};

const emptyForm = () => ({
  name: "", categoryId: "", price: "", color: "", size: "", description: "", imageUrl: "", images: [] as string[],
  variants: [] as { size: string; color: string; price: string }[],
});

const ProductsContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!editOpen;

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const deleteProduct = async (id: number) => {
    const p = products.find((p) => p.id === id);
    if (p) setDeleteTarget(p);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    fetchProducts();
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async () => {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await res.json();
        resolve(data.url ?? null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body: any = {
      name: form.name,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      color: form.color || undefined,
      size: form.size || undefined,
      description: form.description || undefined,
      imageUrl: form.imageUrl || form.images[0] || undefined,
      variants: form.variants.length > 0 ? form.variants.map((v) => ({
        size: v.size || undefined,
        color: v.color || undefined,
        price: v.price ? Number(v.price) : undefined,
      })) : undefined,
    };

    const res = isEdit
      ? await fetch(`/api/admin/products/${editOpen.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    if (res.ok) {
      // Upload additional images
      if (!isEdit) {
        const created = await res.json();
        for (const url of form.images) {
          if (url !== form.imageUrl) {
            await fetch(`/api/admin/products/${created.id}/images`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url, order: form.images.indexOf(url) }),
            });
          }
        }
      }
      setAddOpen(false);
      setEditOpen(null);
      setForm(emptyForm());
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to save product");
    }
    setSaving(false);
  };

  const openEdit = (p: Product) => {
    setEditOpen(p);
    setForm({
      name: p.name,
      categoryId: String(p.categoryId),
      price: String(p.price),
      color: p.color ?? "",
      size: p.size ?? "",
      description: p.description ?? "",
      imageUrl: p.imageUrl ?? "",
      images: p.images?.map((i) => i.url) ?? [],
      variants: p.variants?.map((v) => ({ size: v.size ?? "", color: v.color ?? "", price: v.price ?? "" })) ?? [],
    });
  };

  const openAdd = () => {
    setEditOpen(null);
    setForm(emptyForm());
    setAddOpen(true);
  };

  if (loading) return <p className="text-sm text-muted py-8 text-center">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Products</h1>
        <Button onClick={openAdd}>+ Add Product</Button>
      </div>

      <Card className="overflow-hidden mt-4">
        {products.length === 0 ? (
          <EmptyState icon="products" title="No products yet" message="Add your first product to start selling." action={{ label: "Add Product", onClick: openAdd }} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-navy/[0.04]">
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Color</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Size</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Price</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Stock</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/50 text-sm hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg bg-surface overflow-hidden shrink-0 ring-1 ring-border/50">
                        {p.imageUrl ? (
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted/50">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{p.category.name}</td>
                  <td className="px-4 py-3.5 text-muted">{p.color ?? "—"}</td>
                  <td className="px-4 py-3.5 text-muted">{p.size ?? "—"}</td>
                  <td className="px-4 py-3.5 text-right">₱{Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-right">{p.stock}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-navy/5 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={addOpen || isEdit} onClose={() => { setAddOpen(false); setEditOpen(null); setForm(emptyForm()); }}
        title={isEdit ? "Edit Product" : "Add Product"}
        footer={<>
          <Button type="button" variant="outlined" onClick={() => { setAddOpen(false); setEditOpen(null); setForm(emptyForm()); }}>Cancel</Button>
          <Button type="submit" form="product-form" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </>}
      >
        <form id="product-form" onSubmit={handleSave} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Category</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30">
              <option value="">Select...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Price" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="e.g. Navy" />
            <Input label="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. M" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Product description..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Images</label>
            <div className="grid grid-cols-3 gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-surface">
                  <div className="relative w-full h-full"><Image src={url} alt="" fill className="object-cover" /></div>
                  <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                    className="absolute top-1 right-1 bg-white/80 rounded-full w-5 h-5 flex items-center justify-center text-muted hover:text-red-600 text-xs">✕</button>
                </div>
              ))}
              <label className="aspect-square flex items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-navy/50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadImage(file);
                  if (url) setForm({ ...form, images: [...form.images, url] });
                }} />
                <ImagePlus className="w-5 h-5 text-muted" />
              </label>
            </div>
            <p className="text-xs text-muted/60">First image is the main product photo</p>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Variants</label>
               <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { size: "", color: "", price: "" }] })}
                className="text-xs text-navy hover:underline">+ Add Variant</button>
            </div>
            {form.variants.length === 0 ? (
              <p className="text-xs text-muted/60">No variants — uses product-level color/size/price/stock.</p>
            ) : (
              <div className="space-y-3">
                {form.variants.map((v, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-border bg-surface/50">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input placeholder="Size" value={v.size} onChange={(e) => {
                        const next = [...form.variants];
                        next[i] = { ...next[i], size: e.target.value };
                        setForm({ ...form, variants: next });
                      }} className="px-2.5 py-1.5 border border-border rounded text-xs" />
                      <input placeholder="Color" value={v.color} onChange={(e) => {
                        const next = [...form.variants];
                        next[i] = { ...next[i], color: e.target.value };
                        setForm({ ...form, variants: next });
                      }} className="px-2.5 py-1.5 border border-border rounded text-xs" />
                      <input type="number" step="0.01" placeholder="Price" value={v.price} onChange={(e) => {
                        const next = [...form.variants];
                        next[i] = { ...next[i], price: e.target.value };
                        setForm({ ...form, variants: next });
                      }} className="px-2.5 py-1.5 border border-border rounded text-xs" />
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })}
                      className="text-red-500 hover:text-red-700 text-xs mt-1">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleting(false); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
};

const AdminProductsPage = () => <ErrorBoundary><ProductsContent /></ErrorBoundary>;
export default AdminProductsPage;
