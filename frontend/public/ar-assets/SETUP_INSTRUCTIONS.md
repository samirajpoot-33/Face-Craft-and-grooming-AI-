# AR Assets Setup Instructions

## Current Status
✅ Your `ar-assets` folder exists  
❌ `Makeup_new_morphs.zip` is missing  
❌ `looks/`, `luts/`, and `textures/` folders are missing  

## Quick Fix Steps

### Step 1: Download the Effect Zip
1. Open this link in your browser:
   ```
   https://github.com/Banuba/beauty-web/raw/master/assets/Makeup_new_morphs.zip
   ```
2. Save it to: `frontend/public/ar-assets/Makeup_new_morphs.zip`

### Step 2: Download All Asset Folders
You need to copy these folders from the beauty-web project:

**Option A: Clone the repo (recommended)**
```bash
git clone https://github.com/Banuba/beauty-web.git
```
Then copy:
- `beauty-web/assets/looks/` → `frontend/public/ar-assets/looks/`
- `beauty-web/assets/luts/` → `frontend/public/ar-assets/luts/`
- `beauty-web/assets/textures/` → `frontend/public/ar-assets/textures/`

**Option B: Download from GitHub**
1. Go to: https://github.com/Banuba/beauty-web/tree/master/assets
2. Click each folder (`looks`, `luts`, `textures`)
3. Click "Download" button (or use GitHub's download feature)
4. Extract and copy to `frontend/public/ar-assets/`

### Step 3: Verify Structure
After setup, your folder should look like:
```
frontend/public/ar-assets/
  ├── README.md
  ├── Makeup_new_morphs.zip  ← Required for AR to work
  ├── looks/                  ← Required for Looks tab
  │   ├── 40s.jpg
  │   ├── Aster.jpg
  │   └── ... (9 more .jpg files)
  ├── luts/                   ← Required for LUTs tab
  │   ├── Byers.jpg
  │   ├── England.jpg
  │   └── ... (4 more .jpg files)
  └── textures/               ← Required for both Looks & LUTs
      ├── makeup_40s.png
      ├── makeup_aster.png
      ├── lut_byers.png
      └── ... (many more .png files)
```

### Step 4: Restart Dev Server
After adding files, restart your Vite dev server:
1. Stop it (Ctrl+C)
2. Run `npm run dev` again

## What Each File Does

- **Makeup_new_morphs.zip**: Core AR effect file (required for camera/image AR to work)
- **looks/*.jpg**: Preview images shown in the "Looks" tab
- **luts/*.jpg**: Preview images shown in the "LUTs" tab  
- **textures/makeup_*.png**: Actual makeup texture files applied to face
- **textures/lut_*.png**: Color filter textures applied to the image

## Troubleshooting

**If Looks/LUTs buttons show empty:**
- The folders exist but images are missing → Check that all .jpg files are in `looks/` and `luts/`
- Images show broken icons → Check browser console for 404 errors on specific files

**If AR doesn't start:**
- Check browser console for errors
- Verify `Makeup_new_morphs.zip` is exactly in `frontend/public/ar-assets/`
- Restart dev server after adding files
