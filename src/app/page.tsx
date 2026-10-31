import { Suspense } from "react";
import CatergorySection from "@/components/home/CatergorySection";
import FeaturedStudios, { FeaturedStudiosSkeleton } from "@/components/home/FeaturedStudios";
import HeroSection from "@/components/home/HeroSection";
import HeroSlide from "@/components/home/HeroSlide";
import { slides } from "@/components/home/slides";

export default function Home() {
  return (
    <div>
      
      <Suspense fallback={<HeroSlide slide={slides[0]} priority />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<FeaturedStudiosSkeleton />}>
        <FeaturedStudios />
      </Suspense>
      <CatergorySection />
    </div>
  );
}
