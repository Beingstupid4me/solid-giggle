import { AdminShell } from "@/components/admin/AdminScaffold";
import { PortalRoleGate } from "@/components/portal/PortalRoleGate";

export default function PortalAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PortalRoleGate allowedRole="admin">
      <AdminShell>{children}</AdminShell>
    </PortalRoleGate>
  );
}
