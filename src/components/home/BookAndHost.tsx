import Link from "next/link";
import { Headphones, ShieldCheck, UserCheck, Wrench } from "lucide-react";

const features = [
    {
        title: "Liability protection",
        description:
            "Property damage and liability are covered on every confirmed booking, so hosts and creators can focus on the work.",
        icon: ShieldCheck,
    },
    {
        title: "Verified profiles",
        description:
            "Hosts and creators are identity-checked before they can list a space or send a booking request.",
        icon: UserCheck,
    },
    {
        title: "Equipment safety",
        description:
            "Gear is listed and checked before and after each session, with a clear record of what was used.",
        icon: Wrench,
    },
    {
        title: "24/7 host support",
        description:
            "Real people on chat and phone at any hour, for lockouts, delays or last-minute changes.",
        icon: Headphones,
    },
];

const BookAndHost = () => {
    return (
        <section className="bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                    <div>
                        <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
                            Host Guarantees
                        </span>

                        <h2 className="mt-4 max-w-[22rem] text-[26px] font-bold tracking-[-0.02em] text-foreground sm:text-[30px]">
                            Book and host with confidence
                        </h2>
                        <p className="mt-3 max-w-md text-[15px] text-muted-foreground">
                            Every space and every person on StudioSpace is backed by protection,
                            verification and real support.
                        </p>

                        <Link
                            href="/add-studio"
                            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            Host Your Space
                        </Link>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
                        {features.map(({ title, description, icon: Icon }) => (
                            <div
                                key={title}
                                className="rounded-xl border border-border bg-accent p-5"
                            >
                                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
                                    <Icon
                                        aria-hidden="true"
                                        strokeWidth={1.5}
                                        className="size-4 text-blue-400"
                                    />
                                </span>

                                <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                                    {title}
                                </h3>
                                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BookAndHost;
