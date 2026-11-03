import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECONDARY_LINKS = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about-us" },
  { label: "My Bookings", href: "/my-bookings" },
];

function Scene404() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 560 300"
      role="presentation"
      className="h-auto w-full overflow-visible"
    >
      <defs>
        <filter id="nf-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <clipPath id="nf-clapper-stripes">
          <rect x="392" y="152" width="104" height="19" rx="3" />
        </clipPath>
      </defs>

      {/* floor glow */}
      <ellipse
        cx="280"
        cy="240"
        rx="112"
        ry="24"
        filter="url(#nf-glow)"
        className="fill-sky-500/10 dark:fill-sky-400/10"
      />

      {/* 404 numerals */}
      <text
        x="280"
        y="222"
        textAnchor="middle"
        fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
        fontSize="170"
        fontWeight="600"
        letterSpacing="2"
        className="fill-none stroke-foreground/35 dark:stroke-foreground/45"
        strokeWidth="1.4"
      >
        404
      </text>

      {/* spotlight beam */}
      <polygon
        points="271,16 289,16 374,238 186,238"
        className="fill-sky-500/[0.07] dark:fill-sky-300/[0.08]"
      />
      <polygon
        points="271,16 289,16 374,238 186,238"
        fill="none"
        className="stroke-sky-500/10 dark:stroke-sky-300/10"
        strokeWidth="1"
      />

      {/* pool of light */}
      <ellipse
        cx="280"
        cy="238"
        rx="88"
        ry="16"
        className="fill-sky-500/15 dark:fill-sky-300/15"
      />
      <ellipse
        cx="280"
        cy="238"
        rx="88"
        ry="16"
        fill="none"
        className="stroke-sky-500/25 dark:stroke-sky-300/25"
        strokeWidth="1"
      />

      {/* horizon */}
      <path
        d="M96 252 H464"
        fill="none"
        className="stroke-foreground/10"
        strokeWidth="1"
      />

      {/* camera + tripod */}
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground/65"
      >
        <rect
          x="96"
          y="158"
          width="88"
          height="54"
          rx="9"
          className="fill-background"
        />
        <rect
          x="116"
          y="148"
          width="30"
          height="12"
          rx="3"
          className="fill-background"
        />
        <circle cx="162" cy="186" r="16" className="fill-background" />
        <circle cx="162" cy="186" r="8" fill="none" />
        <circle
          cx="108"
          cy="168"
          r="2.4"
          className="fill-sky-500 stroke-none dark:fill-sky-400"
        />

        {/* tripod */}
        <path d="M120 212 L100 252" fill="none" />
        <path d="M160 212 L180 252" fill="none" />
        <path d="M140 212 L140 250" fill="none" />
        <path d="M100 252 H108" fill="none" />
        <path d="M172 252 H180" fill="none" />
        <path d="M136 250 H144" fill="none" />
      </g>

      {/* clapperboard */}
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground/65"
      >
        <rect
          x="392"
          y="172"
          width="100"
          height="76"
          rx="4"
          className="fill-background"
        />

        <g transform="rotate(-7 392 163)">
          <rect
            x="392"
            y="152"
            width="104"
            height="19"
            rx="3"
            className="fill-foreground/85 stroke-none"
          />
          <g clipPath="url(#nf-clapper-stripes)" stroke="none">
            <path d="M404 152 L411 152 L401 171 L394 171 Z" className="fill-background" />
            <path d="M426 152 L433 152 L423 171 L416 171 Z" className="fill-background" />
            <path d="M448 152 L455 152 L445 171 L438 171 Z" className="fill-background" />
            <path d="M470 152 L477 152 L467 171 L460 171 Z" className="fill-background" />
            <path d="M492 152 L499 152 L489 171 L482 171 Z" className="fill-background" />
          </g>
        </g>

        <text
          x="442"
          y="200"
          textAnchor="middle"
          fontSize="8"
          letterSpacing="2"
          className="fill-foreground/60 stroke-none"
          fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
        >
          SCENE
        </text>
        <text
          x="442"
          y="228"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          letterSpacing="1"
          className="fill-foreground/85 stroke-none"
          fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
        >
          404
        </text>
      </g>

      {/* lamp */}
      <g className="text-foreground/80">
        <rect
          x="262"
          y="7"
          width="36"
          height="9"
          rx="4.5"
          className="fill-current"
        />
        <path
          d="M280 16 V26"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-foreground/30"
        />
      </g>
    </svg>
  );
}

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="relative flex min-h-[75svh] flex-col items-center justify-center px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mx-auto w-full max-w-[540px] animate-in fade-in slide-in-from-bottom-2 duration-700 motion-reduce:animate-none">
          <Scene404 />
        </div>

        <div className="mt-6 flex justify-center md:justify-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-sky-500 dark:bg-sky-400"
            />
            Error 404
          </span>
        </div>

        <div className="mt-4 animate-in fade-in duration-700 motion-reduce:animate-none">
          <h1
            id="not-found-title"
            className="text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Cut! We cannot find that page.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
            The page you are looking for was moved, deleted or never existed.
            Let us get you back to the set.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 rounded-full px-6 text-sm",
              )}
            >
              Return to Home
            </Link>
            <Link
              href="/studios"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-full px-6 text-sm",
              )}
            >
              Explore Studios
            </Link>
          </div>

          <nav
            aria-label="Helpful links"
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            <span>Or try:</span>
            {SECONDARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
