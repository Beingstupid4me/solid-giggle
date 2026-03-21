"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalLoginOverlay } from "@/components/portal/PortalLoginOverlay";
import { usePortalHydrated } from "@/hooks/usePortalHydrated";
import { PortalRole, usePortalAuthStore } from "@/store/portalAuthStore";

const roleRouteMap: Record<PortalRole, string> = {
  patient: "/portal/patient",
  medic: "/portal/field-node",
  doctor: "/portal/doctor",
  admin: "/portal/admin",
};

export default function PortalEntryPage() {
  const router = useRouter();
  const session = usePortalAuthStore((state) => state.session);
  const hydrated = usePortalHydrated();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (session.authenticated && session.role) {
      router.replace(roleRouteMap[session.role]);
    }
  }, [hydrated, router, session.authenticated, session.role]);

  if (!hydrated) {
    return null;
  }

  if (session.authenticated) {
    return null;
  }

  return <PortalLoginOverlay />;
}
