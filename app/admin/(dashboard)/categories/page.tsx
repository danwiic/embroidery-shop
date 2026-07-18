"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Pencil, Plus, Ruler, Trash2 } from "lucide-react";

type Category = { id: number; name: string; slug: string; sizeGuideUrl?: string };

const CategoriesContent = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", sizeGuideUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => setForm({ name: "", slug: "", sizeGuideUrl: "" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body: any = { name: form.name, slug: form.slug };
    if (form.sizeGuideUrl) body.sizeGuideUrl = form.sizeGuideUrl;

    if (editOpen) {
      await fetch(`/api/admin/categories/${editOpen.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/categories", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    }
    setSaving(false);
    setAddOpen(false);
    setEditOpen(null);
    resetForm();
    fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) setDeleteTarget(cat);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    fetchCategories();
  };

  const uploadSizeGuide = async (file: File, cb: (url: string) => void) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: reader.result }),
      });
      const data = await res.json();
      if (data.url) cb(data.url);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <p className="text-sm text-muted py-8 text-center">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Categories</h1>
        <Button onClick={() => { resetForm(); setAddOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      <Card className="overflow-hidden">
        {categories.length === 0 ? (
          <EmptyState icon="inbox" title="No categories yet" message="Create your first category to organize products." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-navy/[0.04]">
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Size Guide</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-border/50 text-sm hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3.5 font-medium">{c.name}</td>
                  <td className="px-4 py-3.5 text-muted">{c.slug}</td>
                  <td className="px-4 py-3.5">
                    {c.sizeGuideUrl ? (
                      <a href={c.sizeGuideUrl} target="_blank" className="inline-flex items-center gap-1 text-navy hover:underline">
                        <Ruler className="w-3.5 h-3.5" /> View
                      </a>
                    ) : (
                      <span className="text-muted/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setForm({ name: c.name, slug: c.slug, sizeGuideUrl: c.sizeGuideUrl ?? "" }); setEditOpen(c); }} className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-navy/5 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteCategory(c.id)} className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={addOpen || !!editOpen} onClose={() => { setAddOpen(false); setEditOpen(null); resetForm(); }}
        title={editOpen ? "Edit Category" : "Add Category"}
        footer={<><Button type="button" variant="outlined" onClick={() => { setAddOpen(false); setEditOpen(null); resetForm(); }}>Cancel</Button>
          <Button type="submit" form="cat-form" disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}
      >
        <form id="cat-form" onSubmit={handleSave} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pants" />
          <Input label="Slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. pants" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Size Guide Image</label>
            {form.sizeGuideUrl ? (
              <div className="relative">
                <div className="relative w-full h-40 border border-border bg-surface"><Image src={form.sizeGuideUrl} alt="Size guide" fill className="object-contain rounded-lg" /></div>
                <button type="button" onClick={() => setForm({ ...form, sizeGuideUrl: "" })} className="absolute top-2 right-2 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-muted hover:text-foreground text-sm">✕</button>
              </div>
            ) : (
              <label className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-navy/50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadSizeGuide(file, (url) => setForm({ ...form, sizeGuideUrl: url }));
                }} />
                <p className="text-sm text-muted">{uploading ? "Uploading..." : "Upload size guide image"}</p>
              </label>
            )}
            <p className="text-xs text-muted/60">Shows measurement points for this category (e.g. waist, inseam for pants)</p>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleting(false); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
};

const AdminCategoriesPage = () => <ErrorBoundary><CategoriesContent /></ErrorBoundary>;
export default AdminCategoriesPage;
