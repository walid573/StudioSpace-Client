'use client'

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";





const Navbar = () => {
    const pathname = usePathname();

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
                </div>
            </div>
        </nav>
    );
};

export default Navbar;