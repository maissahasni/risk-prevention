import argparse
import os
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

def build_supervised_pipeline(random_state: int) -> Pipeline:
    """
    Build a supervised pipeline for predicting accidents (e.g., future_anomaly_6h).
    """
    numeric_features: List[str] = [
        "detected_persons",
        "ppe_violation",
        "intrusion_alert",
        "smoke_alert",
        "temperature_C",
        "vibration_mm_s",
        "pressure_bar",
        "current_A",
        "humidity_pct",
    ]

    categorical_features: List[str] = [
        "machine_type",
        "line",
        "worker",
        "camera_id",
    ]

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocess = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_features),
            ("cat", categorical_pipeline, categorical_features),
        ]
    )

    clf = RandomForestClassifier(
        n_estimators=400,
        max_depth=None,
        n_jobs=-1,
        class_weight="balanced",
        random_state=random_state,
    )

    return Pipeline(steps=[("preprocess", preprocess), ("rf", clf)])

def predict_risk_supervised(pipeline: Pipeline, df: pd.DataFrame) -> pd.DataFrame:
    """
    Predict accident risk using the supervised model.
    Returns dataframe with predictions and probabilities.
    """
    if "future_anomaly_6h" in df.columns:
        X = df.drop(columns=["future_anomaly_6h"])
    else:
        X = df

    # Predict
    y_pred = pipeline.predict(X)
    y_proba = pipeline.predict_proba(X)[:, 1]

    out = df.copy()
    out["pred_future_anomaly_6h"] = y_pred
    out["accident_risk_proba"] = np.round(y_proba, 4)  # Probability of accident
    return out

# (Removed unsupervised functions to focus on supervised prediction, as per your request)

def main() -> None:
    parser = argparse.ArgumentParser(
        description="PrevenTec supervised model for predicting future accidents."
    )
    parser.add_argument(
        "--input",
        type=str,
        default=str(Path("data/flat_dataset.csv").resolve()),
        help="Path to input flat_dataset.csv",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=str(Path("data/flat_dataset_predicted.csv").resolve()),
        help="Path to write predictions CSV",
    )
    parser.add_argument(
        "--model-out",
        type=str,
        default=str(Path("model/preventec_model.pkl").resolve()),
        help="Path to save trained model",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    df = pd.read_csv(args.input)

    if "future_anomaly_6h" not in df.columns:
        raise ValueError("Dataset must include 'future_anomaly_6h' for supervised prediction.")

    y = df["future_anomaly_6h"].astype(int).values
    X = df.drop(columns=["future_anomaly_6h"])

    pipeline = build_supervised_pipeline(random_state=args.seed)
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=args.seed, stratify=y
    )
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_val)
    y_proba = pipeline.predict_proba(X_val)[:, 1]
    try:
        auc = roc_auc_score(y_val, y_proba)
    except Exception:
        auc = float("nan")
    print("Validation report:\n", classification_report(y_val, y_pred, digits=3))
    print(f"ROC-AUC: {auc:.4f}")

    # Save predictions
    predictions = predict_risk_supervised(pipeline, df)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.model_out).parent.mkdir(parents=True, exist_ok=True)
    predictions.to_csv(args.output, index=False)
    joblib.dump(pipeline, args.model_out)

    print(f"Trained supervised model saved to: {args.model_out}")
    print(f"Predictions CSV saved to: {args.output}")

if __name__ == "__main__":
    main()