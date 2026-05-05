import { redirect } from "next/navigation";

export default function LegacyPatientEntry() {
  redirect("/portal/patient/login");
}
