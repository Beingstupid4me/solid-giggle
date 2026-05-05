import { redirect } from "next/navigation";

// Records is the same view as Timeline — redirect to avoid duplication
export default function RecordsPage() {
  redirect("/portal/patient/timeline");
}
