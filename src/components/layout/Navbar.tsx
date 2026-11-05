
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
    CalendarDays,
    CirclePlus,
    LayoutGrid,
    List,
    LogOut,
    Menu,
    UserRound,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";

import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "../ui/toast";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

type Booking = {
    _id: string;
    status: string;
};

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

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Studios", href: "/studios" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About Us", href: "/about-us" },
];

const accountLinks = [
    { name: "Profile", href: "/profile", icon: UserRound },
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "Add New Studio", href: "/add-studio", icon: CirclePlus },
    { name: "My Studio Listings", href: "/my-listings", icon: List },
    { name: "My Bookings", href: "/my-bookings", icon: CalendarDays },
];

const menuItemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent";

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const { data: session, isPending } = authClient.useSession();

    const user = session?.user;
    const email = user?.email;
    const bookingCount = bookings.length;

    const isActive = (href: string) =>
        href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);

    async function loadBookings() {
        if (!email) return;

        try {
            const token = await getTokenFromClient();

            const headers: Record<string, string> = {
                Accept: "application/json",
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(
                `${API_URL}/my-bookings/${encodeURIComponent(email)}`,
                {
                    cache: "no-store",
                    headers,
                }
            );

            if (!res.ok) {
                setBookings([]);
                return;
            }

            const data = await res.json();


            console.log("My bookings:", data);


            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load bookings:", error);
            setBookings([]);
        }
    }

    useEffect(() => {
        if (!email) return;
        // Deferred so the fetch result triggers setState from a callback,
        // not synchronously during the effect (react-hooks/set-state-in-effect).
        const timer = setTimeout(() => {
            void loadBookings();
        }, 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    async function handleSignOut() {
        try {
            const { error } = await authClient.signOut();

            if (error) {
                console.error("Logout failed:", error);
                toast.add({
                    title: "Logout failed",
                    description: error.message ?? "We couldn't log you out. Please try again.",
                    type: "error",
                });
                return;
            }

            setBookings([]);
            toast.add({
                title: "Logged out",
                description: "You've been signed out successfully.",
                type: "success",
            });
            router.replace("/");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
            toast.add({
                title: "Something went wrong",
                description: "Please try again.",
                type: "error",
            });
        }
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">


                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2"
                >
                    {/* <Image
                        src="/logo.png"
                        alt="StudioSpace logo"
                        width={32}
                        height={32}
                        priority
                    /> */}
                    <LogoMark />
                    <span className="whitespace-nowrap text-lg font-bold tracking-tight sm:text-xl">
                        StudioSpace
                    </span>
                </Link>


                <div className="hidden items-center gap-4 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            aria-current={isActive(link.href) ? "page" : undefined}
                            className={`flex items-center border-b-2 px-2 py-2 text-[15px] font-medium transition-colors ${isActive(link.href)
                                ? "border-black text-black dark:border-white dark:text-white"
                                : "border-transparent text-neutral-500 hover:text-black dark:text-[#A1A1A1] dark:hover:text-white"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>


                <div className="flex shrink-0 items-center gap-2">


                    <ThemeToggle />


                    {isPending ? (
                        <div className="size-9 animate-pulse rounded-full bg-muted" />
                    ) : user ? (


                        <Popover
                            onOpenChange={(open) => {
                                if (open) loadBookings();
                            }}
                        >
                            <PopoverTrigger
                                aria-label="Open account menu"
                                className="rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Avatar className="size-9 border border-border">
                                    <AvatarImage
                                        src={user.image ?? undefined}
                                        alt={user.name ?? "Profile"}
                                        referrerPolicy="no-referrer"
                                    />

                                    <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                                        {user.name?.charAt(0) ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </PopoverTrigger>

                            <PopoverContent
                                align="end"
                                sideOffset={10}
                                className="w-[290px] gap-0 rounded-xl p-0"
                            >

                                <PopoverHeader className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-10">
                                            <AvatarImage
                                                src={user.image ?? undefined}
                                                alt={user.name ?? "Profile"}
                                                referrerPolicy="no-referrer"
                                            />

                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {user.name?.charAt(0) ?? "U"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <PopoverTitle className="truncate text-sm font-semibold">
                                                {user.name}
                                            </PopoverTitle>

                                            <PopoverDescription className="truncate text-xs">
                                                {user.email}
                                            </PopoverDescription>
                                        </div>
                                    </div>
                                </PopoverHeader>

                                <div className="h-px bg-border" />


                                <div className="p-2">
                                    {accountLinks.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={menuItemClass}
                                            >
                                                <Icon className="size-[18px] shrink-0 text-muted-foreground" />

                                                <span>{item.name}</span>

                                                {item.name === "My Bookings" && (
                                                    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                                        {bookingCount}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="mx-3 h-px bg-border" />


                                <div className="p-2">
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                                    >
                                        <LogOut className="size-[18px]" />
                                        Logout
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>

                    ) : (



                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-2xl border border-border px-5 py-2 text-xs font-semibold transition-colors hover:bg-accent sm:px-4 sm:text-sm"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-2xl bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4 sm:text-sm"
                            >
                                Register
                            </Link>
                        </div>
                    )}


                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger
                            aria-label="Open navigation menu"
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-accent md:hidden"
                        >
                            <Menu className="size-5" />
                        </SheetTrigger>

                        <SheetContent
                            side="right"
                            className="flex w-[280px] flex-col gap-0 border-l border-border bg-background p-0 sm:w-[320px]"
                        >
                            <SheetHeader className="border-b border-border px-5 py-6 pr-12 text-left">
                                <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                                    <Image
                                        src="/logo.png"
                                        alt="StudioSpace logo"
                                        width={30}
                                        height={30}
                                        className="shrink-0"
                                    />
                                    StudioSpace
                                </SheetTitle>

                                <SheetDescription className="text-xs leading-relaxed">
                                    Find the perfect creative space for your next project.
                                </SheetDescription>
                            </SheetHeader>

                            <nav
                                aria-label="Mobile navigation"
                                className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6"
                            >
                                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    Navigation
                                </p>

                                {navLinks.map((link) => {
                                    const active = isActive(link.href);

                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            aria-current={active ? "page" : undefined}
                                            className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${active
                                                ? "bg-primary/10 text-primary"
                                                : "text-foreground hover:bg-accent"
                                                }`}
                                        >
                                            {link.name}
                                            {active && (
                                                <span className="ml-auto size-1.5 rounded-full bg-primary" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
