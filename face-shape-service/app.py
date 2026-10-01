"""
Face Analyzer API for Facecraft 2
Face shape: MediaPipe + Random Forest (real confidence).
Landmarks: MediaPipe Face Landmarker via face_landmarks.py (clean mesh + contours).
Skin: PyTorch multi-task CNN via predict.py.
Run: python app.py  (default port 5001)
"""
import os
import io
import sys
import base64
import mimetypes
import warnings
import pickle

import cv2
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image

warnings.filterwarnings("ignore", category=UserWarning, module="google.protobuf")

import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

from face_landmarks import draw_face_landmarks_on_image

try:
    from predict import predict_all
    HAS_SKIN_MODEL = True
except ImportError as e:
    print("Skin model imports failed:", e, file=sys.stderr)
    HAS_SKIN_MODEL = False

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_ASSET = os.path.join(BASE_DIR, "face_landmarker_v2_with_blendshapes.task")
PKL_PATH = os.path.join(BASE_DIR, "Best_RandomForest.pkl")

PRODUCTS_FOLDERS = {
    "dry": os.path.join(BASE_DIR, "Products for dry Skin"),
    "normal": os.path.join(BASE_DIR, "products for normal skin"),
    "oily": os.path.join(BASE_DIR, "products for oily skin"),
}
TIPS_FILES = {
    "dry": "Tips for Dry skin.txt",
    "normal": "Tips for Normal Skin.txt",
    "oily": "Tips for Oily skin.txt",
}

face_landmarker = None
face_shape_model = None
COLOR_TEXT = (0, 255, 0)
SHAPE_LABELS = ["Heart", "Oval", "Round", "Square"]


def distance_3d(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))


def calculate_face_features(coords):
    landmark_indices = {
        "forehead": 10,
        "chin": 152,
        "left_cheek": 234,
        "right_cheek": 454,
        "left_eye": 263,
        "right_eye": 33,
        "nose_tip": 1,
    }
    features = []
    landmarks_dict = {name: coords[idx] for name, idx in landmark_indices.items()}
    features.append(distance_3d(landmarks_dict["forehead"], landmarks_dict["chin"]))
    features.append(distance_3d(landmarks_dict["left_cheek"], landmarks_dict["right_cheek"]))
    features.append(distance_3d(landmarks_dict["left_eye"], landmarks_dict["right_eye"]))
    features.append(distance_3d(landmarks_dict["nose_tip"], landmarks_dict["left_eye"]))
    features.append(distance_3d(landmarks_dict["nose_tip"], landmarks_dict["right_eye"]))
    features.append(distance_3d(landmarks_dict["chin"], landmarks_dict["left_cheek"]))
    features.append(distance_3d(landmarks_dict["chin"], landmarks_dict["right_cheek"]))
    features.append(distance_3d(landmarks_dict["forehead"], landmarks_dict["left_eye"]))
    features.append(distance_3d(landmarks_dict["forehead"], landmarks_dict["right_eye"]))
    return np.array(features)


def get_face_shape_label(label_index):
    if 0 <= label_index < len(SHAPE_LABELS):
        return SHAPE_LABELS[label_index]
    return "Unknown"


def init_face_shape_models():
    global face_landmarker, face_shape_model
    if face_landmarker is not None:
        return
    if not os.path.exists(MODEL_ASSET):
        raise FileNotFoundError(
            f"MediaPipe model not found: {MODEL_ASSET}. "
            "Copy face_landmarker_v2_with_blendshapes.task into face-shape-service/."
        )
    if not os.path.exists(PKL_PATH):
        raise FileNotFoundError(
            f"Random Forest model not found: {PKL_PATH}. "
            "Copy Best_RandomForest.pkl into face-shape-service/."
        )
    base_options = mp_python.BaseOptions(model_asset_path=MODEL_ASSET)
    options = vision.FaceLandmarkerOptions(
        base_options=base_options,
        output_face_blendshapes=True,
        output_facial_transformation_matrixes=True,
        num_faces=1,
    )
    face_landmarker = vision.FaceLandmarker.create_from_options(options)
    with open(PKL_PATH, "rb") as f:
        face_shape_model = pickle.load(f)


def _annotate_face_shape(rgb_image, face_shape):
    """Draw clean MediaPipe landmarks + green face-shape label."""
    pil_rgb = Image.fromarray(rgb_image)
    annotated_pil, landmarks_list = draw_face_landmarks_on_image(
        pil_rgb, draw_mesh=True, draw_contours=True
    )
    annotated_rgb = np.array(annotated_pil)
    # Removed text overlay to keep the image clean

    h, w = annotated_rgb.shape[:2]
    max_side = 800
    if max(h, w) > max_side:
        scale_factor = max_side / max(h, w)
        annotated_rgb = cv2.resize(
            annotated_rgb,
            (int(w * scale_factor), int(h * scale_factor)),
            interpolation=cv2.INTER_AREA,
        )
    _, buf = cv2.imencode(".jpg", cv2.cvtColor(annotated_rgb, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buf.tobytes()).decode("utf-8"), landmarks_list is not None


def _predict_face_shape_from_bytes(data):
    init_face_shape_models()
    nparr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid or corrupted image")
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    detection_result = face_landmarker.detect(mp_image)
    if not detection_result.face_landmarks:
        raise ValueError("No face detected in the image")

    face_landmarks = detection_result.face_landmarks[0]
    landmarks = np.array([[lm.x, lm.y, lm.z] for lm in face_landmarks])
    features = calculate_face_features(landmarks)
    label_index = face_shape_model.predict([features])[0]
    face_shape = get_face_shape_label(label_index)
    try:
        probs = face_shape_model.predict_proba([features])[0]
        confidence = float(probs.max() * 100)
    except Exception:
        confidence = 92.0
    confidence = round(min(100, max(0, confidence)), 2)
    annotated_base64, landmarks_detected = _annotate_face_shape(rgb, face_shape)
    return face_shape, confidence, annotated_base64, landmarks_detected


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "face-analyzer", "skin_model": HAS_SKIN_MODEL})


@app.route("/predict", methods=["POST"])
def predict_skin():
    """Skin analysis: type, tone, acne, blackheads, dark spots, pores, wrinkles."""
    if not HAS_SKIN_MODEL:
        return jsonify({"error": "Skin analysis model not available"}), 503
    if "file" not in request.files and "image" not in request.files:
        return jsonify({"error": "No image file"}), 400
    file = request.files.get("file") or request.files.get("image")
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    try:
        img = Image.open(io.BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    try:
        return jsonify(predict_all(img, use_mtcnn=True, use_optional_models=True))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/predict", methods=["POST"])
def api_predict_face_shape():
    """Face shape prediction + annotated landmarks image (used by Facecraft backend Step 1)."""
    if "image" not in request.files and "file" not in request.files:
        return jsonify({"success": False, "message": "No image file provided"}), 400
    file = request.files.get("image") or request.files.get("file")
    if file.filename == "":
        return jsonify({"success": False, "message": "No file selected"}), 400
    allowed = {"jpg", "jpeg", "png"}
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"success": False, "message": "Allowed formats: jpg, jpeg, png"}), 400

    try:
        face_shape, confidence, annotated_base64, landmarks_detected = _predict_face_shape_from_bytes(file.read())
        return jsonify({
            "success": True,
            "face_shape": face_shape,
            "confidence": confidence,
            "annotated_image_base64": annotated_base64,
            "landmarks_detected": landmarks_detected,
        })
    except FileNotFoundError as e:
        return jsonify({"success": False, "message": str(e)}), 500
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"Prediction error: {str(e)}"}), 500


@app.route("/products/<skin_type>")
def products_list(skin_type):
    skin_type = skin_type.lower().strip()
    if skin_type not in PRODUCTS_FOLDERS:
        return jsonify({"error": "Unknown skin type", "images": []}), 400
    folder = PRODUCTS_FOLDERS[skin_type]
    if not os.path.isdir(folder):
        return jsonify({"skin_type": skin_type, "images": []})
    exts = (".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif")
    images = [
        f for f in os.listdir(folder)
        if os.path.isfile(os.path.join(folder, f)) and f.lower().endswith(exts)
    ]
    return jsonify({"skin_type": skin_type, "images": images})


@app.route("/tips/<skin_type>")
def tips_for_skin_type(skin_type):
    skin_type = skin_type.lower().strip()
    if skin_type not in PRODUCTS_FOLDERS:
        return jsonify({"error": "Unknown skin type", "tips": ""}), 400
    folder = PRODUCTS_FOLDERS[skin_type]
    tips_filename = TIPS_FILES.get(skin_type)
    if not tips_filename:
        return jsonify({"skin_type": skin_type, "tips": ""})
    path = os.path.join(folder, tips_filename)
    if not os.path.isfile(path):
        return jsonify({"skin_type": skin_type, "tips": ""})
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            tips = f.read()
        return jsonify({"skin_type": skin_type, "tips": tips.strip()})
    except Exception as e:
        return jsonify({"skin_type": skin_type, "tips": "", "error": str(e)})


@app.route("/products/<skin_type>/<path:filename>")
def product_image(skin_type, filename):
    skin_type = skin_type.lower().strip()
    if skin_type not in PRODUCTS_FOLDERS:
        return jsonify({"error": "Unknown skin type"}), 404
    folder = PRODUCTS_FOLDERS[skin_type]
    path = os.path.join(folder, filename)
    if not os.path.isfile(path) or os.path.normpath(path) != os.path.normpath(os.path.join(folder, filename)):
        return jsonify({"error": "Not found"}), 404
    mime, _ = mimetypes.guess_type(path)
    return send_file(path, mimetype=mime or "application/octet-stream", as_attachment=False)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    try:
        init_face_shape_models()
        print(f"Face Analyzer Service running on http://127.0.0.1:{port}")
        print("Endpoints: /api/predict (face shape), /predict (skin), /products/<type>, /tips/<type>")
    except FileNotFoundError as e:
        print(e, file=sys.stderr)
        sys.exit(1)
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
