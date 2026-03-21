import { PatientSideDrawer } from "@/components/patient/PatientSideDrawer";
import { PortalRoleGate } from "@/components/portal/PortalRoleGate";

export default function PortalPatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PortalRoleGate allowedRole="patient">
      <div className="portal-app min-h-screen bg-background-light text-text-main">
        <PatientSideDrawer />
        <div className="mx-auto w-full max-w-7xl bg-background-light md:pl-64">{children}</div>
      </div>
    </PortalRoleGate>
  );
}
