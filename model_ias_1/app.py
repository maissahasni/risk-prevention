from fastapi import FastAPI, UploadFile, File, HTTPException
import pandas as pd
import joblib
from preventecmodel import build_supervised_pipeline, predict_risk_supervised
from pathlib import Path
import io

app = FastAPI(
    title="PrevenTec AI Model API",
    description="An advanced AI model for predicting accidents before they happen using supervised learning.",
    version="1.0.0"
)

# ✅ Paths (fixed to match your names)
DATA_PATH = Path("data/flat_dataset.csv")
MODEL_PATH = Path("model/preventec_model.pkl")

# ✅ Load or initialize supervised model
if MODEL_PATH.exists():
    model = joblib.load(MODEL_PATH)
    print("✅ Supervised model loaded successfully from:", MODEL_PATH)
else:
    model = build_supervised_pipeline(random_state=42)
    print("⚠️ No trained model found. Initialized a new untrained supervised pipeline.")

@app.get("/")
def home():
    return {"message": "Welcome to the PrevenTec AI API! Use /train to train the model and /predict to get accident predictions."}

# 🔹 Predict endpoint (now for supervised accident prediction)
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Upload a CSV file with data to predict accident risk (probability of future anomaly in 6 hours).
    Requires a trained supervised model.
    """
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Check for required target column (for consistency, but prediction doesn't need it)
        if "future_anomaly_6h" not in df.columns:
            raise HTTPException(status_code=400, detail="Dataset must include 'future_anomaly_6h' column for supervised prediction.")

        # Predict risk using supervised model
        predictions = predict_risk_supervised(model, df)

        # Save output
        output_path = Path("data/flat_dataset_predicted_api.csv")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        predictions.to_csv(output_path, index=False)

        return {
            "message": "✅ Accident predictions generated successfully!",
            "output_file": str(output_path),
            "sample_output": predictions.head(5).to_dict(orient="records"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# 🔹 Train endpoint (for supervised model)
@app.post("/train")
async def train(file: UploadFile = File(...)):
    """
    Train a new supervised RandomForest model on uploaded dataset to predict accidents.
    Dataset must include 'future_anomaly_6h' as the target (1 for accident, 0 otherwise).
    """
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        if "future_anomaly_6h" not in df.columns:
            raise HTTPException(status_code=400, detail="Dataset must include 'future_anomaly_6h' column for supervised training.")

        # Train supervised model
        new_model = build_supervised_pipeline(random_state=42)
        X = df.drop(columns=["future_anomaly_6h"])
        y = df["future_anomaly_6h"].astype(int)
        new_model.fit(X, y)

        # Save model and dataset
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(new_model, MODEL_PATH)
        df.to_csv(DATA_PATH, index=False)

        # Update global model
        global model
        model = new_model

        return {
            "message": "✅ Supervised model trained and saved successfully!",
            "model_path": str(MODEL_PATH),
            "dataset_saved_as": str(DATA_PATH)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")