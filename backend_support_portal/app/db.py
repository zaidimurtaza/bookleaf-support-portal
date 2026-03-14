"""Database connection with pooling"""
import os
from contextlib import contextmanager
from dotenv import load_dotenv
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor

load_dotenv()

_pool = None

def init_db():
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(2, 10,
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT"),
            database=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD")
        )

@contextmanager
def get_db():
    init_db()
    conn = _pool.getconn()
    try:
        yield conn
    finally:
        _pool.putconn(conn)

def query(sql, params=None, one=False):
    with get_db() as conn:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(sql, params)
        if cur.description:
            row = cur.fetchone() if one else cur.fetchall()
            if one:
                return dict(row) if row else None
            return [dict(r) for r in row]
        conn.commit()
        return cur.rowcount
