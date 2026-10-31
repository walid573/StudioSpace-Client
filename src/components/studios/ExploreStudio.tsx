"use client";

/* eslint-disable @next/next/no-img-element -- image URLs come from the database and can point at any host, so next/image cannot optimise them. */

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";


export type Studio = {
    _id: string;
    title: string;
    slug: string;
    category: string;
    hourlyRate: number;
    location?: {
        city?: string;
        area?: string;
        address?: string;
    };
    imageUrl: string;
    rating?: number;
};

const ExploreStudio = ({ studios }: { studios: Studio[] }) => {
   
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");

 
    const categories = ["All", ...new Set(studios.map((studio) => studio.category))];

    
    const visibleStudios = studios.filter((studio) => {
        const matchesCategory = category === "All" || studio.category === category;

        const searchText = `${studio.title} ${studio.location?.area ?? ""} ${studio.location?.city ?? ""}`;
        const matchesSearch = searchText.toLowerCase().includes(query.trim().toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-[#0A0A0A] text-white">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="text-[26px] font-bold tracking-[-0.02em] text-white sm:text-[28px]">
                    Explore Studios
                </h1>
                <p className="mt-2 text-[15px] text-neutral-400">
                    Filter by category, price and location.
                </p>

             
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search
                            aria-hidden="true"
                            strokeWidth={1.5}
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500"
                        />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search studios or location"
                            className="h-10 w-full rounded-lg bg-white/[0.04] pr-3 pl-9 text-[14px] text-white outline-none transition-colors placeholder:text-neutral-500 focus:bg-white/[0.07]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {categories.map((item) => {
                            const active = item === category;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setCategory(item)}
                                    aria-pressed={active}
                                    className={
                                        active
                                            ? "h-8 rounded-full bg-white px-4 text-[12px] font-medium text-neutral-950"
                                            : "h-8 rounded-full px-3 text-[12px] text-neutral-400 transition-colors hover:text-white"
                                    }
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {visibleStudios.length === 0 ? (
                    <p className="mt-16 text-center text-[14px] text-neutral-400">
                        No studios match your filters.
                    </p>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleStudios.map((studio) => {
                            const place = [studio.location?.area, studio.location?.city]
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <article
                                    key={studio._id}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
                                        <img
                                            src={studio.imageUrl}
                                            alt={studio.title}
                                            loading="lazy"
                                            onError={(event) => {
                                            event.currentTarget.style.display = "none";
                                            }}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col p-4">
                                        <span className="w-fit rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-neutral-200">
                                            {studio.category}
                                        </span>

                                        <h2 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-white">
                                            {studio.title}
                                        </h2>
                                        {place && (
                                            <p className="mt-1 text-[13px] text-neutral-400">{place}</p>
                                        )}

                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <p className="text-[16px] font-semibold text-white">
                                                ${studio.hourlyRate}
                                                <span className="ml-1 text-[12px] font-normal text-neutral-400">
                                                    /hr
                                                </span>
                                            </p>
                                            <p className="text-[12px] text-neutral-400">
                                                {studio.rating ? `${studio.rating} rating` : "New"}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/studios/${studio.slug}`}
                                            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-white text-[13px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};


export function ExploreStudioSkeleton() {
    return (
        <div className="bg-[#0A0A0A] text-white">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="h-8 w-56 animate-pulse rounded-md bg-white/10" />
                <div className="mt-3 h-4 w-72 animate-pulse rounded-md bg-white/5" />
                <div className="mt-6 h-16 animate-pulse rounded-xl bg-white/[0.04]" />

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                        >
                            <div className="aspect-[16/10] bg-white/[0.06]" />
                            <div className="space-y-3 p-4">
                                <div className="h-5 w-24 rounded-full bg-white/10" />
                                <div className="h-4 w-40 rounded bg-white/10" />
                                <div className="h-3 w-28 rounded bg-white/5" />
                                <div className="h-10 w-full rounded-full bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ExploreStudio;
