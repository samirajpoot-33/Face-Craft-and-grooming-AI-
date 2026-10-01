# WebAR Makeup Assets

The app loads the makeup effect zip from the demo CDN by default, so **Makeup_new_morphs.zip is optional** unless the CDN is blocked. To use local assets (or if you see “text/html” / CORS errors), copy from the **beauty-web** project (beauty-web repo → `assets/` folder) into this folder:

1. **Makeup_new_morphs.zip** → place in `ar-assets/` (same level as this README)
2. **textures/** → copy the whole `textures` folder (makeup_*.png, lut_*.png, bg_*.jpeg/png)
3. **looks/** → copy the whole `looks` folder (*.jpg)
4. **luts/** → copy the whole `luts` folder (*.jpg)

Your `ar-assets` folder should look like:

```
ar-assets/
  README.md
  Makeup_new_morphs.zip
  textures/
    makeup_40s.png, makeup_aster.png, ... makeup_twilight.png
    lut_byers.png, ... lut_paladin.png
    bg_flowers.jpeg, bg_neon.png, bg_office.jpeg
  looks/
    40s.jpg, Aster.jpg, ... Twilight.jpg
  luts/
    Byers.jpg, England.jpg, ... Paladin.jpg
```

The app uses `/ar-assets/Makeup_new_morphs.zip` and `/ar-assets/textures/...`, etc.
