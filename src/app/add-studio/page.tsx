import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import StudioForm from "@/components/studios/StudioForm";

export const instant = false;

export const metadata = {
  title: "Add New Studio | StudioSpace",
  description: "List your space and start getting bookings.",
};

export default async function NewStudioPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return <StudioForm />;
}
