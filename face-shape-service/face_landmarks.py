"""
Face landmark overlay using MediaPipe Face Landmarker (478 3D landmarks).
Draws mesh + face contour, eyes, eyebrows, mouth like the reference images.
Uses MediaPipe Tasks API (0.10+).
"""
import os
import urllib.request
import numpy as np
from PIL import Image

HAS_MEDIAPIPE = False
_landmarker = None
_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"

try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision
    from mediapipe.tasks.python.vision import FaceLandmarker, FaceLandmarkerOptions, FaceLandmarksConnections
    from mediapipe.tasks.python.vision import drawing_utils as du
    HAS_MEDIAPIPE = True
except ImportError:
    pass


def _get_model_path():
    """Download model if needed, return local path."""
    base = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base, "face_landmarker.task")
    if not os.path.isfile(model_path):
        try:
            urllib.request.urlretrieve(_MODEL_URL, model_path)
        except Exception as e:
            print("Could not download face_landmarker.task:", e)
            return None
    return model_path


def _get_landmarker():
    """Lazy-load FaceLandmarker (downloads model on first use)."""
    global _landmarker
    if _landmarker is not None:
        return _landmarker
    if not HAS_MEDIAPIPE:
        return None
    model_path = _get_model_path()
    if model_path is None:
        return None
    try:
        options = FaceLandmarkerOptions(
            base_options=mp.tasks.BaseOptions(model_asset_path=model_path),
            running_mode=vision.RunningMode.IMAGE,
            num_faces=1,
        )
        _landmarker = FaceLandmarker.create_from_options(options)
        return _landmarker
    except Exception as e:
        print("FaceLandmarker init error:", e)
        return None


def _pil_to_numpy(pil_img):
    return np.array(pil_img.convert("RGB"))


def _numpy_to_pil(arr):
    return Image.fromarray(arr.astype(np.uint8))


def draw_face_landmarks_on_image(pil_image, draw_mesh=True, draw_contours=True, mesh_color=(200, 220, 255), contour_color_face=(255, 255, 255), contour_color_eyes=(66, 153, 255), contour_color_mouth=(255, 100, 100)):
    """
    Run MediaPipe Face Landmarker and draw landmarks overlay.
    Returns (annotated_pil_image, landmarks_list or None).
    """
    landmarker = _get_landmarker()
    if landmarker is None:
        return pil_image, None
    img_np = _pil_to_numpy(pil_image)
    h, w = img_np.shape[:2]
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_np)
    try:
        result = landmarker.detect(mp_image)
    except Exception as e:
        print("FaceLandmarker detect error:", e)
        return pil_image, None
    if not result.face_landmarks or len(result.face_landmarks) == 0:
        return pil_image, None
    face_landmarks = result.face_landmarks[0]
    out = img_np.copy()
    # OpenCV (used by drawing_utils) expects BGR
    import cv2
    out_bgr = cv2.cvtColor(out, cv2.COLOR_RGB2BGR)
    mesh_bgr = (mesh_color[2], mesh_color[1], mesh_color[0])
    face_bgr = (contour_color_face[2], contour_color_face[1], contour_color_face[0])
    eyes_bgr = (contour_color_eyes[2], contour_color_eyes[1], contour_color_eyes[0])
    mouth_bgr = (contour_color_mouth[2], contour_color_mouth[1], contour_color_mouth[0])
    right_bgr = (150, 255, 100)
    if draw_mesh:
        du.draw_landmarks(
            image=out_bgr,
            landmark_list=face_landmarks,
            connections=FaceLandmarksConnections.FACE_LANDMARKS_TESSELATION,
            landmark_drawing_spec=None,
            connection_drawing_spec=du.DrawingSpec(color=mesh_bgr, thickness=1),
        )
    if draw_contours:
        du.draw_landmarks(
            image=out_bgr,
            landmark_list=face_landmarks,
            connections=FaceLandmarksConnections.FACE_LANDMARKS_FACE_OVAL,
            landmark_drawing_spec=None,
            connection_drawing_spec=du.DrawingSpec(color=face_bgr, thickness=2),
        )
        du.draw_landmarks(
            image=out_bgr,
            landmark_list=face_landmarks,
            connections=FaceLandmarksConnections.FACE_LANDMARKS_LIPS,
            landmark_drawing_spec=None,
            connection_drawing_spec=du.DrawingSpec(color=mouth_bgr, thickness=2),
        )
        du.draw_landmarks(
            image=out_bgr,
            landmark_list=face_landmarks,
            connections=FaceLandmarksConnections.FACE_LANDMARKS_LEFT_EYE,
            landmark_drawing_spec=None,
            connection_drawing_spec=du.DrawingSpec(color=eyes_bgr, thickness=2),
        )
        du.draw_landmarks(
            image=out_bgr,
            landmark_list=face_landmarks,
            connections=FaceLandmarksConnections.FACE_LANDMARKS_RIGHT_EYE,
            landmark_drawing_spec=None,
            connection_drawing_spec=du.DrawingSpec(color=right_bgr, thickness=2),
        )
        du.draw_landmarks(
            image=out_bgr,
            landmark_list=face_landmarks,
            connections=FaceLandmarksConnections.FACE_LANDMARKS_LEFT_EYEBROW,
            landmark_drawing_spec=None,
            connection_drawing_spec=du.DrawingSpec(color=eyes_bgr, thickness=2),
        )
        du.draw_landmarks(
            image=out_bgr,
            landmark_list=face_landmarks,
            connections=FaceLandmarksConnections.FACE_LANDMARKS_RIGHT_EYEBROW,
            landmark_drawing_spec=None,
            connection_drawing_spec=du.DrawingSpec(color=right_bgr, thickness=2),
        )
        try:
            du.draw_landmarks(
                image=out_bgr,
                landmark_list=face_landmarks,
                connections=FaceLandmarksConnections.FACE_LANDMARKS_LEFT_IRIS,
                landmark_drawing_spec=None,
                connection_drawing_spec=du.DrawingSpec(color=eyes_bgr, thickness=1),
            )
            du.draw_landmarks(
                image=out_bgr,
                landmark_list=face_landmarks,
                connections=FaceLandmarksConnections.FACE_LANDMARKS_RIGHT_IRIS,
                landmark_drawing_spec=None,
                connection_drawing_spec=du.DrawingSpec(color=right_bgr, thickness=1),
            )
        except (AttributeError, TypeError):
            pass
    out_rgb = cv2.cvtColor(out_bgr, cv2.COLOR_BGR2RGB)
    landmarks_px = [(int(lm.x * w), int(lm.y * h)) for lm in face_landmarks]
    return _numpy_to_pil(out_rgb), landmarks_px


def get_landmarks_only(pil_image):
    """Return list of (x, y) pixel coords for 478 landmarks, or None if no face."""
    landmarker = _get_landmarker()
    if landmarker is None:
        return None
    img_np = _pil_to_numpy(pil_image)
    h, w = img_np.shape[:2]
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_np)
    try:
        result = landmarker.detect(mp_image)
    except Exception:
        return None
    if not result.face_landmarks or len(result.face_landmarks) == 0:
        return None
    return [(int(lm.x * w), int(lm.y * h)) for lm in result.face_landmarks[0]]


def get_face_crop_mediapipe(pil_image, margin=0.1):
    """Detect and crop face using MediaPipe. Better fallback if MTCNN is missing."""
    landmarks = get_landmarks_only(pil_image)
    if not landmarks:
        return None
    
    xs = [p[0] for p in landmarks]
    ys = [p[1] for p in landmarks]
    
    x1, x2 = min(xs), max(xs)
    y1, y2 = min(ys), max(ys)
    
    w_box = x2 - x1
    h_box = y2 - y1
    
    # Add margin
    x1 = max(0, int(x1 - w_box * margin))
    y1 = max(0, int(y1 - h_box * margin))
    x2 = min(pil_image.width, int(x2 + w_box * margin))
    y2 = min(pil_image.height, int(y2 + h_box * margin))
    
    return pil_image.crop((x1, y1, x2, y2))


def get_face_shape_geometric(landmarks):
    """
    Predict face shape using calibrated geometric ratios of MediaPipe landmarks.
    Indices: 10 (top), 152 (chin), 234/454 (cheek), 103/332 (forehead), 172/397 (jaw)
    """
    if not landmarks or len(landmarks) < 454:
        return "Oval"  # Default fallback
    
    def dist(p1_idx, p2_idx):
        p1, p2 = landmarks[p1_idx], landmarks[p2_idx]
        return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)**0.5

    face_height = dist(10, 152)
    face_width = dist(234, 454)  # Cheekbone width
    forehead_width = dist(103, 332)
    jaw_width = dist(172, 397)
    
    if face_width == 0: return "Oval"
    
    hw_ratio = face_height / face_width # Height to Width
    jw_ratio = jaw_width / face_width   # Jaw to Cheekbone
    
    # --- CALIBRATED GEOMETRIC LOGIC ---
    # 1. OBLONG: Height is significantly greater than width
    if hw_ratio > 1.5:
        return "Oblong"
    
    # 2. SQUARE: Balanced Height/Width AND Very Wide Jaw
    if 1.1 <= hw_ratio <= 1.35 and jw_ratio > 0.92:
        return "Square"
    
    # 3. ROUND: Face is nearly as wide as it is long
    if hw_ratio < 1.18:
        return "Round"
    
    # 4. HEART: Wide forehead/cheekbones but very narrow jaw
    if jw_ratio < 0.78:
        return "Heart"
    
    # 5. OVAL: The default balanced proportion (covers ~70% of accurately detected faces)
    return "Oval"
