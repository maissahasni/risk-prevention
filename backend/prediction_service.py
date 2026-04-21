import numpy as np
import pandas as pd
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from datetime import datetime
import time
import joblib
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

# Configuration DB
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'heart_monitor'),
    'port': int(os.getenv('DB_PORT', 3306))
}

class PredictionService:
    def __init__(self, model_path="preventec_model.pkl"):
        """Initialiser le service de prédiction"""
        self.model = None
        self.model_version = "preventec_v1.0"
        self.feature_columns = [
            'detected_persons', 'ppe_violation', 'intrusion_alert', 'smoke_alert',
            'temperature_C', 'vibration_mm_s', 'pressure_bar', 'current_A', 'humidity_pct'
        ]
        self.categorical_columns = ['machine_type', 'line', 'worker', 'camera_id']
        
        if model_path and os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                logger.info(f"✓ Modèle PrevenTec ML chargé depuis {model_path}")
            except Exception as e:
                logger.warning(f"⚠ Impossible de charger le modèle: {e}")
                logger.info("→ Utilisation du modèle basé sur des règles")
        else:
            logger.info("→ Utilisation du modèle basé sur des règles")
    
    def get_db_connection(self):
        """Créer une connexion à la base de données"""
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            return connection
        except Error as e:
            logger.error(f"Erreur de connexion DB: {e}")
            return None
    
    def get_latest_sensor_data(self):
        """Récupérer les dernières données de capteurs pour chaque machine"""
        try:
            connection = self.get_db_connection()
            if not connection:
                return None
            
            cursor = connection.cursor(dictionary=True)
            
            query = """
                SELECT 
                    msd.*,
                    m.machine_name,
                    m.machine_type,
                    m.line,
                    m.status
                FROM machine_sensor_data msd
                INNER JOIN machines m ON msd.machine_id = m.machine_id
                WHERE msd.id IN (
                    SELECT MAX(id)
                    FROM machine_sensor_data
                    GROUP BY machine_id
                )
                AND m.status != 'Maintenance'
                ORDER BY msd.machine_id
            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            
            cursor.close()
            connection.close()
            
            logger.info(f"✓ {len(results)} machines avec données capteurs")
            return results
            
        except Error as e:
            logger.error(f"Erreur récupération données: {e}")
            return None
    
    def rule_based_prediction(self, sensor_data):
        """
        Prédiction basée sur des règles si pas de modèle ML
        Analyse les seuils critiques pour chaque paramètre
        """
        # Seuils critiques
        critical_thresholds = {
            'temperature_C': 85,
            'vibration_mm_s': 7,
            'pressure_bar': 12,
            'current_A': 32,
            'humidity_pct': 85
        }
        
        warning_thresholds = {
            'temperature_C': 75,
            'vibration_mm_s': 5,
            'pressure_bar': 10,
            'current_A': 28,
            'humidity_pct': 75
        }
        
        # Compter les violations
        critical_violations = 0
        warning_violations = 0
        
        for param, critical_val in critical_thresholds.items():
            if sensor_data.get(param, 0) >= critical_val:
                critical_violations += 1
            elif sensor_data.get(param, 0) >= warning_thresholds[param]:
                warning_violations += 1
        
        # Risques liés à la sécurité
        safety_risk = 0.0
        if sensor_data.get('ppe_violation', 0) == 1:
            safety_risk += 0.3
        if sensor_data.get('intrusion_alert', 0) == 1:
            safety_risk += 0.25
        if sensor_data.get('smoke_alert', 0) == 1:
            safety_risk += 0.4
        if sensor_data.get('detected_persons', 0) > 2:
            safety_risk += 0.15
        
        # Risque de panne machine (basé sur capteurs)
        machine_risk = (critical_violations * 0.25 + warning_violations * 0.1)
        
        # Risque total
        total_risk = min(machine_risk + safety_risk, 1.0)
        
        # Prédiction binaire (anomalie dans 6h)
        pred_anomaly = 1 if total_risk >= 0.5 else 0
        
        # Probabilité d'accident
        accident_proba = min(total_risk * 1.2, 1.0)
        
        # Confiance du modèle
        confidence = 0.75 if critical_violations > 0 or sensor_data.get('smoke_alert') == 1 else 0.65
        
        return {
            'pred_future_anomaly_6h': pred_anomaly,
            'risk_probability': round(total_risk, 4),
            'accident_risk_proba': round(accident_proba, 4),
            'machine_failure_risk': round(machine_risk, 4),
            'worker_safety_risk': round(safety_risk, 4),
            'confidence_score': round(confidence, 4)
        }
    
    def ml_prediction(self, sensor_data):
        """Prédiction avec modèle ML PrevenTec (si disponible)"""
        try:
            # Récupérer les données machine pour compléter les features
            connection = self.get_db_connection()
            if not connection:
                return self.rule_based_prediction(sensor_data)
            
            cursor = connection.cursor(dictionary=True)
            query = "SELECT * FROM machines WHERE machine_id = %s"
            cursor.execute(query, (sensor_data['machine_id'],))
            machine_info = cursor.fetchone()
            cursor.close()
            connection.close()
            
            if not machine_info:
                return self.rule_based_prediction(sensor_data)
            
            # Créer un DataFrame avec toutes les features requises par le modèle
            data = {
                'detected_persons': sensor_data.get('detected_persons', 0),
                'ppe_violation': sensor_data.get('ppe_violation', 0),
                'intrusion_alert': sensor_data.get('intrusion_alert', 0),
                'smoke_alert': sensor_data.get('smoke_alert', 0),
                'temperature_C': sensor_data.get('temperature_C', 0),
                'vibration_mm_s': sensor_data.get('vibration_mm_s', 0),
                'pressure_bar': sensor_data.get('pressure_bar', 0),
                'current_A': sensor_data.get('current_A', 0),
                'humidity_pct': sensor_data.get('humidity_pct', 0),
                'machine_type': machine_info.get('machine_type', 'Type_A'),
                'line': machine_info.get('line', 'Line_1'),
                'worker': sensor_data.get('worker_name', 'Worker_1'),
                'camera_id': sensor_data.get('camera_id', 'Cam_1')
            }
            
            df = pd.DataFrame([data])
            
            # Prédiction avec le modèle PrevenTec
            pred = self.model.predict(df)[0]
            proba = self.model.predict_proba(df)[0]
            
            # Calculer les risques spécifiques
            base_risk = proba[1]
            
            # Ajuster selon les alertes de sécurité
            safety_multiplier = 1.0
            if sensor_data.get('smoke_alert') == 1:
                safety_multiplier = 1.5
            elif sensor_data.get('ppe_violation') == 1:
                safety_multiplier = 1.3
            elif sensor_data.get('intrusion_alert') == 1:
                safety_multiplier = 1.2
            
            return {
                'pred_future_anomaly_6h': int(pred),
                'risk_probability': round(base_risk, 4),
                'accident_risk_proba': round(min(base_risk * safety_multiplier, 1.0), 4),
                'machine_failure_risk': round(base_risk * 0.9, 4),
                'worker_safety_risk': round(base_risk * safety_multiplier * 0.7, 4),
                'confidence_score': round(max(proba), 4)
            }
            
        except Exception as e:
            logger.warning(f"Erreur ML ({str(e)}), utilisation règles")
            return self.rule_based_prediction(sensor_data)
    
    def predict(self, sensor_data):
        """Faire une prédiction (ML ou règles)"""
        if self.model:
            return self.ml_prediction(sensor_data)
        else:
            return self.rule_based_prediction(sensor_data)
    
    def save_prediction(self, machine_id, worker_name, sensor_data, prediction):
        """Sauvegarder la prédiction dans la BD"""
        try:
            connection = self.get_db_connection()
            if not connection:
                return False
            
            cursor = connection.cursor()
            
            query = """
                INSERT INTO machine_predictions 
                (machine_id, worker_name, future_anomaly_6h, risk_probability,
                 pred_future_anomaly_6h, accident_risk_proba, machine_failure_risk,
                 worker_safety_risk, model_version, confidence_score)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                str(machine_id),
                str(worker_name) if worker_name else None,
                int(sensor_data.get('future_anomaly_6h', 0)),  # État actuel
                float(prediction['risk_probability']),
                int(prediction['pred_future_anomaly_6h']),  # Prédiction
                float(prediction['accident_risk_proba']),
                float(prediction['machine_failure_risk']),
                float(prediction['worker_safety_risk']),
                str(self.model_version),
                float(prediction['confidence_score'])
            )
            
            cursor.execute(query, values)
            connection.commit()
            
            cursor.close()
            connection.close()
            
            return True
            
        except Error as e:
            logger.error(f"Erreur sauvegarde prédiction: {e}")
            return False
    
    def run_predictions(self):
        """Exécuter les prédictions pour toutes les machines"""
        logger.info("=== Démarrage prédictions ===")
        
        # Récupérer données capteurs
        sensors_data = self.get_latest_sensor_data()
        
        if not sensors_data:
            logger.warning("Aucune donnée capteur disponible")
            return
        
        success_count = 0
        error_count = 0
        
        for data in sensors_data:
            try:
                machine_id = data['machine_id']
                worker_name = data.get('worker_name')
                
                # Faire la prédiction
                prediction = self.predict(data)
                
                # Sauvegarder
                if self.save_prediction(machine_id, worker_name, data, prediction):
                    success_count += 1
                    alert = "🔴" if prediction['pred_future_anomaly_6h'] == 1 else "🟢"
                    logger.info(f"{alert} {machine_id}: Risque={prediction['risk_probability']:.2%}")
                else:
                    error_count += 1
                    
            except Exception as e:
                logger.error(f"Erreur machine {data.get('machine_id')}: {e}")
                error_count += 1
        
        logger.info(f"✓ Prédictions: {success_count} succès, {error_count} erreurs")
    
    def run_continuously(self, interval_minutes=10):
        """Exécuter les prédictions en continu"""
        logger.info(f"🚀 Service de prédiction démarré (intervalle: {interval_minutes} min)")
        
        while True:
            try:
                self.run_predictions()
                logger.info(f"⏳ Prochaine exécution dans {interval_minutes} minutes...")
                time.sleep(interval_minutes * 60)
                
            except KeyboardInterrupt:
                logger.info("🛑 Arrêt du service")
                break
            except Exception as e:
                logger.error(f"Erreur critique: {e}")
                logger.info("⏳ Nouvelle tentative dans 1 minute...")
                time.sleep(60)


if __name__ == "__main__":
    # Créer le service
    service = PredictionService()
    
    # Option 1: Exécution unique
    # service.run_predictions()
    
    # Option 2: Exécution continue (toutes les 10 minutes)
    service.run_continuously(interval_minutes=10)
