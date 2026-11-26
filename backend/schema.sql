-- ====================================================================
-- BankGuard AI - Banking Transaction Anomaly Detection & Risk Analysis
-- PostgreSQL Database Initialization Script for pgAdmin 4 (India / INR)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS security_audits CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '+91 98400 00000',
    home_city VARCHAR(120) DEFAULT 'Chennai, IN',
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_tier VARCHAR(50) DEFAULT 'Standard',
    balance DOUBLE PRECISION DEFAULT 150000.00,
    currency VARCHAR(10) DEFAULT 'INR',
    role VARCHAR(50) DEFAULT 'User',
    risk_tier VARCHAR(20) DEFAULT 'LOW',
    kyc_verified BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    reference_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipient_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recipient_account VARCHAR(50),
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    channel VARCHAR(30) DEFAULT 'IMPS',
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT 'Chennai, IN',
    ip_address VARCHAR(50) DEFAULT '192.168.1.100',
    device_fingerprint VARCHAR(100) DEFAULT 'BankGuard-Hardware-HSM-01',
    note VARCHAR(255),
    risk_score DOUBLE PRECISION DEFAULT 5.2,
    decision VARCHAR(50) DEFAULT 'AUTO_CLEARED',
    anomaly_reasons TEXT DEFAULT 'Normal velocity, trusted Indian banking corridor',
    shap_factors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_audits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    user_agent VARCHAR(255) DEFAULT 'BankGuard Web Client',
    status VARCHAR(50) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, hashed_password, full_name, phone, home_city, account_number, account_tier, balance, currency, role, risk_tier, kyc_verified, two_factor_enabled)
VALUES 
(
    'alex_vance',
    'alex.vance@bankguard.ai',
    '$2b$12$7kP.U0Mh12g9jL5x4Q6Fye2M7z4zRjM50Oq5dG3oK2f3jJ2f7mIru',
    'Alex Vance',
    '+91 98201 44510',
    'Mumbai, IN',
    'BG-8821-4902-7104',
    'Analyst',
    4850000.00,
    'INR',
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
    '+91 98409 77210',
    'Chennai, IN',
    'BG-3419-7721-0982',
    'Premier Business',
    890000.00,
    'INR',
    'User',
    'LOW',
    TRUE,
    TRUE
);

INSERT INTO transactions (reference_id, user_id, amount, currency, channel, sender, recipient, location, ip_address, device_fingerprint, risk_score, decision, anomaly_reasons)
VALUES
(
    'TX-IN892401',
    1,
    450000.00,
    'INR',
    'RTGS',
    'Alex Vance',
    'NPCI Settlement Clearing Bengaluru',
    'Mumbai, IN',
    '103.21.124.45',
    'BankGuard-Hardware-HSM-01',
    4.8,
    'AUTO_CLEARED',
    'Normal institutional velocity, verified RBI RTGS clearing gateway'
),
(
    'TX-IN491022',
    1,
    184000.00,
    'INR',
    'IMPS',
    'Alex Vance',
    'Unverified Offshore Proxy Gateway',
    'Unknown Proxy Node',
    '185.220.101.5',
    'Unknown Linux Browser',
    87.6,
    'BLOCKED_FROZEN',
    'Geo-hop velocity anomaly, Tor exit node IP, unverified beneficiary endpoint'
);

INSERT INTO security_audits (user_id, action, ip_address, user_agent, status)
VALUES
(1, 'SYSTEM_PROVISIONED', '127.0.0.1', 'pgAdmin 4 Initializer', 'SUCCESS');
