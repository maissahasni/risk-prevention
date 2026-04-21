from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/machines", tags=["machines"])

# Configuration DB
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'heart_monitor'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_general_ci'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Erreur de connexion: {e}")
        raise HTTPException(status_code=500, detail="Erreur de connexion à la base de données")

# Modèles Pydantic
class MachineStatus(BaseModel):
    machine_id: str
    machine_name: str
    machine_type: str
    line: str
    status: str
    worker_name: Optional[str]
    temperature_C: Optional[float]
    vibration_mm_s: Optional[float]
    pressure_bar: Optional[float]
    current_A: Optional[float]
    humidity_pct: Optional[float]
    ppe_violation: Optional[int]
    intrusion_alert: Optional[int]
    smoke_alert: Optional[int]
    detected_persons: Optional[int]
    future_anomaly_6h: Optional[int]
    risk_probability: Optional[float]
    accident_risk_proba: Optional[float]
    machine_failure_risk: Optional[float]
    worker_safety_risk: Optional[float]
    alert_level: str
    prediction_time: Optional[datetime]
    sensor_timestamp: Optional[datetime]

class MachinePrediction(BaseModel):
    machine_id: str
    worker_name: Optional[str]
    future_anomaly_6h: int
    risk_probability: float
    pred_future_anomaly_6h: int
    accident_risk_proba: float
    machine_failure_risk: float
    worker_safety_risk: float
    model_version: str
    confidence_score: float

class SensorData(BaseModel):
    machine_id: str
    worker_name: Optional[str]
    camera_id: Optional[str]
    detected_persons: int = 0
    ppe_violation: int = 0
    intrusion_alert: int = 0
    smoke_alert: int = 0
    temperature_C: float
    vibration_mm_s: float
    pressure_bar: float
    current_A: float
    humidity_pct: float

# Endpoints

@router.get("/status", response_model=List[MachineStatus])
async def get_all_machines_status():
    """Obtenir l'état complet de toutes les machines avec prédictions"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM machine_complete_status ORDER BY alert_level DESC, machine_id"
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/status/{machine_id}", response_model=MachineStatus)
async def get_machine_status(machine_id: str):
    """Obtenir l'état d'une machine spécifique"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM machine_complete_status WHERE machine_id = %s"
        cursor.execute(query, (machine_id,))
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Machine {machine_id} non trouvée")
        
        return result
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/critical")
async def get_critical_machines():
    """Obtenir les machines en état critique"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT * FROM machine_complete_status 
            WHERE alert_level = 'critical' 
            ORDER BY accident_risk_proba DESC
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return {
            "count": len(results),
            "machines": results
        }
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/predictions")
async def get_latest_predictions():
    """Obtenir les dernières prédictions pour toutes les machines"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM latest_machine_predictions ORDER BY accident_risk_proba DESC"
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.post("/sensor-data")
async def add_sensor_data(data: SensorData):
    """Ajouter des données de capteurs pour une machine"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
            INSERT INTO machine_sensor_data 
            (machine_id, worker_name, camera_id, detected_persons, ppe_violation, 
             intrusion_alert, smoke_alert, temperature_C, vibration_mm_s, 
             pressure_bar, current_A, humidity_pct)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            data.machine_id, data.worker_name, data.camera_id, data.detected_persons,
            data.ppe_violation, data.intrusion_alert, data.smoke_alert,
            data.temperature_C, data.vibration_mm_s, data.pressure_bar,
            data.current_A, data.humidity_pct
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        sensor_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return {
            "status": "success",
            "message": "Données capteur enregistrées",
            "id": sensor_id,
            "machine_id": data.machine_id
        }
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.post("/predictions")
async def add_prediction(prediction: MachinePrediction):
    """Ajouter une prédiction pour une machine"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
            INSERT INTO machine_predictions 
            (machine_id, worker_name, future_anomaly_6h, risk_probability,
             pred_future_anomaly_6h, accident_risk_proba, machine_failure_risk,
             worker_safety_risk, model_version, confidence_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            prediction.machine_id, prediction.worker_name, prediction.future_anomaly_6h,
            prediction.risk_probability, prediction.pred_future_anomaly_6h,
            prediction.accident_risk_proba, prediction.machine_failure_risk,
            prediction.worker_safety_risk, prediction.model_version,
            prediction.confidence_score
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        prediction_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return {
            "status": "success",
            "message": "Prédiction enregistrée",
            "id": prediction_id,
            "machine_id": prediction.machine_id
        }
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/current-state")
async def get_machines_current_state():
    """Obtenir l'état actuel de toutes les machines (sans prédictions)"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                m.machine_id,
                m.machine_name,
                m.machine_type,
                m.line,
                m.status,
                msd.worker_name,
                msd.camera_id,
                msd.detected_persons,
                msd.ppe_violation,
                msd.intrusion_alert,
                msd.smoke_alert,
                msd.temperature_C,
                msd.vibration_mm_s,
                msd.pressure_bar,
                msd.current_A,
                msd.humidity_pct,
                msd.timestamp as last_reading
            FROM machines m
            LEFT JOIN (
                SELECT msd1.* FROM machine_sensor_data msd1
                INNER JOIN (
                    SELECT machine_id, MAX(timestamp) as max_time
                    FROM machine_sensor_data
                    GROUP BY machine_id
                ) msd2 ON msd1.machine_id = msd2.machine_id AND msd1.timestamp = msd2.max_time
            ) msd ON m.machine_id = msd.machine_id
            WHERE m.status = 'active'
            ORDER BY m.machine_id
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/statistics")
async def get_statistics():
    """Obtenir des statistiques globales sur les machines"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                COUNT(DISTINCT m.machine_id) as total_machines,
                SUM(CASE 
                    WHEN mp.accident_risk_proba > 0.8 OR mp.pred_future_anomaly_6h = 1 
                    THEN 1 ELSE 0 
                END) as critical_count,
                SUM(CASE 
                    WHEN (mp.risk_probability > 0.7 OR mp.accident_risk_proba > 0.6) 
                    AND NOT (mp.accident_risk_proba > 0.8 OR mp.pred_future_anomaly_6h = 1)
                    THEN 1 ELSE 0 
                END) as warning_count,
                SUM(CASE 
                    WHEN NOT (mp.accident_risk_proba > 0.8 OR mp.pred_future_anomaly_6h = 1)
                    AND NOT (mp.risk_probability > 0.7 OR mp.accident_risk_proba > 0.6)
                    THEN 1 ELSE 0 
                END) as normal_count,
                AVG(mp.risk_probability) as avg_risk,
                AVG(mp.accident_risk_proba) as avg_accident_risk,
                MAX(mp.accident_risk_proba) as max_accident_risk
            FROM machines m
            LEFT JOIN (
                SELECT mp1.* FROM machine_predictions mp1
                INNER JOIN (
                    SELECT machine_id, MAX(prediction_time) as max_time
                    FROM machine_predictions
                    GROUP BY machine_id
                ) mp2 ON mp1.machine_id = mp2.machine_id AND mp1.prediction_time = mp2.max_time
            ) mp ON m.machine_id = mp.machine_id
        """
        
        cursor.execute(query)
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return result
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")
