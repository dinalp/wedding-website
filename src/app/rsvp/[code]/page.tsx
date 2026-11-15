import { redirect } from "next/navigation";

/** Old codes and record IDs are navigation hints, never credentials. */
export default function LegacyRSVPPage() {
  redirect("/rsvp");
}
