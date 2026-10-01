"""
Configuration - modify paths and hyperparameters for your dataset structure.
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SKIN_TYPE_ROOT = os.path.join(BASE_DIR, "skinTypes")
SKIN_TYPE_TRAIN = os.path.join(SKIN_TYPE_ROOT, "train")
SKIN_TYPE_VALID = os.path.join(SKIN_TYPE_ROOT, "valid")
SKIN_TYPE_TEST = os.path.join(SKIN_TYPE_ROOT, "test")

SKIN_TONE_ROOT = os.path.join(BASE_DIR, "data_skintone")
SKIN_TONE_FOLDER_MAP = {
    "light": 0,
    "mid-light": 1,
    "mid-dark": 2,
    "dark": 3,
    "White": 0,
    "Black": 3,
    "Brown": 2,
}

SKIN_ISSUES_ROOT = os.path.join(BASE_DIR, "Skin isues")

CHECKPOINT_DIR = os.path.join(BASE_DIR, "checkpoints")
os.makedirs(CHECKPOINT_DIR, exist_ok=True)

DEVICE = "cuda"
BATCH_SIZE = 32
EPOCHS = 5
LR = 1e-3
IMAGE_SIZE = 224
NUM_WORKERS = 0

FACE_SHAPE_CLASSES = ["Heart", "Oblong", "Oval", "Round", "Square"]
NUM_FACE_SHAPE = len(FACE_SHAPE_CLASSES)

SKIN_TYPE_CLASSES = ["dry", "normal", "oily"]
SKIN_TONE_CLASSES = ["light", "mid-light", "mid-dark", "dark"]
SKIN_ISSUES_CLASSES = ["acne", "blackheades", "dark spots", "pores", "wrinkles"]

NUM_SKIN_TYPE = len(SKIN_TYPE_CLASSES)
NUM_SKIN_TONE = len(SKIN_TONE_CLASSES)
NUM_SKIN_ISSUES = len(SKIN_ISSUES_CLASSES)
