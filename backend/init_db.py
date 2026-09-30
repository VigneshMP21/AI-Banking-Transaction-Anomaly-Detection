import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from database import Base, engine, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB
import models
import auth

def setup_database():
    print("=" * 60)
    print("Bank Guard AI - PostgreSQL & pgAdmin 4 Initializer")
    print("=" * 60)

    print(f"Connecting to PostgreSQL on {POSTGRES_HOST}:{POSTGRES_PORT} as user '{POSTGRES_USER}'...")
    
    try:
        # Step 1: Connect to default postgres database to check/create sample_bank
        conn = psycopg2.connect(
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{POSTGRES_DB}'")
        exists = cursor.fetchone()
        if not exists:
            print(f"Creating database '{POSTGRES_DB}'...")
            cursor.execute(f"CREATE DATABASE {POSTGRES_DB}")
            print(f"Database '{POSTGRES_DB}' created successfully!")
        else:
            print(f"Database '{POSTGRES_DB}' already exists.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Notice during database creation step: {e}")
        print("Continuing with table creation...")

    # Step 2: Create Tables via SQLAlchemy
    try:
        print("Creating tables (users, transactions, security_audits)...")
        Base.metadata.create_all(bind=engine)
        print("All tables successfully initialized!")
        print("PostgreSQL & pgAdmin 4 database is ready for real-time banking!")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    setup_database()
