"""
Prediction: MTCNN face detection + crop, then multi-task model for skin_tone, skin_type, acne, darkspot.
"""
import os
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

import config

# Soften skin-issues softmax so one class (e.g. wrinkles) doesn't always show 100%
SKIN_ISSUES_TEMPERATURE = 2.0
from model import build_model

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
    """Return cropped face PIL or None if no face / no MTCNN."""
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


def load_our_model(ckpt_path=None):
    """Load multi-task model for skin_tone and skin_type. Uses backbone from checkpoint if saved (resnet18/resnet34)."""
    if ckpt_path is None:
        ckpt_path = os.path.join(config.CHECKPOINT_DIR, "multitask_skin.pt")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ckpt = None
    if os.path.isfile(ckpt_path):
        ckpt = torch.load(ckpt_path, map_location=device)
    if ckpt:
        backbone_name = ckpt.get("backbone")
        if backbone_name is None:
            sd = ckpt.get("model_state_dict", ckpt)
            backbone_name = "resnet34" if any("layer3.5." in k for k in sd.keys()) else "resnet18"
    else:
        backbone_name = "resnet18"
    model = build_model(pretrained=False, backbone_name=backbone_name)
    if ckpt:
        model.load_state_dict(ckpt["model_state_dict"], strict=True)
        model.classes = ckpt.get("config_classes", {
            "skin_type": config.SKIN_TYPE_CLASSES,
            "skin_tone": config.SKIN_TONE_CLASSES,
        })
    else:
        model.classes = {"skin_type": config.SKIN_TYPE_CLASSES, "skin_tone": config.SKIN_TONE_CLASSES}
    model.eval()
    return model.to(device), device


# Skin issues indices: acne=0, blackheades=1, dark spots=2, pores=3, wrinkles=4
SKIN_ISSUES_ACNE_IDX = 0
SKIN_ISSUES_BLACKHEADS_IDX = 1
SKIN_ISSUES_DARKSPOT_IDX = 2
SKIN_ISSUES_PORES_IDX = 3
SKIN_ISSUES_WRINKLES_IDX = 4


def _issue_percent(probs, idx):
    if probs is None or len(probs) <= idx:
        return 0
    return round(probs[idx].item() * 100)


def _get_skin_issues_probs(model, pil_image, device, use_mtcnn=True, temperature=SKIN_ISSUES_TEMPERATURE):
    """Get softmax probs for skin_issues head (acne, darkspot, wrinkles, etc.). Uses temperature to avoid overconfident 100%."""
    if use_mtcnn and HAS_MTCNN:
        pil_image = get_face_crop_mtcnn(pil_image)
    img_t = VAL_TRANSFORM(pil_image).unsqueeze(0).to(device)
    with torch.no_grad():
        out = model(img_t)
    if "skin_issues" not in out:
        return None
    logits = out["skin_issues"]
    probs = F.softmax(logits / temperature, dim=1).squeeze()
    if probs.dim() == 0:
        probs = probs.unsqueeze(0)
    return probs


def predict_skin(model, pil_image, device, use_mtcnn=True):
    """Run skin_tone, skin_type, and skin_issues (acne, darkspot, wrinkles %) from our model."""
    if use_mtcnn and HAS_MTCNN:
        pil_image = get_face_crop_mtcnn(pil_image)
    img_t = VAL_TRANSFORM(pil_image).unsqueeze(0).to(device)
    with torch.no_grad():
        out = model(img_t)
    st = out["skin_type"].argmax(1).item()
    stn = out["skin_tone"].argmax(1).item()
    classes = getattr(model, "classes", {"skin_type": config.SKIN_TYPE_CLASSES, "skin_tone": config.SKIN_TONE_CLASSES})
    skin_type = classes["skin_type"][st]
    skin_tone = classes["skin_tone"][stn]
    probs = None
    if "skin_issues" in out:
        logits = out["skin_issues"]
        probs = F.softmax(logits / SKIN_ISSUES_TEMPERATURE, dim=1).squeeze()
        if probs.dim() == 0:
            probs = probs.unsqueeze(0)
    acne_pct = _issue_percent(probs, SKIN_ISSUES_ACNE_IDX)
    blackheads_pct = _issue_percent(probs, SKIN_ISSUES_BLACKHEADS_IDX)
    darkspot_pct = _issue_percent(probs, SKIN_ISSUES_DARKSPOT_IDX)
    pores_pct = _issue_percent(probs, SKIN_ISSUES_PORES_IDX)
    wrinkles_pct = _issue_percent(probs, SKIN_ISSUES_WRINKLES_IDX)
    return skin_type, skin_tone, acne_pct, blackheads_pct, darkspot_pct, pores_pct, wrinkles_pct


def predict_all(image_path_or_pil, ckpt_path=None, use_mtcnn=True, use_optional_models=True):
    """
    Full pipeline: skin_tone, skin_type, and skin issue percentages.
    use_optional_models=False skips skintype.pt and skin_issues.pt for faster inference.
    """
    if isinstance(image_path_or_pil, (str, os.PathLike)):
        pil_image = Image.open(image_path_or_pil).convert("RGB")
    else:
        pil_image = image_path_or_pil.convert("RGB")

    model, device = load_our_model(ckpt_path)
    skin_type, skin_tone, acne_pct, blackheads_pct, darkspot_pct, pores_pct, wrinkles_pct = predict_skin(
        model, pil_image, device, use_mtcnn=use_mtcnn
    )

    if not use_optional_models:
        return {
            "skin_tone": skin_tone,
            "skin_type": skin_type,
            "acne_percent": acne_pct,
            "blackheads_percent": blackheads_pct,
            "darkspot_percent": darkspot_pct,
            "pores_percent": pores_pct,
            "wrinkles_percent": wrinkles_pct,
        }

    skintype_ckpt = os.path.join(config.CHECKPOINT_DIR, "skintype.pt")
    if os.path.isfile(skintype_ckpt) and (ckpt_path is None or "skintype" in str(ckpt_path)):
        try:
            model_st, _ = load_our_model(skintype_ckpt)
            pil_crop = get_face_crop_mtcnn(pil_image) if use_mtcnn and HAS_MTCNN else pil_image
            img_t = VAL_TRANSFORM(pil_crop).unsqueeze(0).to(device)
            with torch.no_grad():
                out_st = model_st(img_t)
            st_idx = out_st["skin_type"].argmax(1).item()
            skin_type = getattr(model_st, "classes", {}).get("skin_type", config.SKIN_TYPE_CLASSES)[st_idx]
        except Exception:
            pass

    skin_issues_ckpt = os.path.join(config.CHECKPOINT_DIR, "skin_issues.pt")
    if os.path.isfile(skin_issues_ckpt) and (ckpt_path is None or "skin_issues" in str(ckpt_path)):
        try:
            model_si, _ = load_our_model(skin_issues_ckpt)
            probs = _get_skin_issues_probs(model_si, pil_image, device, use_mtcnn=use_mtcnn)
            if probs is not None:
                acne_pct = _issue_percent(probs, SKIN_ISSUES_ACNE_IDX)
                blackheads_pct = _issue_percent(probs, SKIN_ISSUES_BLACKHEADS_IDX)
                darkspot_pct = _issue_percent(probs, SKIN_ISSUES_DARKSPOT_IDX)
                pores_pct = _issue_percent(probs, SKIN_ISSUES_PORES_IDX)
                wrinkles_pct = _issue_percent(probs, SKIN_ISSUES_WRINKLES_IDX)
        except Exception:
            pass

    return {
        "skin_tone": skin_tone,
        "skin_type": skin_type,
        "acne_percent": acne_pct,
        "blackheads_percent": blackheads_pct,
        "darkspot_percent": darkspot_pct,
        "pores_percent": pores_pct,
        "wrinkles_percent": wrinkles_pct,
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path>")
        sys.exit(1)
    out = predict_all(sys.argv[1])
    print(out)
