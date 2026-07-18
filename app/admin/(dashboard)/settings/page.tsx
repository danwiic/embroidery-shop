"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/lib/contexts/toast";
import { Save } from "lucide-react";

const SettingsContent = () => {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    shopName: "",
    shopEmail: "",
    shopPhone: "",
    shopAddress: "",
    aboutText: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      addToast("success", "Settings saved successfully");
    } catch {
      addToast("error", "Failed to save settings");
    }
    setSaving(false);
  };

  if (loading) return <p className="text-sm text-muted py-8 text-center">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Shop Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-1" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <Input label="Shop Name" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="Jendave Embroidery Shop" />
        <Input label="Contact Email" type="email" value={form.shopEmail} onChange={(e) => setForm({ ...form, shopEmail: e.target.value })} placeholder="shop@jendave.com" />
        <Input label="Contact Phone" value={form.shopPhone} onChange={(e) => setForm({ ...form, shopPhone: e.target.value })} placeholder="+63 912 345 6789" />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">Shop Address</label>
          <textarea
            value={form.shopAddress}
            onChange={(e) => setForm({ ...form, shopAddress: e.target.value })}
            placeholder="123 Rizal St., Manila, Philippines"
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-navy/30"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">About Text</label>
          <textarea
            value={form.aboutText}
            onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
            placeholder="Tell customers about your shop..."
            rows={5}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-navy/30"
          />
        </div>
      </Card>
    </div>
  );
};

const AdminSettingsPage = () => <ErrorBoundary><SettingsContent /></ErrorBoundary>;
export default AdminSettingsPage;
