"""
Face shape prediction + facial landmark overlay.
1. Load face shape model (Heart, Oblong, Oval, Round, Square).
2. Optionally crop face with MTCNN for prediction.
3. Run MediaPipe Face Mesh and draw mesh + contours on the image.
4. Return face_shape and annotated image (PIL or base64).
"""
import os
import base64
import io
import torch
from PIL import Image
from torchvision import transforms

import config
from model import build_face_shape_model
from face_landmarks import draw_face_landmarks_on_image

try:
    from facenet_pytorch import MTCNN
    HAS_MTCNN = True
except ImportError:
    HAS_MTCNN = False

VAL_TRANSFORM = transforms.Compose([
    transforms.Resize((config.IMAGE_SIZE, config.IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def get_face_crop_mtcnn(pil_image):
    """Return cropped face PIL or original if no face / no MTCNN."""
    if not HAS_MTCNN:
        return pil_image
    mtcnn = MTCNN(keep_all=False, device="cpu")
    boxes, _ = mtcnn.detect(pil_image)
    if boxes is None or len(boxes) == 0:
        return pil_image
    x1, y1, x2, y2 = map(int, boxes[0])
    w, h = pil_image.size
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    if x2 <= x1 or y2 <= y1:
        return pil_image
    return pil_image.crop((x1, y1, x2, y2))


def load_face_shape_model(ckpt_path=None):
    """Load face shape classifier. Returns (model, device, classes)."""
    if ckpt_path is None:
        ckpt_path = os.path.join(config.CHECKPOINT_DIR, "face_shape.pt")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_face_shape_model(pretrained=False, num_classes=config.NUM_FACE_SHAPE)
    if os.path.isfile(ckpt_path):
        ckpt = torch.load(ckpt_path, map_location=device)
        model.load_state_dict(ckpt["model_state_dict"], strict=True)
        classes = ckpt.get("classes", config.FACE_SHAPE_CLASSES)
    else:
        classes = config.FACE_SHAPE_CLASSES
    model.eval()
    return model.to(device), device, classes


def predict_face_shape(model, pil_image, device, classes, use_mtcnn=True):
    """Predict face shape label (Heart, Oblong, Oval, Round, Square)."""
    if use_mtcnn and HAS_MTCNN:
        crop = get_face_crop_mtcnn(pil_image)
    else:
        crop = pil_image
    img_t = VAL_TRANSFORM(crop).unsqueeze(0).to(device)
    with torch.no_grad():
        logits = model(img_t)
    idx = logits.argmax(1).item()
    return classes[idx]


def predict_face_shape_with_landmarks(image_path_or_pil, ckpt_path=None, use_mtcnn=True, return_image_base64=True):
    """
    Full pipeline: predict face shape, draw 468 face landmarks (mesh + contours) on image, return result.
    Returns dict: face_shape, image_with_landmarks (PIL or base64), landmarks_detected (bool).
    """
    if isinstance(image_path_or_pil, (str, os.PathLike)):
        pil_image = Image.open(image_path_or_pil).convert("RGB")
    else:
        pil_image = image_path_or_pil.convert("RGB")

    model, device, classes = load_face_shape_model(ckpt_path)
    face_shape = predict_face_shape(model, pil_image, device, classes, use_mtcnn=use_mtcnn)

    # Draw landmarks on the *original* image (full frame with face visible)
    annotated_pil, landmarks_list = draw_face_landmarks_on_image(pil_image, draw_mesh=True, draw_contours=True)
    landmarks_detected = landmarks_list is not None

    out = {
        "face_shape": face_shape,
        "landmarks_detected": landmarks_detected,
    }
    if return_image_base64 and annotated_pil is not None:
        buf = io.BytesIO()
        annotated_pil.save(buf, format="PNG")
        out["image_with_landmarks_base64"] = base64.b64encode(buf.getvalue()).decode("utf-8")
    else:
        out["image_with_landmarks"] = annotated_pil
    return out


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python predict_faceshape.py <image_path>")
        sys.exit(1)
    result = predict_face_shape_with_landmarks(sys.argv[1], return_image_base64=False)
    print("Face shape:", result["face_shape"])
    print("Landmarks detected:", result["landmarks_detected"])
    if "image_with_landmarks" in result:
        result["image_with_landmarks"].save("face_landmarks_out.png")
        print("Saved face_landmarks_out.png")
