# 🏦 Bank Guard AI Backend & PostgreSQL Services

This directory contains the FastAPI asynchronous REST API, PostgreSQL database connector for **pgAdmin 4**, JWT cryptographic authentication, and Explainable AI (XAI) risk analysis engine.

---

## 🗄️ PostgreSQL & pgAdmin 4 Localhost Setup Guide

### Step 1: Create Database in pgAdmin 4
1. Open **pgAdmin 4** on your computer.
2. In the left sidebar, expand **Servers** &rarr; **PostgreSQL (Localhost)**.
3. Right-click on **Databases** &rarr; Select **Create** &rarr; **Database...**
4. Set Database name: **`sample_bank`** (or your custom DB name)
5. Click **Save**.

### Step 2: (Option A) Run SQL Script in pgAdmin 4 Query Tool
1. In pgAdmin 4, right-click on your created database.
2. Click **Query Tool**.
3. Open or copy the contents of **[`schema.sql`](file:///d:/Desktop/AI-Banking-Transaction-Anomaly-Detection/backend/schema.sql)**.
4. Press **F5** (or click the Execute ▶ button) to create tables (`users`, `transactions`, `security_audits`) and seed demo records.

### Step 2: (Option B) Automated Python Database Initializer
Alternatively, you can initialize the database automatically via Python:
```bash
python init_db.py
```

---

## 🔑 Environment Configuration (`.env`)

Edit `backend/.env` to match your PostgreSQL credentials:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_pgadmin_password_here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sample_bank

DATABASE_URL=postgresql://postgres:your_pgadmin_password_here@localhost:5432/sample_bank
JWT_SECRET=bankguard_ai_super_secret_institutional_key_2026_xai
```

---

## 🚀 Starting Backend API Server

```bash
# Navigate to backend directory
cd backend

# Start FastAPI server with live reload
python -m uvicorn main:app --reload --port 8000
```

- **Interactive API Docs (Swagger UI)**: `http://localhost:8000/docs`
- **Database Status Endpoint**: `http://localhost:8000/api/db/status`
- **Auth Endpoint**: `http://localhost:8000/api/auth/signin` & `http://localhost:8000/api/auth/signup`

---

## 👥 Seed Demo Credentials for Instant Login

| Role | Username / Email | Password | Account Tier |
| :--- | :--- | :--- | :--- |
| **Chief Risk Analyst** | `alex.vance@bankguard.ai` / `alex_vance` | `BankGuard2026!` | Institutional Vault ($4.85M) |
| **Institutional Client** | `elena.rostova@bankguard.ai` / `elena_rostova` | `BankGuard2026!` | Premier Business (€890K) |
| **Compliance Auditor** | `david.miller@audits.bankguard.ai` / `david_miller` | `BankGuardAudit2026!` | Tier-1 Checking ($250K) |
