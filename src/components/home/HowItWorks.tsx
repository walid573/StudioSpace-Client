import { CalendarDays, Camera, Search, Zap } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Discover Spaces",
        description: "Filter by category, price and location to find the right room.",
        icon: Search,
    },
    {
        number: "02",
        title: "Select Shoot Hours",
        description: "Check live availability and pick the exact slots you need.",
        icon: CalendarDays,
    },
    {
        number: "03",
        title: "Book Instantly",
        description: "Reserve in one click with clear pricing and no hidden fees.",
        icon: Zap,
    },
    {
        number: "04",
        title: "Create and Produce",
        description: "Show up, set up and shoot. The space is ready for you.",
        icon: Camera,
    },
];

const HowItWorks = () => {
    return (
        <section className="bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
                    How it works
                </span>

                <h2 className="mt-4 text-[26px] font-bold tracking-[-0.02em] text-foreground sm:text-[28px]">
                    Book a studio in four steps
                </h2>
                <p className="mt-2 text-[15px] text-muted-foreground">
                    From first search to the final take, everything happens in one place.
                </p>

                <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                    {steps.map(({ number, title, description, icon: Icon }) => (
                        <div
                            key={number}
                            className="rounded-xl border border-border bg-accent p-5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
                                    <Icon
                                        aria-hidden="true"
                                        strokeWidth={1.5}
                                        className="size-4  text-blue-400"
                                    />
                                </span>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    {number}
                                </span>
                            </div>

                            <h3 className="mt-5 text-[15px] font-semibold text-foreground">
                                {title}
                            </h3>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
