import { redirect } from "next/navigation";

export default function LegacyMedicVitalsPage() {
  redirect("/portal/field-node/vitals");
}
