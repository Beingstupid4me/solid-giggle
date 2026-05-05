import { PatientBottomNav } from "@/components/patient/PatientBottomNav";
import { PatientVaultProvider } from "@/components/patient/PatientVaultProvider";

export default function PortalPatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background-light text-text-main pb-20 md:pb-0">
      <PatientVaultProvider>
        {children}
      </PatientVaultProvider>
      <PatientBottomNav />
    </div>
  );
}
