import Link from "next/link";
import { Camera, Clapperboard, Music, Palette, Podcast } from "lucide-react";

const categories = [
    { name: "Photo Studios", icon: Camera, href: "/studios?category=photo-studios" },
    { name: "Sound Stages", icon: Clapperboard, href: "/studios?category=sound-stages" },
    { name: "Podcast Rooms", icon: Podcast, href: "/studios?category=podcast-rooms" },
    { name: "Music Suites", icon: Music, href: "/studios?category=music-suites" },
    { name: "Art Workshops", icon: Palette, href: "/studios?category=art-workshops" },
];

const CatergorySection = () => {
    return (
        <section className="bg-[#0A0A0A] text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <h2 className="text-[26px] font-bold tracking-[-0.02em] text-white sm:text-[28px]">
                    Browse by category
                </h2>
                <p className="mt-2 text-[15px] text-neutral-400">
                    Jump straight to the kind of space you need.
                </p>

                <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
                    {categories.map(({ name, icon: Icon, href }) => (
                        <Link
                            key={name}
                            href={href}
                            className="group flex min-h-[136px] flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                        >
                            <Icon
                                aria-hidden="true"
                                strokeWidth={1.5}
                                className="size-[22px] text-blue-400 transition-colors group-hover:text-white"
                            />
                            <div>
                                <h3 className="text-[15px] font-semibold text-white">
                                    {name}
                                </h3>
                                <p className="mt-0.5 text-[13px] text-neutral-400">
                                    Browse spaces
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CatergorySection;
