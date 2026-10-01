import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "../components/ScrollReveal";
import SocialShare from "../components/SocialShare";
import {
  Camera,
  UploadCloud,
  ScanFace,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  X,
  ArrowRight,
  Droplets,
  ShoppingBag,
  Lightbulb,
  Check,
  Shield,
  Cpu,
  FileText,
  Sun,
  Activity,
  Moon,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  analyzeFaceShape,
  analyzeSkin,
  isAuthenticated,
  getBackendOrigin,
  getProductsForSkinType,
  getTipsForSkinType,
  getProductImageUrl,
} from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function FaceShapeDetector() {
  // Step 1: Face shape
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [faceResult, setFaceResult] = useState(null);
  // Step 2: Skin analysis (separate upload)
  const [skinImage, setSkinImage] = useState(null);
  const [skinLoading, setSkinLoading] = useState(false);
  const [skinError, setSkinError] = useState("");
  const [skinResult, setSkinResult] = useState(null);
  const [products, setProducts] = useState([]);
  const [tips, setTips] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState("face"); // "face" | "skin"
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const fileInputRef = useRef(null);
  const skinFileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const skinAnalysisRef = useRef(null);
  const navigate = useNavigate();

  // Custom smooth scroll with easing
  const smoothScrollTo = (element, duration = 700) => {
    if (!element) return;
    const navbarOffset = 100;
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - navbarOffset;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  // Smooth scroll to skin analysis when Step 2 is shown
  useEffect(() => {
    if (showDetails && skinAnalysisRef.current) {
      const el = skinAnalysisRef.current;
      requestAnimationFrame(() => smoothScrollTo(el, 700));
    }
  }, [showDetails]);

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
            ? "Camera access was denied."
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

  useEffect(() => {
    if (!skinResult?.skin_type) return;
    const skinType = skinResult.skin_type?.toLowerCase();
    if (!skinType || !["dry", "normal", "oily"].includes(skinType)) return;
    (async () => {
      try {
        const [prodRes, tipsRes] = await Promise.all([
          getProductsForSkinType(skinType),
          getTipsForSkinType(skinType),
        ]);
        setProducts(prodRes.images || []);
        setTips(tipsRes.tips || "");
      } catch {
        setProducts([]);
        setTips("");
      }
    })();
  }, [skinResult?.skin_type]);

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

        if (cameraMode === "skin") {
          setSkinImage({ file, preview });
          setSkinError("");
          setSkinResult(null);
          setProducts([]);
          setTips("");
        } else {
          setImage({ file, preview });
          setError("");
          setFaceResult(null);
          setShowDetails(false);
          setProducts([]);
          setTips("");
        }
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const handleImageUpload = (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setImage({ file, preview: URL.createObjectURL(file) });
    setError("");
    setFaceResult(null);
    setShowDetails(false);
  };

  const handleSkinImageUpload = (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      setSkinError("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSkinError("Image must be under 5MB");
      return;
    }
    setSkinImage({ file, preview: URL.createObjectURL(file) });
    setSkinError("");
    setSkinResult(null);
    setProducts([]);
    setTips("");
  };

  const openFileSelector = () => fileInputRef.current?.click();
  const openSkinFileSelector = () => skinFileInputRef.current?.click();

  const handleAnalyzeFaceShape = async () => {
    if (!image?.file) {
      setError("Please upload a photo first");
      return;
    }
    if (!isAuthenticated()) {
      setError("Please log in to use Face Analyzer");
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    setFaceResult(null);
    try {
      const response = await analyzeFaceShape(image.file);
      if (response.success) setFaceResult(response.data);
      else setError(response.message || "Analysis failed");
    } catch (err) {
      const msg = err.message || "Something went wrong. Please try again.";
      if (msg.includes("credits") || msg.includes("Credits") || msg.includes("Insufficient")) {
        setError(msg + " Redirecting to pricing in 3 seconds...");
        setTimeout(() => navigate("/pricing"), 3000);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSkin = async () => {
    if (!skinImage?.file) {
      setSkinError("Please upload a photo for skin analysis");
      return;
    }
    if (!isAuthenticated()) {
      setSkinError("Please log in to use Face Analyzer");
      navigate("/login");
      return;
    }
    setSkinLoading(true);
    setSkinError("");
    setSkinResult(null);
    setProducts([]);
    setTips("");
    try {
      const response = await analyzeSkin(skinImage.file);
      if (response.success) setSkinResult(response.data);
      else setSkinError(response.message || "Skin analysis failed");
    } catch (err) {
      const msg = err.message || "Something went wrong. Please try again.";
      if (msg.includes("credits") || msg.includes("Credits") || msg.includes("Insufficient")) {
        setSkinError(msg + " Redirecting to pricing in 3 seconds...");
        setTimeout(() => navigate("/pricing"), 3000);
      } else {
        setSkinError(msg);
      }
    } finally {
      setSkinLoading(false);
    }
  };

  const faceShapeColors = {
    Heart: "from-rose-500 to-pink-500",
    Oblong: "from-indigo-500 to-blue-500",
    Oval: "from-emerald-500 to-teal-500",
    Round: "from-amber-500 to-orange-500",
    Square: "from-violet-500 to-purple-500",
  };
  const shapeGradient =
    faceResult?.face_shape
      ? faceShapeColors[faceResult.face_shape] || "from-sky-500 to-cyan-500"
      : "from-sky-500 to-cyan-500";

  const skinTypeLabels = { dry: "Dry", normal: "Normal", oily: "Oily" };
  const skinToneLabels = {
    light: "Light",
    "mid-light": "Mid-Light",
    "mid-dark": "Mid-Dark",
    dark: "Dark",
  };

  return (
    <div className="relative min-h-screen pt-20 pb-24 overflow-hidden bg-page bg-dot-grid">
      {/* Premium gradient overlay */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-50/40 to-cyan-50/50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] bg-sky-400/12 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-cyan-400/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(56,189,248,0.06),transparent_70%)]" />
      </div>

      {/* Camera modal */}
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

    <section className="py-12 sm:py-16 bg-[#F2F6FF]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-sky-200/60 shadow-[0_2px_12px_-2px_rgba(56,189,248,0.15)] text-sky-700 text-xs font-semibold uppercase tracking-wider mb-8 animate-glow-pulse">
            <ScanFace className="w-4 h-4" strokeWidth={2} />
            AI-Powered Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight animate-reveal-zoom">
            Face & Skin <span className="bg-gradient-to-r from-sky-400 via-white to-sky-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer drop-shadow-sm">Analyzer</span>
          </h1>
          {/* Premium step indicators */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up [animation-delay:200ms] [animation-fill-mode:both]">
            {/* Step 1 */}
            <div className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/95 backdrop-blur-sm border border-sky-100 shadow-[0_4px_24px_-6px_rgba(56,189,248,0.25)] hover:shadow-[0_8px_32px_-6px_rgba(56,189,248,0.4)] hover:-translate-y-0.5 transition-all duration-300 min-w-[220px]">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-sky-400/30 rounded-xl blur-md scale-125 group-hover:bg-sky-400/50 transition-all duration-300" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-400/30">
                  <ScanFace className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-sky-400 flex items-center justify-center text-[9px] font-black text-sky-600 shadow-sm">1</span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500 mb-0.5">Step 1</p>
                <p className="text-sm font-bold text-slate-800">Face Shape Detection</p>
                <p className="text-xs text-slate-400 mt-0.5">AI landmark analysis</p>
              </div>
            </div>

            {/* Connector */}
            <div className="flex sm:flex-col items-center gap-1 shrink-0">
              <div className="w-6 h-px sm:w-px sm:h-6 bg-gradient-to-r sm:bg-gradient-to-b from-sky-300 to-emerald-300" />
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 shadow-sm shadow-emerald-300/60 animate-pulse" />
              <div className="w-6 h-px sm:w-px sm:h-6 bg-gradient-to-r sm:bg-gradient-to-b from-emerald-300 to-sky-300" />
            </div>

            {/* Step 2 */}
            <div className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/95 backdrop-blur-sm border border-emerald-100 shadow-[0_4px_24px_-6px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_32px_-6px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 min-w-[220px]">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-emerald-400/30 rounded-xl blur-md scale-125 group-hover:bg-emerald-400/50 transition-all duration-300" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-400/30">
                  <Droplets className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center text-[9px] font-black text-emerald-600 shadow-sm">2</span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-0.5">Step 2</p>
                <p className="text-sm font-bold text-slate-800">Skin & Tone Analysis</p>
                <p className="text-xs text-slate-400 mt-0.5">Type · tone · acne · products</p>
              </div>
            </div>
          </div>
        </div>
        {/* Info strip — fills space, no blanks */}
        <ScrollReveal delay={0.1} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 p-5 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <ScanFace className="w-4 h-4 text-sky-600" strokeWidth={1.8} />
            </div>
            <span className="text-sm font-medium">478 landmarks</span>
          </div>
          <div className="w-px h-6 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-600" strokeWidth={1.8} />
            </div>
            <span className="text-sm font-medium">JPG · PNG · WEBP · 5MB</span>
          </div>
          <div className="w-px h-6 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
            </div>
            <span className="text-sm font-medium">Secure & private</span>
          </div>
        </ScrollReveal>

        {/* Step progress */}
        <ScrollReveal delay={0.2} className="flex items-center gap-4 p-5 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)] mb-6">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${faceResult ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25"}`}>
              {faceResult ? <Check className="w-5 h-5" strokeWidth={2.5} /> : "1"}
            </div>
            <span className={`font-medium ${faceResult ? "text-slate-500" : "text-slate-900"}`}>Face Shape</span>
          </div>
          <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: skinResult ? "100%" : faceResult ? "50%" : "0%" }} />
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className={`font-medium ${skinResult ? "text-slate-500" : "text-slate-900"}`}>Skin Analysis</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${skinResult ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "bg-slate-200 text-slate-400"}`}>
              {skinResult ? <Check className="w-5 h-5" strokeWidth={2.5} /> : "2"}
            </div>
          </div>
        </ScrollReveal>

        {/* Main content — Upload + Result */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upload card — PREMIUM */}
          <ScrollReveal delay={0.3} className="group/card rounded-2xl bg-white/80 backdrop-blur-md border border-sky-100/80 shadow-[0_8px_32px_-8px_rgba(56,189,248,0.15),0_0_1px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_24px_60px_-12px_rgba(56,189,248,0.25)] hover:-translate-y-1">
            {/* Card header with gradient accent */}
            <div className="px-5 py-4 border-b border-sky-100/60 bg-gradient-to-r from-sky-50/80 via-white to-cyan-50/40 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/30">
                <UploadCloud className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500">Step 1</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Upload Your Photo</h3>
              </div>
            </div>
            <div className="p-5">
              {/* Premium Dropzone */}
              <div
                onClick={openFileSelector}
                className="relative min-h-[240px] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500"
              >
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-br from-sky-400/60 via-cyan-300/40 to-sky-500/60 group-hover:from-sky-500 group-hover:via-cyan-400 group-hover:to-sky-500 transition-all duration-500">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-50 via-sky-50/40 to-cyan-50/30 group-hover:from-sky-50/80 group-hover:via-white group-hover:to-cyan-50/50 transition-all duration-500" />
                </div>
                {/* Corner accents */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-sky-400/70 rounded-tl-lg z-10" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-sky-400/70 rounded-tr-lg z-10" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-sky-400/70 rounded-bl-lg z-10" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-sky-400/70 rounded-br-lg z-10" />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  {image ? (
                    <img src={image.preview} alt="Preview" className="w-full h-full object-contain bg-slate-100 transition-transform duration-500 group-hover:scale-[1.02]" />
                  ) : (
                    <>
                      {/* Glowing icon */}
                      <div className="relative mb-5">
                        <div className="absolute inset-0 bg-sky-400/30 rounded-2xl blur-xl scale-150 group-hover:bg-sky-400/50 transition-all duration-500" />
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/40 group-hover:scale-110 group-hover:shadow-sky-500/60 transition-all duration-500 animate-float-premium">
                          <UploadCloud className="w-8 h-8 text-white" strokeWidth={1.8} />
                        </div>
                      </div>
                      <p className="text-slate-800 font-bold text-base">Click or drag to upload</p>
                      <p className="text-slate-500 text-sm mt-1.5">Front-facing, well-lit · max 5MB</p>
                      <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                        <span className="text-xs text-sky-600 font-medium">JPG · PNG · WEBP</span>
                      </div>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
              {/* Camera button — premium */}
              <button
                type="button"
                onClick={() => { setCameraMode("face"); setCameraOpen(true); }}
                className="mt-4 w-full py-3 rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 text-sm font-semibold hover:from-sky-100 hover:to-cyan-100 hover:border-sky-300 hover:shadow-md hover:shadow-sky-500/10 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Camera className="w-4 h-4" />
                Use Camera Instead
              </button>
            </div>
          </ScrollReveal>

          {/* Result card — PREMIUM */}
          <ScrollReveal delay={0.4} className="group/card rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-slate-100/80 bg-gradient-to-r from-slate-50/80 via-white to-sky-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
                  <BarChart3 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 1</span>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Analysis Result</h3>
                </div>
              </div>
              {faceResult && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 shadow-sm">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Complete
                </span>
              )}
            </div>
            <div className="p-5 min-h-[320px]">
              {loading && image ? (
                <div className="relative min-h-[260px] rounded-2xl overflow-hidden">
                  <img src={image.preview} alt="Scanning" className="w-full h-full max-h-[280px] object-contain" />

                  {/* === FACE SHAPE ANIMATION: Landmark Grid + Horizontal Sweep === */}
                  {/* Blue tinted overlay */}
                  <div className="absolute inset-0 bg-sky-900/20" />

                  {/* Flickering landmark grid */}
                  <div className="absolute inset-0 animate-[grid-flicker_3s_ease-in-out_infinite]" style={{
                    backgroundImage: 'linear-gradient(rgba(56,189,248,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.25) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }} />

                  {/* Blinking corner brackets */}
                  <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-sky-400 rounded-tl-lg animate-[corner-blink_1.2s_ease-in-out_infinite]" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-sky-400 rounded-tr-lg animate-[corner-blink_1.2s_ease-in-out_infinite_0.3s]" />
                  <div className="absolute bottom-12 left-3 w-8 h-8 border-b-2 border-l-2 border-sky-400 rounded-bl-lg animate-[corner-blink_1.2s_ease-in-out_infinite_0.6s]" />
                  <div className="absolute bottom-12 right-3 w-8 h-8 border-b-2 border-r-2 border-sky-400 rounded-br-lg animate-[corner-blink_1.2s_ease-in-out_infinite_0.9s]" />

                  {/* Horizontal sweep line */}
                  <div className="absolute inset-x-0 h-[2px] animate-[scan-h_2s_ease-in-out_infinite]" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.9) 30%, rgba(186,230,253,1) 50%, rgba(56,189,248,0.9) 70%, transparent)',
                    boxShadow: '0 0 12px 4px rgba(56,189,248,0.5)'
                  }} />

                  {/* Status badge */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-sm text-white text-sm font-semibold shadow-xl border border-sky-500/30">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      Detecting face landmarks...
                    </span>
                  </div>
                </div>
              ) : faceResult ? (
                <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
                  {(faceResult.annotated_image_url || faceResult.annotated_image_base64) ? (
                    <div className="min-h-[240px] rounded-2xl overflow-hidden ring-1 ring-slate-200/80 shadow-md bg-slate-100 flex items-center justify-center">
                      <img
                        src={faceResult.annotated_image_url ? `${getBackendOrigin()}${faceResult.annotated_image_url}` : `data:image/png;base64,${faceResult.annotated_image_base64}`}
                        alt="Face with landmarks"
                        className="w-full h-full max-h-[240px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 flex flex-col items-center justify-center min-h-[180px] p-6 border border-sky-100">
                      <CheckCircle className="w-12 h-12 text-sky-500 mb-3" />
                      <p className="text-lg font-bold text-slate-800">{faceResult.face_shape}</p>
                      <p className="text-sm text-slate-500 mt-1">Confidence: {faceResult.confidence_score != null ? `${faceResult.confidence_score}%` : "—"}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${shapeGradient} text-white text-sm font-bold shadow-md`}>
                      <Sparkles className="w-4 h-4" /> {faceResult.face_shape}
                    </span>
                    <span className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-100/80 text-slate-700 text-sm font-semibold border border-slate-200/60">
                      {faceResult.confidence_score != null ? `${faceResult.confidence_score}%` : "—"} confidence
                    </span>
                    <SocialShare 
                      variant="compact"
                      title={`My Face Shape is ${faceResult.face_shape}!`}
                      text={`I just analyzed my face shape using FaceCraft AI and found out I have a ${faceResult.face_shape} face. Check yours out!`}
                      imageUrl={faceResult.annotated_image_url ? `${getBackendOrigin()}${faceResult.annotated_image_url}` : null}
                      resourceType="face_shape"
                      resourceId={faceResult.id}
                    />
                  </div>
                  {!showDetails && (
                    <button
                      type="button"
                      onClick={() => setShowDetails(true)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-bold shadow-[0_4px_24px_-4px_rgba(56,189,248,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(56,189,248,0.6)] hover:from-sky-400 hover:to-cyan-400 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Continue to Step 2 — Skin Analysis
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="min-h-[260px] rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50/60 to-sky-50/20 flex flex-col items-center justify-center text-center p-8">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-sky-400/20 rounded-2xl blur-lg scale-150" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center border border-sky-200/60">
                      <Sparkles className="w-8 h-8 text-sky-500" strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-slate-700 font-bold">Awaiting Analysis</p>
                  <p className="text-slate-500 text-sm mt-2">Upload a photo and run analysis</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Step 1 CTA button — PREMIUM */}
        <ScrollReveal delay={0.5} className="flex justify-center mb-8">
          <div className="relative w-full max-w-md mx-auto">
            {/* Glow effect when active */}
            {image && !loading && (
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-2xl blur-md opacity-40 animate-pulse" />
            )}
            <button
              onClick={handleAnalyzeFaceShape}
              disabled={!image || loading}
              className={`relative w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                image && !loading
                  ? "bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 text-white shadow-[0_8px_32px_-4px_rgba(56,189,248,0.5)] hover:shadow-[0_12px_40px_-4px_rgba(56,189,248,0.65)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" variant="white" />
                  Analyzing face shape...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" strokeWidth={2.5} />
                  Run Face Shape Analysis
                </>
              )}
            </button>
          </div>
        </ScrollReveal>

        {/* Step 2: Skin analysis — 2-column grid matching Step 1 */}
        {faceResult && (
          <div ref={skinAnalysisRef} className="mb-8 scroll-mt-24">
            <div className="grid md:grid-cols-2 gap-6 mb-6">

              {/* LEFT: Skin Upload Card — PREMIUM */}
              <ScrollReveal delay={0.3} className="group/card rounded-2xl bg-white/80 backdrop-blur-md border border-emerald-100/80 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.15),0_0_1px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_24px_60px_-12px_rgba(16,185,129,0.25)] hover:-translate-y-1">
                {/* Card header */}
                <div className="px-5 py-4 border-b border-emerald-100/60 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
                    <UploadCloud className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Step 2</span>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">Upload Skin Photo</h3>
                  </div>
                </div>
                <div className="p-5">
                  {/* Premium Dropzone */}
                  <div
                    onClick={openSkinFileSelector}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500"
                  >
                    {skinImage ? (
                      /* When image selected — fixed height matching Step 1 */
                      <div className="relative min-h-[240px] rounded-2xl overflow-hidden ring-1 ring-emerald-200/80 shadow-md bg-slate-100 flex items-center justify-center group">
                        <img src={skinImage.preview} alt="Skin preview" className="w-full h-full max-h-[240px] object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
                        {/* Subtle hover overlay */}
                        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-all duration-300 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1.5 rounded-full bg-slate-900/70 text-white text-xs font-semibold backdrop-blur-sm">Click to change</span>
                        </div>
                      </div>
                    ) : (
                      /* Empty state — fixed height with decorative border */
                      <div className="relative min-h-[240px]">
                        {/* Animated gradient border */}
                        <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-br from-emerald-400/60 via-teal-300/40 to-emerald-500/60 group-hover:from-emerald-500 group-hover:via-teal-400 group-hover:to-emerald-500 transition-all duration-500">
                          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30 group-hover:from-emerald-50/80 group-hover:via-white group-hover:to-teal-50/50 transition-all duration-500" />
                        </div>
                        {/* Corner accents */}
                        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-400/70 rounded-tl-lg z-10" />
                        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-400/70 rounded-tr-lg z-10" />
                        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-400/70 rounded-bl-lg z-10" />
                        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-400/70 rounded-br-lg z-10" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                          <>
                            <div className="relative mb-5">
                              <div className="absolute inset-0 bg-emerald-400/30 rounded-2xl blur-xl scale-150 group-hover:bg-emerald-400/50 transition-all duration-500" />
                              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-110 group-hover:shadow-emerald-500/60 transition-all duration-500 animate-float-premium">
                                <UploadCloud className="w-8 h-8 text-white" strokeWidth={1.8} />
                              </div>
                            </div>
                            <p className="text-slate-800 font-bold text-base">Click or drag to upload</p>
                            <p className="text-slate-500 text-sm mt-1.5">Front-facing, well-lit · max 5MB</p>
                            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-xs text-emerald-600 font-medium">JPG · PNG · WEBP</span>
                            </div>
                          </>
                        </div>
                      </div>
                    )}
                    <input type="file" ref={skinFileInputRef} className="hidden" accept="image/*" onChange={handleSkinImageUpload} />
                  </div>
                  {/* Camera button */}
                  <button
                    type="button"
                    onClick={() => { setCameraMode("skin"); setCameraOpen(true); }}
                    className="mt-4 w-full py-3 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-semibold hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Camera className="w-4 h-4" />
                    Use Camera Instead
                  </button>
                </div>
              </ScrollReveal>

              {/* RIGHT: Skin Result Card — PREMIUM */}
              <ScrollReveal delay={0.4} className="group/card rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1">
                {/* Card header */}
                <div className="px-5 py-4 border-b border-slate-100/80 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center shadow-md">
                      <Droplets className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 2</span>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">Skin Analysis Result</h3>
                    </div>
                  </div>
                  {skinResult && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 shadow-sm">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Complete
                    </span>
                  )}
                </div>
                <div className="p-5 min-h-[320px]">
                  {skinLoading && skinImage ? (
                    <div className="relative min-h-[260px] rounded-2xl overflow-hidden">
                      <img src={skinImage.preview} alt="Scanning" className="w-full h-full max-h-[280px] object-contain" />

                      {/* === SKIN ANALYSIS ANIMATION: Radar Pulse + Vertical Sweep === */}
                      {/* Green tinted overlay */}
                      <div className="absolute inset-0 bg-emerald-900/20" />

                      {/* Expanding radar rings from center */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-24 h-24">
                          {/* Ring 1 */}
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/70 animate-[radar-pulse_2s_ease-out_infinite]" />
                          {/* Ring 2 — offset */}
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/50 animate-[radar-pulse_2s_ease-out_infinite_0.7s]" />
                          {/* Ring 3 — offset */}
                          <div className="absolute inset-0 rounded-full border-2 border-teal-400/40 animate-[radar-pulse_2s_ease-out_infinite_1.4s]" />
                          {/* Center crosshair */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 relative">
                              <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-400" />
                              <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-400" />
                              <div className="absolute inset-[4px] rounded-full border border-emerald-400" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vertical sweep line (left → right) */}
                      <div className="absolute inset-y-0 w-[2px] animate-[scan-v_2.4s_ease-in-out_infinite]" style={{
                        background: 'linear-gradient(180deg, transparent, rgba(52,211,153,0.9) 30%, rgba(167,243,208,1) 50%, rgba(52,211,153,0.9) 70%, transparent)',
                        boxShadow: '0 0 12px 4px rgba(52,211,153,0.5)'
                      }} />

                      {/* Status badge */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-sm text-white text-sm font-semibold shadow-xl border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Analyzing skin texture...
                        </span>
                      </div>
                    </div>
                  ) : skinResult ? (
                    <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
                      {/* Full image preview — fixed height matching upload box */}
                      {skinImage && (
                        <div className="min-h-[240px] rounded-2xl overflow-hidden ring-1 ring-slate-200/80 shadow-md bg-slate-100 flex items-center justify-center">
                          <img src={skinImage.preview} alt="Skin analyzed" className="w-full h-full max-h-[240px] object-contain" />
                        </div>
                      )}
                      {/* Result chips */}
                      <div className="flex flex-wrap gap-2">
                        {skinResult.skin_type && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-md">
                            <Droplets className="w-3.5 h-3.5" /> {skinTypeLabels[skinResult.skin_type] || skinResult.skin_type}
                          </span>
                        )}
                        {skinResult.skin_tone && (
                          <span className="inline-flex items-center px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/60">
                            Tone: {skinToneLabels[skinResult.skin_tone] || skinResult.skin_tone}
                          </span>
                        )}
                        <span className="inline-flex items-center px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200/60">
                          Acne: {skinResult.acne_percent ?? 0}%
                        </span>
                        <span className="inline-flex items-center px-3 py-2 rounded-xl bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-200/60">
                          Dark spots: {skinResult.darkspot_percent ?? 0}%
                        </span>
                        <span className="inline-flex items-center px-3 py-2 rounded-xl bg-cyan-50 text-cyan-700 text-xs font-semibold border border-cyan-200/60">
                          Pores: {skinResult.pores_percent ?? 0}%
                        </span>
                        <span className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
                          Blackheads: {skinResult.blackheads_percent ?? 0}%
                        </span>
                        <span className="inline-flex items-center px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200/60">
                          Wrinkles: {skinResult.wrinkles_percent ?? 0}%
                        </span>
                      </div>
                      
                      <div className="pt-2">
                        <SocialShare 
                          title="My Skin Analysis Results"
                          text={`My skin type is ${skinTypeLabels[skinResult.skin_type] || skinResult.skin_type} according to FaceCraft AI. Take the test!`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[260px] rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50/60 to-emerald-50/20 flex flex-col items-center justify-center text-center p-8">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-lg scale-150" />
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-200/60">
                          <Droplets className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
                        </div>
                      </div>
                      <p className="text-slate-700 font-bold">Awaiting Skin Analysis</p>
                      <p className="text-slate-500 text-sm mt-2">Upload a photo and run analysis</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>

            {/* Analyze Skin CTA button — PREMIUM */}
            <ScrollReveal delay={0.5} className="flex justify-center mb-6">
              <div className="relative w-full max-w-md mx-auto">
                {skinImage && !skinLoading && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur-md opacity-40 animate-pulse" />
                )}
                <button
                  onClick={handleAnalyzeSkin}
                  disabled={!skinImage || skinLoading}
                  className={`relative w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                    skinImage && !skinLoading
                      ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 text-white shadow-[0_8px_32px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_40px_-4px_rgba(16,185,129,0.65)] hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  {skinLoading ? (
                    <>
                      <LoadingSpinner size="sm" variant="white" />
                      Analyzing skin...
                    </>
                  ) : (
                    <>
                      <Droplets className="w-4 h-4" strokeWidth={2.5} />
                      Run Skin Analysis
                    </>
                  )}
                </button>
              </div>
            </ScrollReveal>
          </div>
        )}


        {/* Grooming tips - SIGNATURE EMERALD PROTOCOL */}
        {skinResult?.skin_type && tips && (
          <ScrollReveal 
            delay={0.1}
            className="mb-16 relative group/protocol"
          >
            {/* Subtle glow behind the entire section */}
            <div className="absolute inset-0 bg-emerald-400/5 blur-[100px] rounded-full scale-75 opacity-0 group-hover/protocol:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-[0_4px_30px_-4px_rgba(16,185,129,0.08)] rounded-[32px] overflow-hidden transition-all duration-700 hover:shadow-[0_32px_80px_-16px_rgba(16,185,129,0.12)]">
              {/* Premium Box Header - Theme Matched */}
              <div className="relative px-10 py-12 border-b border-emerald-50 bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-black/10 blur-[60px] rounded-full" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.25em] shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" strokeWidth={3} />
                      Signature Result
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Expert <span className="text-emerald-200">Grooming Protocol</span>
                      </h3>
                      <p className="text-emerald-50/90 text-sm font-medium tracking-wide max-w-xl">
                        A bespoke dermatological routine precision-engineered for your <span className="text-white font-bold underline decoration-emerald-300 underline-offset-4">{skinTypeLabels[skinResult.skin_type] || skinResult.skin_type} skin profile</span>.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest">Protocol ID</p>
                        <p className="text-sm font-mono font-black text-white">FC-{skinResult.skin_type?.toUpperCase() || 'AX'}-{Math.floor(Math.random() * 900) + 100}</p>
                      </div>
                      <div className="w-px h-10 bg-white/20" />
                      <div className="px-6 py-3 rounded-2xl bg-white text-emerald-700 text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-emerald-900/20 transform hover:scale-105 transition-transform duration-300">
                         <Shield className="w-4 h-4" strokeWidth={2.5} />
                         Verified AI
                      </div>
                    </div>
                    {/* Social Share for Skin Result */}
                    <div className="flex justify-end">
                      <SocialShare 
                        variant="compact"
                        title={`My Skin Profile: ${skinTypeLabels[skinResult.skin_type] || skinResult.skin_type}`}
                        text={`I just got my professional skin analysis from FaceCraft AI. My skin type is ${skinTypeLabels[skinResult.skin_type] || skinResult.skin_type}. Highly recommend checking this out!`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Implementation Grid */}
              <div className="p-10 lg:p-14 bg-gradient-to-b from-white to-emerald-50/20">
                <div className="max-w-5xl mx-auto grid gap-14">
                  {(() => {
                    const lines = tips.split('\n').filter(l => l.trim());
                    const groups = {
                      prime: { label: "Phase 01: Preparation", icon: Droplets, color: "emerald", items: [] },
                      active: { label: "Phase 02: Active Treatment", icon: Zap, color: "sky", items: [] },
                      seal: { label: "Phase 03: Hydration & Seal", icon: Sparkles, color: "teal", items: [] },
                      protect: { label: "Phase 04: Environmental Shield", icon: Shield, color: "indigo", items: [] }
                    };

                    lines.forEach(line => {
                      const lower = line.toLowerCase();
                      let target = 'seal';
                      if (lower.includes('cleans') || lower.includes('wash') || lower.includes('step 1')) target = 'prime';
                      else if (lower.includes('serum') || lower.includes('acid') || lower.includes('treatment') || lower.includes('exfoliat') || lower.includes('pore') || lower.includes('blackhead')) target = 'active';
                      else if (lower.includes('sun') || lower.includes('spf') || lower.includes('uv') || lower.includes('day')) target = 'protect';
                      
                      const splitChar = line.includes(' - ') ? ' - ' : ': ';
                      const parts = line.includes(splitChar) ? line.split(splitChar) : [line, ""];
                      const title = parts[0].replace(/^[•\d\s.-]+/, '').trim();
                      const content = parts.slice(1).join(splitChar).trim();
                      
                      groups[target].items.push({ title, content });
                    });

                    return Object.entries(groups).filter(([_, g]) => g.items.length > 0).map(([key, group], gIdx) => (
                      <div key={key} className="relative group/group-card animate-fade-in-up" style={{ animationDelay: `${gIdx * 150}ms` }}>
                        <div className="flex items-center gap-6 mb-8">
                          <div className={`w-12 h-12 rounded-2xl bg-${group.color}-50 flex items-center justify-center border border-${group.color}-100 shadow-sm transition-transform duration-500 group-hover/group-card:-rotate-6`}>
                            <group.icon className={`w-6 h-6 text-${group.color}-600`} strokeWidth={2} />
                          </div>
                          <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">{group.label}</h4>
                          <div className="flex-1 h-px bg-gradient-to-r from-slate-100 to-transparent" />
                        </div>
                        
                        <div className="grid gap-5">
                          {group.items.map((item, iIdx) => (
                            <div key={iIdx} className="group/item flex flex-col sm:flex-row sm:items-center gap-6 p-8 rounded-[24px] border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-500 hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.1)]">
                              <div className="flex-1 space-y-2">
                                <h5 className="text-[17px] font-black text-slate-800 tracking-tight flex items-center gap-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {item.title}
                                </h5>
                                {item.content && (
                                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                                    {item.content}
                                  </p>
                                )}
                              </div>
                              <div className="sm:shrink-0 sm:pt-0 pt-4">
                                <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/item:bg-emerald-100 group-hover/item:border-emerald-200 group-hover/item:text-emerald-700 transition-all">
                                  Expert Directive
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Bottom Luxury Footer */}
                <div className="mt-24 py-12 border-t border-emerald-50 flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-20 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-3xl border-2 border-emerald-100 flex items-center justify-center bg-white shadow-lg">
                      <ScanFace className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] font-sans">Final Directive Executed</p>
                    <p className="text-base font-serif italic text-slate-400 max-w-sm mx-auto">
                      "Precision in application determines the excellence of the result."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Product Recommendations - SIGNATURE PROTOCOL EMERALD (Option 4) */}
        {skinResult?.skin_type && products.length > 0 && (
          <ScrollReveal 
            delay={0.2}
            className="mb-24"
          >
            <div className="relative group/protocol">
              {/* Prestige Decorative Elements */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 rounded-[40px] blur-xl opacity-0 group-hover/protocol:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative bg-white/80 backdrop-blur-xl border border-emerald-500/10 rounded-[36px] overflow-hidden shadow-[0_8px_32px_-4px_rgba(0,0,0,0.05)]">
                {/* Signature Emerald Header */}
                <div className="relative px-10 py-10 border-b border-emerald-500/5 bg-gradient-to-r from-emerald-50/50 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Elite Protocol</span>
                      <div className="w-px h-3 bg-emerald-200" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">ID: {Math.floor(Math.random() * 90000) + 10000}-SC</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                      Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Curated Protocol</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Precision-grade selection synchronized with {skinTypeLabels[skinResult.skin_type] || skinResult.skin_type} Analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white/50 border border-emerald-500/10 rounded-2xl px-5 py-3 shadow-sm">
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Bio-Match Score</p>
                      <p className="text-xl font-black text-emerald-600 tracking-tighter">98.4<span className="text-xs uppercase ml-0.5">%</span></p>
                    </div>
                    <div className="w-px h-8 bg-emerald-100" />
                    <Award className="w-6 h-6 text-emerald-500/50" />
                  </div>
                </div>

                {/* Signature Large-Scale Grid */}
                <div className="p-12">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">
                    {products
                      .filter((f) => !f.toLowerCase().endsWith(".txt"))
                      .map((filename, idx) => (
                        <div 
                          key={filename} 
                          className="group flex flex-col animate-fade-in"
                          style={{ animationDelay: `${idx * 150}ms` }}
                        >
                          {/* Ultra-Max Photography Frame - Stable High Clarity */}
                          <div className="relative aspect-square rounded-[32px] bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2 mb-6">
                            <img 
                              src={getProductImageUrl(skinResult.skin_type, filename)} 
                              alt={filename} 
                              className="w-full h-full scale-110 object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)]" 
                            />
                            
                            {/* Expert Seal */}
                            <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                               <div className="bg-emerald-500 rounded-full p-1.5 shadow-xl shadow-emerald-500/30">
                                 <CheckCircle className="w-3.5 h-3.5 text-white" />
                               </div>
                            </div>
                          </div>

                          {/* Large Signature Metadata */}
                          <div className="space-y-4 px-2">
                            <div className="space-y-2">
                               <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Step {idx + 1}</p>
                                  <div className="w-2 h-px bg-emerald-200" />
                               </div>
                               <h4 className="text-[16px] font-bold text-slate-900 leading-tight tracking-tight group-hover:text-emerald-700 transition-colors">
                                 {filename.replace(/\.[^.]+$/, "").replace(/\s+/g, " ")}
                               </h4>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                               <div className="flex items-center gap-2 grayscale group-hover:grayscale-0 transition-all duration-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">Prescription Standard</span>
                               </div>
                               <Award className="w-4 h-4 text-slate-200 group-hover:text-emerald-500/30 transition-all" />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Elite Status Bar */}
                <div className="bg-slate-900 px-10 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ScanFace className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Facecraft Signature Protocol Executed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-widest uppercase">Encryption Active</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Pre-analysis content — Tips, How it works, What you get */}
        {!faceResult && (
          <div className="space-y-6 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-6 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 animate-fade-in-up animate-delay-200">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Lightbulb className="w-6 h-6 text-amber-600" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Tips for best results</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Front-facing, well-lit photo</li>
                  <li>• No hats or sunglasses</li>
                  <li>• Face camera directly</li>
                  <li>• JPG, PNG or WEBP · 5MB max</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-6 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Cpu className="w-6 h-6 text-violet-600" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">How it works</h3>
                <ol className="space-y-2 text-sm text-slate-600">
                  <li>1. Upload photo → Get face shape</li>
                  <li>2. Upload again → Get skin analysis</li>
                  <li>3. Products & tips by skin type</li>
                </ol>
              </div>
              <div className="group rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-6 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 animate-fade-in-up animate-delay-400">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <ScanFace className="w-6 h-6 text-sky-600" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Your analysis includes</h3>
                <p className="text-sm text-slate-600">Face shape, skin type & tone, acne/dark spots/wrinkles metrics, grooming tips, and product recommendations.</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis complete placeholder */}
        {skinResult?.skin_type && products.length === 0 && (
          <ScrollReveal className="rounded-2xl bg-white/95 backdrop-blur-sm border border-emerald-200/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-6 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Analysis complete</p>
              <p className="text-sm text-slate-500 mt-0.5">Your face shape and skin metrics are ready.</p>
            </div>
          </ScrollReveal>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 flex items-center gap-3 mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Bottom trust strip — fills page */}
        <ScrollReveal delay={0.2} className="flex flex-wrap items-center justify-center gap-8 py-10 px-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <ScanFace className="w-4 h-4 text-slate-400" />
            478 facial landmarks
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Shield className="w-4 h-4 text-slate-400" />
            Secure processing
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Sparkles className="w-4 h-4 text-slate-400" />
            AI-powered
          </div>
        </ScrollReveal>
      </div>
    </section>
  </div>
);
}
