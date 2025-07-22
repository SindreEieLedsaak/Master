from backend.mongodb.MongoDB import get_db_connection
from bson import ObjectId
from datetime import datetime
from typing import List, Dict, Optional

class SuggestionService:
    def __init__(self):
        self.db = get_db_connection("students")
        self.collection = self.db["suggested_tasks"]

    def get_all_for_student(self, student_id: str) -> List[Dict]:
        """Fetches all suggestions for a given student."""
        suggestions = self.collection.find({"student_id": student_id})
        return list(suggestions)

    def get_one(self, suggestion_id: str) -> Optional[Dict]:
        """Fetches a single suggestion by its ID."""
        return self.collection.find_one({"_id": ObjectId(suggestion_id)})

    def create(self, student_id: str, suggestion_text: str) -> Dict:
        """Creates a new suggestion for a student."""
        new_suggestion = {
            "student_id": student_id,
            "suggestion": suggestion_text,
            "created_at": datetime.utcnow()
        }
        result = self.collection.insert_one(new_suggestion)
        created = self.get_one(str(result.inserted_id))
        if not created:
            raise Exception("Failed to create suggestion")
        return created

    def update(self, suggestion_id: str, new_text: str) -> Optional[Dict]:
        """Updates the text of a specific suggestion."""
        self.collection.update_one(
            {"_id": ObjectId(suggestion_id)},
            {"$set": {"suggestion": new_text}}
        )
        return self.get_one(suggestion_id)

    def delete(self, suggestion_id: str) -> bool:
        """Deletes a suggestion by its ID."""
        result = self.collection.delete_one({"_id": ObjectId(suggestion_id)})
        return result.deleted_count > 0 