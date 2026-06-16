// // const express = require('express');
// // const router = express.Router();
// // const UserInterview = require('../models/UserInterview');
// // const InterviewQuestion = require('../models/Interview');
// // const { authenticateUser } = require('./auth');

// // router.post('/save-session', authenticateUser, async (req, res) => {
// //   try {
// //     console.log('📝 Save session request received');
// //     const { role, position, techStack, level, difficulty, questions, overallScore, technicalScore, clarityScore, confidenceScore, duration } = req.body;

// //     if (!role) return res.status(400).json({ error: 'Role is required' });
// //     if (!questions || !questions.length) return res.status(400).json({ error: 'Questions array required' });

// //     const session = new UserInterview({
// //       userId: req.user._id,
// //       userName: req.user.name,
// //       userEmail: req.user.email,
// //       role,
// //       position: position || role,
// //       techStack: techStack || '',
// //       // Preprocess to handle timestamp suffixes from frontend (e.g. level-123 -> 'mid')
// //       level: (level && /^level-\\d+$/.test(level) ? 'mid' : level) || 'mid',
// //       difficulty: (difficulty && /^diff-\\d+$/.test(difficulty) ? 'medium' : difficulty) || 'medium',
// //       totalQuestions: questions.length,
// //       answeredQuestions: questions.filter(q => q.userAnswer && q.userAnswer.trim()).length,
// //       overallScore: overallScore || 0,
// //       technicalScore: technicalScore || 0,
// //       clarityScore: clarityScore || 0,
// //       confidenceScore: confidenceScore || 0,
// //       duration: duration || 0,
// //       status: 'completed',
// //       completedAt: new Date()
// //     });
// //     await session.save();
// //     console.log('✅ Session created:', session._id);

// //     const questionIds = [];
// //     for (let i = 0; i < questions.length; i++) {
// //       const q = questions[i];
// //       const questionDoc = new InterviewQuestion({
// //         sessionId: session._id,
// //         userId: req.user._id,
// //         question: q.question,
// //         userAnswer: q.userAnswer || '',
// //         idealAnswer: q.idealAnswer || '',
// //         score: q.score || 0,
// //         feedback: q.feedback || { strengths: [], improvements: [], suggestions: [] },
// //         keywords: q.keywords || [],
// //         timeTaken: q.timeTaken || 0,
// //         order: i
// //       });
// //       await questionDoc.save();
// //       questionIds.push(questionDoc._id);
// //       console.log(`✅ Question ${i+1} saved`);
// //     }
// //     session.questionIds = questionIds;
// //     await session.save();
// //     res.json({ success: true, sessionId: session._id, questionCount: questionIds.length });
// //   } catch (error) {
// //     console.error('❌ Save error:', error);
// //     res.status(500).json({ success: false, error: error.message });
// //   }
// // });

// // router.get('/my-sessions', authenticateUser, async (req, res) => {
// //   try {
// //     const sessions = await UserInterview.find({ userId: req.user._id }).sort({ createdAt: -1 });
// //     res.json({ success: true, sessions });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // module.exports = router;


// const express = require('express');
// const router = express.Router();
// const UserInterview = require('../models/UserInterview');
// const InterviewQuestion = require('../models/Interview');
// const { authenticateUser } = require('./auth');

// router.post('/save-session', authenticateUser, async (req, res) => {
//   try {
//     console.log('📝 Save session request received');
//     const { 
//       role, 
//       position, 
//       techStack, 
//       level, 
//       difficulty, 
//       questions, 
//       overallScore, 
//       technicalScore, 
//       clarityScore, 
//       confidenceScore, 
//       duration,
//       averageResponseTime,
//       totalQuestionsAnswered,
//       assessmentType = 'continuous'
//     } = req.body;

//     // Calculate additional metrics for continuous assessment
//     const totalResponseTime = questions.reduce((sum, q) => sum + (q.responseTime || q.timeTaken || 0), 0);
//     const avgResponseTime = averageResponseTime || (questions.length > 0 ? Math.round(totalResponseTime / questions.length) : 0);
//     const questionsPerMinute = duration > 0 ? ((questions.length / duration) * 60).toFixed(1) : 0;
//     const completionRate = totalQuestionsAnswered ? Math.round((questions.length / totalQuestionsAnswered) * 100) : 100;


//     if (!role) return res.status(400).json({ error: 'Role is required' });
//     if (!questions || !questions.length) return res.status(400).json({ error: 'Questions array required' });

//     // Calculate additional metrics for continuous assessment
//     const totalResponseTime = questions.reduce((sum, q) => sum + (q.responseTime || q.timeTaken || 0), 0);
//     const avgResponseTime = averageResponseTime || (questions.length > 0 ? Math.round(totalResponseTime / questions.length) : 0);
//     const questionsPerMinute = duration > 0 ? ((questions.length / duration) * 60).toFixed(1) : 0;
//     const completionRate = totalQuestionsAnswered ? Math.round((questions.length / totalQuestionsAnswered) * 100) : 100;

//     const session = new UserInterview({
//       userId: req.user._id,
//       userName: req.user.name,
//       userEmail: req.user.email,
//       role,
//       position: position || role,
//       techStack: techStack || '',
//       level: (level && /^level-\d+$/.test(level) ? 'mid' : level) || 'mid',
//       difficulty: (difficulty && /^diff-\d+$/.test(difficulty) ? 'medium' : difficulty) || 'medium',
//       totalQuestions: questions.length,
//       answeredQuestions: questions.filter(q => q.userAnswer && q.userAnswer.trim()).length,
//       overallScore: overallScore || 0,
//       technicalScore: technicalScore || 0,
//       clarityScore: clarityScore || 0,
//       confidenceScore: confidenceScore || 0,
//       duration: duration || 0,
//       status: 'completed',
//       completedAt: new Date(),
//       // New fields for continuous assessment
//       averageResponseTime: avgResponseTime,
//       totalTimeSpent: duration || 0,
//       questionsPerMinute: parseFloat(questionsPerMinute),
//       completionRate: completionRate,
//       maxQuestionsGenerated: questions.length
//     });
//     await session.save();
//     console.log('✅ Session created:', session._id);
//     console.log(`📊 Metrics - Avg Response: ${avgResponseTime}s, QPM: ${questionsPerMinute}`);

//     const questionIds = [];
//     for (let i = 0; i < questions.length; i++) {
//       const q = questions[i];
//       const questionDoc = new InterviewQuestion({
//         sessionId: session._id,
//         userId: req.user._id,
//         question: q.question,
//         userAnswer: q.userAnswer || '',
//         idealAnswer: q.idealAnswer || '',
//         score: q.score || 0,
//         feedback: q.feedback || { strengths: [], improvements: [], suggestions: [] },
//         keywords: q.keywords || [],
//         timeTaken: q.responseTime || q.timeTaken || 0,
//         order: i
//       });
//       await questionDoc.save();
//       questionIds.push(questionDoc._id);
//       console.log(`✅ Question ${i+1} saved (time: ${questionDoc.timeTaken}s)`);
//     }
//     session.questionIds = questionIds;
//     await session.save();
    
//     res.json({ 
//       success: true, 
//       sessionId: session._id, 
//       questionCount: questionIds.length,
//       metrics: {
//         averageResponseTime: avgResponseTime,
//         questionsPerMinute: questionsPerMinute,
//         completionRate: completionRate
//       }
//     });
//   } catch (error) {
//     console.error('❌ Save error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// router.get('/my-sessions', authenticateUser, async (req, res) => {
//   try {
//     const sessions = await UserInterview.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
//     // Add summary metrics for dashboard
//     const totalInterviews = sessions.length;
//     const avgOverallScore = sessions.length > 0 
//       ? Math.round(sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.length) 
//       : 0;
//     const totalQuestions = sessions.reduce((sum, s) => sum + (s.answeredQuestions || 0), 0);
//     const avgResponseTime = sessions.length > 0
//       ? Math.round(sessions.reduce((sum, s) => sum + (s.averageResponseTime || 0), 0) / sessions.length)
//       : 0;
    
//     res.json({ 
//       success: true, 
//       sessions,
//       summary: {
//         totalInterviews,
//         avgOverallScore,
//         totalQuestions,
//         avgResponseTime
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get single session with detailed analytics
// router.get('/session/:sessionId', authenticateUser, async (req, res) => {
//   try {
//     const session = await UserInterview.findOne({ 
//       _id: req.params.sessionId, 
//       userId: req.user._id 
//     });
    
//     if (!session) {
//       return res.status(404).json({ error: 'Session not found' });
//     }
    
//     const questions = await InterviewQuestion.find({ 
//       sessionId: session._id 
//     }).sort({ order: 1 });
    
//     // Calculate detailed analytics
//     const analytics = {
//       averageScore: questions.length > 0 
//         ? Math.round(questions.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length) 
//         : 0,
//       averageResponseTime: questions.length > 0
//         ? Math.round(questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0) / questions.length)
//         : 0,
//       fastestResponse: questions.length > 0
//         ? Math.min(...questions.map(q => q.timeTaken || Infinity))
//         : 0,
//       slowestResponse: questions.length > 0
//         ? Math.max(...questions.map(q => q.timeTaken || 0))
//         : 0,
//       totalTimeSpent: session.totalTimeSpent || session.duration || 0,
//       questionsPerMinute: session.questionsPerMinute || 0
//     };
    
//     res.json({ 
//       success: true, 
//       session, 
//       questions,
//       analytics
//     });
//   } catch (error) {
//     console.error('Error fetching session:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get interview analytics for dashboard
// router.get('/analytics', authenticateUser, async (req, res) => {
//   try {
//     const sessions = await UserInterview.find({ userId: req.user._id })
//       .sort({ createdAt: -1 });
    
//     const totalInterviews = sessions.length;
//     const totalQuestions = sessions.reduce((sum, s) => sum + (s.answeredQuestions || 0), 0);
//     const avgScore = sessions.length > 0 
//       ? Math.round(sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.length)
//       : 0;
    
//     // Calculate improvement trend
//     const recentSessions = sessions.slice(0, 5);
//     const scoreTrend = recentSessions.map(s => s.overallScore);
//     const improvement = scoreTrend.length >= 2 
//       ? scoreTrend[0] - scoreTrend[scoreTrend.length - 1]
//       : 0;
    
//     // Time-based metrics
//     const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.totalTimeSpent || s.duration || 0), 0);
//     const avgResponseTime = sessions.length > 0
//       ? Math.round(sessions.reduce((sum, s) => sum + (s.averageResponseTime || 0), 0) / sessions.length)
//       : 0;
    
//     // Performance by role
//     const performanceByRole = {};
//     sessions.forEach(session => {
//       if (!performanceByRole[session.role]) {
//         performanceByRole[session.role] = { total: 0, count: 0 };
//       }
//       performanceByRole[session.role].total += session.overallScore || 0;
//       performanceByRole[session.role].count += 1;
//     });
    
//     Object.keys(performanceByRole).forEach(role => {
//       performanceByRole[role].average = Math.round(performanceByRole[role].total / performanceByRole[role].count);
//     });
    
//     res.json({
//       success: true,
//       analytics: {
//         totalInterviews,
//         totalQuestions,
//         avgScore,
//         improvement,
//         totalTimeSpent: Math.round(totalTimeSpent / 60), // in minutes
//         avgResponseTime,
//         performanceByRole,
//         recentScores: scoreTrend
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching analytics:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const UserInterview = require('../models/UserInterview');
const InterviewQuestion = require('../models/Interview');
const { authenticateUser } = require('./auth');

router.post('/save-session', authenticateUser, async (req, res) => {
  try {
    console.log('📝 Save session request received');
    const { 
      role, position, techStack, level, difficulty, questions,
      overallScore, technicalScore, clarityScore, confidenceScore,
      duration, averageResponseTime, totalQuestionsAnswered
    } = req.body;

    if (!role) return res.status(400).json({ error: 'Role is required' });
    if (!questions || !questions.length) return res.status(400).json({ error: 'Questions array required' });

    // Calculate metrics (only once)
    const totalResponseTime = questions.reduce((sum, q) => sum + (q.responseTime || q.timeTaken || 0), 0);
    const avgResponseTime = averageResponseTime || (questions.length > 0 ? Math.round(totalResponseTime / questions.length) : 0);
    const questionsPerMinute = duration > 0 ? ((questions.length / duration) * 60).toFixed(1) : 0;
    const completionRate = totalQuestionsAnswered ? Math.round((questions.length / totalQuestionsAnswered) * 100) : 100;

    const session = new UserInterview({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      role,
      position: position || role,
      techStack: techStack || '',
      level: (level && /^level-\d+$/.test(level) ? 'mid' : level) || 'mid',
      difficulty: (difficulty && /^diff-\d+$/.test(difficulty) ? 'medium' : difficulty) || 'medium',
      totalQuestions: questions.length,
      answeredQuestions: questions.filter(q => q.userAnswer && q.userAnswer.trim()).length,
      overallScore: overallScore || 0,
      technicalScore: technicalScore || 0,
      clarityScore: clarityScore || 0,
      confidenceScore: confidenceScore || 0,
      duration: duration || 0,
      status: 'completed',
      completedAt: new Date(),
      averageResponseTime: avgResponseTime,
      totalTimeSpent: duration || 0,
      questionsPerMinute: parseFloat(questionsPerMinute),
      completionRate: completionRate,
      maxQuestionsGenerated: questions.length
    });
    await session.save();
    console.log('✅ Session created:', session._id);
    console.log(`📊 Metrics - Avg Response: ${avgResponseTime}s, QPM: ${questionsPerMinute}`);

    const questionIds = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionDoc = new InterviewQuestion({
        sessionId: session._id,
        userId: req.user._id,
        question: q.question,
        userAnswer: q.userAnswer || '',
        idealAnswer: q.idealAnswer || '',
        score: q.score || 0,
        feedback: q.feedback || { strengths: [], improvements: [], suggestions: [] },
        keywords: q.keywords || [],
        timeTaken: q.responseTime || q.timeTaken || 0,
        order: i
      });
      await questionDoc.save();
      questionIds.push(questionDoc._id);
      console.log(`✅ Question ${i+1} saved (time: ${questionDoc.timeTaken}s)`);
    }
    session.questionIds = questionIds;
    await session.save();

    res.json({ 
      success: true, 
      sessionId: session._id, 
      questionCount: questionIds.length,
      metrics: { averageResponseTime: avgResponseTime, questionsPerMinute, completionRate }
    });
  } catch (error) {
    console.error('❌ Save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/my-sessions', authenticateUser, async (req, res) => {
  try {
    const sessions = await UserInterview.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/session/:sessionId', authenticateUser, async (req, res) => {
  try {
    const session = await UserInterview.findOne({ _id: req.params.sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const questions = await InterviewQuestion.find({ sessionId: session._id }).sort({ order: 1 });
    res.json({ success: true, session, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;