from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from datetime import datetime
import time
from typing import Dict, Any
import io
from pathlib import Path
from ultralytics import YOLO

router = APIRouter(prefix="/api/equipment", tags=["equipment"])

# Charger le modèle YOLO entraîné
MODEL_PATH = Path(__file__).parent.parent / "worker_safety_model" / "ppe_project" / "ppe_yolov8s_run" / "weights" / "best.pt"

class YOLODetector:
    def __init__(self):
        try:
            self.model = YOLO(str(MODEL_PATH))
            print(f"✓ Modèle YOLO chargé depuis: {MODEL_PATH}")
            print(f"✓ Classes disponibles: {self.model.names}")
        except Exception as e:
            print(f"⚠ Erreur lors du chargement du modèle YOLO: {e}")
            self.model = None
    
    def detect_equipment(self, image: np.ndarray, conf_threshold: float = 0.25) -> Dict[str, Any]:
        """
        Détecte les équipements de sécurité avec YOLO
        
        Args:
            image: Image numpy array
            conf_threshold: Seuil de confiance minimum
            
        Returns:
            Dict contenant les résultats de détection
        """
        if self.model is None:
            raise Exception("Modèle YOLO non chargé")
        
        start_time = time.time()
        
        # Effectuer la détection
        results = self.model(image, conf=conf_threshold, verbose=False)
        
        inference_time = time.time() - start_time
        
        # Analyser les résultats
        helmet_detected = False
        vest_detected = False
        helmet_confidence = 0.0
        vest_confidence = 0.0
        helmet_count = 0
        vest_count = 0
        total_detections = 0
        
        # Parcourir les détections
        for result in results:
            boxes = result.boxes
            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = self.model.names[cls].lower()
                    
                    total_detections += 1
                    
                    # Vérifier si c'est un casque (helmet, hardhat, etc.)
                    if any(keyword in class_name for keyword in ['helmet', 'hardhat', 'hard-hat', 'hard_hat']):
                        helmet_detected = True
                        helmet_count += 1
                        helmet_confidence = max(helmet_confidence, conf)
                    
                    # Vérifier si c'est un gilet (vest, jacket, safety vest, etc.)
                    elif any(keyword in class_name for keyword in ['vest', 'jacket', 'safety-vest', 'safety_vest']):
                        vest_detected = True
                        vest_count += 1
                        vest_confidence = max(vest_confidence, conf)
        
        processing_time = time.time() - start_time
        
        return {
            "helmet_detected": helmet_detected,
            "helmet_confidence": helmet_confidence,
            "helmet_count": helmet_count,
            "vest_detected": vest_detected,
            "vest_confidence": vest_confidence,
            "vest_count": vest_count,
            "total_detections": total_detections,
            "processing_time": processing_time,
            "inference_time": inference_time,
            "timestamp": datetime.now().isoformat(),
            "status": "safe" if (helmet_detected and vest_detected) else "unsafe",
            "model": "YOLOv8s (Trained)"
        }
    
    def detect_equipment_with_image(self, image: np.ndarray, conf_threshold: float = 0.25) -> tuple:
        """
        Détecte les équipements et retourne l'image annotée avec les bounding boxes
        
        Args:
            image: Image numpy array
            conf_threshold: Seuil de confiance minimum
            
        Returns:
            Tuple (dict résultats, image annotée)
        """
        if self.model is None:
            raise Exception("Modèle YOLO non chargé")
        
        start_time = time.time()
        
        # Effectuer la détection
        results = self.model(image, conf=conf_threshold, verbose=False)
        
        inference_time = time.time() - start_time
        
        # Créer une copie de l'image pour l'annotation
        annotated_image = image.copy()
        
        # Analyser les résultats
        helmet_detected = False
        vest_detected = False
        helmet_confidence = 0.0
        vest_confidence = 0.0
        helmet_count = 0
        vest_count = 0
        total_detections = 0
        
        # Parcourir les détections et dessiner les bounding boxes
        for result in results:
            boxes = result.boxes
            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = self.model.names[cls]
                    
                    # Obtenir les coordonnées du bounding box
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    
                    total_detections += 1
                    
                    # Définir la couleur selon le type d'équipement
                    color = (0, 255, 0)  # Vert par défaut
                    class_lower = class_name.lower()
                    
                    # Vérifier si c'est un casque
                    if any(keyword in class_lower for keyword in ['helmet', 'hardhat', 'hard-hat', 'hard_hat']):
                        helmet_detected = True
                        helmet_count += 1
                        helmet_confidence = max(helmet_confidence, conf)
                        color = (0, 255, 255)  # Cyan pour casque
                    
                    # Vérifier si c'est un gilet
                    elif any(keyword in class_lower for keyword in ['vest', 'jacket', 'safety-vest', 'safety_vest']):
                        vest_detected = True
                        vest_count += 1
                        vest_confidence = max(vest_confidence, conf)
                        color = (255, 255, 0)  # Jaune pour gilet
                    
                    # Vérifier si c'est une absence d'équipement (NO-...)
                    elif 'no-' in class_lower or 'no ' in class_lower:
                        color = (0, 0, 255)  # Rouge pour absence
                    
                    # Dessiner le bounding box
                    cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
                    
                    # Préparer le texte
                    label = f"{class_name} {conf:.2f}"
                    
                    # Calculer la taille du texte pour le fond
                    (text_width, text_height), baseline = cv2.getTextSize(
                        label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
                    )
                    
                    # Dessiner le fond du texte
                    cv2.rectangle(
                        annotated_image,
                        (x1, y1 - text_height - baseline - 5),
                        (x1 + text_width, y1),
                        color,
                        -1
                    )
                    
                    # Dessiner le texte
                    cv2.putText(
                        annotated_image,
                        label,
                        (x1, y1 - baseline - 5),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 0, 0),
                        2
                    )
        
        processing_time = time.time() - start_time
        
        results_dict = {
            "helmet_detected": helmet_detected,
            "helmet_confidence": helmet_confidence,
            "helmet_count": helmet_count,
            "vest_detected": vest_detected,
            "vest_confidence": vest_confidence,
            "vest_count": vest_count,
            "total_detections": total_detections,
            "processing_time": processing_time,
            "inference_time": inference_time,
            "timestamp": datetime.now().isoformat(),
            "status": "safe" if (helmet_detected and vest_detected) else "unsafe",
            "model": "YOLOv8s (Trained)"
        }
        
        return results_dict, annotated_image

# Instance globale du détecteur YOLO
try:
    yolo_detector = YOLODetector()
except Exception as e:
    print(f"⚠ Erreur lors de l'initialisation du détecteur YOLO: {e}")
    yolo_detector = None

@router.post("/detect-yolo")
async def detect_equipment_yolo(image: UploadFile = File(...)):
    """
    Endpoint pour détecter les équipements de sécurité avec le modèle YOLO entraîné
    
    Args:
        image: Image uploadée depuis la caméra
        
    Returns:
        Résultats de la détection YOLO avec informations détaillées + image annotée
    """
    if yolo_detector is None or yolo_detector.model is None:
        raise HTTPException(
            status_code=503, 
            detail="YOLO model not available. Please check model path and installation."
        )
    
    try:
        # Lire l'image
        contents = await image.read()
        
        # Convertir en format OpenCV
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image")
        
        # Détecter avec YOLO et obtenir l'image annotée
        results, annotated_image = yolo_detector.detect_equipment_with_image(img, conf_threshold=0.25)
        
        # Convertir l'image annotée en base64
        import base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Ajouter l'image au résultat
        results['annotated_image'] = f"data:image/jpeg;base64,{img_base64}"
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {str(e)}")

@router.get("/model-info")
async def get_model_info():
    """Obtenir les informations sur le modèle YOLO"""
    if yolo_detector is None or yolo_detector.model is None:
        return {
            "status": "unavailable",
            "message": "YOLO model not loaded",
            "model_path": str(MODEL_PATH)
        }
    
    return {
        "status": "available",
        "model": "YOLOv8s",
        "model_path": str(MODEL_PATH),
        "classes": yolo_detector.model.names,
        "task": "object detection",
        "trained_for": "PPE (Personal Protective Equipment) detection",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/status")
async def get_detector_status():
    """Vérifier le statut du détecteur YOLO"""
    return {
        "status": "online" if (yolo_detector and yolo_detector.model) else "offline",
        "detector": "YOLO Equipment Detector",
        "model": "YOLOv8s (Trained)",
        "capabilities": ["helmet_detection", "vest_detection", "real_time_detection"],
        "model_loaded": yolo_detector is not None and yolo_detector.model is not None,
        "timestamp": datetime.now().isoformat()
    }
