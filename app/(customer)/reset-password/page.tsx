"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const ResetForm = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Reset failed");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="flex-1 flex items-start justify-center bg-surface pt-24">
        <div className="w-full max-w-sm px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-navy">Invalid Reset Link</h1>
          <p className="text-muted mt-2 text-sm">
            This link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block mt-6 text-sm text-navy-light hover:text-navy underline"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex-1 flex items-start justify-center bg-surface pt-24">
        <div className="w-full max-w-sm px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-navy">Password Reset!</h1>
          <p className="text-muted mt-2 text-sm">
            Your password has been updated successfully.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-start justify-center bg-surface pt-24">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy tracking-wide">
            JENDAVE
          </h1>
          <p className="text-sm text-muted mt-1">
            Choose a new password for your account
          </p>
        </div>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted hover:text-navy transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />
            <Input
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Re-enter your new password"
            />
            <Button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
            <p className="text-center text-sm text-muted">
              <Link
                href="/login"
                className="text-navy-light hover:text-navy underline"
              >
                Back to Sign In
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => (
  <ErrorBoundary>
    <Suspense>
      <ResetForm />
    </Suspense>
  </ErrorBoundary>
);

export default ResetPasswordPage;
