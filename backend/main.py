from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import Error
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = FastAPI(title="Heart Monitor API", version="1.0.0")

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origines autorisées
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration de la base de données
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'heart_monitor'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_general_ci'
}

# Modèles Pydantic
class HeartData(BaseModel):
    id: int
    bpm_average: int
    bpm_instant: float
    timestamp: datetime
    worker_name: Optional[str]

class WorkerStats(BaseModel):
    worker_name: str
    total_readings: int
    avg_bpm: float
    min_bpm: int
    max_bpm: int
    status: str
    last_update: datetime

class WorkerHeartRate(BaseModel):
    worker_name: str
    current_bpm: int
    status: str
    readings_count: int

# Fonction pour obtenir la connexion à la base de données
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Erreur de connexion à MySQL: {e}")
        raise HTTPException(status_code=500, detail="Erreur de connexion à la base de données")

@app.get("/")
def read_root():
    return {
        "message": "Heart Monitor API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "workers_stats": "/api/workers/stats",
            "worker_history": "/api/workers/{worker_name}/history",
            "latest_readings": "/api/heart-data/latest",
            "all_workers": "/api/workers"
        }
    }

@app.get("/health")
def health_check():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/workers/stats", response_model=List[WorkerStats])
def get_workers_stats():
    """Obtenir les statistiques de tous les workers"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                worker_name,
                COUNT(*) as total_readings,
                ROUND(AVG(bpm_average), 2) as avg_bpm,
                MIN(bpm_average) as min_bpm,
                MAX(bpm_average) as max_bpm,
                CASE 
                    WHEN AVG(bpm_average) > 110 THEN 'critical'
                    WHEN AVG(bpm_average) > 95 THEN 'warning'
                    ELSE 'normal'
                END as status,
                MAX(timestamp) as last_update
            FROM heart_data 
            WHERE worker_name IS NOT NULL
            GROUP BY worker_name
            ORDER BY avg_bpm DESC
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")

@app.get("/api/workers/{worker_name}/history", response_model=List[HeartData])
def get_worker_history(worker_name: str, limit: int = 50):
    """Obtenir l'historique des pulsations d'un worker spécifique"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT id, bpm_average, bpm_instant, timestamp, worker_name
            FROM heart_data 
            WHERE worker_name = %s
            ORDER BY timestamp DESC
            LIMIT %s
        """
        
        cursor.execute(query, (worker_name, limit))
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
        if not results:
            raise HTTPException(status_code=404, detail=f"Worker {worker_name} non trouvé")
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")

@app.get("/api/workers/{worker_name}/latest")
def get_worker_latest(worker_name: str):
    """Obtenir la dernière lecture d'un worker"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT id, bpm_average, bpm_instant, timestamp, worker_name
            FROM heart_data 
            WHERE worker_name = %s
            ORDER BY timestamp DESC
            LIMIT 1
        """
        
        cursor.execute(query, (worker_name,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Worker {worker_name} non trouvé")
        
        return result
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")

@app.get("/api/heart-data/latest", response_model=List[HeartData])
def get_latest_readings(limit: int = 20):
    """Obtenir les dernières lectures de tous les workers"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT id, bpm_average, bpm_instant, timestamp, worker_name
            FROM heart_data 
            WHERE worker_name IS NOT NULL
            ORDER BY timestamp DESC
            LIMIT %s
        """
        
        cursor.execute(query, (limit,))
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")

@app.get("/api/workers")
def get_all_workers():
    """Obtenir la liste de tous les workers avec leur dernière lecture"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                worker_name,
                bpm_average as current_bpm,
                CASE 
                    WHEN bpm_average > 110 THEN 'critical'
                    WHEN bpm_average > 95 THEN 'warning'
                    ELSE 'normal'
                END as status,
                COUNT(*) OVER (PARTITION BY worker_name) as readings_count,
                timestamp
            FROM (
                SELECT worker_name, bpm_average, timestamp,
                       ROW_NUMBER() OVER (PARTITION BY worker_name ORDER BY timestamp DESC) as rn
                FROM heart_data
                WHERE worker_name IS NOT NULL
            ) as latest
            WHERE rn = 1
            ORDER BY worker_name
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    """Obtenir un résumé pour le dashboard"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Statistiques globales
        query = """
            SELECT 
                COUNT(DISTINCT worker_name) as total_workers,
                ROUND(AVG(bpm_average), 2) as avg_bpm,
                MAX(bpm_average) as max_bpm,
                MIN(bpm_average) as min_bpm,
                SUM(CASE WHEN bpm_average > 110 THEN 1 ELSE 0 END) as critical_count,
                SUM(CASE WHEN bpm_average BETWEEN 95 AND 110 THEN 1 ELSE 0 END) as warning_count
            FROM (
                SELECT worker_name, bpm_average,
                       ROW_NUMBER() OVER (PARTITION BY worker_name ORDER BY timestamp DESC) as rn
                FROM heart_data
                WHERE worker_name IS NOT NULL
            ) as latest
            WHERE rn = 1
        """
        
        cursor.execute(query)
        summary = cursor.fetchone()
        cursor.close()
        connection.close()
        
        return summary
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")

# Importer les routes machines
try:
    from routes_machines import router as machines_router
    app.include_router(machines_router)
    print("✓ Routes machines chargées")
except Exception as e:
    print(f"⚠ Erreur lors du chargement des routes machines: {e}")

# Importer les routes de sécurité
try:
    from routes_safety import router as safety_router
    app.include_router(safety_router)
    print("✓ Routes safety chargées")
except Exception as e:
    print(f"⚠ Erreur lors du chargement des routes safety: {e}")

# Importer les routes d'équipement (YOLO)
try:
    from routes_equipment import router as equipment_router
    app.include_router(equipment_router)
    print("✓ Routes equipment (YOLO) chargées")
except Exception as e:
    print(f"⚠ Erreur lors du chargement des routes equipment: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
