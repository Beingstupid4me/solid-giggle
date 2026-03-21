import { redirect } from "next/navigation";

export default function LegacyPatientDashboard() {
  redirect("/portal/patient");
}
