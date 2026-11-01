import StudioDetailClient, { StudioDetailSkeleton } from "@/components/studios/StudioDetailClient";

export const instant = false;

export const metadata = {
  title: "Studio Details | StudioSpace",
};

export default async function StudioDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StudioDetailClient studioId={id} />;
}