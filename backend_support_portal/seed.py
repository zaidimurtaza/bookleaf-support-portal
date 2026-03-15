"""Seed sample data"""
import json
import bcrypt
from app.db import query
import logging

logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


try:
    admin_password = hash_password("admin123")
    logger.info("✓ Data seeded! Admin password: ", admin_password)
except Exception as e:
    logger.error(f"✗ Error during seeding: {e}")


with open("../bookleaf_sample_data.json") as f:
    data = json.load(f)

for author in data["authors"]:
    query(
        "INSERT INTO bookleaf.users (user_id, name, email, password_hash, role) VALUES (%s, %s, %s, %s, 'author') ON CONFLICT DO NOTHING",
        (author["author_id"], author["name"], author["email"], hash_password("password123"))
    )
    
    for book in author["books"]:
        query(
            "INSERT INTO bookleaf.books (book_id, author_id, title, isbn, genre, status, mrp, total_copies_sold, royalty_paid, royalty_pending) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
            (book["book_id"], author["author_id"], book["title"], book.get("isbn"), book.get("genre"), 
             book["status"], book.get("mrp"), book.get("total_copies_sold", 0), 
             book.get("royalty_paid", 0), book.get("royalty_pending", 0))
        )

logger.info("✓ Data seeded!")
logger.info("\nLogin:")
logger.info("  Admin: admin@bookleaf.com / admin123")
logger.info("  Author: priya.sharma@email.com / password123")
