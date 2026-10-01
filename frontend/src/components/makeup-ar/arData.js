// Paths under /ar-assets/ – copy from beauty-web repo: https://github.com/Banuba/beauty-web/tree/master/assets
// ADD MORE LOOKS: 1) Add texture PNG to public/ar-assets/textures/ (e.g. makeup_natural.png)
//                 2) Optional: add cover JPG to public/ar-assets/looks/ (e.g. Natural.jpg)
//                 3) Add entry below. Full guide: frontend/public/ar-assets/ADD_MORE_LOOKS.md
export const LOOKS = {
  makeup_40s: { title: "40s", cover: "/ar-assets/looks/40s.jpg", texture: "/ar-assets/textures/makeup_40s.png" },
  makeup_aster: { title: "Aster", cover: "/ar-assets/looks/Aster.jpg", texture: "/ar-assets/textures/makeup_aster.png" },
  makeup_confetti: { title: "Confetti", cover: "/ar-assets/looks/Confetti.jpg", texture: "/ar-assets/textures/makeup_confetti.png" },
  makeup_bluebell: { title: "Bluebell", cover: "/ar-assets/looks/Bluebell.jpg", texture: "/ar-assets/textures/makeup_bluebell.png" },
  makeup_coral: { title: "Coral", cover: "/ar-assets/looks/Coral.jpg", texture: "/ar-assets/textures/makeup_coral.png" },
  makeup_dolly: { title: "Dolly", cover: "/ar-assets/looks/Dolly.jpg", texture: "/ar-assets/textures/makeup_dolly.png" },
  makeup_jasmine: { title: "Jasmine", cover: "/ar-assets/looks/Jasmine.jpg", texture: "/ar-assets/textures/makeup_jasmine.png" },
  makeup_smoky: { title: "Smoky", cover: "/ar-assets/looks/Smoky.jpg", texture: "/ar-assets/textures/makeup_smoky.png" },
  makeup_queen: { title: "Queen", cover: "/ar-assets/looks/Queen.jpg", texture: "/ar-assets/textures/makeup_queen.png" },
  makeup_twilight: { title: "Twilight", cover: "/ar-assets/looks/Twilight.jpg", texture: "/ar-assets/textures/makeup_twilight.png" },
  // Example: add more looks here after adding texture file to public/ar-assets/textures/
  // makeup_natural: { title: "Natural", cover: "/ar-assets/looks/Natural.jpg", texture: "/ar-assets/textures/makeup_natural.png" },
};

export const LUTS = {
  lut_byers: { title: "Byers", cover: "/ar-assets/luts/Byers.jpg", texture: "/ar-assets/textures/lut_byers.png" },
  lut_england: { title: "England", cover: "/ar-assets/luts/England.jpg", texture: "/ar-assets/textures/lut_england.png" },
  lut_gray: { title: "Gray", cover: "/ar-assets/luts/Gray.jpg", texture: "/ar-assets/textures/lut_gray.png" },
  lut_lucky: { title: "Lucky", cover: "/ar-assets/luts/Lucky.jpg", texture: "/ar-assets/textures/lut_lucky.png" },
  lut_norway: { title: "Norway", cover: "/ar-assets/luts/Norway.jpg", texture: "/ar-assets/textures/lut_norway.png" },
  lut_paladin: { title: "Paladin", cover: "/ar-assets/luts/Paladin.jpg", texture: "/ar-assets/textures/lut_paladin.png" },
};

// Predefined backgrounds. Add image to public/ar-assets/textures/ then add entry here.
export const BACKGROUNDS = {
  bg_flowers: { title: "Flowers", texture: "/ar-assets/textures/bg_flowers.jpeg" },
  bg_neon: { title: "Neon", texture: "/ar-assets/textures/bg_neon.png" },
  bg_office: { title: "Office", texture: "/ar-assets/textures/bg_office.jpeg" },
};
