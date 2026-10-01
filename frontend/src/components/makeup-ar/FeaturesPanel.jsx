import { useMemo, useState, useEffect, useRef } from "react";
import { Copy, Download, Image as ImageIcon } from "lucide-react";
import { useMakeupAr } from "../../context/MakeupArContext";
import { saveMakeupTryOn } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import SocialShare from "../SocialShare";

export default function FeaturesPanel() {
  const ctx = useMakeupAr();
  const { isAuthenticated } = useAuth();
  const [shareImage, setShareImage] = useState(null);
  const lastSavedRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  
  const {
    look,
    lut,
    faceMakeup,
    skin,
    softlight,
    morphs,
    teethWhitening, 
    brows,
    eyelashes,
    eyesMakeup,
    eyes,
    lipstick,
    hair,
    background,
    source,
    takeScreenshot,
    getScreenshotBlob
  } = ctx;

  const features = useMemo(() => {
    const list = [];
    Object.entries(morphs || {}).forEach(([name, m]) => {
      if (m?.strength > 0) list.push({ group: "Retouch", name: m.title });
    });
    if (teethWhitening?.strength > 0) list.push({ group: "Retouch", name: teethWhitening.title });
    Object.entries(faceMakeup || {}).forEach(([name, r]) => {
      if (r?.enabled) list.push({ group: "Makeup", name: r.title });
    });
    if (skin?.softening?.strength > 0) list.push({ group: "Makeup", name: skin.softening.title });
    if (skin?.color?.enabled) list.push({ group: "Makeup", name: skin.color.title });
    if (softlight?.strength > 0) list.push({ group: "Makeup", name: softlight.title });
    if (brows?.enabled) list.push({ group: "Eyes", name: brows.title });
    Object.entries(eyesMakeup || {}).forEach(([name, r]) => {
      if (r?.enabled) list.push({ group: "Eyes", name: r.title });
    });
    if (eyelashes?.enabled) list.push({ group: "Eyes", name: eyelashes.title });
    if (eyes?.color?.enabled) list.push({ group: "Eyes", name: eyes.color.title });
    if (lipstick?.enabled) list.push({ group: "Lipstick", name: "Color" });
    if (hair?.enabled) list.push({ group: "Other", name: "Hair color" });
    if (look?.texture) list.push({ group: "Other", name: `Look "${look.title}"` });
    if (background?.texture) list.push({ group: "Other", name: "Background" });
    if (lut?.texture) list.push({ group: "Other", name: `LUT "${lut.title}"` });
    return list;
  }, [
    morphs,
    teethWhitening,
    faceMakeup,
    skin,
    softlight,
    brows,
    eyesMakeup,
    eyelashes,
    eyes,
    lipstick,
    hair,
    look,
    background,
    lut,
  ]);

  const presetJson = useMemo(
    () =>
      JSON.stringify(
        {
          look: look?.texture || null,
          lut: lut?.texture || null,
          faceMakeup,
          skin,
          softlight,
          morphs,
          teethWhitening,
          brows,
          eyelashes,
          eyesMakeup,
          eyes,
          lipstick,
          hair,
          background,
        },
        null,
        2
      ),
    [
      look,
      lut,
      faceMakeup,
      skin,
      softlight,
      morphs,
      teethWhitening,
      brows,
      eyelashes,
      eyesMakeup,
      eyes,
      lipstick,
      hair,
      background,
    ]
  );

  const copyPreset = () => {
    navigator.clipboard.writeText(presetJson);
  };

  // Auto-save to database when features change (only if user is authenticated and has features)
  useEffect(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't save if user is not authenticated, no features, or no image loaded
    if (!isAuthenticated) {
      console.log("⚠️ Auto-save skipped: User not authenticated");
      return;
    }
    
    if (features.length === 0) {
      console.log("⚠️ Auto-save skipped: No features selected");
      return;
    }
    
    if (source === "none") {
      console.log("⚠️ Auto-save skipped: No image loaded");
      return;
    }

    // Check if preset data actually changed
    const currentPresetHash = presetJson;
    if (lastSavedRef.current === currentPresetHash) {
      console.log("⏭️ Auto-save skipped: No changes detected");
      return;
    }

    console.log("🔄 Auto-save triggered - features:", features.length, "source:", source);

    // Debounce auto-save to avoid too many API calls
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const presetData = JSON.parse(presetJson);
        const sessionName = `Makeup Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        
        console.log("💾 Attempting to save makeup session...", {
          featuresCount: features.length,
          hasLook: !!presetData.look,
          hasLut: !!presetData.lut,
          sessionName,
          isAuthenticated
        });
        
        const response = await saveMakeupTryOn(presetData, sessionName);
        
        console.log("📋 Full API Response:", JSON.stringify(response, null, 2));
        
        if (response && response.success) {
          console.log("✅ Auto-saved makeup session to database:", response.data);
          lastSavedRef.current = currentPresetHash; // Mark as saved
        } else {
          console.error("❌ Auto-save failed:", response?.message || "Unknown error");
          console.error("❌ Full error response:", JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.error("❌ Auto-save error:", error);
        console.error("Error details:", error.message);
        if (error.response) {
          console.error("Response:", error.response);
        }
      }
    }, 2000); // Wait 2 seconds after last change to avoid too many saves

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [presetJson, isAuthenticated, source, features.length]);

  const downloadImage = () => {
    if (source === "none") {
      alert("Please upload an image or use camera first");
      return;
    }
    if (takeScreenshot) {
      takeScreenshot();
    } else {
      alert("Screenshot feature not available");
    }
  };

  const handlePrepareShare = async () => {
    if (getScreenshotBlob) {
      const blob = await getScreenshotBlob();
      if (blob) {
        setShareImage(URL.createObjectURL(blob));
      }
    }
  };

  const byGroup = useMemo(() => {
    const map = {};
    features.forEach((f) => {
      if (!map[f.group]) map[f.group] = [];
      map[f.group].push(f);
    });
    return map;
  }, [features]);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-700/50 dark:border-slate-600/50 bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-xl p-4 overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/30">  
      <div className="mb-3 pb-3 border-b border-slate-600/50 dark:border-slate-700/50">
        <h4 className="font-bold text-sm text-slate-100 dark:text-slate-100 mb-1">
          Girls Makeup Section
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed">
          Express yourself with professional makeup tools
        </p>
      </div>
      <div className="mb-3 pb-3 border-b border-slate-600/50 dark:border-slate-700/50">
        <h4 className="font-bold text-sm text-slate-100 dark:text-slate-100 mb-1">
          Personalized Grooming
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed">
          Tailored beauty solutions just for you
        </p>
      </div>
      <h3 className="font-bold text-sm text-slate-100 dark:text-slate-100 mb-2">Selected Features</h3>
      {features.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-400 mb-3 italic">No features selected</p>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2.5 mb-3 custom-scrollbar">
          {Object.entries(byGroup).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-xs font-bold text-sky-400 dark:text-sky-400 mb-1.5 uppercase tracking-wide">{group}</h4>
              <div className="flex flex-wrap gap-1.5">
                {items.map((f) => (
                  <span
                    key={f.name}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-gradient-to-r from-sky-500/20 to-cyan-500/20 dark:from-sky-500/30 dark:to-cyan-500/30 border border-sky-400/30 dark:border-sky-500/30 text-slate-100 dark:text-slate-100 text-xs font-medium backdrop-blur-sm shadow-sm"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 mt-auto">
        <button
          type="button"
          onClick={downloadImage}
          disabled={source === "none"}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all duration-200 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95 disabled:hover:scale-100"
        >
          <ImageIcon size={14} />
          Download Image
        </button>
        <button
          type="button"
          onClick={copyPreset}
          disabled={features.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-sky-500/60 dark:border-sky-400/60 bg-sky-500/10 dark:bg-sky-500/10 hover:bg-sky-500/20 dark:hover:bg-sky-500/20 text-sky-400 dark:text-sky-300 hover:text-sky-300 dark:hover:text-sky-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:hover:scale-100"
          title="Copy preset"
        >
          <Copy size={14} />
          Copy preset
        </button>
        <div className="mt-2 pt-2 border-t border-slate-600/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Share your look</span>
            <SocialShare 
              variant="compact"
              title="My FaceCraft Makeup Look"
              text="Just tried this amazing virtual makeup on FaceCraft AI! What do you think?"
              url={window.location.href}
              imageUrl={shareImage}
              onShare={handlePrepareShare}
              resourceType="makeup_look"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
