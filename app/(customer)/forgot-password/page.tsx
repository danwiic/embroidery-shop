"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SiteLogo } from "@/components/site-logo";
import { AlertCircle, MailCheck } from "lucide-react";

const ForgotPasswordContent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="w-full max-w-sm px-4">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-5 h-5 text-navy" />
            </div>
            <h1 className="text-xl font-bold text-navy">Check Your Email</h1>
            <p className="text-muted mt-2 text-sm">
              If an account with{" "}
              <span className="font-medium text-foreground">{email}</span>{" "}
              exists, we've sent a password reset link.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-sm text-navy-light hover:text-navy underline"
            >
              Back to Sign In
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-surface">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <SiteLogo href="/" className="text-2xl font-bold text-navy tracking-wide" />
          <p className="text-sm text-muted mt-1">
            Enter your email and we'll send you a reset link
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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

const ForgotPasswordPage = () => (
  <ErrorBoundary>
    <ForgotPasswordContent />
  </ErrorBoundary>
);
export default ForgotPasswordPage;
