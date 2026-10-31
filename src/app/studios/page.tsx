import { Suspense } from "react";
import ExploreStudio, {
    ExploreStudioSkeleton,
    type Studio,
} from "@/components/studios/ExploreStudio";

export const metadata = {
    title: "Explore Studios | StudioSpace",
    description: "Browse photo studios, film stages, podcast rooms and music suites by category and location.",
};

const API_URL = process.env.API_URL ?? "http://localhost:8000";


async function getStudios(): Promise<Studio[]> {
    const res = await fetch(`${API_URL}/studios`, { cache: "no-store" });

    if (!res.ok) {
        return [];
    }

    const studios: Studio[] = await res.json();

    return studios
        .filter(
            (studio) =>
                studio.title && studio.category && studio.imageUrl?.startsWith("http")
        )
        .map((studio) => ({
            ...studio,
            imageUrl: studio.imageUrl.includes("?")
                ? studio.imageUrl
                : `${studio.imageUrl}?auto=format&fit=crop&w=800&q=80`,
        }));
}


async function StudioList() {
    const studios = await getStudios();

    return <ExploreStudio studios={studios} />;
}

const StudioPage = () => {
    return (
        <Suspense fallback={<ExploreStudioSkeleton />}>
            <StudioList />
        </Suspense>
    );
};

export default StudioPage;
