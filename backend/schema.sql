-- ====================================================================
-- BankGuard AI - Banking Transaction Anomaly Detection & Risk Analysis
-- PostgreSQL Database Initialization Script for pgAdmin 4
-- ====================================================================

-- Connect to sample_bank database in pgAdmin 4 Query Tool before running the below script:

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables for fresh setup (Optional)
DROP TABLE IF EXISTS security_audits CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Users Table (Real-Time Banking Accounts & Profiles)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '+1 (555) 019-2834',
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_tier VARCHAR(50) DEFAULT 'Standard',
    balance DOUBLE PRECISION DEFAULT 150000.00,
    currency VARCHAR(10) DEFAULT 'USD',
    role VARCHAR(50) DEFAULT 'User', -- 'User', 'Analyst', 'Admin'
    risk_tier VARCHAR(20) DEFAULT 'LOW',  -- 'LOW', 'MODERATE', 'ELEVATED', 'CRITICAL'
    kyc_verified BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 3. Transactions Table (Real-time Payment Stream & XAI Risk Scores)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    reference_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    channel VARCHAR(30) DEFAULT 'SWIFT', -- 'SWIFT', 'POS', 'ATM', 'UPI', 'ACH', 'WIRE'
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT 'London, UK',
    ip_address VARCHAR(50) DEFAULT '192.168.1.100',
    device_fingerprint VARCHAR(100) DEFAULT 'BankGuard-Hardware-HSM-01',
    risk_score DOUBLE PRECISION DEFAULT 5.2,
    decision VARCHAR(50) DEFAULT 'AUTO_CLEARED', -- 'AUTO_CLEARED', 'STEP_UP_MFA', 'BLOCKED_FROZEN'
    anomaly_reasons TEXT DEFAULT 'Normal velocity, trusted baseline geo-location',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Security Audits Table
CREATE TABLE security_audits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    user_agent VARCHAR(255) DEFAULT 'BankGuard Web Client',
    status VARCHAR(50) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed Initial Banking Accounts
INSERT INTO users (username, email, hashed_password, full_name, phone, account_number, account_tier, balance, currency, role, risk_tier, kyc_verified, two_factor_enabled)
VALUES 
(
    'alex_vance',
    'alex.vance@bankguard.ai',
    '$2b$12$7kP.U0Mh12g9jL5x4Q6Fye2M7z4zRjM50Oq5dG3oK2f3jJ2f7mIru',
    'Alex Vance',
    '+1 (555) 234-8901',
    'BG-8821-4902-7104',
    'Analyst',
    4850000.00,
    'USD',
    'Analyst',
    'LOW',
    TRUE,
    TRUE
),
(
    'elena_rostova',
    'elena.rostova@bankguard.ai',
    '$2b$12$7kP.U0Mh12g9jL5x4Q6Fye2M7z4zRjM50Oq5dG3oK2f3jJ2f7mIru',
    'Elena Rostova',
    '+44 20 7946 0912',
    'BG-3419-7721-0982',
    'User',
    890000.00,
    'USD',
    'User',
    'LOW',
    TRUE,
    TRUE
);

-- 6. Seed Sample Transactions
INSERT INTO transactions (reference_id, user_id, amount, currency, channel, sender, recipient, location, ip_address, device_fingerprint, risk_score, decision, anomaly_reasons)
VALUES
(
    'TX-LN892401',
    1,
    45000.00,
    'USD',
    'SWIFT',
    'BankGuard Liquidity London',
    'Nordic Clearnet Stockholm',
    'London, UK',
    '194.28.112.45',
    'BankGuard-Hardware-HSM-01',
    4.8,
    'AUTO_CLEARED',
    'Normal institutional velocity, verified ISO-20022 clearing gateway'
),
(
    'TX-BZ491022',
    1,
    184000.00,
    'USD',
    'WIRE',
    'BankGuard Liquidity London',
    'Offshore Gateway Belize',
    'Belize City, BZ',
    '185.220.101.5',
    'Unknown Linux Browser',
    87.6,
    'STEP_UP_MFA',
    'Geo-hop velocity anomaly (>8,000km/h), Tor exit node IP, high entropy payload'
);

-- 7. Seed Sample Security Audit
INSERT INTO security_audits (user_id, action, ip_address, user_agent, status)
VALUES
(1, 'SYSTEM_PROVISIONED', '127.0.0.1', 'pgAdmin 4 Initializer', 'SUCCESS');

-- Verify Seed Records
SELECT id, username, email, full_name, role FROM users;
SELECT id, reference_id, amount, risk_score, decision FROM transactions;
