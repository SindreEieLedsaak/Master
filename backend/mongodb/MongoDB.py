from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "MasterUIB")

def get_db_connection(db_name=None):
    """Get MongoDB client connection"""
    client = MongoClient(MONGO_URI)
    if db_name:
        return client[db_name]
    return client[DB_NAME]

def get_collection(collection_name, db):
    """Get collection for specific student"""
    return db[collection_name]



# Create a new client and connect to the serve

