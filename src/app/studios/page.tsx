import { Suspense } from "react";
import { connection } from "next/server";
import ExploreStudio, {
    ExploreStudioSkeleton,
    type Studio,
} from "@/components/studios/ExploreStudio";
import { toDisplayImage } from "@/lib/images";
import type { Metadata } from "next";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const metadata: Metadata = {
  title: "Explore Studios — StudioSpace",
  description:
    "Filter by category, price and location.",
};

async function getStudios(): Promise<Studio[]> {
    try {
        const res = await fetch(`${API_URL}/studios`, { cache: 'no-cache' });

        if (!res.ok) {
            console.error("Failed to fetch studios:", res.status);
            return [];
        }

        const studios: Studio[] = await res.json();

        return studios
            .filter((studio) => Boolean(studio.title && studio.category))
            .map((studio) => ({
                ...studio,
                imageUrl: studio.imageUrl ? toDisplayImage(studio.imageUrl) : "",
            }));
    } catch (error) {
        console.error("Error fetching studios:", error);
        return [];
    }
}

async function StudioList() {
    await connection(); // opt into request-time rendering before any fetch
    const studios = await getStudios();
    return <ExploreStudio studios={studios} />;
}

export default function StudioPage() {
    return (
        <Suspense fallback={<ExploreStudioSkeleton />}>
            <StudioList />
        </Suspense>
    );
}