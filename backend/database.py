import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Default PostgreSQL credentials for pgAdmin 4 localhost
# Can be configured via environment variables
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "sample_bank")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

# Resilient Engine Setup with fallback for graceful onboarding
engine = None
SessionLocal = None
Base = declarative_base()

def get_db_url(user=None, password=None, host=None, port=None, db=None):
    u = user or POSTGRES_USER
    p = password or POSTGRES_PASSWORD
    h = host or POSTGRES_HOST
    pt = port or POSTGRES_PORT
    d = db or POSTGRES_DB
    return f"postgresql://{u}:{p}@{h}:{pt}/{d}"

def init_engine(custom_url=None):
    global engine, SessionLocal
    url = custom_url or DATABASE_URL
    try:
        engine = create_engine(
            url,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={"connect_timeout": 5}
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Connected successfully to PostgreSQL localhost."
    except Exception as e:
        # Fallback to local SQLite so the system never breaks while the user configures pgAdmin
        fallback_url = "sqlite:///./bankguard_fallback.db"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        return False, str(e)

# Initial try
is_connected, conn_message = init_engine()

def get_db():
    global SessionLocal
    if SessionLocal is None:
        init_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
