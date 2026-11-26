from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    home_city = Column(String(120), default="Chennai, IN")
    account_number = Column(String(50), unique=True, index=True, nullable=False)
    account_tier = Column(String(50), default="Tier-1 Checking")
    balance = Column(Float, default=150000.00)
    currency = Column(String(10), default="INR")
    role = Column(String(50), default="User")  # User, Analyst, Admin
    risk_tier = Column(String(20), default="LOW")  # LOW, MODERATE, ELEVATED, CRITICAL
    kyc_verified = Column(Boolean, default=True)
    two_factor_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), onupdate=func.now())

    transactions = relationship(
        "Transaction",
        back_populates="user",
        foreign_keys="Transaction.user_id",
        cascade="all, delete-orphan",
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reference_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    recipient_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    recipient_account = Column(String(50), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    channel = Column(String(30), default="IMPS")  # UPI, IMPS, NEFT, RTGS, POS, ATM
    sender = Column(String(255), nullable=False)
    recipient = Column(String(255), nullable=False)
    location = Column(String(255), default="Chennai, IN")
    ip_address = Column(String(50), default="192.168.1.100")
    device_fingerprint = Column(String(100), default="BankGuard-Hardware-Token-v4")
    note = Column(String(255), nullable=True)
    risk_score = Column(Float, default=5.2)  # 0.0 - 100.0
    decision = Column(String(50), default="AUTO_CLEARED")  # AUTO_CLEARED, STEP_UP_MFA, BLOCKED_FROZEN
    anomaly_reasons = Column(Text, default="Normal velocity, trusted baseline geo-location")
    shap_factors = Column(Text, nullable=True)  # JSON serialized list of feature attributions
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions", foreign_keys=[user_id])


class SecurityAudit(Base):
    __tablename__ = "security_audits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    status = Column(String(50), default="SUCCESS")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
