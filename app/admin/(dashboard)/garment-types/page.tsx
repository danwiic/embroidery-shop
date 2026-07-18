"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Pencil, Plus, Trash2 } from "lucide-react";

type GarmentType = { id: number; name: string; slug: string };

const GarmentTypesContent = () => {
  const [types, setTypes] = useState<GarmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<GarmentType | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GarmentType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTypes = () => {
    fetch("/api/admin/garment-types")
      .then((r) => r.json())
      .then(setTypes)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTypes(); }, []);

  const resetForm = () => setForm({ name: "", slug: "" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { name: form.name, slug: form.slug };

    if (editOpen) {
      await fetch(`/api/admin/garment-types/${editOpen.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/garment-types", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    }
    setSaving(false);
    setAddOpen(false);
    setEditOpen(null);
    resetForm();
    fetchTypes();
  };

  const handleDelete = (id: number) => {
    const t = types.find((t) => t.id === id);
    if (t) setDeleteTarget(t);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/garment-types/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    fetchTypes();
  };

  if (loading) return <p className="text-sm text-muted py-8 text-center">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Garment Types</h1>
        <Button onClick={() => { resetForm(); setAddOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Garment Type
        </Button>
      </div>

      <Card className="overflow-hidden">
        {types.length === 0 ? (
          <EmptyState icon="inbox" title="No garment types yet" message="Add garment types used in alteration orders." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-navy/[0.04]">
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Slug</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id} className="border-b border-border/50 text-sm hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3.5 font-medium">{t.name}</td>
                  <td className="px-4 py-3.5 text-muted">{t.slug}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setForm({ name: t.name, slug: t.slug }); setEditOpen(t); }} className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-navy/5 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={addOpen || !!editOpen} onClose={() => { setAddOpen(false); setEditOpen(null); resetForm(); }}
        title={editOpen ? "Edit Garment Type" : "Add Garment Type"}
        footer={<><Button type="button" variant="outlined" onClick={() => { setAddOpen(false); setEditOpen(null); resetForm(); }}>Cancel</Button>
          <Button type="submit" form="gt-form" disabled={saving}>{saving ? "Saving..." : "Save"}</Button></>}
      >
        <form id="gt-form" onSubmit={handleSave} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pants" />
          <Input label="Slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. pants" />
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleting(false); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Garment Type"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
};

const AdminGarmentTypesPage = () => <ErrorBoundary><GarmentTypesContent /></ErrorBoundary>;
export default AdminGarmentTypesPage;
