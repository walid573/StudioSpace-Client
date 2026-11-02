'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    CalendarDays,
    CirclePlus,
    LayoutGrid,
    List,
    LogOut,
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
import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const menuItemClass =
    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Booking = { _id: string; status: string };


const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const { data: session, isPending } = authClient.useSession();
    const user = session?.user;
    const email = user?.email;
    async function loadBookings() {
        if (!email) {
            setBookings([]);
            return;
        }

        try {
            const token = await getTokenFromClient();
            const headers: Record<string, string> = { Accept: "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/my-bookings/${encodeURIComponent(email)}`, {
                cache: "no-store",
                credentials: "include",
                headers,
            });

            if (!res.ok) {
                setBookings([]);
                return;
            }

            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch {
            setBookings([]);
        }
    }

    useEffect(() => {
        loadBookings();
    }, [email]);

    const bookingCount = bookings.length
    async function handleSignOut() {
        await authClient.signOut();
        router.replace("/");
    }
    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Explore Studios", href: "/studios" },
        { name: "How It Works", href: "/how-it-works" },
        { name: "About Us", href: "/about-us" },
    ];

    return (
        <nav className="border-b border-border">
            <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-4 px-4 py-4 sm:px-6 md:grid-cols-3 lg:px-8">
                <div>
                    <Link href={'/'} className="flex gap-2 items-center ">
                        <Image src='/logo.png' alt="StudioSpace logo" width={28} height={28} ></Image>
                        <h2 className="text-xl whitespace-nowrap text-foreground">StudioSpace</h2>
                    </Link>
                </div>

                <div className="hidden gap-2 md:flex">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? "border-b-2 border-primary text-foreground"
                                    : "text-foreground/80 hover:text-foreground"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex gap-2 justify-end">
                    {isPending ? (
                        <div
                            aria-hidden="true"
                            className="size-9 animate-pulse rounded-full bg-muted"
                        />
                    ) : user ? (
                        <>
                          <ThemeToggle />
                          <Popover onOpenChange={(open) => open && loadBookings()}>
                            <PopoverTrigger
                                aria-label="Open account menu"
                                className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                            >
                                <Avatar size="lg" className="size-9 transition-opacity hover:opacity-85">
                                    <AvatarImage
                                        referrerPolicy="no-referrer"
                                        src={user?.image ?? undefined}
                                        alt={user?.name ?? "Profile"}
                                    />
                                    <AvatarFallback className="bg-primary text-md font-medium text-primary-foreground">
                                        {user?.name?.charAt(0) ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </PopoverTrigger>

                            <PopoverContent
                                align="end"
                                sideOffset={10}
                                className="relative w-[300px] gap-0 rounded-xl bg-popover p-0 text-popover-foreground shadow-[0_18px_45px_rgba(0,0,0,0.22)] ring-border"
                            >
                                <span
                                    aria-hidden="true"
                                    className="absolute -top-[5px] right-[13px] size-2.5 rotate-45 rounded-[2px] border-t border-l border-border bg-popover"
                                />

                                <PopoverHeader className="px-5 pt-4 pb-3">
                                    <PopoverTitle className="text-[15px] font-semibold text-popover-foreground">
                                        {user?.name}
                                    </PopoverTitle>
                                    <PopoverDescription className="mt-0.5 text-[12px] text-muted-foreground">
                                        {user?.email}
                                    </PopoverDescription>
                                </PopoverHeader>

                                <div className="mx-5 h-px bg-border" />

                                <div className="px-4 py-1.5">
                                    <button type="button" className={menuItemClass}>
                                        <UserRound className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
                                        <Link href={'/profile'} className="text-popover-foreground">Profile</Link>

                                    </button>

                                    <button type="button" className={menuItemClass}>
                                        <LayoutGrid className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
                                        <Link href={'/dashboard'} className="text-popover-foreground">Dashboard</Link>

                                    </button>

                                    <button type="button" className={menuItemClass}>
                                        <CirclePlus className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
                                        <Link href={'/add-studio'} className="text-popover-foreground">Add New Studio</Link>

                                    </button>

                                    <button type="button" className={menuItemClass}>
                                        <List className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
                                        <Link href={'/my-listings'} className="text-popover-foreground">My Studio Listings</Link>

                                    </button>

                                    <button type="button" className={menuItemClass}>
                                        <CalendarDays className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
                                        <Link href={'/my-bookings'} className="text-popover-foreground">My Bookings</Link>

                                        <span className="ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                                            {bookingCount}
                                        </span>
                                    </button>

                                    <div className="mx-1 my-1.5 h-px bg-border" />

                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
                                    >
                                        <LogOut className="size-[18px] shrink-0" strokeWidth={1.8} />
                                        Logout
                                    </button>
                                </div>
                            </PopoverContent>
                          </Popover>
                        </>
                    ) : (
                        <>
                            <ThemeToggle />
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-accent"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-3xl bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
