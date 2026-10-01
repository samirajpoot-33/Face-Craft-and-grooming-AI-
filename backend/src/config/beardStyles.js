/**
 * UI slot ID → AILab `beard` preset (AI Beard Styling API)
 * @see https://www.ailabtools.com/docs/ai-portrait/editing/ai-beard-styling/api
 */

export const BEARD_STYLES = {
  1: { api: 'FullBeardClassic', label: 'Full Beard Classic' },
  2: { api: 'FullBeardTapered', label: 'Full Beard Tapered' },
  3: { api: 'CorporateBeard', label: 'Corporate Beard' },
  4: { api: 'Garibaldi', label: 'Garibaldi' },
  5: { api: 'Verdi', label: 'Verdi' },
  6: { api: 'Bandholz', label: 'Bandholz' },
  7: { api: 'VanDyke', label: 'Van Dyke' },
  8: { api: 'VanDykeRefined', label: 'Van Dyke Refined' },
  9: { api: 'Goatee', label: 'Goatee' },
  10: { api: 'ExtendedGoatee', label: 'Extended Goatee' },
  11: { api: 'PetiteGoatee', label: 'Petite Goatee' },
  12: { api: 'Balbo', label: 'Balbo' },
  13: { api: 'CircleBeard', label: 'Circle Beard' },
  14: { api: 'AnchorBeardClean', label: 'Anchor Beard (Clean)' },
  15: { api: 'AnchorBeardFull', label: 'Anchor Beard (Full)' },
  16: { api: 'DucktailBeardPointed', label: 'Ducktail (Pointed)' },
  17: { api: 'DucktailBeardFull', label: 'Ducktail (Full)' },
  18: { api: 'HeavyStubble', label: 'Heavy Stubble' },
  19: { api: 'ChinStrap', label: 'Chin Strap' },
  20: { api: 'MuttonChops', label: 'Mutton Chops' },
  21: { api: 'SoulPatch', label: 'Soul Patch' },
  22: { api: 'ChevronMoustache', label: 'Chevron Moustache' },
  23: { api: 'HandlebarMoustache', label: 'Handlebar Moustache' },
  24: { api: 'ImperialMoustache', label: 'Imperial Moustache' },
};

export const BEARD_STYLE_COUNT = Object.keys(BEARD_STYLES).length;

export function resolveBeardStyle(styleId) {
  const entry = BEARD_STYLES[styleId];
  if (!entry) {
    throw new Error(`Unknown beard style id: ${styleId}`);
  }
  return entry.api;
}

export function resolveBeardStyleLabel(styleId) {
  return BEARD_STYLES[styleId]?.label || `Style ${styleId}`;
}

export function getMaxBeardStyleId() {
  return BEARD_STYLE_COUNT;
}
