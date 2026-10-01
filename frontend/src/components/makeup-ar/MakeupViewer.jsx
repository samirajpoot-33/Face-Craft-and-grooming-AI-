import { useRef, useEffect, useState } from "react";
import { Camera, Upload, X, Share2 } from "lucide-react";
import { useMakeupAr } from "../../context/MakeupArContext";
import SocialShare from "../SocialShare";

const WEBAR_SELECTOR = "#webar";

export default function MakeupViewer() {
  const containerRef = useRef(null);
  const [shareImage, setShareImage] = useState(null);
  const {
    source,
    setSource,
    sdk,
    useWebcam,
    useImage,
    stop,
    renderPlayer,
    takeScreenshot,
    getScreenshotBlob
  } = useMakeupAr();

  const handlePrepareShare = async () => {
    if (getScreenshotBlob) {
      const blob = await getScreenshotBlob();
      if (blob) {
        setShareImage(URL.createObjectURL(blob));
      }
    }
  };

  useEffect(() => {
    if (!sdk || source === "none") return;
    renderPlayer(WEBAR_SELECTOR);
    
    // Force resize canvas/video to fit container after rendering
    const resizeContent = () => {
      const container = document.querySelector(WEBAR_SELECTOR);
      if (!container) return;
      
      const canvas = container.querySelector('canvas');
      const video = container.querySelector('video');
      const img = container.querySelector('img');
      
      const maxWidth = container.clientWidth;
      const maxHeight = container.clientHeight;
      
      [canvas, video, img].forEach((el) => {
        if (el) {
          const aspectRatio = el.naturalWidth / el.naturalHeight || el.videoWidth / el.videoHeight || 1;
          let width = maxWidth;
          let height = maxWidth / aspectRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
          
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
          el.style.maxWidth = '100%';
          el.style.maxHeight = '100%';
          el.style.objectFit = 'contain';
        }
      });
    };
    
    // Resize after a short delay to ensure Makeup SDK has rendered
    const timeoutId = setTimeout(resizeContent, 100);
    const intervalId = setInterval(resizeContent, 500);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      try {
        if (sdk.Dom && sdk.Dom.unmount) sdk.Dom.unmount(WEBAR_SELECTOR);
      } catch (_) {}
    };
  }, [sdk, source, renderPlayer]);

  const handleCamera = async () => {
    await useWebcam();
    renderPlayer(WEBAR_SELECTOR);
  };

  const handlePhoto = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file?.type?.startsWith("image/")) return;
    await useImage(file);
    renderPlayer(WEBAR_SELECTOR);
    e.target.value = "";
  };

  const handleClose = () => {
    stop();
    try {
      if (sdk?.Dom?.unmount) sdk.Dom.unmount(WEBAR_SELECTOR);
    } catch (_) {}
    setSource("none");
  };

  const closeLabel =
    source === "webcam" ? "Close camera" : source === "image" ? "Close photo" : "";

  return (
    <div className="relative flex flex-col w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-black/20">
      <div
        ref={containerRef}
        id="webar"
        className="w-full h-full flex items-center justify-center overflow-hidden"
      />
      {source === "none" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-sm z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center mb-2">
            <Camera className="text-sky-400" size={32} />
          </div>
          <p className="text-slate-200 text-center text-base font-medium">
            Use camera or upload a photo to start
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleCamera}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95"
            >
              <Camera size={18} />
              Use camera
            </button>
            <label className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95 cursor-pointer">
              <Upload size={18} />
              Upload photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
      {(source === "webcam" || source === "image") && (
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4 pointer-events-none z-20">
          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              onClick={takeScreenshot}
              className="p-2.5 rounded-xl bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/10 hover:border-white/20 text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
              title="Screenshot"
            >
              <Camera size={18} />
            </button>
          </div>
          {closeLabel && (
            <button
              type="button"
              onClick={handleClose}
              className="pointer-events-auto px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <X size={16} />
              {closeLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
