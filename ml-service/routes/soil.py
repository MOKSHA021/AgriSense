 
import os
import torch
import torchvision.transforms as transforms
import torchvision.models as models
from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io

router  = APIRouter()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CLASSES = ['Alluvial_Soil','Arid_Soil','Black_Soil',
           'Laterite_Soil','Mountain_Soil','Red_Soil','Yellow_Soil']

# Load model once at startup
model = models.efficientnet_b0(weights=None)
model.classifier[1] = torch.nn.Linear(1280, 7)
model.load_state_dict(torch.load(
    os.path.join(BASE_DIR, 'models', 'soil_model.pt'),
    map_location=torch.device('cpu')
))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

@router.post("/predict/soil")
async def predict_soil(file: UploadFile = File(...)):
    img     = Image.open(io.BytesIO(await file.read())).convert('RGB')
    tensor  = transform(img).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(model(tensor), dim=1)[0]
    idx = probs.argmax().item()
    return {
        "soil_type":  CLASSES[idx],
        "confidence": round(probs[idx].item(), 4)
    }
