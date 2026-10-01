# How to Add More Makeup Looks (Working Form)

## 3-step summary

1. **Get a texture file** – A PNG in the makeup SDK format (from the AR tools or Asset Store, or copy an existing one to test).
2. **Put it in your project** – `frontend/public/ar-assets/textures/makeup_YourName.png`
3. **Register in code** – Add one entry in `frontend/src/components/makeup-ar/arData.js` (see below).

---

## Quick test: add one more look in 2 minutes (using existing texture)

Use this to confirm the flow works. You’ll get an extra look that applies the same makeup as “Coral” but under a new name.

### Step 1: Copy files

**On Windows (PowerShell or Command Prompt):**
```bash
cd frontend\public\ar-assets\textures
copy makeup_coral.png makeup_natural.png

cd ..\looks
copy Coral.jpg Natural.jpg
```

**On Mac/Linux:**
```bash
cd frontend/public/ar-assets/textures
cp makeup_coral.png makeup_natural.png

cd ../looks
cp Coral.jpg Natural.jpg
```

### Step 2: Register the look in code

Open **`frontend/src/components/makeup-ar/arData.js`** and add this line inside the `LOOKS` object (e.g. after `makeup_twilight`):

```js
makeup_natural: { title: "Natural", cover: "/ar-assets/looks/Natural.jpg", texture: "/ar-assets/textures/makeup_natural.png" },
```

### Step 3: Restart dev server

Stop the app (Ctrl+C) and run `npm run dev` again. Open Makeup Virtual Try → Looks. You should see **Natural** and it will work (same look as Coral).

---

## Adding truly new looks (different makeup)

For new makeup (not a copy of an existing one), you need a **makeup SDK-format makeup texture** PNG.

---

## How to get new texture files

### Option 1: Use Effect Constructor (recommended)

1. Use **Effect Constructor** (or AR tools) to design new makeup looks.
2. Export the makeup texture as a **PNG** in the same format as the existing ones (face UV-mapped overlay).
3. Save the PNG as:  
   `frontend/public/ar-assets/textures/makeup_YourLookName.png`  
   (e.g. `makeup_natural.png`).
4. Optionally add a preview image:  
   `frontend/public/ar-assets/looks/YourLookName.jpg`.
5. Register the look in code (see **Step 3** below).

---

### Option 2: AR Asset Store

1. Go to **AR Asset Store.**
2. If they offer extra makeup textures/looks, download them.
3. Place the texture PNGs in:  
   `frontend/public/ar-assets/textures/`  
   (e.g. `makeup_radiant.png`).
4. Place any preview images in:  
   `frontend/public/ar-assets/looks/`  
   (e.g. `Radiant.jpg`).
5. Register the look in code (see **Step 3** below).

---

### Option 3: Register the new look in the app

After you have a **texture file** (and optionally a cover image) in the folders above:

1. Open: **`frontend/src/components/makeup-ar/arData.js`**.
2. In the `LOOKS` object, add a new entry, for example:

```js
makeup_natural: {
  title: "Natural",
  cover: "/ar-assets/looks/Natural.jpg",   // optional; can use existing cover if missing
  texture: "/ar-assets/textures/makeup_natural.png"
},
```

3. **Texture** is required and must be a compatible makeup PNG (same kind as `makeup_40s.png`, etc.).
4. **Cover** is optional; used as the thumbnail in the Looks grid. If you don’t add `Natural.jpg`, you can reuse another image for `cover` or add it later.

Restart the dev server after adding files. The new look will appear in the Looks section and will work as long as the texture path and file exist.

---

## Important

- **Texture format:** Must be a composite makeup texture compatible with the `Makeup.set()` API (face UV-mapped PNG). A random image will not work.
- **Source of new textures:** Either create them with AR tools (Effect Constructor, etc.) or use assets from the AR Asset Store. The beauty-web GitHub repo does not contain more than these 10 looks.
- **Naming:** Use `makeup_<name>.png` in `textures/` and match the key in `arData.js` (e.g. `makeup_natural`).

---

## Summary

| Goal                         | Action |
|-----------------------------|--------|
| Use only what exists in repo| You already have all 10 looks; no extra files there. |
| Add more working looks      | Get or create makeup SDK-format makeup PNGs → put in `textures/` → add entry in `arData.js`. |
