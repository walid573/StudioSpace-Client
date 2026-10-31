export type Slide = { tag: string; title: string; text: string; image: string; alt: string };

export const slides: Slide[] = [
  { tag: "Photo Studios", title: "Find the room where your next project happens.",
    text: "Reserve photo cycs, sound stages, podcast lounges and music suites by the hour, with transparent pricing.",
    image: "/images/hero-cyclorama.png", alt: "Empty white cyclorama studio with large factory windows" },
  { tag: "Sound Stages", title: "Shoot your film on a real stage.",
    text: "Book fully lit stages with power, grip and green rooms included.",
    image: "/images/hero-stage.png", alt: "Large production stage with high ceilings and daylight" },
  { tag: "Music Suites", title: "Record where the sound is right.",
    text: "Treated rooms, pro consoles and monitors, ready when you are.",
    image: "/images/hero-music.png", alt: "Recording suite with a mixing console and monitor speakers" },
];
