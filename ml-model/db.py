import sqlite3

DB_PATH = "risk.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT NOT NULL,
        inputs TEXT NOT NULL,
        risk_percent REAL NOT NULL,
        risk_level TEXT NOT NULL,
        recommendation TEXT,
        status TEXT NOT NULL DEFAULT 'Open',
        created_at TEXT NOT NULL
    )""")
    conn.commit()
    conn.close()