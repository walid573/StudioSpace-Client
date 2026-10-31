'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
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
                        <Image src='/logo.png' alt="This a logo" width={28} height={28} ></Image>
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
                    <Button className='bg-transparent rounded-2xl py-4 px-4 border border-[#333333] whitespace-nowrap'>Login</Button>
                    <Button className='bg-white text-black hover:text-white rounded-3xl py-3 px-3 outline-none whitespace-nowrap'>Register</Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;