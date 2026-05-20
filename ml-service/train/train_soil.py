"""
train_soil.py  -  Production-grade soil classification trainer
AgriSense | EfficientNet-B0 + mixed precision + early stopping + cosine LR + grad clipping

Fixes applied:
  FIX 1 - WeightedRandomSampler built from TRAINING indices only (prevents IndexError)
  FIX 2 - TransformWrapper so train/val subsets never share a transform object
  FIX 3 - pin_memory and num_workers conditioned on CUDA availability
  FIX 4 - FINAL_PATH saves full dict {model_state + classes} not bare state_dict
           so predict_soil.py always recovers the correct index->label mapping
           (root cause of Red Soil being predicted as Grey Soil)
"""

import os
import json
import logging
import argparse
import random
from datetime import datetime
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
import torchvision.transforms as T
import torchvision.models as models
from torch.utils.data import DataLoader, Subset, WeightedRandomSampler
from torchvision.datasets import ImageFolder
from sklearn.metrics import classification_report, confusion_matrix


# -- Config -------------------------------------------------------------------
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR    = os.path.join(BASE_DIR, "data", "Orignal-Dataset")
MODELS_DIR  = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
CKPT_PATH   = os.path.join(MODELS_DIR, "soil_model_best.pt")
FINAL_PATH  = os.path.join(MODELS_DIR, "soil_model.pt")

os.makedirs(MODELS_DIR,  exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


# -- Reproducibility ----------------------------------------------------------
def set_seed(seed: int = 42) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark     = False


# -- Logging ------------------------------------------------------------------
def setup_logger(name: str) -> logging.Logger:
    log_path = os.path.join(REPORTS_DIR, f"{name}.log")
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler(log_path),
            logging.StreamHandler(),
        ],
    )
    return logging.getLogger(name)


# -- FIX 2: TransformWrapper --------------------------------------------------
class TransformWrapper(torch.utils.data.Dataset):
    """
    Wraps a Subset and applies its own transform independently.
    Prevents train_set and val_set from overwriting each other's
    transform on the shared ImageFolder instance.
    """

    def __init__(self, subset: Subset, transform: T.Compose) -> None:
        self.subset    = subset
        self.transform = transform

    def __len__(self) -> int:
        return len(self.subset)

    def __getitem__(self, idx: int):
        path, label = self.subset.dataset.samples[self.subset.indices[idx]]
        img = self.subset.dataset.loader(path)
        img = img.convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label


# -- Early Stopping -----------------------------------------------------------
class EarlyStopping:
    def __init__(self, patience: int = 7, min_delta: float = 1e-4) -> None:
        self.patience   = patience
        self.min_delta  = min_delta
        self.counter    = 0
        self.best_score: Optional[float] = None
        self.triggered  = False

    def step(self, val_acc: float) -> bool:
        if self.best_score is None or val_acc > self.best_score + self.min_delta:
            self.best_score = val_acc
            self.counter    = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.triggered = True
        return self.triggered


# -- FIX 1: Sampler from training indices only --------------------------------
def make_weighted_sampler(
    full_dataset: ImageFolder,
    train_indices: list,
) -> WeightedRandomSampler:
    """
    Build sampler using ONLY the training subset indices.
    The original code iterated over the full dataset (indices 0-1188),
    but the DataLoader only sees training samples (indices 0-950),
    which caused an IndexError in DataLoader worker processes.
    """
    targets        = np.array([full_dataset.targets[i] for i in train_indices])
    class_counts   = np.bincount(targets)
    class_weights  = 1.0 / class_counts.astype(float)
    sample_weights = class_weights[targets]
    return WeightedRandomSampler(
        weights=torch.DoubleTensor(sample_weights),
        num_samples=len(sample_weights),
        replacement=True,
    )


# -- Model Factory ------------------------------------------------------------
def build_model(
    num_classes: int,
    pretrained_path: Optional[str] = None,
) -> nn.Module:
    net = models.efficientnet_b0(
        weights="IMAGENET1K_V1" if pretrained_path is None else None
    )
    net.classifier[1] = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(1280, num_classes),
    )
    if pretrained_path and os.path.exists(pretrained_path):
        ckpt  = torch.load(pretrained_path, map_location="cpu", weights_only=False)
        state = (
            ckpt["model_state"]
            if isinstance(ckpt, dict) and "model_state" in ckpt
            else ckpt
        )
        net.load_state_dict(state, strict=False)

    for param in net.parameters():
        param.requires_grad = True

    return net


# -- One Epoch ----------------------------------------------------------------
def run_epoch(
    model:     nn.Module,
    loader:    DataLoader,
    criterion: nn.Module,
    optimizer: Optional[torch.optim.Optimizer],
    scaler:    Optional[torch.cuda.amp.GradScaler],
    device:    torch.device,
    train:     bool  = True,
    grad_clip: float = 1.0,
) -> tuple:
    model.train() if train else model.eval()
    total_loss = correct = total = 0
    all_preds, all_labels = [], []

    ctx = torch.enable_grad() if train else torch.no_grad()
    with ctx:
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)

            if train:
                optimizer.zero_grad(set_to_none=True)

            with torch.amp.autocast("cuda", enabled=(scaler is not None)):
                outputs = model(images)
                loss    = criterion(outputs, labels)

            if train:
                if scaler:
                    scaler.scale(loss).backward()
                    scaler.unscale_(optimizer)
                    nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
                    scaler.step(optimizer)
                    scaler.update()
                else:
                    loss.backward()
                    nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
                    optimizer.step()

            preds       = outputs.argmax(dim=1)
            total_loss += loss.item() * labels.size(0)
            correct    += preds.eq(labels).sum().item()
            total      += labels.size(0)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    return (
        total_loss / total,
        100.0 * correct / total,
        np.array(all_preds),
        np.array(all_labels),
    )


# -- Main ---------------------------------------------------------------------
def main(args: argparse.Namespace) -> None:
    set_seed(args.seed)
    logger = setup_logger("soil_train")
    logger.info("=== AgriSense | Soil Model Training Started ===")

    device      = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    use_amp     = device.type == "cuda"
    pin_mem     = device.type == "cuda"   # FIX 3: pin_memory only useful on CUDA
    num_workers = 4 if device.type == "cuda" else 0   # FIX 3: 0 on Windows CPU
    logger.info(f"Device: {device} | AMP: {use_amp} | Workers: {num_workers}")

    # -- Transforms -----------------------------------------------------------
    train_transform = T.Compose([
        T.Resize((256, 256)),
        T.RandomCrop(224),
        T.RandomHorizontalFlip(),
        T.RandomVerticalFlip(),
        T.RandomRotation(30),
        T.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
        T.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
        T.ToTensor(),
        T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        T.RandomErasing(p=0.2),
    ])
    val_transform = T.Compose([
        T.Resize((224, 224)),
        T.ToTensor(),
        T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    # -- Dataset split --------------------------------------------------------
    full_dataset = ImageFolder(DATA_DIR)   # loaded WITHOUT transform (FIX 2)
    n_total      = len(full_dataset)
    n_train      = int(0.8 * n_total)
    n_val        = n_total - n_train

    generator = torch.Generator().manual_seed(args.seed)
    train_subset, val_subset = torch.utils.data.random_split(
        full_dataset, [n_train, n_val], generator=generator
    )

    train_set = TransformWrapper(train_subset, train_transform)   # FIX 2
    val_set   = TransformWrapper(val_subset,   val_transform)     # FIX 2

    sampler = (
        make_weighted_sampler(full_dataset, train_subset.indices)  # FIX 1
        if args.balanced else None
    )

    train_loader = DataLoader(
        train_set,
        batch_size=args.batch_size,
        sampler=sampler,
        shuffle=(sampler is None),
        num_workers=num_workers,
        pin_memory=pin_mem,
    )
    val_loader = DataLoader(
        val_set,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=pin_mem,
    )

    num_classes = len(full_dataset.classes)
    logger.info(
        f"Train: {n_train} | Val: {n_val} | "
        f"Classes ({num_classes}): {full_dataset.classes}"
    )

    # -- Model ----------------------------------------------------------------
    model = build_model(
        num_classes,
        pretrained_path=FINAL_PATH if args.resume else None,
    ).to(device)
    logger.info(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")

    # -- Loss -----------------------------------------------------------------
    if args.balanced:
        counts    = np.bincount(full_dataset.targets)
        cw        = torch.FloatTensor(1.0 / counts).to(device)
        criterion = nn.CrossEntropyLoss(weight=cw)
    else:
        criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

    optimizer = torch.optim.AdamW(
        model.parameters(), lr=args.lr, weight_decay=1e-4
    )
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=args.epochs, eta_min=1e-7
    )
    scaler     = torch.cuda.amp.GradScaler() if use_amp else None
    early_stop = EarlyStopping(patience=args.patience)
    best_val_acc = 0.0
    history      = []

    logger.info(
        f"Training for up to {args.epochs} epochs "
        f"(patience={args.patience}) ...\n"
    )

    # -- Training Loop --------------------------------------------------------
    for epoch in range(1, args.epochs + 1):
        tr_loss, tr_acc, _, _ = run_epoch(
            model, train_loader, criterion, optimizer, scaler, device, train=True
        )
        vl_loss, vl_acc, vl_preds, vl_labels = run_epoch(
            model, val_loader, criterion, None, None, device, train=False
        )
        scheduler.step()
        lr_now = scheduler.get_last_lr()[0]

        logger.info(
            f"Epoch {epoch:03d}/{args.epochs} | LR={lr_now:.2e} | "
            f"Train Loss={tr_loss:.4f} Acc={tr_acc:.1f}% | "
            f"Val Loss={vl_loss:.4f} Acc={vl_acc:.1f}%"
        )

        history.append({
            "epoch":      epoch,
            "lr":         lr_now,
            "train_loss": tr_loss,
            "train_acc":  tr_acc,
            "val_loss":   vl_loss,
            "val_acc":    vl_acc,
        })

        if vl_acc > best_val_acc:
            best_val_acc = vl_acc
            torch.save(
                {
                    "epoch":       epoch,
                    "model_state": model.state_dict(),
                    "optimizer":   optimizer.state_dict(),
                    "val_acc":     vl_acc,
                    "classes":     full_dataset.classes,
                },
                CKPT_PATH,
            )
            logger.info(
                f"  New best val acc: {best_val_acc:.2f}% -- checkpoint saved"
            )

        if early_stop.step(vl_acc):
            logger.info(
                f"Early stopping at epoch {epoch} "
                f"(no improvement for {args.patience} epochs)"
            )
            break

    # -- Load best, save final ------------------------------------------------
    best_ckpt = torch.load(CKPT_PATH, map_location=device, weights_only=False)
    model.load_state_dict(best_ckpt["model_state"])

    # FIX 4: save FULL dict, not bare state_dict — fixes Red->Grey mismatch
    torch.save(
        {
            "model_state": model.state_dict(),
            "classes":     full_dataset.classes,
            "val_acc":     best_val_acc,
        },
        FINAL_PATH,
    )
    logger.info(
        f"Final model saved -> {FINAL_PATH}  (best val acc: {best_val_acc:.2f}%)"
    )

    # -- Final evaluation -----------------------------------------------------
    _, final_acc, final_preds, final_labels = run_epoch(
        model, val_loader, criterion, None, None, device, train=False
    )
    report = classification_report(
        final_labels, final_preds,
        target_names=full_dataset.classes,
        output_dict=True,
    )
    cm = confusion_matrix(final_labels, final_preds).tolist()
    logger.info(
        "\n"
        + classification_report(
            final_labels, final_preds, target_names=full_dataset.classes
        )
    )

    metadata = {
        "trained_at":            datetime.utcnow().isoformat(),
        "model":                 "EfficientNet-B0",
        "num_classes":           num_classes,
        "classes":               full_dataset.classes,
        "epochs_run":            len(history),
        "best_val_acc":          round(best_val_acc, 4),
        "final_val_acc":         round(final_acc, 4),
        "training_history":      history,
        "classification_report": report,
        "confusion_matrix":      cm,
    }
    report_path = os.path.join(REPORTS_DIR, "soil_model_report.json")
    with open(report_path, "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Report saved -> {report_path}")
    logger.info("=== Training Complete ===")


# -- Entry point --------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="AgriSense | Soil Classification Trainer"
    )
    parser.add_argument("--epochs",     type=int,   default=50)
    parser.add_argument("--batch_size", type=int,   default=32)
    parser.add_argument("--lr",         type=float, default=1e-4)
    parser.add_argument("--patience",   type=int,   default=10)
    parser.add_argument("--seed",       type=int,   default=42)
    parser.add_argument("--resume",     action="store_true")
    parser.add_argument("--balanced",   action="store_true")
    main(parser.parse_args())