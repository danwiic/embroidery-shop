"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type WizardState = {
  categoryId: number;
  slug: string;
  photo: string;
  measurements: Record<string, string>;
  fitPreference: string;
  pickupDate: string;
  serviceFee: string;
  estimatedCompletion: string;
  paymentMethod: string;
  paymentRef: string;
};

type WizardContext = WizardState & {
  setCategory: (id: number, slug: string) => void;
  setPhoto: (url: string) => void;
  setMeasurements: (m: Record<string, string>) => void;
  setFitPreference: (v: string) => void;
  setPickupDate: (v: string) => void;
  setServiceFee: (v: string) => void;
  setEstimatedCompletion: (v: string) => void;
  setPaymentMethod: (v: string) => void;
  setPaymentRef: (v: string) => void;
  reset: () => void;
};

const initial: WizardState = {
  categoryId: 0,
  slug: "",
  photo: "",
  measurements: {},
  fitPreference: "REGULAR",
  pickupDate: "",
  serviceFee: "250",
  estimatedCompletion: "",
  paymentMethod: "GCash",
  paymentRef: "",
};

const Ctx = createContext<WizardContext | null>(null);

export const AlterationWizardProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WizardState>(initial);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.resizingFee) {
          setState((s) => ({ ...s, serviceFee: data.resizingFee }));
        }
      })
      .catch(() => {});
  }, []);

  const ctx: WizardContext = {
    ...state,
    setCategory: (id, slug) => setState((s) => ({ ...s, categoryId: id, slug })),
    setPhoto: (url) => setState((s) => ({ ...s, photo: url })),
    setMeasurements: (m) => setState((s) => ({ ...s, measurements: m })),
    setFitPreference: (v) => setState((s) => ({ ...s, fitPreference: v })),
    setPickupDate: (v) => setState((s) => ({ ...s, pickupDate: v })),
    setServiceFee: (v) => setState((s) => ({ ...s, serviceFee: v })),
    setEstimatedCompletion: (v) => setState((s) => ({ ...s, estimatedCompletion: v })),
    setPaymentMethod: (v) => setState((s) => ({ ...s, paymentMethod: v })),
    setPaymentRef: (v) => setState((s) => ({ ...s, paymentRef: v })),
    reset: () => setState(initial),
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
};

export const useAlterationWizard = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAlterationWizard must be used within AlterationWizardProvider");
  return ctx;
};
