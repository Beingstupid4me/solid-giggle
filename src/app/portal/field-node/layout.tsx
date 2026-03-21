import { FieldNodeSideDrawer } from "@/components/field-node/FieldNodeSideDrawer";
import { PortalRoleGate } from "@/components/portal/PortalRoleGate";

export default function FieldNodeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PortalRoleGate allowedRole="medic">
      <div className="portal-app min-h-screen bg-slate-100 text-slate-900">
        <div className="mx-auto w-full max-w-370 xl:pr-76">{children}</div>
        <FieldNodeSideDrawer />
      </div>
    </PortalRoleGate>
  );
}
