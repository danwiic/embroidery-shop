"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AlertCircle, Eye, EyeOff, Check, X } from "lucide-react";

const RegisterContent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordLongEnough = form.password.length >= 6;
  const passwordsMatch = form.password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-surface">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy tracking-wide">
            JENDAVE
          </h1>
          <p className="text-sm text-muted mt-1">Create your account</p>
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
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoComplete="name"
              placeholder="Your full name"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Input
              label="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
              placeholder="0917xxxxxxx"
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex items-center justify-center h-4 w-4 text-muted hover:text-navy transition-colors leading-none appearance-none p-0 border-0 bg-transparent"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
              {form.password.length > 0 && (
                <p
                  className={`flex items-center gap-1.5 text-xs mt-1.5 ${passwordLongEnough ? "text-green-600" : "text-muted"}`}
                >
                  {passwordLongEnough ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  At least 6 characters
                </p>
              )}
            </div>
            <div>
              <Input
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                  <X className="w-3.5 h-3.5" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword.length > 0 && passwordsMatch && (
                <p className="flex items-center gap-1.5 text-xs mt-1.5 text-green-600">
                  <Check className="w-3.5 h-3.5" />
                  Passwords match
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                loading ||
                !form.name ||
                !form.email ||
                !passwordLongEnough ||
                !passwordsMatch
              }
              className="w-full"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-navy font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

const RegisterPage = () => (
  <ErrorBoundary>
    <RegisterContent />
  </ErrorBoundary>
);
export default RegisterPage;
