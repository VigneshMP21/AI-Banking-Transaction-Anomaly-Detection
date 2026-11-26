from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime


class SignUpRequest(BaseModel):
    full_name: str
    email: EmailStr
    username: str
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: Optional[str] = "User"  # User or Analyst
    terms_accepted: Optional[bool] = True


class SignInRequest(BaseModel):
    identifier: str  # Email, Username, or Account Number
    password: str
    remember_me: Optional[bool] = False


class ProfileUpdateRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = None
    home_city: Optional[str] = "Chennai, IN"


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    username: Optional[str] = None
    phone: Optional[str] = None
    home_city: Optional[str] = "Chennai, IN"
    role: str
    account_number: Optional[str] = None
    account_tier: Optional[str] = "Standard"
    balance: Optional[float] = 150000.00
    currency: Optional[str] = "INR"
    risk_tier: Optional[str] = "LOW"
    kyc_verified: Optional[bool] = True
    two_factor_enabled: Optional[bool] = True
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DbConfigRequest(BaseModel):
    user: str = "postgres"
    password: str
    host: str = "localhost"
    port: str = "5432"
    db: str = "sample_bank"


class DbStatusResponse(BaseModel):
    connected: bool
    database_type: str
    host: str
    port: str
    database: str
    message: str
    user_count: int
    transaction_count: int


class TransactionCreate(BaseModel):
    amount: float
    currency: Optional[str] = "INR"
    channel: Optional[str] = "NEFT"
    sender: str
    recipient: str
    location: Optional[str] = "Mumbai, IN"
    ip_address: Optional[str] = "192.168.1.100"


class TransferRequest(BaseModel):
    recipient_identifier: str  # BankGuard Account No, Email, or Beneficiary Name
    amount: float = Field(..., gt=0)
    channel: Optional[str] = "Transfer"
    location: Optional[str] = None
    note: Optional[str] = ""
    device_fingerprint: Optional[str] = "BankGuard Web Client"


class OtpVerifyRequest(BaseModel):
    reference_id: str
    otp_code: str


class TransactionResponse(BaseModel):
    id: int
    reference_id: str
    amount: float
    currency: str
    channel: str
    sender: str
    recipient: str
    recipient_account: Optional[str] = None
    location: str
    note: Optional[str] = None
    risk_score: float
    decision: str
    anomaly_reasons: str
    shap_factors: Optional[List[Any]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
