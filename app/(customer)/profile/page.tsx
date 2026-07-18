"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/lib/contexts/toast";
import { User, Save, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";

const ProfileContent = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile({ name: data.name ?? "", email: data.email ?? "", phone: data.phone ?? "" });
      })
      .catch(() => addToast("error", "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [session, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update");
      }

      await update();
      addToast("success", "Profile updated successfully");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast("error", "New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      addToast("error", "New password must be at least 6 characters");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update password");
      }

      addToast("success", "Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 animate-pulse">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-surface rounded-full" />
            <div className="space-y-2">
              <div className="h-5 bg-surface rounded w-40" />
              <div className="h-4 bg-surface rounded w-60" />
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-surface rounded-lg" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-gold/30" />
        <h1 className="text-xl font-semibold text-navy">My Account</h1>
        <div className="h-px flex-1 bg-gold/30" />
      </div>

      {/* Profile Info Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{profile.name || "User"}</p>
            <p className="text-xs text-muted">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Profile Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your full name"
            />
            <Input
              label="Email"
              type="email"
              required
              value={profile.email}
              disabled
              placeholder="your@email.com"
              className="opacity-60 cursor-not-allowed"
            />
          </div>
          <Input
            label="Phone Number"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="+63 XXX XXX XXXX"
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={savingProfile}>
              <Save className="w-4 h-4 mr-1.5" />
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Password Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showPasswords ? "text" : "password"}
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              placeholder="Enter current password"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Input
                label="New Password"
                type={showPasswords ? "text" : "password"}
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showPasswords ? "text" : "password"}
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
              />
            </div>
          </div>
          {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
            <p className="text-xs text-red-500 -mt-1">Passwords do not match</p>
          )}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-navy transition-colors"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPasswords ? "Hide passwords" : "Show passwords"}
            </button>
            <Button type="submit" disabled={savingPassword}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${savingPassword ? "animate-spin" : ""}`} />
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const ProfilePage = () => (
  <ErrorBoundary>
    <ProfileContent />
  </ErrorBoundary>
);

export default ProfilePage;
