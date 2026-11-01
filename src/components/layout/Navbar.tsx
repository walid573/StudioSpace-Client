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
import { useRouter } from "next/navigation";

const menuItemClass =
    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:bg-neutral-100 focus-visible:outline-none";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

type Booking = { _id: string; status: string };


const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const { data: session, isPending } = authClient.useSession();
    const user = session?.user;
    const email = user?.email;
    function loadBookings() {
        if (!email) return;
        fetch(`http://localhost:8000/my-bookings/${encodeURIComponent(email)}`, { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => setBookings(Array.isArray(data) ? data : []));
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
        <nav className="border-b border-[#333]">
            <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-4 px-4 py-4 text-white sm:px-6 md:grid-cols-3 lg:px-8">
                <div>
                    <Link href={'/'} className="flex gap-2 items-center ">
                        <Image src='/logo.png' alt="StudioSpace logo" width={28} height={28} ></Image>
                        <h2 className="text-xl whitespace-nowrap">StudioSpace</h2>
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
                                    ? "border-b  text-white"
                                    : "text-white  hover:text-gray-300"
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
                            className="size-9 animate-pulse rounded-full bg-white/10"
                        />
                    ) : user ? (
                        <Popover onOpenChange={(open) => open && loadBookings()}>
                            <PopoverTrigger
                                aria-label="Open account menu"
                                className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                            >
                                <Avatar size="lg" className="size-9 transition-opacity hover:opacity-85">
                                    <AvatarImage
                                        referrerPolicy="no-referrer"
                                        src={user?.image ?? undefined}
                                        alt={user?.name ?? "Profile"}
                                    />
                                    <AvatarFallback className="bg-white text-md font-medium text-black">
                                        {user?.name?.charAt(0) ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </PopoverTrigger>

                            <PopoverContent
                                align="end"
                                sideOffset={10}
                                className="relative w-[300px] gap-0 rounded-xl bg-white p-0 text-neutral-900 shadow-[0_18px_45px_rgba(0,0,0,0.22)] ring-black/5"
                            >
                                <span
                                    aria-hidden="true"
                                    className="absolute -top-[5px] right-[13px] size-2.5 rotate-45 rounded-[2px] border-t border-l border-black/5 bg-white"
                                />

                                <PopoverHeader className="px-5 pt-4 pb-3">
                                    <PopoverTitle className="text-[15px] font-semibold text-neutral-900">
                                        {user?.name}
                                    </PopoverTitle>
                                    <PopoverDescription className="mt-0.5 text-[12px] text-neutral-500">
                                        {user?.email}
                                    </PopoverDescription>
                                </PopoverHeader>

                                <div className="mx-5 h-px bg-neutral-200" />

                                <div className="px-4 py-1.5">
                                    <button type="button" className={menuItemClass}>
                                        <UserRound className="size-[18px] shrink-0 text-neutral-600" strokeWidth={1.8} />
                                        <Link href={'/profile'}>Profile</Link>

                                    </button>

                                    <button type="button" className={menuItemClass}>
                                        <LayoutGrid className="size-[18px] shrink-0 text-neutral-600" strokeWidth={1.8} />
                                        <Link href={'/dashboard'}>Dashboard</Link>

                                    </button>

                                    <button type="button" className={menuItemClass}>
                                        <CirclePlus className="size-[18px] shrink-0 text-neutral-600" strokeWidth={1.8} />
                                        <Link href={'/add-studio'}>Add New Studio</Link>

                                    </button>

                                    <button type="button" className={menuItemClass}>
                                        <List className="size-[18px] shrink-0 text-neutral-600" strokeWidth={1.8} />
                                        <Link href={'/my-listings'}>My Studio Listings</Link>

                                    </button>

                                    <button type="button" className={menuItemClass}>
                                        <CalendarDays className="size-[18px] shrink-0 text-neutral-600" strokeWidth={1.8} />
                                        <Link href={'/my-bookings'}>My Bookings</Link>

                                        <span className="ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold leading-none text-white">
                                            {bookingCount}
                                        </span>
                                    </button>

                                    <div className="mx-1 my-1.5 h-px bg-neutral-200" />

                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none"
                                    >
                                        <LogOut className="size-[18px] shrink-0" strokeWidth={1.8} />
                                        Logout
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-2xl border border-[#333333] px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-white/5"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-3xl bg-white px-4 py-2 text-sm font-medium whitespace-nowrap text-black transition-colors hover:bg-neutral-200"
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
