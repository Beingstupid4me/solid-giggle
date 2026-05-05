import { redirect } from "next/navigation";

export default function LegacyPatientTracking() {
  redirect("/portal/patient/login");
}
