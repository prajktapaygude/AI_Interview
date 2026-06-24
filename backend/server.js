
// require('dotenv').config();
// console.log('🔍 ENVIRONMENT VARIABLES CHECK:');
// console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ FOUND (starts with: ' + process.env.GEMINI_API_KEY.substring(0, 15) + '...)' : '❌ NOT FOUND');
// console.log('Current directory:', process.cwd());
// console.log('.env file path:', require('path').resolve('./.env'));

// const express = require('express');
// const cors = require('cors');
// const session = require('express-session');
// const passport = require('passport');
// const connectDB = require('./config/db');
// const chatRoutes = require('./routes/chat');
// const { router: authRoutes, authenticateUser } = require('./routes/auth');
// const { initPassport } = require('./config/passport');
// const { router: adminAuthRoutes } = require("./routes/adminAuth");
// const adminResourcesRoutes = require("./routes/adminResources");
// const adminStatsRoutes = require("./routes/adminStats");
// const publicResources = require("./routes/publicResources");
// const planRoutes = require('./routes/plans');
// const paymentRoutes = require('./routes/payment');
// const userRoutes = require('./routes/users');
// const contactRoutes = require('./routes/contact');
// const feedbackRoutes = require('./routes/feedback');
// const jobSearchRoutes = require('./routes/jobSearch');
// const saveInterviewRoutes = require('./routes/saveInterview');
// const adminInterviewRoutes = require('./routes/adminInterviewRoutes');
// // Import new routes
// const adminSubjectsRoutes = require("./routes/adminSubjects");
// const resumeAnalyzerRoutes = require('./routes/resumeAnalyzer');
// const testRoutes = require("./routes/tests");
// // Interview Configuration routes
// const adminInterviewConfigRoutes = require('./routes/adminInterviewConfigRoutes'); 
// const adminAnalyticsRoutes = require('./routes/adminAnalytics');

// const { Server } = require("socket.io");
// const http = require("http");

// // =======================
// // CREATE APP FIRST
// // =======================
// const app = express();
// const AI_BACKEND_URL = process.env.AI_BACKEND_URL || `${BASE_URL}`;

// // =======================
// // DB CONNECTION
// // =======================
// connectDB();

// // =======================
// // MIDDLEWARE
// // =======================
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// })); 

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Request logging middleware
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

// // Security headers for tracking prevention
// app.use((req, res, next) => {
//   res.setHeader('X-Content-Type-Options', 'nosniff');
//   res.setHeader('X-Frame-Options', 'DENY');
//   res.setHeader('X-XSS-Protection', '1; mode=block');
//   res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
//   res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
//   next();
// });

// // =======================
// // SESSION + PASSPORT (MOVED AFTER APP IS CREATED)
// // =======================
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your_session_secret_key',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000,
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
//   }
// }));

// // ✅ Initialize Passport AFTER app is created
// initPassport();
// app.use(passport.initialize());
// app.use(passport.session());

// // CHATBOT ROUTES
// app.use('/api/chat', chatRoutes);
// //contact page routes
// app.use('/api/contact', contactRoutes);
// //feedback routes
// app.use('/api/feedback', feedbackRoutes);
// // =======================
// // ROUTES - ORDER MATTERS!
// // =======================

// // Health check endpoint (useful for debugging)
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     message: 'Server is running',
//     timestamp: new Date(),
//     endpoints: {
//       tests: '/api/admin/tests',
//       subjects: '/api/admin/subjects',
//       auth: '/api/auth'
//     }
//   });
// });

// // User auth routes
// app.use('/api/auth', authRoutes);

// // Admin auth routes
// app.use("/api/admin/auth", adminAuthRoutes);

// // Subject routes (mounted at /api/admin)
// app.use("/api/admin", adminSubjectsRoutes);

// // Test routes (mounted at /api - handles both /api/admin/tests and /api/user/tests)
// app.use("/api", testRoutes);

// // Existing admin routes
// app.use("/api/admin", adminResourcesRoutes);
// app.use("/api/admin", adminStatsRoutes);
// app.use("/api/admin", require('./routes/adminUsers'));
// app.use("/api/admin", require('./routes/adminAdmins'));
// app.use('/api', resumeAnalyzerRoutes);

// // ✅ INTERVIEW ROUTES - Mount config routes FIRST then sessions routes
// console.log("🚀 adminInterviewSessionsRoutes:", adminInterviewRoutes);
// console.log("🚀 adminInterviewConfigRoutes:", adminInterviewConfigRoutes);


// app.use('/api/admin', adminAnalyticsRoutes);
// // Mount config routes (these handle /config, /categories, /levels, etc.)
// app.use('/api/admin/interview', adminInterviewConfigRoutes);

// // Mount sessions routes (these handle /sessions)
// app.use('/api/interview', saveInterviewRoutes);
// app.use('/api/admin/interview', adminInterviewRoutes);
// // Public resources
// app.use("/api/resources", publicResources);

// // Premium routes
// app.use('/api/payment', paymentRoutes);
// app.use('/api/plans', planRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api', jobSearchRoutes);


// // =======================
// // PUBLIC INTERVIEW CONFIGURATION FOR CANDIDATES
// // =======================

// // Add this after your other routes, before the 404 handler
// // =======================
// // PUBLIC INTERVIEW CONFIGURATION FOR CANDIDATES
// // =======================
// app.get('/api/public/interview-config', async (req, res) => {
//   try {
//     const InterviewConfig = require('./models/InterviewConfig');
//     let config = await InterviewConfig.findOne();
    
//     if (!config) {
//       console.log('No config found in database, returning mock data');
//       // Return mock data from your MOCK_CONFIG
//       return res.json({
//         categories: [
//           {
//             id: "technology",
//             name: "Technology / IT",
//             roles: [
//               { id: "frontend", name: "Frontend Developer", techStacks: ["React", "Vue", "Angular", "JavaScript", "TypeScript"] },
//               { id: "backend", name: "Backend Developer", techStacks: ["Node.js", "Python", "Java", "Go", "C#"] },
//               { id: "fullstack", name: "Full Stack Developer", techStacks: ["MERN", "MEAN", "JAMstack"] },
//               { id: "devops", name: "DevOps Engineer", techStacks: ["Docker", "Kubernetes", "AWS", "Azure"] },
//               { id: "ai-ml", name: "AI/ML Engineer", techStacks: ["Python", "TensorFlow", "PyTorch", "Scikit-learn"] }
//             ]
//           },
//           {
//             id: "business",
//             name: "Business & Management",
//             roles: [
//               { id: "marketing", name: "Marketing", techStacks: ["Digital Marketing", "SEO", "Content Strategy", "Social Media"] },
//               { id: "finance", name: "Finance", techStacks: ["Financial Analysis", "Risk Management", "Investment Banking"] },
//               { id: "hr", name: "Human Resources", techStacks: ["Recruitment", "Employee Relations", "HRIS", "Payroll"] },
//               { id: "operations", name: "Operations", techStacks: ["Supply Chain", "Logistics", "Process Optimization"] }
//             ]
//           }
//         ],
//         levels: [
//           { id: "fresher", label: "Fresher", icon: "🌱", description: "0-1 years" },
//           { id: "junior", label: "Junior", icon: "🌿", description: "1-3 years" },
//           { id: "mid", label: "Mid-Level", icon: "🌳", description: "3-5 years" },
//           { id: "senior", label: "Senior", icon: "👑", description: "5+ years" }
//         ],
//         difficulties: [
//           { id: "easy", label: "Easy", icon: "😊" },
//           { id: "medium", label: "Medium", icon: "😐" },
//           { id: "hard", label: "Hard", icon: "😰" }
//         ],
//         durations: [
//           { value: "5", label: "5 min", icon: "⚡" },
//           { value: "10", label: "10 min", icon: "⏱️" },
//           { value: "15", label: "15 min", icon: "⏲️" },
//           { value: "20", label: "20 min", icon: "⌛" },
//           { value: "30", label: "30 min", icon: "⏳" }
//         ]
//       });
//     }
    
//     // Return the config from database
//     const publicConfig = {
//       categories: config.categories || [],
//       levels: config.levels || [],
//       difficulties: config.difficulties || [],
//       durations: config.durations || []
//     };
    
//     console.log('Serving public config with categories:', publicConfig.categories.length);
//     res.json(publicConfig);
    
//   } catch (error) {
//     console.error('Error fetching public config:', error);
//     res.status(500).json({ error: 'Failed to load interview configuration' });
//   }
// });
// // =======================
// // AI BACKEND PROXY & INTERVIEW STATS
// // =======================
// app.post('/api/interview/stats', authenticateUser, async (req, res) => {
//   console.log('📊 [STATS] req.user:', req.user?.email);  
//   try {
//     const userId = req.user?.id || req.user?._id;
    
//     // Try to fetch from AI backend first, but fallback to MongoDB
//     try {
//       const AI_BACKEND_URL = process.env.AI_BACKEND_URL || `${BASE_URL}`;
      
//       const response = await fetch(`${AI_BACKEND_URL}/interview/stats`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId }),
//         timeout: 5000 // 5 second timeout
//       });

//       if (response.ok) {
//         const data = await response.json();
//         return res.json(data);
//       }
//     } catch (aiError) {
//       console.log('AI Backend not available, falling back to MongoDB:', aiError.message);
//     }

//     // Fallback: Fetch interviews from MongoDB directly
//     const Interview = require('./models/Interview');
    
//     const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    
//     // Calculate stats
//     const totalInterviews = interviews.length;
    
//     let avgScore = 0;
//     if (totalInterviews > 0) {
//       const totalScore = interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
//       avgScore = Math.round(totalScore / totalInterviews);
//     }
    
//     let improvement = 0;
//     if (totalInterviews >= 2) {
//       const firstScore = interviews[interviews.length - 1]?.score || 0;
//       const lastScore = interviews[0]?.score || 0;
//       if (firstScore > 0) {
//         improvement = Math.round(((lastScore - firstScore) / firstScore) * 100);
//       }
//     }
    
//     const hoursPracticed = totalInterviews * 0.5; // 30 minutes per interview
    
//     // Get recent interviews (last 5)
//     const recentInterviews = interviews.slice(0, 5).map(interview => ({
//       role: interview.role || interview.position || 'Interview',
//       score: interview.score || 0,
//       answered: interview.answered || interview.questionsAnswered || 0,
//       totalQuestions: interview.totalQuestions || interview.total || 10,
//       level: interview.level || interview.difficulty || 'Intermediate',
//       date: interview.createdAt || interview.date || new Date(),
//       _id: interview._id
//     }));
    
//     res.json({
//       totalInterviews,
//       avgScore,
//       improvement,
//       hoursPracticed: parseFloat(hoursPracticed.toFixed(1)),
//       recentInterviews
//     });

//   } catch (error) {
//     console.error('Error fetching user stats:', error);
//     res.status(500).json({
//       error: 'Failed to fetch user stats',
//       totalInterviews: 0,
//       avgScore: 0,
//       improvement: 0,
//       hoursPracticed: 0,
//       recentInterviews: []
//     });
//   }
// });

// // =======================
// // SAVE INTERVIEW RESULTS
// // =======================
// app.post('/api/interview/save', authenticateUser, async (req, res) => {
//   try {
//     const Interview = require('./models/Interview');
//     const { userId, role, score, answered, totalQuestions, level, answers, feedback } = req.body;
    
//     const interview = new Interview({
//       userId: userId || req.user?.id,
//       role,
//       position: role,
//       score,
//       percentage: score,
//       answered,
//       questionsAnswered: answered,
//       totalQuestions,
//       total: totalQuestions,
//       level,
//       answers,
//       feedback,
//       createdAt: new Date()
//     });
    
//     await interview.save();
    
//     res.json({
//       success: true,
//       message: 'Interview results saved successfully',
//       interviewId: interview._id
//     });
//   } catch (error) {
//     console.error('Error saving interview:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to save interview results'
//     });
//   }
// });

// // =======================
// // ROOT ENDPOINT
// // =======================
// app.get('/', (req, res) => {
//   res.json({
//     name: 'Interview Hub API',
//     version: '1.0.0',
//     status: 'running',
//     endpoints: {
//       health: '/api/health',
//       tests: '/api/admin/tests',
//       subjects: '/api/admin/subjects',
//       auth: '/api/auth'
//     }
//   });
// });

// // =======================
// // 404 HANDLER (must be after all routes)
// // =======================
// app.use((req, res) => {
//   console.log(`404 - Route not found: ${req.method} ${req.url}`);
//   res.status(404).json({ 
//     error: `Route not found: ${req.method} ${req.url}`,
//     success: false,
//     availableEndpoints: [
//       '/api/health',
//       '/api/admin/tests',
//       '/api/admin/subjects',
//       '/api/auth/login',
//       '/api/auth/register',
//       '/api/admin/interview/config',
//       '/api/admin/interview/sessions'
//     ]
//   });
// });

// // =======================
// // ERROR HANDLER
// // =======================
// app.use((err, req, res, next) => {
//   console.error('Error:', err.stack);
//   res.status(err.status || 500).json({ 
//     error: err.message || 'Internal server error',
//     success: false,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// // =======================
// // SOCKET.IO SETUP
// // =======================
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173", "http://localhost:3000"],
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// app.set('io', io);

// // =======================
// // START SERVER
// // =======================
// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`\n✅ Server running on http://localhost:${PORT}`);
//   console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
//   console.log(`📚 Test routes: http://localhost:${PORT}/api/admin/tests`);
//   console.log(`📖 Subject routes: http://localhost:${PORT}/api/admin/subjects`);
//   console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
//   console.log(`📚 Resources routes: http://localhost:${PORT}/api/resources`);
//   console.log(`🎯 Interview Config: http://localhost:${PORT}/api/admin/interview/config`);
//   console.log(`📊 Interview Sessions: http://localhost:${PORT}/api/admin/interview/sessions\n`);
// });

// // Handle server errors
// server.on('error', (error) => {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }
  
//   switch (error.code) {
//     case 'EACCES':
//       console.error(`Port ${PORT} requires elevated privileges`);
//       process.exit(1);
//       break;
//     case 'EADDRINUSE':
//       console.error(`Port ${PORT} is already in use`);
//       console.log('Please kill the process using:');
//       console.log(`  On Mac/Linux: lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`);
//       console.log(`  On Windows: netstat -ano | findstr :${PORT} | findstr LISTENING`);
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (error) => {
//   console.error('Unhandled Rejection:', error);
// });

// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
//   process.exit(1);
// });








require('dotenv').config();
console.log('🔍 ENVIRONMENT VARIABLES CHECK:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ FOUND (starts with: ' + process.env.GEMINI_API_KEY.substring(0, 15) + '...)' : '❌ NOT FOUND');
console.log('Current directory:', process.cwd());
console.log('.env file path:', require('path').resolve('./.env'));

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const axios = require('axios'); // ✅ ADDED for proxy calls
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat');
const { router: authRoutes, authenticateUser } = require('./routes/auth');
const { initPassport } = require('./config/passport');
const { router: adminAuthRoutes } = require("./routes/adminAuth");
const adminResourcesRoutes = require("./routes/adminResources");
const adminStatsRoutes = require("./routes/adminStats");
const publicResources = require("./routes/publicResources");
const planRoutes = require('./routes/plans');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contact');
const feedbackRoutes = require('./routes/feedback');
const jobSearchRoutes = require('./routes/jobSearch');
const saveInterviewRoutes = require('./routes/saveInterview');
const adminInterviewRoutes = require('./routes/adminInterviewRoutes');
const adminSubjectsRoutes = require("./routes/adminSubjects");
const resumeAnalyzerRoutes = require('./routes/resumeAnalyzer');
const testRoutes = require("./routes/tests");
const adminInterviewConfigRoutes = require('./routes/adminInterviewConfigRoutes'); 
const adminAnalyticsRoutes = require('./routes/adminAnalytics');

const { Server } = require("socket.io");
const http = require("http");

// =======================
// CREATE APP FIRST
// =======================
const app = express();

// =======================
// DB CONNECTION
// =======================
connectDB();

// =======================
// CORS CONFIGURATION - FIXED
// =======================
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-interview-two-kohl.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// 🚀 PROXY AI ROUTES TO PYTHON BACKEND (ADDED)
// ============================================
const PYTHON_AI_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

// Helper to forward POST requests to Python
const proxyToPython = async (req, res, endpoint) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}${endpoint}`, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 80000  // 30 seconds for Python cold start
    });
    res.json(response.data);
  } catch (err) {
    console.error(`❌ Proxy error to ${endpoint}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

// The exact endpoints your frontend calls
app.post('/evaluate', (req, res) => proxyToPython(req, res, '/evaluate'));
app.post('/tts', (req, res) => proxyToPython(req, res, '/tts'));
app.post('/generate-continuous-question', (req, res) => proxyToPython(req, res, '/generate-continuous-question'));
app.post('/batch-evaluate', (req, res) => proxyToPython(req, res, '/batch-evaluate'));
app.post('/analyze-report', (req, res) => proxyToPython(req, res, '/analyze-report'));
app.post('/generate-questions', (req, res) => proxyToPython(req, res, '/generate-questions'));
// ============================================

// Security headers for tracking prevention
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  next();
});

// =======================
// SESSION + PASSPORT
// =======================
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

initPassport();
app.use(passport.initialize());
app.use(passport.session());

// CHATBOT ROUTES
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/feedback', feedbackRoutes);

// =======================
// ROUTES
// =======================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date(),
    endpoints: {
      tests: '/api/admin/tests',
      subjects: '/api/admin/subjects',
      auth: '/api/auth'
    }
  });
});

// User auth routes
app.use('/api/auth', authRoutes);

// Admin auth routes
app.use("/api/admin/auth", adminAuthRoutes);

// Subject routes
app.use("/api/admin", adminSubjectsRoutes);

// Test routes
app.use("/api", testRoutes);

// Existing admin routes
app.use("/api/admin", adminResourcesRoutes);
app.use("/api/admin", adminStatsRoutes);
app.use("/api/admin", require('./routes/adminUsers'));
app.use("/api/admin", require('./routes/adminAdmins'));
app.use('/api', resumeAnalyzerRoutes);

// Interview routes
app.use('/api/admin', adminAnalyticsRoutes);
app.use('/api/admin/interview', adminInterviewConfigRoutes);
app.use('/api/interview', saveInterviewRoutes);
app.use('/api/admin/interview', adminInterviewRoutes);

// Public resources
app.use("/api/resources", publicResources);

// Premium routes
app.use('/api/payment', paymentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/user', userRoutes);
app.use('/api', jobSearchRoutes);

// =======================
// PUBLIC INTERVIEW CONFIGURATION FOR CANDIDATES
// =======================
app.get('/api/public/interview-config', async (req, res) => {
  try {
    const InterviewConfig = require('./models/InterviewConfig');
    let config = await InterviewConfig.findOne();
    
    if (!config) {
      console.log('No config found, returning mock data');
      return res.json({
        categories: [
          {
            id: "technology",
            name: "Technology / IT",
            roles: [
              { id: "frontend", name: "Frontend Developer", techStacks: ["React", "Vue", "Angular", "JavaScript", "TypeScript"] },
              { id: "backend", name: "Backend Developer", techStacks: ["Node.js", "Python", "Java", "Go", "C#"] },
              { id: "fullstack", name: "Full Stack Developer", techStacks: ["MERN", "MEAN", "JAMstack"] },
              { id: "devops", name: "DevOps Engineer", techStacks: ["Docker", "Kubernetes", "AWS", "Azure"] },
              { id: "ai-ml", name: "AI/ML Engineer", techStacks: ["Python", "TensorFlow", "PyTorch", "Scikit-learn"] }
            ]
          },
          {
            id: "business",
            name: "Business & Management",
            roles: [
              { id: "marketing", name: "Marketing", techStacks: ["Digital Marketing", "SEO", "Content Strategy", "Social Media"] },
              { id: "finance", name: "Finance", techStacks: ["Financial Analysis", "Risk Management", "Investment Banking"] },
              { id: "hr", name: "Human Resources", techStacks: ["Recruitment", "Employee Relations", "HRIS", "Payroll"] },
              { id: "operations", name: "Operations", techStacks: ["Supply Chain", "Logistics", "Process Optimization"] }
            ]
          }
        ],
        levels: [
          { id: "fresher", label: "Fresher", icon: "🌱", description: "0-1 years" },
          { id: "junior", label: "Junior", icon: "🌿", description: "1-3 years" },
          { id: "mid", label: "Mid-Level", icon: "🌳", description: "3-5 years" },
          { id: "senior", label: "Senior", icon: "👑", description: "5+ years" }
        ],
        difficulties: [
          { id: "easy", label: "Easy", icon: "😊" },
          { id: "medium", label: "Medium", icon: "😐" },
          { id: "hard", label: "Hard", icon: "😰" }
        ],
        durations: [
          { value: "5", label: "5 min", icon: "⚡" },
          { value: "10", label: "10 min", icon: "⏱️" },
          { value: "15", label: "15 min", icon: "⏲️" },
          { value: "20", label: "20 min", icon: "⌛" },
          { value: "30", label: "30 min", icon: "⏳" }
        ]
      });
    }
    
    const publicConfig = {
      categories: config.categories || [],
      levels: config.levels || [],
      difficulties: config.difficulties || [],
      durations: config.durations || []
    };
    
    console.log('Serving public config with categories:', publicConfig.categories.length);
    res.json(publicConfig);
    
  } catch (error) {
    console.error('Error fetching public config:', error);
    res.status(500).json({ error: 'Failed to load interview configuration' });
  }
});

// =======================
// AI BACKEND PROXY & INTERVIEW STATS
// =======================
app.post('/api/interview/stats', authenticateUser, async (req, res) => {
  console.log('📊 [STATS] req.user:', req.user?.email);  
  try {
    const userId = req.user?.id || req.user?._id;
    
    const AI_BACKEND_URL = process.env.AI_BACKEND_URL;
    if (AI_BACKEND_URL) {
      try {
        const response = await fetch(`${AI_BACKEND_URL}/interview/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
          timeout: 5000
        });

        if (response.ok) {
          const data = await response.json();
          return res.json(data);
        }
      } catch (aiError) {
        console.log('AI Backend not available, falling back to MongoDB:', aiError.message);
      }
    }

    const Interview = require('./models/Interview');
    
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    
    const totalInterviews = interviews.length;
    
    let avgScore = 0;
    if (totalInterviews > 0) {
      const totalScore = interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
      avgScore = Math.round(totalScore / totalInterviews);
    }
    
    let improvement = 0;
    if (totalInterviews >= 2) {
      const firstScore = interviews[interviews.length - 1]?.score || 0;
      const lastScore = interviews[0]?.score || 0;
      if (firstScore > 0) {
        improvement = Math.round(((lastScore - firstScore) / firstScore) * 100);
      }
    }
    
    const hoursPracticed = totalInterviews * 0.5;
    
    const recentInterviews = interviews.slice(0, 5).map(interview => ({
      role: interview.role || interview.position || 'Interview',
      score: interview.score || 0,
      answered: interview.answered || interview.questionsAnswered || 0,
      totalQuestions: interview.totalQuestions || interview.total || 10,
      level: interview.level || interview.difficulty || 'Intermediate',
      date: interview.createdAt || interview.date || new Date(),
      _id: interview._id
    }));
    
    res.json({
      totalInterviews,
      avgScore,
      improvement,
      hoursPracticed: parseFloat(hoursPracticed.toFixed(1)),
      recentInterviews
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      error: 'Failed to fetch user stats',
      totalInterviews: 0,
      avgScore: 0,
      improvement: 0,
      hoursPracticed: 0,
      recentInterviews: []
    });
  }
});

// =======================
// SAVE INTERVIEW RESULTS
// =======================
app.post('/api/interview/save', authenticateUser, async (req, res) => {
  try {
    const Interview = require('./models/Interview');
    const { userId, role, score, answered, totalQuestions, level, answers, feedback } = req.body;
    
    const interview = new Interview({
      userId: userId || req.user?.id,
      role,
      position: role,
      score,
      percentage: score,
      answered,
      questionsAnswered: answered,
      totalQuestions,
      total: totalQuestions,
      level,
      answers,
      feedback,
      createdAt: new Date()
    });
    
    await interview.save();
    
    res.json({
      success: true,
      message: 'Interview results saved successfully',
      interviewId: interview._id
    });
  } catch (error) {
    console.error('Error saving interview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save interview results'
    });
  }
});

// =======================
// AI QUESTION GENERATION (CONNECT TO PYTHON BACKEND)
// =======================
app.post('/api/generate-question', async (req, res) => {
  try {
    const AI_BACKEND_URL =
      process.env.AI_BACKEND_URL || "https://ai-interview-1-nh5l.onrender.com";

    console.log("📡 Calling AI backend:", AI_BACKEND_URL);

    const response = await fetch(`${AI_BACKEND_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Invalid JSON from AI backend:", text);
      return res.status(500).json({
        success: false,
        message: "Invalid response from AI server",
        raw: text,
      });
    }

    res.json(data);

  } catch (error) {
    console.error("❌ Error connecting to AI backend:", error.message);
    res.status(500).json({
      success: false,
      message: "AI generation failed",
    });
  }
});

// =======================
// ROOT ENDPOINT
// =======================
app.get('/', (req, res) => {
  res.json({
    name: 'Interview Hub API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      tests: '/api/admin/tests',
      subjects: '/api/admin/subjects',
      auth: '/api/auth'
    }
  });
});

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: `Route not found: ${req.method} ${req.url}`,
    success: false,
    availableEndpoints: [
      '/api/health',
      '/api/admin/tests',
      '/api/admin/subjects',
      '/api/auth/login',
      '/api/auth/register',
      '/api/admin/interview/config',
      '/api/admin/interview/sessions'
    ]
  });
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    success: false,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// =======================
// SOCKET.IO SETUP
// =======================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      "https://ai-interview-two-kohl.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Test routes: http://localhost:${PORT}/api/admin/tests`);
  console.log(`📖 Subject routes: http://localhost:${PORT}/api/admin/subjects`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`📚 Resources routes: http://localhost:${PORT}/api/resources`);
  console.log(`🎯 Interview Config: http://localhost:${PORT}/api/admin/interview/config`);
  console.log(`📊 Interview Sessions: http://localhost:${PORT}/api/admin/interview/sessions\n`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      console.log('Please kill the process using:');
      console.log(`  On Mac/Linux: lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`);
      console.log(`  On Windows: netstat -ano | findstr :${PORT} | findstr LISTENING`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});