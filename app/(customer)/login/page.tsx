"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SiteLogo } from "@/components/site-logo";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const LoginContent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchParams] = useState(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""));
  const callbackUrl = searchParams.get("callbackUrl") || "";

  useEffect(() => {
    if (session) router.replace(callbackUrl || "/");
  }, [session, router, callbackUrl]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const dest = callbackUrl || (session?.user?.role === "ADMIN" ? "/admin" : "/");
    router.push(dest);
    router.refresh();
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-surface">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <SiteLogo href="/" className="text-2xl font-bold text-navy tracking-wide" />
          <p className="text-sm text-muted mt-1">Sign in to your account</p>
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex items-center justify-center h-4 w-4 text-muted hover:text-navy transition-colors leading-none appearance-none p-0 border-0 bg-transparent"
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
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-muted hover:text-navy transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-navy font-medium hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

const LoginPage = () => (
  <ErrorBoundary>
    <LoginContent />
  </ErrorBoundary>
);
export default LoginPage;
