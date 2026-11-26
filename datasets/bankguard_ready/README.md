# BankGuard AI — Prepared Datasets Directory (`datasets/bankguard_ready/`)

Generated automatically with **strictly disjoint** Train & Blind Test splits (zero overlap/leakage).

| File Name | Rows | Fraud Rows (Rate) | Target Column | Recommended Usage |
| :--- | ---: | ---: | :--- | :--- |
| `01_portal_ready_indian_transactions_train.csv` | 25,000 | 1,600 (6.40%) | `is_fraud` | **Primary Training (Portal-Ready + Live TreeSHAP + Adversarial Suite)** |
| `01_portal_ready_indian_transactions_blind_test.csv` | 6,000 | 420 (7.00%) | `is_fraud` | Testing Lab Mode 2: Labeled Blind Batch Test |
| `01_portal_ready_indian_transactions_unlabeled_test.csv` | 6,000 | N/A | *(none)* | Testing Lab Mode 2: Unlabeled Anomaly Scoring |
| `02_paysim_p2p_train_35k.csv` | 35,000 | 5,800 (16.57%) | `isFraud` | Benchmark Training (Mobile P2P / Transfer Flows) |
| `02_paysim_p2p_blind_test_10k.csv` | 10,000 | 2,413 (24.13%) | `isFraud` | Blind Batch Testing for PaySim-trained model |
| `03_creditcard_ulb_train_20k.csv` | 20,000 | 369 (1.85%) | `Class` | SMOTE & Heavy Imbalance Benchmark Training |
| `03_creditcard_ulb_blind_test_6k.csv` | 6,000 | 123 (2.05%) | `Class` | Blind Batch Testing for ULB model |
| `04_bank_account_fraud_train_30k.csv` | 30,000 | 3,500 (11.67%) | `fraud_bool` | Account Opening / Identity Fraud Training |
| `04_bank_account_fraud_blind_test_10k.csv` | 10,000 | 1,500 (15.00%) | `fraud_bool` | Blind Batch Testing for BAF model |
