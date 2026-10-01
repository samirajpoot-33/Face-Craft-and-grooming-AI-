import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "../components/ScrollReveal";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Upload,
  Camera,
  Info,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Wand2,
  ArrowRight,
} from "lucide-react";
import img1 from "../assets/makeup/slide1.jpeg";
import img2 from "../assets/makeup/slide2.png";
import img3 from "../assets/makeup/slide3.jpeg";
// Step images - Located in: frontend/public/makeup-steps/
const step1Img = "/makeup-steps/step1.jpeg";
const step2Img = "/makeup-steps/step2.jpeg";
const step3Img = "/makeup-steps/step3.jpeg";
import { MakeupArProvider, useMakeupAr } from "../context/MakeupArContext";
import MakeupViewer from "../components/makeup-ar/MakeupViewer";
import MakeupControls from "../components/makeup-ar/MakeupControls";
import FeaturesPanel from "../components/makeup-ar/FeaturesPanel";

const carouselSlides = [
  { id: 1, src: img1 },
  { id: 2, src: img2 },
  { id: 3, src: img3 },
];

function MakeupArWorkspace() {
  const { isLoading, error } = useMakeupAr();
  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center">
        <p className="text-amber-800 font-medium mb-2"> WebAR token required</p>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <p className="text-gray-700 text-xs">
          Add <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">VITE_MAKEUP_CLIENT_TOKEN</code> to{" "}
          <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">.env</code>. Get a trial token at{" "}
          <a
            href="https://www.makeup.com/face-filters-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 hover:underline font-medium"
          >
            makeup.com
          </a>{" "}
          or email info@makeup.com.
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Copy <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">public/ar-assets/</code> from beauty-web-master/assets (Makeup_new_morphs.zip, textures, looks, luts).
        </p>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[420px] rounded-2xl bg-white border border-slate-200 shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-400 border-t-transparent" />
        <span className="ml-3 text-gray-600">Loading AI MakeUp Engine</span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr_16rem] gap-4 lg:gap-5 items-start max-w-[1680px] mx-auto">
      <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-4 lg:self-start h-[400px] lg:h-[500px]">
        <MakeupControls />
      </aside>
      <main className="flex flex-col w-full h-[400px] lg:h-[500px]">
        <MakeupViewer />
      </main>
      <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-4 lg:self-start hidden lg:block h-[400px] lg:h-[500px]">
        <FeaturesPanel />
      </aside>
    </div>
  );
}

export default function MakeupVirtualTry() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const carouselRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const makeupSectionRef = useRef(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const scrollToMakeupSection = () => {
    makeupSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const scrollToSectionIfHash = () => {
      if (window.location.hash === "#makeup") {
        setTimeout(() => {
          makeupSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
      }
    };
    scrollToSectionIfHash();
    window.addEventListener("hashchange", scrollToSectionIfHash);
    return () => window.removeEventListener("hashchange", scrollToSectionIfHash);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      scrollToMakeupSection();
    }
    e.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraFile = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      scrollToMakeupSection();
    }
    e.target.value = "";
  };

  return (
    <div className="w-full">
      {/* Hero Section - Full Screen (same color theme as homepage Hero) */}
      <div className="relative h-screen w-full overflow-hidden bg-black">
        {/* Simple action buttons above hero */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
         
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleCameraFile}
            className="hidden"
          />
        </div>

        {/* Full-screen image carousel */}
        <div className="absolute inset-0">
          <div
            ref={carouselRef}
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselSlides.map((slide) => (
              <div key={slide.id} className="w-full h-full shrink-0 relative">
                <img
                  src={slide.src}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                  style={{ imageRendering: "high-quality" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Overlay – same as homepage Hero */}
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/90 z-10" />

        {/* Floating glow elements – same as homepage Hero */}
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl opacity-40 animate-float-premium pointer-events-none z-10" />
        <div className="absolute -bottom-32 -right-32 w-64 h-[28rem] bg-indigo-500/10 rounded-full blur-3xl opacity-30 animate-float-premium pointer-events-none z-10" style={{ animationDelay: '2s' }} />

        {/* Heading & content – same placement as homepage Hero (padding, max-width, vertical offset) */}
        <div className="absolute left-0 top-0 h-full z-20 flex flex-col justify-center items-start text-left pl-6 sm:pl-10 md:pl-14 lg:pl-20 -translate-y-[4%]">
          <div className="max-w-3xl w-full">
            <h1
              className="
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight
                drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]
                mb-4 animate-reveal-zoom leading-tight
              "
            >
              Try Every Look,
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-white to-sky-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer drop-shadow-sm">
                Instantly with AI
              </span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-300 mt-4 max-w-xl leading-relaxed animate-fade-in-up [animation-delay:200ms] [animation-fill-mode:both]">
              The ultimate 3D AR tech enables precise, personalized virtual makeup trials — uniquely for{" "}
              <span className="text-white font-semibold">your style</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8 animate-fade-in-up [animation-delay:400ms] [animation-fill-mode:both]">
              <Link
                to="/#how-it-works"
                className="
                  px-5 py-2.5 rounded-xl text-sm font-semibold text-white/90
                  border-2 border-white/40 backdrop-blur-md
                  hover:bg-white/10 hover:border-white/60
                  hover:scale-[1.03] active:scale-[0.98]
                  transition-all duration-300
                  flex items-center justify-center gap-1.5
                "
              >
                <Info size={18} />
                LEARN MORE
              </Link>
              <button
                type="button"
                onClick={scrollToMakeupSection}
                className="
                  px-5 py-2.5 rounded-xl text-sm font-semibold
                  bg-linear-to-r from-sky-500 to-cyan-400 text-slate-900
                  shadow-[0_0_24px_rgba(56,189,248,0.4)]
                  hover:shadow-[0_0_32px_rgba(56,189,248,0.6)]
                  animate-glow-pulse
                  hover:scale-[1.03] active:scale-[0.98]
                  transition-all duration-300
                  flex items-center justify-center gap-1.5
                "
              >
                <Sparkles size={18} />
                TRY WEB DEMO
              </button>
            </div>
            
          </div>
        </div>

        {/* Pagination scroller – bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
         

          <div className="flex items-center gap-2.5">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentSlide
                    ? "w-10 h-1 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                    : "w-10 h-1 border-t-2 border-dashed border-white/60 rounded-full"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          

          
        </div>
      </div>

      {/* How It Works - 3 Step Guide (site theme: light bg, white cards) */}
      <section className="w-full bg-page py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                How Does AI Makeup Transfer Work?
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the magic of AI-powered makeup replication in three simple steps
            </p>
          </ScrollReveal>

          {/* 3 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-12">
            {/* Step 1 */}
            <ScrollReveal delay={0.1} className="group relative">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-sky-500/5 hover:shadow-[0_12px_35px_rgba(56,189,248,0.2)] hover:border-sky-200 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-200 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-extrabold text-sky-600">1</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-sky-500/15 group-hover:border-sky-200 transition-all">
                    <BookOpen className="text-slate-600 group-hover:text-sky-600" size={20} />
                  </div>
                </div>

                {/* Step Image */}
                <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-slate-200 group-hover:border-sky-300 transition-all">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <img 
                      src={step1Img}
                      alt="Step 1: Find Makeup Inspiration"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement;
                        if (fallback && !fallback.querySelector('.step-fallback')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'step-fallback flex flex-col items-center justify-center h-full text-center p-4';
                          placeholder.innerHTML = `
                            <div class="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500/30 flex items-center justify-center mb-4">
                              <svg class="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                              </svg>
                            </div>
                            <p class="text-gray-500 text-sm">Add step1.jpeg to<br/>public/makeup-steps/</p>
                          `;
                          fallback.appendChild(placeholder);
                        }
                      }}
                    />
                    
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Have a Makeup Inspiration?</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Snap a makeup look from any social media or print ad. Find your perfect style inspiration!
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => makeupSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="w-full px-6 py-3 rounded-xl bg-sky-500/10 border-2 border-sky-300 text-sky-700 font-semibold hover:bg-sky-500/20 hover:border-sky-400 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                >
                  <span>Try Now</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal delay={0.2} className="group relative">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-sky-500/5 hover:shadow-[0_12px_35px_rgba(56,189,248,0.2)] hover:border-sky-200 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-200 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-extrabold text-cyan-600">2</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-cyan-500/15 group-hover:border-cyan-200 transition-all">
                    <ImageIcon className="text-slate-600 group-hover:text-cyan-600" size={20} />
                  </div>
                </div>

                {/* Step Image */}
                <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-slate-200 group-hover:border-cyan-300 transition-all">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <img 
                      src={step2Img}
                      alt="Step 2: Upload Selfie & Reference"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement;
                        if (fallback && !fallback.querySelector('.step-fallback')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'step-fallback flex flex-col items-center justify-center h-full text-center p-4';
                          placeholder.innerHTML = `
                            <div class="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-500/30 flex items-center justify-center mb-4">
                              <svg class="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                            <p class="text-gray-500 text-sm">Add step2.jpeg to<br/>public/makeup-steps/</p>
                          `;
                          fallback.appendChild(placeholder);
                        }
                      }}
                    />
                   
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Selfie & Referenced Look</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Upload your selfie and desired makeup look. Experience the magic of AI-powered transformation!
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => makeupSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="w-full px-6 py-3 rounded-xl bg-cyan-500/10 border-2 border-cyan-300 text-cyan-700 font-semibold hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                >
                  <span>Try Now</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={0.3} className="group relative">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-sky-500/5 hover:shadow-[0_12px_35px_rgba(56,189,248,0.2)] hover:border-sky-200 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-200 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-extrabold text-sky-600">3</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-sky-500/15 group-hover:border-sky-200 transition-all">
                    <Wand2 className="text-slate-600 group-hover:text-sky-600" size={20} />
                  </div>
                </div>

                {/* Step Image */}
                <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-slate-200 group-hover:border-sky-300 transition-all">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <img 
                      src={step3Img}
                      alt="Step 3: Instant Makeup Replication"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement;
                        if (fallback && !fallback.querySelector('.step-fallback')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'step-fallback flex flex-col items-center justify-center h-full text-center p-4';
                          placeholder.innerHTML = `
                            <div class="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center mb-4">
                              <svg class="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                              </svg>
                            </div>
                            <p class="text-gray-500 text-sm">Add step3.jpeg to<br/>public/makeup-steps/</p>
                          `;
                          fallback.appendChild(placeholder);
                        }
                      }}
                    />
                    {/* Sparkles Icon Overlay */}
                    <div className="absolute top-3 right-3 flex gap-1">
                      <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-200 flex items-center justify-center shadow-lg">
                        <Sparkles className="text-sky-600" size={12} />
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-200 flex items-center justify-center shadow-lg">
                        <Sparkles className="text-sky-600" size={12} />
                      </div>
                    </div>
                   
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Makeup Replication</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    The technology extracts makeup looks in real-time, creating an exact 1:1 makeup match from any reference image.
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => makeupSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="w-full px-6 py-3 rounded-xl bg-sky-500/10 border-2 border-sky-300 text-sky-700 font-semibold hover:bg-sky-500/20 hover:border-sky-400 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                >
                  <span>Try Now</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Connector Arrows (Desktop Only) */}
          
        </div>
      </section>

      {/* Makeup Virtual Try-On Section (site theme: light bg) */}
      <section
        id="makeup"
        ref={makeupSectionRef}
        className="min-h-screen w-full bg-section py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-200 mb-4">
              <Sparkles className="text-sky-600" size={32} />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                Virtual Makeup Try-On
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Upload your photo and try different makeup styles instantly with AI-powered virtual try-on technology
            </p>
          </ScrollReveal>

          {/* Makeup WebAR Makeup Try-On */}
          <MakeupArProvider>
            <MakeupArWorkspace />
          </MakeupArProvider>

          {/* Tips Section */}
          <ScrollReveal delay={0.4} className="mt-12 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-sky-500/5">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tips for Best Results</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-section border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center mb-3">
                  <Camera className="text-sky-600" size={20} />
                </div>
                <h4 className="text-gray-900 font-semibold text-sm mb-1">Clear Photo</h4>
                <p className="text-gray-600 text-xs">Use a well-lit, front-facing photo</p>
              </div>
              <div className="p-4 rounded-xl bg-section border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center mb-3">
                  <Sparkles className="text-cyan-600" size={20} />
                </div>
                <h4 className="text-gray-900 font-semibold text-sm mb-1">Face Visible</h4>
                <p className="text-gray-600 text-xs">Ensure your full face is clearly visible</p>
              </div>
              <div className="p-4 rounded-xl bg-section border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center mb-3">
                  <Sparkles className="text-sky-600" size={20} />
                </div>
                <h4 className="text-gray-900 font-semibold text-sm mb-1">Try Different Styles</h4>
                <p className="text-gray-600 text-xs">Experiment with Looks, LUTs, and sliders</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
