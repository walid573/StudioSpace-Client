import Image from "next/image";
import Link from "next/link";
import type { Slide } from "./slides";

export default function HeroSlide({ slide, priority = false }: { slide: Slide; priority?: boolean }) {
  return (
    <section className="bg-[#0A0A0A] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:px-8 lg:py-20">
        <div className="max-w-[34rem]">
          <span className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-[13px] font-medium text-neutral-200">
            {slide.tag}
          </span>
          <h1 className="mt-6 text-[clamp(2.5rem,5.2vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
            {slide.title}
          </h1>
          <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-neutral-400">{slide.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/studios" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-[15px] font-medium text-neutral-950 hover:bg-neutral-200">
              Explore Studios
            </Link>
            <Link href="/studios" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-[15px] font-medium hover:bg-white/5">
              Host Your Space
            </Link>
          </div>
        </div>
        <div className="relative isolate aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[7/6]">
          <Image src={slide.image} alt={slide.alt} fill priority={priority}
            sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover brightness-[0.85]" />
        </div>
      </div>
    </section>
  );
}