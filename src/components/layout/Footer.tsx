"use client";

import Link from "next/link";
import { useState } from "react";

import { toast } from "@/components/ui/toast";

const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Studios", href: "/studios" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About Us", href: "/about-us" },
];

const categories = [
    { name: "Photo Studios", href: "/studios?category=Photo Studio" },
    { name: "Film Stage", href: "/studios?category=Film Stage" },
    { name: "Podcast Rooms", href: "/studios?category=Podcast Lounge" },
    { name: "Music Suites", href: "/studios?category=Music Suite" },
    { name: "Art Workshops", href: "/studios?category=Workshop" },
];

const socials = [
    {
        name: "X",
        href: "https://x.com",
        path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
    {
        name: "Instagram",
        href: "https://instagram.com",
        path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    },
    {
        name: "YouTube",
        href: "https://youtube.com",
        path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    },
    {
        name: "LinkedIn",
        href: "https://linkedin.com",
        path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
        name: "Spotify",
        href: "https://spotify.com",
        path: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
    },
];

function LogoMark({ size = 28 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2l4 7M22 12h-8M17 20l-4-7M7 20l2-8M2 12l8-1M7 4l5 8" />
        </svg>
    );
}

const headingClass =
    "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70";
const linkListClass = "mt-3.5 grid gap-2";
const linkClass =
    "w-fit text-[13px] text-muted-foreground/70 transition-colors hover:text-foreground";

const Footer = () => {
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [subscribing, setSubscribing] = useState(false);

    async function subscribe(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const email = newsletterEmail.trim();

        if (subscribing) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.add({
                title: "Enter a valid email",
                description: "The newsletter needs an email like you@example.com.",
                type: "error",
            });
            return;
        }

        setSubscribing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 600));
            toast.add({
                title: "You're subscribed",
                description: "StudioSpace news and location tips will land in your inbox.",
                type: "success",
            });
            setNewsletterEmail("");
        } catch {
            toast.add({
                title: "Subscription failed",
                description: "Please try again in a moment.",
                type: "error",
            });
        } finally {
            setSubscribing(false);
        }
    }

    return (
        <footer className="border-t border-border bg-background text-foreground">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1.1fr] lg:px-8 lg:py-14">
                {/* Brand + mission */}
                <div className="max-w-sm">
                    <Link href="/" className="flex w-fit items-center gap-2">
                        <LogoMark />
                        <span className="whitespace-nowrap text-xl font-semibold tracking-[-0.01em]">
                            StudioSpace
                        </span>
                    </Link>
                    <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground/60">
                        Book creative spaces from people who make things. Photo, sound,
                        podcast and art studios in one place.
                    </p>
                </div>

                {/* Quick links */}
                <div>
                    <p className={headingClass}>Quick links</p>
                    <ul className={linkListClass}>
                        {quickLinks.map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} className={linkClass}>
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Popular categories */}
                <div>
                    <p className={headingClass}>Popular categories</p>
                    <ul className={linkListClass}>
                        {categories.map((category) => (
                            <li key={category.name}>
                                <Link href={category.href} className={linkClass}>
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter + socials */}
                <div>
                    <p className={headingClass}>Studio thoughts, monthly</p>
                    <form onSubmit={subscribe} className="mt-3.5 flex gap-2">
                        <label className="sr-only" htmlFor="footer-newsletter">
                            Email address
                        </label>
                        <input
                            id="footer-newsletter"
                            type="email"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="h-9 w-full min-w-0 rounded-full border border-border bg-muted/40 px-4 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
                        />
                        <button
                            type="submit"
                            disabled={subscribing}
                            className="h-9 shrink-0 rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {subscribing ? "Joining…" : "Subscribe"}
                        </button>
                    </form>
                    <p className="mt-3 text-[11px] text-muted-foreground/50">
                        Booking guides and host tips. Unsubscribe anytime.
                    </p>

                    <div className="mt-6">
                        <p className={headingClass}>Follow us</p>
                        <ul className="mt-3 flex items-center gap-2">
                            {socials.map((social) => (
                                <li key={social.name}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={social.name}
                                        className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground/80 transition-colors hover:border-border hover:bg-accent hover:text-foreground"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            aria-hidden="true"
                                            className="size-3.5"
                                        >
                                            <path d={social.path} />
                                        </svg>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright + terms notice */}
            <div className="border-t border-border">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[12px] text-muted-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p>© 2026 StudioSpace. All rights reserved.</p>
                    <p>
                        By booking or hosting you agree to our Terms of Service and
                        cancellation policy. Creators own the media they shoot; hosts set
                        the house rules.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
