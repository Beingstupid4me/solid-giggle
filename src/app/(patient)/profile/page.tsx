import { redirect } from "next/navigation";

export default function LegacyPatientProfile() {
  redirect("/portal/patient/profile");
}
