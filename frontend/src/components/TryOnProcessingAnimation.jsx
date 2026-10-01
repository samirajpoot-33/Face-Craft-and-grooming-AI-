import { useEffect, useState } from "react";
import { Sparkles, Wand2, Scissors } from "lucide-react";

const HAIRSTYLE_STEPS = [
  "Analyzing face shape",
  "Mapping hairline",
  "Applying AI hairstyle",
  "Polishing your look",
];

const BEARD_STEPS = [
  "Detecting facial structure",
  "Aligning beard region",
  "Rendering beard style",
  "Finalizing result",
];

const BeardIcon = ({ size = 36, className = "", strokeWidth = 1.5 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: size, height: size }}
  >
    {/* Mustache overlay */}
    <path
      d="M12 14c-1.5-1.5-3.5-2-5.5-1.5C4.5 13 3.5 14.5 3 16c2 .5 4 0 5.5-1.5.5-.5 1-.5 1.5 0 .5.5 1 .5 1.5 0s1-.5 1.5 0c1.5 1.5 3.5 2 5.5 1.5 2-1.5 3-3 3.5-4.5-2-.5-4 0-5.5 1.5-.5.5-1 .5-1.5 0z"
      fill="currentColor"
      opacity="0.15"
    />
    <path d="M12 14c-1.5-1.5-3.5-2-5.5-1.5C4.5 13 3.5 14.5 3 16c2 .5 4 0 5.5-1.5.5-.5 1-.5 1.5 0 .5.5 1 .5 1.5 0s1-.5 1.5 0c1.5 1.5 3.5 2 5.5 1.5 2-1.5 3-3 3.5-4.5-2-.5-4 0-5.5 1.5-.5.5-1 .5-1.5 0z" />
    {/* Beard outline */}
    <path d="M5 16.5c.5 2.5 2 5 4.5 6 1.5.5 3.5.5 5 0 2.5-1 4-3.5 4.5-6" />
    <path d="M12 17v4.5" />
    <path d="M9.5 18c.5.8 1.5 1.5 2.5 1.5s2-.7 2.5-1.5" />
  </svg>
);

/**
 * Premium loading state for hairstyle / beard AI swap
 */
export default function TryOnProcessingAnimation({
  variant = "hairstyle",
  hint = "",
  previewImage = null,
  className = "",
}) {
  const isBeard = variant === "beard";
  const steps = isBeard ? BEARD_STEPS : HAIRSTYLE_STEPS;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 2800);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-[12rem] md:min-h-[18rem] rounded-xl overflow-hidden ${className}`}
    >
      {previewImage && (
        <>
          <img
            src={previewImage}
            alt=""
            className="absolute inset-0 w-full h-full object-contain opacity-25 blur-[2px] scale-105"
            aria-hidden
          />
          <div className="absolute inset-0 bg-slate-950/75" />
          <div className={isBeard ? "beard-scan-beam" : "tryon-scan-beam"} aria-hidden />
        </>
      )}

      {!previewImage && (
        <div
          className={`absolute inset-0 opacity-40 ${
            isBeard
              ? "bg-linear-to-br from-amber-500/10 via-slate-900 to-orange-500/10"
              : "bg-linear-to-br from-sky-500/10 via-slate-900 to-cyan-500/10"
          }`}
        />
      )}

      <div className="relative z-10 flex flex-col items-center px-4 py-6 w-full">
        <div className="relative size-28 sm:size-32 mb-5">
          <div
            className={`absolute inset-0 rounded-full border-2 tryon-orbit-ring ${
              isBeard ? "border-amber-500/35" : "border-sky-500/35"
            }`}
            aria-hidden
          />
          <div
            className={`absolute inset-3 rounded-full border tryon-orbit-ring-reverse ${
              isBeard ? "border-amber-400/25" : "border-sky-400/25"
            }`}
            aria-hidden
          />
          <div className="absolute inset-0 tryon-orbit-ring">
            {[0, 90, 180, 270].map((deg) => (
              <span
                key={deg}
                className={`absolute top-0 left-1/2 -ml-1 size-2 rounded-full ${
                  isBeard
                    ? "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.9)]"
                    : "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                }`}
                style={{
                  transformOrigin: "4px 56px",
                  transform: `rotate(${deg}deg)`,
                }}
                aria-hidden
              />
            ))}
          </div>
          <div
            className={`absolute inset-5 rounded-full flex items-center justify-center tryon-pulse-core ${
              isBeard
                ? "bg-linear-to-br from-amber-500/30 to-orange-600/20 shadow-[0_0_40px_rgba(245,158,11,0.35)]"
                : "bg-linear-to-br from-sky-500/30 to-cyan-600/20 shadow-[0_0_40px_rgba(56,189,248,0.35)]"
            }`}
          >
            {isBeard ? (
              <BeardIcon size={36} className="text-amber-300" strokeWidth={1.5} />
            ) : (
              <Scissors size={36} className="text-sky-300" strokeWidth={1.5} />
            )}
          </div>
          <Sparkles
            size={16}
            className={`absolute -top-1 right-2 tryon-sparkle-a ${
              isBeard ? "text-amber-400/80" : "text-sky-400/80"
            }`}
          />
          <Sparkles
            size={12}
            className={`absolute bottom-2 left-1 tryon-sparkle-b ${
              isBeard ? "text-amber-300/60" : "text-sky-300/60"
            }`}
          />
        </div>

        <p
          className={`text-sm font-bold tracking-wide uppercase mb-1 ${
            isBeard ? "text-amber-300" : "text-sky-300"
          }`}
        >
          AI transformation
        </p>

        <p className="text-white text-base sm:text-lg font-semibold text-center mb-3 tryon-step-fade" key={stepIndex}>
          {steps[stepIndex]}…
        </p>

        <div className="w-full max-w-[200px] h-1 rounded-full bg-slate-700/80 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full tryon-progress-bar ${
              isBeard
                ? "bg-linear-to-r from-amber-500 to-orange-400"
                : "bg-linear-to-r from-sky-500 to-cyan-400"
            }`}
          />
        </div>

        <p className="text-slate-400 text-xs text-center max-w-[240px] leading-relaxed">
          {hint || "Usually 15–60 seconds — please keep this tab open"}
        </p>
      </div>
    </div>
  );
}
