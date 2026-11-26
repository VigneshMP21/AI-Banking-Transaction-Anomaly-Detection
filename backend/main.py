import io
import json
import random
import string
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session

from database import Base, engine, get_db, init_engine
import models
import schemas
import auth
import ml_engine

app = FastAPI(
    title="Bank Guard AI - Transaction Anomaly Detection & Banking API",
    description="Real-Time Banking Authentication, PostgreSQL Database Connector, Transfers, and Explainable Risk Engine",
    version="2.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory OTP store for Step-Up MFA challenges (reference_id -> {otp, user_id, recipient_user_id, amount, attempts})
PENDING_OTP_CHALLENGES = {}

ADMIN_ROLES = {"analyst", "admin", "administrator", "chief risk analyst", "compliance", "compliance auditor"}


def is_admin_user(user: Optional[models.User]) -> bool:
    return bool(user and (user.role or "").strip().lower() in ADMIN_ROLES)


def require_current_user(user: Optional[models.User] = Depends(auth.get_current_user)) -> models.User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
        )
    return user


def require_admin_user(user: models.User = Depends(require_current_user)) -> models.User:
    if not is_admin_user(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator or Risk Analyst privileges required.",
        )
    return user


def generate_account_number() -> str:
    g1 = "".join(random.choices(string.digits, k=4))
    g2 = "".join(random.choices(string.digits, k=4))
    g3 = "".join(random.choices(string.digits, k=4))
    return f"BG-{g1}-{g2}-{g3}"


def generate_reference_id() -> str:
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TX-{chars}"


def ensure_schema_columns():
    """Safely add newer additive columns to pre-existing PostgreSQL/SQLite tables."""
    inspector = inspect(engine)
    dialect = engine.dialect.name

    user_cols = {c["name"] for c in inspector.get_columns("users")} if inspector.has_table("users") else set()
    tx_cols = {c["name"] for c in inspector.get_columns("transactions")} if inspector.has_table("transactions") else set()

    statements = []
    if "home_city" not in user_cols:
        statements.append("ALTER TABLE users ADD COLUMN home_city VARCHAR(120) DEFAULT 'Chennai, IN'")
    if "recipient_user_id" not in tx_cols:
        if dialect == "postgresql":
            statements.append("ALTER TABLE transactions ADD COLUMN recipient_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL")
        else:
            statements.append("ALTER TABLE transactions ADD COLUMN recipient_user_id INTEGER")
    if "recipient_account" not in tx_cols:
        statements.append("ALTER TABLE transactions ADD COLUMN recipient_account VARCHAR(50)")
    if "note" not in tx_cols:
        statements.append("ALTER TABLE transactions ADD COLUMN note VARCHAR(255)")
    if "shap_factors" not in tx_cols:
        statements.append("ALTER TABLE transactions ADD COLUMN shap_factors TEXT")

    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
        # Normalize any legacy USD / non-India seed defaults in existing tables to INR / Indian cities
        conn.execute(text("UPDATE users SET currency = 'INR' WHERE currency IN ('USD', 'EUR', 'GBP') OR currency IS NULL"))
        conn.execute(text("UPDATE users SET home_city = 'Mumbai, IN' WHERE email = 'alex.vance@bankguard.ai' AND (home_city IS NULL OR home_city = 'London, UK')"))
        conn.execute(text("UPDATE users SET home_city = 'Chennai, IN' WHERE home_city IS NULL OR home_city = 'London, UK'"))
        conn.execute(text("UPDATE users SET phone = '+91 98201 44510' WHERE email = 'alex.vance@bankguard.ai' AND phone LIKE '+1%'"))
        conn.execute(text("UPDATE users SET phone = '+91 98409 77210' WHERE email = 'elena.rostova@bankguard.ai' AND phone LIKE '+44%'"))
        conn.execute(text("UPDATE transactions SET currency = 'INR' WHERE currency IN ('USD', 'EUR', 'GBP') OR currency IS NULL"))
        conn.execute(text("UPDATE transactions SET location = 'Mumbai, IN' WHERE location IN ('London, UK', 'Zurich, CH')"))
        conn.execute(text("UPDATE transactions SET recipient = 'NPCI Settlement Clearing Bengaluru' WHERE recipient = 'Nordic Clearnet Stockholm'"))
        conn.execute(text("UPDATE transactions SET recipient = 'Unverified Offshore Proxy Gateway', location = 'Unknown Proxy Node' WHERE recipient = 'Offshore Gateway Belize'"))


def ensure_demo_users(db: Session):
    """Idempotently ensure default BankGuard AI demo accounts exist in the active DB."""
    demo_specs = [
        {
            "username": "alex_vance",
            "email": "alex.vance@bankguard.ai",
            "password_plain": "BankGuard2026!",
            "full_name": "Alex Vance",
            "phone": "+91 98201 44510",
            "home_city": "Mumbai, IN",
            "account_number": "BG-8821-4902-7104",
            "account_tier": "Analyst",
            "balance": 4850000.00,
            "currency": "INR",
            "role": "Analyst",
            "risk_tier": "LOW",
            "kyc_verified": True,
            "two_factor_enabled": True,
        },
        {
            "username": "elena_rostova",
            "email": "elena.rostova@bankguard.ai",
            "password_plain": "BankGuard2026!",
            "full_name": "Elena Rostova",
            "phone": "+91 98409 77210",
            "home_city": "Chennai, IN",
            "account_number": "BG-3419-7721-0982",
            "account_tier": "Premier Business",
            "balance": 890000.00,
            "currency": "INR",
            "role": "User",
            "risk_tier": "LOW",
            "kyc_verified": True,
            "two_factor_enabled": True,
        },
    ]

    created_any = False
    for spec in demo_specs:
        existing = (
            db.query(models.User)
            .filter((models.User.email == spec["email"]) | (models.User.username == spec["username"]))
            .first()
        )
        if existing:
            continue

        acct_num = spec["account_number"]
        while db.query(models.User).filter(models.User.account_number == acct_num).first():
            acct_num = generate_account_number()

        db.add(
            models.User(
                username=spec["username"],
                email=spec["email"],
                hashed_password=auth.hash_password(spec["password_plain"]),
                full_name=spec["full_name"],
                phone=spec["phone"],
                home_city=spec["home_city"],
                account_number=acct_num,
                account_tier=spec["account_tier"],
                balance=spec["balance"],
                currency=spec["currency"],
                role=spec["role"],
                risk_tier=spec["risk_tier"],
                kyc_verified=spec["kyc_verified"],
                two_factor_enabled=spec["two_factor_enabled"],
            )
        )
        created_any = True

    if created_any:
        db.commit()


@app.on_event("startup")
def startup_event():
    db = None
    try:
        Base.metadata.create_all(bind=engine)
        ensure_schema_columns()
        db = next(get_db())
        ensure_demo_users(db)

        if db.query(models.Transaction).count() == 0:
            analyst = db.query(models.User).filter(models.User.email == "alex.vance@bankguard.ai").first()
            elena = db.query(models.User).filter(models.User.email == "elena.rostova@bankguard.ai").first()
            if analyst:
                sample_txs = [
                    models.Transaction(
                        reference_id=generate_reference_id(),
                        user_id=analyst.id,
                        amount=450000.00,
                        currency="INR",
                        channel="RTGS",
                        sender=analyst.full_name,
                        recipient="NPCI Settlement Clearing Bengaluru",
                        location="Mumbai, IN",
                        ip_address="103.21.124.45",
                        device_fingerprint="BankGuard-Hardware-HSM-01",
                        risk_score=4.8,
                        decision="AUTO_CLEARED",
                        anomaly_reasons="Normal institutional velocity, verified RBI RTGS clearing gateway",
                    ),
                    models.Transaction(
                        reference_id=generate_reference_id(),
                        user_id=analyst.id,
                        amount=184000.00,
                        currency="INR",
                        channel="IMPS",
                        sender=analyst.full_name,
                        recipient="Unverified Offshore Proxy Gateway",
                        location="Unknown Proxy Node",
                        ip_address="185.220.101.5",
                        device_fingerprint="Unknown Linux Browser",
                        risk_score=87.6,
                        decision="BLOCKED_FROZEN",
                        anomaly_reasons="Geo-hop velocity anomaly (>8,000km/h), Tor exit node IP, high entropy payload",
                    ),
                ]
                if elena:
                    sample_txs.append(
                        models.Transaction(
                            reference_id=generate_reference_id(),
                            user_id=elena.id,
                            recipient_user_id=analyst.id,
                            recipient_account=analyst.account_number,
                            amount=12500.00,
                            currency="INR",
                            channel="Transfer",
                            sender=elena.full_name,
                            recipient=analyst.full_name,
                            location="Chennai, IN",
                            note="Treasury settlement",
                            risk_score=9.4,
                            decision="AUTO_CLEARED",
                            anomaly_reasons="Verified internal BankGuard recipient, normal baseline velocity",
                        )
                    )
                db.add_all(sample_txs)
                db.commit()
    except Exception as e:
        print(f"Startup DB init warning (fallback mode active): {e}")
    finally:
        if db is not None:
            db.close()


@app.get("/")
def root():
    return {
        "system": "Bank Guard AI Anomaly Detection & Banking API",
        "version": "2.5.0",
        "status": "ONLINE",
        "database": "PostgreSQL / SQLite Ready",
    }


# ================= AUTHENTICATION & PROFILE ENDPOINTS =================

@app.post("/api/auth/signup", response_model=schemas.TokenResponse)
def sign_up(req: schemas.SignUpRequest, db: Session = Depends(get_db)):
    existing_email = db.query(models.User).filter(models.User.email == req.email.lower()).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this email address already exists.")

    clean_username = req.username.strip().lower()
    existing_user = db.query(models.User).filter(models.User.username == clean_username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This username is already taken. Please choose another.")

    allowed_roles = ["User", "Analyst"]
    assigned_role = req.role if req.role in allowed_roles else "User"

    account_num = generate_account_number()
    while db.query(models.User).filter(models.User.account_number == account_num).first():
        account_num = generate_account_number()

    new_user = models.User(
        username=clean_username,
        email=req.email.lower(),
        hashed_password=auth.hash_password(req.password),
        full_name=req.full_name.strip(),
        phone=req.phone or "+91 98400 00000",
        home_city="Chennai, IN",
        account_number=account_num,
        account_tier="Standard",
        balance=150000.00,
        currency="INR",
        role=assigned_role,
        risk_tier="LOW",
        kyc_verified=True,
        two_factor_enabled=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.add(
        models.SecurityAudit(
            user_id=new_user.id,
            action="USER_REGISTERED",
            ip_address="127.0.0.1",
            user_agent="BankGuard Web Client",
            status="SUCCESS",
        )
    )
    db.commit()

    token = auth.create_access_token(
        data={"sub": new_user.id, "email": new_user.email, "username": new_user.username, "role": new_user.role}
    )
    return {"access_token": token, "token_type": "bearer", "user": new_user}


@app.post("/api/auth/signin", response_model=schemas.TokenResponse)
def sign_in(req: schemas.SignInRequest, db: Session = Depends(get_db)):
    ident = req.identifier.strip().lower()
    user = db.query(models.User).filter(
        (models.User.email == ident)
        | (models.User.username == ident)
        | (models.User.account_number == req.identifier.strip())
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. No user found with this email or username.",
        )

    if not auth.verify_password(req.password, user.hashed_password):
        db.add(
            models.SecurityAudit(
                user_id=user.id,
                action="SIGNIN_FAILED",
                ip_address="127.0.0.1",
                status="REJECTED_PASSWORD",
            )
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please check your credentials.",
        )

    user.last_login = datetime.utcnow()
    db.add(
        models.SecurityAudit(
            user_id=user.id,
            action="SIGNIN_SUCCESS",
            ip_address="127.0.0.1",
            user_agent="BankGuard Web Client",
            status="SUCCESS",
        )
    )
    db.commit()
    db.refresh(user)

    token = auth.create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(user: models.User = Depends(require_current_user)):
    return user


@app.put("/api/auth/profile", response_model=schemas.UserResponse)
def update_user_profile(
    req: schemas.ProfileUpdateRequest,
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    db_user = db.query(models.User).filter(models.User.id == user.id).first()
    db_user.full_name = req.full_name.strip()
    if req.phone is not None:
        db_user.phone = req.phone.strip()
    if req.home_city is not None and req.home_city.strip():
        db_user.home_city = req.home_city.strip()

    db.add(
        models.SecurityAudit(
            user_id=db_user.id,
            action="PROFILE_UPDATED",
            ip_address="127.0.0.1",
            user_agent="BankGuard Web Client",
            status="SUCCESS",
        )
    )
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/change-password")
def change_password(
    req: schemas.PasswordChangeRequest,
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    db_user = db.query(models.User).filter(models.User.id == user.id).first()
    if not auth.verify_password(req.current_password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")

    db_user.hashed_password = auth.hash_password(req.new_password)
    db.add(
        models.SecurityAudit(
            user_id=db_user.id,
            action="PASSWORD_CHANGED",
            ip_address="127.0.0.1",
            user_agent="BankGuard Web Client",
            status="SUCCESS",
        )
    )
    db.commit()
    return {"status": "SUCCESS", "message": "Password updated successfully."}


@app.get("/api/auth/demo-users")
def get_demo_users():
    return [
        {
            "name": "Alex Vance",
            "email": "alex.vance@bankguard.ai",
            "password": "BankGuard2026!",
            "role": "Chief Risk Analyst",
            "account_tier": "Institutional Vault",
            "account_number": "BG-8821-4902-7104",
            "badge": "Risk Ops Level-3",
        },
        {
            "name": "Elena Rostova",
            "email": "elena.rostova@bankguard.ai",
            "password": "BankGuard2026!",
            "role": "Institutional Client",
            "account_tier": "Premier Business",
            "account_number": "BG-3419-7721-0982",
            "badge": "Tier-1 Treasury",
        },
    ]


@app.get("/api/users/recipients")
def list_transfer_recipients(
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    others = (
        db.query(models.User)
        .filter(models.User.id != user.id)
        .order_by(models.User.full_name.asc())
        .all()
    )
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "account_number": u.account_number,
            "currency": u.currency,
        }
        for u in others
    ]


@app.get("/api/users", response_model=list[schemas.UserResponse])
def list_all_users(
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    if not is_admin_user(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Analyst or Admin role required.")
    return db.query(models.User).order_by(models.User.id.asc()).all()


# ================= DATABASE STATUS & MANAGEMENT (PGADMIN 4) =================

@app.get("/api/db/status", response_model=schemas.DbStatusResponse)
def get_db_status(db: Session = Depends(get_db)):
    db_type = "PostgreSQL (pgAdmin 4)" if "postgresql" in str(engine.url) else "SQLite Fallback (pgAdmin not configured yet)"
    try:
        user_count = db.query(models.User).count()
        tx_count = db.query(models.Transaction).count()
        connected = True
        msg = f"Connected to {db_type} at {engine.url.host or 'local'}:{engine.url.port or '5432'}"
    except Exception as e:
        user_count = 0
        tx_count = 0
        connected = False
        msg = f"Database query error: {str(e)}"

    return {
        "connected": connected,
        "database_type": db_type,
        "host": engine.url.host or "localhost",
        "port": str(engine.url.port or "5432"),
        "database": engine.url.database or "sample_bank",
        "message": msg,
        "user_count": user_count,
        "transaction_count": tx_count,
    }


@app.post("/api/db/connect")
def test_and_connect_db(req: schemas.DbConfigRequest):
    new_url = f"postgresql://{req.user}:{req.password}@{req.host}:{req.port}/{req.db}"
    success, msg = init_engine(new_url)
    if success:
        Base.metadata.create_all(bind=engine)
        startup_event()
        return {
            "status": "SUCCESS",
            "message": "Successfully connected to PostgreSQL! Tables and seeds synchronized.",
            "url": f"{req.user}@{req.host}:{req.port}/{req.db}",
        }
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Could not connect to PostgreSQL: {msg}. Please check your password in pgAdmin 4 or create database '{req.db}'.",
    )


@app.post("/api/db/init")
def initialize_database_schema():
    try:
        Base.metadata.create_all(bind=engine)
        startup_event()
        return {"status": "SUCCESS", "message": "Database schema and seed users successfully initialized!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= BEHAVIORAL RISK SCORING HELPER =================

def evaluate_transaction_risk(
    db: Session,
    sender_user: Optional[models.User],
    amount: float,
    channel: str,
    recipient: str,
    location: str,
    device_fingerprint: str = "BankGuard Web Client",
):
    """Compute explainable behavioral risk score and SHAP-like feature attribution."""
    base_score = 10.0
    factors = []
    shap_breakdown = []

    # 1. Amount vs User Historical Average / High-Value Threshold
    user_avg = 15000.0
    if sender_user:
        past_txs = (
            db.query(models.Transaction)
            .filter(models.Transaction.user_id == sender_user.id, models.Transaction.decision == "AUTO_CLEARED")
            .all()
        )
        if past_txs:
            user_avg = max(2500.0, sum(t.amount for t in past_txs) / len(past_txs))

    ratio = amount / user_avg
    if amount >= 200000 or ratio >= 8.0:
        amt_impact = 34.0
        factors.append(f"High-value transfer (₹{amount:,.2f}) exceeding baseline ({ratio:.1f}x avg)")
    elif amount >= 40000 or ratio >= 3.0:
        amt_impact = 20.0
        factors.append(f"Elevated payload (₹{amount:,.2f}) above typical account baseline")
    else:
        amt_impact = -4.0

    shap_breakdown.append({
        "feature": "Amount vs Historical Baseline",
        "impact": f"{amt_impact:+.1f}%",
        "value": amt_impact,
        "positive": amt_impact > 0,
    })

    # 2. 1-Hour Velocity Window
    velocity_1h = 0
    if sender_user:
        one_hr_ago = datetime.utcnow() - timedelta(hours=1)
        velocity_1h = (
            db.query(models.Transaction)
            .filter(models.Transaction.user_id == sender_user.id, models.Transaction.created_at >= one_hr_ago)
            .count()
        )
    if velocity_1h >= 5:
        vel_impact = 26.0
        factors.append(f"Rapid burst velocity ({velocity_1h} transfers in past 60m)")
    elif velocity_1h >= 3:
        vel_impact = 14.0
        factors.append(f"Elevated 1h transfer frequency ({velocity_1h} tx/hr)")
    else:
        vel_impact = -5.0

    shap_breakdown.append({
        "feature": "1-Hour Velocity Density",
        "impact": f"{vel_impact:+.1f}%",
        "value": vel_impact,
        "positive": vel_impact > 0,
    })

    # 3. Geo-Location vs User Home City
    home_city = (sender_user.home_city if sender_user and sender_user.home_city else "Chennai, IN").lower()
    loc_lower = (location or home_city).lower()
    high_risk_geo = any(k in loc_lower for k in ["offshore", "proxy", "geo", "unknown", "tor", "jamtara", "foreign"])
    if high_risk_geo:
        geo_impact = 32.0
        factors.append(f"High-risk jurisdiction / geo-hop anomaly ({location})")
    elif home_city.split(",")[0].strip() not in loc_lower:
        geo_impact = 16.0
        factors.append(f"Cross-city origin deviation ({location} vs home {sender_user.home_city if sender_user else 'Chennai, IN'})")
    else:
        geo_impact = -6.0

    shap_breakdown.append({
        "feature": "Geo-Location & Corridor Entropy",
        "impact": f"{geo_impact:+.1f}%",
        "value": geo_impact,
        "positive": geo_impact > 0,
    })

    # 4. Beneficiary & Channel Trust
    rec_lower = (recipient or "").lower()
    risky_rec = any(k in rec_lower for k in ["offshore", "crypto", "mixer", "unknown", "proxy", "unverified"])
    is_new_recipient = True
    if sender_user:
        prior_match = (
            db.query(models.Transaction)
            .filter(
                models.Transaction.user_id == sender_user.id,
                models.Transaction.recipient == recipient,
                models.Transaction.decision == "AUTO_CLEARED",
            )
            .first()
        )
        is_new_recipient = prior_match is None

    if risky_rec:
        rec_impact = 28.0
        factors.append("Unverified high-risk / offshore beneficiary endpoint")
    elif is_new_recipient:
        rec_impact = 12.0
        factors.append("First-time transfer to new beneficiary")
    else:
        rec_impact = -10.0

    shap_breakdown.append({
        "feature": "Beneficiary Trust & Prior History",
        "impact": f"{rec_impact:+.1f}%",
        "value": rec_impact,
        "positive": rec_impact > 0,
    })

    # 5. Channel & Device Entropy
    ch_upper = (channel or "TRANSFER").upper()
    dev_lower = (device_fingerprint or "").lower()
    if "unknown" in dev_lower or "tor" in dev_lower:
        dev_impact = 18.0
        factors.append("Unrecognized device fingerprint")
    elif ch_upper in ["RTGS", "NEFT", "WIRE", "SWIFT"] and amount > 100000:
        dev_impact = 10.0
    else:
        dev_impact = -5.0

    shap_breakdown.append({
        "feature": "Channel & Device Signature",
        "impact": f"{dev_impact:+.1f}%",
        "value": dev_impact,
        "positive": dev_impact > 0,
    })

    # If an active trained ML/DL ensemble exists, score dynamically with Hybrid Ensemble + TreeSHAP
    if high_risk_geo:
        geo_dist = 1850.0
    elif home_city.split(",")[0].strip() not in loc_lower:
        geo_dist = 920.0
    else:
        geo_dist = 12.0

    dev_entropy = 2.0 if ("unknown" in dev_lower or "tor" in dev_lower) else 0.0
    ch_map = {"UPI": 0, "NEFT": 1, "IMPS": 2, "RTGS": 3, "POS": 4, "ATM": 5}
    channel_code = float(ch_map.get(ch_upper, 2))
    acct_age_months = 24.0
    if sender_user and sender_user.created_at:
        created_naive = sender_user.created_at.replace(tzinfo=None)
        days_old = max(1, (datetime.utcnow() - created_naive).days)
        acct_age_months = max(1.0, min(120.0, round(days_old / 30.0, 1)))

    eff_velocity = max(velocity_1h, 6 if risky_rec else velocity_1h)
    eff_new_ben = 1.0 if (is_new_recipient or risky_rec) else 0.0

    ml_result = ml_engine.explain_canonical_transaction({
        "amount": float(amount),
        "velocity_1h": float(eff_velocity),
        "geo_distance_km": float(geo_dist),
        "hour_of_day": float(datetime.utcnow().hour),
        "device_entropy": float(dev_entropy),
        "is_new_beneficiary": float(eff_new_ben),
        "account_age_months": float(acct_age_months),
        "channel_risk_code": float(channel_code),
    })
    if ml_result is not None:
        blended_factors = list(factors) if factors else [ml_result["reasons"]]
        for cf in ml_result.get("counterfactuals", []):
            blended_factors.append(cf)
        return (
            ml_result["risk_score"],
            ml_result["decision"],
            "; ".join(blended_factors),
            ml_result["shap_factors"],
        )

    raw_score = base_score + amt_impact + vel_impact + geo_impact + rec_impact + dev_impact
    risk_score = round(min(99.0, max(2.0, raw_score)), 1)

    if risk_score >= 75.0:
        decision = "BLOCKED_FROZEN"
    elif risk_score >= 45.0:
        decision = "STEP_UP_MFA"
    else:
        decision = "AUTO_CLEARED"

    reasons_str = "; ".join(factors) if factors else "Normal behavioral velocity and trusted home corridor"
    shap_breakdown.sort(key=lambda x: abs(x["value"]), reverse=True)
    return risk_score, decision, reasons_str, shap_breakdown


def serialize_transaction(tx: models.Transaction, viewer_user: Optional[models.User] = None) -> dict:
    shap_list = None
    if tx.shap_factors:
        try:
            shap_list = json.loads(tx.shap_factors)
        except Exception:
            shap_list = None

    direction = "DEBIT"
    counterparty = tx.recipient
    if viewer_user and not is_admin_user(viewer_user):
        if tx.recipient_user_id == viewer_user.id and tx.user_id != viewer_user.id:
            direction = "CREDIT"
            counterparty = tx.sender

    return {
        "id": tx.id,
        "reference_id": tx.reference_id,
        "user_id": tx.user_id,
        "recipient_user_id": tx.recipient_user_id,
        "recipient_account": tx.recipient_account,
        "amount": tx.amount,
        "currency": tx.currency,
        "channel": tx.channel,
        "sender": tx.sender,
        "recipient": tx.recipient,
        "counterparty": counterparty,
        "direction": direction,
        "location": tx.location,
        "note": tx.note,
        "risk_score": tx.risk_score,
        "decision": tx.decision,
        "anomaly_reasons": tx.anomaly_reasons,
        "shap_factors": shap_list,
        "created_at": tx.created_at.isoformat() if tx.created_at else None,
    }


# ================= TRANSACTIONS, TRANSFERS & PORTAL SUMMARY =================

@app.get("/api/transactions")
def list_transactions(
    limit: int = 50,
    user: Optional[models.User] = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")

    query = db.query(models.Transaction)
    if not is_admin_user(user):
        query = query.filter(
            (models.Transaction.user_id == user.id) | (models.Transaction.recipient_user_id == user.id)
        )

    txs = query.order_by(models.Transaction.id.desc()).limit(limit).all()
    return [serialize_transaction(tx, user) for tx in txs]


@app.get("/api/portal/summary")
def get_portal_summary(
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Transaction)
    admin = is_admin_user(user)
    if not admin:
        query = query.filter(
            (models.Transaction.user_id == user.id) | (models.Transaction.recipient_user_id == user.id)
        )

    txs = query.order_by(models.Transaction.id.desc()).all()
    total = len(txs)
    normal = sum(1 for t in txs if t.decision == "AUTO_CLEARED")
    suspicious = sum(1 for t in txs if t.decision == "STEP_UP_MFA")
    high_risk = sum(1 for t in txs if t.decision == "BLOCKED_FROZEN")

    total_sent = sum(t.amount for t in txs if (admin or t.user_id == user.id) and t.decision == "AUTO_CLEARED")
    total_received = sum(t.amount for t in txs if not admin and t.recipient_user_id == user.id and t.decision == "AUTO_CLEARED")

    # Build 7-day trend buckets
    today = datetime.utcnow().date()
    days = [today - timedelta(days=offset) for offset in range(6, -1, -1)]
    trend_series = []
    for d in days:
        day_txs = [t for t in txs if t.created_at and t.created_at.date() == d]
        trend_series.append({
            "label": d.strftime("%b %d"),
            "normal": sum(1 for t in day_txs if t.decision == "AUTO_CLEARED"),
            "suspicious": sum(1 for t in day_txs if t.decision != "AUTO_CLEARED"),
        })

    if total > 0:
        normal_pct = round((normal / total) * 100, 1)
        suspicious_pct = round((suspicious / total) * 100, 1)
        high_risk_pct = round(max(0.0, 100.0 - normal_pct - suspicious_pct), 1)
    else:
        normal_pct = suspicious_pct = high_risk_pct = 0.0

    return {
        "is_admin": admin,
        "balance": user.balance,
        "currency": user.currency,
        "account_number": user.account_number,
        "total_transactions": total,
        "normal_count": normal,
        "suspicious_count": suspicious,
        "high_risk_count": high_risk,
        "total_sent": round(total_sent, 2),
        "total_received": round(total_received, 2),
        "risk_distribution": {
            "normal_pct": normal_pct,
            "suspicious_pct": suspicious_pct,
            "high_risk_pct": high_risk_pct,
        },
        "trend_series": trend_series,
        "recent_transactions": [serialize_transaction(t, user) for t in txs[:7]],
    }


@app.post("/api/transactions/transfer")
def execute_user_transfer(
    req: schemas.TransferRequest,
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    sender = db.query(models.User).filter(models.User.id == user.id).first()
    if sender.balance < req.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: {sender.currency} {sender.balance:,.2f}",
        )

    ident = req.recipient_identifier.strip()
    recipient_user = db.query(models.User).filter(
        (models.User.account_number == ident)
        | (models.User.email == ident.lower())
        | (models.User.username == ident.lower())
    ).first()

    if recipient_user and recipient_user.id == sender.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot transfer funds to your own account.")

    recipient_name = recipient_user.full_name if recipient_user else ident
    recipient_acct = recipient_user.account_number if recipient_user else "EXT-BENEFICIARY"
    origin_loc = (req.location or sender.home_city or "Chennai, IN").strip()

    risk_score, decision, reasons_str, shap_breakdown = evaluate_transaction_risk(
        db=db,
        sender_user=sender,
        amount=req.amount,
        channel=req.channel or "Transfer",
        recipient=recipient_name,
        location=origin_loc,
        device_fingerprint=req.device_fingerprint or "BankGuard Web Client",
    )

    ref_id = generate_reference_id()
    new_tx = models.Transaction(
        reference_id=ref_id,
        user_id=sender.id,
        recipient_user_id=recipient_user.id if recipient_user else None,
        recipient_account=recipient_acct,
        amount=round(req.amount, 2),
        currency=sender.currency,
        channel=req.channel or "Transfer",
        sender=sender.full_name,
        recipient=recipient_name,
        location=origin_loc,
        device_fingerprint=req.device_fingerprint or "BankGuard Web Client",
        note=req.note or "",
        risk_score=risk_score,
        decision=decision,
        anomaly_reasons=reasons_str,
        shap_factors=json.dumps(shap_breakdown),
    )

    demo_otp = None
    if decision == "AUTO_CLEARED":
        sender.balance = round(sender.balance - req.amount, 2)
        if recipient_user:
            recipient_user.balance = round(recipient_user.balance + req.amount, 2)
        db.add(
            models.SecurityAudit(
                user_id=sender.id,
                action=f"TRANSFER_CLEARED:{ref_id}",
                ip_address="127.0.0.1",
                status="SUCCESS",
            )
        )
    elif decision == "STEP_UP_MFA":
        demo_otp = "".join(random.choices(string.digits, k=6))
        PENDING_OTP_CHALLENGES[ref_id] = {
            "otp": demo_otp,
            "user_id": sender.id,
            "recipient_user_id": recipient_user.id if recipient_user else None,
            "amount": round(req.amount, 2),
            "attempts": 0,
        }
        db.add(
            models.SecurityAudit(
                user_id=sender.id,
                action=f"TRANSFER_STEP_UP_MFA:{ref_id}",
                ip_address="127.0.0.1",
                status="PENDING_OTP",
            )
        )
    else:
        db.add(
            models.SecurityAudit(
                user_id=sender.id,
                action=f"TRANSFER_BLOCKED_ANOMALY:{ref_id}",
                ip_address="127.0.0.1",
                status="BLOCKED",
            )
        )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    db.refresh(sender)

    return {
        "transaction": serialize_transaction(new_tx, sender),
        "updated_balance": sender.balance,
        "requires_otp": decision == "STEP_UP_MFA",
        "demo_otp_preview": demo_otp,
    }


@app.post("/api/transactions/verify-otp")
def verify_transfer_otp(
    req: schemas.OtpVerifyRequest,
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    challenge = PENDING_OTP_CHALLENGES.get(req.reference_id)
    tx = db.query(models.Transaction).filter(models.Transaction.reference_id == req.reference_id).first()

    if not tx or tx.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pending transfer challenge not found.")
    if not challenge:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP challenge has expired or was already resolved.")

    if req.otp_code.strip() != challenge["otp"]:
        challenge["attempts"] += 1
        if challenge["attempts"] >= 3:
            PENDING_OTP_CHALLENGES.pop(req.reference_id, None)
            tx.decision = "BLOCKED_FROZEN"
            tx.anomaly_reasons = f"{tx.anomaly_reasons}; Blocked after 3 failed Step-Up OTP attempts"
            db.add(
                models.SecurityAudit(
                    user_id=user.id,
                    action=f"MFA_BLOCKED:{req.reference_id}",
                    ip_address="127.0.0.1",
                    status="BLOCKED",
                )
            )
            db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maximum OTP attempts exceeded. Transfer blocked.")

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP code. {3 - challenge['attempts']} attempts remaining.",
        )

    sender = db.query(models.User).filter(models.User.id == user.id).first()
    if sender.balance < tx.amount:
        PENDING_OTP_CHALLENGES.pop(req.reference_id, None)
        tx.decision = "BLOCKED_FROZEN"
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance to complete transfer.")

    sender.balance = round(sender.balance - tx.amount, 2)
    if tx.recipient_user_id:
        recipient_user = db.query(models.User).filter(models.User.id == tx.recipient_user_id).first()
        if recipient_user:
            recipient_user.balance = round(recipient_user.balance + tx.amount, 2)

    tx.decision = "AUTO_CLEARED"
    tx.anomaly_reasons = f"{tx.anomaly_reasons}; Cleared via Step-Up OTP MFA"
    PENDING_OTP_CHALLENGES.pop(req.reference_id, None)

    db.add(
        models.SecurityAudit(
            user_id=sender.id,
            action=f"MFA_VERIFIED:{req.reference_id}",
            ip_address="127.0.0.1",
            status="SUCCESS",
        )
    )
    db.commit()
    db.refresh(tx)
    db.refresh(sender)

    return {
        "transaction": serialize_transaction(tx, sender),
        "updated_balance": sender.balance,
        "message": "Step-Up OTP verified. Transfer completed!",
    }


@app.post("/api/transactions/analyze")
def analyze_transaction(
    req: schemas.TransactionCreate,
    user: Optional[models.User] = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    risk_score, decision, reasons_str, shap_breakdown = evaluate_transaction_risk(
        db=db,
        sender_user=user,
        amount=req.amount,
        channel=req.channel or "NEFT",
        recipient=req.recipient,
        location=req.location or "Mumbai, IN",
    )

    new_tx = models.Transaction(
        reference_id=generate_reference_id(),
        user_id=user.id if user else None,
        amount=req.amount,
        currency=req.currency or "INR",
        channel=req.channel or "NEFT",
        sender=req.sender,
        recipient=req.recipient,
        location=req.location or "Mumbai, IN",
        ip_address=req.ip_address or "192.168.1.100",
        risk_score=risk_score,
        decision=decision,
        anomaly_reasons=reasons_str,
        shap_factors=json.dumps(shap_breakdown),
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    return {
        "reference_id": new_tx.reference_id,
        "amount": new_tx.amount,
        "currency": new_tx.currency,
        "risk_score": new_tx.risk_score,
        "decision": new_tx.decision,
        "anomaly_reasons": new_tx.anomaly_reasons,
        "shap_factors": shap_breakdown,
        "created_at": new_tx.created_at,
    }


@app.get("/api/alerts")
def get_role_alerts(
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Transaction).filter(models.Transaction.decision != "AUTO_CLEARED")
    if not is_admin_user(user):
        query = query.filter(models.Transaction.user_id == user.id)

    flagged = query.order_by(models.Transaction.id.desc()).limit(20).all()
    return [
        {
            "id": f"ALT-{tx.id}",
            "txId": tx.reference_id,
            "title": "Blocked High-Risk Transfer" if tx.decision == "BLOCKED_FROZEN" else "Step-Up MFA Verification Required",
            "description": f"{tx.currency} {tx.amount:,.2f} to {tx.recipient} ({tx.location}) — {tx.anomaly_reasons}",
            "severity": "CRITICAL" if tx.decision == "BLOCKED_FROZEN" else "MEDIUM",
            "status": tx.decision,
            "time": tx.created_at.strftime("%b %d, %H:%M") if tx.created_at else "Recent",
        }
        for tx in flagged
    ]


@app.get("/api/security/audits")
def get_security_audits(
    limit: int = 25,
    user: Optional[models.User] = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.SecurityAudit)
    if user and not is_admin_user(user):
        query = query.filter(models.SecurityAudit.user_id == user.id)
    return query.order_by(models.SecurityAudit.id.desc()).limit(limit).all()


# ================= ADMIN ML MODEL TRAINING & TESTING LAB =================

def _read_csv_upload(file_bytes: bytes) -> pd.DataFrame:
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded CSV file is empty.")
    try:
        return pd.read_csv(io.BytesIO(file_bytes))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV file: {str(exc)}",
        )


@app.get("/api/ml/dataset/sample-csv")
def download_sample_dataset_csv(
    rows: int = 3000,
    fraud_ratio: float = 0.06,
    admin: models.User = Depends(require_admin_user),
):
    safe_rows = max(200, min(20000, rows))
    safe_ratio = max(0.01, min(0.45, fraud_ratio))
    df = ml_engine.generate_indian_banking_dataset(n_rows=safe_rows, fraud_ratio=safe_ratio)
    csv_data = df.to_csv(index=False)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="bankguard_indian_banking_{safe_rows}.csv"'
        },
    )


@app.post("/api/ml/dataset/inspect")
async def inspect_dataset_endpoint(
    file: Optional[UploadFile] = File(None),
    use_synthetic: bool = Form(False),
    synthetic_rows: int = Form(4000),
    fraud_ratio: float = Form(0.06),
    admin: models.User = Depends(require_admin_user),
):
    if use_synthetic or file is None:
        safe_rows = max(300, min(25000, synthetic_rows))
        safe_ratio = max(0.01, min(0.45, fraud_ratio))
        df = ml_engine.generate_indian_banking_dataset(n_rows=safe_rows, fraud_ratio=safe_ratio)
        dataset_name = f"bankguard_india_synthetic_{safe_rows}.csv"
    else:
        raw = await file.read()
        df = _read_csv_upload(raw)
        dataset_name = file.filename or "uploaded_dataset.csv"

    report = ml_engine.inspect_dataframe(df)
    report["dataset_name"] = dataset_name
    return report


@app.post("/api/ml/train")
async def train_ml_models_endpoint(
    file: Optional[UploadFile] = File(None),
    use_synthetic: bool = Form(False),
    synthetic_rows: int = Form(4000),
    fraud_ratio: float = Form(0.06),
    target_col: Optional[str] = Form(None),
    models_json: str = Form('["xgboost","lightgbm","isolation_forest","autoencoder"]'),
    use_smote: bool = Form(True),
    test_size: float = Form(0.2),
    activate: bool = Form(True),
    dataset_name: Optional[str] = Form(None),
    admin: models.User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    if use_synthetic or file is None:
        safe_rows = max(300, min(25000, synthetic_rows))
        safe_ratio = max(0.01, min(0.45, fraud_ratio))
        df = ml_engine.generate_indian_banking_dataset(n_rows=safe_rows, fraud_ratio=safe_ratio)
        resolved_name = dataset_name or f"bankguard_india_synthetic_{safe_rows}.csv"
    else:
        raw = await file.read()
        df = _read_csv_upload(raw)
        resolved_name = dataset_name or file.filename or "uploaded_dataset.csv"

    try:
        selected_models = json.loads(models_json)
        if not isinstance(selected_models, list) or not selected_models:
            selected_models = ["xgboost", "lightgbm"]
    except Exception:
        selected_models = ["xgboost", "lightgbm", "isolation_forest", "autoencoder"]

    safe_split = max(0.1, min(0.4, float(test_size)))

    try:
        metadata = ml_engine.train_pipeline(
            df=df,
            target_col=target_col or None,
            selected_models=selected_models,
            use_smote=bool(use_smote),
            test_size=safe_split,
            dataset_name=resolved_name,
            activate=bool(activate),
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training pipeline error: {str(exc)}",
        )

    db.add(
        models.SecurityAudit(
            user_id=admin.id,
            action=f"ML_MODEL_TRAINED:{metadata['version_id']} ({resolved_name})",
            ip_address="127.0.0.1",
            status="SUCCESS",
        )
    )
    db.commit()
    return metadata


@app.get("/api/ml/models")
def list_ml_models_endpoint(admin: models.User = Depends(require_admin_user)):
    return ml_engine.list_model_versions()


@app.post("/api/ml/models/{version_id}/activate")
def activate_ml_model_endpoint(
    version_id: str,
    admin: models.User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    try:
        ml_engine.set_active_version(version_id)
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))

    db.add(
        models.SecurityAudit(
            user_id=admin.id,
            action=f"ML_MODEL_ACTIVATED:{version_id}",
            ip_address="127.0.0.1",
            status="SUCCESS",
        )
    )
    db.commit()
    return ml_engine.list_model_versions()


@app.post("/api/ml/test/batch-csv")
async def test_batch_csv_endpoint(
    file: UploadFile = File(...),
    threshold: float = Form(0.5),
    admin: models.User = Depends(require_admin_user),
):
    loaded = ml_engine.load_active_bundle()
    if loaded is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active ML model trained yet. Train a model in Model Training Studio first.",
        )

    bundle, ae_model, active_meta = loaded
    raw = await file.read()
    df_raw = _read_csv_upload(raw)
    if len(df_raw) < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV has 0 rows.")

    expected_cols = bundle["feature_names"]
    for col in expected_cols:
        if col not in df_raw.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CSV schema mismatch: missing feature column '{col}' expected by active model {active_meta['version_id']}.",
            )

    y_true = None
    try:
        _, y_parsed, _, _, _ = ml_engine._extract_features_and_target(df_raw)
        y_true = y_parsed
    except ValueError:
        y_true = None

    probs, model_probs, _ = ml_engine.score_dataframe(bundle, ae_model, df_raw)
    safe_thresh = max(0.05, min(0.95, float(threshold)))

    metrics = None
    if y_true is not None and len(set(y_true)) >= 2:
        metrics = ml_engine._compute_metrics(y_true, probs, latency_ms=1.2, threshold=safe_thresh)

    scored_df = df_raw.copy()
    scored_df["predicted_risk_score"] = (probs * 100.0).round(2)
    scored_df["predicted_flag"] = [
        "BLOCKED_FROZEN" if p * 100.0 >= 75.0 else ("STEP_UP_MFA" if p >= safe_thresh else "AUTO_CLEARED")
        for p in probs
    ]

    flagged_count = int((probs >= safe_thresh).sum())
    blocked_count = int((probs * 100.0 >= 75.0).sum())

    preview_df = scored_df.sort_values(by="predicted_risk_score", ascending=False).head(40)
    preview_rows = json.loads(preview_df.to_json(orient="records"))

    return {
        "version_id": active_meta["version_id"],
        "filename": file.filename or "test_batch.csv",
        "threshold_used": safe_thresh,
        "total_rows": int(len(scored_df)),
        "flagged_count": flagged_count,
        "blocked_count": blocked_count,
        "anomaly_rate_pct": round((flagged_count / len(scored_df)) * 100.0, 2),
        "has_labels": bool(metrics is not None),
        "metrics": metrics,
        "preview_columns": list(preview_df.columns)[:10],
        "preview_rows": preview_rows,
        "scored_csv": scored_df.to_csv(index=False),
    }


@app.post("/api/ml/test/adversarial")
def test_adversarial_suite_endpoint(
    admin: models.User = Depends(require_admin_user),
):
    loaded = ml_engine.load_active_bundle()
    version_id = loaded[2].get("version_id") if loaded else None
    try:
        res = ml_engine.run_adversarial_suite()
        res["version_id"] = version_id
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@app.get("/api/ml/test/drift")
def test_data_drift_endpoint(
    admin: models.User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    loaded = ml_engine.load_active_bundle()
    if loaded is None:
        return {
            "has_active_model": False,
            "overall_psi": 0.0,
            "overall_status": "NO_MODEL",
            "features": [],
            "live_sample_count": 0,
        }

    bundle, _, active_meta = loaded
    recent_txs = db.query(models.Transaction).order_by(models.Transaction.id.desc()).limit(250).all()
    ch_map = {"UPI": 0, "NEFT": 1, "IMPS": 2, "RTGS": 3, "POS": 4, "ATM": 5}
    live_rows = [
        {
            "amount": float(tx.amount),
            "channel_risk_code": float(ch_map.get((tx.channel or "NEFT").upper(), 2)),
            "hour_of_day": float(tx.created_at.hour if tx.created_at else 12),
        }
        for tx in recent_txs
    ]
    live_df = pd.DataFrame(live_rows) if live_rows else pd.DataFrame(columns=["amount", "channel_risk_code", "hour_of_day"])
    drift = ml_engine.compute_psi_drift(bundle.get("train_histograms", {}), live_df)
    drift["has_active_model"] = True
    drift["version_id"] = active_meta["version_id"]
    drift["live_sample_count"] = len(recent_txs)
    return drift
