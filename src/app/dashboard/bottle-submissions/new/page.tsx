import { redirect } from "next/navigation";

export default function LegacyBottleSubmissionPage() {
  redirect("/dashboard/tastings/new");
}