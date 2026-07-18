"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/lib/contexts/toast";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>
    <ToastProvider>{children}</ToastProvider>
  </SessionProvider>
);
