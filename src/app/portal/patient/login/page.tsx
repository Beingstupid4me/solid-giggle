import { PatientDevLogin } from "@/components/patient/PatientDevLogin";

export const metadata = {
  title: "Patient Login | Sanocare Health Vault",
  description: "Sign in to your Sanocare Patient Health Vault to access your consultations, vitals, and prescriptions.",
};

export default function PatientLoginPage() {
  return <PatientDevLogin />;
}
