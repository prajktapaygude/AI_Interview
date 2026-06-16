
// require('dotenv').config({ path: __dirname + '/../.env' });
// console.log('🔑 GROQ_API_KEY available:', !!process.env.GROQ_API_KEY ? '✅ YES' : '❌ MISSING');

// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Test = require('../models/Test');
// const TestAttempt = require('../models/TestAttempt');
// const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');
// const { authenticateUser } = require('./auth');
// const Groq = require('groq-sdk');

// // Initialize Groq client
// let groqClient = null;
// if (process.env.GROQ_API_KEY) {
//   groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
//   console.log('✅ Groq client initialized for test generation');
// } else {
//   console.log('⚠️ GROQ_API_KEY not found - will use local mock questions only');
// }

// // Cache for generated questions (5 minute TTL)
// const questionCache = new Map();

// function getCacheKey(testId, userId) {
//   return `${testId}_${userId}`;
// }

// function cacheQuestions(key, questions) {
//   questionCache.set(key, {
//     questions: questions,
//     timestamp: Date.now(),
//     ttl: 5 * 60 * 1000
//   });
// }

// function getCachedQuestions(key) {
//   const cached = questionCache.get(key);
//   if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
//     return cached.questions;
//   }
//   questionCache.delete(key);
//   return null;
// }

// // ==================== NORMALIZATION HELPERS ====================
// function normalizeString(str) {
//   if (!str) return '';
//   return str.toString().trim().replace(/\s+/g, ' ');
// }

// /**
//  * Converts letter answers (e.g., "B") to the full option text.
//  * If the answer is already full text, returns it normalized.
//  */
// function normalizeCorrectAnswer(correctAnswer, options) {
//   const normalized = normalizeString(correctAnswer);
//   // Check if it's a single letter A-D (case-insensitive)
//   const letterMatch = normalized.match(/^[A-D]$/i);
//   if (letterMatch && options && options.length) {
//     const index = letterMatch[0].toUpperCase().charCodeAt(0) - 65; // A->0, B->1, etc.
//     if (options[index]) {
//       return normalizeString(options[index]);
//     }
//   }
//   return normalized;
// }

// function normalizeQuestion(q) {
//   const normalizedOptions = q.options.map(opt => normalizeString(opt));
//   return {
//     ...q,
//     text: normalizeString(q.text),
//     options: normalizedOptions,
//     correctAnswer: normalizeCorrectAnswer(q.correctAnswer, normalizedOptions),
//     explanation: q.explanation ? normalizeString(q.explanation) : q.explanation
//   };
// }

// function normalizeQuestionsArray(questions) {
//   return questions.map(q => normalizeQuestion(q));
// }

// // ==================== QUESTION GENERATION ====================
// async function generateFreshQuestions(subject, topic, difficulty, count, attemptNumber = 1) {
//   const questionCount = Math.min(count || 10, 50);
//   if (!groqClient || !process.env.GROQ_API_KEY) {
//     console.log('⚠️ Groq not available');
//     return null;
//   }
//   try {
//     console.log(`🤖 Generating ${questionCount} NEW questions (Attempt #${attemptNumber}) for "${topic}"...`);
    
//     const difficultyMap = {
//       easy: 'basic foundational concepts',
//       medium: 'intermediate-level practical applications',
//       hard: 'advanced technical challenges and edge cases'
//     };
    
//     const prompt = `You are an expert quiz creator for ${subject}. Generate ${questionCount} COMPLETELY NEW, UNIQUE, high-quality multiple-choice questions about "${topic}".

// REQUIREMENTS:
// - Difficulty: ${difficulty} (${difficultyMap[difficulty] || 'intermediate'})
// - Each question must have exactly 4 options
// - One clearly correct answer
// - Include a detailed explanation
// - Cover different aspects of ${topic}
// - Be creative and test real understanding

// CRITICAL: The "correctAnswer" field MUST be the FULL TEXT of the correct option (e.g., "Paris" not "A"). DO NOT use letters (A, B, C, D) as the correct answer.

// Return ONLY valid JSON array:
// [
//   {
//     "text": "Question text?",
//     "options": ["Option A", "Option B", "Option C", "Option D"],
//     "correctAnswer": "Full text of the correct option",
//     "explanation": "Detailed explanation",
//     "difficulty": "${difficulty}",
//     "topic": "${topic}"
//   }
// ]`;

//     const response = await groqClient.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: "You are a professional quiz creator. Return only valid JSON arrays. Always put the full option text in 'correctAnswer', never a letter."
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       model: "llama-3.1-8b-instant",
//       temperature: 0.7,  // lower for more consistent outputs
//       max_tokens: 2000
//     });
    
//     const content = response.choices[0].message.content;
//     let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
//     const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
//     if (!jsonMatch) {
//       throw new Error('Invalid JSON response');
//     }
    
//     const groqQuestions = JSON.parse(jsonMatch[0]);
//     console.log(`✅ Generated ${groqQuestions.length} NEW questions from Groq`);
    
//     // Normalize and fix letter answers
//     return groqQuestions.slice(0, questionCount).map((q, idx) => normalizeQuestion({
//       _id: new mongoose.Types.ObjectId(),
//       text: q.text,
//       options: q.options,
//       correctAnswer: q.correctAnswer,
//       explanation: q.explanation || `This ${difficulty} question tests understanding of ${topic}.`,
//       difficulty: difficulty,
//       topic: topic,
//       points: 1,
//       order: idx
//     }));
    
//   } catch (err) {
//     console.error('❌ Groq API failed:', err.message);
//     return null;
//   }
// }

// function generateLocalMockQuestions(subject, topic, difficulty, count) {
//   const questions = [];
//   const difficultyDesc = { easy: 'basic', medium: 'intermediate', hard: 'advanced' };
//   const level = difficultyDesc[difficulty] || 'intermediate';
  
//   for (let i = 0; i < Math.min(count, 50); i++) {
//     questions.push(normalizeQuestion({
//       _id: new mongoose.Types.ObjectId(),
//       text: `What is a key ${level} concept in ${topic} for ${subject}? (Question ${i + 1})`,
//       options: [
//         `${level} understanding of ${topic}`,
//         `Advanced theoretical knowledge`,
//         `Basic foundational principles`,
//         `All of the above`
//       ],
//       correctAnswer: `${level} understanding of ${topic}`,
//       explanation: `This ${difficulty} question tests your understanding of ${topic} in ${subject}.`,
//       difficulty: difficulty,
//       topic: topic,
//       points: 1,
//       order: i
//     }));
//   }
//   return questions;
// }

// // ==================== ADMIN ROUTES ====================
// router.get('/admin/tests', authenticateAdmin, async (req, res) => {
//   try {
//     let tests;
//     if (req.query.subjectId) {
//       tests = await Test.find({ subjectId: req.query.subjectId })
//         .populate('subjectId', 'name icon color')
//         .sort({ createdAt: -1 });
//     } else {
//       tests = await Test.find({})
//         .populate('subjectId', 'name icon color')
//         .populate('createdBy', 'name email')
//         .sort({ createdAt: -1 });
//     }
//     res.json({ success: true, tests, count: tests.length });
//   } catch (error) {
//     console.error('GET TESTS ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.get('/admin/tests/:id', authenticateAdmin, async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid test ID format', success: false });
//     }
//     const test = await Test.findById(req.params.id)
//       .populate('subjectId', 'name icon color category')
//       .populate('createdBy', 'name email');
//     if (!test) return res.status(404).json({ error: 'Test not found', success: false });
//     res.json({ success: true, test });
//   } catch (error) {
//     console.error('GET TEST ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.post('/admin/tests', authenticateAdmin, requireSuperAdmin, async (req, res) => {
//   try {
//     const { 
//       subjectId, subjectName, topic, difficulty, title,
//       description, duration, totalQuestions, passingScore,
//       isActive, questions: manualQuestions
//     } = req.body;
    
//     let questions = manualQuestions || generateLocalMockQuestions(subjectName, topic, difficulty, totalQuestions || 10);
//     questions = normalizeQuestionsArray(questions);
    
//     const testData = {
//       title, description, subjectId, subjectName, topic,
//       duration: duration || 30,
//       totalQuestions: totalQuestions || questions.length,
//       passingScore: passingScore || 70,
//       difficulty: difficulty || 'medium',
//       questions,
//       isActive: isActive !== undefined ? isActive : true,
//       createdBy: req.admin._id || req.admin.id,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     const test = new Test(testData);
//     await test.save();
//     res.status(201).json({ success: true, message: 'Test created successfully', test });
//   } catch (error) {
//     console.error('CREATE TEST ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.put('/admin/tests/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid test ID format', success: false });
//     }
//     const test = await Test.findById(req.params.id);
//     if (!test) return res.status(404).json({ error: 'Test not found', success: false });
//     if (req.body.questions) {
//       req.body.questions = normalizeQuestionsArray(req.body.questions);
//     }
//     Object.assign(test, req.body);
//     test.updatedAt = new Date();
//     await test.save();
//     res.json({ success: true, message: 'Test updated successfully', test });
//   } catch (error) {
//     console.error('UPDATE TEST ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.delete('/admin/tests/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid test ID format', success: false });
//     }
//     const test = await Test.findByIdAndDelete(req.params.id);
//     if (!test) return res.status(404).json({ error: 'Test not found', success: false });
//     await TestAttempt.deleteMany({ testId: req.params.id });
//     res.json({ success: true, message: 'Test deleted successfully' });
//   } catch (error) {
//     console.error('DELETE TEST ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// // ==================== USER ROUTES ====================
// router.get('/user/tests', authenticateUser, async (req, res) => {
//   try {
//     const tests = await Test.find({ isActive: true })
//       .populate('subjectId', 'name icon color')
//       .select('title description subjectName topic duration totalQuestions passingScore difficulty createdAt')
//       .sort({ createdAt: -1 });
//     const attempts = await TestAttempt.find({ userId: req.user._id, testId: { $in: tests.map(t => t._id) } });
//     const testsWithStatus = tests.map(test => {
//       const testAttempts = attempts.filter(a => a.testId.toString() === test._id.toString());
//       const completedAttempt = testAttempts.find(a => a.status === 'completed');
//       return {
//         ...test.toObject(),
//         attempted: testAttempts.length > 0,
//         attemptScore: completedAttempt?.score || null,
//         attemptPassed: completedAttempt?.isPassed || false,
//         attemptDate: completedAttempt?.completedAt || null,
//         attemptsCount: testAttempts.length
//       };
//     });
//     res.json({ success: true, tests: testsWithStatus, count: testsWithStatus.length });
//   } catch (error) {
//     console.error('GET USER TESTS ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.get('/user/tests/:id', authenticateUser, async (req, res) => {
//   try {
//     const testId = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(testId)) {
//       return res.status(400).json({ error: 'Invalid test ID format', success: false });
//     }
//     const test = await Test.findOne({ _id: testId, isActive: true });
//     if (!test) return res.status(404).json({ error: 'Test not found or inactive', success: false });
    
//     let existingAttempt = await TestAttempt.findOne({ testId: test._id, userId: req.user._id, status: 'in-progress' });
//     if (existingAttempt) {
//       const normalizedQuestions = normalizeQuestionsArray(existingAttempt.questions);
//       if (JSON.stringify(normalizedQuestions) !== JSON.stringify(existingAttempt.questions)) {
//         existingAttempt.questions = normalizedQuestions;
//         await existingAttempt.save();
//         console.log(`🔧 Normalized questions for existing attempt ${existingAttempt._id}`);
//       }
//       return res.json({
//         success: true,
//         test: {
//           _id: test._id,
//           title: test.title,
//           description: test.description,
//           duration: test.duration,
//           totalQuestions: existingAttempt.questions.length,
//           passingScore: test.passingScore,
//           difficulty: test.difficulty,
//           subjectName: test.subjectName,
//           topic: test.topic,
//           questions: existingAttempt.questions.map(q => ({
//             _id: q._id,
//             text: q.text,
//             options: q.options,
//             correctAnswer: q.correctAnswer,
//             explanation: q.explanation,
//             points: q.points,
//             order: q.order
//           })),
//           attemptId: existingAttempt._id
//         },
//         existingAttempt: true
//       });
//     }
    
//     const cacheKey = getCacheKey(testId, req.user._id);
//     let questionsForAttempt = getCachedQuestions(cacheKey);
//     const previousAttemptsCount = await TestAttempt.countDocuments({ testId: test._id, userId: req.user._id, status: 'completed' });
//     const isRetake = previousAttemptsCount > 0;
    
//     if (!questionsForAttempt) {
//       console.log(`🎲 Generating fresh questions for ${isRetake ? 'retake' : 'first attempt'}...`);
//       if (groqClient && process.env.GROQ_API_KEY) {
//         questionsForAttempt = await generateFreshQuestions(test.subjectName, test.topic, test.difficulty, test.totalQuestions, previousAttemptsCount + 1);
//       }
//       if (!questionsForAttempt || questionsForAttempt.length === 0) {
//         console.log('⚠️ Using original test questions as fallback');
//         questionsForAttempt = JSON.parse(JSON.stringify(test.questions));
//         questionsForAttempt = normalizeQuestionsArray(questionsForAttempt);
//       }
//       cacheQuestions(cacheKey, questionsForAttempt);
//       console.log(`💾 Cached ${questionsForAttempt.length} normalized questions`);
//     } else {
//       console.log(`📦 Using cached normalized questions (${questionsForAttempt.length})`);
//     }
    
//     const attempt = new TestAttempt({
//       testId: test._id,
//       userId: req.user._id,
//       questions: questionsForAttempt,
//       answers: new Array(questionsForAttempt.length).fill(null),
//       startedAt: new Date(),
//       status: 'in-progress'
//     });
//     await attempt.save();
//     console.log(`✅ Created new attempt: ${attempt._id}`);
    
//     const displayQuestions = questionsForAttempt.map((q, idx) => ({
//       _id: q._id,
//       text: q.text,
//       options: q.options,
//       correctAnswer: q.correctAnswer,
//       explanation: q.explanation,
//       difficulty: q.difficulty,
//       points: q.points,
//       order: idx
//     }));
    
//     res.json({
//       success: true,
//       test: {
//         _id: test._id,
//         title: test.title,
//         description: test.description,
//         duration: test.duration,
//         totalQuestions: questionsForAttempt.length,
//         passingScore: test.passingScore,
//         difficulty: test.difficulty,
//         subjectName: test.subjectName,
//         topic: test.topic,
//         questions: displayQuestions,
//         attemptId: attempt._id
//       },
//       isRetake: isRetake,
//       retakeNumber: previousAttemptsCount + 1,
//       questionsGenerated: true
//     });
//   } catch (error) {
//     console.error('GET TEST ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.post('/user/tests/:id/save-answer', authenticateUser, async (req, res) => {
//   try {
//     const { questionIndex, answer, attemptId } = req.body;
//     const attempt = await TestAttempt.findOne({ _id: attemptId, userId: req.user._id, status: 'in-progress' });
//     if (!attempt) return res.status(404).json({ error: 'Attempt not found', success: false });
//     if (questionIndex >= 0 && questionIndex < attempt.answers.length) {
//       const normalizedAnswer = normalizeString(answer);
//       attempt.answers[questionIndex] = normalizedAnswer;
//       await attempt.save();
//       console.log(`💾 Saved normalized answer for Q${questionIndex}: "${normalizedAnswer}"`);
//     }
//     res.json({ success: true, message: 'Answer saved' });
//   } catch (error) {
//     console.error('SAVE ANSWER ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.post('/user/tests/:id/submit', authenticateUser, async (req, res) => {
//   try {
//     const testId = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(testId)) {
//       return res.status(400).json({ error: 'Invalid test ID format', success: false });
//     }
//     const test = await Test.findById(testId);
//     if (!test || !test.isActive) return res.status(404).json({ error: 'Test not found or inactive', success: false });
    
//     const { answers, timeSpent, attemptId } = req.body;
//     let attempt = await TestAttempt.findOne({ _id: attemptId, userId: req.user._id });
//     if (!attempt) return res.status(404).json({ error: 'Attempt not found', success: false });
    
//     const normalizedStoredQuestions = normalizeQuestionsArray(attempt.questions);
//     if (JSON.stringify(normalizedStoredQuestions) !== JSON.stringify(attempt.questions)) {
//       attempt.questions = normalizedStoredQuestions;
//       await attempt.save();
//       console.log(`🔧 Normalized questions during submission for attempt ${attemptId}`);
//     }
    
//     const attemptQuestions = attempt.questions;
//     const userAnswersRaw = answers || attempt.answers;
//     if (!attemptQuestions || attemptQuestions.length === 0) {
//       return res.status(400).json({ error: 'No questions found', success: false });
//     }
    
//     let correctAnswers = 0;
//     let totalPoints = 0;
//     const detailedResults = [];
//     console.log(`📝 Scoring ${attemptQuestions.length} questions...`);
    
//     for (let index = 0; index < attemptQuestions.length; index++) {
//       const question = attemptQuestions[index];
//       const rawUserAnswer = userAnswersRaw?.[index] ?? null;
//       const normalizedUserAnswer = normalizeString(rawUserAnswer);
//       const normalizedCorrectAnswer = normalizeString(question.correctAnswer);
//       const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
//       const pointsEarned = isCorrect ? (question.points || 1) : 0;
      
//       console.log(`  Q${index+1}: User: "${rawUserAnswer}" -> norm: "${normalizedUserAnswer}"`);
//       console.log(`     Correct: "${question.correctAnswer}" -> norm: "${normalizedCorrectAnswer}" => ${isCorrect ? '✓' : '✗'}`);
      
//       if (isCorrect) correctAnswers++;
//       totalPoints += pointsEarned;
//       detailedResults.push({
//         questionId: question._id,
//         questionText: question.text,
//         userAnswer: rawUserAnswer || 'Not answered',
//         correctAnswer: question.correctAnswer,
//         isCorrect,
//         explanation: question.explanation || '',
//         pointsEarned,
//         totalPoints: question.points || 1
//       });
//     }
    
//     const totalPossiblePoints = attemptQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
//     const percentageScore = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;
//     const isPassed = percentageScore >= test.passingScore;
//     console.log(`📊 FINAL SCORE: ${correctAnswers}/${attemptQuestions.length} correct = ${percentageScore.toFixed(1)}% (${isPassed ? 'PASSED' : 'FAILED'})`);
    
//     attempt.answers = userAnswersRaw;
//     attempt.score = Math.round(percentageScore * 100) / 100;
//     attempt.correctAnswers = correctAnswers;
//     attempt.incorrectAnswers = attemptQuestions.length - correctAnswers;
//     attempt.totalPoints = totalPoints;
//     attempt.timeSpent = timeSpent || 0;
//     attempt.completedAt = new Date();
//     attempt.isPassed = isPassed;
//     attempt.status = 'completed';
//     attempt.detailedResults = detailedResults;
//     await attempt.save();
    
//     const cacheKey = getCacheKey(testId, req.user._id);
//     questionCache.delete(cacheKey);
//     console.log(`🗑️ Cleared cache for ${cacheKey}`);
    
//     res.json({
//       success: true,
//       message: 'Test submitted successfully',
//       score: percentageScore,
//       correctAnswers,
//       incorrectAnswers: attemptQuestions.length - correctAnswers,
//       totalQuestions: attemptQuestions.length,
//       isPassed,
//       passingScore: test.passingScore,
//       attemptId: attempt._id,
//       detailedResults
//     });
//   } catch (error) {
//     console.error('SUBMIT TEST ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.get('/user/tests/history', authenticateUser, async (req, res) => {
//   try {
//     const attempts = await TestAttempt.find({ userId: req.user._id, status: 'completed' })
//       .populate('testId', 'title subjectName topic totalQuestions passingScore')
//       .sort({ completedAt: -1 });
//     res.json({ success: true, attempts, count: attempts.length });
//   } catch (error) {
//     console.error('GET TEST HISTORY ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.get('/user/attempts/:attemptId', authenticateUser, async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.attemptId)) {
//       return res.status(400).json({ error: 'Invalid attempt ID format', success: false });
//     }
//     const attempt = await TestAttempt.findOne({ _id: req.params.attemptId, userId: req.user._id })
//       .populate('testId', 'title subjectName passingScore');
//     if (!attempt) return res.status(404).json({ error: 'Attempt not found', success: false });
    
//     const questionsWithComparison = attempt.questions?.map((q, idx) => {
//       const userAnswer = attempt.answers?.[idx];
//       const isCorrect = normalizeString(userAnswer) === normalizeString(q.correctAnswer);
//       return {
//         text: q.text,
//         options: q.options,
//         correctAnswer: q.correctAnswer,
//         userAnswer: userAnswer || 'Not answered',
//         isCorrect,
//         explanation: q.explanation
//       };
//     });
    
//     res.json({
//       success: true,
//       attempt: {
//         _id: attempt._id,
//         test: attempt.testId,
//         score: attempt.score,
//         isPassed: attempt.isPassed,
//         completedAt: attempt.completedAt,
//         timeSpent: attempt.timeSpent,
//         correctAnswers: attempt.correctAnswers,
//         incorrectAnswers: attempt.incorrectAnswers,
//         totalQuestions: attempt.questions?.length || 0,
//         detailedResults: attempt.detailedResults,
//         questions: questionsWithComparison
//       }
//     });
//   } catch (error) {
//     console.error('GET ATTEMPT DETAILS ERROR:', error);
//     res.status(500).json({ error: error.message, success: false });
//   }
// });

// router.get('/test-debug', (req, res) => {
//   res.json({
//     message: 'Test routes are mounted correctly!',
//     timestamp: new Date(),
//     groqConfigured: !!process.env.GROQ_API_KEY,
//     cacheSize: questionCache.size
//   });
// });

// module.exports = router;







require('dotenv').config({ path: __dirname + '/../.env' });
console.log('🔑 GROQ_API_KEY available:', !!process.env.GROQ_API_KEY ? '✅ YES' : '❌ MISSING');

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');
const { authenticateUser } = require('./auth');
const Groq = require('groq-sdk');

// Initialize Groq client
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log('✅ Groq client initialized for test generation');
} else {
  console.log('⚠️ GROQ_API_KEY not found - will use local mock questions only');
}

// Cache for generated questions (5 minute TTL)
const questionCache = new Map();

function getCacheKey(testId, userId) {
  return `${testId}_${userId}`;
}

function cacheQuestions(key, questions) {
  questionCache.set(key, {
    questions: questions,
    timestamp: Date.now(),
    ttl: 5 * 60 * 1000
  });
}

function getCachedQuestions(key) {
  const cached = questionCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
    return cached.questions;
  }
  questionCache.delete(key);
  return null;
}

// ==================== NORMALIZATION HELPERS ====================
function normalizeString(str) {
  if (!str) return '';
  return str.toString().trim().replace(/\s+/g, ' ');
}

/**
 * Converts any form of answer indicator (letter, "Option A", "A.", etc.)
 * to the full option text.
 */
function normalizeCorrectAnswer(correctAnswer, options) {
  const normalized = normalizeString(correctAnswer);
  if (!options || options.length === 0) return normalized;

  // Try to extract a letter (A, B, C, D) from various patterns
  let letterMatch = null;
  
  // 1. Exactly a single letter (case-insensitive)
  if (/^[A-D]$/i.test(normalized)) {
    letterMatch = normalized.toUpperCase();
  }
  // 2. Pattern: "Option A", "option a", "Option A.", "option a)"
  else {
    const match = normalized.match(/option\s*([A-D])/i) ||
                  normalized.match(/^([A-D])[\.\)]/i) ||
                  normalized.match(/[^a-z]([A-D])[\.\)\s]/i);
    if (match) letterMatch = match[1].toUpperCase();
  }

  if (letterMatch) {
    const index = letterMatch.charCodeAt(0) - 65; // A->0, B->1, etc.
    if (options[index]) {
      return normalizeString(options[index]);
    }
  }

  // If no letter pattern found, assume it's already full text (or fallback)
  return normalized;
}

function normalizeQuestion(q) {
  const normalizedOptions = q.options.map(opt => normalizeString(opt));
  return {
    ...q,
    text: normalizeString(q.text),
    options: normalizedOptions,
    correctAnswer: normalizeCorrectAnswer(q.correctAnswer, normalizedOptions),
    explanation: q.explanation ? normalizeString(q.explanation) : q.explanation
  };
}

function normalizeQuestionsArray(questions) {
  return questions.map(q => normalizeQuestion(q));
}

// ==================== QUESTION GENERATION ====================
async function generateFreshQuestions(subject, topic, difficulty, count, attemptNumber = 1) {
  const questionCount = Math.min(count || 10, 50);
  if (!groqClient || !process.env.GROQ_API_KEY) {
    console.log('⚠️ Groq not available');
    return null;
  }
  try {
    console.log(`🤖 Generating ${questionCount} NEW questions (Attempt #${attemptNumber}) for "${topic}"...`);
    
    const difficultyMap = {
      easy: 'basic foundational concepts',
      medium: 'intermediate-level practical applications',
      hard: 'advanced technical challenges and edge cases'
    };
    
    const prompt = `You are an expert quiz creator for ${subject}. Generate ${questionCount} COMPLETELY NEW, UNIQUE, high-quality multiple-choice questions about "${topic}".

REQUIREMENTS:
- Difficulty: ${difficulty} (${difficultyMap[difficulty] || 'intermediate'})
- Each question must have exactly 4 options
- One clearly correct answer
- Include a detailed explanation
- Cover different aspects of ${topic}
- Be creative and test real understanding

CRITICAL: The "correctAnswer" field MUST be the FULL TEXT of the correct option (e.g., "Paris" not "A" or "Option A"). DO NOT use letters, abbreviations, or "Option X" as the correct answer.

Return ONLY valid JSON array:
[
  {
    "text": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Full text of the correct option",
    "explanation": "Detailed explanation",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]`;

    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional quiz creator. Return only valid JSON arrays. Always put the full option text in 'correctAnswer', never a letter or 'Option X'."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const content = response.choices[0].message.content;
    let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }
    
    const groqQuestions = JSON.parse(jsonMatch[0]);
    console.log(`✅ Generated ${groqQuestions.length} NEW questions from Groq`);
    
    return groqQuestions.slice(0, questionCount).map((q, idx) => normalizeQuestion({
      _id: new mongoose.Types.ObjectId(),
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || `This ${difficulty} question tests understanding of ${topic}.`,
      difficulty: difficulty,
      topic: topic,
      points: 1,
      order: idx
    }));
    
  } catch (err) {
    console.error('❌ Groq API failed:', err.message);
    return null;
  }
}

function generateLocalMockQuestions(subject, topic, difficulty, count) {
  const questions = [];
  const difficultyDesc = { easy: 'basic', medium: 'intermediate', hard: 'advanced' };
  const level = difficultyDesc[difficulty] || 'intermediate';
  
  for (let i = 0; i < Math.min(count, 50); i++) {
    questions.push(normalizeQuestion({
      _id: new mongoose.Types.ObjectId(),
      text: `What is a key ${level} concept in ${topic} for ${subject}? (Question ${i + 1})`,
      options: [
        `${level} understanding of ${topic}`,
        `Advanced theoretical knowledge`,
        `Basic foundational principles`,
        `All of the above`
      ],
      correctAnswer: `${level} understanding of ${topic}`,
      explanation: `This ${difficulty} question tests your understanding of ${topic} in ${subject}.`,
      difficulty: difficulty,
      topic: topic,
      points: 1,
      order: i
    }));
  }
  return questions;
}

// ==================== ADMIN ROUTES (unchanged logic) ====================
router.get('/admin/tests', authenticateAdmin, async (req, res) => {
  try {
    let tests;
    if (req.query.subjectId) {
      tests = await Test.find({ subjectId: req.query.subjectId })
        .populate('subjectId', 'name icon color')
        .sort({ createdAt: -1 });
    } else {
      tests = await Test.find({})
        .populate('subjectId', 'name icon color')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json({ success: true, tests, count: tests.length });
  } catch (error) {
    console.error('GET TESTS ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.get('/admin/tests/:id', authenticateAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid test ID format', success: false });
    }
    const test = await Test.findById(req.params.id)
      .populate('subjectId', 'name icon color category')
      .populate('createdBy', 'name email');
    if (!test) return res.status(404).json({ error: 'Test not found', success: false });
    res.json({ success: true, test });
  } catch (error) {
    console.error('GET TEST ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.post('/admin/tests', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      subjectId, subjectName, topic, difficulty, title,
      description, duration, totalQuestions, passingScore,
      isActive, questions: manualQuestions
    } = req.body;
    
    let questions = manualQuestions || generateLocalMockQuestions(subjectName, topic, difficulty, totalQuestions || 10);
    questions = normalizeQuestionsArray(questions);
    
    const testData = {
      title, description, subjectId, subjectName, topic,
      duration: duration || 30,
      totalQuestions: totalQuestions || questions.length,
      passingScore: passingScore || 70,
      difficulty: difficulty || 'medium',
      questions,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.admin._id || req.admin.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const test = new Test(testData);
    await test.save();
    res.status(201).json({ success: true, message: 'Test created successfully', test });
  } catch (error) {
    console.error('CREATE TEST ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.put('/admin/tests/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid test ID format', success: false });
    }
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found', success: false });
    if (req.body.questions) {
      req.body.questions = normalizeQuestionsArray(req.body.questions);
    }
    Object.assign(test, req.body);
    test.updatedAt = new Date();
    await test.save();
    res.json({ success: true, message: 'Test updated successfully', test });
  } catch (error) {
    console.error('UPDATE TEST ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.delete('/admin/tests/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid test ID format', success: false });
    }
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found', success: false });
    await TestAttempt.deleteMany({ testId: req.params.id });
    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    console.error('DELETE TEST ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// ==================== USER ROUTES ====================
router.get('/user/tests', authenticateUser, async (req, res) => {
  try {
    const tests = await Test.find({ isActive: true })
      .populate('subjectId', 'name icon color')
      .select('title description subjectName topic duration totalQuestions passingScore difficulty createdAt')
      .sort({ createdAt: -1 });
    const attempts = await TestAttempt.find({ userId: req.user._id, testId: { $in: tests.map(t => t._id) } });
    const testsWithStatus = tests.map(test => {
      const testAttempts = attempts.filter(a => a.testId.toString() === test._id.toString());
      const completedAttempt = testAttempts.find(a => a.status === 'completed');
      return {
        ...test.toObject(),
        attempted: testAttempts.length > 0,
        attemptScore: completedAttempt?.score || null,
        attemptPassed: completedAttempt?.isPassed || false,
        attemptDate: completedAttempt?.completedAt || null,
        attemptsCount: testAttempts.length
      };
    });
    res.json({ success: true, tests: testsWithStatus, count: testsWithStatus.length });
  } catch (error) {
    console.error('GET USER TESTS ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.get('/user/tests/:id', authenticateUser, async (req, res) => {
  try {
    const testId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ error: 'Invalid test ID format', success: false });
    }
    const test = await Test.findOne({ _id: testId, isActive: true });
    if (!test) return res.status(404).json({ error: 'Test not found or inactive', success: false });
    
    let existingAttempt = await TestAttempt.findOne({ testId: test._id, userId: req.user._id, status: 'in-progress' });
    if (existingAttempt) {
      const normalizedQuestions = normalizeQuestionsArray(existingAttempt.questions);
      if (JSON.stringify(normalizedQuestions) !== JSON.stringify(existingAttempt.questions)) {
        existingAttempt.questions = normalizedQuestions;
        await existingAttempt.save();
        console.log(`🔧 Normalized questions for existing attempt ${existingAttempt._id}`);
      }
      return res.json({
        success: true,
        test: {
          _id: test._id,
          title: test.title,
          description: test.description,
          duration: test.duration,
          totalQuestions: existingAttempt.questions.length,
          passingScore: test.passingScore,
          difficulty: test.difficulty,
          subjectName: test.subjectName,
          topic: test.topic,
          questions: existingAttempt.questions.map(q => ({
            _id: q._id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
            order: q.order
          })),
          attemptId: existingAttempt._id
        },
        existingAttempt: true
      });
    }
    
    const cacheKey = getCacheKey(testId, req.user._id);
    let questionsForAttempt = getCachedQuestions(cacheKey);
    const previousAttemptsCount = await TestAttempt.countDocuments({ testId: test._id, userId: req.user._id, status: 'completed' });
    const isRetake = previousAttemptsCount > 0;
    
    if (!questionsForAttempt) {
      console.log(`🎲 Generating fresh questions for ${isRetake ? 'retake' : 'first attempt'}...`);
      if (groqClient && process.env.GROQ_API_KEY) {
        questionsForAttempt = await generateFreshQuestions(test.subjectName, test.topic, test.difficulty, test.totalQuestions, previousAttemptsCount + 1);
      }
      if (!questionsForAttempt || questionsForAttempt.length === 0) {
        console.log('⚠️ Using original test questions as fallback');
        questionsForAttempt = JSON.parse(JSON.stringify(test.questions));
        questionsForAttempt = normalizeQuestionsArray(questionsForAttempt);
      }
      cacheQuestions(cacheKey, questionsForAttempt);
      console.log(`💾 Cached ${questionsForAttempt.length} normalized questions`);
    } else {
      console.log(`📦 Using cached normalized questions (${questionsForAttempt.length})`);
    }
    
    const attempt = new TestAttempt({
      testId: test._id,
      userId: req.user._id,
      questions: questionsForAttempt,
      answers: new Array(questionsForAttempt.length).fill(null),
      startedAt: new Date(),
      status: 'in-progress'
    });
    await attempt.save();
    console.log(`✅ Created new attempt: ${attempt._id}`);
    
    const displayQuestions = questionsForAttempt.map((q, idx) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: q.points,
      order: idx
    }));
    
    res.json({
      success: true,
      test: {
        _id: test._id,
        title: test.title,
        description: test.description,
        duration: test.duration,
        totalQuestions: questionsForAttempt.length,
        passingScore: test.passingScore,
        difficulty: test.difficulty,
        subjectName: test.subjectName,
        topic: test.topic,
        questions: displayQuestions,
        attemptId: attempt._id
      },
      isRetake: isRetake,
      retakeNumber: previousAttemptsCount + 1,
      questionsGenerated: true
    });
  } catch (error) {
    console.error('GET TEST ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.post('/user/tests/:id/save-answer', authenticateUser, async (req, res) => {
  try {
    const { questionIndex, answer, attemptId } = req.body;
    const attempt = await TestAttempt.findOne({ _id: attemptId, userId: req.user._id, status: 'in-progress' });
    if (!attempt) return res.status(404).json({ error: 'Attempt not found', success: false });
    if (questionIndex >= 0 && questionIndex < attempt.answers.length) {
      const normalizedAnswer = normalizeString(answer);
      attempt.answers[questionIndex] = normalizedAnswer;
      await attempt.save();
      console.log(`💾 Saved normalized answer for Q${questionIndex}: "${normalizedAnswer}"`);
    }
    res.json({ success: true, message: 'Answer saved' });
  } catch (error) {
    console.error('SAVE ANSWER ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.post('/user/tests/:id/submit', authenticateUser, async (req, res) => {
  try {
    const testId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ error: 'Invalid test ID format', success: false });
    }
    const test = await Test.findById(testId);
    if (!test || !test.isActive) return res.status(404).json({ error: 'Test not found or inactive', success: false });
    
    const { answers, timeSpent, attemptId } = req.body;
    let attempt = await TestAttempt.findOne({ _id: attemptId, userId: req.user._id });
    if (!attempt) return res.status(404).json({ error: 'Attempt not found', success: false });
    
    const normalizedStoredQuestions = normalizeQuestionsArray(attempt.questions);
    if (JSON.stringify(normalizedStoredQuestions) !== JSON.stringify(attempt.questions)) {
      attempt.questions = normalizedStoredQuestions;
      await attempt.save();
      console.log(`🔧 Normalized questions during submission for attempt ${attemptId}`);
    }
    
    const attemptQuestions = attempt.questions;
    const userAnswersRaw = answers || attempt.answers;
    if (!attemptQuestions || attemptQuestions.length === 0) {
      return res.status(400).json({ error: 'No questions found', success: false });
    }
    
    let correctAnswers = 0;
    let totalPoints = 0;
    const detailedResults = [];
    console.log(`📝 Scoring ${attemptQuestions.length} questions...`);
    
    for (let index = 0; index < attemptQuestions.length; index++) {
      const question = attemptQuestions[index];
      const rawUserAnswer = userAnswersRaw?.[index] ?? null;
      const normalizedUserAnswer = normalizeString(rawUserAnswer);
      const normalizedCorrectAnswer = normalizeString(question.correctAnswer);
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      const pointsEarned = isCorrect ? (question.points || 1) : 0;
      
      console.log(`  Q${index+1}: User: "${rawUserAnswer}" -> norm: "${normalizedUserAnswer}"`);
      console.log(`     Correct: "${question.correctAnswer}" -> norm: "${normalizedCorrectAnswer}" => ${isCorrect ? '✓' : '✗'}`);
      
      if (isCorrect) correctAnswers++;
      totalPoints += pointsEarned;
      detailedResults.push({
        questionId: question._id,
        questionText: question.text,
        userAnswer: rawUserAnswer || 'Not answered',
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || '',
        pointsEarned,
        totalPoints: question.points || 1
      });
    }
    
    const totalPossiblePoints = attemptQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentageScore = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;
    const isPassed = percentageScore >= test.passingScore;
    console.log(`📊 FINAL SCORE: ${correctAnswers}/${attemptQuestions.length} correct = ${percentageScore.toFixed(1)}% (${isPassed ? 'PASSED' : 'FAILED'})`);
    
    attempt.answers = userAnswersRaw;
    attempt.score = Math.round(percentageScore * 100) / 100;
    attempt.correctAnswers = correctAnswers;
    attempt.incorrectAnswers = attemptQuestions.length - correctAnswers;
    attempt.totalPoints = totalPoints;
    attempt.timeSpent = timeSpent || 0;
    attempt.completedAt = new Date();
    attempt.isPassed = isPassed;
    attempt.status = 'completed';
    attempt.detailedResults = detailedResults;
    await attempt.save();
    
    const cacheKey = getCacheKey(testId, req.user._id);
    questionCache.delete(cacheKey);
    console.log(`🗑️ Cleared cache for ${cacheKey}`);
    
    res.json({
      success: true,
      message: 'Test submitted successfully',
      score: percentageScore,
      correctAnswers,
      incorrectAnswers: attemptQuestions.length - correctAnswers,
      totalQuestions: attemptQuestions.length,
      isPassed,
      passingScore: test.passingScore,
      attemptId: attempt._id,
      detailedResults
    });
  } catch (error) {
    console.error('SUBMIT TEST ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.get('/user/tests/history', authenticateUser, async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ userId: req.user._id, status: 'completed' })
      .populate('testId', 'title subjectName topic totalQuestions passingScore')
      .sort({ completedAt: -1 });
    res.json({ success: true, attempts, count: attempts.length });
  } catch (error) {
    console.error('GET TEST HISTORY ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.get('/user/attempts/:attemptId', authenticateUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.attemptId)) {
      return res.status(400).json({ error: 'Invalid attempt ID format', success: false });
    }
    const attempt = await TestAttempt.findOne({ _id: req.params.attemptId, userId: req.user._id })
      .populate('testId', 'title subjectName passingScore');
    if (!attempt) return res.status(404).json({ error: 'Attempt not found', success: false });
    
    const questionsWithComparison = attempt.questions?.map((q, idx) => {
      const userAnswer = attempt.answers?.[idx];
      const isCorrect = normalizeString(userAnswer) === normalizeString(q.correctAnswer);
      return {
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer || 'Not answered',
        isCorrect,
        explanation: q.explanation
      };
    });
    
    res.json({
      success: true,
      attempt: {
        _id: attempt._id,
        test: attempt.testId,
        score: attempt.score,
        isPassed: attempt.isPassed,
        completedAt: attempt.completedAt,
        timeSpent: attempt.timeSpent,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        totalQuestions: attempt.questions?.length || 0,
        detailedResults: attempt.detailedResults,
        questions: questionsWithComparison
      }
    });
  } catch (error) {
    console.error('GET ATTEMPT DETAILS ERROR:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.get('/test-debug', (req, res) => {
  res.json({
    message: 'Test routes are mounted correctly!',
    timestamp: new Date(),
    groqConfigured: !!process.env.GROQ_API_KEY,
    cacheSize: questionCache.size
  });
});

module.exports = router;