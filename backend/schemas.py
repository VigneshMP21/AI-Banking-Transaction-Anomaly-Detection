from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class SignUpRequest(BaseModel):
    full_name: str
    email: EmailStr
    username: str
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: Optional[str] = "User" # User or Analyst
    terms_accepted: Optional[bool] = True

class SignInRequest(BaseModel):
    identifier: str # Email or Username
    password: str
    remember_me: Optional[bool] = False

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    username: Optional[str] = None
    phone: Optional[str] = None
    role: str
    account_number: Optional[str] = None
    account_tier: Optional[str] = "Standard"
    balance: Optional[float] = 150000.00
    currency: Optional[str] = "USD"
    risk_tier: Optional[str] = "LOW"
    kyc_verified: Optional[bool] = True
    created_at: Optional[datetime] = None

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
    currency: Optional[str] = "USD"
    channel: Optional[str] = "SWIFT"
    sender: str
    recipient: str
    location: Optional[str] = "Zurich, Switzerland"
    ip_address: Optional[str] = "192.168.1.100"

class TransactionResponse(BaseModel):
    id: int
    reference_id: str
    amount: float
    currency: str
    channel: str
    sender: str
    recipient: str
    location: str
    risk_score: float
    decision: str
    anomaly_reasons: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
