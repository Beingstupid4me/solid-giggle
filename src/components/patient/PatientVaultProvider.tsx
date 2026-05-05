"use client";

import { useEffect } from "react";
import { usePatientVaultStore } from "@/store/patientVaultStore";

/**
 * Client-side provider that initializes the patient vault store.
 * Separated from the layout so the layout stays a server component
 * (required for server-side redirects in child pages).
 */
export function PatientVaultProvider({ children }: { children: React.ReactNode }) {
  const initialize = usePatientVaultStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
