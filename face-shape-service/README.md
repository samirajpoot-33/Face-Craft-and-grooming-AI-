# Face Shape Service (for Facecraft 2)

This Python service runs the same face-shape model as the Face-Shape-Detection project (MediaPipe + Random Forest) and exposes a JSON API for the Facecraft backend.

## Setup

1. **Create a virtual environment (recommended)**

   ```bash
   cd face-shape-service
   python -m venv venv
   venv\Scripts\activate   # Windows
   # or: source venv/bin/activate   # Mac/Linux
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Copy model files from Face-Shape-Detection**

   Copy these two files from your `Face-Shape-Detection-main` folder into this `face-shape-service` folder:

   - `face_landmarker_v2_with_blendshapes.task`
   - `Best_RandomForest.pkl`

   So this folder contains:

   ```
   face-shape-service/
     app.py
     requirements.txt
     README.md
     face_landmarker_v2_with_blendshapes.task   ← copy from Face-Shape-Detection-main
     Best_RandomForest.pkl                      ← copy from Face-Shape-Detection-main
   ```

## Run

```bash
python app.py
```

Runs on **http://127.0.0.1:5001** by default (so it does not conflict with Facecraft backend on 5000).

## API

- **GET /health** – Check if the service is up. Returns `{ "status": "ok" }`.

- **POST /api/predict** – Predict face shape from an image.
  - Body: `multipart/form-data` with field `image` or `file` (image file).
  - Success: `{ "success": true, "face_shape": "Oval", "confidence": 95.2 }`
  - Errors: 400 (no face / bad image), 500 (model or server error).

## Facecraft integration

The Facecraft Node backend calls this service when a user uploads an image on the Face Analyzer page. Ensure this service is running before using Face Analyzer.

## Troubleshooting

**"Import could not be resolved" (Flask, cv2, numpy, mediapipe)**  
These mean the packages are not installed in the Python environment you're using. That will prevent the service from starting and **no landmarks or annotated image will be returned**.

1. In a terminal, go to `face-shape-service` and use a virtual environment:
   ```bash
   cd face-shape-service
   python -m venv venv
   venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```
2. Run the service with that same environment: `python app.py`
3. In Cursor/VS Code: select the venv interpreter (**Ctrl+Shift+P** → "Python: Select Interpreter" → choose `face-shape-service\venv\Scripts\python.exe`) so the IDE resolves imports and the red squiggles go away.
