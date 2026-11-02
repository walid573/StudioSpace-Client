import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — StudioSpace",
  description:
    "StudioSpace is a peer-to-peer marketplace for photo studios, sound stages, podcast rooms, music suites and art workshops.",
};

const STATS = [
  { value: "500+", label: "Studios listed" },
  { value: "12,000+", label: "Hours booked" },
  { value: "40", label: "Cities" },
  { value: "4.8", label: "Average rating" },
];

const STORY = [
  "It started with a simple problem. A photographer we know spent a week phoning around for a studio with a clean white cyclorama wall, and still paid for hours she never used.",
  "At the same time, studio owners had empty rooms during the week and no easy way to fill them. We built StudioSpace to bring the two together, with clear prices, live availability and instant booking.",
  "Today creators book by the hour and hosts earn from space that would otherwise sit idle, backed by verified profiles and around-the-clock support.",
];

const VALUES = [
  {
    title: "Transparent by default",
    body: "Clearly state rates, deposits and availability on every listing, so hosts and guests know exactly what to expect.",
  },
  {
    title: "Built for makers",
    body: "Every filter, amenity and detail exists because a photographer, filmmaker or musician asked for it.",
  },
  {
    title: "Fair for hosts",
    body: "Tools that treat the people who lend the space with care, protected by verified profiles and timely payouts.",
  },
];

const PRIMARY_BUTTON =
  "inline-flex h-9 items-center rounded-full bg-white px-4 text-[12px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] focus-visible:outline-none";

const SECONDARY_BUTTON =
  "inline-flex h-9 items-center rounded-full border border-white/15 px-4 text-[12px] font-medium text-neutral-200 transition-colors hover:border-white/30 hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] focus-visible:outline-none";


export default function AboutUsPage() {
  return (
    <div className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section>
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-neutral-300">
            About StudioSpace
          </span>

          <h1 className="mt-5 max-w-3xl text-[30px] leading-[1.08] font-bold tracking-[-0.03em] text-white sm:text-[40px] lg:text-[48px]">
            We help creators find the room where great work happens.
          </h1>

          <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400 sm:text-[15px]">
            StudioSpace is a peer-to-peer marketplace for photo studios, sound stages, podcast
            rooms, music suites and art workshops. We connect people who make things with people
            who have the space to make them in.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-y-6 border-y border-white/10 py-6 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-white/10">
            {STATS.map((stat) => (
              <div key={stat.label} className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <dt className="text-[26px] leading-none font-bold tracking-[-0.03em] text-white sm:text-[30px]">
                  {stat.value}
                </dt>
                <dd className="mt-1.5 text-[11px] text-neutral-400 sm:text-[12px]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid gap-6 border-b border-white/10 py-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16 lg:py-14">
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] text-neutral-500 uppercase">
              Our story
            </p>
            <h2 className="mt-3 text-[22px] leading-[1.15] font-bold tracking-[-0.02em] text-white sm:text-[26px]">
              Why we built StudioSpace
            </h2>
          </div>

          <div className="space-y-3.5">
            {STORY.map((paragraph) => (
              <p key={paragraph} className="text-[13px] leading-relaxed text-neutral-400 sm:text-[13.5px]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <p className="text-[10px] font-medium tracking-[0.18em] text-neutral-500 uppercase">
            What we believe
          </p>
          <h2 className="mt-3 text-[26px] font-bold tracking-[-0.02em] text-white sm:text-[30px]">
            Our values
          </h2>

          <div className="mt-7 grid gap-6 sm:grid-cols-3 sm:gap-0">
            {VALUES.map((value, index) => (
              <div
                key={value.title}
                className={index === 0 ? "sm:pr-6" : "sm:border-l sm:border-white/10 sm:px-6"}
              >
                <p className="text-[10px] font-semibold text-blue-500">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1.5 text-[14px] font-semibold tracking-[-0.01em] text-white">
                  {value.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-400">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
           <section className="pt-30 ">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0B] bg-[radial-gradient(120%_140%_at_25%_0%,rgba(37,99,235,0.28),transparent_55%)] px-6 py-10 text-center sm:py-12">
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-white sm:text-[26px]">
              Ready to book your first space?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-neutral-400">
              Browse studios near you and reserve your hours today.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Link href="/studios" className={PRIMARY_BUTTON}>
                Explore Studios
              </Link>
              <Link href="/add-studio" className={SECONDARY_BUTTON}>
                Host Your Space
              </Link>
            </div>
          </div>
        </section>
        </section>
      </div>
    </div>
  );
}
