// const express = require('express');
// const router = express.Router();
// const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');
// const Test = require('../models/Test');
// const axios = require('axios');

// // AI Backend URL
// const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

// /**
//  * POST - Generate questions using AI
//  */
// router.post('/generate-questions', authenticateAdmin, requireSuperAdmin, async (req, res) => {
//   try {
//     const { subject, topic, difficulty, count, questionType } = req.body;
    
//     console.log('Generating questions for:', { subject, topic, difficulty, count });
    
//     // Call your AI backend to generate questions
//     const response = await axios.post(`${AI_BACKEND_URL}/generate-questions`, {
//       subject,
//       topic,
//       difficulty,
//       count,
//       questionType: questionType || 'multiple-choice'
//     });
    
//     if (!response.data || !response.data.questions) {
//       throw new Error('AI backend returned invalid response');
//     }
    
//     res.json({
//       success: true,
//       questions: response.data.questions
//     });
    
//   } catch (error) {
//     console.error('AI Question Generation Error:', error);
    
//     // Fallback mock questions if AI is not available
//     const mockQuestions = generateMockQuestions(subject, topic, difficulty, count);
    
//     res.json({
//       success: true,
//       questions: mockQuestions,
//       isMock: true,
//       message: 'Using mock questions (AI backend not available)'
//     });
//   }
// });

// // Mock question generator for fallback
// function generateMockQuestions(subject, topic, difficulty, count) {
//   const questions = [];
//   const difficulties = { easy: 1, medium: 2, hard: 3 };
//   const difficultyLevel = difficulties[difficulty] || 2;
  
//   for (let i = 1; i <= count; i++) {
//     questions.push({
//       text: `What is a key concept in ${subject} related to ${topic}? (Question ${i})`,
//       options: [
//         'Option A - Basic concept',
//         'Option B - Intermediate concept',
//         'Option C - Advanced concept',
//         `Option D - ${topic.toUpperCase()} related concept`
//       ],
//       correctAnswer: 'Option A - Basic concept',
//       explanation: `This is a ${difficulty} level question about ${topic} in ${subject}.`,
//       difficulty: difficulty,
//       topic: topic
//     });
//   }
  
//   return questions;
// }

// module.exports = router;



const express = require('express');
const router = express.Router();
const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');
const Test = require('../models/Test');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Backend URL
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || `${BASE_URL}`;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST - Generate questions using Groq API (Primary) with fallback to Gemini
 */
router.post('/generate-questions', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { subject, topic, difficulty, count, questionType, additionalContext } = req.body;
    
    console.log('🎯 Generating questions for:', { subject, topic, difficulty, count });
    
    let questions = [];
    let usedModel = 'groq';
    
    // Try Groq API first
    if (GROQ_API_KEY) {
      try {
        questions = await generateWithGroq(subject, topic, difficulty, count, additionalContext);
        console.log(`✅ Generated ${questions.length} questions using Groq API`);
      } catch (groqError) {
        console.error('Groq API error:', groqError.message);
        usedModel = 'gemini';
        
        // Fallback to Gemini
        if (GEMINI_API_KEY) {
          questions = await generateWithGemini(subject, topic, difficulty, count, additionalContext);
          console.log(`✅ Generated ${questions.length} questions using Gemini API`);
        } else {
          // Final fallback to local generation
          questions = generateMockQuestions(subject, topic, difficulty, count);
          usedModel = 'local';
          console.log(`⚠️ Using local mock questions (${questions.length} generated)`);
        }
      }
    } 
    // Try Gemini if Groq not available
    else if (GEMINI_API_KEY) {
      questions = await generateWithGemini(subject, topic, difficulty, count, additionalContext);
      usedModel = 'gemini';
      console.log(`✅ Generated ${questions.length} questions using Gemini API`);
    } 
    // Local fallback
    else {
      questions = generateMockQuestions(subject, topic, difficulty, count);
      usedModel = 'local';
      console.log(`⚠️ Using local mock questions (${questions.length} generated)`);
    }
    
    res.json({
      success: true,
      questions: questions,
      count: questions.length,
      modelUsed: usedModel,
      message: `Generated ${questions.length} questions using ${usedModel}`
    });
    
  } catch (error) {
    console.error('AI Question Generation Error:', error);
    
    // Ultimate fallback
    const mockQuestions = generateMockQuestions(subject, topic, difficulty, count);
    
    res.json({
      success: true,
      questions: mockQuestions,
      count: mockQuestions.length,
      isMock: true,
      modelUsed: 'fallback',
      message: 'Using fallback questions (API unavailable)'
    });
  }
});

/**
 * Generate questions using Groq API
 */
async function generateWithGroq(subject, topic, difficulty, count, additionalContext = '') {
  const Groq = require('groq-sdk');
  const groq = new Groq({ apiKey: GROQ_API_KEY });
  
  const difficultyMap = {
    easy: 'basic foundational concepts',
    medium: 'intermediate-level practical applications',
    hard: 'advanced technical challenges and edge cases'
  };
  
  const difficultyDesc = difficultyMap[difficulty] || 'intermediate-level';
  
  const prompt = `You are an expert quiz creator for ${subject}. Generate ${count} multiple-choice questions about "${topic}".

REQUIREMENTS:
- Difficulty: ${difficulty} (${difficultyDesc})
- Each question must have 4 options (A, B, C, D)
- One clearly correct answer
- Include a brief explanation for why the answer is correct
- Questions should test understanding, not just memorization
- Make options plausible but with one clearly correct answer
${additionalContext ? `- Additional context: ${additionalContext}` : ''}

Return ONLY valid JSON in this exact format:
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Explanation of why this is correct",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]`;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a professional quiz creator. Return only valid JSON arrays. Each question must have exactly 4 options."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2000
  });
  
  const content = response.choices[0].message.content;
  const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from Groq');
  }
  
  const questions = JSON.parse(jsonMatch[0]);
  
  // Validate and format questions
  return questions.map((q, idx) => ({
    text: q.text,
    options: Array.isArray(q.options) && q.options.length === 4 ? q.options : generateDefaultOptions(q.text),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || `This ${difficulty} level question tests understanding of ${topic}.`,
    difficulty: difficulty,
    topic: topic,
    points: 1,
    order: idx
  }));
}

/**
 * Generate questions using Gemini API (fallback)
 */
async function generateWithGemini(subject, topic, difficulty, count, additionalContext = '') {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const difficultyMap = {
    easy: 'basic',
    medium: 'intermediate',
    hard: 'advanced'
  };
  
  const prompt = `Generate ${count} ${difficulty} level multiple-choice questions about "${topic}" for ${subject}.
  
Return ONLY valid JSON array:
[
  {
    "text": "question?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "explanation"
  }
]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from Gemini');
  }
  
  const questions = JSON.parse(jsonMatch[0]);
  
  return questions.map((q, idx) => ({
    text: q.text,
    options: Array.isArray(q.options) && q.options.length === 4 ? q.options : generateDefaultOptions(q.text),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || `This ${difficulty} question tests understanding of ${topic}.`,
    difficulty: difficulty,
    topic: topic,
    points: 1,
    order: idx
  }));
}

/**
 * Generate default options for a question
 */
function generateDefaultOptions(questionText) {
  return [
    "Correct answer based on the question",
    "Common misconception or distractor",
    "Partially correct but incomplete",
    "Incorrect or unrelated concept"
  ];
}

/**
 * Local mock question generator (ultimate fallback)
 */
function generateMockQuestions(subject, topic, difficulty, count) {
  const questions = [];
  const difficultyDesc = {
    easy: 'basic',
    medium: 'intermediate',
    hard: 'advanced'
  };
  
  const questionTemplates = [
    `What is a key ${difficultyDesc[difficulty]} concept in ${topic} for ${subject}?`,
    `How does ${topic} improve development in ${subject}?`,
    `What are the best practices for implementing ${topic} in ${subject}?`,
    `What is the core principle behind ${topic} in ${subject}?`,
    `What is the difference between ${topic} and alternative approaches?`,
    `How would you debug a common ${topic} issue?`,
    `What are the security considerations for ${topic}?`,
    `How do you optimize performance when using ${topic}?`
  ];
  
  const optionSets = [
    [`${difficultyDesc[difficulty]} understanding of ${topic}`, `Advanced theoretical knowledge`, `Basic foundational principles`, `All of the above`],
    [`Framework integration`, `Third-party libraries`, `Native implementation`, `Custom solution`],
    [`Security-first design`, `Performance optimization`, `Long-term maintainability`, `All of the above`],
    [`Industry best practice`, `Common design pattern`, `Widely adopted standard`, `Recommended approach`]
  ];
  
  for (let i = 0; i < Math.min(count, 50); i++) {
    const templateIndex = i % questionTemplates.length;
    const optionIndex = i % optionSets.length;
    
    questions.push({
      text: questionTemplates[templateIndex],
      options: optionSets[optionIndex],
      correctAnswer: optionSets[optionIndex][0],
      explanation: `This ${difficulty} question tests your understanding of ${topic} in ${subject}.`,
      difficulty: difficulty,
      topic: topic,
      points: 1,
      order: i
    });
  }
  
  return questions;
}

module.exports = router;