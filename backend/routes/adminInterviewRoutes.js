// // const express = require('express');
// // const router = express.Router();

// // const UserInterview = require('../models/UserInterview');

// // // GET /api/admin/interview/sessions
// // router.get('/sessions', async (req, res) => {
// //   try {
// //     const { page = 1, limit = 10, search = '', role = 'all' } = req.query;

// // console.log('🔍 DEBUG - Raw query:', JSON.stringify(req.query));
// // const query = {};

// //     // 👉 TEMP DISABLED role filter for debugging - re-enable after confirming data
// //     // if (role !== 'all') {
// //     //   query.role = new RegExp(role, 'i');
// //     // }
// //     console.log('🔍 Using query:', JSON.stringify(query));

// //     console.log('🔍 Fetching with skip:', (page - 1) * limit, 'limit:', limit);
// //     let interviews = await UserInterview.find(query)
// //       .populate('userId', 'name email')
// //       .sort({ createdAt: -1 })
// //       .skip((page - 1) * limit)
// //       .limit(Number(limit))
// //       .lean();
// //     console.log('📊 Found interviews:', interviews.length, 'first sample:', interviews[0] ? {id: interviews[0]._id, role: interviews[0].role, userId: interviews[0].userId?._id} : 'NONE');

// //     // search
// //     if (search) {
// //       const s = search.toLowerCase();
// //       interviews = interviews.filter((i) => {
// //         const name = i.userId?.name?.toLowerCase() || '';
// //         const email = i.userId?.email?.toLowerCase() || '';
// //         return name.includes(s) || email.includes(s);
// //       });
// //     }

// //     const sessions = interviews.map((i) => ({
// //       id: i._id,
// //       user: i.userId?.name || 'Unknown',
// //       email: i.userId?.email || 'N/A',
// //       role: i.role || 'N/A',
// //       tech: Array.isArray(i.techStack)
// //         ? i.techStack.join(', ')
// //         : i.techStack || 'N/A',
// //       level: i.level || i.difficulty || 'N/A',
// //       score: i.score ?? i.percentage ?? 0,
// //       date: i.createdAt,
// //     }));

// //     const total = await UserInterview.countDocuments(query);
// //     console.log('📈 Total matching query:', total);
// //     if (total > 0) {
// //       const sampleDoc = await UserInterview.findOne(query).lean();
// //       console.log('📋 Sample document:', {
// //         _id: sampleDoc._id,
// //         userId: sampleDoc.userId,
// //         role: sampleDoc.role,
// //         techStack: sampleDoc.techStack,
// //         createdAt: sampleDoc.createdAt
// //       });
// //     }

// //     console.log('✅ Returning:', sessions.length, 'sessions out of', total);
// //     res.json({
// //       success: true,
// //       sessions,
// //       total,
// //       totalPages: Math.ceil(total / limit),
// //     });

// //   } catch (err) {
// //     console.error('❌ Admin Interview Sessions Error:', err);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Failed to fetch sessions',
// //     });
// //   }
// // });

// // module.exports = router;



// const express = require('express');
// const router = express.Router();
// const UserInterview = require('../models/UserInterview');
// const InterviewQuestion = require('../models/Interview');
// const { authenticateUser } = require('./auth');

// // GET /api/admin/interview/sessions
// router.get('/sessions', authenticateUser, async (req, res) => {
//   try {
//     if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
//       return res.status(403).json({ error: 'Access denied. Admin only.' });
//     }

//     const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     let query = {};
//     if (status !== 'all') query.status = status;

//     // Search in userName or userEmail
//     if (search) {
//       query.$or = [
//         { userName: { $regex: search, $options: 'i' } },
//         { userEmail: { $regex: search, $options: 'i' } },
//         { role: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const total = await UserInterview.countDocuments(query);
//     const sessions = await UserInterview.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     // Get question count for each session
//     const sessionsWithDetails = await Promise.all(sessions.map(async (session) => {
//       const questionCount = await InterviewQuestion.countDocuments({ sessionId: session._id });
//       return {
//         id: session._id,
//         user: session.userName,
//         email: session.userEmail,
//         role: session.role,
//         tech: session.techStack,
//         level: session.level,
//         score: session.overallScore,
//         status: session.status,
//         date: session.createdAt,
//         duration: session.duration,
//         totalQuestions: session.totalQuestions || questionCount,
//         answeredQuestions: session.answeredQuestions || 0
//       };
//     }));

//     res.json({
//       success: true,
//       sessions: sessionsWithDetails,
//       total,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page)
//     });

//   } catch (err) {
//     console.error('❌ Admin Interview Sessions Error:', err);
//     res.status(500).json({ error: 'Failed to fetch sessions' });
//   }
// });

// // GET single session with questions
// router.get('/sessions/:id', authenticateUser, async (req, res) => {
//   try {
//     if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     const session = await UserInterview.findById(req.params.id);
//     if (!session) {
//       return res.status(404).json({ error: 'Session not found' });
//     }

//     const questions = await InterviewQuestion.find({ sessionId: session._id })
//       .sort({ order: 1 });

//     res.json({
//       success: true,
//       session,
//       questions
//     });
//   } catch (err) {
//     console.error('Error fetching session details:', err);
//     res.status(500).json({ error: 'Failed to fetch session details' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const UserInterview = require('../models/UserInterview');
const InterviewQuestion = require('../models/Interview');
const { authenticateAdmin } = require('./adminAuth'); // ✅ use admin auth, not user auth

// GET /api/admin/interview/sessions
router.get('/sessions', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await UserInterview.countDocuments(query);
    const sessions = await UserInterview.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const sessionsWithDetails = await Promise.all(sessions.map(async (session) => {
      const questionCount = await InterviewQuestion.countDocuments({ sessionId: session._id });
      return {
        id: session._id,
        user: session.userName,
        email: session.userEmail,
        role: session.role,
        tech: session.techStack,
        level: session.level,
        score: session.overallScore,
        status: session.status,
        date: session.createdAt,
        duration: session.duration,
        totalQuestions: session.totalQuestions || questionCount,
        answeredQuestions: session.answeredQuestions || 0
      };
    }));

    res.json({
      success: true,
      sessions: sessionsWithDetails,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Admin sessions error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET single session details
router.get('/sessions/:id', authenticateAdmin, async (req, res) => {
  try {
    const session = await UserInterview.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const questions = await InterviewQuestion.find({ sessionId: session._id }).sort({ order: 1 });

    res.json({
      success: true,
      session,
      questions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

module.exports = router;