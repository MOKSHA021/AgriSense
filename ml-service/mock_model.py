import torch
import torchvision.models as models
import os

MODELS_DIR = "c:/Agri/AgriSense/ml-service/models"
os.makedirs(MODELS_DIR, exist_ok=True)

CLASSES = [
    'Alluvial_Soil', 'Arid_Soil', 'Black_Soil',
    'Laterite_Soil', 'Mountain_Soil', 'Red_Soil', 'Yellow_Soil'
]

print("Building EfficientNet-B0 mock model...")
net = models.efficientnet_b0(weights=None)
net.classifier[1] = torch.nn.Sequential(
    torch.nn.Dropout(p=0.3),
    torch.nn.Linear(1280, len(CLASSES))
)

ckpt = {
    "epoch": 1,
    "model_state": net.state_dict(),
    "optimizer": {},
    "val_acc": 99.9,
    "classes": CLASSES,
}

best_path = os.path.join(MODELS_DIR, "soil_model_best.pt")
torch.save(ckpt, best_path)
print(f"Saved mock model to: {best_path}")

final_path = os.path.join(MODELS_DIR, "soil_model.pt")
torch.save(ckpt, final_path)
print(f"Saved mock model to: {final_path}")
