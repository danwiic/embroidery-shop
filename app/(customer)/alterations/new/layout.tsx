"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlterationWizardProvider } from "@/lib/contexts/alteration-wizard";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Garment", path: "/alterations/new" },
  { label: "Photo", path: "/alterations/new/photo" },
  { label: "Measurements", path: "/alterations/new/measurements" },
  { label: "Review", path: "/alterations/new/review" },
  { label: "Payment", path: "/alterations/new/payment" },
];

const StepBar = () => {
  const pathname = usePathname();
  const current = STEPS.findIndex((s) => s.path === pathname);
  if (current === -1) return null;

  return (
    <div className="max-w-lg mx-auto pt-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    done
                      ? "bg-navy text-white"
                      : active
                        ? "bg-navy text-white ring-2 ring-offset-2 ring-navy/30"
                        : "bg-surface text-muted border border-border"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-medium whitespace-nowrap transition-colors ${
                    active ? "text-navy" : done ? "text-navy/60" : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-px mx-1 sm:mx-2 mb-5 transition-colors ${
                    done ? "bg-navy" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <AlterationWizardProvider>
      <StepBar />
      {children}
    </AlterationWizardProvider>
  );
};

export default Layout;
