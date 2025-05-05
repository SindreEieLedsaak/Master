from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection info
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "student_projects")

def get_db_connection():
    """Get MongoDB client connection"""
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def get_student_collection(student_id):
    """Get collection for specific student"""
    db = get_db_connection()
    return db[f"student_{student_id}"]