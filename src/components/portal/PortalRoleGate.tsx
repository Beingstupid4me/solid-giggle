"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalInstallPrompt } from "@/components/portal/PortalInstallPrompt";
import { usePortalHydrated } from "@/hooks/usePortalHydrated";
import { PortalRole, usePortalAuthStore } from "@/store/portalAuthStore";

const roleRouteMap: Record<PortalRole, string> = {
  patient: "/portal/patient",
  medic: "/portal/field-node",
  doctor: "/portal/doctor",
  admin: "/portal/admin",
};

interface PortalRoleGateProps {
  allowedRole: PortalRole;
  children: React.ReactNode;
}

export function PortalRoleGate({ allowedRole, children }: PortalRoleGateProps) {
  const router = useRouter();
  const session = usePortalAuthStore((state) => state.session);
  const hydrated = usePortalHydrated();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!session.authenticated || !session.role) {
      window.location.replace("/portal");
      return;
    }

    if (session.role !== allowedRole) {
      router.replace(roleRouteMap[session.role]);
    }
  }, [allowedRole, hydrated, router, session.authenticated, session.role]);

  if (!hydrated) {
    return null;
  }

  if (!session.authenticated || session.role !== allowedRole) {
    return null;
  }

  return (
    <>
      <PortalInstallPrompt />
      {children}
    </>
  );
}