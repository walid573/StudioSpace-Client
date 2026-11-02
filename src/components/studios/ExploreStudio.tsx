"use client";

/* eslint-disable @next/next/no-img-element -- image URLs come from the database and can point at any host, so next/image cannot optimise them. */

import { useState } from "react";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import {  useSearchParams } from "next/navigation";

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
    const searchParams = useSearchParams();
    

    
    const category = searchParams.get("category") ?? "All";

    const [query, setQuery] = useState("");

    
    function setCategory(next: string) {
        const url = next === "All" ? "/studios" : `/studios?category=${encodeURIComponent(next)}`;
        window.history.replaceState(null, "", url);
    }
    
    
 
    const categories = ["All", ...new Set(studios.map((studio) => studio.category))];

    
    const visibleStudios = studios.filter((studio) => {
        const matchesCategory = category === "All" || studio.category === category;

        const searchText = `${studio.title} ${studio.location?.area ?? ""} ${studio.location?.city ?? ""}`;
        const matchesSearch = searchText.toLowerCase().includes(query.trim().toLowerCase());
        
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="text-[26px] font-bold tracking-[-0.02em] text-foreground sm:text-[28px]">
                    Explore Studios
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground">
                    Filter by category, price and location.
                </p>

             
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search
                            aria-hidden="true"
                            strokeWidth={1.5}
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search studios or location"
                            className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
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
                                            ? "h-8 rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground"
                                            : "h-8 rounded-full px-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                                    }
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {visibleStudios.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted">
                            <SearchX className="size-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <p className="mt-4 text-[15px] font-semibold text-foreground">
                            {studios.length === 0 ? "No studios yet" : "No studios match your search"}
                        </p>
                        <p className="mt-1.5 max-w-xs text-[13px] text-muted-foreground">
                            {studios.length === 0
                                ? "Nothing has been published here yet. Check back soon, or list your own space."
                                : "Try a different keyword, another category, or clear the filters to see every space."}
                        </p>
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                            {studios.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery("");
                                        setCategory("All");
                                    }}
                                    className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                                >
                                    Clear filters
                                </button>
                            )}
                            <Link
                                href="/add-studio"
                                className="inline-flex h-9 items-center rounded-full border border-border px-4 text-[12px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                            >
                                List your studio
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleStudios.map((studio) => {
                            const place = [studio.location?.area, studio.location?.city]
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <article
                                    key={studio._id}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted via-background to-border">
                                        {studio.imageUrl ? (
                                            <img
                                                src={studio.imageUrl}
                                                alt={studio.title}
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";
                                                }}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
                                                No photo yet
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col p-4">
                                        <span className="w-fit rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                                            {studio.category}
                                        </span>

                                        <h2 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-foreground">
                                            {studio.title}
                                        </h2>
                                        {place && (
                                            <p className="mt-1 text-[13px] text-muted-foreground">{place}</p>
                                        )}

                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <p className="text-[16px] font-semibold text-foreground">
                                                ${studio.hourlyRate}
                                                <span className="ml-1 text-[12px] font-normal text-muted-foreground">
                                                    /hr
                                                </span>
                                            </p>
                                            <p className="text-[12px] text-muted-foreground">
                                                {studio.rating ? `${studio.rating} rating` : "New"}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/studios/${studio._id}`}
                                            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
        <div className="bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
                <div className="mt-3 h-4 w-72 animate-pulse rounded-md bg-muted/70" />
                <div className="mt-6 h-16 animate-pulse rounded-xl bg-muted" />

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse overflow-hidden rounded-xl border border-border bg-card"
                        >
                            <div className="aspect-[16/10] bg-muted" />
                            <div className="space-y-3 p-4">
                                <div className="h-5 w-24 rounded-full bg-muted" />
                                <div className="h-4 w-40 rounded bg-muted" />
                                <div className="h-3 w-28 rounded bg-muted/70" />
                                <div className="h-10 w-full rounded-full bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ExploreStudio;
