"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import HeroSlide from "./HeroSlide";
import { slides } from "./slides";

export default function HeroSection() {
  return (
    <Swiper className="hero-swiper" modules={[Autoplay, Pagination]} loop autoplay={{ delay: 5000, disableOnInteraction: false }} pagination={{ clickable: true }}>
      {slides.map((s, i) => (
        <SwiperSlide key={s.tag}><HeroSlide slide={s} priority={i === 0} /></SwiperSlide>
      ))}
    </Swiper>
  );
}
