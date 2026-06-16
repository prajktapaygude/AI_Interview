import os
import re
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def shorten_question(question):
    """Make question short and conversational - max 10 words"""
    if not question:
        return question
    
    # Remove common long openings
    long_openings = [
        "Can you tell me about your experience with",
        "Can you describe",
        "Would you explain",
        "What is your experience with",
        "Tell me about a time when you",
        "How do you handle",
        "What is your approach to",
        "Can you walk me through",
        "I'd like to know about",
        "Could you please explain",
        "What are your thoughts on",
        "In your opinion",
    ]
    
    q = question.strip()
    q_lower = q.lower()
    
    for opening in long_openings:
        if q_lower.startswith(opening.lower()):
            remainder = q[len(opening):].strip()
            if remainder:
                q = remainder[0].upper() + remainder[1:] if remainder else remainder
            break
    
    # Remove filler words
    filler_words = ['actually', 'basically', 'literally', 'just', 'very', 'really', 'quite', 'rather', 'probably']
    for word in filler_words:
        q = q.replace(f" {word} ", " ")
        q = q.replace(f"{word} ", " ")
    
    # Limit to 10 words
    words = q.split()
    if len(words) > 10:
        q = ' '.join(words[:9])
    
    # Ensure question mark
    q = q.rstrip('.')
    if not q.endswith('?'):
        q = q + '?'
    
    # Capitalize first letter
    if q:
        q = q[0].upper() + q[1:]
    
    return q


def generate_questions(role, tech_stack=None, level=None, difficulty=None):
    """
    Generate SHORT interview questions based on role, tech stack, level, and difficulty
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("⚠️ GROQ_API_KEY not found, using fallback")
        return get_default_questions(role, tech_stack, level, difficulty)
    
    try:
        client = Groq(api_key=api_key)
        
        # Build context based on parameters
        context_parts = []
        if tech_stack:
            context_parts.append(f"with expertise in {tech_stack}")
        if level:
            level_desc = {
                "fresher": "entry-level (0-1 years experience)",
                "junior": "junior level (1-3 years experience)",
                "mid": "mid-level (3-5 years experience)",
                "senior": "senior level (5+ years experience)"
            }
            context_parts.append(f"for a {level_desc.get(level, level)} position")
        if difficulty:
            context_parts.append(f"with {difficulty} difficulty level")
        
        context = " ".join(context_parts) if context_parts else ""
        
        prompt = f"""You are an experienced technical interviewer for a {role} position {context}.

Generate exactly 5 SHORT and realistic interview questions that are appropriate for this role and tech stack.

CRITICAL RULES:
- Each question must be under 12 words
- Questions must be specific to {role}
- If tech stack is provided ({tech_stack}), focus questions on that technology
- Adjust difficulty based on level ({level}) and difficulty ({difficulty})
- AVOID compound questions with "AND", "or", ","
- Each question must be a SINGLE, standalone question
- Use simple and direct language

Return ONLY a valid JSON array of 5 questions.

Example format:
[
"Explain React component lifecycle.",
"How do you manage state in React?",
"What is the virtual DOM?",
"Explain useEffect cleanup function.",
"How do you optimize React performance?"
]"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a technical interviewer. Return only valid JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        raw_text = response.choices[0].message.content or ""
        print(f"📥 Groq response received for {role}")
        
        # Extract JSON array
        json_match = re.search(r'\[.*\]', raw_text, re.DOTALL)
        
        if json_match:
            try:
                questions = json.loads(json_match.group())
                if isinstance(questions, list):
                    filtered_questions = []
                    for q in questions:
                        q = shorten_question(q)
                        words = q.split()
                        if len(words) <= 15 and q.strip():
                            if not q.endswith('?'):
                                q = q.strip() + '?'
                            filtered_questions.append(q.strip())
                    
                    return filtered_questions[:5] if filtered_questions else questions[:5]
            except json.JSONDecodeError:
                pass
        
        # Fallback parsing
        raw_text = raw_text.replace("```json", "").replace("```", "")
        lines = raw_text.split("\n")
        
        questions = []
        for line in lines:
            line = line.strip()
            line = re.sub(r'^\d+[\.\)]\s*', '', line)
            if line and len(line) < 80:
                line = shorten_question(line)
                questions.append(line)
        
        return questions[:5] if questions else get_default_questions(role, tech_stack, level, difficulty)
        
    except Exception as e:
        print(f"❌ Groq API Error in generate_questions: {e}")
        return get_default_questions(role, tech_stack, level, difficulty)


def generate_continuous_question(role, tech_stack=None, level=None, difficulty=None, asked_questions=None):
    """
    Generate a SINGLE SHORT follow-up question based on previous questions asked.
    This is for continuous interview mode where questions are generated one at a time.
    """
    if asked_questions is None:
        asked_questions = []
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("⚠️ GROQ_API_KEY not found, using fallback")
        return get_single_default_question(role, tech_stack, level, difficulty)
    
    try:
        client = Groq(api_key=api_key)
        
        # Build context
        context_parts = []
        if tech_stack:
            context_parts.append(f"with expertise in {tech_stack}")
        if level:
            level_desc = {
                "fresher": "entry-level",
                "junior": "junior",
                "mid": "mid-level",
                "senior": "senior"
            }
            context_parts.append(f"for a {level_desc.get(level, level)} position")
        if difficulty:
            context_parts.append(f"({difficulty} difficulty)")
        
        context = " ".join(context_parts) if context_parts else ""
        
        # Build asked questions list for context
        asked_text = ""
        if asked_questions:
            asked_list = [f"- {q}" for q in asked_questions[-5:]]  # Last 5 questions
            asked_text = "Previous questions asked:\n" + "\n".join(asked_list) + "\n\n"
        
        prompt = f"""You are an experienced technical interviewer for a {role} position {context}.

{asked_text}Generate ONE NEW SHORT interview question (different from the previous ones).

CRITICAL RULES:
- Question must be under 12 words
- Must be specific to {role}
- If tech stack is provided ({tech_stack}), focus on that technology
- Adjust difficulty based on level ({level}) and difficulty ({difficulty})
- NO compound questions
- Use simple, direct language

Return ONLY a JSON object with a single question. Example format:
{{"question": "What is your experience with React?"}}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a technical interviewer. Return only valid JSON with a single question."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        raw_text = response.choices[0].message.content or ""
        print(f"📥 Continuous question generated for {role}")
        
        # Extract JSON
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        
        if json_match:
            try:
                data = json.loads(json_match.group())
                question = data.get('question', '')
                if question:
                    # SHORTEN the question
                    question = shorten_question(question)
                    return question
            except json.JSONDecodeError:
                pass
        
        # Fallback: try to extract any question-like text
        lines = raw_text.split('\n')
        for line in lines:
            line = line.strip()
            if '?' in line and len(line) < 80:
                line = shorten_question(line)
                return line
        
        return get_single_default_question(role, tech_stack, level, difficulty)
        
    except Exception as e:
        print(f"❌ Groq API Error in generate_continuous_question: {e}")
        return get_single_default_question(role, tech_stack, level, difficulty)


def get_single_default_question(role, tech_stack=None, level=None, difficulty=None):
    """Return a single short default question"""
    default_questions = get_default_questions(role, tech_stack, level, difficulty)
    return default_questions[0] if default_questions else f"Tell me about your {role} experience."


def get_default_questions(role, tech_stack=None, level=None, difficulty=None):
    """Generate SHORT default questions based on parameters"""
    
    # Tech stack specific questions (all short)
    tech_specific = {
        "react": [
            "What is React?",
            "Explain virtual DOM.",
            "What are React hooks?",
            "State vs props?",
            "How does useEffect work?"
        ],
        "python": [
            "What are decorators?",
            "Explain list comprehension.",
            "What is the GIL?",
            "Explain async/await.",
            "What are generators?"
        ],
        "javascript": [
            "What are closures?",
            "Explain event loop.",
            "Let vs var?",
            "Explain promises.",
            "What is hoisting?"
        ],
        "java": [
            "What is OOP?",
            "Explain JVM.",
            "ArrayList vs LinkedList?",
            "What are streams?",
            "Explain multithreading."
        ],
        "aws": [
            "What is EC2?",
            "Explain S3 buckets.",
            "What are IAM roles?",
            "What is VPC?",
            "Explain Lambda functions."
        ],
        "docker": [
            "What is containerization?",
            "Docker vs VM?",
            "Explain Dockerfile.",
            "What are volumes?",
            "Explain docker-compose."
        ],
        "sql": [
            "INNER vs LEFT JOIN?",
            "What is normalization?",
            "What are indexes?",
            "WHERE vs HAVING?",
            "Primary vs foreign key?"
        ],
        "mongodb": [
            "SQL vs NoSQL?",
            "Explain aggregation.",
            "What are indexes?",
            "Embedding vs referencing?",
            "What is sharding?"
        ]
    }
    
    # Check for tech stack specific questions
    if tech_stack:
        tech_stack_lower = tech_stack.lower()
        for key, questions in tech_specific.items():
            if key in tech_stack_lower:
                return questions
    
    # Role-based fallback (short questions)
    role_specific = {
        "frontend": [
            "What frameworks do you use?",
            "Explain responsive design.",
            "What is state management?",
            "How do you debug?",
            "What is your build tool?"
        ],
        "backend": [
            "What are REST APIs?",
            "How optimize databases?",
            "Explain authentication.",
            "What caching do you use?",
            "How handle errors?"
        ],
        "fullstack": [
            "What is your tech stack?",
            "How handle debugging?",
            "Explain API design.",
            "How manage migrations?",
            "What is deployment process?"
        ],
        "devops": [
            "What is CI/CD?",
            "Explain container orchestration.",
            "What monitoring tools?",
            "How handle backups?",
            "What is infrastructure code?"
        ],
        "ai-ml": [
            "Supervised vs unsupervised?",
            "What is overfitting?",
            "Explain cross-validation.",
            "How handle imbalanced data?",
            "What evaluation metrics?"
        ],
        "cybersecurity": [
            "Auth vs authorization?",
            "What is SQL injection?",
            "Explain XSS attacks.",
            "Encryption vs hashing?",
            "What is least privilege?"
        ]
    }
    
    role_lower = role.lower()
    for key, questions in role_specific.items():
        if key in role_lower:
            return questions
    
    # Generic questions based on difficulty (all short)
    if difficulty == "easy":
        return [
            "Tell me about yourself.",
            "What technologies do you know?",
            "Describe a recent project.",
            "What are your strengths?",
            "Why this role?"
        ]
    elif difficulty == "hard":
        return [
            "Explain complex problem solved.",
            "How architect scalable systems?",
            "Describe debugging process.",
            "How handle technical debt?",
            "Explain performance optimization."
        ]
    else:  # medium or default
        if tech_stack:
            return [
                f"Experience with {tech_stack}?",
                f"Challenging {tech_stack} project?",
                f"How debug {tech_stack} issues?",
                f"Best practices for {tech_stack}?",
                f"How stay updated on {tech_stack}?"
            ]
        else:
            return [
                f"Experience in {role}?",
                "Hardest technical problem?",
                "How do you debug issues?",
                "Best practices in field?",
                "How stay updated on tech?"
            ]