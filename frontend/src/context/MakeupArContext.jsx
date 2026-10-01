import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const MAKEUP_SDK_URL = "https://cdn.jsdelivr.net/npm/@banuba/webar@1.17.0/dist/BanubaSDK.browser.esm.min.js";
const MODULE_NAMES = ["background", "eyes", "face_tracker", "hair", "lips", "skin"];
const MODULES_BASE = "https://cdn.jsdelivr.net/npm/@banuba/webar@1.17.0/dist/modules";
// Effect zip: use Makeup demo CDN if local ar-assets/Makeup_new_morphs.zip is missing
const EFFECT_URL_FALLBACK = "https://banuba.github.io/beauty-web/assets/Makeup_new_morphs.zip";

const MakeupArContext = createContext(null);

function downloadBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function MakeupArProvider({ children }) {
  const token = import.meta.env.VITE_MAKEUP_CLIENT_TOKEN;
  const [isLoading, setIsLoading] = useState(!!token);
  const [error, setError] = useState(!token ? "Add VITE_MAKEUP_CLIENT_TOKEN to .env" : null);
  
  // Debug: Log token status (first 20 chars only for security)
  useEffect(() => {
    if (token) {
      console.log("🔑 Makeup token found:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ Makeup token missing! Check .env file.");
    }
  }, [token]);
  const [source, setSource] = useState("none");
  const [sdk, setSdk] = useState(null);
  const playerRef = useRef(null);
  const effectRef = useRef(null);
  const inputRef = useRef(null);

  const [look, setLook] = useState({ texture: "", title: "" });
  const [lut, setLut] = useState({ texture: "", title: "" });
  const [faceMakeup, setFaceMakeup] = useState({
    highlighter: { title: "Highlighter", color: "0.99 0.99 0.95 0.4", enabled: false },
    contour: { title: "Contour", color: "0.64 0.37 0.24 0.2", enabled: false },
    blushes: { title: "Blush", color: "0.87 0.45 0.77 0.45", enabled: false },
  });
  const [skin, setSkin] = useState({
    softening: { title: "Skin Softening", strength: 0 },
    color: { title: "Skin color", color: "0.98 0.82 0.54 0.9", enabled: false },
  });
  const [softlight, setSoftlight] = useState({ title: "Softlight", strength: 0 });
  const [morphs, setMorphs] = useState({
    face: { title: "Face", strength: 0 },
    nose: { title: "Nose", strength: 0 },
    eyes: { title: "Eyes", strength: 0 },
    lips: { title: "Lips", strength: 0 },
  });
  const [teethWhitening, setTeethWhitening] = useState({ title: "Teeth whitening", strength: 0 });
  const [brows, setBrows] = useState({ title: "Brows", color: "0.172 0.125 0.105 0.732", enabled: false });
  const [eyelashes, setEyelashes] = useState({ title: "Eyelashes", color: "0.22 0.17 0.17 0.65", enabled: false });
  const [eyesMakeup, setEyesMakeup] = useState({
    eyeshadow: { title: "Eyeshadow", color: "0.70 0.15 0.16 0.98", enabled: false },
    eyeliner: { title: "Eyeliner", color: "0 0 0", enabled: false },
  });
  const [eyes, setEyes] = useState({
    color: { title: "Color", color: "0.22 0.43 0.43 0.77", enabled: false },
    flare: { title: "Flare", strength: 0 },
    whitening: { title: "Whitening", strength: 0 },
  });
  const [lipstick, setLipstick] = useState({ enabled: false, color: "0.65 0.20 0.26 0.88" });
  const [lipstickParams, setLipstickParams] = useState({
    brightness: { title: "Brightness", value: 1 },
    saturation: { title: "Saturation", value: 1 },
    shineIntensity: { title: "Shine intensity", value: 0 },
    shineBleeding: { title: "Shine bleeding", value: 0 },
    shineScale: { title: "Shine scale", value: 0 },
    glitterIntensity: { title: "Glitter intensity", value: 0 },
    glitterBleeding: { title: "Glitter bleeding", value: 0 },
    glitterGrain: { title: "Glitter grain", value: 0 },
  });
  const [hair, setHair] = useState({ title: "Color", color: ["0.84 0.24 0.08 1"], enabled: false });
  const [background, setBackground] = useState({
    texture: null,
    contentMode: "fill",
    transparency: 0,
    rotation: 0,
    scale: 1,
  });

  const evalJs = useCallback(async (code, files = []) => {
    const effect = effectRef.current;
    if (!effect) return;
    const writeFile = (f) =>
      (f instanceof File ? Promise.resolve(f) : fetch(f))
        .then((r) => r.arrayBuffer())
        .then((buf) => effect.writeFile(f.name || f, buf));
    await Promise.all((files || []).filter(Boolean).map(writeFile));
    await effect.evalJs(code);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const SDK = await import(/* @vite-ignore */ MAKEUP_SDK_URL);
        if (cancelled) return;
        const { Player, Module, Effect, Webcam, Image, Dom, ImageCapture } = SDK;
        // Try multiple possible locations for the effect file
        const possiblePaths = [
          `${window.location.origin}/ar-assets/Makeup_new_morphs.zip`,  // Preferred location
          `${window.location.origin}/assets/Makeup_new_morphs.zip`,     // Alternative location
        ];
        const [player, modules] = await Promise.all([
          Player.create({ devicePixelRatio: 1, clientToken: token }),
          Module.preload(MODULE_NAMES.map((m) => `${MODULES_BASE}/${m}.zip`)),
        ]);
        if (cancelled) return;
        let effect;
        let effectSource = "local";
        let foundPath = null;
        // Try each possible path
        for (const path of possiblePaths) {
          try {
            effect = await Effect.preload(path);
            foundPath = path;
            console.log("✅ Using local effect file:", path);
            break;
          } catch (e) {
            // Continue to next path or fallback
            console.log(`⚠️ Not found at ${path}, trying next...`);
          }
        }
        // If none of the local paths worked, try CDN
        if (!effect) {
          console.warn("⚠️ Local effect not found in any location, using CDN fallback");
          effectSource = "CDN";
          try {
            effect = await Effect.preload(EFFECT_URL_FALLBACK);
            console.log("✅ Using CDN effect:", EFFECT_URL_FALLBACK);
          } catch (e2) {
            throw new Error(`Failed to load effect. Tried: ${possiblePaths.join(", ")} and CDN (${e2?.message}). Ensure Makeup_new_morphs.zip is in public/ar-assets/ or public/assets/.`);
          }
        }
        if (cancelled) return;
        console.log("📦 Adding modules to player...");
        await player.addModule(...modules);
        console.log("✅ Modules added");
        console.log("🎨 Applying effect...");
        await player.applyEffect(effect);
        console.log("✅ Effect applied successfully");
        if (cancelled) return;
        playerRef.current = player;
        effectRef.current = effect;
        setSdk({ Player, Webcam, Image, Dom, ImageCapture, Effect, Module });
        setError(null);
        console.log("🎉 Makeup SDK initialized successfully!");
      } catch (e) {
        if (!cancelled) {
          const msg = e?.message || "Failed to load Makeup SDK";
          console.error("❌ Makeup SDK initialization error:", e);
          console.error("Error details:", {
            message: msg,
            stack: e?.stack,
            name: e?.name
          });
          const needsZip = /text\/html|application\/zip|failed to fetch|cors/i.test(msg);
          const hint = needsZip
            ? " Download Makeup_new_morphs.zip from GitHub (beauty-web repo, assets folder) and put it in frontend/public/ar-assets/."
            : "";
          setError(msg + hint);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const useWebcam = useCallback(async () => {
    const p = playerRef.current;
    const SDK = sdk;
    if (!p || !SDK) return;
    const input = new SDK.Webcam();
    inputRef.current = input;
    p.use(input);
    await p.play();
    setSource("webcam");
  }, [sdk]);

  const useImage = useCallback(async (file) => {
    const p = playerRef.current;
    const SDK = sdk;
    if (!p || !SDK) return;
    const input = new SDK.Image(file);
    inputRef.current = input;
    p.use(input);
    await p.play();
    setSource("image");
  }, [sdk]);

  const stop = useCallback(() => {
    const inp = inputRef.current;
    if (inp?.stop) inp.stop();
    setSource("none");
  }, []);

  const renderPlayer = useCallback((selector = "#webar") => {
    const p = playerRef.current;
    const SDK = sdk;
    if (!p || !SDK) return;
    SDK.Dom.render(p, selector);
  }, [sdk]);

  const takeScreenshot = useCallback(() => {
    const p = playerRef.current;
    const SDK = sdk;
    if (!p || !SDK) return;
    const capture = new SDK.ImageCapture(p);
    capture.takePhoto().then((blob) => downloadBlob(blob, "FaceCraft_Makeup"));
  }, [sdk]);

  const getScreenshotBlob = useCallback(async () => {
    const p = playerRef.current;
    const SDK = sdk;
    if (!p || !SDK) return null;
    try {
      const capture = new SDK.ImageCapture(p);
      return await capture.takePhoto();
    } catch (err) {
      console.error("Screenshot capture failed:", err);
      return null;
    }
  }, [sdk]);

  const applyLook = useCallback(async (texture, title = "") => {
    setLook({ texture: texture || "", title });
    if (!texture) {
      await evalJs(`Makeup.set("")`);
      console.log("🔄 Reset makeup look");
      return;
    }
    try {
      // Check if texture file exists before applying
      const response = await fetch(texture, { method: 'HEAD' });
      if (!response.ok) {
        console.warn(`⚠️ Texture file not found: ${texture}. Makeup won't apply.`);
        console.warn(`💡 Copy the textures/ folder from beauty-web/assets to public/ar-assets/`);
        setError(`Texture file missing: ${texture}. Copy textures/ folder to public/ar-assets/`);
        return;
      }
      await evalJs(`Makeup.set("${texture}")`, [texture]);
      console.log(`✅ Applied makeup look: ${title} (${texture})`);
    } catch (e) {
      console.error(`❌ Failed to apply look ${title}:`, e);
      // Try applying anyway - Makeup SDK might handle missing files differently
      try {
        await evalJs(`Makeup.set("${texture}")`, [texture]);
      } catch (e2) {
        console.error("❌ Makeup.set failed:", e2);
      }
    }
  }, [evalJs]);

  const applyLut = useCallback((texture) => {
    setLut({ texture: texture || "", title: "" });
    evalJs(`Filter.set("${texture || ""}")`, texture ? [texture] : []);
  }, [evalJs]);

  const applyFaceMakeup = useCallback((name, patch) => {
    setFaceMakeup((prev) => {
      const next = { ...prev, [name]: { ...prev[name], ...patch } };
      const v = next[name];
      evalJs(`Makeup.${name}("${v.enabled ? v.color : "0 0 0 0"}")`);
      return next;
    });
  }, [evalJs]);

  const applySkin = useCallback((name, patch) => {
    setSkin((prev) => {
      const next = { ...prev, [name]: { ...prev[name], ...patch } };
      const v = next[name];
      if (typeof v.strength !== "undefined") evalJs(`Skin.${name}(${v.strength})`);
      else evalJs(`Skin.${name}("${v.enabled ? v.color : "0 0 0 0"}")`);
      return next;
    });
  }, [evalJs]);

  const applySoftlight = useCallback((strength) => {
    setSoftlight((s) => ({ ...s, strength }));
    evalJs(`Softlight.strength(${strength})`);
  }, [evalJs]);

  const applyMorph = useCallback((name, strength) => {
    setMorphs((prev) => ({ ...prev, [name]: { ...(prev[name] || {}), strength } }));
    evalJs(`FaceMorph.${name}(${strength})`);
  }, [evalJs]);

  const applyTeethWhitening = useCallback((strength) => {
    setTeethWhitening((s) => ({ ...s, strength }));
    evalJs(`Teeth.whitening(${strength})`);
  }, [evalJs]);

  const applyBrows = useCallback((patch) => {
    setBrows((prev) => {
      const next = { ...prev, ...patch };
      evalJs(`Brows.color("${next.enabled ? next.color : "0 0 0 0"}")`);
      return next;
    });
  }, [evalJs]);

  const applyEyelashes = useCallback((patch) => {
    setEyelashes((prev) => {
      const next = { ...prev, ...patch };
      evalJs(`Eyelashes.color("${next.enabled ? next.color : "0 0 0 0"}")`);
      return next;
    });
  }, [evalJs]);

  const applyEyesMakeup = useCallback((name, patch) => {
    setEyesMakeup((prev) => {
      const next = { ...prev, [name]: { ...prev[name], ...patch } };
      const v = next[name];
      evalJs(`Makeup.${name}("${v.enabled ? v.color : "0 0 0 0"}")`);
      return next;
    });
  }, [evalJs]);

  const applyEyes = useCallback((name, patch) => {
    setEyes((prev) => {
      const next = { ...prev, [name]: { ...prev[name], ...patch } };
      const v = next[name];
      if (typeof v.strength !== "undefined") evalJs(`Eyes.${name}(${v.strength})`);
      else evalJs(`Eyes.${name}("${v.enabled ? v.color : "0 0 0 0"}")`);
      return next;
    });
  }, [evalJs]);

  const applyLipstick = useCallback((patch) => {
    setLipstick((prev) => {
      const next = { ...prev, ...patch };
      evalJs(`Lips.color("${next.enabled ? next.color : "0 0 0 0"}")`);
      return next;
    });
  }, [evalJs]);

  const applyLipstickParam = useCallback((name, value) => {
    setLipstickParams((prev) => ({ ...prev, [name]: { ...prev[name], value } }));
    evalJs(`Lips.${name}(${value})`);
  }, [evalJs]);

  const applyHair = useCallback((patch) => {
    setHair((prev) => {
      const next = { ...prev, ...patch };
      const col = next.enabled && Array.isArray(next.color) ? next.color.map((c) => `"${c}"`) : '"0 0 0 0"';
      evalJs(`Hair.color(${next.enabled ? col : '"0 0 0 0"'})`);
      return next;
    });
  }, [evalJs]);

  const applyBackground = useCallback(
    async (name, value) => {
      if (name === "texture" && typeof value === "string") {
        const url = value.startsWith("http") ? value : `${window.location.origin}${value}`;
        try {
          const r = await fetch(url);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const blob = await r.blob();
          const v = new File([blob], value.split("/").pop() || "bg.jpg");
          setBackground((prev) => ({ ...prev, [name]: value }));
          await evalJs(`Background.texture("${v.name}")`, [v]);
        } catch (err) {
          console.warn("Background texture failed to load:", value, err);
          return;
        }
        return;
      }
      setBackground((prev) => ({ ...prev, [name]: value }));
      const expr = value instanceof File ? `"${value.name}"` : typeof value === "string" ? `"${value}"` : value;
      await evalJs(`Background.${name}(${expr})`, value instanceof File ? [value] : []);
    },
    [evalJs]
  );

  const resetAll = useCallback(() => {
    setLook({ texture: "", title: "" });
    setLut({ texture: "", title: "" });
    setFaceMakeup({
      highlighter: { title: "Highlighter", color: "0.99 0.99 0.95 0.4", enabled: false },
      contour: { title: "Contour", color: "0.64 0.37 0.24 0.2", enabled: false },
      blushes: { title: "Blush", color: "0.87 0.45 0.77 0.45", enabled: false },
    });
    setSkin({
      softening: { title: "Skin Softening", strength: 0 },
      color: { title: "Skin color", color: "0.98 0.82 0.54 0.9", enabled: false },
    });
    setSoftlight({ title: "Softlight", strength: 0 });
    setMorphs({
      face: { title: "Face", strength: 0 },
      nose: { title: "Nose", strength: 0 },
      eyes: { title: "Eyes", strength: 0 },
      lips: { title: "Lips", strength: 0 },
    });
    setTeethWhitening({ title: "Teeth whitening", strength: 0 });
    setBrows({ title: "Brows", color: "0.172 0.125 0.105 0.732", enabled: false });
    setEyelashes({ title: "Eyelashes", color: "0.22 0.17 0.17 0.65", enabled: false });
    setEyesMakeup({
      eyeshadow: { title: "Eyeshadow", color: "0.70 0.15 0.16 0.98", enabled: false },
      eyeliner: { title: "Eyeliner", color: "0 0 0", enabled: false },
    });
    setEyes({
      color: { title: "Color", color: "0.22 0.43 0.43 0.77", enabled: false },
      flare: { title: "Flare", strength: 0 },
      whitening: { title: "Whitening", strength: 0 },
    });
    setLipstick({ enabled: false, color: "0.65 0.20 0.26 0.88" });
    setLipstickParams({
      brightness: { title: "Brightness", value: 1 },
      saturation: { title: "Saturation", value: 1 },
      shineIntensity: { title: "Shine intensity", value: 0 },
      shineBleeding: { title: "Shine bleeding", value: 0 },
      shineScale: { title: "Shine scale", value: 0 },
      glitterIntensity: { title: "Glitter intensity", value: 0 },
      glitterBleeding: { title: "Glitter bleeding", value: 0 },
      glitterGrain: { title: "Glitter grain", value: 0 },
    });
    setHair({ title: "Color", color: ["0.84 0.24 0.08 1"], enabled: false });
    setBackground({ texture: null, contentMode: "fill", transparency: 0, rotation: 0, scale: 1 });
    evalJs(`
      Makeup.set('');
      Filter.set('');
      Lips.color("0 0 0 0");
      Lips.brightness(1);
      Lips.saturation(1);
      Lips.shineIntensity(0);
      Lips.shineBleeding(0);
      Lips.shineScale(0);
      Lips.glitterIntensity(0);
      Lips.glitterBleeding(0);
      Lips.glitterGrain(0);
      Brows.color("0 0 0 0");
      Eyelashes.color("0 0 0 0");
      Makeup.eyeshadow("0 0 0 0");
      Makeup.eyeliner("0 0 0 0");
      Makeup.highlighter("0 0 0 0");
      Makeup.contour("0 0 0 0");
      Makeup.blushes("0 0 0 0");
      Skin.softening(0);
      Skin.color("0 0 0 0");
      Softlight.strength(0);
      FaceMorph.face(0);
      FaceMorph.nose(0);
      FaceMorph.eyes(0);
      FaceMorph.lips(0);
      Teeth.whitening(0);
      Eyes.color("0 0 0 0");
      Eyes.flare(0);
      Eyes.whitening(0);
      Hair.color("0 0 0 0");
      Background.texture("");
      Background.transparency(0);
    `);
  }, [evalJs]);

  const value = {
    token,
    isLoading,
    error,
    source,
    setSource,
    sdk,
    playerRef,
    effectRef,
    useWebcam,
    useImage,
    stop,
    renderPlayer,
    takeScreenshot,
    getScreenshotBlob,
    evalJs,
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
    background,
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
    setBackground,
    applyBackground,
    resetAll,
  };

  return <MakeupArContext.Provider value={value}>{children}</MakeupArContext.Provider>;
}

export function useMakeupAr() {
  const ctx = useContext(MakeupArContext);
  if (!ctx) throw new Error("useMakeupAr must be used within MakeupArProvider");
  return ctx;
}
