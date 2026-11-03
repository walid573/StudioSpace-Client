import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works — StudioSpace",
  description:
    "From the first search to the final take: how to find, book and use a creative space on StudioSpace.",
};

const HOST_STEPS = [
  {
    title: "List your space",
    body: "Add photos, amenities, your hourly rate and a security deposit in a few minutes.",
  },
  {
    title: "Set your availability",
    body: "Choose the days and hours your studio can be booked, and change them any time.",
  },
  {
    title: "Confirm and earn",
    body: "Review requests, confirm bookings and track everything from your dashboard.",
  },
];
const PRIMARY_BUTTON =
  "inline-flex h-9 items-center rounded-full bg-foreground px-4 text-[12px] font-medium text-background transition-all duration-200 hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none";

const SECONDARY_BUTTON =
  "inline-flex h-10  items-center rounded-full border bg-background px-4 text-[12px] font-medium text-foreground transition-all duration-200 hover:bg-accent focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none";



const STEPS = [
  {
    title: "Discover Spaces",
    points: [
      "Search by keyword and filter by category to narrow the list.",
      "See the hourly rate and location on every studio card.",
      "Open a listing to check photos, amenities and capacity before you book.",
    ],
  },
  {
    title: "Select Shoot Hours",
    points: [
      "Pick the date from the calendar.",
      "Choose the exact start and end times.",
      "The total updates as you change the hours.",
    ],
  },
  {
    title: "Book Instantly",
    points: [
      "See the hourly rate and security deposit before you book.",
      "Your request reaches the host as pending, not a lock on the space.",
      "Edit or cancel a pending booking from My Bookings.",
    ],
  },
  {
    title: "Create and Produce",
    points: [
      "Check in, set up and shoot in a space that is ready for you.",
      "Hosts list equipment, parking and house rules up front.",
      "Leave a review to help the next creator.",
    ],
  },
];

function StepLabel({ index }: { index: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-transparent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border border-gray-400/20">
      Step {String(index + 1).padStart(2, "0")} / 04
    </span>
  );
}

function StepText({ index }: { index: number }) {
  const step = STEPS[index];

  return (
    <div>
      <StepLabel index={index} />
      <h2 className="mt-2 text-[19px] font-bold tracking-tight text-foreground sm:text-2xl">
        {step.title}
      </h2>
      <ul className="mt-3 space-y-2">
        {step.points.map((point) => (
          <li
            key={point}
            className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground"
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}



const STUDIO_GRADIENTS = [
  "from-blue-400 via-blue-600 to-blue-950",
  "from-emerald-500 via-emerald-800 to-neutral-950",
];

function ExplorePanel() {
  const categories = ["All", "Photo Studio", "Film Stage"];
  const studios = [
    {
      title: "Cyclorama White Loft",
      category: "Photo Studio",
      place: "Dubai Marina",
      price: "$45",
      meta: "4.9 rating",
    },
    {
      title: "Moss Timber Den",
      category: "Film Stage",
      place: "Al Quoz",
      price: "$60",
      meta: "New",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <h3 className="text-[12px] font-bold tracking-[-0.02em] text-foreground">Explore Studios</h3>
      <p className="mt-0.5 text-[9.5px] text-muted-foreground">
        Filter by category, price and location.
      </p>

      <div className="mt-2 rounded-lg border border-border bg-muted/30 p-2">
        <div className="relative">
          <Search
            aria-hidden="true"
            strokeWidth={1.5}
            className="pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground"
          />
          <div className="flex h-7 items-center rounded-md bg-muted pr-2 pl-7 text-[9.5px] text-muted-foreground">
            Search studios or location
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {categories.map((item, index) => (
            <span
              key={item}
              className={
                index === 0
                  ? "inline-flex h-5 items-center rounded-full bg-foreground px-2 text-[8.5px] font-medium text-background"
                  : "inline-flex h-5 items-center rounded-full px-1.5 text-[8.5px] text-muted-foreground"
              }
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {studios.map((studio, index) => (
          <div
            key={studio.title}
            className="overflow-hidden rounded-lg border border-blue-400/20 bg-muted/40"
          >
            <div className={`h-14 bg-gradient-to-br sm:h-16 ${STUDIO_GRADIENTS[index]} shadow-lg shadow-blue-500/20`} />

            <div className="p-2">
              <span className="inline-flex rounded-full bg-muted px-1.5 py-0.5 text-[7.5px] font-medium text-foreground">
                {studio.category}
              </span>
              <p className="mt-1 truncate text-[10px] font-semibold tracking-[-0.01em] text-foreground">
                {studio.title}
              </p>
              <p className="truncate text-[8.5px] text-muted-foreground">{studio.place}</p>

              <div className="mt-1 flex items-center justify-between gap-1.5">
                <p className="text-[10px] font-semibold text-foreground">
                  {studio.price}
                  <span className="ml-0.5 text-[7.5px] font-normal text-muted-foreground">/hr</span>
                </p>
                <p className="text-[7.5px] text-muted-foreground">{studio.meta}</p>
              </div>

              <div className="mt-1.5 flex h-5 items-center justify-center rounded-full bg-foreground text-[8px] font-medium text-background">
                View Details
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingField({
  label,
  value,
  open = false,
}: {
  label: string;
  value: string;
  open?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <div
        className={`mt-1 flex h-8 items-center justify-between gap-2 rounded-lg border px-2 text-[10.5px] text-foreground ${
          open ? "border-border bg-accent" : "border-border bg-muted/30"
        }`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-3 shrink-0 text-muted-foreground ${open ? "rotate-180" : ""}`}
        />
      </div>
    </div>
  );
}

function PriceRow() {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[22px] leading-none font-bold tracking-[-0.04em] text-foreground">
        $45
        <span className="ml-1 text-[10px] font-medium tracking-normal text-muted-foreground">
          / hr
        </span>
      </p>
      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[9px] text-muted-foreground">
        Deposit $100
      </span>
    </div>
  );
}

function BookingCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[20px] border border-border bg-card p-3.5 shadow-[0_26px_60px_-16px_rgba(0,0,0,0.12)] sm:p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/5 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-36 w-2/3 -translate-x-1/2 rounded-full bg-blue-500/[0.12] blur-3xl"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function HoursPanel() {
  return (
    <BookingCard>
      <PriceRow />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <BookingField label="Date" value="12 Nov 2026" />
        <BookingField label="Hours" value="10:00 to 14:00" open />
      </div>

      
      <div className="mt-2 rounded-lg border border-border bg-muted/40 p-2.5 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[8.5px] text-muted-foreground">Start</p>
            <div className="mt-1 flex h-7 items-center rounded-md border border-border bg-background px-2 text-[9.5px] text-foreground">
              10:00
            </div>
          </div>
          <div>
            <p className="text-[8.5px] text-muted-foreground">End</p>
            <div className="mt-1 flex h-7 items-center rounded-md border border-border bg-background px-2 text-[9.5px] text-foreground">
              14:00
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[8.5px] text-muted-foreground">4 hrs selected</span>
          <span className="inline-flex h-5 items-center rounded-full bg-foreground px-2 text-[8.5px] font-medium text-background">
            Done
          </span>
        </div>
      </div>
    </BookingCard>
  );
}

function BookingPanel() {
  return (
    <BookingCard>
      <PriceRow />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <BookingField label="Date" value="12 Nov 2026" />
        <BookingField label="Hours" value="10:00 to 14:00" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-2.5 py-2">
        <span className="text-[10px] text-muted-foreground">4 hrs × $45</span>
        <span className="text-[12px] font-semibold text-foreground">$180</span>
      </div>

      <div className="mt-3 flex h-8 items-center justify-center rounded-full bg-primary text-[10.5px] font-semibold text-primary-foreground shadow-[0_6px_20px_rgba(37,99,235,0.2)]">
        Book Workspace Now
      </div>

      <p className="mt-1.5 text-center text-[8.5px] text-muted-foreground">
        Status starts as Pending until the host confirms.
      </p>
    </BookingCard>
  );
}

function ChecklistPanel() {
  const items = [
    "Arrive and check in with the host",
    "Set up your gear and lighting",
    "Shoot, record or rehearse",
    "Leave a review for the next creator",
  ];

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.08] p-4">
      <ol className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[11.5px] text-foreground">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/10">
              <Check aria-hidden="true" className="size-2.5 text-blue-600" />
            </span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

const PANELS = [ExplorePanel, HoursPanel, BookingPanel, ChecklistPanel];

export default function HowItWorksPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-8 lg:pt-10">
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            How it works
          </p>
        </div>

        <header className="mx-auto max-w-3xl pt-6 pb-10 text-center lg:pt-7 lg:pb-12">
          <h1 className="text-[28px] leading-tight font-bold tracking-tight text-foreground sm:text-[34px] lg:text-[40px]">
            Book a creative space in four simple steps
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            From the first search to the final take, StudioSpace keeps booking clear, fast and
            fair for creators and hosts.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/studios" className={PRIMARY_BUTTON}>
              Explore Studios
            </Link>
            <Link href="/add-studio" className={SECONDARY_BUTTON}>
              Host Your Space
            </Link>
          </div>
        </header>

        <div className="pt-10">
          {STEPS.map((step, index) => {
            const Panel = PANELS[index];
            const visualFirst = index % 2 === 1;

            return (
              <section
                key={step.title}
                className="grid items-center gap-8 border-t border-border py-12 lg:grid-cols-2 lg:gap-14 lg:py-16"
              >
                <div className={visualFirst ? "lg:order-2" : ""}>
                  <StepText index={index} />
                </div>

                <div aria-hidden="true" className={visualFirst ? "lg:order-1" : ""}>
                  <Panel />
                </div>
              </section>
            );
          })}
        </div>

        <section className="border-t border-border py-14 lg:py-20">
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            For hosts
          </span>

          <h2 className="mt-4 max-w-xl text-[24px] leading-tight font-bold tracking-tight text-foreground sm:text-[28px]">
            Hosting works the same way, in reverse
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {HOST_STEPS.map((step, index) => (
              <div
                key={step.title}
                className={index === 0 ? "sm:pr-6" : index === HOST_STEPS.length - 1 ? "sm:pl-6" : "sm:border-l sm:border-border sm:px-6"}
              >
                <p className="text-[10px] font-semibold text-blue-600">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1.5 text-[14px] font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-2 pb-16 lg:pb-20">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card bg-[radial-gradient(120%_140%_at_25%_0%,rgba(37,99,235,0.28),transparent_55%)] px-6 py-10 text-center sm:py-12">
            <h2 className="text-[22px] font-bold tracking-tight text-foreground sm:text-[26px]">
              Ready to book your first space?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
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
      </div>
    </div>
  );
}
