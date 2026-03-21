import { DoctorShell } from "@/components/doctor/DoctorScaffold";
import { PortalRoleGate } from "@/components/portal/PortalRoleGate";

export default function PortalDoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PortalRoleGate allowedRole="doctor">
      <DoctorShell>{children}</DoctorShell>
    </PortalRoleGate>
  );
}
