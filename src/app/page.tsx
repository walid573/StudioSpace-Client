import { Suspense } from "react";
import CatergorySection from "@/components/home/CatergorySection";
import BookAndHost from "@/components/home/BookAndHost";
import FeaturedStudios, { FeaturedStudiosSkeleton } from "@/components/home/FeaturedStudios";
import HeroSection from "@/components/home/HeroSection";
import HeroSlide from "@/components/home/HeroSlide";
import HowItWorks from "@/components/home/HowItWorks";
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
      <HowItWorks />
      <BookAndHost />
      
    </div>
  );
}
