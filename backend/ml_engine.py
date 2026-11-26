import json
import os
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

try:
    import xgboost as xgb
except ImportError:
    xgb = None

try:
    import lightgbm as lgb
except ImportError:
    lgb = None

try:
    import shap
except ImportError:
    shap = None


ARTIFACTS_DIR = Path(__file__).resolve().parent / "ml_artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
ACTIVE_POINTER_FILE = ARTIFACTS_DIR / "active_model.json"

CANONICAL_FEATURES = [
    "amount",
    "velocity_1h",
    "geo_distance_km",
    "hour_of_day",
    "device_entropy",
    "is_new_beneficiary",
    "account_age_months",
    "channel_risk_code",
]

FEATURE_LABELS = {
    "amount": "Transaction Amount (INR)",
    "velocity_1h": "1-Hour Velocity (tx/hr)",
    "geo_distance_km": "Geo-Hop Distance (km)",
    "hour_of_day": "Origin Hour (IST)",
    "device_entropy": "Device & IP Entropy",
    "is_new_beneficiary": "New Beneficiary Flag",
    "account_age_months": "Account Tenure (Months)",
    "channel_risk_code": "Channel Risk Level",
}


class FraudAutoencoder(nn.Module):
    """Symmetric PyTorch Autoencoder trained on normal banking transactions for zero-day detection."""

    def __init__(self, input_dim: int):
        super().__init__()
        hidden = max(16, min(64, input_dim * 4))
        bottleneck = max(4, min(16, input_dim // 2 + 2))
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden, bottleneck),
            nn.ReLU(),
        )
        self.decoder = nn.Sequential(
            nn.Linear(bottleneck, hidden),
            nn.ReLU(),
            nn.Linear(hidden, input_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.decoder(self.encoder(x))


def generate_indian_banking_dataset(n_rows: int = 6000, fraud_ratio: float = 0.06, seed: int = 42) -> pd.DataFrame:
    """Generate a realistic Indian banking dataset (UPI/IMPS/NEFT/RTGS/POS/ATM) with realistic fraud topologies."""
    rng = np.random.default_rng(seed)
    n_fraud = max(60, int(n_rows * fraud_ratio))
    n_normal = n_rows - n_fraud

    # Normal Indian transactions
    norm_channels = rng.choice(["UPI", "NEFT", "RTGS", "POS", "IMPS", "ATM"], size=n_normal, p=[0.42, 0.18, 0.08, 0.16, 0.10, 0.06])
    ch_map = {"UPI": 0, "POS": 0, "NEFT": 1, "Transfer": 1, "IMPS": 2, "RTGS": 2, "ATM": 3, "WIRE": 3, "SWIFT": 3}

    norm_df = pd.DataFrame({
        "amount": np.round(rng.lognormal(mean=8.4, sigma=1.15, size=n_normal).clip(50, 350000), 2),
        "velocity_1h": rng.integers(1, 5, size=n_normal),
        "geo_distance_km": np.round(rng.exponential(scale=25, size=n_normal).clip(0, 350), 1),
        "hour_of_day": rng.choice(np.arange(7, 23), size=n_normal),
        "device_entropy": rng.choice([0, 1], size=n_normal, p=[0.88, 0.12]),
        "is_new_beneficiary": rng.choice([0, 1], size=n_normal, p=[0.78, 0.22]),
        "account_age_months": rng.integers(6, 120, size=n_normal),
        "channel": norm_channels,
        "channel_risk_code": [ch_map[c] for c in norm_channels],
        "is_fraud": 0,
    })

    # Fraud topologies: (1) Smurfing < 50k, (2) Impossible travel, (3) Midnight ATM/IMPS, (4) High-value takeover
    third = n_fraud // 3
    rem = n_fraud - 2 * third

    smurf_amt = rng.uniform(44000, 49950, size=third)
    travel_amt = rng.uniform(65000, 480000, size=third)
    midnight_amt = rng.uniform(18000, 290000, size=rem)
    fraud_amts = np.round(np.concatenate([smurf_amt, travel_amt, midnight_amt]), 2)

    fraud_vel = np.concatenate([
        rng.integers(10, 28, size=third),
        rng.integers(2, 9, size=third),
        rng.integers(6, 18, size=rem),
    ])
    fraud_geo = np.round(np.concatenate([
        rng.uniform(30, 450, size=third),
        rng.uniform(1100, 2800, size=third),
        rng.uniform(350, 1600, size=rem),
    ]), 1)
    fraud_hour = np.concatenate([
        rng.integers(10, 22, size=third),
        rng.integers(0, 24, size=third),
        rng.choice([0, 1, 2, 3, 4, 23], size=rem),
    ])
    fraud_dev = rng.choice([1, 2], size=n_fraud, p=[0.22, 0.78])
    fraud_new_ben = rng.choice([0, 1], size=n_fraud, p=[0.12, 0.88])
    fraud_age = rng.integers(1, 36, size=n_fraud)
    fraud_channels = rng.choice(["IMPS", "ATM", "UPI", "RTGS", "WIRE"], size=n_fraud, p=[0.32, 0.22, 0.22, 0.14, 0.10])

    fraud_df = pd.DataFrame({
        "amount": fraud_amts,
        "velocity_1h": fraud_vel,
        "geo_distance_km": fraud_geo,
        "hour_of_day": fraud_hour,
        "device_entropy": fraud_dev,
        "is_new_beneficiary": fraud_new_ben,
        "account_age_months": fraud_age,
        "channel": fraud_channels,
        "channel_risk_code": [ch_map[c] for c in fraud_channels],
        "is_fraud": 1,
    })

    df = pd.concat([norm_df, fraud_df], ignore_index=True).sample(frac=1.0, random_state=seed).reset_index(drop=True)
    return df


def inspect_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """Inspect uploaded CSV or generated dataframe schema, missingness, and class balance."""
    cols = list(df.columns)
    candidate_targets = [
        c for c in cols if c.lower() in {"is_fraud", "isfraud", "class", "fraud", "label", "target", "anomaly"}
    ]
    detected_target = candidate_targets[0] if candidate_targets else None

    numeric_cols = [c for c in cols if pd.api.types.is_numeric_dtype(df[c])]
    categorical_cols = [c for c in cols if c not in numeric_cols]

    class_balance = None
    if detected_target is not None:
        counts = df[detected_target].value_counts(dropna=True).to_dict()
        total = max(1, len(df))
        fraud_cnt = int(counts.get(1, counts.get("1", counts.get(True, 0))))
        normal_cnt = int(total - fraud_cnt)
        class_balance = {
            "normal_count": normal_cnt,
            "fraud_count": fraud_cnt,
            "fraud_pct": round((fraud_cnt / total) * 100, 2),
        }

    is_canonical = all(f in cols for f in CANONICAL_FEATURES)

    preview_rows = df.head(5).fillna("").to_dict(orient="records")
    return {
        "rows": int(len(df)),
        "columns": cols,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "missing_cells": int(df.isna().sum().sum()),
        "detected_target": detected_target,
        "class_balance": class_balance,
        "is_canonical_schema": is_canonical,
        "preview": preview_rows,
    }


def _extract_features_and_target(
    df: pd.DataFrame, target_col: Optional[str] = None
) -> Tuple[pd.DataFrame, Optional[np.ndarray], List[str], Dict[str, Dict[str, int]], bool]:
    """Prepare numeric matrix X and binary target y cleanly from arbitrary or canonical banking CSVs."""
    cols = list(df.columns)
    if target_col is None:
        for c in cols:
            if c.lower() in {"is_fraud", "isfraud", "class", "fraud", "label", "target", "anomaly"}:
                target_col = c
                break

    y = None
    if target_col and target_col in df.columns:
        raw_y = df[target_col]
        if raw_y.dtype == object or str(raw_y.dtype) == "category":
            y = raw_y.astype(str).str.lower().isin(["1", "true", "fraud", "yes", "anomaly"]).astype(int).values
        else:
            y = (pd.to_numeric(raw_y, errors="coerce").fillna(0) > 0).astype(int).values

    # Canonical match shortcut
    if all(f in cols for f in CANONICAL_FEATURES):
        X_df = df[CANONICAL_FEATURES].copy()
        for c in CANONICAL_FEATURES:
            X_df[c] = pd.to_numeric(X_df[c], errors="coerce")
        return X_df, y, list(CANONICAL_FEATURES), {}, True

    ignore_lower = {"id", "tx_id", "reference_id", "transaction_id", "nameorig", "namedest", "timestamp", "created_at"}
    if target_col:
        ignore_lower.add(target_col.lower())

    cat_maps: Dict[str, Dict[str, int]] = {}
    selected_cols: List[str] = []
    X_dict: Dict[str, pd.Series] = {}

    for c in cols:
        if c.lower() in ignore_lower:
            continue
        if pd.api.types.is_numeric_dtype(df[c]):
            selected_cols.append(c)
            X_dict[c] = pd.to_numeric(df[c], errors="coerce")
        elif df[c].nunique(dropna=True) <= 20:
            cats = sorted(df[c].astype(str).fillna("UNKNOWN").unique().tolist())
            mapping = {val: idx for idx, val in enumerate(cats)}
            cat_maps[c] = mapping
            selected_cols.append(c)
            X_dict[c] = df[c].astype(str).fillna("UNKNOWN").map(mapping).astype(float)

    if not selected_cols:
        raise ValueError("No usable numeric or low-cardinality categorical feature columns found in dataset.")

    X_df = pd.DataFrame(X_dict)
    return X_df, y, selected_cols, cat_maps, False


def _compute_metrics(y_true: np.ndarray, probs: np.ndarray, latency_ms: float, threshold: float = 0.5) -> Dict[str, Any]:
    preds = (probs >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, preds, labels=[0, 1]).ravel()
    fpr = float(fp / max(1, fp + tn))
    try:
        roc = float(roc_auc_score(y_true, probs))
    except Exception:
        roc = 0.5
    try:
        pr = float(average_precision_score(y_true, probs))
    except Exception:
        pr = 0.0

    return {
        "accuracy": round(float(accuracy_score(y_true, preds)) * 100, 2),
        "precision": round(float(precision_score(y_true, preds, zero_division=0)) * 100, 2),
        "recall": round(float(recall_score(y_true, preds, zero_division=0)) * 100, 2),
        "f1": round(float(f1_score(y_true, preds, zero_division=0)) * 100, 2),
        "roc_auc": round(roc * 100, 2),
        "pr_auc": round(pr * 100, 2),
        "fpr": round(fpr * 100, 2),
        "latency_ms": round(float(latency_ms), 3),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    }


def _train_autoencoder(X_normal_scaled: np.ndarray, epochs: int = 16) -> Tuple[FraudAutoencoder, float, float]:
    input_dim = X_normal_scaled.shape[1]
    model = FraudAutoencoder(input_dim)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.004)
    criterion = nn.MSELoss()

    tensor_x = torch.tensor(X_normal_scaled, dtype=torch.float32)
    batch_size = min(256, max(32, len(tensor_x) // 12))
    dataset = torch.utils.data.TensorDataset(tensor_x)
    loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

    model.train()
    for _ in range(epochs):
        for (bx,) in loader:
            optimizer.zero_grad()
            recon = model(bx)
            loss = criterion(recon, bx)
            loss.backward()
            optimizer.step()

    model.eval()
    with torch.no_grad():
        recon_all = model(tensor_x)
        mse_all = torch.mean((tensor_x - recon_all) ** 2, dim=1).numpy()

    p50 = float(np.percentile(mse_all, 50))
    p97 = float(max(p50 + 1e-4, np.percentile(mse_all, 97)))
    return model, p50, p97


def _score_autoencoder(model: FraudAutoencoder, X_scaled: np.ndarray, p50: float, p97: float) -> Tuple[np.ndarray, np.ndarray]:
    model.eval()
    tx = torch.tensor(X_scaled, dtype=torch.float32)
    with torch.no_grad():
        recon = model(tx)
        sq_err = ((tx - recon) ** 2).numpy()
        mse = np.mean(sq_err, axis=1)
    # Smooth logistic mapping centered around normal p97 threshold
    scale = max(1e-4, (p97 - p50))
    z = (mse - p97) / scale
    probs = 1.0 / (1.0 + np.exp(-np.clip(z * 1.4, -20, 20)))
    return np.clip(probs, 0.01, 0.99), sq_err


def _build_training_histograms(X_df: pd.DataFrame, feature_names: List[str]) -> Dict[str, Any]:
    hists = {}
    for col in feature_names:
        vals = pd.to_numeric(X_df[col], errors="coerce").dropna().values
        if len(vals) < 10:
            continue
        edges = np.unique(np.quantile(vals, np.linspace(0, 1, 11)))
        if len(edges) < 3:
            continue
        counts, _ = np.histogram(vals, bins=edges)
        props = (counts + 1e-5) / max(1, counts.sum())
        hists[col] = {
            "edges": [float(e) for e in edges],
            "proportions": [float(p) for p in props],
        }
    return hists


def compute_psi_drift(train_hists: Dict[str, Any], live_df: pd.DataFrame) -> Dict[str, Any]:
    """Compute Population Stability Index (PSI) across shared features."""
    feature_psi = []
    for col, info in train_hists.items():
        if col not in live_df.columns:
            continue
        vals = pd.to_numeric(live_df[col], errors="coerce").dropna().values
        if len(vals) < 5:
            continue
        edges = np.array(info["edges"], dtype=float)
        expected = np.array(info["proportions"], dtype=float)
        counts, _ = np.histogram(vals, bins=edges)
        actual = (counts + 1e-5) / max(1, counts.sum())
        psi_val = float(np.sum((actual - expected) * np.log(actual / expected)))
        status = "HEALTHY" if psi_val < 0.1 else ("MODERATE_DRIFT" if psi_val < 0.25 else "HIGH_DRIFT")
        feature_psi.append({"feature": col, "psi": round(psi_val, 4), "status": status})

    avg_psi = round(float(np.mean([f["psi"] for f in feature_psi])), 4) if feature_psi else 0.0
    overall = "HEALTHY" if avg_psi < 0.1 else ("WARNING" if avg_psi < 0.25 else "RETRAIN_RECOMMENDED")
    return {"overall_psi": avg_psi, "overall_status": overall, "features": feature_psi}


def train_pipeline(
    df: pd.DataFrame,
    target_col: Optional[str] = None,
    selected_models: Optional[List[str]] = None,
    use_smote: bool = True,
    test_size: float = 0.2,
    dataset_name: str = "uploaded_dataset.csv",
    activate: bool = True,
) -> Dict[str, Any]:
    """Train selected ML/DL models, evaluate on unseen holdout test split, and save versioned artifacts."""
    if selected_models is None:
        selected_models = ["xgboost", "lightgbm", "isolation_forest", "autoencoder"]

    X_df, y, feature_names, cat_maps, is_canonical = _extract_features_and_target(df, target_col)
    if y is None or len(np.unique(y)) < 2:
        raise ValueError("Target column must contain both Normal (0) and Fraud (1) samples.")

    X_train_df, X_test_df, y_train, y_test = train_test_split(
        X_df, y, test_size=test_size, random_state=42, stratify=y
    )

    imputer = SimpleImputer(strategy="median")
    X_train_imp = imputer.fit_transform(X_train_df)
    X_test_imp = imputer.transform(X_test_df)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_imp)
    X_test_scaled = scaler.transform(X_test_imp)

    # SMOTE only on training fold
    smote_applied = False
    if use_smote and np.sum(y_train == 1) >= 6:
        k_neighbors = min(5, int(np.sum(y_train == 1)) - 1)
        sm = SMOTE(random_state=42, k_neighbors=k_neighbors)
        X_train_bal, y_train_bal = sm.fit_resample(X_train_imp, y_train)
        smote_applied = True
    else:
        X_train_bal, y_train_bal = X_train_imp, y_train

    trained_models: Dict[str, Any] = {}
    test_probs: Dict[str, np.ndarray] = {}
    leaderboard: List[Dict[str, Any]] = []
    ae_meta: Optional[Dict[str, Any]] = None
    iforest_bounds: Optional[Tuple[float, float]] = None

    # 1. XGBoost
    if "xgboost" in selected_models and xgb is not None:
        clf_xgb = xgb.XGBClassifier(
            n_estimators=120,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=42,
            eval_metric="logloss",
            n_jobs=2,
        )
        clf_xgb.fit(X_train_bal, y_train_bal)
        t0 = time.perf_counter()
        probs = clf_xgb.predict_proba(X_test_imp)[:, 1]
        lat = ((time.perf_counter() - t0) * 1000.0) / max(1, len(X_test_imp))
        trained_models["xgboost"] = clf_xgb
        test_probs["xgboost"] = probs
        m = _compute_metrics(y_test, probs, lat)
        m["model_key"] = "xgboost"
        m["model_name"] = "XGBoost Classifier (Supervised)"
        m["family"] = "Gradient Boosted Trees"
        leaderboard.append(m)

    # 2. LightGBM
    if "lightgbm" in selected_models and lgb is not None:
        clf_lgb = lgb.LGBMClassifier(
            n_estimators=120,
            num_leaves=31,
            learning_rate=0.08,
            random_state=42,
            verbose=-1,
            n_jobs=2,
        )
        clf_lgb.fit(X_train_bal, y_train_bal)
        t0 = time.perf_counter()
        probs = clf_lgb.predict_proba(X_test_imp)[:, 1]
        lat = ((time.perf_counter() - t0) * 1000.0) / max(1, len(X_test_imp))
        trained_models["lightgbm"] = clf_lgb
        test_probs["lightgbm"] = probs
        m = _compute_metrics(y_test, probs, lat)
        m["model_key"] = "lightgbm"
        m["model_name"] = "LightGBM Classifier (Supervised)"
        m["family"] = "Gradient Boosted Trees"
        leaderboard.append(m)

    # 3. Isolation Forest (trained on training set)
    if "isolation_forest" in selected_models:
        fraud_rate = float(np.clip(np.mean(y_train), 0.01, 0.25))
        iso = IsolationForest(n_estimators=120, contamination=fraud_rate, random_state=42, n_jobs=2)
        iso.fit(X_train_scaled)
        train_raw = -iso.decision_function(X_train_scaled)
        low_b, high_b = float(np.percentile(train_raw, 10)), float(np.percentile(train_raw, 98))
        iforest_bounds = (low_b, max(low_b + 1e-4, high_b))

        t0 = time.perf_counter()
        test_raw = -iso.decision_function(X_test_scaled)
        lat = ((time.perf_counter() - t0) * 1000.0) / max(1, len(X_test_scaled))
        probs = np.clip((test_raw - iforest_bounds[0]) / (iforest_bounds[1] - iforest_bounds[0]), 0.01, 0.99)
        trained_models["isolation_forest"] = iso
        test_probs["isolation_forest"] = probs
        m = _compute_metrics(y_test, probs, lat)
        m["model_key"] = "isolation_forest"
        m["model_name"] = "Isolation Forest (Unsupervised)"
        m["family"] = "Tree Outlier Isolation"
        leaderboard.append(m)

    # 4. PyTorch Deep Autoencoder (trained ONLY on normal training transactions)
    ae_model = None
    if "autoencoder" in selected_models:
        X_norm_train = X_train_scaled[y_train == 0]
        if len(X_norm_train) >= 20:
            ae_model, p50, p97 = _train_autoencoder(X_norm_train, epochs=16)
            ae_meta = {"p50": p50, "p97": p97, "input_dim": X_train_scaled.shape[1]}
            t0 = time.perf_counter()
            probs, _ = _score_autoencoder(ae_model, X_test_scaled, p50, p97)
            lat = ((time.perf_counter() - t0) * 1000.0) / max(1, len(X_test_scaled))
            test_probs["autoencoder"] = probs
            m = _compute_metrics(y_test, probs, lat)
            m["model_key"] = "autoencoder"
            m["model_name"] = "PyTorch Deep Autoencoder (Zero-Day DL)"
            m["family"] = "Unsupervised Deep Learning"
            leaderboard.append(m)

    if not test_probs:
        raise ValueError("No valid models were trained.")

    # Hybrid Weighted Ensemble
    weights_cfg = {"xgboost": 0.45, "lightgbm": 0.25, "autoencoder": 0.20, "isolation_forest": 0.10}
    w_sum = sum(weights_cfg[k] for k in test_probs)
    ensemble_probs = np.zeros(len(y_test), dtype=float)
    for k, p in test_probs.items():
        ensemble_probs += (weights_cfg[k] / w_sum) * p

    ens_latency = sum(m["latency_ms"] for m in leaderboard)
    ens_metrics = _compute_metrics(y_test, ensemble_probs, ens_latency)
    ens_metrics["model_key"] = "ensemble"
    ens_metrics["model_name"] = "BankGuard Hybrid Ensemble"
    ens_metrics["family"] = "ML + DL Fusion"
    leaderboard.insert(0, ens_metrics)

    # Threshold trade-off curve for Ensemble (cutoffs 0.25 .. 0.85)
    threshold_curve = []
    for pct in [25, 35, 45, 55, 65, 75, 85]:
        th_m = _compute_metrics(y_test, ensemble_probs, ens_latency, threshold=pct / 100.0)
        threshold_curve.append({
            "threshold": pct,
            "precision": th_m["precision"],
            "recall": th_m["recall"],
            "f1": th_m["f1"],
            "fpr": th_m["fpr"],
            "tp": th_m["confusion_matrix"]["tp"],
            "fp": th_m["confusion_matrix"]["fp"],
        })

    # Save versioned artifacts
    version_id = f"v_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:4]}"
    version_dir = ARTIFACTS_DIR / version_id
    version_dir.mkdir(parents=True, exist_ok=True)

    train_hists = _build_training_histograms(X_train_df, feature_names)

    bundle = {
        "version_id": version_id,
        "feature_names": feature_names,
        "categorical_maps": cat_maps,
        "is_canonical_schema": is_canonical,
        "imputer": imputer,
        "scaler": scaler,
        "models": trained_models,
        "iforest_bounds": iforest_bounds,
        "ae_meta": ae_meta,
        "weights": weights_cfg,
        "train_histograms": train_hists,
        "feature_medians": {col: float(X_train_df[col].median()) for col in feature_names},
    }
    joblib.dump(bundle, version_dir / "bundle.joblib")

    if ae_model is not None:
        torch.save(ae_model.state_dict(), version_dir / "autoencoder.pt")

    # Save small holdout sample for Mode 4 debugger / quick inspection
    holdout_sample = X_test_df.head(50).copy()
    holdout_sample["actual_fraud"] = y_test[: len(holdout_sample)]
    holdout_sample["predicted_score"] = np.round(ensemble_probs[: len(holdout_sample)] * 100, 1)
    holdout_sample.to_csv(version_dir / "holdout_sample.csv", index=False)

    # Compute Global TreeSHAP / Feature Importance + compact holdout inspection table
    global_shap = []
    tree_imp_model = trained_models.get("xgboost") or trained_models.get("lightgbm")
    if tree_imp_model is not None and hasattr(tree_imp_model, "feature_importances_"):
        imps = np.asarray(tree_imp_model.feature_importances_, dtype=float)
        imp_sum = float(imps.sum()) or 1.0
        for col, val in zip(feature_names, imps):
            global_shap.append({
                "feature": FEATURE_LABELS.get(col, col),
                "key": col,
                "importance": round(float(val / imp_sum), 4),
            })
        global_shap.sort(key=lambda x: x["importance"], reverse=True)

    holdout_samples = []
    for idx in range(min(12, len(X_test_df))):
        row_obj = X_test_df.iloc[idx]
        primary_amt = row_obj["amount"] if "amount" in X_test_df.columns else None
        holdout_samples.append({
            "sample_index": int(idx + 1),
            "primary_amount": round(float(primary_amt), 2) if primary_amt is not None else None,
            "actual_label": int(y_test[idx]),
            "ensemble_score": round(float(ensemble_probs[idx] * 100.0), 1),
            "model_scores": {k: round(float(p[idx] * 100.0), 1) for k, p in test_probs.items()},
        })

    metadata = {
        "version_id": version_id,
        "created_at": datetime.utcnow().isoformat(),
        "dataset_name": dataset_name,
        "total_rows": int(len(df)),
        "train_rows": int(len(X_train_df)),
        "test_rows": int(len(X_test_df)),
        "fraud_pct": round(float(np.mean(y)) * 100, 2),
        "smote_applied": smote_applied,
        "is_canonical_schema": is_canonical,
        "feature_names": feature_names,
        "models_trained": list(test_probs.keys()),
        "leaderboard": leaderboard,
        "threshold_curve": threshold_curve,
        "global_shap": global_shap,
        "holdout_samples": holdout_samples,
    }
    (version_dir / "metrics.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    if activate:
        set_active_version(version_id)

    return metadata


def list_model_versions() -> Dict[str, Any]:
    active_id = get_active_version_id()
    versions = []
    for p in sorted(ARTIFACTS_DIR.iterdir(), reverse=True):
        metrics_file = p / "metrics.json"
        if p.is_dir() and metrics_file.exists():
            try:
                data = json.loads(metrics_file.read_text(encoding="utf-8"))
                data["is_active"] = data.get("version_id") == active_id
                versions.append(data)
            except Exception:
                continue
    return {"active_version": active_id, "versions": versions}


def get_active_version_id() -> Optional[str]:
    if ACTIVE_POINTER_FILE.exists():
        try:
            return json.loads(ACTIVE_POINTER_FILE.read_text(encoding="utf-8")).get("version_id")
        except Exception:
            return None
    return None


def set_active_version(version_id: str) -> Dict[str, Any]:
    metrics_file = ARTIFACTS_DIR / version_id / "metrics.json"
    if not metrics_file.exists():
        raise FileNotFoundError(f"Model version '{version_id}' not found.")
    ACTIVE_POINTER_FILE.write_text(json.dumps({"version_id": version_id}), encoding="utf-8")
    return json.loads(metrics_file.read_text(encoding="utf-8"))


def load_active_bundle() -> Optional[Tuple[Dict[str, Any], Optional[FraudAutoencoder], Dict[str, Any]]]:
    version_id = get_active_version_id()
    if not version_id:
        return None
    version_dir = ARTIFACTS_DIR / version_id
    bundle_path = version_dir / "bundle.joblib"
    metrics_path = version_dir / "metrics.json"
    if not bundle_path.exists():
        return None

    bundle = joblib.load(bundle_path)
    metrics = json.loads(metrics_path.read_text(encoding="utf-8")) if metrics_path.exists() else {}
    ae_model = None
    ae_path = version_dir / "autoencoder.pt"
    if ae_path.exists() and bundle.get("ae_meta"):
        ae_model = FraudAutoencoder(bundle["ae_meta"]["input_dim"])
        ae_model.load_state_dict(torch.load(ae_path, map_location="cpu", weights_only=True))
        ae_model.eval()
    return bundle, ae_model, metrics


def score_dataframe(
    bundle: Dict[str, Any],
    ae_model: Optional[FraudAutoencoder],
    df_input: pd.DataFrame,
) -> Tuple[np.ndarray, Dict[str, np.ndarray], Optional[np.ndarray]]:
    """Score a dataframe with all models in the active bundle."""
    feature_names = bundle["feature_names"]
    cat_maps = bundle.get("categorical_maps", {})
    medians = bundle.get("feature_medians", {})

    X_work = pd.DataFrame(index=df_input.index)
    for col in feature_names:
        if col in df_input.columns:
            if col in cat_maps:
                X_work[col] = df_input[col].astype(str).map(cat_maps[col]).fillna(0.0)
            else:
                X_work[col] = pd.to_numeric(df_input[col], errors="coerce")
        else:
            X_work[col] = medians.get(col, 0.0)

    X_imp = bundle["imputer"].transform(X_work)
    X_scaled = bundle["scaler"].transform(X_imp)

    model_probs: Dict[str, np.ndarray] = {}
    models_dict = bundle["models"]

    if "xgboost" in models_dict:
        model_probs["xgboost"] = models_dict["xgboost"].predict_proba(X_imp)[:, 1]
    if "lightgbm" in models_dict:
        model_probs["lightgbm"] = models_dict["lightgbm"].predict_proba(X_imp)[:, 1]
    if "isolation_forest" in models_dict and bundle.get("iforest_bounds"):
        low_b, high_b = bundle["iforest_bounds"]
        raw = -models_dict["isolation_forest"].decision_function(X_scaled)
        model_probs["isolation_forest"] = np.clip((raw - low_b) / (high_b - low_b), 0.01, 0.99)

    ae_sq_err = None
    if ae_model is not None and bundle.get("ae_meta"):
        p50 = bundle["ae_meta"]["p50"]
        p97 = bundle["ae_meta"]["p97"]
        ae_probs, ae_sq_err = _score_autoencoder(ae_model, X_scaled, p50, p97)
        model_probs["autoencoder"] = ae_probs

    weights_cfg = bundle["weights"]
    w_sum = sum(weights_cfg[k] for k in model_probs)
    ensemble = np.zeros(len(df_input), dtype=float)
    for k, p in model_probs.items():
        ensemble += (weights_cfg[k] / w_sum) * p

    return ensemble, model_probs, ae_sq_err


def explain_canonical_transaction(
    feature_row: Dict[str, float],
    step_up_cutoff: float = 45.0,
    block_cutoff: float = 75.0,
) -> Optional[Dict[str, Any]]:
    """Score & explain a single canonical banking transaction using the active trained ML/DL + TreeSHAP ensemble."""
    loaded = load_active_bundle()
    if not loaded:
        return None
    bundle, ae_model, metrics = loaded
    if not bundle.get("is_canonical_schema"):
        return None

    df_one = pd.DataFrame([feature_row])
    ensemble_prob, model_probs, ae_sq_err = score_dataframe(bundle, ae_model, df_one)
    risk_score = round(float(np.clip(ensemble_prob[0] * 100.0, 1.0, 99.0)), 1)

    if risk_score >= block_cutoff:
        decision = "BLOCKED_FROZEN"
    elif risk_score >= step_up_cutoff:
        decision = "STEP_UP_MFA"
    else:
        decision = "AUTO_CLEARED"

    # Real TreeSHAP attribution
    feature_names = bundle["feature_names"]
    X_imp = bundle["imputer"].transform(df_one[feature_names])
    shap_items = []

    tree_model = bundle["models"].get("xgboost") or bundle["models"].get("lightgbm")
    if shap is not None and tree_model is not None:
        try:
            explainer = shap.TreeExplainer(tree_model)
            sv = explainer.shap_values(X_imp)
            if isinstance(sv, list):
                sv = sv[-1]
            vals = np.asarray(sv).reshape(-1)
            norm_scale = 18.0
            for idx, col in enumerate(feature_names):
                pct = round(float(vals[idx] * norm_scale), 1)
                shap_items.append({
                    "feature": FEATURE_LABELS.get(col, col),
                    "key": col,
                    "impact": f"{pct:+.1f}%",
                    "value": pct,
                    "positive": pct > 0,
                })
        except Exception:
            shap_items = []

    if not shap_items and ae_sq_err is not None:
        errs = ae_sq_err[0]
        for idx, col in enumerate(feature_names):
            pct = round(float(min(40.0, errs[idx] * 8.0)), 1)
            shap_items.append({
                "feature": FEATURE_LABELS.get(col, col),
                "key": col,
                "impact": f"{pct:+.1f}%",
                "value": pct,
                "positive": pct > 1.5,
            })

    shap_items.sort(key=lambda x: abs(x["value"]), reverse=True)
    top_pos = [s["feature"] for s in shap_items if s["positive"]][:3]
    reasons = (
        f"Active Ensemble ({metrics.get('version_id', 'ML')}) flagged: {', '.join(top_pos)}"
        if top_pos
        else "Transaction aligns with trained normal behavioral baseline"
    )

    # Counterfactual recourse search using the real trained ensemble
    recourse = []
    if risk_score >= step_up_cutoff:
        candidates = [
            ("Authenticate from trusted registered device", {"device_entropy": 0}),
            ("Originate from home city corridor (<50 km)", {"geo_distance_km": 15.0}),
            ("Transfer to verified existing beneficiary", {"is_new_beneficiary": 0}),
            ("Reduce burst frequency to 1 tx/hr", {"velocity_1h": 1}),
            ("Keep transfer below ₹40,000", {"amount": min(feature_row["amount"], 35000.0)}),
        ]
        for label, patch in candidates:
            cf_row = {**feature_row, **patch}
            cf_prob, _, _ = score_dataframe(bundle, ae_model, pd.DataFrame([cf_row]))
            cf_score = round(float(cf_prob[0] * 100.0), 1)
            drop = round(risk_score - cf_score, 1)
            if drop >= 3.0:
                recourse.append(f"{label} (reduces model risk by {drop} pts to {cf_score}/100)")

    return {
        "version_id": metrics.get("version_id"),
        "risk_score": risk_score,
        "decision": decision,
        "reasons": reasons,
        "shap_factors": shap_items,
        "model_breakdown": {k: round(float(v[0] * 100.0), 1) for k, v in model_probs.items()},
        "counterfactuals": recourse[:3],
    }


def run_adversarial_suite() -> Dict[str, Any]:
    """Mode 3 Testing: Run 6 synthetic Indian banking attack & normal scenarios against the active trained model."""
    scenarios = [
        {
            "id": "ADV-01",
            "name": "AML Smurfing (< ₹50,000 PAN Limit)",
            "expected": "FLAGGED",
            "features": {"amount": 49500, "velocity_1h": 16, "geo_distance_km": 150, "hour_of_day": 14, "device_entropy": 2, "is_new_beneficiary": 1, "account_age_months": 3, "channel_risk_code": 2},
        },
        {
            "id": "ADV-02",
            "name": "Impossible Travel (Chennai → Delhi in 12m)",
            "expected": "FLAGGED",
            "features": {"amount": 135000, "velocity_1h": 3, "geo_distance_km": 2150, "hour_of_day": 21, "device_entropy": 2, "is_new_beneficiary": 1, "account_age_months": 36, "channel_risk_code": 2},
        },
        {
            "id": "ADV-03",
            "name": "Midnight ATM Cashout Burst",
            "expected": "FLAGGED",
            "features": {"amount": 30000, "velocity_1h": 9, "geo_distance_km": 680, "hour_of_day": 2, "device_entropy": 2, "is_new_beneficiary": 1, "account_age_months": 18, "channel_risk_code": 3},
        },
        {
            "id": "ADV-04",
            "name": "High-Value Account Takeover (IMPS)",
            "expected": "FLAGGED",
            "features": {"amount": 320000, "velocity_1h": 7, "geo_distance_km": 1400, "hour_of_day": 1, "device_entropy": 2, "is_new_beneficiary": 1, "account_age_months": 8, "channel_risk_code": 2},
        },
        {
            "id": "ADV-05",
            "name": "Routine UPI Grocery Payment (₹450)",
            "expected": "CLEARED",
            "features": {"amount": 450, "velocity_1h": 1, "geo_distance_km": 5, "hour_of_day": 11, "device_entropy": 0, "is_new_beneficiary": 0, "account_age_months": 48, "channel_risk_code": 0},
        },
        {
            "id": "ADV-06",
            "name": "Business-Hours NEFT Payroll (₹85,000)",
            "expected": "CLEARED",
            "features": {"amount": 85000, "velocity_1h": 1, "geo_distance_km": 10, "hour_of_day": 10, "device_entropy": 0, "is_new_beneficiary": 0, "account_age_months": 60, "channel_risk_code": 1},
        },
    ]

    results = []
    passed = 0
    for sc in scenarios:
        res = explain_canonical_transaction(sc["features"])
        if not res:
            raise ValueError("No active canonical model trained yet. Train a canonical model in Model Training first.")
        is_flagged = res["decision"] != "AUTO_CLEARED"
        ok = (sc["expected"] == "FLAGGED" and is_flagged) or (sc["expected"] == "CLEARED" and not is_flagged)
        if ok:
            passed += 1
        results.append({
            "id": sc["id"],
            "name": sc["name"],
            "expected": sc["expected"],
            "predicted_decision": res["decision"],
            "risk_score": res["risk_score"],
            "passed": ok,
            "top_reasons": res["reasons"],
            "model_breakdown": res["model_breakdown"],
        })

    return {
        "total": len(results),
        "passed": passed,
        "pass_rate": round((passed / len(results)) * 100, 1),
        "results": results,
    }
