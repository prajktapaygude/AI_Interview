# import os
# import re
# from dotenv import load_dotenv
# load_dotenv()

# from fastapi.responses import FileResponse
# from fastapi import FastAPI, HTTPException, UploadFile, File
# from fastapi.staticfiles import StaticFiles
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, Field
# from typing import Optional, List, Any

# from interview import generate_questions
# from evaluation import evaluate_answer, evaluate_all_answers, generate_single_question
# from database import interview_collection, user_interviews_collection
# from tts import generate_speech
# from stt import speech_to_text
# from datetime import datetime

# app = FastAPI()

# # ===================================
# # CORS
# # ===================================
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ===================================
# # STATIC + AUDIO
# # ===================================
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# STATIC_DIR = os.path.join(BASE_DIR, "static")
# AUDIO_DIR = os.path.join(STATIC_DIR, "audio")

# os.makedirs(AUDIO_DIR, exist_ok=True)

# app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# # ===================================
# # REQUEST MODELS
# # ===================================
# class InterviewRequest(BaseModel):
#     role: str
#     Id: str
#     techStack: Optional[str] = None
#     level: Optional[str] = None
#     difficulty: Optional[str] = None

# class EvaluationRequest(BaseModel):
#     Id: str
#     userId: str = "guest"
#     role: str
#     question: str
#     answer: str

# class TTSRequest(BaseModel):
#     text: str

# class AnalyzeReportRequest(BaseModel):
#     Id: str
#     userId: str = "guest"
#     role: str
#     questions: list
#     answers: list

# class BatchEvaluationRequest(BaseModel):
#     Id: str
#     userId: str = "guest"
#     role: str
#     techStack: Optional[str] = None
#     level: Optional[str] = None
#     questions: list
#     answers: list

# class ContinuousQuestionRequest(BaseModel):
#     role: str
#     Id: str
#     techStack: Optional[str] = None
#     level: Optional[str] = None
#     difficulty: Optional[str] = None
#     askedQuestions: List[str] = Field(default_factory=list)
#     lastAnswer: Optional[str] = None
#     conversationHistory: Optional[List[Any]] = None

# class GetUserStatsRequest(BaseModel):
#     userId: str

# # ===================================
# # ROOT
# # ===================================
# @app.get("/")
# def root():
#     return {"message": "AI Backend Running"}

# # ===================================
# # GENERATE QUESTIONS (batch)
# # ===================================
# @app.post("/generate-questions")
# def generate(data: InterviewRequest):
#     try:
#         print(f"\n📝 Generating questions for:")
#         print(f"   Role: {data.role}")
#         print(f"   Tech Stack: {data.techStack}")
#         print(f"   Level: {data.level}")
#         print(f"   Difficulty: {data.difficulty}")
        
#         questions = generate_questions(
#             role=data.role,
#             tech_stack=data.techStack,
#             level=data.level,
#             difficulty=data.difficulty
#         )

#         if not isinstance(questions, list):
#             questions = [str(questions)]

#         print(f"✅ Generated {len(questions)} questions")
        
#         return {
#             "role": data.role,
#             "questions": questions
#         }

#     except Exception as e:
#         print(f"❌ Error generating questions: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# # ===================================
# # TEXT TO SPEECH
# # ===================================
# @app.post("/tts")
# async def tts(data: TTSRequest):
#     try:
#         filepath = await generate_speech(data.text)
#         return FileResponse(
#             filepath,
#             media_type="audio/mpeg",
#             filename=os.path.basename(filepath)
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ===================================
# # SPEECH TO TEXT
# # ===================================
# @app.post("/stt")
# async def stt(audio: UploadFile = File(...)):
#     try:
#         text = speech_to_text(audio)
#         print("========== SPEECH TO TEXT ==========")
#         print("Transcribed text:", text)
#         return {"text": text}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ===================================
# # BATCH EVALUATE
# # ===================================
# @app.post("/batch-evaluate")
# def batch_evaluate(data: BatchEvaluationRequest):
#     try:
#         print("\n=========== BATCH EVALUATION ===========")
#         print(f"Role: {data.role}")
#         print(f"Tech Stack: {data.techStack}")
#         print(f"Level: {data.level}")
#         print(f"Questions: {len(data.questions)}")
#         print(f"Answers: {len(data.answers)}")
        
#         evaluations = evaluate_all_answers(
#             role=data.role,
#             tech_stack=data.techStack,
#             level=data.level,
#             questions=data.questions,
#             answers=data.answers
#         )
        
#         try:
#             if interview_collection is not None:
#                 for i, eval_result in enumerate(evaluations):
#                     interview_collection.insert_one({
#                         "Id": data.Id,
#                         "userId": data.userId,
#                         "role": data.role,
#                         "question": data.questions[i],
#                         "answer": data.answers[i],
#                         "evaluation": eval_result,
#                         "timestamp": datetime.utcnow(),
#                         "batch_evaluated": True
#                     })
#                 print(f"✅ Saved {len(evaluations)} evaluations to DB")
#         except Exception as db_error:
#             print(f"⚠️ DB insert warning: {db_error}")
        
#         return {"evaluations": evaluations}
#     except Exception as e:
#         print(f"Batch evaluation error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))

# # ===================================
# # GENERATE SINGLE QUESTION (CONTINUOUS MODE)
# # ===================================
# @app.post("/generate-continuous-question")
# async def generate_continuous_question(data: ContinuousQuestionRequest):
#     """
#     Generate a single unique, context-aware question for continuous interview.
#     Now prevents domain mixing by using strict topic enforcement.
#     """
#     try:
#         print("\n=========== CONTINUOUS QUESTION ===========")
#         print(f"Role          : {data.role}")
#         print(f"Tech Stack    : {data.techStack}")
#         print(f"Level         : {data.level}")
#         print(f"Difficulty    : {data.difficulty}")
#         print(f"Asked so far  : {len(data.askedQuestions)} questions")
#         print(f"Last answer   : {data.lastAnswer[:100] if data.lastAnswer else 'None'}")

#         from groq import Groq
#         import os
        
#         client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
#         # Build topic list from asked questions
#         asked_topics = []
#         for q in data.askedQuestions[-5:]:
#             words = q.lower().split()
#             if "react" in words: asked_topics.append("react")
#             if "javascript" in words or "js" in words: asked_topics.append("javascript")
#             if "css" in words: asked_topics.append("css")
#             if "html" in words: asked_topics.append("html")
#             if "api" in words: asked_topics.append("api")
#             if "database" in words: asked_topics.append("database")
#             if "performance" in words: asked_topics.append("performance")
#             if "security" in words: asked_topics.append("security")
#             if "testing" in words: asked_topics.append("testing")
        
#         # Strong system prompt to stay on topic
#         system_prompt = f"""You are an expert interviewer for the **{data.role}** role.
# The candidate's tech stack is **{data.techStack or 'general'}**.
# Level: {data.level or 'mid-level'}. Difficulty: {data.difficulty or 'medium'}.

# STRICT RULES:
# - EVERY question MUST be directly related to {data.techStack or data.role}.
# - NEVER ask generic questions like "How do you learn new tech?" unless {data.role} is about learning.
# - If the user gave a last answer, ask a follow‑up that stays within {data.techStack or data.role}.
# - Do NOT repeat any of the previously asked questions (see list).
# - Keep each question under 20 words, specific, and professional.
# - If no previous questions, start with a core concept in {data.techStack or data.role}.

# Previously asked questions (DO NOT repeat):
# {chr(10).join([f"- {q}" for q in data.askedQuestions[-5:]])}

# Avoided topics (from previous questions): {', '.join(set(asked_topics)) if asked_topics else "none"}
# """
#         messages = [{"role": "system", "content": system_prompt}]
        
#         if data.conversationHistory:
#             messages.extend(data.conversationHistory)
#         elif data.lastAnswer:
#             # Only use lastAnswer if it seems relevant (optional length check)
#             if len(data.lastAnswer) > 20:
#                 messages.append({"role": "user", "content": f"My previous answer was: {data.lastAnswer}"})
        
#         messages.append({"role": "user", "content": f"Generate the next interview question about {data.techStack or data.role}."})
        
#         response = client.chat.completions.create(
#             model="llama-3.3-70b-versatile",
#             messages=messages,
#             temperature=0.6,  # lower temperature for more focused questions
#             max_tokens=150
#         )
        
#         new_question = response.choices[0].message.content.strip()
#         if not new_question.endswith('?'):
#             new_question += '?'
#         print(f"✅ Generated: {new_question}")
#         return {"questions": [new_question]}
        
#     except Exception as e:
#         print(f"❌ Error in /generate-continuous-question: {e}")
#         import traceback
#         traceback.print_exc()
        
#         # ---------- ROLE‑SPECIFIC FALLBACKS (no generic questions) ----------
#         tech = (data.techStack or "").lower()
#         role = (data.role or "").lower()
        
#         # Ancient History specific
#         if "ancient" in role or "history" in role or "egypt" in tech or "history" in tech:
#             fallbacks = [
#                 "What was the significance of the Rosetta Stone?",
#                 "Explain the role of the Nile River in ancient Egyptian civilization.",
#                 "Who was the first pharaoh of unified Egypt?",
#                 "What are the main theories about how the pyramids were built?"
#             ]
#         # Employee Relations / HR specific
#         elif "employee" in role or "hr" in role or "relations" in tech:
#             fallbacks = [
#                 "How would you handle a complaint of workplace harassment?",
#                 "What steps do you take to ensure a fair investigation process?",
#                 "Explain the importance of documentation in employee relations.",
#                 "What is your approach to mediating conflict between two employees?"
#             ]
#         # General but still role‑relevant
#         else:
#             fallbacks = [
#                 f"What's a key challenge you've faced with {data.techStack or data.role}?",
#                 f"How do you stay current with developments in {data.techStack or data.role}?",
#                 f"Describe a situation where you had to apply {data.techStack or data.role} knowledge to solve a problem."
#             ]
        
#         # Pick a fallback that hasn't been asked recently
#         for fb in fallbacks:
#             if fb not in data.askedQuestions[-3:]:
#                 return {"questions": [fb]}
#         return {"questions": [fallbacks[0]]}
# # ===================================
# # EVALUATE ANSWER (Single)
# # ===================================
# @app.post("/evaluate")
# def evaluate(data: EvaluationRequest):
#     try:
#         print("\n=========== INTERVIEW EVALUATION ===========")
#         print("Role:", data.role)
#         print("Question:", data.question[:100])
#         print("Answer:", data.answer[:100])

#         evaluation_result = evaluate_answer(
#             role=data.role,
#             question=data.question,
#             answer=data.answer
#         )

#         print("Evaluation Score:", evaluation_result.get("score"))

#         try:
#             if interview_collection is not None:
#                 interview_collection.insert_one({
#                     "Id": data.Id,
#                     "userId": data.userId,
#                     "role": data.role,
#                     "question": data.question,
#                     "answer": data.answer,
#                     "evaluation": evaluation_result,
#                     "timestamp": datetime.utcnow()
#                 })
#                 print(f"✅ Saved evaluation to DB")
#         except Exception as db_error:
#             print(f"⚠️ DB insert warning: {db_error}")

#         return {"evaluation": evaluation_result}

#     except Exception as e:
#         print("Evaluation error:", str(e))
#         import traceback
#         traceback.print_exc()
        
#         return {
#             "evaluation": {
#                 "score": 5,
#                 "strengths": ["Answer was processed"],
#                 "weaknesses": ["Evaluation system encountered an error"],
#                 "improvement": ["Please try again"],
#                 "relevance_score": 5,
#                 "accuracy_score": 5,
#                 "communication_score": 5,
#                 "answer_quality": "average",
#                 "is_gibberish": False
#             }
#         }

# # ===================================
# # ANALYZE REPORT
# # ===================================
# @app.post("/analyze-report")
# def analyze_report(data: AnalyzeReportRequest):
#     try:
#         print("\n=========== ANALYZING INTERVIEW REPORT ===========")
#         print(f"Questions: {len(data.questions)}")
#         print(f"Answers: {len(data.answers)}")

#         evaluations = []
        
#         for i, item in enumerate(data.answers):
#             if isinstance(item, dict):
#                 if "evaluation" in item:
#                     eval_data = item["evaluation"]
#                     if isinstance(eval_data, dict):
#                         if "score" not in eval_data:
#                             eval_data["score"] = 5
#                         if "strengths" not in eval_data:
#                             eval_data["strengths"] = ["Answer provided"]
#                         if "weaknesses" not in eval_data:
#                             eval_data["weaknesses"] = ["Could be more detailed"]
#                         if "improvement" not in eval_data:
#                             eval_data["improvement"] = ["Add specific examples"]
                        
#                         evaluations.append(eval_data)

#         if not evaluations:
#             print("No evaluations found - creating default evaluations")
#             for i, answer in enumerate(data.answers):
#                 default_eval = {
#                     "score": 5,
#                     "strengths": ["Answer was recorded"],
#                     "weaknesses": ["Detailed evaluation pending"],
#                     "improvement": ["Continue practicing"],
#                     "relevance_score": 5,
#                     "accuracy_score": 5,
#                     "communication_score": 5,
#                     "answer_quality": "average",
#                     "is_gibberish": False
#                 }
#                 evaluations.append(default_eval)

#         total_score = sum(e.get("score", 0) for e in evaluations) / len(evaluations) if evaluations else 0
#         total_accuracy = sum(e.get("accuracy_score", 0) for e in evaluations) / len(evaluations) if evaluations else 0
#         total_communication = sum(e.get("communication_score", 0) for e in evaluations) / len(evaluations) if evaluations else 0

#         technical = round(total_accuracy * 10) if total_accuracy > 0 else 0
#         clarity = round(total_score * 10) if total_score > 0 else 0
#         confidence = round(total_communication * 10) if total_communication > 0 else 0
#         overall_score = round((technical + clarity + confidence) / 3) if (technical + clarity + confidence) > 0 else 0

#         report = {
#             "score": overall_score,
#             "technical": technical,
#             "clarity": clarity,
#             "confidence": confidence,
#             "role": data.role,
#             "level": "Mid-Level",
#             "totalQuestions": len(data.questions),
#             "answered": len(data.answers),
#             "evaluations": evaluations,
#             "answers": data.answers
#         }

#         print(f"Report generated: Overall Score: {overall_score}%")
#         return report

#     except Exception as e:
#         print(f"Error generating report: {str(e)}")
#         import traceback
#         traceback.print_exc()
        
#         return {
#             "score": 0,
#             "technical": 0,
#             "clarity": 0,
#             "confidence": 0,
#             "role": data.role,
#             "level": "Mid-Level",
#             "totalQuestions": len(data.questions),
#             "answered": len(data.answers),
#             "evaluations": [],
#             "answers": data.answers
#         }

# # ===================================
# # USER STATS
# # ===================================
# @app.post("/get-user-stats")
# def get_user_stats(data: GetUserStatsRequest):
#     try:
#         if user_interviews_collection is None:
#             return {
#                 "totalInterviews": 0,
#                 "avgScore": 0,
#                 "improvement": 0,
#                 "hoursPracticed": 0,
#                 "recentInterviews": []
#             }

#         complete_interviews = list(user_interviews_collection.find({"userId": data.userId, "complete": True}))
#         total = len(complete_interviews)
        
#         if total > 0:
#             avg = round(sum(i.get("score", 0) for i in complete_interviews) / total)
#             recent = sorted(complete_interviews, key=lambda x: x.get("date", datetime.min), reverse=True)[:5]
#             recent_list = [{"role": i["role"], "score": i["score"], "totalQuestions": i.get("totalQuestions", 0), "answered": i.get("answered", 0), "level": "Mid"} for i in recent]
#         else:
#             recent_list = []
#             avg = 0
        
#         return {
#             "totalInterviews": total,
#             "avgScore": avg,
#             "improvement": 0,
#             "hoursPracticed": round(total * 5 / 60, 1),
#             "recentInterviews": recent_list
#         }

#     except Exception as e:
#         print("Stats error:", e)
#         return {
#             "totalInterviews": 0,
#             "avgScore": 0,
#             "improvement": 0,
#             "hoursPracticed": 0,
#             "recentInterviews": []
#         }/




import os
import re
from dotenv import load_dotenv
load_dotenv()

from fastapi.responses import FileResponse, StreamingResponse
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Any

from interview import generate_questions
from evaluation import evaluate_answer, evaluate_all_answers, generate_single_question
from database import interview_collection, user_interviews_collection
from tts import generate_speech_stream   # <-- changed import
from stt import speech_to_text
from datetime import datetime

app = FastAPI()

# ===================================
# CORS
# ===================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================================
# STATIC FILES (only for frontend assets – no audio storage)
# ===================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
# AUDIO_DIR is NOT created – no audio files will ever be stored.
os.makedirs(STATIC_DIR, exist_ok=True)   # keep if you have other static files (CSS, JS, etc.)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ===================================
# REQUEST MODELS (unchanged)
# ===================================
class InterviewRequest(BaseModel):
    role: str
    Id: str
    techStack: Optional[str] = None
    level: Optional[str] = None
    difficulty: Optional[str] = None

class EvaluationRequest(BaseModel):
    Id: str
    userId: str = "guest"
    role: str
    question: str
    answer: str

class TTSRequest(BaseModel):
    text: str

class AnalyzeReportRequest(BaseModel):
    Id: str
    userId: str = "guest"
    role: str
    questions: list
    answers: list

class BatchEvaluationRequest(BaseModel):
    Id: str
    userId: str = "guest"
    role: str
    techStack: Optional[str] = None
    level: Optional[str] = None
    questions: list
    answers: list

class ContinuousQuestionRequest(BaseModel):
    role: str
    Id: str
    techStack: Optional[str] = None
    level: Optional[str] = None
    difficulty: Optional[str] = None
    askedQuestions: List[str] = Field(default_factory=list)
    lastAnswer: Optional[str] = None
    conversationHistory: Optional[List[Any]] = None

class GetUserStatsRequest(BaseModel):
    userId: str

# ===================================
# ROOT
# ===================================
@app.get("/")
def root():
    return {"message": "AI Backend Running"}

# ===================================
# GENERATE QUESTIONS (batch)
# ===================================
@app.post("/generate-questions")
def generate(data: InterviewRequest):
    try:
        print(f"\n📝 Generating questions for:")
        print(f"   Role: {data.role}")
        print(f"   Tech Stack: {data.techStack}")
        print(f"   Level: {data.level}")
        print(f"   Difficulty: {data.difficulty}")
        
        questions = generate_questions(
            role=data.role,
            tech_stack=data.techStack,
            level=data.level,
            difficulty=data.difficulty
        )

        if not isinstance(questions, list):
            questions = [str(questions)]

        print(f"✅ Generated {len(questions)} questions")
        
        return {
            "role": data.role,
            "questions": questions
        }

    except Exception as e:
        print(f"❌ Error generating questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ===================================
# TEXT TO SPEECH – STREAMING (NO FILE SAVED)
# ===================================
@app.post("/tts")
async def tts(data: TTSRequest):
    try:
        return StreamingResponse(
            generate_speech_stream(data.text),
            media_type="audio/mpeg"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===================================
# SPEECH TO TEXT – GROQ API (NO TEMP FILE)
# ===================================
@app.post("/stt")
async def stt(audio: UploadFile = File(...)):
    try:
        text = speech_to_text(audio)
        print("========== SPEECH TO TEXT ==========")
        print("Transcribed text:", text)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===================================
# BATCH EVALUATE (unchanged)
# ===================================
@app.post("/batch-evaluate")
def batch_evaluate(data: BatchEvaluationRequest):
    try:
        print("\n=========== BATCH EVALUATION ===========")
        print(f"Role: {data.role}")
        print(f"Tech Stack: {data.techStack}")
        print(f"Level: {data.level}")
        print(f"Questions: {len(data.questions)}")
        print(f"Answers: {len(data.answers)}")
        
        evaluations = evaluate_all_answers(
            role=data.role,
            tech_stack=data.techStack,
            level=data.level,
            questions=data.questions,
            answers=data.answers
        )
        
        try:
            if interview_collection is not None:
                for i, eval_result in enumerate(evaluations):
                    interview_collection.insert_one({
                        "Id": data.Id,
                        "userId": data.userId,
                        "role": data.role,
                        "question": data.questions[i],
                        "answer": data.answers[i],
                        "evaluation": eval_result,
                        "timestamp": datetime.utcnow(),
                        "batch_evaluated": True
                    })
                print(f"✅ Saved {len(evaluations)} evaluations to DB")
        except Exception as db_error:
            print(f"⚠️ DB insert warning: {db_error}")
        
        return {"evaluations": evaluations}
    except Exception as e:
        print(f"Batch evaluation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


#-----------------------------------------------------------
from dotenv import load_dotenv
load_dotenv(override=True)   # force reload
print("DEBUG: GROQ_API_KEY =", os.getenv("GROQ_API_KEY"))
# ===================================
# GENERATE SINGLE QUESTION (CONTINUOUS MODE)
# ===================================
@app.post("/generate-continuous-question")
async def generate_continuous_question(data: ContinuousQuestionRequest):
    """
    Generate a single unique, context-aware question for continuous interview.
    Now prevents domain mixing by using strict topic enforcement.
    """
    try:
        print("\n=========== CONTINUOUS QUESTION ===========")
        print(f"Role          : {data.role}")
        print(f"Tech Stack    : {data.techStack}")
        print(f"Level         : {data.level}")
        print(f"Difficulty    : {data.difficulty}")
        print(f"Asked so far  : {len(data.askedQuestions)} questions")
        print(f"Last answer   : {data.lastAnswer[:100] if data.lastAnswer else 'None'}")

        from groq import Groq
        import os
        
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        # Build topic list from asked questions
        asked_topics = []
        for q in data.askedQuestions[-5:]:
            words = q.lower().split()
            if "react" in words: asked_topics.append("react")
            if "javascript" in words or "js" in words: asked_topics.append("javascript")
            if "css" in words: asked_topics.append("css")
            if "html" in words: asked_topics.append("html")
            if "api" in words: asked_topics.append("api")
            if "database" in words: asked_topics.append("database")
            if "performance" in words: asked_topics.append("performance")
            if "security" in words: asked_topics.append("security")
            if "testing" in words: asked_topics.append("testing")
        
        # Strong system prompt to stay on topic
        system_prompt = f"""You are an expert interviewer for the **{data.role}** role.
The candidate's tech stack is **{data.techStack or 'general'}**.
Level: {data.level or 'mid-level'}. Difficulty: {data.difficulty or 'medium'}.

STRICT RULES:
- EVERY question MUST be directly related to {data.techStack or data.role}.
- NEVER ask generic questions like "How do you learn new tech?" unless {data.role} is about learning.
- If the user gave a last answer, ask a follow‑up that stays within {data.techStack or data.role}.
- Do NOT repeat any of the previously asked questions (see list).
- Keep each question under 20 words, specific, and professional.
- If no previous questions, start with a core concept in {data.techStack or data.role}.

Previously asked questions (DO NOT repeat):
{chr(10).join([f"- {q}" for q in data.askedQuestions[-5:]])}

Avoided topics (from previous questions): {', '.join(set(asked_topics)) if asked_topics else "none"}
"""
        messages = [{"role": "system", "content": system_prompt}]
        
        if data.conversationHistory:
            messages.extend(data.conversationHistory)
        elif data.lastAnswer:
            if len(data.lastAnswer) > 20:
                messages.append({"role": "user", "content": f"My previous answer was: {data.lastAnswer}"})
        
        messages.append({"role": "user", "content": f"Generate the next interview question about {data.techStack or data.role}."})
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.6,
            max_tokens=150
        )
        
        new_question = response.choices[0].message.content.strip()
        if not new_question.endswith('?'):
            new_question += '?'
        print(f"✅ Generated: {new_question}")
        return {"questions": [new_question]}
        
    except Exception as e:
        print(f"❌ Error in /generate-continuous-question: {e}")
        import traceback
        traceback.print_exc()
        
        # Fallback questions (unchanged)
        tech = (data.techStack or "").lower()
        role = (data.role or "").lower()
        
        if "ancient" in role or "history" in role or "egypt" in tech or "history" in tech:
            fallbacks = [
                "What was the significance of the Rosetta Stone?",
                "Explain the role of the Nile River in ancient Egyptian civilization.",
                "Who was the first pharaoh of unified Egypt?",
                "What are the main theories about how the pyramids were built?"
            ]
        elif "employee" in role or "hr" in role or "relations" in tech:
            fallbacks = [
                "How would you handle a complaint of workplace harassment?",
                "What steps do you take to ensure a fair investigation process?",
                "Explain the importance of documentation in employee relations.",
                "What is your approach to mediating conflict between two employees?"
            ]
        else:
            fallbacks = [
                f"What's a key challenge you've faced with {data.techStack or data.role}?",
                f"How do you stay current with developments in {data.techStack or data.role}?",
                f"Describe a situation where you had to apply {data.techStack or data.role} knowledge to solve a problem."
            ]
        
        for fb in fallbacks:
            if fb not in data.askedQuestions[-3:]:
                return {"questions": [fb]}
        return {"questions": [fallbacks[0]]}

# ===================================
# EVALUATE ANSWER (Single)
# ===================================
@app.post("/evaluate")
def evaluate(data: EvaluationRequest):
    try:
        print("\n=========== INTERVIEW EVALUATION ===========")
        print("Role:", data.role)
        print("Question:", data.question[:100])
        print("Answer:", data.answer[:100])

        evaluation_result = evaluate_answer(
            role=data.role,
            question=data.question,
            answer=data.answer
        )

        print("Evaluation Score:", evaluation_result.get("score"))

        try:
            if interview_collection is not None:
                interview_collection.insert_one({
                    "Id": data.Id,
                    "userId": data.userId,
                    "role": data.role,
                    "question": data.question,
                    "answer": data.answer,
                    "evaluation": evaluation_result,
                    "timestamp": datetime.utcnow()
                })
                print(f"✅ Saved evaluation to DB")
        except Exception as db_error:
            print(f"⚠️ DB insert warning: {db_error}")

        return {"evaluation": evaluation_result}

    except Exception as e:
        print("Evaluation error:", str(e))
        import traceback
        traceback.print_exc()
        
        return {
            "evaluation": {
                "score": 5,
                "strengths": ["Answer was processed"],
                "weaknesses": ["Evaluation system encountered an error"],
                "improvement": ["Please try again"],
                "relevance_score": 5,
                "accuracy_score": 5,
                "communication_score": 5,
                "answer_quality": "average",
                "is_gibberish": False
            }
        }

# ===================================
# ANALYZE REPORT
# ===================================
@app.post("/analyze-report")
def analyze_report(data: AnalyzeReportRequest):
    try:
        print("\n=========== ANALYZING INTERVIEW REPORT ===========")
        print(f"Questions: {len(data.questions)}")
        print(f"Answers: {len(data.answers)}")

        evaluations = []
        
        for i, item in enumerate(data.answers):
            if isinstance(item, dict):
                if "evaluation" in item:
                    eval_data = item["evaluation"]
                    if isinstance(eval_data, dict):
                        if "score" not in eval_data:
                            eval_data["score"] = 5
                        if "strengths" not in eval_data:
                            eval_data["strengths"] = ["Answer provided"]
                        if "weaknesses" not in eval_data:
                            eval_data["weaknesses"] = ["Could be more detailed"]
                        if "improvement" not in eval_data:
                            eval_data["improvement"] = ["Add specific examples"]
                        
                        evaluations.append(eval_data)

        if not evaluations:
            print("No evaluations found - creating default evaluations")
            for i, answer in enumerate(data.answers):
                default_eval = {
                    "score": 5,
                    "strengths": ["Answer was recorded"],
                    "weaknesses": ["Detailed evaluation pending"],
                    "improvement": ["Continue practicing"],
                    "relevance_score": 5,
                    "accuracy_score": 5,
                    "communication_score": 5,
                    "answer_quality": "average",
                    "is_gibberish": False
                }
                evaluations.append(default_eval)

        total_score = sum(e.get("score", 0) for e in evaluations) / len(evaluations) if evaluations else 0
        total_accuracy = sum(e.get("accuracy_score", 0) for e in evaluations) / len(evaluations) if evaluations else 0
        total_communication = sum(e.get("communication_score", 0) for e in evaluations) / len(evaluations) if evaluations else 0

        technical = round(total_accuracy * 10) if total_accuracy > 0 else 0
        clarity = round(total_score * 10) if total_score > 0 else 0
        confidence = round(total_communication * 10) if total_communication > 0 else 0
        overall_score = round((technical + clarity + confidence) / 3) if (technical + clarity + confidence) > 0 else 0

        report = {
            "score": overall_score,
            "technical": technical,
            "clarity": clarity,
            "confidence": confidence,
            "role": data.role,
            "level": "Mid-Level",
            "totalQuestions": len(data.questions),
            "answered": len(data.answers),
            "evaluations": evaluations,
            "answers": data.answers
        }

        print(f"Report generated: Overall Score: {overall_score}%")
        return report

    except Exception as e:
        print(f"Error generating report: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "score": 0,
            "technical": 0,
            "clarity": 0,
            "confidence": 0,
            "role": data.role,
            "level": "Mid-Level",
            "totalQuestions": len(data.questions),
            "answered": len(data.answers),
            "evaluations": [],
            "answers": data.answers
        }

# ===================================
# USER STATS
# ===================================
@app.post("/get-user-stats")
def get_user_stats(data: GetUserStatsRequest):
    try:
        if user_interviews_collection is None:
            return {
                "totalInterviews": 0,
                "avgScore": 0,
                "improvement": 0,
                "hoursPracticed": 0,
                "recentInterviews": []
            }

        complete_interviews = list(user_interviews_collection.find({"userId": data.userId, "complete": True}))
        total = len(complete_interviews)
        
        if total > 0:
            avg = round(sum(i.get("score", 0) for i in complete_interviews) / total)
            recent = sorted(complete_interviews, key=lambda x: x.get("date", datetime.min), reverse=True)[:5]
            recent_list = [{"role": i["role"], "score": i["score"], "totalQuestions": i.get("totalQuestions", 0), "answered": i.get("answered", 0), "level": "Mid"} for i in recent]
        else:
            recent_list = []
            avg = 0
        
        return {
            "totalInterviews": total,
            "avgScore": avg,
            "improvement": 0,
            "hoursPracticed": round(total * 5 / 60, 1),
            "recentInterviews": recent_list
        }

    except Exception as e:
        print("Stats error:", e)
        return {
            "totalInterviews": 0,
            "avgScore": 0,
            "improvement": 0,
            "hoursPracticed": 0,
            "recentInterviews": []
        }