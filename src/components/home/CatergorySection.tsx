import Link from "next/link";
import {
    ArrowUpRight,
    Camera,
    Clapperboard,
    Music,
    Palette,
    Podcast,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type StudioSummary = { category?: string; hourlyRate?: number | string };

const categories = [
    {
        name: "Photo Studios",
        category: "Photo Studio",
        icon: Camera,
        featured: true,
        card: "bg-gradient-to-br from-[#0b2a6f] via-[#071a45] to-black text-white",
        watermark: "text-white/15",
        badge: "border-white/30 text-white",
        meta: "text-white/60",
    },
    {
        name: "Sound Stages",
        category: "Film Stage",
        icon: Clapperboard,
        card: "bg-[#121212] border border-white/[0.07] text-white",
        watermark: "text-white/10",
        badge: "border-white/25 text-white",
        meta: "text-neutral-400",
    },
    {
        name: "Podcast Rooms",
        category: "Podcast Lounge",
        icon: Podcast,
        card: "bg-[#ececec] text-neutral-950",
        watermark: "text-neutral-400/60",
        badge: "border-black/25 text-neutral-800",
        meta: "text-neutral-600",
    },
    {
        name: "Music Suites",
        category: "Music Suite",
        icon: Music,
        card: "bg-gradient-to-br from-[#0d1f4f] via-[#1b45a8] to-[#3b82f6] text-white",
        watermark: "text-white/20",
        badge: "border-white/30 text-white",
        meta: "text-white/70",
    },
    {
        name: "Art Workshops",
        category: "Workshop",
        icon: Palette,
        card: "bg-[#121212] border border-white/[0.07] text-white",
        watermark: "text-white/10",
        badge: "border-white/25 text-white",
        meta: "text-neutral-400",
    },
];

const categoryHref = (category: string) =>
    `/studios?category=${encodeURIComponent(category)}`;

async function getStudios(): Promise<StudioSummary[]> {
    try {
        const response = await fetch(`${API_URL}/studios`, { cache: "no-store" });
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
    const studios = await getStudios();

    return (
        <section className="bg-[#0A0A0A] text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-[26px] font-bold tracking-[-0.02em] text-white sm:text-[28px]">
                            Browse by category
                        </h2>
                        <p className="mt-2 text-[12px] text-amber-400">
                            Jump straight to the kind of space you need.
                        </p>
                    </div>

                    <Link
                        href="/studios"
                        className="inline-flex h-8 shrink-0 items-center rounded-full border border-white/15 px-4 text-[11px] font-medium text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
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
                                className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] ${item.card} ${
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
                                        <span className="mt-4 inline-flex h-8 items-center rounded-full bg-white px-4 text-[12px] font-medium text-neutral-950">
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