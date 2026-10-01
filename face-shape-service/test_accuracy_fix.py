
import os
import io
import torch
import numpy as np
from PIL import Image
from predict_faceshape import predict_face_shape_with_landmarks
from predict import predict_all

def test_fallbacks():
    print("Testing Fallback Accuracy Fix...")
    # Create a 512x512 white image (should result in 'Fair' skin tone)
    white_img = Image.fromarray(np.full((512, 512, 3), 255, dtype=np.uint8))
    
    # Create a 512x512 black image (should result in 'Dark' skin tone)
    black_img = Image.fromarray(np.zeros((512, 512, 3), dtype=np.uint8))
    
    # Test Skin Analysis (Heuristics)
    print("\n[Skin Analysis Test]")
    # Heuristic fallback uses get_landmarks_only. Since these images have no face, it returns default "Medium"
    # To truly test, we'd need an image with a face.
    # But we can verify the code doesn't crash.
    result_white = predict_all(white_img, use_mtcnn=False)
    print(f"White Image Tone: {result_white['skin_tone']} (Expected: Medium if no landmarks, Fair if sample found)")
    
    # Test Face Shape (Heuristics)
    print("\n[Face Shape Test]")
    result_fs = predict_face_shape_with_landmarks(white_img, use_mtcnn=False, return_image_base64=False)
    print(f"Face Shape (No Landmarks): {result_fs['face_shape']} (Expected: Oval fallback)")

if __name__ == "__main__":
    test_fallbacks()
