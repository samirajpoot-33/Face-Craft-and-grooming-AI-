import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ScrollReveal from "../components/ScrollReveal";
import TryOnProcessingAnimation from "../components/TryOnProcessingAnimation";
import BeardStyleThumbnail from "../components/BeardStyleThumbnail";
import { swapHairstyle, getHairstyleStyles, swapBeard, getBeardStyles } from "../utils/api";
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
  Scissors,
  RefreshCw,
  Download,
  X,
} from "lucide-react";

// Hairstyle Assets
import step1Img from "../assets/hairstyles/step1.png";
import step2Img from "../assets/hairstyles/step2.png";
import step3Img from "../assets/hairstyles/step3.png";
import slideMale1 from "../assets/hairstyles/slide_male_1.png";
import slideFemale1 from "../assets/hairstyles/slide_female_1.png";
import slideMale2 from "../assets/hairstyles/slide_male_2.png";
import slideFemale2 from "../assets/hairstyles/slide_female_2.png";

const carouselSlides = [
  { id: 1, src: slideMale1, title: "Sharp & Sculpted", description: "Find your perfect signature hairstyle and groomed beard combination." },
  { id: 2, src: slideFemale1, title: "Chic & Sophisticated", description: "Try elegant short cuts like a flawless modern bob instantly." },
  { id: 3, src: slideMale2, title: "Classic Full Beard", description: "Discover bold, masculine styles and clean, refined grooming." },
  { id: 4, src: slideFemale2, title: "Voluminous Curls", description: "See yourself with beautiful, bouncy long curls and rich textures." },
];

const hairstyleCategories = [
  { id: "short", name: "Short", icon: "💇‍♂️" },
  { id: "medium", name: "Medium", icon: "💇‍♀️" },
  { id: "long", name: "Long", icon: "👱‍♀️" },
  { id: "curly", name: "Curly", icon: "👩‍🦱" },
  { id: "fade", name: "Fade/Buzz", icon: "👨‍🦲" },
];

export default function HairstyleTryOn() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("female");
  const [userImage, setUserImage] = useState(null);
  const [userImageFile, setUserImageFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [swapError, setSwapError] = useState(null);
  const [processingHint, setProcessingHint] = useState("");
  const [styleCatalog, setStyleCatalog] = useState(null);
  const [lastAppliedLabel, setLastAppliedLabel] = useState(null);

  const [beardUserImage, setBeardUserImage] = useState(null);
  const [beardUserImageFile, setBeardUserImageFile] = useState(null);
  const [beardCatalog, setBeardCatalog] = useState(null);
  const [selectedBeardStyle, setSelectedBeardStyle] = useState(null);
  const [beardResultImage, setBeardResultImage] = useState(null);
  const [beardIsProcessing, setBeardIsProcessing] = useState(false);
  const [beardSwapError, setBeardSwapError] = useState(null);
  const [beardProcessingHint, setBeardProcessingHint] = useState("");
  const [lastBeardLabel, setLastBeardLabel] = useState(null);
  const [beardOnHairstyleResult, setBeardOnHairstyleResult] = useState(false);

  const carouselRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const tryOnSectionRef = useRef(null);
  const beardTryOnSectionRef = useRef(null);
  const beardFileInputRef = useRef(null);
  const beardCameraInputRef = useRef(null);

  // Live Camera States and Refs
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState("hair"); // "hair" | "beard"
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCameraOpen(false);
    setCameraError("");
  };

  useEffect(() => {
    if (!cameraOpen) return;
    let stream = null;
    const startCamera = async () => {
      setCameraError("");
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraError("Camera not supported in this browser.");
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      } catch (err) {
        const msg =
          err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
            ? "Camera access was denied. Please allow camera permissions."
            : err.name === "NotFoundError"
              ? "No camera found."
              : "Could not start camera. Please try again.";
        setCameraError(msg);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-capture-${cameraMode}.jpg`, { type: "image/jpeg" });
        const preview = URL.createObjectURL(file);

        if (cameraMode === "beard") {
          setBeardUserImageFile(file);
          setBeardUserImage(preview);
          setBeardResultImage(null);
          setBeardSwapError(null);
          setBeardOnHairstyleResult(false);
        } else {
          setUserImageFile(file);
          setUserImage(preview);
          setResultImage(null);
          setSwapError(null);
          scrollToTryOn();
        }
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  useEffect(() => {
    getHairstyleStyles()
      .then((res) => {
        if (res?.success && res.data) setStyleCatalog(res.data);
      })
      .catch(() => {});
    getBeardStyles()
      .then((res) => {
        if (res?.success && res.data) setBeardCatalog(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const scrollToSectionIfHash = () => {
      if (window.location.hash === "#beard") {
        setTimeout(() => {
          beardTryOnSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
      } else if (window.location.hash === "#hairstyle") {
        setTimeout(() => {
          tryOnSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
      }
    };
    scrollToSectionIfHash();
    window.addEventListener("hashchange", scrollToSectionIfHash);
    return () => window.removeEventListener("hashchange", scrollToSectionIfHash);
  }, []);

  const styleIds = useMemo(() => {
    const cat = styleCatalog?.[selectedCategory];
    if (cat) {
      return Object.keys(cat)
        .map(Number)
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => a - b);
    }
    const fallbackCount = selectedCategory === "male" ? 22 : 28;
    return Array.from({ length: fallbackCount }, (_, i) => i + 1);
  }, [styleCatalog, selectedCategory]);

  const beardStyleIds = useMemo(() => {
    if (beardCatalog?.styles) {
      return Object.keys(beardCatalog.styles)
        .map(Number)
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => a - b);
    }
    const fallbackCount = beardCatalog?.count ?? 24;
    return Array.from({ length: fallbackCount }, (_, i) => i + 1);
  }, [beardCatalog]);

  const switchCategory = (category) => {
    setSelectedCategory(category);
    setSelectedStyle(null);
    setLastAppliedLabel(null);
    setResultImage(null);
    setSwapError(null);
  };

  const scrollToTryOn = () => {
    tryOnSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUserImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target.result);
        setResultImage(null);
        setSwapError(null);
        scrollToTryOn();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleApplyStyle = async () => {
    if (!userImageFile || !selectedStyle) return;

    setIsProcessing(true);
    setSwapError(null);
    setResultImage(null);
    setProcessingHint("Connecting to AI stylist…");

    try {
      setProcessingHint("Crafting your new look — 15–60 seconds");
      const response = await swapHairstyle(userImageFile, {
        gender: selectedCategory,
        styleId: selectedStyle,
      });
      setResultImage(response.data?.resultImageUrl || null);
      setLastAppliedLabel(response.data?.hairStyleLabel || null);
      setProcessingHint("");
    } catch (err) {
      const msg = err.message || "Hairstyle swap failed. Check your photo and try again.";
      if (msg.includes("credits") || msg.includes("Credits") || msg.includes("Insufficient")) {
        setSwapError(msg + " Redirecting to pricing in 3 seconds...");
        setTimeout(() => navigate("/pricing"), 3000);
      } else {
        setSwapError(msg);
      }
      setProcessingHint("");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTryOn = () => {
    setUserImage(null);
    setUserImageFile(null);
    setResultImage(null);
    setSelectedStyle(null);
    setSwapError(null);
    setProcessingHint("");
    setLastAppliedLabel(null);
  };

  const resetBeardTryOn = () => {
    setBeardUserImage(null);
    setBeardUserImageFile(null);
    setBeardResultImage(null);
    setSelectedBeardStyle(null);
    setBeardSwapError(null);
    setBeardProcessingHint("");
    setLastBeardLabel(null);
    setBeardOnHairstyleResult(false);
  };

  const handleBeardFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setBeardUserImageFile(file);
      setBeardOnHairstyleResult(false);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBeardUserImage(event.target.result);
        setBeardResultImage(null);
        setBeardSwapError(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const hasBeardPhotoSource =
    (beardOnHairstyleResult && !!resultImage) || !!beardUserImage;

  const beardPreviewSrc =
    beardOnHairstyleResult && resultImage ? resultImage : beardUserImage;

  const scrollToBeardTryOn = () => {
    beardTryOnSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApplyBeard = async () => {
    if (!selectedBeardStyle) return;
    if (!hasBeardPhotoSource) return;

    setBeardIsProcessing(true);
    setBeardSwapError(null);
    setBeardResultImage(null);
    setBeardProcessingHint("Sending to AI (~uses API credits)…");

    try {
      setBeardProcessingHint("Generating beard — usually 15–90 seconds. Please wait…");

      let response;
      if (beardOnHairstyleResult && resultImage) {
        response = await swapBeard(null, {
          styleId: selectedBeardStyle,
          sourceImageUrl: resultImage,
        });
      } else {
        if (!beardUserImageFile) {
          throw new Error("Upload a photo in the beard section first.");
        }
        response = await swapBeard(beardUserImageFile, { styleId: selectedBeardStyle });
      }

      if (!response?.data?.resultImageUrl) {
        throw new Error("No result image returned. Try another photo or style.");
      }

      setBeardResultImage(response.data.resultImageUrl);
      setLastBeardLabel(response.data.beardLabel || null);
      setBeardProcessingHint("");
    } catch (err) {
      const msg = err.message || "Beard swap failed. Use a clear front-facing photo and try again.";
      if (msg.includes("credits") || msg.includes("Credits") || msg.includes("Insufficient")) {
        setBeardSwapError(msg + " Redirecting to pricing in 3 seconds...");
        setTimeout(() => navigate("/pricing"), 3000);
      } else {
        setBeardSwapError(msg);
      }
      setBeardProcessingHint("");
    } finally {
      setBeardIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-page">
      {/* Live Camera Capture Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-[0_25px_80px_-12px_rgba(0,0,0,0.25)] overflow-hidden animate-scale-in border border-slate-200/80">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">Capture your photo</h3>
              <button type="button" onClick={stopCamera} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-[4/3] bg-slate-900 flex items-center justify-center">
              {cameraError ? (
                <p className="text-sm text-red-500 px-6 text-center">{cameraError}</p>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50/80">
              <button type="button" onClick={stopCamera} className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={!cameraReady || !!cameraError}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hero Section */}
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
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="absolute inset-0">
          <div
            ref={carouselRef}
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselSlides.map((slide) => (
              <div key={slide.id} className="w-full h-full shrink-0 relative">
                <img
                  src={slide.src}
                  alt={slide.title}
                  className="w-full h-full object-cover object-top opacity-80"
                />
                <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/20 to-slate-950" />
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute left-0 top-0 h-full z-20 flex flex-col justify-center items-start text-left pl-6 sm:pl-10 md:pl-14 lg:pl-20 -translate-y-[4%]">

          <div className="max-w-4xl">
            <ScrollReveal>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] mb-4 animate-reveal-zoom leading-tight">
                Redefine Your Look <br />
                <span className="bg-gradient-to-r from-sky-400 via-white to-sky-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer drop-shadow-sm">
                  with AI Hairstyle Try-On
                </span>
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-gray-300 mt-4 max-w-xl leading-relaxed animate-fade-in-up [animation-delay:200ms] [animation-fill-mode:both]">
                Discover the perfect haircut for your face shape. Experiment with hundreds of styles instantly without stepping into a salon.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8 animate-fade-in-up [animation-delay:400ms] [animation-fill-mode:both]">

                <Link
                  to="/#how-it-works"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/90 border-2 border-white/40 backdrop-blur-md hover:bg-white/10 hover:border-white/60 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <Info size={18} />
                  LEARN MORE
                </Link>
                <button
                  type="button"
                  onClick={scrollToTryOn}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-sky-500 to-cyan-400 text-slate-900 shadow-[0_0_24px_rgba(56,189,248,0.4)] hover:shadow-[0_0_32px_rgba(56,189,248,0.6)] animate-glow-pulse hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={18} />
                  TRY WEB DEMO
                </button>

              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                index === currentSlide ? "w-8 bg-sky-400" : "w-8 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Your Transformation in <span className="text-sky-500">3 Easy Steps</span>
            </h2>
            <p className="text-slate-600 text-lg">AI-powered hairstyle swapping made simple and realistic.</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: 1,
                title: "Find Your Style",
                desc: "Choose from our curated collection of trendy hairstyles or upload an inspiration photo.",
                img: step1Img,
                icon: <Scissors className="text-sky-500" />
              },
              {
                step: 2,
                title: "Upload Your Selfie",
                desc: "Upload a clear, front-facing photo of yourself for the most accurate AI mapping.",
                img: step2Img,
                icon: <Camera className="text-cyan-500" />
              },
              {
                step: 3,
                title: "See the Magic",
                desc: "Our AI model seamlessly blends the new hairstyle with your features in seconds.",
                img: step3Img,
                icon: <Wand2 className="text-sky-500" />
              },
            ].map((item) => (
              <ScrollReveal key={item.step} delay={item.step * 0.1}>
                <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500">
                  <div className="relative mb-8 rounded-2xl overflow-hidden aspect-video">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 size-12 rounded-xl bg-white shadow-lg flex items-center justify-center text-xl font-bold text-sky-600">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">{item.icon}</div>
                    <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Main Try-On Workspace */}
      <section id="hairstyle" ref={tryOnSectionRef} className="py-24 px-6 bg-page text-slate-800 overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-400/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Section */}
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
              AI Hairstyle Changer: <br />
              <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
                Find Your Perfect Hairstyle
              </span>
            </h2>

            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Upload your photo and preview {styleCatalog?.counts?.female ?? 28} female or {styleCatalog?.counts?.male ?? 22} male AI styles. 
              See exactly how you'll look before visiting the salon — powered by cutting-edge AI.
            </p>

            {/* Stats */}
            <div className="flex justify-center items-center gap-8 md:gap-16 mt-10">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-black text-slate-900">50+</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Hairstyles</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-black text-slate-900">10s</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Results</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-black text-slate-900">50K+</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Happy Users</p>
              </div>
            </div>
          </ScrollReveal>

          {/* The Main Card */}
          <ScrollReveal delay={0.2}>
            <div className="bg-white/95 backdrop-blur-md border border-sky-100/80 rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_32px_-8px_rgba(56,189,248,0.12)]">
              
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center gap-2">
                  <Sparkles size={14} className="text-sky-600" />
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">AI-Powered Transformation</span>
                </div>
              </div>


              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Photo</h3>
                <p className="text-slate-500 text-sm">Use a front-facing selfie with good lighting for best results</p>
              </div>

              {/* Before / After */}
              {(userImage || resultImage) && (
                <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
                  <div className="rounded-2xl border border-slate-200/85 bg-slate-50/50 p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Before</p>
                    {userImage && (
                      <img src={userImage} alt="Original" className="w-full rounded-xl object-contain max-h-72 mx-auto" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl border p-3 transition-all duration-500 ${
                      isProcessing
                        ? "border-sky-400 bg-white shadow-[0_0_30px_rgba(56,189,248,0.15)]"
                        : "border-sky-200/60 bg-slate-50/50 shadow-sm"
                    }`}
                  >
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2 text-center">After</p>
                    {resultImage ? (
                      <img src={resultImage} alt="Hairstyle result" className="w-full rounded-xl object-contain max-h-72 mx-auto animate-fade-in" />
                    ) : isProcessing ? (
                      <TryOnProcessingAnimation
                        variant="hairstyle"
                        previewImage={userImage}
                        hint={processingHint}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-slate-500 text-sm text-center px-4">
                        Select a style and tap Swap
                      </div>
                    )}
                  </div>
                </div>
              )}

              {swapError && (
                <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
                  {swapError}
                </div>
              )}

              {/* Upload Zone */}
              <div 
                className="relative group cursor-pointer max-w-2xl mx-auto"
                onClick={() => !isProcessing && fileInputRef.current?.click()}
              >
                <div className="aspect-square md:aspect-[2.4/1] w-full rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/20 flex flex-col items-center justify-center p-6 transition-all group-hover:border-sky-500 group-hover:bg-sky-50/40 overflow-hidden">
                  {!userImage ? (
                    <>
                      <div className="size-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon size={32} className="text-sky-600" />
                      </div>
                      <p className="text-slate-800 font-semibold mb-1">Drop your photo here or <span className="text-sky-600">browse</span></p>
                      <p className="text-slate-500 text-xs">Supports JPG, PNG, WebP</p>
                    </>
                  ) : (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img src={userImage} alt="Preview" className="h-full object-contain rounded-xl" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <RefreshCw className="text-white" size={32} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload & Camera Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 hover:bg-slate-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <ImageIcon size={16} />
                  Choose file
                </button>
                <button
                  type="button"
                  onClick={() => { setCameraMode("hair"); setCameraOpen(true); }}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Camera size={16} />
                  Take photo
                </button>
              </div>

              {/* Gender Selection */}
              <div className="flex justify-center gap-3 mt-10">
                <button 
                  type="button"
                  onClick={() => switchCategory("female")}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === "female" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  Female ({styleCatalog?.counts?.female ?? 28})
                </button>
                <button 
                  type="button"
                  onClick={() => switchCategory("male")}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === "male" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  Male ({styleCatalog?.counts?.male ?? 22})
                </button>
              </div>

              {selectedStyle && styleCatalog?.[selectedCategory]?.[String(selectedStyle)] && (
                <div className="max-w-lg mx-auto mt-6 rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3 text-center text-sm">
                  <p className="text-sky-900">
                    You selected slot <strong>#{selectedStyle}</strong> · label:{" "}
                    <strong>{styleCatalog[selectedCategory][String(selectedStyle)].label}</strong>
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    AI will receive:{" "}
                    <code className="text-sky-700 bg-sky-50/50 px-1 py-0.5 rounded font-mono">
                      {styleCatalog[selectedCategory][String(selectedStyle)].api}
                    </code>
                    {" "}— not the thumbnail pixels. Result may look different from the photo.
                  </p>
                </div>
              )}

              <p className="text-center text-xs text-slate-500 max-w-xl mx-auto mt-6 leading-relaxed">
                Pick a hairstyle below, then swap.
              </p>

              {/* Hairstyle Grid */}
              <>
              <p className="text-center text-xs text-slate-500 mt-2">
                {styleIds.length} styles · scroll to see all
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3 max-h-[min(50vh,420px)] overflow-y-auto pr-1 custom-scrollbar">
                {styleIds.map((styleId) => {
                  const imagePath = `/hairstyles/${selectedCategory}/${styleId}.webp`;
                  const isSelected = selectedStyle === styleId;
                  const meta = styleCatalog?.[selectedCategory]?.[String(styleId)];
                  const styleLabel = meta?.label || `Style ${styleId}`;

                  return (
                    <button
                      key={styleId}
                      type="button"
                      onClick={() => setSelectedStyle(styleId)}
                      className={`text-left rounded-2xl border-2 transition-all overflow-hidden ${
                        isSelected ? "border-sky-500 ring-2 ring-sky-500/20" : "border-transparent hover:border-sky-500/50"
                      }`}
                    >
                      <div className="aspect-square bg-slate-100 relative group">
                        <img
                          src={imagePath}
                          alt={styleLabel}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 size-5 bg-sky-500 rounded-full flex items-center justify-center shadow-lg z-10">
                            <div className="size-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <p className={`px-1 py-1.5 text-[10px] font-semibold text-center truncate ${isSelected ? "text-sky-600 font-bold" : "text-slate-500"}`}>
                        {styleLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
              </>

              {lastAppliedLabel && resultImage && selectedStyle && (
                <p className="text-center text-sm text-sky-700 font-semibold mt-4">
                  Hairstyle: <strong>{lastAppliedLabel}</strong>
                </p>
              )}

              {/* Final CTA */}
              <div className="mt-10 space-y-3">
                <button 
                  type="button"
                  onClick={handleApplyStyle}
                  disabled={!userImageFile || !selectedStyle || isProcessing}
                  className={`w-full py-5 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-3 ${
                    !userImageFile || !selectedStyle || isProcessing
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-900 shadow-xl shadow-sky-500/20 hover:scale-[1.02]"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="size-6 border-4 border-slate-900/20 border-t-slate-900 animate-spin rounded-full" />
                      Swapping hairstyle…
                    </>
                  ) : (
                    <>
                      <Wand2 size={24} />
                      SWAP MY HAIRSTYLE
                    </>
                  )}
                </button>
                {!selectedStyle && userImage && (
                  <p className="text-center text-xs text-amber-600 font-semibold">Select a hairstyle above to continue</p>
                )}
                {resultImage && (
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href={resultImage}
                      download="facecraft-hairstyle.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                    >
                      <Download size={18} />
                      Download result
                    </a>
                    <button
                      type="button"
                      onClick={resetTryOn}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                    >
                      <RefreshCw size={18} />
                      Start over
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={scrollToBeardTryOn}
                  className="w-full mt-4 py-3 rounded-xl border border-cyan-200 text-cyan-600 text-sm font-bold hover:bg-cyan-50/50 transition-colors"
                >
                  Next: try beard styles below ↓
                </button>
              </div>


            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Beard Try-On — same page, below hairstyle */}
      <section
        id="beard"
        ref={beardTryOnSectionRef}
        className="py-24 px-6 bg-section text-slate-800 overflow-hidden relative border-t border-slate-200"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-400/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
              AI Beard Changer: <br />
              <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
                Try Beard Styles on Your Photo
              </span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Upload a separate photo for beard try-on, or optionally use your hairstyle result from above.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-white/95 backdrop-blur-md border border-cyan-100/85 rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_32px_-8px_rgba(34,211,238,0.12)]">
              <input
                ref={beardFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBeardFileUpload}
                className="hidden"
              />
              <input
                ref={beardCameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleBeardFileUpload}
                className="hidden"
              />

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload photo for beard</h3>
                <p className="text-slate-500 text-sm">
                  Front-facing selfie with visible jawline — works best on male portraits. Processing usually takes 60–90 seconds.
                </p>
              </div>

              <div
                className="relative group cursor-pointer max-w-2xl mx-auto mb-6"
                onClick={() => !beardIsProcessing && beardFileInputRef.current?.click()}
              >
                <div className="aspect-square md:aspect-[2.4/1] w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 transition-all group-hover:border-cyan-500 group-hover:bg-slate-50/80 overflow-hidden">
                  {!beardUserImage ? (
                    <>
                      <div className="size-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon size={32} className="text-cyan-600" />
                      </div>
                      <p className="text-slate-800 font-semibold mb-1">
                        Drop beard photo here or <span className="text-cyan-600">browse</span>
                      </p>
                      <p className="text-slate-500 text-xs">JPG, PNG, WebP · max 10 MB</p>
                    </>
                  ) : (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img src={beardUserImage} alt="Beard upload preview" className="h-full object-contain rounded-xl" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <RefreshCw className="text-white" size={32} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => beardFileInputRef.current?.click()}
                  disabled={beardIsProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 hover:bg-slate-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <ImageIcon size={16} />
                  Choose file
                </button>
                <button
                  type="button"
                  onClick={() => { setCameraMode("beard"); setCameraOpen(true); }}
                  disabled={beardIsProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Camera size={16} />
                  Take photo
                </button>
              </div>

              {resultImage && (
                <label className="flex items-center justify-center gap-2 mb-6 cursor-pointer text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={beardOnHairstyleResult}
                    onChange={(e) => {
                      setBeardOnHairstyleResult(e.target.checked);
                      setBeardResultImage(null);
                      setBeardSwapError(null);
                    }}
                    className="rounded border-slate-300 bg-white text-cyan-500 focus:ring-cyan-500"
                  />
                  Use my hairstyle result instead of the beard photo above
                </label>
              )}

              {(beardPreviewSrc || beardResultImage) && (
                <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
                      {beardOnHairstyleResult && resultImage ? "Hairstyle result" : "Beard photo"}
                    </p>
                    {beardPreviewSrc && (
                      <img
                        src={beardPreviewSrc}
                        alt="Beard source"
                        className="w-full rounded-xl object-contain max-h-72 mx-auto"
                      />
                    )}
                  </div>
                  <div className="rounded-2xl border border-cyan-200/60 bg-slate-50/50 p-3">
                    <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-2 text-center">
                      Beard result
                    </p>
                    {beardResultImage ? (
                      <img
                        src={beardResultImage}
                        alt="Beard result"
                        className="w-full rounded-xl object-contain max-h-72 mx-auto"
                      />
                    ) : beardIsProcessing ? (
                      <TryOnProcessingAnimation
                        variant="beard"
                        previewImage={beardPreviewSrc}
                        hint={beardProcessingHint}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-slate-500 text-sm text-center px-4">
                        Select a beard style and tap Apply
                      </div>
                    )}
                  </div>
                </div>
              )}

              {beardSwapError && (
                <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
                  {beardSwapError}
                </div>
              )}

              {selectedBeardStyle && beardCatalog?.styles?.[String(selectedBeardStyle)] && (
                <div className="max-w-lg mx-auto mb-6 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-sm">
                  <p className="text-cyan-900">
                    You selected slot <strong>#{selectedBeardStyle}</strong> ·{" "}
                    <strong>{beardCatalog.styles[String(selectedBeardStyle)].label}</strong>
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    AI preset:{" "}
                    <code className="text-cyan-700 bg-cyan-50/50 px-1 py-0.5 rounded font-mono">
                      {beardCatalog.styles[String(selectedBeardStyle)].api}
                    </code>
                    {" "}— thumbnail is a guide; result may vary on your photo.
                  </p>
                </div>
              )}

              <p className="text-center text-xs text-slate-500 mt-2 mb-2">
                {beardStyleIds.length} beard styles · scroll to see all
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[min(45vh,380px)] overflow-y-auto pr-1 custom-scrollbar">
                {beardStyleIds.map((styleId) => {
                  const isSelected = selectedBeardStyle === styleId;
                  const meta = beardCatalog?.styles?.[String(styleId)];
                  const styleLabel = meta?.label || `Style ${styleId}`;
                  const imagePath = `/beards/${styleId}.webp`;
                  const beardApi = meta?.api;

                  return (
                    <button
                      key={styleId}
                      type="button"
                      onClick={() => setSelectedBeardStyle(styleId)}
                      disabled={!hasBeardPhotoSource}
                      className={`text-left rounded-2xl border-2 transition-all overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-cyan-500 ring-2 ring-cyan-500/20"
                          : "border-transparent hover:border-cyan-500/50"
                      }`}
                    >
                      <div className="aspect-square bg-slate-100 relative group">
                        <BeardStyleThumbnail
                          api={beardApi}
                          className="absolute inset-0 object-cover"
                        />
                        <img
                          src={imagePath}
                          alt={styleLabel}
                          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 z-[1]"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 size-5 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg z-10">
                            <div className="size-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <p
                        className={`px-1 py-1.5 text-[10px] font-semibold text-center truncate ${
                          isSelected ? "text-cyan-600 font-bold" : "text-slate-500"
                        }`}
                      >
                        {styleLabel}
                      </p>
                    </button>
                  );
                })}
              </div>

              {lastBeardLabel && beardResultImage && (
                <p className="text-center text-sm text-cyan-700 font-semibold mt-6">
                  Beard: <strong>{lastBeardLabel}</strong>
                </p>
              )}

              <div className="mt-10 space-y-3">
                <button
                  type="button"
                  onClick={handleApplyBeard}
                  disabled={!hasBeardPhotoSource || !selectedBeardStyle || beardIsProcessing}
                  className={`w-full py-5 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-3 ${
                    !hasBeardPhotoSource || !selectedBeardStyle || beardIsProcessing
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : "bg-linear-to-r from-cyan-500 to-sky-400 text-slate-900 shadow-xl shadow-cyan-500/20 hover:scale-[1.02]"
                  }`}
                >
                  {beardIsProcessing ? (
                    <>
                      <div className="size-6 border-4 border-slate-900/20 border-t-slate-900 animate-spin rounded-full" />
                      {beardProcessingHint || "APPLYING BEARD…"}
                    </>
                  ) : (
                    <>
                      <Wand2 size={24} />
                      APPLY BEARD STYLE
                    </>
                  )}
                </button>
                {!hasBeardPhotoSource && (
                  <p className="text-center text-xs text-amber-600 font-semibold">
                    Upload a beard photo above, or enable hairstyle result (after swapping hair)
                  </p>
                )}
                {beardResultImage && (
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href={beardResultImage}
                      download="facecraft-beard.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                    >
                      <Download size={18} />
                      Download beard result
                    </a>
                    <button
                      type="button"
                      onClick={resetBeardTryOn}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                    >
                      <RefreshCw size={18} />
                      Reset beard try-on
                    </button>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Style Gallery Preview */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Trending Styles</h2>
              <p className="text-slate-500">Hand-picked by our professional stylists for 2024</p>
            </ScrollReveal>
           
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
            {[
              { id: 1, name: "Long Curly", desc: "A soft, wavy style that adds movement and rich volume." },
              { id: 2, name: "Wavy Shag", desc: "A textured, casual middle-part flow offering a relaxed vibe." },
              { id: 3, name: " Long Straight", desc: "Elegant and smooth straight hair for a clean, sophisticated look." },
              { id: 4, name: "Undercut Long", desc: "A neat, tapered short cut that is easy to maintain." },
              { id: 5, name: "Hime Cut", desc: "A chic shoulder-length bob styled with gentle, natural waves." },
              { id: 6, name: "Slick Back", desc: "A stylish blend of side fade and messy textured top hair." }
            ].map((style) => (
              <div key={style.id} className="min-w-[300px] bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
                <div className="h-64 bg-slate-100 relative overflow-hidden">
                   <img 
                      src={`/hairstyles/trending/${style.id}.webp`} 
                      alt={style.name} 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                   />
                   <div className="absolute inset-0 flex items-center justify-center text-slate-300" style={{ display: 'none' }}>
                      <Scissors size={40} />
                   </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-900">{style.name}</h4>
                    <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold uppercase">Popular</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">{style.desc}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStyle(style.id);
                      scrollToTryOn();
                    }}
                    className="w-full py-3 rounded-xl border border-sky-100 text-sky-600 font-bold hover:bg-sky-50 transition-all"
                  >
                    Try This Style
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
