import Link from "next/link";
import {
    ArrowUpRight,
    Camera,
    Clapperboard,
    Music,
    Palette,
    Podcast,
} from "lucide-react";
import { connection } from "next/server";
const API_URL = process.env.NEXT_PUBLIC_API_URL ;

type StudioSummary = { category?: string; hourlyRate?: number | string };

const categories = [
    {
        name: "Photo Studios",
        category: "Photo Studio",
        icon: Camera,
        featured: true,
        card: "bg-gradient-to-br from-primary/80 via-primary/60 to-background text-primary-foreground",
        watermark: "text-primary-foreground/30",
        badge: "border-primary-foreground/30 text-primary-foreground",
        meta: "text-primary-foreground/60",
    },
    {
        name: "Sound Stages",
        category: "Film Stage",
        icon: Clapperboard,
        card: "bg-card border border-border text-card-foreground",
        watermark: "text-muted-foreground/30",
        badge: "border-border/30 text-muted-foreground",
        meta: "text-muted-foreground",
    },
    {
        name: "Podcast Rooms",
        category: "Podcast Lounge",
        icon: Podcast,
        card: "bg-muted text-muted-foreground",
        watermark: "text-muted-foreground/60",
        badge: "border-border/30 text-foreground",
        meta: "text-muted-foreground",
    },
    {
        name: "Music Suites",
        category: "Music Suite",
        icon: Music,
        card: "bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40 text-primary-foreground",
        watermark: "text-primary-foreground/30",
        badge: "border-primary-foreground/30 text-primary-foreground",
        meta: "text-primary-foreground/70",
    },
    {
        name: "Art Workshops",
        category: "Workshop",
        icon: Palette,
        card: "bg-card border border-border text-card-foreground",
        watermark: "text-muted-foreground/30",
        badge: "border-border/30 text-muted-foreground",
        meta: "text-muted-foreground",
    },
];

const categoryHref = (category: string) =>
    `/studios?category=${encodeURIComponent(category)}`;

async function getStudios(): Promise<StudioSummary[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/studios`, {
             cache: "no-store",
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function getStats(studios: StudioSummary[], category: string) {
    const matching = studios.filter((studio) => studio.category === category);

    const rates = matching
        .map((studio) => Number(studio.hourlyRate))
        .filter((rate) => Number.isFinite(rate) && rate > 0);

    return {
        count: matching.length,
        from: rates.length > 0 ? Math.min(...rates) : null,
    };
}



const CatergorySection = async () => {
    await connection();
    const studios = await getStudios();

    return (
        <section className="bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-[26px] font-bold tracking-[-0.02em] text-foreground sm:text-[28px]">
                            Browse by category
                        </h2>
                        <p className="mt-2  text-[15px] text-muted-foreground">
                            Jump straight to the kind of space you need.
                        </p>
                    </div>

                    <Link
                        href="/studios"
                        className="inline-flex h-8 shrink-0 items-center rounded-full border border-border px-4 text-[11px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        View all studios
                    </Link>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2 lg:gap-4">
                    {categories.map((item) => {
                        const Icon = item.icon;
                        const featured = item.featured;
                        const { count, from } = getStats(studios, item.category);

                        return (
                            <Link
                                key={item.name}
                                href={categoryHref(item.category)}
                                className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${item.card} ${
                                    featured
                                        ? "col-span-2 min-h-[280px] p-6 lg:row-span-2 lg:min-h-0"
                                        : "min-h-[140px]"
                                }`}
                            >
                                <Icon
                                    aria-hidden="true"
                                    strokeWidth={1.2}
                                    className={`absolute right-4 top-4 ${item.watermark} ${
                                        featured ? "size-28 sm:size-36" : "size-16"
                                    }`}
                                />

                                <span
                                    aria-hidden="true"
                                    className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border transition-transform group-hover:scale-110 ${item.badge} ${
                                        featured ? "right-4 top-4" : ""
                                    }`}
                                >
                                    <ArrowUpRight className="size-3" />
                                </span>

                                <div className="relative">
                                    <h3
                                        className={
                                            featured
                                                ? "text-[28px] font-bold tracking-[-0.02em]"
                                                : "text-[14px] font-semibold tracking-[-0.01em]"
                                        }
                                    >
                                        {item.name}
                                    </h3>

                                    <p className={`mt-1 text-[11px] ${item.meta}`}>
                                        {count} {count === 1 ? "space" : "spaces"}
                                        {featured && from !== null ? ` · from $${from} / hr` : ""}
                                    </p>

                                    {featured && (
                                        <span className="mt-4 inline-flex h-8 items-center rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground">
                                            Browse photo studios
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CatergorySection;