import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudioEditForm } from "@/components/studios/StudioEditForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const instant = false;

export const metadata = {
  title: "Edit Studio | StudioSpace",
  description: "Update the details guests see about your space.",
};

async function getStudio(id: string) {
  try {
    const res = await fetch(`${API_URL}/studios/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function EditStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Private route
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const studio = await getStudio(id);
  if (!studio) notFound();

  // Owner-only edit entry (the server enforces this again on PATCH)
  const email = session.user.email.toLowerCase();
  const isOwner = [studio.ownerEmail, studio.hostEmail]
    .some((e: string | undefined) => e && String(e).toLowerCase() === email);
  if (!isOwner) redirect("/my-listings");

  return (
    <div className="mx-auto min-h-[65vh] max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.02em] sm:text-[28px]">
          Edit studio
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Update the details guests see. Changes go live immediately.
        </p>
      </header>

      <div className="dark overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
        <StudioEditForm
          studio={studio}
          hostName={studio.ownerName ?? studio.hostName}
          hostEmail={studio.ownerEmail ?? studio.hostEmail}
        />
      </div>
    </div>
  );
}
