import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

// Videos from public/hero-videos/ — place video1.mp4, video2.mp4, video3.mp4, video4.mp4 there
const VIDEO_COUNT = 4;
const videos = Array.from({ length: VIDEO_COUNT }, (_, i) => `/hero-videos/video${i + 1}.mp4`);

export default function Hero() {
  const [index, setIndex] = useState(0);
  const videoRefs = useRef([]);

  // Play only the active video, pause others and start active from 0
  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === index) {
        el.currentTime = 0;
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [index]);

  // Advance to next slide when the current video finishes (play full video)
  const handleVideoEnded = () => {
    setIndex((i) => (i + 1) % videos.length);
  };

  const goToSlide = (slideIndex) => {
    setIndex(slideIndex);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* BACKGROUND VIDEO CAROUSEL */}
      {videos.map((src, i) => (
        <video
          key={src}
          ref={(el) => { videoRefs.current[i] = el; }}
          src={src}
          muted
          playsInline
          onEnded={handleVideoEnded}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            index === i ? "opacity-100 z-0" : "opacity-0 z-0"
          }`}
          aria-hidden={index !== i}
        />
      ))}

      {/* PREMIUM GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/90 z-10" />

      {/* FLOATING GLOW ELEMENTS */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl opacity-40 animate-float-premium pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-md h-112 bg-indigo-500/10 rounded-full blur-3xl opacity-30 animate-float-premium pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* CONTENT — left-aligned, slightly above center */}
      <div className="relative z-20 h-full flex flex-col justify-center items-start text-left px-6 sm:px-10 md:px-14 lg:px-20 max-w-3xl -translate-y-[4%]">
        <h1
          className="
              text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight
              drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]
              animate-reveal-zoom
          "
        >
          Transform Your Look with{" "}
          <span className="bg-gradient-to-r from-sky-400 via-white to-sky-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer drop-shadow-sm">
            AI Precision
          </span>
        </h1>

        <p className="text-sm md:text-base lg:text-lg text-gray-300 mt-4 max-w-xl leading-relaxed animate-fade-in-up [animation-delay:200ms] [animation-fill-mode:both]">
          Smarter, personalized hairstyle, beard, makeup and grooming
          suggestions — uniquely for{" "}
          <span className="text-white font-semibold">your face shape</span>.
        </p>

        <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8 animate-fade-in-up [animation-delay:400ms] [animation-fill-mode:both]">
          <a
            href="/face-analyzer"
            className="
              px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-linear-to-r from-sky-500 to-cyan-400 text-slate-900
              shadow-[0_0_24px_rgba(56,189,248,0.4)]
              hover:shadow-[0_0_32px_rgba(56,189,248,0.6)]
              animate-glow-pulse
              hover:scale-[1.03] active:scale-[0.98]
              transition-all duration-300
              flex items-center gap-1.5
              group relative overflow-hidden
            "
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Start Analysis <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-linear-to-r from-sky-400 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
          <a
            href="/faceshapesteps"
            className="
              px-5 py-2.5 rounded-xl text-sm font-semibold text-white/90
              border-2 border-white/40 backdrop-blur-md
              hover:bg-white/10 hover:border-white/60
              hover:scale-[1.03] active:scale-[0.98]
              transition-all duration-300
            "
          >
            How it works
          </a>
        </div>
      </div>

      {/* PAGINATION SCROLLER — same style as Makeup Virtual Try page */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-40">
        {videos.map((_, slideIndex) => (
          <button
            key={slideIndex}
            type="button"
            onClick={() => goToSlide(slideIndex)}
            className={`transition-all ${
              slideIndex === index
                ? "w-10 h-1 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                : "w-10 h-1 border-t-2 border-dashed border-white/60 rounded-full"
            }`}
            aria-label={`Slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
