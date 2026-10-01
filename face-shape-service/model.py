"""
Multi-task CNN: shared backbone, heads for age (regression), gender (binary),
skin tone, skin type. MTCNN used in preprocessing (dataset/predict), not inside model.
"""
import torch
import torch.nn as nn
from torchvision import models
import config


def _get_backbone(name="resnet18", pretrained=True):
    if name == "resnet34":
        backbone = models.resnet34(weights=models.ResNet34_Weights.IMAGENET1K_V1 if pretrained else None)
    else:
        backbone = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1 if pretrained else None)
    backbone.fc = nn.Identity()
    return backbone


class MultiTaskCNN(nn.Module):
    def __init__(
        self,
        num_skin_type=config.NUM_SKIN_TYPE,
        num_skin_tone=config.NUM_SKIN_TONE,
        num_skin_issues=config.NUM_SKIN_ISSUES,
        pretrained=True,
        backbone_name="resnet18",
    ):
        super().__init__()
        self.backbone = _get_backbone(backbone_name, pretrained)
        feat_dim = 512

        self.fc_age = nn.Sequential(
            nn.Linear(feat_dim, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, 1),
        )
        self.fc_gender = nn.Sequential(
            nn.Linear(feat_dim, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, 2),
        )
        self.fc_skin_tone = nn.Sequential(
            nn.Linear(feat_dim, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, num_skin_tone),
        )
        self.fc_skin_type = nn.Sequential(
            nn.Linear(feat_dim, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, num_skin_type),
        )
        self.fc_skin_issues = nn.Sequential(
            nn.Linear(feat_dim, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, num_skin_issues),
        )
        self.num_skin_type = num_skin_type
        self.num_skin_tone = num_skin_tone
        self.num_skin_issues = num_skin_issues

    def forward(self, x):
        feat = self.backbone(x)
        age = self.fc_age(feat).squeeze(-1)
        gender = self.fc_gender(feat)
        skin_tone = self.fc_skin_tone(feat)
        skin_type = self.fc_skin_type(feat)
        skin_issues = self.fc_skin_issues(feat)
        return {
            "age": age,
            "gender": gender,
            "skin_tone": skin_tone,
            "skin_type": skin_type,
            "skin_issues": skin_issues,
        }


def build_model(pretrained=True, backbone_name="resnet18"):
    return MultiTaskCNN(pretrained=pretrained, backbone_name=backbone_name)


class FaceShapeModel(nn.Module):
    def __init__(self, num_classes=None, pretrained=True):
        super().__init__()
        if num_classes is None:
            num_classes = getattr(config, "NUM_FACE_SHAPE", 5)
        self.backbone = _get_backbone("resnet18", pretrained)
        feat_dim = 512
        self.fc = nn.Sequential(
            nn.Linear(feat_dim, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes),
        )
        self.num_classes = num_classes

    def forward(self, x):
        feat = self.backbone(x)
        return self.fc(feat)


def build_face_shape_model(pretrained=True, num_classes=None):
    return FaceShapeModel(pretrained=pretrained, num_classes=num_classes)
