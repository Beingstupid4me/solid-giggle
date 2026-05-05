import { PatientDevLogin } from "@/components/patient/PatientDevLogin";

export const metadata = {
  title: "Login | Sanocare Patient Vault",
  description: "Sign in to your Sanocare Patient Health Vault to access consultations, health records, and family profiles.",
};

export default function PortalLoginPage() {
  return <PatientDevLogin />;
}
