import os
import torch
import torchvision.transforms as transforms
import torchvision.models as models
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader, random_split

# 1. Dataset path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'Orignal-Dataset')

# 2. Transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

# 3. Load dataset
full_dataset = ImageFolder(DATA_DIR, transform=transform)
train_size   = int(0.8 * len(full_dataset))
val_size     = len(full_dataset) - train_size
train_set, val_set = random_split(full_dataset, [train_size, val_size])

train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
val_loader   = DataLoader(val_set,   batch_size=32, shuffle=False)

print(f"Training samples:   {train_size}")
print(f"Validation samples: {val_size}")
print(f"Classes found: {full_dataset.classes}")

# 4. Load EfficientNet-B0 and restore trained weights
model = models.efficientnet_b0(weights=None)
model.classifier[1] = torch.nn.Linear(1280, 7)
model.load_state_dict(torch.load(os.path.join(BASE_DIR, 'models', 'soil_model.pt')))

# 5. Unfreeze ALL layers for full fine-tuning
for param in model.parameters():
    param.requires_grad = True

# 6. Training setup
device    = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model     = model.to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-5)
criterion = torch.nn.CrossEntropyLoss()

print(f"\nTraining on: {device}")

# 7. Train loop
for epoch in range(20):
    model.train()
    total_loss, correct, total = 0, 0, 0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss    = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        correct    += (outputs.argmax(1) == labels).sum().item()
        total      += labels.size(0)

    train_acc = 100 * correct / total

    # Validation
    model.eval()
    val_correct, val_total = 0, 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            val_correct += (outputs.argmax(1) == labels).sum().item()
            val_total   += labels.size(0)

    val_acc = 100 * val_correct / val_total
    print(f"Epoch {epoch+1:02d}/20 | Loss: {total_loss:.3f} | Train Acc: {train_acc:.1f}% | Val Acc: {val_acc:.1f}%")

# 8. Save improved model
torch.save(model.state_dict(), os.path.join(BASE_DIR, 'models', 'soil_model.pt'))
print("\nImproved model saved to models/soil_model.pt")
