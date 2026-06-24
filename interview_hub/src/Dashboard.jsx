
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ResumeAnalyzer from './components/ResumeAnalyzer';
// import Practice from './components/Practice';
// import MockInterview from './components/MockInterview';
// import Resources from './components/Resources';
// import Subscription from './components/Subscription'; 
// import JobSearch from './components/JobSearch';
// import { getStoredUser, getStoredToken, logoutUser } from './services/authApi';
// import { getUserStats } from './services/interviewApi';
// import { useTheme } from "./ThemeContext";
// import ThemeToggle from "./ThemeToggle";
// import axios from 'axios';
// import BASE_URL from './config';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { isDarkMode } = useTheme();

//   const [activeTab, setActiveTab] = useState('overview');
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [showResumeAnalyzer, setShowResumeAnalyzer] = useState(false);
//   const [showPractice, setShowPractice] = useState(false);
//   const [showMockInterview, setShowMockInterview] = useState(false);
//   const [showResources, setShowResources] = useState(false);
//   const [showPremiumServices, setShowPremiumServices] = useState(false);
//   const [availableTests, setAvailableTests] = useState([]);
//   const [showJobSearch, setShowJobSearch] = useState(false);

//   const [user, setUser] = useState(null);
//   const token = getStoredToken();
//   const API_BASE_URL = '/api';
//   const [stats, setStats] = useState({
//     totalInterviews: 0,
//     avgScore: 0,
//     improvement: 0,
//     hoursPracticed: 0
//   });
//   const [recentInterviews, setRecentInterviews] = useState([]);
//   const [loadingStats, setLoadingStats] = useState(true);

//   // Subscription state
//   const [subscription, setSubscription] = useState(null);
//   const [loadingSubscription, setLoadingSubscription] = useState(true);
//   const [hasResumeAccess, setHasResumeAccess] = useState(false);
//   const [hasJobSearchAccess, setHasJobSearchAccess] = useState(false);
//   const [userMembership, setUserMembership] = useState('Free');
  
//   // Real-time plans state
//   const [availablePlans, setAvailablePlans] = useState([]);
//   const [loadingPlans, setLoadingPlans] = useState(false);

//   useEffect(() => {
//     const storedUser = getStoredUser();
//     if (!storedUser) {
//       navigate('/login');
//     } else {
//       setUser(storedUser);
//       fetchUserStats(storedUser.id);
//       fetchSubscriptionStatus();
//       fetchAvailablePlans();
//     }
//   }, [navigate]);

//   useEffect(() => {
//     if (activeTab === 'overview' && user) {
//       fetchUserStats(user.id);
//     }
//   }, [activeTab, user]);

//   useEffect(() => {
//     if (token && user) {
//       fetchAvailableTests();
//     }
//   }, [token, user]);

//   // Fetch real-time plans from public endpoint
//   const fetchAvailablePlans = async () => {
//     try {
//       setLoadingPlans(true);
//       const response = await axios.get(`${BASE_URL}/api/plans/public/all`);
      
//       if (response.data && response.data.success) {
//         setAvailablePlans(response.data.plans);
//         console.log('📋 Plans fetched for dashboard:', response.data.plans);
//       } else if (response.data && Array.isArray(response.data)) {
//         setAvailablePlans(response.data);
//       } else {
//         // Fallback to default plans
//         setAvailablePlans([
//           { _id: '1', name: 'Basic', price: 99, features: ['5 Mock Interviews per month', 'Basic Resume Analysis', 'MCQ Tests Access'], badge: 'none', isActive: true, description: 'Perfect for beginners' },
//           { _id: '2', name: 'Pro', price: 299, features: ['Unlimited Mock Interviews', 'Advanced Resume Analysis', 'All MCQ Tests', 'Priority Support', 'Job Search Portal'], badge: 'popular', isActive: true, description: 'For serious job seekers' }
//         ]);
//       }
//     } catch (err) {
//       console.error('Failed to fetch plans for dashboard:', err);
//       setAvailablePlans([
//         { _id: '1', name: 'Basic', price: 99, features: ['5 Mock Interviews per month', 'Basic Resume Analysis', 'MCQ Tests Access'], badge: 'none', isActive: true, description: 'Perfect for beginners' },
//         { _id: '2', name: 'Pro', price: 299, features: ['Unlimited Mock Interviews', 'Advanced Resume Analysis', 'All MCQ Tests', 'Priority Support', 'Job Search Portal'], badge: 'popular', isActive: true, description: 'For serious job seekers' }
//       ]);
//     } finally {
//       setLoadingPlans(false);
//     }
//   };

//   // Helper: safely check if a subscription has expired
//   const isExpired = (expiryDateStr) => {
//     if (!expiryDateStr) return true;
//     const expiry = new Date(expiryDateStr);
//     if (isNaN(expiry.getTime())) return true; // invalid date -> treat as expired
//     const now = new Date();
//     return expiry < now;
//   };

//   // Helper: check if expiring soon (within 5 days)
//   const isExpiringSoon = (expiryDateStr) => {
//     if (!expiryDateStr) return false;
//     const expiry = new Date(expiryDateStr);
//     if (isNaN(expiry.getTime())) return false;
//     const now = new Date();
//     const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
//     return diffDays <= 5 && diffDays > 0;
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return 'Invalid date';
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     return date.toLocaleDateString(undefined, options);
//   };

//   // Get plan details by name
//   const getPlanDetails = (planName) => {
//     const plan = availablePlans.find(p => p.name === planName && p.isActive);
//     if (plan) {
//       return {
//         price: plan.price,
//         features: plan.features,
//         badge: plan.badge,
//         description: plan.description
//       };
//     }
//     if (planName === 'Basic') return { price: 99, features: [], badge: 'none', description: '' };
//     if (planName === 'Pro') return { price: 299, features: [], badge: 'popular', description: '' };
//     return { price: 0, features: [], badge: 'none', description: '' };
//   };

//   const fetchSubscriptionStatus = async () => {
//     setLoadingSubscription(true);
//     try {
//       const token = getStoredToken();
//       if (!token) return;
      
//       // Fetch user profile (may contain membership string)
//       const profileRes = await axios.get(`${BASE_URL}/api/auth/profile`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       // Fetch subscription info (contains expiry date and plan)
//       const subsRes = await axios.get(`${BASE_URL}/api/jobs/subscription-info`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       let effectiveMembership = 'Free';
//       let activeSub = subsRes.data.activeSubscription || null;
      
//       // Determine if there's a valid (non‑expired) subscription
//       if (activeSub && activeSub.expiryDate && !isExpired(activeSub.expiryDate)) {
//         effectiveMembership = activeSub.plan; // 'Basic' or 'Pro'
//       } else {
//         // No active subscription or it's expired
//         effectiveMembership = 'Free';
//         activeSub = null; // clear expired subscription from UI state
//       }
      
//       // Update state
//       setUserMembership(effectiveMembership);
//       setHasResumeAccess(effectiveMembership === 'Basic' || effectiveMembership === 'Pro');
//       setHasJobSearchAccess(effectiveMembership === 'Pro');
//       setSubscription(activeSub);
      
//       // Sync localStorage user object
//       const storedUser = getStoredUser();
//       if (storedUser) {
//         storedUser.membership = effectiveMembership;
//         localStorage.setItem('user', JSON.stringify(storedUser));
//       }
      
//     } catch (err) {
//       console.error('Failed to fetch subscription:', err);
//       // Fallback to free plan on error
//       setUserMembership('Free');
//       setHasResumeAccess(false);
//       setHasJobSearchAccess(false);
//       setSubscription(null);
//     } finally {
//       setLoadingSubscription(false);
//     }
//   };

//   const getPlanFeatures = (planName) => {
//     const plan = availablePlans.find(p => p.name === planName);
//     if (plan && plan.features) {
//       return plan.features;
//     }
//     const features = {
//       Basic: [
//         'Resume Analyzer',
//         '5 AI Mock Interviews per month',
//         'Basic Resume Analysis',
//         'MCQ Tests Access',
//         'Email Support'
//       ],
//       Pro: [
//         'Job Search Portal',
//         'Resume Analyzer',
//         'Unlimited AI Mock Interviews',
//         'Advanced Resume Analysis',
//         'All MCQ Tests',
//         'Priority Support'
//       ]
//     };
//     return features[planName] || features['Basic'];
//   };

//   const fetchUserStats = async (userId) => {
//     try {
//       setLoadingStats(true);
//       const token = getStoredToken();
//       if (!token) {
//         console.warn('No token found');
//         setLoadingStats(false);
//         return;
//       }
      
//       const response = await fetch(`${BASE_URL}/api/interview/my-sessions`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('📊 Fetched sessions:', data);
      
//       const sessions = data.sessions || [];
//       const totalInterviewsCount = sessions.length;
      
//       let avgScoreValue = 0;
//       if (sessions.length > 0) {
//         const totalScore = sessions.reduce((sum, session) => sum + (session.overallScore || 0), 0);
//         avgScoreValue = Math.round(totalScore / sessions.length);
//       }
      
//       let improvementValue = 0;
//       if (sessions.length >= 2) {
//         const firstScore = sessions[sessions.length - 1]?.overallScore || 0;
//         const lastScore = sessions[0]?.overallScore || 0;
//         if (firstScore > 0) {
//           improvementValue = Math.round(((lastScore - firstScore) / firstScore) * 100);
//         }
//       }
      
//       const hoursPracticedValue = (totalInterviewsCount * 0.5).toFixed(1);
      
//       setStats({
//         totalInterviews: totalInterviewsCount,
//         avgScore: avgScoreValue,
//         improvement: improvementValue,
//         hoursPracticed: parseFloat(hoursPracticedValue)
//       });
      
//       const formattedInterviews = sessions.slice(0, 5).map(session => ({
//         role: session.role,
//         score: session.overallScore,
//         totalQuestions: session.totalQuestions,
//         answered: session.answeredQuestions,
//         date: session.completedAt,
//         _id: session._id
//       }));
      
//       setRecentInterviews(formattedInterviews);
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//       setStats({
//         totalInterviews: 0,
//         avgScore: 0,
//         improvement: 0,
//         hoursPracticed: 0
//       });
//       setRecentInterviews([]);
//     } finally {
//       setLoadingStats(false);
//     }
//   };

//   const fetchAvailableTests = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/user/tests`, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
//       const data = await response.json();
//       setAvailableTests(data.tests || data || []);
//     } catch (err) {
//       console.error('Failed to fetch tests:', err);
//       setAvailableTests([]);
//     }
//   };

//   const handleResumeAnalyzerClick = () => {
//     if (!hasResumeAccess) {
//       setActiveTab('premiumServices');
//       setShowPremiumServices(true);
//       setShowResumeAnalyzer(false);
//       setShowPractice(false);
//       setShowMockInterview(false);
//       setShowResources(false);
//       setShowJobSearch(false);
//     } else {
//       handleMenuClick('skills');
//     }
//   };

//   const handleJobSearchClick = () => {
//     if (!hasJobSearchAccess) {
//       setActiveTab('premiumServices');
//       setShowPremiumServices(true);
//       setShowResumeAnalyzer(false);
//       setShowPractice(false);
//       setShowMockInterview(false);
//       setShowResources(false);
//       setShowJobSearch(false);
//     } else {
//       handleMenuClick('jobs');
//     }
//   };

//   const renderTestsSection = () => (
//     <div className="mb-12">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
//           📚 Available MCQ Tests
//         </h2>
//         {availableTests.length === 0 && (
//           <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800">
//             Refresh to load
//           </span>
//         )}
//       </div>
      
//       {availableTests.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {availableTests.map((test) => (
//             <div
//               key={test._id}
//               className="group p-6 rounded-2xl border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
//               style={{ 
//                 backgroundColor: 'var(--color-bg-secondary)', 
//                 borderColor: 'var(--color-border)' 
//               }}
//               onClick={() => navigate(`/test/${test._id}`)}
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
//                   {test.title}
//                 </h3>
//                 <div className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                 }`}>
//                   {test.isActive ? 'Active' : 'Draft'}
//                 </div>
//               </div>
              
//               {test.description && (
//                 <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
//                   {test.description}
//                 </p>
//               )}
              
//               <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
//                 <span className="flex items-center gap-1">
//                   <i className="far fa-clock"></i> {test.duration} min
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <i className="fas fa-question-circle"></i> {test.totalQuestions} Qs
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <i className="fas fa-fire"></i> {test.difficulty?.toUpperCase()}
//                 </span>
//               </div>
              
//               {test.attempted ? (
//                 <div className={`p-2 rounded-lg text-xs font-semibold w-full text-center transition-all ${
//                   test.attemptPassed 
//                     ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
//                     : 'bg-orange-100 text-orange-800 border border-orange-200'
//                 }`}>
//                   {test.attemptPassed ? '✅ Passed' : '🔄 Retake'} • {Math.round(test.attemptScore || 0)}%
//                 </div>
//               ) : (
//                 <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-16 rounded-2xl border-2 border-dashed" 
//              style={{ 
//                borderColor: 'var(--color-border)', 
//                backgroundColor: 'var(--color-bg-secondary)' 
//              }}>
//           <i className="fas fa-clipboard-list-check text-5xl text-gray-300 mb-4" style={{ color: 'var(--color-text-secondary)' }}></i>
//           <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
//             No Tests Available
//           </h3>
//           <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
//             Admin will assign MCQ tests for your skill assessment
//           </p>
//           <button 
//             onClick={fetchAvailableTests}
//             className="px-6 py-2 rounded-lg border font-medium transition-colors"
//             style={{ 
//               borderColor: 'var(--color-primary)', 
//               color: 'var(--color-primary)',
//               backgroundColor: 'var(--color-primary)/5'
//             }}
//           >
//             🔄 Refresh Tests
//           </button>
//         </div>
//       )}
//     </div>
//   );

//   const handleMenuClick = (tab) => {
//     setActiveTab(tab);
//     setShowResumeAnalyzer(false);
//     setShowPractice(false);
//     setShowMockInterview(false);
//     setShowResources(false);
//     setShowPremiumServices(false);
//     setShowJobSearch(false);

//     if (tab === 'skills') {
//       setShowResumeAnalyzer(true);
//     } else if (tab === 'practice') {
//       setShowPractice(true);
//     } else if (tab === 'interviews') {
//       setShowMockInterview(true);
//     } else if (tab === 'resources') {
//       setShowResources(true);
//     } else if (tab === 'premiumServices') {
//       setShowPremiumServices(true);
//     } else if (tab === 'jobs') {
//       setShowJobSearch(true);
//     }
//     setSidebarOpen(false);
//   };

//   const handleLogout = () => {
//     logoutUser();
//     navigate('/login');
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-bg-primary flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
//       </div>
//     );
//   }

//   const menuItems = [
//     { id: 'overview', icon: '📊', label: 'Overview', requiresPro: false },
//     { id: 'interviews', icon: '🎯', label: 'Mock Interview', requiresPro: false },
//     { id: 'practice', icon: '📚', label: 'MCQ Tests', requiresPro: false },
//     { id: 'skills', icon: '📄', label: 'Resume Analyzer', requiresPro: false, requiresBasic: true },
//     { id: 'jobs', icon: '💼', label: 'Job Search', requiresPro: true },
//     { id: 'resources', icon: '📚', label: 'Resources', requiresPro: false },
//     { id: 'premiumServices', icon: '💎', label: 'Subscription', requiresPro: false }
//   ];

//   const canAccessFeature = (item) => {
//     if (item.requiresPro) {
//       return hasJobSearchAccess;
//     }
//     if (item.requiresBasic) {
//       return hasResumeAccess;
//     }
//     return true;
//   };

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
//       {/* HEADER (unchanged) */}
//       <header className="fixed top-0 left-0 right-0 h-16 border-b z-30 flex items-center px-4 sm:px-6 shadow-sm"
//               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//         <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
//           <div className="flex items-center gap-3 sm:gap-4">
//             <div
//               className="flex items-center gap-2 cursor-pointer group"
//               onClick={() => navigate('/dashboard')}
//             >
//               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
//                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
//                 <i className="fas fa-robot text-white text-lg sm:text-xl"></i>
//               </div>
//               <span className="text-xl font-bold truncate max-w-[150px] sm:max-w-none transition-colors group-hover:text-primary"
//                     style={{ color: 'var(--color-text-primary)' }}>
//                 AI Mentor
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 sm:gap-3">
//             <ThemeToggle />
            
//             <div className="relative">
//               <button
//                 onClick={() => setShowProfileMenu(!showProfileMenu)}
//                 className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-bold hover:shadow-lg transition-all"
//                 style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`, color: 'white' }}
//               >
//                 {user?.name?.charAt(0) || 'U'}
//               </button>
//               {showProfileMenu && (
//                 <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-xl border overflow-hidden z-40 animate-fadeIn"
//                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//                   <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
//                     <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.name}</p>
//                     <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
//                     <p className="text-xs mt-1 font-medium" style={{ color: userMembership === 'Pro' ? '#10b981' : '#f59e0b' }}>
//                       {userMembership} Plan
//                     </p>
//                   </div>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
//                   >
//                     <i className="fas fa-sign-out-alt"></i> Logout
//                   </button>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
//               aria-label="Toggle sidebar"
//               style={{ 
//                 backgroundColor: isDarkMode 
//                   ? 'rgba(255, 255, 255, 0.15)' 
//                   : 'rgba(0, 0, 0, 0.08)',
//                 color: 'var(--color-text-primary)',
//                 border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
//               }}
//             >
//               {sidebarOpen ? (
//                 <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* SIDEBAR (unchanged except subscription status block) */}
//       <aside
//         className={`fixed top-16 left-0 bottom-0 w-64 border-r transform transition-transform duration-300 ease-in-out z-20 lg:translate-x-0 overflow-y-auto ${
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//         style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
//       >
//         <div className="h-full flex flex-col">
//           <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
//             <p className="text-sm text-text-secondary">Logged in as</p>
//             <p className="font-semibold text-text-primary truncate">{user?.name}</p>
//             <p className="text-xs text-text-secondary mt-1 truncate">{user?.email}</p>
//           </div>

//           {/* Subscription Status in Sidebar */}
//           {!loadingSubscription && (
//             <div className="mx-4 mt-4 p-3 rounded-lg" style={{ 
//               backgroundColor: userMembership === 'Pro' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
//               border: `1px solid ${userMembership === 'Pro' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
//             }}>
//               {userMembership === 'Pro' ? (
//                 <>
//                   <div className="flex items-center gap-2 mb-1">
//                     <i className="fas fa-crown text-green-600 text-sm"></i>
//                     <span className="text-xs font-semibold text-green-700">Pro Plan</span>
//                   </div>
//                   <p className="text-xs text-gray-600">
//                     Active until {subscription ? formatDate(subscription.expiryDate) : 'Active'}
//                   </p>
//                   <p className="text-xs text-green-600 mt-1">
//                     ✅ Job Search & Resume Analyzer Active
//                   </p>
//                 </>
//               ) : userMembership === 'Basic' ? (
//                 <>
//                   <div className="flex items-center gap-2 mb-1">
//                     <i className="fas fa-star text-amber-600 text-sm"></i>
//                     <span className="text-xs font-semibold text-amber-700">Basic Plan</span>
//                   </div>
//                   <p className="text-xs text-gray-600 mb-2">
//                     ✅ Resume Analyzer Active
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     Upgrade to Pro for Job Search
//                   </p>
//                   <button
//                     onClick={() => handleMenuClick('premiumServices')}
//                     className="w-full mt-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg"
//                   >
//                     Upgrade to Pro →
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <div className="flex items-center gap-2 mb-1">
//                     <i className="fas fa-user text-amber-600 text-sm"></i>
//                     <span className="text-xs font-semibold text-amber-700">Free Plan</span>
//                   </div>
//                   <p className="text-xs text-gray-600 mb-2">Subscribe to unlock features</p>
//                   <button
//                     onClick={() => handleMenuClick('premiumServices')}
//                     className="w-full py-1 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg"
//                   >
//                     View Plans →
//                   </button>
//                 </>
//               )}
//             </div>
//           )}

//           <nav className="flex-1 p-4 space-y-1">
//             {menuItems.map((item) => {
//               const isActive = activeTab === item.id;
//               const canAccess = canAccessFeature(item);
//               const isLocked = !canAccess;
              
//               const showLock = (item.requiresPro && !hasJobSearchAccess) || 
//                               (item.requiresBasic && !hasResumeAccess && userMembership === 'Free');
              
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => {
//                     if (!canAccess) {
//                       handleMenuClick('premiumServices');
//                     } else if (item.id === 'skills') {
//                       handleResumeAnalyzerClick();
//                     } else if (item.id === 'jobs') {
//                       handleJobSearchClick();
//                     } else {
//                       handleMenuClick(item.id);
//                     }
//                   }}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
//                     isActive
//                       ? 'bg-primary text-white'
//                       : isLocked
//                       ? 'text-text-secondary opacity-60 cursor-pointer'
//                       : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
//                   }`}
//                 >
//                   <span className="text-xl">{item.icon}</span>
//                   <span className="font-medium flex-1 text-left">{item.label}</span>
//                   {showLock && (
//                     <i className="fas fa-lock text-xs"></i>
//                   )}
//                   {item.requiresPro && hasJobSearchAccess && (
//                     <i className="fas fa-check-circle text-green-500 text-xs"></i>
//                   )}
//                   {item.requiresBasic && hasResumeAccess && userMembership === 'Basic' && (
//                     <i className="fas fa-check-circle text-green-500 text-xs"></i>
//                   )}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
//             >
//               <span className="text-xl">🚪</span>
//               <span className="font-medium">Logout</span>
//             </button>
//           </div>
//         </div>
//       </aside>

//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-10 lg:hidden animate-fadeIn"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* MAIN CONTENT */}
//       <main className="lg:ml-64 pt-16 min-h-screen px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
//         <div className="max-w-7xl mx-auto space-y-6">

//           {showJobSearch ? (
//             <JobSearch />
//           ) : showResumeAnalyzer ? (
//             <ResumeAnalyzer />
//           ) : showPractice ? (
//             renderTestsSection()
//           ) : showMockInterview ? (
//             <MockInterview />
//           ) : showResources ? (
//             <Resources />
//           ) : showPremiumServices ? (
//             <Subscription />
//           ) : (
//             <>
//               {/* Welcome Card */}
//               <div className="p-6 rounded-2xl border shadow-sm animate-fadeIn"
//                    style={{
//                      background: `linear-gradient(145deg, ${'var(--color-primary)'}08, ${'var(--color-secondary)'}08)`,
//                      borderColor: `${'var(--color-primary)'}20`
//                    }}>
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold"
//                        style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`, color: 'white' }}>
//                     {user?.name?.charAt(0) || 'U'}
//                   </div>
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2"
//                         style={{ color: 'var(--color-text-primary)' }}>
//                       Welcome back, {user.name}! <span className="text-3xl animate-wave">👋</span>
//                     </h1>
//                     <p className="text-sm sm:text-base mt-1" style={{ color: 'var(--color-text-secondary)' }}>
//                       {userMembership === 'Pro' 
//                         ? `You're on Pro plan! Enjoy Job Search & Resume Analyzer.` 
//                         : userMembership === 'Basic'
//                         ? `You're on Basic plan! Enjoy Resume Analyzer. Upgrade to Pro for Job Search.`
//                         : `Subscribe to unlock Resume Analyzer & Job Search features`}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Enhanced Subscription Status Card with Expiry Handling */}
//               {!loadingSubscription && (
//                 <div className="rounded-xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//                   <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
//                     <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
//                       💎 Your Plan & Features
//                     </h2>
//                     {userMembership === 'Pro' ? (
//                       <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
//                         Pro Active
//                       </span>
//                     ) : userMembership === 'Basic' ? (
//                       <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
//                         Basic Active
//                       </span>
//                     ) : (
//                       <button
//                         onClick={() => handleMenuClick('premiumServices')}
//                         className="text-sm text-primary hover:underline font-medium"
//                       >
//                         View Plans →
//                       </button>
//                     )}
//                   </div>

//                   {subscription ? (
//                     // Show subscription details only if not expired (subscription is non-null only when active)
//                     <>
//                       <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//                         <p><strong>Plan:</strong> <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{subscription.plan}</span></p>
//                         <p><strong>Expires on:</strong> {formatDate(subscription.expiryDate)}</p>
//                         {isExpiringSoon(subscription.expiryDate) && (
//                           <p className="text-amber-600 text-xs flex items-center gap-1">
//                             ⚠️ Your subscription will expire soon. <button onClick={() => handleMenuClick('premiumServices')} className="underline">Renew now</button>
//                           </p>
//                         )}
//                       </div>

//                       <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
//                         <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
//                           ✨ Plan Features:
//                         </p>
//                         <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
//                           {!loadingPlans && availablePlans.find(p => p.name === subscription.plan)?.features?.map((feature, idx) => (
//                             <li key={idx} className="flex items-center gap-1">
//                               <i className="fas fa-check-circle text-green-500 text-xs"></i> {feature}
//                             </li>
//                           ))}
//                           {loadingPlans && <li className="text-gray-400">Loading features...</li>}
//                           {!loadingPlans && !availablePlans.find(p => p.name === subscription.plan) && (
//                             getPlanFeatures(subscription.plan).map((feature, idx) => (
//                               <li key={idx} className="flex items-center gap-1">
//                                 <i className="fas fa-check-circle text-green-500 text-xs"></i> {feature}
//                               </li>
//                             ))
//                           )}
//                         </ul>
//                       </div>
//                     </>
//                   ) : (
//                     // No active subscription (or expired)
//                     <div className="text-center py-4">
//                       {userMembership === 'Free' ? (
//                         <>
//                           <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
//                             You don't have an active subscription. Choose a plan:
//                           </p>
//                           <div className="grid grid-cols-2 gap-3 text-xs mt-3 max-w-md mx-auto">
//                             {!loadingPlans && availablePlans.filter(p => p.isActive).map((plan) => (
//                               <div key={plan._id} 
//                                    className={`p-3 rounded-lg border ${plan.badge === 'popular' ? 'border-primary shadow-md' : ''}`} 
//                                    style={{ borderColor: 'var(--color-border)' }}>
//                                 <div className="font-bold text-primary">{plan.name}</div>
//                                 <div className="text-lg font-bold">₹{plan.price}</div>
//                                 <div className="text-xs text-gray-500">/month</div>
//                                 <div className="mt-2 text-left">
//                                   {plan.features && plan.features.slice(0, 2).map((feature, idx) => (
//                                     <div key={idx} className="flex items-center gap-1 text-xs mt-1">
//                                       <i className="fas fa-check-circle text-green-500 text-xs"></i>
//                                       <span className="truncate">{feature}</span>
//                                     </div>
//                                   ))}
//                                   {plan.features && plan.features.length > 2 && (
//                                     <div className="text-xs text-gray-500 mt-1">+{plan.features.length - 2} more</div>
//                                   )}
//                                 </div>
//                               </div>
//                             ))}
//                             {loadingPlans && (
//                               <div className="col-span-2 text-center py-4">
//                                 <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
//                                 <p className="text-xs mt-2">Loading plans...</p>
//                               </div>
//                             )}
//                           </div>
//                           <button
//                             onClick={() => handleMenuClick('premiumServices')}
//                             className="mt-4 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition"
//                           >
//                             View All Subscription Plans
//                           </button>
//                         </>
//                       ) : (
//                         // This case should not happen because if userMembership is Basic/Pro, subscription should exist.
//                         // But as a fallback, show renewal prompt.
//                         <div className="text-red-600">
//                           <p className="text-sm font-semibold">Your subscription has expired or is inactive.</p>
//                           <button
//                             onClick={() => handleMenuClick('premiumServices')}
//                             className="mt-2 px-4 py-1 bg-red-600 text-white rounded-lg text-sm"
//                           >
//                             Renew Now
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Stats Grid (unchanged) */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
//                 {[
//                   { label: 'Total Interviews', value: loadingStats ? '...' : stats.totalInterviews, icon: '📊', color: 'primary' },
//                   { label: 'Average Score', value: loadingStats ? '...' : `${stats.avgScore}%`, icon: '📈', color: 'secondary' },
//                   { label: 'Improvement Rate', value: loadingStats ? '...' : `${stats.improvement}%`, icon: '📈', color: 'accent' },
//                   { label: 'Hours Practiced', value: loadingStats ? '...' : stats.hoursPracticed, icon: '⏱️', color: 'primary' },
//                 ].map((stat, index) => (
//                   <div
//                     key={index}
//                     className="p-5 rounded-xl border hover:shadow-lg transition-all"
//                     style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
//                   >
//                     <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3"
//                          style={{ backgroundColor: `var(--color-${stat.color})20`, color: `var(--color-${stat.color})` }}>
//                       <span>{stat.icon}</span>
//                     </div>
//                     <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stat.value}</h3>
//                     <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</p>
//                   </div>
//                 ))}
//               </div>

//               {/* Recent Activity (unchanged) */}
//               <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//                 <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recent Activity</h2>
//                 <div className="space-y-3">
//                   {loadingStats ? (
//                     [...Array(4)].map((_, i) => (
//                       <div key={i} className="flex items-center justify-between py-2">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse"></div>
//                           <div>
//                             <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
//                             <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//                           </div>
//                         </div>
//                         <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//                       </div>
//                     ))
//                   ) : recentInterviews.length > 0 ? (
//                     recentInterviews.map((interview, i) => (
//                       <div key={i} className="flex items-center justify-between py-2 border-b last:border-0"
//                            style={{ borderColor: 'var(--color-border)' }}>
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                             <i className="fas fa-user-tie text-sm" style={{ color: 'var(--color-primary)' }}></i>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                               {interview.role || 'Interview'} Interview
//                             </p>
//                             <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
//                               {interview.answered || 0}/{interview.totalQuestions || 0} questions
//                             </p>
//                           </div>
//                         </div>
//                         <span className="text-sm font-bold" style={{ 
//                           color: (interview.score || 0) >= 70 ? '#10b981' : 
//                                  (interview.score || 0) >= 40 ? '#f59e0b' : '#ef4444'
//                         }}>
//                           {interview.score || 0}%
//                         </span>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center py-8">
//                       <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
//                         <i className="fas fa-graduation-cap text-2xl" style={{ color: 'var(--color-primary)' }}></i>
//                       </div>
//                       <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                         No interviews yet
//                       </p>
//                       <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
//                         Start your first mock interview to see your progress!
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </main>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes wave {
//           0%, 100% { transform: rotate(0deg); }
//           25% { transform: rotate(15deg); }
//           75% { transform: rotate(-15deg); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }
//         .animate-wave {
//           animation: wave 1.5s infinite;
//           display: inline-block;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Practice from './components/Practice';
import MockInterview from './components/MockInterview';
import Resources from './components/Resources';
import Subscription from './components/Subscription'; 
import JobSearch from './components/JobSearch';
import { getStoredUser, getStoredToken, logoutUser } from './services/authApi';
import { getUserStats } from './services/interviewApi';
import { useTheme } from "./ThemeContext";
import ThemeToggle from "./ThemeToggle";
import axios from 'axios';
import BASE_URL from './config';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showResumeAnalyzer, setShowResumeAnalyzer] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showPremiumServices, setShowPremiumServices] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [showJobSearch, setShowJobSearch] = useState(false);

  const [user, setUser] = useState(null);
  // ✅ FIX: Get token from both possible storage keys
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  // ✅ FIX: Use absolute backend URL with /api
  const API_BASE_URL = `${BASE_URL}/api`;

  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    improvement: 0,
    hoursPracticed: 0
  });
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [hasResumeAccess, setHasResumeAccess] = useState(false);
  const [hasJobSearchAccess, setHasJobSearchAccess] = useState(false);
  const [userMembership, setUserMembership] = useState('Free');
  
  // Real-time plans state
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
      fetchUserStats(storedUser.id);
      fetchSubscriptionStatus();
      fetchAvailablePlans();
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'overview' && user) {
      fetchUserStats(user.id);
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (token && user) {
      fetchAvailableTests();
    }
  }, [token, user]);

  // Fetch real-time plans from public endpoint
  const fetchAvailablePlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await axios.get(`${BASE_URL}/api/plans/public/all`);
      
      if (response.data && response.data.success) {
        setAvailablePlans(response.data.plans);
        console.log('📋 Plans fetched for dashboard:', response.data.plans);
      } else if (response.data && Array.isArray(response.data)) {
        setAvailablePlans(response.data);
      } else {
        // Fallback to default plans
        setAvailablePlans([
          { _id: '1', name: 'Basic', price: 99, features: ['5 Mock Interviews per month', 'Basic Resume Analysis', 'MCQ Tests Access'], badge: 'none', isActive: true, description: 'Perfect for beginners' },
          { _id: '2', name: 'Pro', price: 299, features: ['Unlimited Mock Interviews', 'Advanced Resume Analysis', 'All MCQ Tests', 'Priority Support', 'Job Search Portal'], badge: 'popular', isActive: true, description: 'For serious job seekers' }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch plans for dashboard:', err);
      setAvailablePlans([
        { _id: '1', name: 'Basic', price: 99, features: ['5 Mock Interviews per month', 'Basic Resume Analysis', 'MCQ Tests Access'], badge: 'none', isActive: true, description: 'Perfect for beginners' },
        { _id: '2', name: 'Pro', price: 299, features: ['Unlimited Mock Interviews', 'Advanced Resume Analysis', 'All MCQ Tests', 'Priority Support', 'Job Search Portal'], badge: 'popular', isActive: true, description: 'For serious job seekers' }
      ]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Helper: safely check if a subscription has expired
  const isExpired = (expiryDateStr) => {
    if (!expiryDateStr) return true;
    const expiry = new Date(expiryDateStr);
    if (isNaN(expiry.getTime())) return true; // invalid date -> treat as expired
    const now = new Date();
    return expiry < now;
  };

  // Helper: check if expiring soon (within 5 days)
  const isExpiringSoon = (expiryDateStr) => {
    if (!expiryDateStr) return false;
    const expiry = new Date(expiryDateStr);
    if (isNaN(expiry.getTime())) return false;
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays > 0;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Get plan details by name
  const getPlanDetails = (planName) => {
    const plan = availablePlans.find(p => p.name === planName && p.isActive);
    if (plan) {
      return {
        price: plan.price,
        features: plan.features,
        badge: plan.badge,
        description: plan.description
      };
    }
    if (planName === 'Basic') return { price: 99, features: [], badge: 'none', description: '' };
    if (planName === 'Pro') return { price: 299, features: [], badge: 'popular', description: '' };
    return { price: 0, features: [], badge: 'none', description: '' };
  };

  const fetchSubscriptionStatus = async () => {
    setLoadingSubscription(true);
    try {
      const token = getStoredToken();
      if (!token) return;
      
      // Fetch user profile (may contain membership string)
      const profileRes = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch subscription info (contains expiry date and plan)
      const subsRes = await axios.get(`${BASE_URL}/api/jobs/subscription-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let effectiveMembership = 'Free';
      let activeSub = subsRes.data.activeSubscription || null;
      
      // Determine if there's a valid (non‑expired) subscription
      if (activeSub && activeSub.expiryDate && !isExpired(activeSub.expiryDate)) {
        effectiveMembership = activeSub.plan; // 'Basic' or 'Pro'
      } else {
        // No active subscription or it's expired
        effectiveMembership = 'Free';
        activeSub = null; // clear expired subscription from UI state
      }
      
      // Update state
      setUserMembership(effectiveMembership);
      setHasResumeAccess(effectiveMembership === 'Basic' || effectiveMembership === 'Pro');
      setHasJobSearchAccess(effectiveMembership === 'Pro');
      setSubscription(activeSub);
      
      // Sync localStorage user object
      const storedUser = getStoredUser();
      if (storedUser) {
        storedUser.membership = effectiveMembership;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
      
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      // Fallback to free plan on error
      setUserMembership('Free');
      setHasResumeAccess(false);
      setHasJobSearchAccess(false);
      setSubscription(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const getPlanFeatures = (planName) => {
    const plan = availablePlans.find(p => p.name === planName);
    if (plan && plan.features) {
      return plan.features;
    }
    const features = {
      Basic: [
        'Resume Analyzer',
        '5 AI Mock Interviews per month',
        'Basic Resume Analysis',
        'MCQ Tests Access',
        'Email Support'
      ],
      Pro: [
        'Job Search Portal',
        'Resume Analyzer',
        'Unlimited AI Mock Interviews',
        'Advanced Resume Analysis',
        'All MCQ Tests',
        'Priority Support'
      ]
    };
    return features[planName] || features['Basic'];
  };

  const fetchUserStats = async (userId) => {
    try {
      setLoadingStats(true);
      const token = getStoredToken();
      if (!token) {
        console.warn('No token found');
        setLoadingStats(false);
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/interview/my-sessions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Fetched sessions:', data);
      
      const sessions = data.sessions || [];
      const totalInterviewsCount = sessions.length;
      
      let avgScoreValue = 0;
      if (sessions.length > 0) {
        const totalScore = sessions.reduce((sum, session) => sum + (session.overallScore || 0), 0);
        avgScoreValue = Math.round(totalScore / sessions.length);
      }
      
      let improvementValue = 0;
      if (sessions.length >= 2) {
        const firstScore = sessions[sessions.length - 1]?.overallScore || 0;
        const lastScore = sessions[0]?.overallScore || 0;
        if (firstScore > 0) {
          improvementValue = Math.round(((lastScore - firstScore) / firstScore) * 100);
        }
      }
      
      const hoursPracticedValue = (totalInterviewsCount * 0.5).toFixed(1);
      
      setStats({
        totalInterviews: totalInterviewsCount,
        avgScore: avgScoreValue,
        improvement: improvementValue,
        hoursPracticed: parseFloat(hoursPracticedValue)
      });
      
      const formattedInterviews = sessions.slice(0, 5).map(session => ({
        role: session.role,
        score: session.overallScore,
        totalQuestions: session.totalQuestions,
        answered: session.answeredQuestions,
        date: session.completedAt,
        _id: session._id
      }));
      
      setRecentInterviews(formattedInterviews);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalInterviews: 0,
        avgScore: 0,
        improvement: 0,
        hoursPracticed: 0
      });
      setRecentInterviews([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      // ✅ Now uses API_BASE_URL = BASE_URL/api → correct absolute URL
      const response = await fetch(`${API_BASE_URL}/user/tests`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setAvailableTests(data.tests || data || []);
    } catch (err) {
      console.error('Failed to fetch tests:', err);
      setAvailableTests([]);
    }
  };

  const handleResumeAnalyzerClick = () => {
    if (!hasResumeAccess) {
      setActiveTab('premiumServices');
      setShowPremiumServices(true);
      setShowResumeAnalyzer(false);
      setShowPractice(false);
      setShowMockInterview(false);
      setShowResources(false);
      setShowJobSearch(false);
    } else {
      handleMenuClick('skills');
    }
  };

  const handleJobSearchClick = () => {
    if (!hasJobSearchAccess) {
      setActiveTab('premiumServices');
      setShowPremiumServices(true);
      setShowResumeAnalyzer(false);
      setShowPractice(false);
      setShowMockInterview(false);
      setShowResources(false);
      setShowJobSearch(false);
    } else {
      handleMenuClick('jobs');
    }
  };

  const renderTestsSection = () => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          📚 Available MCQ Tests
        </h2>
        {availableTests.length === 0 && (
          <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            Refresh to load
          </span>
        )}
      </div>
      
      {availableTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTests.map((test) => (
            <div
              key={test._id}
              className="group p-6 rounded-2xl border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)', 
                borderColor: 'var(--color-border)' 
              }}
              onClick={() => navigate(`/test/${test._id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                  {test.title}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {test.isActive ? 'Active' : 'Draft'}
                </div>
              </div>
              
              {test.description && (
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {test.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="flex items-center gap-1">
                  <i className="far fa-clock"></i> {test.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <i className="fas fa-question-circle"></i> {test.totalQuestions} Qs
                </span>
                <span className="flex items-center gap-1">
                  <i className="fas fa-fire"></i> {test.difficulty?.toUpperCase()}
                </span>
              </div>
              
              {test.attempted ? (
                <div className={`p-2 rounded-lg text-xs font-semibold w-full text-center transition-all ${
                  test.attemptPassed 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-orange-100 text-orange-800 border border-orange-200'
                }`}>
                  {test.attemptPassed ? '✅ Passed' : '🔄 Retake'} • {Math.round(test.attemptScore || 0)}%
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed" 
             style={{ 
               borderColor: 'var(--color-border)', 
               backgroundColor: 'var(--color-bg-secondary)' 
             }}>
          <i className="fas fa-clipboard-list-check text-5xl text-gray-300 mb-4" style={{ color: 'var(--color-text-secondary)' }}></i>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Tests Available
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Admin will assign MCQ tests for your skill assessment
          </p>
          <button 
            onClick={fetchAvailableTests}
            className="px-6 py-2 rounded-lg border font-medium transition-colors"
            style={{ 
              borderColor: 'var(--color-primary)', 
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary)/5'
            }}
          >
            🔄 Refresh Tests
          </button>
        </div>
      )}
    </div>
  );

  const handleMenuClick = (tab) => {
    setActiveTab(tab);
    setShowResumeAnalyzer(false);
    setShowPractice(false);
    setShowMockInterview(false);
    setShowResources(false);
    setShowPremiumServices(false);
    setShowJobSearch(false);

    if (tab === 'skills') {
      setShowResumeAnalyzer(true);
    } else if (tab === 'practice') {
      setShowPractice(true);
    } else if (tab === 'interviews') {
      setShowMockInterview(true);
    } else if (tab === 'resources') {
      setShowResources(true);
    } else if (tab === 'premiumServices') {
      setShowPremiumServices(true);
    } else if (tab === 'jobs') {
      setShowJobSearch(true);
    }
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview', requiresPro: false },
    { id: 'interviews', icon: '🎯', label: 'Mock Interview', requiresPro: false },
    { id: 'practice', icon: '📚', label: 'MCQ Tests', requiresPro: false },
    { id: 'skills', icon: '📄', label: 'Resume Analyzer', requiresPro: false, requiresBasic: true },
    { id: 'jobs', icon: '💼', label: 'Job Search', requiresPro: true },
    { id: 'resources', icon: '📚', label: 'Resources', requiresPro: false },
    { id: 'premiumServices', icon: '💎', label: 'Subscription', requiresPro: false }
  ];

  const canAccessFeature = (item) => {
    if (item.requiresPro) {
      return hasJobSearchAccess;
    }
    if (item.requiresBasic) {
      return hasResumeAccess;
    }
    return true;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b z-30 flex items-center px-4 sm:px-6 shadow-sm"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                   style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
                <i className="fas fa-robot text-white text-lg sm:text-xl"></i>
              </div>
              <span className="text-xl font-bold truncate max-w-[150px] sm:max-w-none transition-colors group-hover:text-primary"
                    style={{ color: 'var(--color-text-primary)' }}>
                AI Mentor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-bold hover:shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`, color: 'white' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-xl border overflow-hidden z-40 animate-fadeIn"
                     style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: userMembership === 'Pro' ? '#10b981' : '#f59e0b' }}>
                      {userMembership} Plan
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle sidebar"
              style={{ 
                backgroundColor: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(0, 0, 0, 0.08)',
                color: 'var(--color-text-primary)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
              }}
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 border-r transform transition-transform duration-300 ease-in-out z-20 lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm text-text-secondary">Logged in as</p>
            <p className="font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-secondary mt-1 truncate">{user?.email}</p>
          </div>

          {/* Subscription Status in Sidebar */}
          {!loadingSubscription && (
            <div className="mx-4 mt-4 p-3 rounded-lg" style={{ 
              backgroundColor: userMembership === 'Pro' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${userMembership === 'Pro' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              {userMembership === 'Pro' ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-crown text-green-600 text-sm"></i>
                    <span className="text-xs font-semibold text-green-700">Pro Plan</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Active until {subscription ? formatDate(subscription.expiryDate) : 'Active'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Job Search & Resume Analyzer Active
                  </p>
                </>
              ) : userMembership === 'Basic' ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-star text-amber-600 text-sm"></i>
                    <span className="text-xs font-semibold text-amber-700">Basic Plan</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    ✅ Resume Analyzer Active
                  </p>
                  <p className="text-xs text-gray-500">
                    Upgrade to Pro for Job Search
                  </p>
                  <button
                    onClick={() => handleMenuClick('premiumServices')}
                    className="w-full mt-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg"
                  >
                    Upgrade to Pro →
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-user text-amber-600 text-sm"></i>
                    <span className="text-xs font-semibold text-amber-700">Free Plan</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Subscribe to unlock features</p>
                  <button
                    onClick={() => handleMenuClick('premiumServices')}
                    className="w-full py-1 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg"
                  >
                    View Plans →
                  </button>
                </>
              )}
            </div>
          )}

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const canAccess = canAccessFeature(item);
              const isLocked = !canAccess;
              
              const showLock = (item.requiresPro && !hasJobSearchAccess) || 
                              (item.requiresBasic && !hasResumeAccess && userMembership === 'Free');
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!canAccess) {
                      handleMenuClick('premiumServices');
                    } else if (item.id === 'skills') {
                      handleResumeAnalyzerClick();
                    } else if (item.id === 'jobs') {
                      handleJobSearchClick();
                    } else {
                      handleMenuClick(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white'
                      : isLocked
                      ? 'text-text-secondary opacity-60 cursor-pointer'
                      : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {showLock && (
                    <i className="fas fa-lock text-xs"></i>
                  )}
                  {item.requiresPro && hasJobSearchAccess && (
                    <i className="fas fa-check-circle text-green-500 text-xs"></i>
                  )}
                  {item.requiresBasic && hasResumeAccess && userMembership === 'Basic' && (
                    <i className="fas fa-check-circle text-green-500 text-xs"></i>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 pt-16 min-h-screen px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {showJobSearch ? (
            <JobSearch />
          ) : showResumeAnalyzer ? (
            <ResumeAnalyzer />
          ) : showPractice ? (
            renderTestsSection()
          ) : showMockInterview ? (
            <MockInterview />
          ) : showResources ? (
            <Resources />
          ) : showPremiumServices ? (
            <Subscription />
          ) : (
            <>
              {/* Welcome Card */}
              <div className="p-6 rounded-2xl border shadow-sm animate-fadeIn"
                   style={{
                     background: `linear-gradient(145deg, ${'var(--color-primary)'}08, ${'var(--color-secondary)'}08)`,
                     borderColor: `${'var(--color-primary)'}20`
                   }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold"
                       style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`, color: 'white' }}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2"
                        style={{ color: 'var(--color-text-primary)' }}>
                      Welcome back, {user.name}! <span className="text-3xl animate-wave">👋</span>
                    </h1>
                    <p className="text-sm sm:text-base mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {userMembership === 'Pro' 
                        ? `You're on Pro plan! Enjoy Job Search & Resume Analyzer.` 
                        : userMembership === 'Basic'
                        ? `You're on Basic plan! Enjoy Resume Analyzer. Upgrade to Pro for Job Search.`
                        : `Subscribe to unlock Resume Analyzer & Job Search features`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Subscription Status Card with Expiry Handling */}
              {!loadingSubscription && (
                <div className="rounded-xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      💎 Your Plan & Features
                    </h2>
                    {userMembership === 'Pro' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Pro Active
                      </span>
                    ) : userMembership === 'Basic' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        Basic Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMenuClick('premiumServices')}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        View Plans →
                      </button>
                    )}
                  </div>

                  {subscription ? (
                    // Show subscription details only if not expired (subscription is non-null only when active)
                    <>
                      <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <p><strong>Plan:</strong> <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{subscription.plan}</span></p>
                        <p><strong>Expires on:</strong> {formatDate(subscription.expiryDate)}</p>
                        {isExpiringSoon(subscription.expiryDate) && (
                          <p className="text-amber-600 text-xs flex items-center gap-1">
                            ⚠️ Your subscription will expire soon. <button onClick={() => handleMenuClick('premiumServices')} className="underline">Renew now</button>
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                          ✨ Plan Features:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {!loadingPlans && availablePlans.find(p => p.name === subscription.plan)?.features?.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <i className="fas fa-check-circle text-green-500 text-xs"></i> {feature}
                            </li>
                          ))}
                          {loadingPlans && <li className="text-gray-400">Loading features...</li>}
                          {!loadingPlans && !availablePlans.find(p => p.name === subscription.plan) && (
                            getPlanFeatures(subscription.plan).map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <i className="fas fa-check-circle text-green-500 text-xs"></i> {feature}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </>
                  ) : (
                    // No active subscription (or expired)
                    <div className="text-center py-4">
                      {userMembership === 'Free' ? (
                        <>
                          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                            You don't have an active subscription. Choose a plan:
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-xs mt-3 max-w-md mx-auto">
                            {!loadingPlans && availablePlans.filter(p => p.isActive).map((plan) => (
                              <div key={plan._id} 
                                   className={`p-3 rounded-lg border ${plan.badge === 'popular' ? 'border-primary shadow-md' : ''}`} 
                                   style={{ borderColor: 'var(--color-border)' }}>
                                <div className="font-bold text-primary">{plan.name}</div>
                                <div className="text-lg font-bold">₹{plan.price}</div>
                                <div className="text-xs text-gray-500">/month</div>
                                <div className="mt-2 text-left">
                                  {plan.features && plan.features.slice(0, 2).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-1 text-xs mt-1">
                                      <i className="fas fa-check-circle text-green-500 text-xs"></i>
                                      <span className="truncate">{feature}</span>
                                    </div>
                                  ))}
                                  {plan.features && plan.features.length > 2 && (
                                    <div className="text-xs text-gray-500 mt-1">+{plan.features.length - 2} more</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {loadingPlans && (
                              <div className="col-span-2 text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
                                <p className="text-xs mt-2">Loading plans...</p>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleMenuClick('premiumServices')}
                            className="mt-4 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition"
                          >
                            View All Subscription Plans
                          </button>
                        </>
                      ) : (
                        // This case should not happen because if userMembership is Basic/Pro, subscription should exist.
                        // But as a fallback, show renewal prompt.
                        <div className="text-red-600">
                          <p className="text-sm font-semibold">Your subscription has expired or is inactive.</p>
                          <button
                            onClick={() => handleMenuClick('premiumServices')}
                            className="mt-2 px-4 py-1 bg-red-600 text-white rounded-lg text-sm"
                          >
                            Renew Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Grid (unchanged) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Total Interviews', value: loadingStats ? '...' : stats.totalInterviews, icon: '📊', color: 'primary' },
                  { label: 'Average Score', value: loadingStats ? '...' : `${stats.avgScore}%`, icon: '📈', color: 'secondary' },
                  { label: 'Improvement Rate', value: loadingStats ? '...' : `${stats.improvement}%`, icon: '📈', color: 'accent' },
                  { label: 'Hours Practiced', value: loadingStats ? '...' : stats.hoursPracticed, icon: '⏱️', color: 'primary' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl border hover:shadow-lg transition-all"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3"
                         style={{ backgroundColor: `var(--color-${stat.color})20`, color: `var(--color-${stat.color})` }}>
                      <span>{stat.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stat.value}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity (unchanged) */}
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recent Activity</h2>
                <div className="space-y-3">
                  {loadingStats ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse"></div>
                          <div>
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))
                  ) : recentInterviews.length > 0 ? (
                    recentInterviews.map((interview, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0"
                           style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="fas fa-user-tie text-sm" style={{ color: 'var(--color-primary)' }}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {interview.role || 'Interview'} Interview
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                              {interview.answered || 0}/{interview.totalQuestions || 0} questions
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold" style={{ 
                          color: (interview.score || 0) >= 70 ? '#10b981' : 
                                 (interview.score || 0) >= 40 ? '#f59e0b' : '#ef4444'
                        }}>
                          {interview.score || 0}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-graduation-cap text-2xl" style={{ color: 'var(--color-primary)' }}></i>
                      </div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        No interviews yet
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Start your first mock interview to see your progress!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-wave {
          animation: wave 1.5s infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;