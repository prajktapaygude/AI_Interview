import os
import uuid
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, DuplicateKeyError
from dotenv import load_dotenv
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI") 
if not MONGO_URI:
    MONGO_URI = "mongodb+srv://alijakazi12005:Alija%401405@cluster0.mogy2km.mongodb.net/?appName=Cluster0"

# Connection settings
CONNECTION_TIMEOUT_MS = 5000
SOCKET_TIMEOUT_MS = 30000

# Global variables
client = None
db = None
interview_collection = None
user_interviews_collection = None
client_connected = False

# ========== MONGODB CONNECTION ==========
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=CONNECTION_TIMEOUT_MS,
        socketTimeoutMS=SOCKET_TIMEOUT_MS,
        connectTimeoutMS=CONNECTION_TIMEOUT_MS
    )
    
    client.server_info()
    logger.info("✅ Successfully connected to MongoDB Atlas")
    
    # Use your "test" database
    db = client["test"]
    
    # Collections
    interview_collection = db["interviews"]
    user_interviews_collection = db["user_interviews"]
    
    # Drop existing indexes to recreate them properly
    try:
        interview_collection.drop_indexes()
        user_interviews_collection.drop_indexes()
    except:
        pass  # Indexes might not exist yet
    
    # Create indexes WITHOUT unique constraint if you want to allow nulls
    # Or ensure your code always provides unique values
    interview_collection.create_index("interview_id", unique=False)  # Changed to False
    interview_collection.create_index([("user_id", 1), ("created_at", -1)])
    interview_collection.create_index("created_at")
    interview_collection.create_index("status")
    
    user_interviews_collection.create_index("user_id", unique=False)  # Changed to False
    user_interviews_collection.create_index([("user_id", 1), ("last_interview_date", -1)])
    
    logger.info("✅ Database indexes created successfully")
    client_connected = True
    
except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
    logger.warning(f"❌ MongoDB connection failed: {e}")
    client_connected = False
    
    # ========== IN-MEMORY FALLBACK ==========
    fallback_interviews = []
    fallback_user_interviews = []
    
    class MockCollection:
        def __init__(self, storage_list):
            self.storage = storage_list
            self.counter = 1
        
        def insert_one(self, document):
            # Generate ID if not present
            if '_id' not in document:
                document['_id'] = self.counter
                self.counter += 1
            self.storage.append(document.copy())
            
            class MockResult:
                def __init__(self, inserted_id):
                    self.inserted_id = inserted_id
            
            return MockResult(document.get('_id'))
        
        def find_one(self, query):
            for doc in self.storage:
                match = True
                for key, value in query.items():
                    if doc.get(key) != value:
                        match = False
                        break
                if match:
                    return doc.copy()
            return None
        
        def find(self, filter_query=None):
            results = self.storage.copy()
            if filter_query:
                filtered = []
                for doc in results:
                    match = True
                    for key, value in filter_query.items():
                        if doc.get(key) != value:
                            match = False
                            break
                    if match:
                        filtered.append(doc.copy())
                results = filtered
            
            class MockCursor:
                def __init__(self, data):
                    self.data = data
                
                def sort(self, key, direction):
                    reverse = (direction == -1)
                    self.data.sort(key=lambda x: x.get(key, datetime.min), reverse=reverse)
                    return self
                
                def limit(self, n):
                    self.data = self.data[:n]
                    return self
                
                def __iter__(self):
                    return iter(self.data)
            
            return MockCursor(results)
        
        def update_one(self, query, update):
            for doc in self.storage:
                match = True
                for key, value in query.items():
                    if doc.get(key) != value:
                        match = False
                        break
                if match:
                    if '$set' in update:
                        doc.update(update['$set'])
                    if '$inc' in update:
                        for inc_key, inc_value in update['$inc'].items():
                            doc[inc_key] = doc.get(inc_key, 0) + inc_value
                    if '$push' in update:
                        for push_key, push_value in update['$push'].items():
                            if push_key not in doc:
                                doc[push_key] = []
                            doc[push_key].append(push_value)
                    
                    class MockResult:
                        def __init__(self, modified_count):
                            self.modified_count = modified_count
                    
                    return MockResult(1)
            
            class MockResult:
                def __init__(self, modified_count):
                    self.modified_count = modified_count
            
            return MockResult(0)
        
        def delete_one(self, query):
            for i, doc in enumerate(self.storage):
                match = True
                for key, value in query.items():
                    if doc.get(key) != value:
                        match = False
                        break
                if match:
                    del self.storage[i]
                    
                    class MockResult:
                        def __init__(self, deleted_count):
                            self.deleted_count = deleted_count
                    
                    return MockResult(1)
            
            class MockResult:
                def __init__(self, deleted_count):
                    self.deleted_count = deleted_count
            
            return MockResult(0)
        
        def count_documents(self, filter_query=None):
            if not filter_query:
                return len(self.storage)
            
            count = 0
            for doc in self.storage:
                match = True
                for key, value in filter_query.items():
                    if doc.get(key) != value:
                        match = False
                        break
                if match:
                    count += 1
            return count
    
    interview_collection = MockCollection(fallback_interviews)
    user_interviews_collection = MockCollection(fallback_user_interviews)

logger.info(f"Database ready ({'MongoDB Atlas - test DB' if client_connected else 'In-memory fallback'})")

# ========== HELPER FUNCTIONS ==========

def generate_interview_id() -> str:
    """Generate a unique interview ID"""
    return f"INT_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"

def test_connection() -> bool:
    """Test if MongoDB connection is active"""
    if client and client_connected:
        try:
            client.server_info()
            logger.info("MongoDB connection is active")
            return True
        except Exception as e:
            logger.error(f"MongoDB connection test failed: {e}")
            return False
    return False

def convert_objectids(data: Any) -> Any:
    """Convert ObjectId to string for JSON serialization"""
    if isinstance(data, dict):
        return {key: convert_objectids(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_objectids(item) for item in data]
    elif isinstance(data, ObjectId):
        return str(data)
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data

# ========== INTERVIEW STORAGE FUNCTIONS ==========

def store_completed_interview(
    interview_id: str,  # Make sure this is provided by your backend
    user_id: str,  # Make sure this is provided by your backend
    questions: List[str],
    answers: List[str],
    feedback: Optional[List[Dict]] = None,
    scores: Optional[Dict[str, float]] = None,
    overall_score: Optional[float] = None,
    duration_seconds: Optional[int] = None
) -> bool:
    """
    Store a completed interview with all answers, evaluation, and feedback
    
    IMPORTANT: Make sure interview_id and user_id are NEVER None/null
    """
    # Validate required fields
    if not interview_id:
        logger.error("❌ interview_id cannot be None or empty!")
        interview_id = generate_interview_id()  # Generate fallback ID
        logger.info(f"Generated fallback interview_id: {interview_id}")
    
    if not user_id:
        logger.error("❌ user_id cannot be None or empty!")
        user_id = "anonymous_user"  # Fallback user ID
        logger.info(f"Using fallback user_id: {user_id}")
    
    try:
        interview_document = {
            "interview_id": interview_id,
            "user_id": user_id,
            "questions": questions,
            "answers": answers,
            "feedback": feedback or [],
            "scores": scores or {},
            "overall_score": overall_score,
            "duration_seconds": duration_seconds,
            "created_at": datetime.utcnow(),
            "status": "completed" if feedback else "pending_evaluation"
        }
        
        # Insert interview document
        try:
            result = interview_collection.insert_one(interview_document)
            logger.info(f"✅ Interview {interview_id} stored successfully for user {user_id}")
        except DuplicateKeyError:
            # If interview_id already exists, generate a new one
            logger.warning(f"⚠️ Interview ID {interview_id} already exists, generating new ID")
            interview_document["interview_id"] = generate_interview_id()
            result = interview_collection.insert_one(interview_document)
            logger.info(f"✅ Interview {interview_document['interview_id']} stored successfully")
        
        # Update user_interviews summary
        user_interviews_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "last_interview_date": datetime.utcnow(),
                    "last_interview_id": interview_document["interview_id"],
                    "last_overall_score": overall_score
                },
                "$inc": {"total_interviews": 1},
                "$push": {
                    "interview_history": {
                        "interview_id": interview_document["interview_id"],
                        "date": datetime.utcnow(),
                        "overall_score": overall_score,
                        "duration_seconds": duration_seconds
                    }
                }
            },
            upsert=True
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to store interview: {e}")
        return False

def get_user_interviews(user_id: str, limit: int = 50) -> List[Dict]:
    """Retrieve all interviews for a specific user"""
    if not user_id:
        logger.warning("user_id is None, returning empty list")
        return []
    
    try:
        interviews = list(
            interview_collection.find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(limit)
        )
        
        interviews = convert_objectids(interviews)
        logger.info(f"Retrieved {len(interviews)} interviews for user {user_id}")
        return interviews
        
    except Exception as e:
        logger.error(f"Failed to retrieve interviews for user {user_id}: {e}")
        return []

def get_interview_details(interview_id: str) -> Optional[Dict]:
    """Retrieve complete details of a specific interview"""
    if not interview_id:
        logger.warning("interview_id is None, returning None")
        return None
    
    try:
        interview = interview_collection.find_one({"interview_id": interview_id})
        
        if interview:
            interview = convert_objectids(interview)
            logger.info(f"Retrieved interview {interview_id}")
            return interview
        else:
            logger.warning(f"Interview {interview_id} not found")
            return None
            
    except Exception as e:
        logger.error(f"Failed to retrieve interview {interview_id}: {e}")
        return None

def update_interview_feedback(
    interview_id: str,
    feedback: List[Dict],
    scores: Dict[str, float],
    overall_score: float
) -> bool:
    """Update an existing interview with AI-generated feedback and scores"""
    if not interview_id:
        logger.error("❌ interview_id cannot be None!")
        return False
    
    try:
        result = interview_collection.update_one(
            {"interview_id": interview_id},
            {
                "$set": {
                    "feedback": feedback,
                    "scores": scores,
                    "overall_score": overall_score,
                    "evaluated_at": datetime.utcnow(),
                    "status": "evaluated"
                }
            }
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ Feedback updated for interview {interview_id}")
            
            # Also update user_interviews summary
            interview = interview_collection.find_one({"interview_id": interview_id})
            if interview and interview.get("user_id"):
                user_interviews_collection.update_one(
                    {"user_id": interview["user_id"]},
                    {
                        "$set": {
                            "last_overall_score": overall_score,
                            "last_evaluation_date": datetime.utcnow()
                        }
                    }
                )
            
            return True
        else:
            logger.warning(f"Interview {interview_id} not found for feedback update")
            return False
            
    except Exception as e:
        logger.error(f"Failed to update feedback for interview {interview_id}: {e}")
        return False

def get_user_statistics(user_id: str) -> Dict:
    """Get interview statistics for a user"""
    if not user_id:
        logger.warning("user_id is None, returning empty stats")
        return {}
    
    try:
        user_data = user_interviews_collection.find_one({"user_id": user_id})
        
        if user_data:
            user_data = convert_objectids(user_data)
            
            total_score = 0
            score_count = 0
            for interview in user_data.get("interview_history", []):
                if interview.get("overall_score"):
                    total_score += interview["overall_score"]
                    score_count += 1
            
            avg_score = total_score / score_count if score_count > 0 else 0
            
            return {
                "user_id": user_id,
                "total_interviews": user_data.get("total_interviews", 0),
                "average_score": avg_score,
                "last_interview_date": user_data.get("last_interview_date"),
                "last_overall_score": user_data.get("last_overall_score"),
                "interview_history": user_data.get("interview_history", [])
            }
        else:
            return {
                "user_id": user_id,
                "total_interviews": 0,
                "average_score": 0,
                "last_interview_date": None,
                "last_overall_score": None,
                "interview_history": []
            }
            
    except Exception as e:
        logger.error(f"Failed to get statistics for user {user_id}: {e}")
        return {}

def delete_interview(interview_id: str) -> bool:
    """Delete an interview by ID"""
    if not interview_id:
        logger.error("❌ interview_id cannot be None!")
        return False
    
    try:
        interview = interview_collection.find_one({"interview_id": interview_id})
        result = interview_collection.delete_one({"interview_id": interview_id})
        
        if result.deleted_count > 0 and interview:
            logger.info(f"✅ Deleted interview {interview_id}")
            return True
        else:
            logger.warning(f"Interview {interview_id} not found for deletion")
            return False
            
    except Exception as e:
        logger.error(f"Failed to delete interview {interview_id}: {e}")
        return False

# ========== FIX FOR YOUR BACKEND ENDPOINTS ==========

def save_evaluation_to_db(
    user_id: str,
    question: str,
    answer: str,
    evaluation_result: Dict,
    interview_id: Optional[str] = None
) -> bool:
    """
    Save individual question evaluation to database
    This is likely what your /evaluate endpoint is calling
    """
    # Generate IDs if not provided
    if not interview_id:
        interview_id = generate_interview_id()
        logger.info(f"Generated new interview_id: {interview_id}")
    
    if not user_id or user_id == "null" or user_id == "None":
        user_id = f"anonymous_{uuid.uuid4().hex[:8]}"
        logger.info(f"Generated new user_id: {user_id}")
    
    try:
        # Check if interview already exists
        existing = interview_collection.find_one({"interview_id": interview_id})
        
        if existing:
            # Update existing interview with new question-answer pair
            result = interview_collection.update_one(
                {"interview_id": interview_id},
                {
                    "$push": {
                        "questions": question,
                        "answers": answer,
                        "feedback": evaluation_result
                    },
                    "$set": {
                        "last_updated": datetime.utcnow()
                    }
                }
            )
            logger.info(f"✅ Updated interview {interview_id} with new evaluation")
        else:
            # Create new interview document
            interview_doc = {
                "interview_id": interview_id,
                "user_id": user_id,
                "questions": [question],
                "answers": [answer],
                "feedback": [evaluation_result],
                "scores": {
                    "score": evaluation_result.get("score", 0),
                    "relevance_score": evaluation_result.get("relevance_score", 0),
                    "accuracy_score": evaluation_result.get("accuracy_score", 0),
                    "communication_score": evaluation_result.get("communication_score", 0)
                },
                "overall_score": evaluation_result.get("score", 0),
                "created_at": datetime.utcnow(),
                "status": "evaluated"
            }
            interview_collection.insert_one(interview_doc)
            logger.info(f"✅ Created new interview {interview_id} with evaluation")
        
        return True
        
    except DuplicateKeyError as e:
        logger.error(f"Duplicate key error: {e}")
        # Retry with new ID
        new_id = generate_interview_id()
        logger.info(f"Retrying with new interview_id: {new_id}")
        return save_evaluation_to_db(user_id, question, answer, evaluation_result, new_id)
    except Exception as e:
        logger.error(f"Failed to save evaluation: {e}")
        return False

# ========== EXAMPLE USAGE ==========

if __name__ == "__main__":
    print(f"Connection status: {'Connected to Atlas' if test_connection() else 'Using fallback'}")
    print(f"Database name: {'test' if db else 'None'}")
    
    # Test with proper IDs
    test_user_id = "test_user_123"
    test_interview_id = generate_interview_id()
    
    # Test storing an interview
    success = store_completed_interview(
        interview_id=test_interview_id,
        user_id=test_user_id,
        questions=["What is React?", "Explain useState hook"],
        answers=["React is a UI library", "useState manages component state"],
        feedback=[{"score": 8}, {"score": 7}],
        overall_score=75
    )
    print(f"Interview stored: {success}")
    
    # Test retrieving
    interviews = get_user_interviews(test_user_id)
    print(f"Found {len(interviews)} interviews")
    
    # Test the save_evaluation function (what your /evaluate endpoint likely uses)
    eval_success = save_evaluation_to_db(
        user_id=test_user_id,
        question="What is your experience?",
        answer="5 years of experience",
        evaluation_result={"score": 8, "feedback": "Good answer"},
        interview_id=test_interview_id
    )
    print(f"Evaluation saved: {eval_success}")