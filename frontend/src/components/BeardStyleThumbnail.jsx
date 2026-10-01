import { useId } from "react";

/**
 * Illustrated beard style preview (used when /beards/{id}.webp is missing)
 */

const BEARD_PATHS = {
  full: "M28 52 Q50 68 72 52 Q68 58 50 62 Q32 58 28 52",
  fullWide: "M24 50 Q50 72 76 50 Q70 60 50 64 Q30 60 24 50",
  tapered: "M30 52 Q50 66 70 52 L68 48 Q50 58 32 48 Z",
  corporate: "M32 54 Q50 62 68 54 Q64 58 50 60 Q36 58 32 54",
  garibaldi: "M22 48 Q50 78 78 48 Q72 64 50 68 Q28 64 22 48",
  verdi: "M26 50 Q50 70 74 50 Q68 58 50 62 Q32 58 26 50 M38 48 L62 48",
  bandholz: "M18 46 Q50 82 82 46 Q76 68 50 72 Q24 68 18 46",
  vandyke: "M38 52 L62 52 L58 68 Q50 72 42 68 Z M42 48 L58 48",
  goatee: "M42 54 L58 54 L54 70 Q50 74 46 70 Z",
  extendedGoatee: "M40 52 L60 52 L56 72 Q50 78 44 72 Z M38 50 L62 50",
  petiteGoatee: "M44 56 L56 56 L54 66 Q50 68 46 66 Z",
  balbo: "M36 52 L64 52 L60 68 Q50 72 40 68 Z M30 54 Q50 58 70 54",
  circle: "M34 54 Q50 68 66 54 Q62 58 50 60 Q38 58 34 54 M42 56 L58 56 L56 66 Q50 68 44 66 Z",
  anchor: "M32 52 L68 52 L64 66 Q50 70 36 66 Z M28 56 L72 56",
  ducktail: "M28 52 Q50 70 72 52 L68 48 Q50 58 32 48 Z M50 70 L46 76 L54 76 Z",
  stubble: "M30 54 Q50 60 70 54 M32 58 Q50 62 68 58",
  chinstrap: "M28 58 L72 58 L70 54 L30 54 Z",
  mutton: "M22 48 L28 58 L28 68 M78 48 L72 58 L72 68 M32 54 L68 54",
  soul: "M46 62 L54 62 L52 70 Q50 72 48 70 Z",
  chevron: "M34 50 L66 50 L64 54 L36 54 Z",
  handlebar: "M20 52 Q28 44 36 52 M80 52 Q72 44 64 52 M36 52 L64 52",
  imperial: "M38 48 L62 48 M36 52 L64 52 L62 56 L38 56 Z M50 48 L50 42",
};

const API_TO_VARIANT = {
  FullBeardClassic: "full",
  FullBeardTapered: "tapered",
  CorporateBeard: "corporate",
  Garibaldi: "garibaldi",
  Verdi: "verdi",
  Bandholz: "bandholz",
  VanDyke: "vandyke",
  VanDykeRefined: "vandyke",
  Goatee: "goatee",
  ExtendedGoatee: "extendedGoatee",
  PetiteGoatee: "petiteGoatee",
  Balbo: "balbo",
  CircleBeard: "circle",
  AnchorBeardClean: "anchor",
  AnchorBeardFull: "anchor",
  DucktailBeardPointed: "ducktail",
  DucktailBeardFull: "ducktail",
  HeavyStubble: "stubble",
  ChinStrap: "chinstrap",
  MuttonChops: "mutton",
  SoulPatch: "soul",
  ChevronMoustache: "chevron",
  HandlebarMoustache: "handlebar",
  ImperialMoustache: "imperial",
};

export default function BeardStyleThumbnail({ api, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const variant = API_TO_VARIANT[api] || "full";
  const beardPath = BEARD_PATHS[variant] || BEARD_PATHS.full;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`beardBg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id={`beardHair-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#beardBg-${uid})`} />
      {/* Head silhouette */}
      <ellipse cx="50" cy="38" rx="22" ry="26" fill="#64748b" opacity="0.35" />
      <ellipse cx="50" cy="40" rx="18" ry="22" fill="#94a3b8" opacity="0.25" />
      {/* Neck */}
      <rect x="38" y="58" width="24" height="18" rx="4" fill="#64748b" opacity="0.3" />
      {/* Beard */}
      <path
        d={beardPath}
        fill={`url(#beardHair-${uid})`}
        stroke="#cbd5e1"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
    </svg>
  );
}
