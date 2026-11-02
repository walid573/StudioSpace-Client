
import { Suspense } from "react";
import ExploreStudio, {
    ExploreStudioSkeleton,
    type Studio,
} from "@/components/studios/ExploreStudio";
import { toDisplayImage } from "@/lib/images";

export const metadata = {
    title: "Explore Studios | StudioSpace",
    description:
        "Browse photo studios, film stages, podcast rooms and music suites by category and location.",
};

const API_URL = process.env.API_URL ?? "http://localhost:8000";




async function getStudios(): Promise<Studio[]> {
    try {
        const res = await fetch(`${API_URL}/studios`, {
           cache:'no-cache'
        });

        if (!res.ok) {
            console.error("Failed to fetch studios:", res.status);
            return [];
        }

        const studios: Studio[] = await res.json();

        return studios
            .filter(
                (studio) =>
                    Boolean(studio.title && studio.category)
            )
            .map((studio) => ({
                ...studio,
                imageUrl: studio.imageUrl
                    ? toDisplayImage(studio.imageUrl)
                    : "",
            }));
    } catch (error) {
        console.error("Error fetching studios:", error);
        return [];
    }
}

async function StudioList() {
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
