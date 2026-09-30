import random
import string
import os
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import Base, engine, get_db, init_engine, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER
import models
import schemas
import auth

app = FastAPI(
    title="Bank Guard AI - Transaction Anomaly Detection & Banking API",
    description="Real-Time Banking Authentication, PostgreSQL Database Connector, and Explainable Risk Engine",
    version="2.4.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_account_number():
    group1 = ''.join(random.choices(string.digits, k=4))
    group2 = ''.join(random.choices(string.digits, k=4))
    group3 = ''.join(random.choices(string.digits, k=4))
    return f"BG-{group1}-{group2}-{group3}"

def generate_reference_id():
    chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TX-{chars}"

# Auto-initialize database tables and seed accounts
@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        # Seed default banking demo accounts if not exist
        db = next(get_db())
        if db.query(models.User).count() == 0:
            demo_users = [
                models.User(
                    username="alex_vance",
                    email="alex.vance@bankguard.ai",
                    hashed_password=auth.hash_password("BankGuard2026!"),
                    full_name="Alex Vance",
                    phone="+1 (555) 234-8901",
                    account_number="BG-8821-4902-7104",
                    account_tier="Analyst",
                    balance=4850000.00,
                    currency="USD",
                    role="Analyst",
                    risk_tier="LOW",
                    kyc_verified=True,
                    two_factor_enabled=True
                ),
                models.User(
                    username="elena_rostova",
                    email="elena.rostova@bankguard.ai",
                    hashed_password=auth.hash_password("BankGuard2026!"),
                    full_name="Elena Rostova",
                    phone="+44 20 7946 0912",
                    account_number="BG-3419-7721-0982",
                    account_tier="User",
                    balance=890000.00,
                    currency="USD",
                    role="User",
                    risk_tier="LOW",
                    kyc_verified=True,
                    two_factor_enabled=True
                )
            ]
            db.add_all(demo_users)
            db.commit()

            # Seed sample transactions
            first_user = db.query(models.User).first()
            sample_txs = [
                models.Transaction(
                    reference_id=generate_reference_id(),
                    user_id=first_user.id,
                    amount=45000.00,
                    currency="USD",
                    channel="SWIFT",
                    sender="BankGuard Liquidity Vault London",
                    recipient="Nordic Clearnet Stockholm",
                    location="London, UK",
                    ip_address="194.28.112.45",
                    device_fingerprint="BankGuard-Hardware-HSM-01",
                    risk_score=4.8,
                    decision="AUTO_CLEARED",
                    anomaly_reasons="Normal institutional velocity, verified ISO-20022 clearing gateway"
                ),
                models.Transaction(
                    reference_id=generate_reference_id(),
                    user_id=first_user.id,
                    amount=184000.00,
                    currency="USD",
                    channel="WIRE",
                    sender="BankGuard Liquidity Vault London",
                    recipient="Offshore Gateway Belize",
                    location="Belize City, BZ",
                    ip_address="185.220.101.5",
                    device_fingerprint="Unknown Linux Browser",
                    risk_score=87.6,
                    decision="STEP_UP_MFA",
                    anomaly_reasons="Geo-hop velocity anomaly (>8,000km/h), Tor exit node IP, high entropy payload"
                ),
                models.Transaction(
                    reference_id=generate_reference_id(),
                    user_id=first_user.id,
                    amount=950000.00,
                    currency="USD",
                    channel="ACH",
                    sender="Tier1 Capital Treasury",
                    recipient="Syndicate Liquidity Fund",
                    location="Zurich, CH",
                    ip_address="195.176.255.9",
                    device_fingerprint="Zurich Terminal 4B",
                    risk_score=12.2,
                    decision="AUTO_CLEARED",
                    anomaly_reasons="Whitelisted corporate counterparty, verified multi-sig keys"
                )
            ]
            db.add_all(sample_txs)
            db.commit()
    except Exception as e:
        print(f"Startup DB init warning (fallback mode active): {e}")

@app.get("/")
def root():
    return {
        "system": "Bank Guard AI Anomaly Detection & Banking API",
        "version": "2.4.0",
        "status": "ONLINE",
        "database": "PostgreSQL (pgAdmin4 localhost ready)"
    }

# ================= AUTHENTICATION ENDPOINTS =================

@app.post("/api/auth/signup", response_model=schemas.TokenResponse)
def sign_up(req: schemas.SignUpRequest, db: Session = Depends(get_db)):
    # Check if user with email or username already exists
    existing_email = db.query(models.User).filter(models.User.email == req.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    clean_username = req.username.strip().lower()
    existing_user = db.query(models.User).filter(models.User.username == clean_username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken. Please choose another."
        )

    # Public registration allows User or Analyst (Admin cannot be created publicly)
    allowed_roles = ["User", "Analyst"]
    assigned_role = req.role if req.role in allowed_roles else "User"

    account_num = generate_account_number()
    while db.query(models.User).filter(models.User.account_number == account_num).first():
        account_num = generate_account_number()

    hashed_pw = auth.hash_password(req.password)

    new_user = models.User(
        username=clean_username,
        email=req.email.lower(),
        hashed_password=hashed_pw,
        full_name=req.full_name,
        phone=req.phone or "+1 (555) 019-2834",
        account_number=account_num,
        account_tier="Standard",
        balance=150000.00,
        currency="USD",
        role=assigned_role,
        risk_tier="LOW",
        kyc_verified=True,
        two_factor_enabled=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log security audit
    audit = models.SecurityAudit(
        user_id=new_user.id,
        action="USER_REGISTERED",
        ip_address="127.0.0.1",
        user_agent="BankGuard Web Client",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    token = auth.create_access_token(data={"sub": new_user.id, "email": new_user.email, "username": new_user.username, "role": new_user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/api/auth/signin", response_model=schemas.TokenResponse)
def sign_in(req: schemas.SignInRequest, db: Session = Depends(get_db)):
    ident = req.identifier.strip().lower()
    
    # Check by email or username or account number
    user = db.query(models.User).filter(
        (models.User.email == ident) | (models.User.username == ident) | (models.User.account_number == req.identifier.strip())
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. No user found with this email or username."
        )

    if not auth.verify_password(req.password, user.hashed_password):
        audit = models.SecurityAudit(
            user_id=user.id,
            action="SIGNIN_FAILED",
            ip_address="127.0.0.1",
            status="REJECTED_PASSWORD"
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please check your credentials."
        )

    # Update last login
    user.last_login = datetime.utcnow()
    audit = models.SecurityAudit(
        user_id=user.id,
        action="SIGNIN_SUCCESS",
        ip_address="127.0.0.1",
        user_agent="BankGuard Web Client",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    token = auth.create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(user: models.User = Depends(auth.get_current_user)):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token expired or missing."
        )
    return user

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
            "badge": "Risk Ops Level-3"
        },
        {
            "name": "Elena Rostova",
            "email": "elena.rostova@bankguard.ai",
            "password": "BankGuard2026!",
            "role": "Institutional Client",
            "account_tier": "Premier Business",
            "account_number": "BG-3419-7721-0982",
            "badge": "Tier-1 Treasury"
        },
        {
            "name": "David Miller",
            "email": "david.miller@audits.bankguard.ai",
            "password": "BankGuardAudit2026!",
            "role": "Compliance Auditor",
            "account_tier": "Tier-1 Checking",
            "account_number": "BG-1094-5582-3490",
            "badge": "GDPR / Basel III"
        }
    ]

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
        "transaction_count": tx_count
    }

@app.post("/api/db/connect")
def test_and_connect_db(req: schemas.DbConfigRequest):
    new_url = f"postgresql://{req.user}:{req.password}@{req.host}:{req.port}/{req.db}"
    success, msg = init_engine(new_url)
    if success:
        # Create all tables on the newly connected PostgreSQL database
        Base.metadata.create_all(bind=engine)
        startup_event()
        return {"status": "SUCCESS", "message": "Successfully connected to PostgreSQL! Tables and seeds synchronized.", "url": f"{req.user}@{req.host}:{req.port}/{req.db}"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not connect to PostgreSQL: {msg}. Please check your password in pgAdmin 4 or create database '{req.db}'."
        )

@app.post("/api/db/init")
def initialize_database_schema(db: Session = Depends(get_db)):
    try:
        Base.metadata.create_all(bind=engine)
        startup_event()
        return {
            "status": "SUCCESS",
            "message": "Database schema and seed users successfully initialized in PostgreSQL!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ================= TRANSACTIONS & ANOMALY DETECTION =================

@app.get("/api/transactions")
def list_transactions(limit: int = 25, db: Session = Depends(get_db)):
    txs = db.query(models.Transaction).order_by(models.Transaction.id.desc()).limit(limit).all()
    return txs

@app.post("/api/transactions/analyze")
def analyze_transaction(req: schemas.TransactionCreate, db: Session = Depends(get_db)):
    # AI Heuristic & Anomaly Scoring calculation
    base_score = 3.5
    anomaly_factors = []

    if req.amount > 100000:
        base_score += 35.0
        anomaly_factors.append(f"High-value transfer (${req.amount:,.2f}) exceeding velocity baseline")
    elif req.amount > 25000:
        base_score += 15.0
        anomaly_factors.append(f"Elevated transaction volume (${req.amount:,.2f})")

    if req.channel in ["ATM", "UPI"] and req.amount > 10000:
        base_score += 28.0
        anomaly_factors.append(f"Unusual volume for retail channel ({req.channel})")

    if "Offshore" in req.recipient or "Belize" in req.location or "Cayman" in req.location:
        base_score += 38.0
        anomaly_factors.append("High-risk jurisdiction routing / Non-FATF compliant gateway")

    risk_score = min(99.4, max(1.2, base_score + (random.random() * 5.0 - 2.5)))

    if risk_score >= 75.0:
        decision = "BLOCKED_FROZEN" if risk_score > 90.0 else "STEP_UP_MFA"
    else:
        decision = "AUTO_CLEARED"

    reasons_str = "; ".join(anomaly_factors) if anomaly_factors else "Normal velocity, trusted baseline geo-location"

    # Persist transaction
    new_tx = models.Transaction(
        reference_id=generate_reference_id(),
        amount=req.amount,
        currency=req.currency or "USD",
        channel=req.channel or "SWIFT",
        sender=req.sender,
        recipient=req.recipient,
        location=req.location or "Zurich, CH",
        ip_address=req.ip_address or "192.168.1.100",
        risk_score=round(risk_score, 1),
        decision=decision,
        anomaly_reasons=reasons_str
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
        "created_at": new_tx.created_at
    }

@app.get("/api/security/audits")
def get_security_audits(limit: int = 15, db: Session = Depends(get_db)):
    return db.query(models.SecurityAudit).order_by(models.SecurityAudit.id.desc()).limit(limit).all()
