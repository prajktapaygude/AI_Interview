import os
import re
import json
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from groq import Groq
import hashlib

load_dotenv()

# Rate limiting configuration
RATE_LIMIT = {
    'max_requests': 15,
    'time_window': 86400,
    'current_requests': 0,
    'reset_time': None
}

evaluation_cache = {}
CACHE_TTL = 3600


def get_cache_key(role: str, question: str, answer: str) -> str:
    content = f"{role}|{question}|{answer}"
    return hashlib.md5(content.encode()).hexdigest()


def check_rate_limit():
    now = datetime.now()
    if RATE_LIMIT['reset_time'] and now > RATE_LIMIT['reset_time']:
        RATE_LIMIT['current_requests'] = 0
        RATE_LIMIT['reset_time'] = None
    if RATE_LIMIT['current_requests'] >= RATE_LIMIT['max_requests']:
        if RATE_LIMIT['reset_time']:
            wait_seconds = (RATE_LIMIT['reset_time'] - now).total_seconds()
            return False, wait_seconds
        return False, 60
    return True, 0


def increment_rate_limit():
    RATE_LIMIT['current_requests'] += 1
    if not RATE_LIMIT['reset_time']:
        RATE_LIMIT['reset_time'] = datetime.now() + timedelta(seconds=RATE_LIMIT['time_window'])


def extract_json(text):
    if not text:
        return None
    text = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'```\s*', '', text, flags=re.IGNORECASE)
    text = text.strip()
    try:
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end+1])
    except:
        pass
    brace_count = 0
    start_index = -1
    for i, char in enumerate(text):
        if char == '{':
            if brace_count == 0:
                start_index = i
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0 and start_index != -1:
                try:
                    return json.loads(text[start_index:i+1])
                except:
                    continue
    return None


def clean_cache():
    global evaluation_cache
    now = datetime.now()
    to_delete = []
    for key, (cache_time, _) in evaluation_cache.items():
        if now - cache_time > timedelta(seconds=CACHE_TTL):
            to_delete.append(key)
    for key in to_delete:
        del evaluation_cache[key]
    if to_delete:
        print(f"🧹 Cleaned {len(to_delete)} old cache entries")


def get_short_answer_feedback():
    return {
        "score": 3,
        "strengths": ["Attempted to answer"],
        "weaknesses": ["Answer is too short", "Lacks detail and explanation"],
        "improvement": ["Provide more detailed answers", "Explain your reasoning", "Include examples"],
        "relevance_score": 3,
        "accuracy_score": 3,
        "communication_score": 2,
        "answer_quality": "poor",
        "is_gibberish": False,
        "skill_breakdown": {"technical_depth": "low", "problem_solving": "low", "communication": "low"}
    }


def get_gibberish_feedback():
    return {
        "score": 1,
        "strengths": [],
        "weaknesses": ["Response is not coherent", "Does not address the question"],
        "improvement": ["Provide a clear, structured answer", "Focus on the question being asked"],
        "relevance_score": 1,
        "accuracy_score": 1,
        "communication_score": 1,
        "answer_quality": "poor",
        "is_gibberish": True,
        "skill_breakdown": {"technical_depth": "low", "problem_solving": "low", "communication": "low"}
    }


def get_intelligent_fallback(role: str, question: str, answer: str) -> dict:
    answer_lower = answer.lower()
    answer_length = len(answer)
    tech_keywords = {
        "frontend": ["react", "angular", "vue", "javascript", "css", "html", "ui", "component", "state", "props"],
        "backend": ["api", "database", "sql", "server", "authentication", "rest", "endpoint", "query"],
        "fullstack": ["frontend", "backend", "database", "api", "react", "node", "mongodb"],
        "data": ["python", "pandas", "data", "analysis", "visualization", "sql", "statistics"],
        "devops": ["docker", "kubernetes", "ci/cd", "pipeline", "deployment", "cloud", "aws"],
        "web-dev": ["javascript", "html", "css", "react", "angular", "vue", "node", "express", "api"]
    }
    role_lower = role.lower()
    relevant_keywords = []
    for cat, keywords in tech_keywords.items():
        if cat in role_lower:
            relevant_keywords = keywords
            break
    if not relevant_keywords:
        relevant_keywords = ["code", "programming", "development", "software", "technical", "javascript"]
    keyword_matches = sum(1 for kw in relevant_keywords if kw in answer_lower)
    match_ratio = keyword_matches / len(relevant_keywords) if relevant_keywords else 0.5
    if answer_length > 150 and match_ratio > 0.5:
        score = 7
        quality = "good"
        strengths = ["Provides detailed information", "Shows good understanding"]
        weaknesses = ["Could include more specific examples"]
        improvement = ["Add real-world examples", "Mention specific technologies you've used"]
    elif answer_length > 100 and match_ratio > 0.3:
        score = 6
        quality = "good"
        strengths = ["Addresses the question", "Basic understanding demonstrated"]
        weaknesses = ["Lacks technical depth", "Could provide more details"]
        improvement = ["Expand on key concepts", "Include more specific terminology"]
    elif answer_length > 50:
        score = 5
        quality = "average"
        strengths = ["Basic answer provided"]
        weaknesses = ["Answer is somewhat brief", "Missing important details"]
        improvement = ["Provide more comprehensive explanation", "Include examples"]
    else:
        score = 4
        quality = "average"
        strengths = ["Attempted to answer"]
        weaknesses = ["Answer is too brief", "Needs more detail"]
        improvement = ["Elaborate on your answer", "Provide specific examples"]
    if keyword_matches > 0:
        strengths.append(f"Used relevant terminology ({keyword_matches} keywords)")
        score = min(10, score + 1)
    else:
        weaknesses.append(f"Missing key terminology for {role}")
        improvement.append(f"Learn and use key {role} terminology")
    if "first" in answer_lower or "second" in answer_lower or "finally" in answer_lower:
        strengths.append("Good answer structure")
    else:
        improvement.append("Structure your answer with clear points (first, second, finally)")
    if "example" in answer_lower or "like" in answer_lower:
        strengths.append("Included practical examples")
    else:
        improvement.append("Include concrete examples from your experience")
    return {
        "score": score,
        "strengths": strengths[:3],
        "weaknesses": weaknesses[:3],
        "improvement": improvement[:3],
        "relevance_score": min(10, max(1, int(5 + match_ratio * 5))),
        "accuracy_score": min(10, max(1, int(5 + match_ratio * 4))),
        "communication_score": min(10, max(1, int(5 + (answer_length / 150)))),
        "answer_quality": quality,
        "is_gibberish": False,
        "skill_breakdown": {
            "technical_depth": "high" if score >= 7 else "medium" if score >= 5 else "low",
            "problem_solving": "medium" if score >= 5 else "low",
            "communication": "high" if answer_length > 100 else "medium" if answer_length > 50 else "low"
        }
    }


def validate_evaluation_result(result: dict) -> dict:
    defaults = {
        "score": 5,
        "strengths": ["Answer was provided"],
        "weaknesses": ["Could be improved"],
        "improvement": ["Add more details and examples"],
        "relevance_score": 5,
        "accuracy_score": 5,
        "communication_score": 5,
        "answer_quality": "average",
        "is_gibberish": False,
        "skill_breakdown": {"technical_depth": "medium", "problem_solving": "medium", "communication": "medium"}
    }
    for key, default_value in defaults.items():
        if key not in result or result[key] is None:
            result[key] = default_value
    numeric_fields = ["score", "relevance_score", "accuracy_score", "communication_score"]
    for field in numeric_fields:
        try:
            result[field] = int(float(result[field]))
            result[field] = max(0, min(10, result[field]))
        except (ValueError, TypeError):
            result[field] = defaults[field]
    for field in ["strengths", "weaknesses", "improvement"]:
        if not isinstance(result[field], list):
            result[field] = defaults[field]
        elif len(result[field]) == 0:
            result[field] = defaults[field]
        elif len(result[field]) > 5:
            result[field] = result[field][:5]
    return result


def detect_gibberish_advanced(text: str) -> dict:
    if not text or len(text.strip()) < 5:
        return {"is_gibberish": True, "confidence": 1.0, "reason": "Empty or too short", "details": {}}
    text_lower = text.lower()
    words = re.findall(r'\b[a-z]+\b', text_lower)
    if len(words) < 2:
        return {"is_gibberish": True, "confidence": 0.8, "reason": "Insufficient words", "details": {"word_count": len(words)}}
    scores = {"repetition": 0.0, "random_chars": 0.0, "nonsense_words": 0.0, "grammar_score": 0.0, "coherence": 0.0}
    word_freq = {}
    for word in words:
        word_freq[word] = word_freq.get(word, 0) + 1
    max_repetition = max(word_freq.values()) / len(words) if words else 0
    scores["repetition"] = min(1.0, max_repetition * 1.2)
    unique_words_ratio = len(set(words)) / len(words) if words else 0
    if unique_words_ratio < 0.3:
        scores["repetition"] = 0.9
    if re.search(r'[bcdfghjklmnpqrstvwxz]{10,}', text_lower):
        scores["random_chars"] = 0.95
    elif re.search(r'[bcdfghjklmnpqrstvwxz]{7,}', text_lower):
        scores["random_chars"] = 0.8
    elif re.search(r'[a-z]{20,}', text_lower):
        scores["random_chars"] = 0.9
    common_words = {
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
        'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
        'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
        'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
        'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
        'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
        'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
        'most', 'us', 'react', 'javascript', 'python', 'java', 'function', 'component',
        'api', 'database', 'server', 'client', 'code', 'program', 'development'
    }
    nonsense_count = 0
    for word in words:
        if word not in common_words and len(word) > 3:
            has_vowel = bool(re.search(r'[aeiou]', word))
            if not has_vowel:
                nonsense_count += 1
            elif re.search(r'(.)\1{3,}', word):
                nonsense_count += 1
    nonsense_ratio = nonsense_count / len(words) if words else 0
    scores["nonsense_words"] = min(1.0, nonsense_ratio * 1.5)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if sentences:
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        if avg_sentence_length < 3:
            scores["grammar_score"] = 0.7
        elif avg_sentence_length > 50:
            scores["grammar_score"] = 0.3
        proper_capitalization = sum(1 for s in sentences if s and s[0].isupper()) / len(sentences) if sentences else 0
        if proper_capitalization < 0.3:
            scores["grammar_score"] = max(scores["grammar_score"], 0.5)
    tech_indicators = [
        'code', 'function', 'api', 'data', 'system', 'program', 'software',
        'development', 'build', 'create', 'implement', 'design', 'solution',
        'problem', 'solve', 'work', 'team', 'project', 'experience'
    ]
    tech_terms_found = sum(1 for term in tech_indicators if term in text_lower)
    if tech_terms_found == 0:
        scores["coherence"] = 0.6
    elif tech_terms_found < 2:
        scores["coherence"] = 0.3
    weights = {"repetition": 0.25, "random_chars": 0.25, "nonsense_words": 0.20, "grammar_score": 0.15, "coherence": 0.15}
    overall_score = sum(scores[key] * weight for key, weight in weights.items())
    is_gibberish = overall_score > 0.6
    if tech_terms_found >= 2 and scores["nonsense_words"] < 0.3:
        is_gibberish = False
        overall_score = max(0, overall_score - 0.3)
    if len(sentences) >= 2 and avg_sentence_length >= 5:
        is_gibberish = False
        overall_score = max(0, overall_score - 0.2)
    if nonsense_ratio < 0.2 and tech_terms_found >= 1:
        is_gibberish = False
        overall_score = max(0, overall_score - 0.25)
    reason = "Text appears coherent and meaningful"
    if is_gibberish:
        reasons = []
        if scores["repetition"] > 0.7: reasons.append("excessive repetition")
        if scores["random_chars"] > 0.7: reasons.append("random character sequences")
        if scores["nonsense_words"] > 0.6: reasons.append("unrecognizable words")
        if scores["grammar_score"] > 0.6: reasons.append("poor grammar")
        if scores["coherence"] > 0.5: reasons.append("lack of coherence")
        if reasons:
            reason = f"Gibberish detected: {', '.join(reasons[:2])}"
    return {
        "is_gibberish": is_gibberish,
        "confidence": min(1.0, overall_score),
        "reason": reason,
        "details": scores,
        "nonsense_ratio": nonsense_ratio,
        "tech_terms_found": tech_terms_found
    }


# ========== IMPROVED FEEDBACK GENERATOR (includes up to 2 suggestions) ==========
def make_recruiter_feedback(evaluation: dict, answer: str, question: str) -> str:
    """
    Generate a natural feedback sentence that includes 1-2 short suggestions from improvement list.
    """
    score = evaluation.get('score', 5)
    strengths = evaluation.get('strengths', [])
    weaknesses = evaluation.get('weaknesses', [])
    improvements = evaluation.get('improvement', [])

    if score >= 8:
        if strengths:
            s = strengths[0].rstrip('.')
            if improvements:
                tip = improvements[0].rstrip('.')
                return f"Good. {s}. {tip}."
            return f"Good. {s}."
        return "Good answer, clear and correct."
    
    elif score >= 5:
        if weaknesses:
            w = weaknesses[0].rstrip('.')
            if improvements:
                tip1 = improvements[0].rstrip('.')
                if len(improvements) > 1:
                    tip2 = improvements[1].rstrip('.')
                    return f"Almost there. {w}. {tip1} Also, {tip2}."
                else:
                    return f"Almost there. {w}. {tip1}."
            return f"Not bad, but {w}."
        return "You're on the right track – missing some detail."
    
    else:
        if weaknesses:
            w = weaknesses[0].rstrip('.')
            if improvements:
                tip = improvements[0].rstrip('.')
                return f"Not quite – {w}. {tip}."
            return f"Incorrect. {w}."
        return "That answer misses the point. Let's move on."


# ========== MAIN EVALUATION FUNCTION WITH CONCISE PROMPT ==========
def evaluate_answer(role: str, question: str, answer: str) -> dict:
    print(f"\n{'='*50}")
    print(f"EVALUATING ANSWER")
    print(f"Role: {role}")
    print(f"Question: {question[:100]}...")
    print(f"Answer: {answer[:100]}...")
    print(f"{'='*50}")
    
    # Short answer detection
    if not answer or len(answer.strip()) < 5:
        print("⚠️ Answer too short")
        result = get_short_answer_feedback()
        result['recruiter_feedback'] = "Your answer is very brief. Please give a more detailed response next time."
        result['repeat_question'] = False
        return result
    
    # Gibberish detection
    gibberish_analysis = detect_gibberish_advanced(answer)
    print(f"Gibberish confidence: {gibberish_analysis['confidence']:.2%}")
    if gibberish_analysis["is_gibberish"] and gibberish_analysis["confidence"] > 0.7:
        print(f"⚠️ Gibberish detected")
        result = get_gibberish_feedback()
        result['recruiter_feedback'] = "Sorry, I didn't understand that. Could you repeat your answer clearly?"
        result['repeat_question'] = True
        return result
    
    # Cache check
    cache_key = get_cache_key(role, question, answer)
    if cache_key in evaluation_cache:
        cache_time, cached_result = evaluation_cache[cache_key]
        if datetime.now() - cache_time < timedelta(seconds=CACHE_TTL):
            print(f"✅ Using cached evaluation")
            if 'recruiter_feedback' not in cached_result:
                cached_result['recruiter_feedback'] = make_recruiter_feedback(cached_result, answer, question)
                cached_result['repeat_question'] = False
            return cached_result
    
    # Rate limit check
    can_proceed, wait_time = check_rate_limit()
    if not can_proceed:
        print(f"⚠️ Rate limit reached. Using intelligent fallback.")
        fallback_result = get_intelligent_fallback(role, question, answer)
        fallback_result['recruiter_feedback'] = make_recruiter_feedback(fallback_result, answer, question)
        fallback_result['repeat_question'] = False
        return fallback_result
    
    # Groq API call
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("❌ GROQ_API_KEY not found, using fallback")
        fallback_result = get_intelligent_fallback(role, question, answer)
        fallback_result['recruiter_feedback'] = make_recruiter_feedback(fallback_result, answer, question)
        fallback_result['repeat_question'] = False
        return fallback_result
    
    try:
        client = Groq(api_key=api_key)
        gibberish_context = ""
        if gibberish_analysis["is_gibberish"]:
            gibberish_context = f"""
IMPORTANT: Our preliminary analysis indicates this answer may contain gibberish or incoherent content.
Confidence: {gibberish_analysis['confidence']:.0%}
Issue: {gibberish_analysis['reason']}
"""
        # Concise prompt allowing up to 2 improvements
        prompt = f"""You are a strict but fair technical interviewer. Evaluate the candidate's answer concisely.

ROLE: {role}
QUESTION: {question}
ANSWER: {answer}
{gibberish_context}

Return feedback in this JSON format:
{{
  "score": <integer 1-10>,
  "strengths": ["up to 2 short strengths"],
  "weaknesses": ["up to 2 short weaknesses"],
  "improvement": ["short tip1", "optional short tip2"],
  "relevance_score": <1-10>,
  "accuracy_score": <1-10>,
  "communication_score": <1-10>,
  "answer_quality": "<excellent|good|average|poor>"
}}

Guidelines:
- Score realistically: 8–10 = excellent, 5–7 = average, 1–4 = poor.
- Strengths: only what was done well (clarity, confidence, correctness).
- Weaknesses: only key gaps or inaccuracies. Do not repeat "missing examples" unless the question explicitly asked for one.
- Improvement: provide 1 or 2 short actionable tips (e.g., "Clarify syntax", "Add a use case", "Explain tradeoffs"). Be specific and helpful.
- Keep feedback short and professional, like a real interviewer’s note — no long lists, no repetition.
- Output ONLY valid JSON.
"""
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert interview evaluator. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=800
        )
        
        raw_text = response.choices[0].message.content
        print(f"📥 Received response from Groq")
        result = extract_json(raw_text)
        
        if result:
            print(f"✅ Successfully parsed JSON")
            increment_rate_limit()
            result["gibberish_detected"] = gibberish_analysis["is_gibberish"]
            result["gibberish_confidence"] = gibberish_analysis["confidence"]
            result = validate_evaluation_result(result)
            if gibberish_analysis["is_gibberish"] and result["score"] > 5:
                result["score"] = min(result["score"], 3)
                result["communication_score"] = min(result["communication_score"], 3)
            # Add human-like feedback
            result['recruiter_feedback'] = make_recruiter_feedback(result, answer, question)
            result['repeat_question'] = False
            
            evaluation_cache[cache_key] = (datetime.now(), result)
            clean_cache()
            print(f"\n✅ Evaluation Complete! Score: {result['score']}/10")
            return result
        else:
            print("❌ Could not parse JSON, using fallback")
            fallback_result = get_intelligent_fallback(role, question, answer)
            fallback_result['recruiter_feedback'] = make_recruiter_feedback(fallback_result, answer, question)
            fallback_result['repeat_question'] = False
            return fallback_result
        
    except Exception as e:
        print(f"❌ Groq API Error: {e}")
        fallback_result = get_intelligent_fallback(role, question, answer)
        fallback_result['recruiter_feedback'] = make_recruiter_feedback(fallback_result, answer, question)
        fallback_result['repeat_question'] = False
        return fallback_result


# ========== BATCH EVALUATION (unchanged) ==========
def extract_json_array(text):
    """Extract JSON array from response text"""
    if not text:
        return None
    
    text = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'```\s*', '', text, flags=re.IGNORECASE)
    text = text.strip()
    
    try:
        start = text.find('[')
        end = text.rfind(']')
        if start != -1 and end != -1 and end > start:
            json_str = text[start:end+1]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass
    
    return None


def evaluate_all_answers(role: str, tech_stack: str, level: str, questions: list, answers: list) -> list:
    """
    Evaluate all answers in a single API call for consistency
    """
    print(f"\n{'='*60}")
    print(f"BATCH EVALUATION")
    print(f"Role: {role}")
    print(f"Tech Stack: {tech_stack}")
    print(f"Level: {level}")
    print(f"Number of Q&A pairs: {len(questions)}")
    print(f"{'='*60}")  
    
    # First, do quick validation for empty/short answers
    quick_evaluations = []
    need_ai_evaluation = []
    need_ai_indices = []
    
    for i, (question, answer) in enumerate(zip(questions, answers)):
        # Handle both string answers and answer objects
        answer_text = answer if isinstance(answer, str) else answer.get('answer', '') if isinstance(answer, dict) else str(answer)
        
        print(f"\nQ{i+1}: {question[:50]}...")
        print(f"A{i+1}: {answer_text[:50]}...")
        print(f"Length: {len(answer_text)} chars, Words: {len(answer_text.split())}")
        
        # Quick validation
        if not answer_text or len(answer_text.strip()) < 10:
            print(f"  ⚠️ Answer too short")
            quick_evaluations.append({
                "score": 2,
                "strengths": ["Provided a response"],
                "weaknesses": ["Answer is too short", "Lacks substantial content"],
                "improvement": ["Provide more detailed answers (at least 2-3 sentences)"],
                "relevance_score": 2,
                "accuracy_score": 2,
                "communication_score": 2,
                "answer_quality": "poor",
                "is_gibberish": False,
                "skill_breakdown": {
                    "technical_depth": "low",
                    "problem_solving": "low",
                    "communication": "low"
                }
            })
        elif len(answer_text.split()) < 15:
            print(f"  ⚠️ Answer too brief ({len(answer_text.split())} words)")
            quick_evaluations.append({
                "score": 3,
                "strengths": ["Provided a response"],
                "weaknesses": ["Answer is brief", "Could provide more detail"],
                "improvement": ["Expand your answer with more details and examples"],
                "relevance_score": 3,
                "accuracy_score": 3,
                "communication_score": 3,
                "answer_quality": "poor",
                "is_gibberish": False,
                "skill_breakdown": {
                    "technical_depth": "low",
                    "problem_solving": "low",
                    "communication": "low"
                }
            })
        else:
            # Need AI evaluation for substantial answers
            print(f"  ✅ Good length, sending to AI evaluation")
            need_ai_evaluation.append((question, answer_text))
            need_ai_indices.append(i)
            quick_evaluations.append(None)  # Placeholder
    
    # If there are answers that need AI evaluation
    if need_ai_evaluation:
        try:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                print("❌ GROQ_API_KEY not found")
                raise ValueError("GROQ_API_KEY not found")
            
            client = Groq(api_key=api_key)
            
            # Build comprehensive prompt
            qa_text = "\n\n".join([f"QUESTION {idx+1}: {q}\nANSWER {idx+1}: {a}" 
                                   for idx, (q, a) in enumerate(need_ai_evaluation)])
            
            prompt = f"""You are a PROFESSIONAL INTERVIEW MENTOR evaluating a candidate's answers for a {role} position.

CRITICAL SCORING GUIDELINES:
- Score 9-10: Excellent, complete, accurate with examples
- Score 7-8: Good, correct but missing some details or examples  
- Score 5-6: Average, basic understanding but significant gaps
- Score 3-4: Poor, major errors or very brief
- Score 1-2: Very poor, empty or completely wrong

For EACH answer, provide:
1. SCORE (1-10 based on above scale)
2. STRENGTHS (what was done well)
3. WEAKNESSES (what's missing or incorrect)
4. IMPROVEMENTS (specific actionable advice)
5. Technical Depth (low/medium/high)
6. Accuracy (low/medium/high)
7. Communication (low/medium/high)

Return ONLY valid JSON array.

EVALUATION CRITERIA:
- Technical Depth: Does answer show deep understanding or just surface level?
- Accuracy: Is the information correct? Any major errors?
- Communication: Is it clear, well-structured, easy to understand?
- Examples: Are concrete examples provided?
- Completeness: Does it fully answer the question?

{qa_text}

Provide evaluation in this exact format for EACH answer (as a JSON array):
[
  {{
    "score": <integer 1-10>,
    "strengths": ["specific strength 1", "specific strength 2"],
    "weaknesses": ["specific weakness 1", "specific weakness 2"],
    "improvement": ["actionable improvement 1", "actionable improvement 2"],
    "technical_depth": "<low|medium|high>",
    "accuracy_score": <integer 1-10>,
    "communication_score": <integer 1-10>,
    "answer_quality": "<excellent|good|average|poor>"
  }},
  ...
]"""

            print("\n📤 Sending batch to Groq API...")
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a strict interview evaluator. Return only valid JSON array. Be consistent and fair."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            raw_text = response.choices[0].message.content
            print(f"📥 Received response from Groq")
            
            ai_evaluations = extract_json_array(raw_text)
            
            if ai_evaluations and isinstance(ai_evaluations, list):
                print(f"✅ Successfully parsed {len(ai_evaluations)} evaluations")
                for i, idx in enumerate(need_ai_indices):
                    if i < len(ai_evaluations):
                        quick_evaluations[idx] = ai_evaluations[i]
                    else:
                        print(f"⚠️ Missing evaluation for index {i}, using fallback")
                        quick_evaluations[idx] = get_intelligent_fallback(role, questions[idx], answers[idx])
            else:
                print("❌ Could not parse JSON response, using fallback for all")
                for idx in need_ai_indices:
                    quick_evaluations[idx] = get_intelligent_fallback(role, questions[idx], answers[idx])
                    
        except Exception as e:
            print(f"❌ Batch evaluation error: {e}")
            import traceback
            traceback.print_exc()
            for idx in need_ai_indices:
                quick_evaluations[idx] = get_intelligent_fallback(role, questions[idx], answers[idx])
    
    # Ensure all evaluations are valid
    final_evaluations = []
    for i, eval_result in enumerate(quick_evaluations):
        if eval_result is None:
            print(f"⚠️ Missing evaluation for Q{i+1}, using default")
            final_evaluations.append({
                "score": 5,
                "strengths": ["Answer provided"],
                "weaknesses": ["Evaluation pending"],
                "improvement": ["Continue practicing"],
                "relevance_score": 5,
                "accuracy_score": 5,
                "communication_score": 5,
                "answer_quality": "average",
                "skill_breakdown": {
                    "technical_depth": "medium",
                    "problem_solving": "medium",
                    "communication": "medium"
                }
            })
        else:
            final_evaluations.append(validate_evaluation_result(eval_result))
    
    print(f"\n✅ Batch evaluation complete for {len(final_evaluations)} answers")
    
    # Print summary
    for i, eval_result in enumerate(final_evaluations):
        print(f"  Q{i+1}: Score {eval_result.get('score', 0)}/10 - {eval_result.get('answer_quality', 'N/A')}")
    
    return final_evaluations


# ========== SINGLE QUESTION GENERATOR FOR CONTINUOUS MODE ==========
async def generate_single_question(role: str, tech_stack: str, level: str, difficulty: str, asked_questions: list = None) -> dict:
    if asked_questions is None:
        asked_questions = []

    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return {"question": get_single_fallback_question(role, tech_stack, asked_questions)}

        from groq import Groq
        client = Groq(api_key=api_key)

        asked_context = ""
        if asked_questions:
            asked_context = f"\nPREVIOUSLY ASKED QUESTIONS (DO NOT repeat these):\n" + "\n".join([f"- {q}" for q in asked_questions[-5:]])

        prompt = f"""Generate ONE unique interview question for a {role} position.

Technical Requirements:
- Tech Stack: {tech_stack}
- Experience Level: {level}
- Difficulty: {difficulty}

Requirements:
1. Must be relevant to {tech_stack} development.
2. Must be appropriate for {level} level.
3. Must be different from previously asked questions.
4. Should encourage detailed answers (2-3 minutes speaking).
5. Should test practical knowledge.

{asked_context}

Return ONLY valid JSON: {{"question": "your question here"}}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )

        raw_text = response.choices[0].message.content
        result = extract_json(raw_text)
        if result and result.get("question"):
            return {"question": result["question"]}
        else:
            return {"question": get_single_fallback_question(role, tech_stack, asked_questions)}

    except Exception as e:
        print(f"❌ Error generating single question: {e}")
        return {"question": get_single_fallback_question(role, tech_stack, asked_questions)}


def get_single_fallback_question(role: str, tech_stack: str, asked_questions: list = None) -> str:
    if asked_questions is None:
        asked_questions = []

    fallbacks = {
        "Frontend Developer": [
            f"Describe your experience with {tech_stack} in production.",
            f"How do you optimize {tech_stack} applications for performance?",
            f"Explain your approach to state management in {tech_stack}.",
            f"What testing strategies do you use for {tech_stack} components?",
        ],
        "Backend Developer": [
            f"How do you design scalable APIs using {tech_stack}?",
            f"What's your approach to database optimization in {tech_stack}?",
            f"How do you handle authentication in {tech_stack}?",
            f"Describe your experience with microservices using {tech_stack}.",
        ]
    }

    default = [
        f"Tell me about your experience with {tech_stack}.",
        f"Describe a challenging problem you solved with {tech_stack}.",
        f"What are best practices for {tech_stack} development?",
        f"How do you stay updated with {tech_stack} technologies?",
    ]

    questions = fallbacks.get(role, default)
    available = [q for q in questions if q not in asked_questions]
    return available[0] if available else questions[0]


if __name__ == "__main__":
    # Simple test
    print("Testing evaluation functions...")
    test_role = "Backend Developer"
    test_question = "What is a REST API?"
    test_answer = "REST API is an architectural style for web services. It uses HTTP methods like GET, POST, PUT, DELETE. It is stateless and uses JSON for data exchange."
    result = evaluate_answer(test_role, test_question, test_answer)
    print(f"Score: {result['score']}/10")