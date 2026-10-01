import { useState, useEffect } from "react";
import { ChevronLeft, Palette, Eye, Smile, Sparkles, RotateCcw, Image, Filter } from "lucide-react";
import { useMakeupAr } from "../../context/MakeupArContext";
import { LOOKS, LUTS, BACKGROUNDS } from "./arData";

// Component to check if assets are actually missing
function MissingAssetsWarning() {
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    // Check if texture files exist by testing one
    const testTexture = "/ar-assets/textures/makeup_40s.png";
    fetch(testTexture, { method: 'HEAD' })
      .then(res => {
        // If 404, textures are missing
        if (!res.ok) {
          setShowWarning(true);
        }
      })
      .catch(() => {
        // Network error or file doesn't exist
        setShowWarning(true);
      });
  }, []);
  
  if (!showWarning) return null;
  
  return (
    <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <p className="text-xs text-amber-800 dark:text-amber-200">
        <strong>⚠️ Missing Textures:</strong> Makeup textures are missing, so looks won't apply. 
        Copy <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">textures/</code> folder 
        from <a href="https://github.com/Banuba/beauty-web/tree/master/assets/textures" target="_blank" rel="noopener" className="underline">beauty-web repo/assets/textures</a> to <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">public/ar-assets/textures/</code>
      </p>
    </div>
  );
}

const TABS = [
  { id: "looks", label: "Looks", icon: Palette },
  { id: "makeup", label: "Makeup", icon: Sparkles },
  { id: "eyes", label: "Eyes", icon: Eye },
  { id: "lipstick", label: "Lipstick", icon: Smile },
  { id: "retouch", label: "Retouch", icon: RotateCcw },
  { id: "luts", label: "LUTs", icon: Filter },
  { id: "background", label: "Background", icon: Image },
];

export default function MakeupControls() {
  const [activeTab, setActiveTab] = useState(null);
  const ctx = useMakeupAr();
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
    lipstickParams,
    hair,
    applyLook,
    applyLut,
    applyFaceMakeup,
    applySkin,
    applySoftlight,
    applyMorph,
    applyTeethWhitening,
    applyBrows,
    applyEyelashes,
    applyEyesMakeup,
    applyEyes,
    applyLipstick,
    applyLipstickParam,
    applyHair,
    applyBackground,
    resetAll,
  } = ctx;

  return (
    <div className="flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
      {activeTab ? (
        <div className="flex flex-col h-full">
          <button
            type="button"
            onClick={() => setActiveTab(null)}
            className="flex items-center gap-2.5 p-3.5 border-b border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent dark:hover:from-slate-800/50 transition-all duration-200 font-medium text-sm"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="flex-1 min-h-0 overflow-hidden p-3 space-y-2">
            {activeTab === "looks" && (
              <div>
                {Object.keys(LOOKS).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p className="text-sm mb-2">Looks assets not found</p>
                    <p className="text-xs">Copy <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">looks/</code> and <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">textures/</code> folders from beauty-web/assets to public/ar-assets/</p>
                  </div>
                ) : (
                  <>
                    {/* Only show warning if textures might be missing - check by trying to detect if images load */}
                    <MissingAssetsWarning />
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(LOOKS).map(([key, item]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applyLook(item.texture, item.title)}
                          className={`rounded-xl overflow-hidden border-2 transition-all ${
                            look.texture === item.texture
                              ? "border-sky-500 ring-2 ring-sky-500/30"
                              : "border-slate-300 dark:border-slate-600 hover:border-sky-400"
                          }`}
                        >
                        <div className="relative w-full aspect-square bg-gradient-to-br from-slate-200/80 to-slate-300/80 dark:from-slate-700/80 dark:to-slate-800/80 flex items-center justify-center overflow-hidden">
                          <img 
                            src={item.cover} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent && !parent.querySelector('.fallback-text')) {
                                const fallback = document.createElement('div');
                                fallback.className = 'fallback-text flex flex-col items-center justify-center h-full text-center p-2';
                                fallback.innerHTML = `
                                  <div class="text-2xl mb-1">🎨</div>
                                  <div class="text-xs font-semibold text-slate-600 dark:text-slate-300">${item.title}</div>
                                  <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">No preview</div>
                                `;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                        <span className="block text-xs font-medium p-1 text-center truncate bg-slate-100 dark:bg-slate-800">
                          {item.title}
                        </span>
                      </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "makeup" && (
              <div className="space-y-2">
                {Object.entries(faceMakeup).map(([name, region]) => (
                  <div key={name} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
                      {region.title}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!region.enabled}
                        onChange={(e) => applyFaceMakeup(name, { enabled: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">On</span>
                    </label>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {skin.softening.title}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={skin.softening.strength}
                    onChange={(e) => applySkin("softening", { strength: +e.target.value })}
                    className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {softlight.title}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={softlight.strength}
                    onChange={(e) => applySoftlight(+e.target.value)}
                    className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "eyes" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Brows</span>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!brows.enabled}
                      onChange={(e) => applyBrows({ enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">On</span>
                  </label>
                </div>
                {Object.entries(eyesMakeup).map(([name, region]) => (
                  <div key={name} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">{region.title}</span>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!region.enabled}
                        onChange={(e) => applyEyesMakeup(name, { enabled: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">On</span>
                    </label>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Eyelashes</span>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!eyelashes.enabled}
                      onChange={(e) => applyEyelashes({ enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">On</span>
                  </label>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Eyes whitening</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={eyes.whitening.strength}
                    onChange={(e) => applyEyes("whitening", { strength: +e.target.value })}
                    className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "lipstick" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Lipstick</span>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!lipstick.enabled}
                      onChange={(e) => applyLipstick({ enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">On</span>
                  </label>
                </div>
                {Object.entries(lipstickParams).map(([name, param]) => (
                  <div key={name} className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{param.title}</span>
                    <input
                      type="range"
                      min={0}
                      max={name === "brightness" || name === "saturation" ? 2 : 1}
                      step={0.01}
                      value={param.value}
                      onChange={(e) => applyLipstickParam(name, +e.target.value)}
                      className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "retouch" && (
              <div className="space-y-3">
                {Object.entries(morphs).map(([name, m]) => (
                  <div key={name} className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{m.title}</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={m.strength}
                      onChange={(e) => applyMorph(name, +e.target.value)}
                      className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{teethWhitening.title}</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={teethWhitening.strength}
                    onChange={(e) => applyTeethWhitening(+e.target.value)}
                    className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "luts" && (
              <div>
                {Object.keys(LUTS).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p className="text-sm mb-2">LUTs assets not found</p>
                    <p className="text-xs">Copy <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">luts/</code> and <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">textures/</code> folders from beauty-web/assets to public/ar-assets/</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => applyLut("")}
                      className="rounded-xl border-2 border-slate-300/50 dark:border-slate-600/50 p-2.5 text-sm font-semibold hover:border-sky-400/60 dark:hover:border-sky-500/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200"
                    >
                      None
                    </button>
                    {Object.entries(LUTS).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyLut(item.texture)}
                        className={`rounded-xl overflow-hidden border-2 transition-all shadow-md hover:shadow-xl ${
                          lut.texture === item.texture
                        ? "border-sky-500 ring-4 ring-sky-500/20 shadow-lg shadow-sky-500/20"
                        : "border-slate-300/50 dark:border-slate-600/50 hover:border-sky-400/60 dark:hover:border-sky-500/60"
                    }`}
                      >
                        <div className="relative w-full aspect-video bg-gradient-to-br from-slate-200/80 to-slate-300/80 dark:from-slate-700/80 dark:to-slate-800/80 overflow-hidden">
                          <img 
                            src={item.cover} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-slate-500">${item.title}</div>`;
                            }}
                          />
                        </div>
                        <span className="block text-xs font-medium p-1 text-center truncate bg-slate-100 dark:bg-slate-800">
                          {item.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "background" && (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pick a predefined background or upload your own.
                </p>
                {Object.keys(BACKGROUNDS).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(BACKGROUNDS).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyBackground("texture", item.texture)}
                        className={`rounded-xl overflow-hidden border-2 transition-all ${
                          ctx.background.texture === item.texture
                            ? "border-sky-500 ring-2 ring-sky-500/30"
                            : "border-slate-300 dark:border-slate-600 hover:border-sky-400"
                        }`}
                      >
                        <div className="aspect-square bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                          <img
                            src={typeof window !== "undefined" ? window.location.origin + item.texture : item.texture}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = e.target.nextElementSibling;
                              if (fallback) fallback.classList.remove("invisible");
                            }}
                          />
                          <span className="absolute inset-0 invisible flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700">No preview</span>
                        </div>
                        <span className="block text-xs font-medium p-1 text-center truncate bg-slate-100 dark:bg-slate-800">
                          {item.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Upload your own</span>
                  <label className="block p-2 rounded-lg border-2 border-dashed border-slate-300/50 dark:border-slate-600/50 hover:border-sky-400/60 dark:hover:border-sky-500/60 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/30">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">Texture</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600 file:cursor-pointer transition-colors"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) await applyBackground("texture", f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Transparency</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={ctx.background.transparency}
                    onChange={(e) => applyBackground("transparency", +e.target.value)}
                    className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="m-3 p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 hover:from-red-500/20 hover:to-red-600/20 dark:hover:from-red-500/30 dark:hover:to-red-600/30 border border-red-400/30 dark:border-red-500/30 text-red-600 dark:text-red-400 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Reset all
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden p-3 space-y-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className="w-full flex items-center gap-2.5 p-3 rounded-lg hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-transparent dark:hover:from-sky-900/20 dark:hover:to-transparent text-left text-slate-700 dark:text-slate-200 transition-all duration-200 group border border-transparent hover:border-sky-200/50 dark:hover:border-sky-700/50 hover:shadow-sm"
            >
              <t.icon size={22} className="text-sky-500 dark:text-sky-400 shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-semibold text-sm">{t.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={resetAll}
            className="w-full flex items-center gap-2.5 p-3 rounded-lg hover:bg-gradient-to-r hover:from-red-50/80 hover:to-transparent dark:hover:from-red-900/30 dark:hover:to-transparent text-left text-red-600 dark:text-red-400 transition-all duration-200 mt-2 border border-transparent hover:border-red-200/50 dark:hover:border-red-800/50 hover:shadow-sm group"
          >
            <RotateCcw size={22} className="shrink-0 group-hover:rotate-180 transition-transform duration-300" />
            <span className="font-semibold text-sm">Reset all</span>
          </button>
        </div>
      )}
    </div>
  );
}
