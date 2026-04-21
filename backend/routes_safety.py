from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from datetime import datetime
import time
from typing import Dict, Any
import io
from PIL import Image

router = APIRouter(prefix="/api/safety", tags=["safety"])

# Configuration pour la détection
# En production, vous pouvez utiliser un modèle YOLO entraîné pour détecter casques et gilets
# Pour cette démo, nous utilisons un détecteur de couleurs simple
class SafetyDetector:
    def __init__(self):
        # Initialisation du détecteur de visages pour détecter la présence humaine
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    def detect_skin(self, image: np.ndarray) -> np.ndarray:
        """Détecte les régions de peau dans l'image pour les exclure de la détection"""
        # Conversion en HSV et YCrCb pour une meilleure détection de la peau
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
        
        # Plages HSV pour la peau (plusieurs tons de peau)
        lower_hsv = np.array([0, 10, 0], dtype=np.uint8)
        upper_hsv = np.array([25, 170, 255], dtype=np.uint8)
        mask_hsv = cv2.inRange(hsv, lower_hsv, upper_hsv)
        
        # Plages YCrCb pour la peau
        lower_ycrcb = np.array([0, 135, 85], dtype=np.uint8)
        upper_ycrcb = np.array([255, 180, 135], dtype=np.uint8)
        mask_ycrcb = cv2.inRange(ycrcb, lower_ycrcb, upper_ycrcb)
        
        # Combiner les deux masques
        skin_mask = cv2.bitwise_and(mask_hsv, mask_ycrcb)
        
        # Dilater modérément pour inclure les cheveux proches du visage
        kernel = np.ones((10, 10), np.uint8)
        skin_mask = cv2.dilate(skin_mask, kernel, iterations=2)
        
        return skin_mask
        
    def detect_helmet(self, image: np.ndarray) -> tuple:
        """
        Détecte un casque basé sur la couleur dans la partie supérieure de l'image
        Recherche des couleurs typiques des casques (jaune, orange, blanc, rouge)
        Équilibré pour éviter les faux positifs tout en détectant les vrais casques
        """
        height, width = image.shape[:2]
        
        # Zone de recherche du casque (tiers supérieur de l'image)
        helmet_zone = image[0:height//3, :]
        
        # Détecter les régions de peau/cheveux à exclure
        skin_mask = self.detect_skin(helmet_zone)
        
        # Conversion en HSV pour la détection de couleur
        hsv = cv2.cvtColor(helmet_zone, cv2.COLOR_BGR2HSV)
        
        # Plages de couleurs pour les casques (équilibrées)
        color_ranges = [
            # Jaune (casque de chantier) - élargi
            ([20, 80, 120], [35, 255, 255]),
            # Orange (casque de chantier) - élargi
            ([8, 100, 120], [20, 255, 255]),
            # Blanc brillant (casque blanc)
            ([0, 0, 200], [180, 30, 255]),
            # Rouge (casque rouge)
            ([0, 100, 120], [10, 255, 255]),
            ([170, 100, 120], [180, 255, 255]),
            # Bleu (casque bleu)
            ([95, 80, 120], [135, 255, 255]),
        ]
        
        max_percentage = 0
        best_mask = None
        
        for lower, upper in color_ranges:
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            
            # Exclure les régions de peau/cheveux
            mask = cv2.bitwise_and(mask, cv2.bitwise_not(skin_mask))
            
            # Appliquer un filtre morphologique
            kernel = np.ones((3, 3), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            percentage = (cv2.countNonZero(mask) / mask.size) * 100
            if percentage > max_percentage:
                max_percentage = percentage
                best_mask = mask
        
        # Vérifier la forme et la taille des régions détectées
        detected = False
        confidence = 0.0
        
        if max_percentage > 5.0 and best_mask is not None:  # Seuil réduit mais raisonnable
            # Trouver les contours pour vérifier la forme
            contours, _ = cv2.findContours(best_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Prendre le plus grand contour
                largest_contour = max(contours, key=cv2.contourArea)
                area = cv2.contourArea(largest_contour)
                
                # Un casque doit avoir une taille minimale
                min_area = (helmet_zone.shape[0] * helmet_zone.shape[1]) * 0.03
                
                if area > min_area:
                    # Vérifier le ratio largeur/hauteur (un casque est plutôt large)
                    x, y, w, h = cv2.boundingRect(largest_contour)
                    aspect_ratio = w / float(h) if h > 0 else 0
                    
                    # Un casque a généralement un aspect ratio entre 0.7 et 3.0
                    if 0.7 <= aspect_ratio <= 3.5:
                        detected = True
                        confidence = min(max_percentage / 12.0, 1.0)
        
        return detected, confidence
    
    def detect_safety_vest(self, image: np.ndarray) -> tuple:
        """
        Détecte un gilet de sécurité basé sur la couleur dans la partie centrale de l'image
        Recherche des couleurs typiques des gilets (jaune fluo, orange fluo)
        Équilibré pour une bonne détection
        """
        height, width = image.shape[:2]
        
        # Zone de recherche du gilet (partie centrale pour le torse)
        vest_zone = image[height//4:3*height//4, :]
        
        # Conversion en HSV
        hsv = cv2.cvtColor(vest_zone, cv2.COLOR_BGR2HSV)
        
        # Plages de couleurs pour les gilets haute visibilité (équilibrées)
        color_ranges = [
            # Jaune fluo/vif - élargi pour meilleure détection
            ([20, 100, 140], [40, 255, 255]),
            # Orange fluo/vif - élargi
            ([5, 120, 140], [20, 255, 255]),
            # Vert fluo (gilets verts)
            ([35, 100, 140], [85, 255, 255]),
        ]
        
        max_percentage = 0
        best_mask = None
        
        for lower, upper in color_ranges:
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            
            # Appliquer un filtre morphologique
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            percentage = (cv2.countNonZero(mask) / mask.size) * 100
            if percentage > max_percentage:
                max_percentage = percentage
                best_mask = mask
        
        # Vérifier la présence et la forme
        detected = False
        confidence = 0.0
        
        if max_percentage > 4.0 and best_mask is not None:  # Seuil réduit
            # Trouver les contours
            contours, _ = cv2.findContours(best_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Prendre le plus grand contour
                largest_contour = max(contours, key=cv2.contourArea)
                area = cv2.contourArea(largest_contour)
                
                # Un gilet doit avoir une taille minimale raisonnable
                min_area = (vest_zone.shape[0] * vest_zone.shape[1]) * 0.04
                
                if area > min_area:
                    detected = True
                    confidence = min(max_percentage / 15.0, 1.0)
        
        return detected, confidence
    
    def detect_person(self, image: np.ndarray) -> int:
        """Détecte le nombre de personnes dans l'image"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        return len(faces)
    
    def analyze_image(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyse complète de l'image pour la détection de sécurité"""
        start_time = time.time()
        
        # Détection du casque
        helmet_detected, helmet_confidence = self.detect_helmet(image)
        
        # Détection du gilet
        vest_detected, vest_confidence = self.detect_safety_vest(image)
        
        # Détection de personnes
        person_count = self.detect_person(image)
        
        processing_time = time.time() - start_time
        
        return {
            "helmet_detected": helmet_detected,
            "helmet_confidence": float(helmet_confidence),
            "vest_detected": vest_detected,
            "vest_confidence": float(vest_confidence),
            "person_count": person_count,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat(),
            "status": "safe" if (helmet_detected and vest_detected) else "unsafe"
        }

# Instance globale du détecteur
detector = SafetyDetector()

@router.post("/detect")
async def detect_safety_equipment(image: UploadFile = File(...)):
    """
    Endpoint pour détecter les équipements de sécurité dans une image
    
    Args:
        image: Image uploadée depuis la caméra
        
    Returns:
        Résultats de la détection avec les informations sur le casque et le gilet
    """
    try:
        # Lire l'image
        contents = await image.read()
        
        # Convertir en format OpenCV
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Image invalide")
        
        # Analyser l'image
        results = detector.analyze_image(img)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la détection: {str(e)}")

@router.get("/status")
async def get_detector_status():
    """Vérifier le statut du détecteur"""
    return {
        "status": "online",
        "detector": "Safety Equipment Detector",
        "capabilities": ["helmet_detection", "vest_detection", "person_detection"],
        "timestamp": datetime.now().isoformat()
    }
