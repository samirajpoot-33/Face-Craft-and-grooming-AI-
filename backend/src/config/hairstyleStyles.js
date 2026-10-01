/**
 * Maps UI style IDs to AILabTools Hairstyle Changer Pro `hair_style` values.
 * IDs match filenames: /hairstyles/{gender}/{id}.webp
 * @see https://www.ailabtools.com/docs/ai-portrait/effects/hairstyle-editor-pro
 */

/** id → { api: AILab hair_style, label: shown under thumbnail } */
export const MALE_HAIR_STYLES = {
  1: { api: 'BuzzCut', label: 'Buzz cut' },
  2: { api: 'UnderCut', label: 'Undercut' },
  3: { api: 'Pompadour', label: 'Pompadour' },
  4: { api: 'SlickBack', label: 'Slick back' },
  5: { api: 'CurlyShag', label: 'Curly shag' },
  6: { api: 'WavyShag', label: 'Wavy shag' },
  7: { api: 'FauxHawk', label: 'Faux hawk' },
  8: { api: 'CombOver', label: 'Comb over' },
  9: { api: 'ManBun', label: 'Man bun' },
  10: { api: 'HighTightFade', label: 'High fade' },
  11: { api: 'Spiky', label: 'Spiky' },
  12: { api: 'Afro', label: 'Afro' },
  13: { api: 'LowFade', label: 'Low fade' },
  14: { api: 'UndercutLongHair', label: 'Undercut long' },
  15: { api: 'TwoBlockHaircut', label: 'Two block' },
  16: { api: 'TexturedFringe', label: 'Textured fringe' },
  17: { api: 'BluntBowlCut', label: 'Bowl cut' },
  18: { api: 'LongWavyCurtainBangs', label: 'Curtain bangs' },
  19: { api: 'MessyTousled', label: 'Messy tousled' },
  20: { api: 'CornrowBraids', label: 'Cornrow braids' },
  21: { api: 'LongHairTiedUp', label: 'Hair tied up' },
  22: { api: 'Middle-parted', label: 'Middle parted' },
};

export const FEMALE_HAIR_STYLES = {
  1: { api: 'PixieCut', label: 'Pixie cut' },
  2: { api: 'ShortNeatBob', label: 'Short bob' },
  3: { api: 'BobCut', label: 'Bob cut' },
  4: { api: 'LongStraight', label: 'Long straight' },
  5: { api: 'LongWavy', label: 'Long wavy' },
  6: { api: 'Ponytail', label: 'Ponytail' },
  7: { api: 'CurlyBob', label: 'Curly bob' },
  8: { api: 'LongCurly', label: 'Long curly' },
  9: { api: 'FishtailBraid', label: 'Fishtail braid' },
  10: { api: 'ShoulderLengthHair', label: 'Shoulder length' },
  11: { api: 'ShortPixieWithShavedSides', label: 'Pixie shaved sides' },
  12: { api: 'DoubleBun', label: 'Double bun' },
  13: { api: 'Updo', label: 'Updo' },
  14: { api: 'Spiked', label: 'Spiked' },
  15: { api: 'bowlCut', label: 'Bowl cut' },
  16: { api: 'Chignon', label: 'Chignon' },
  17: { api: 'SlickedBack', label: 'Slicked back' },
  18: { api: 'StackedCurlsInShortBob', label: 'Stacked curls bob' },
  19: { api: 'ShortTwintails', label: 'Short twintails' },
  20: { api: 'ShortCurlyPixie', label: 'Curly pixie' },
  21: { api: 'TwinBraids', label: 'Twin braids' },
  22: { api: 'Dreadlocks', label: 'Dreadlocks' },
  23: { api: 'Cornrows', label: 'Cornrows' },
  24: { api: 'LooseCurlyAfro', label: 'Curly afro' },
  25: { api: 'LongTwintails', label: 'Long twintails' },
  26: { api: 'LongHimeCut', label: 'Hime cut' },
  27: { api: 'BoxBraids', label: 'Box braids' },
  28: { api: 'WavyFrenchBobVibesfrom1920', label: 'French bob' },
};

export const HAIRSTYLE_COUNTS = {
  male: Object.keys(MALE_HAIR_STYLES).length,
  female: Object.keys(FEMALE_HAIR_STYLES).length,
};

function getStyleMap(gender) {
  return gender === 'male' ? MALE_HAIR_STYLES : FEMALE_HAIR_STYLES;
}

export function getMaxStyleId(gender) {
  return HAIRSTYLE_COUNTS[gender === 'male' ? 'male' : 'female'] || 10;
}

export function resolveHairStyle(gender, styleId) {
  const id = Number(styleId);
  const map = getStyleMap(gender);
  const entry = map[id] || map[1];
  return entry.api;
}

export function resolveHairStyleLabel(gender, styleId) {
  const id = Number(styleId);
  const map = getStyleMap(gender);
  const entry = map[id] || map[1];
  return entry.label;
}
