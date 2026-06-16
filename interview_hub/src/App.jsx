import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
import SignUp from './SignUp'
import Contact from './Contact'
import Feedback from './Feedback'
import Dashboard from './Dashboard'
import Practice from './components/Practice'
import QuizPage from './components/QuizPage'
import AuthCallback from './AuthCallback'
import MockInterview from './components/MockInterview'
import ResumeAnalyzer from './components/ResumeAnalyzer'
import InterviewSetup from './components/InterviewSetup'
import SystemCheck from './components/SystemCheck'
import Instructions from './components/Instructions'
import LiveInterview from './components/LiveInterview'
import InterviewSummary from './components/InterviewSummary'
import ResumeInterview from './components/ResumeInterview'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import { AdminProvider } from './admin/AdminContext'
import AdminUsers from './admin/AdminUsers'
import AdminSubjects from './admin/AdminSubjects'
import AdminInterviewConfig from './admin/AdminInterviewConfig';
import AdminTakeTest from './admin/AdminTakeTest';
import AdminTestDetails from './admin/AdminTestDetails';
import TestAnalytics from './admin/TestAnalytics';
import AdminInterviewSessions from './admin/AdminInterviewSessions';
import AdminInterviewSessionDetails from './admin/AdminInterviewSessionDetails';
import AdminInterviewAnalytics from './admin/AdminInterviewAnalytics';
import AdminMockInterview from './admin/AdminMockInterview';
import AdminResources from './admin/AdminResources';
import AdminResumes from './admin/AdminResumes';
import AdminResumeDetails from './admin/AdminResumeDetails';
import AdminAdmins from './admin/AdminAdmins';
import AccessDenied from './admin/AccessDenied';
import { useAdmin } from './admin/AdminContext';
import Subscription from './components/Subscription';
import JobSearch from './components/JobSearch';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import PlanManagement from './admin/PlanManagement';
import UserTests from './components/UserTests';
import TakeTest from './components/TakeTest';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './VerifyEmail';

// mongodb+srv://alijakazi12005:<Alija%401405>@cluster0.mogy2km.mongodb.net/?appName=Cluster0 
// mongodb+srv://alijakazi12005:<Alija%401405>cluster0.mogy2km.mongodb.net/
//mongodb+srv://alijakazi12005:Alija%401405@cluster0.mogy2km.mongodb.net/


//mongodb://alijakazi12005:Alija%401405@ac-rbg8ku5-shard-00-00.mogy2km.mongodb.net:27017,ac-rbg8ku5-shard-00-01.mogy2km.mongodb.net:27017,ac-rbg8ku5-shard-00-02.mogy2km.mongodb.net:27017/?ssl=true&replicaSet=atlas-xt70p1-shard-0&authSource=admin&appName=Cluster0
const AdminRoute = ({ children }) => {
  const { isSuperAdmin } = useAdmin();
  return isSuperAdmin ? children : <AccessDenied />;
};

function App() {
  return (
    <AdminProvider>
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/feedback' element={<Feedback />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/google-callback" element={<AuthCallback />} />
      {/* Legal Routes */}
     
      <Route path="/verify-email" element={<VerifyEmail />} />
      {/* User Routes */}
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/practice' element={<Practice />} />
      <Route path="/quiz/:testId" element={<QuizPage />} />
      <Route path='/interviews' element={<MockInterview />} />
      <Route path='/resume-review' element={<ResumeAnalyzer />} />
      <Route path="/interview-setup" element={<InterviewSetup />} />
      <Route path="/system-check" element={<SystemCheck />} />
      <Route path="/instructions" element={<Instructions />} />
      <Route path="/live-interview" element={<LiveInterview />} />
      <Route path="/summary" element={<InterviewSummary />} />
      <Route path="/resume-interview" element={<ResumeInterview />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failure" element={<PaymentFailure />} />
      <Route path="/job-search" element={<JobSearch />} />
      
      {/* User Test Routes */}
      <Route path="/tests" element={<UserTests />} />
      <Route path="/test/:testId" element={<TakeTest />} />

      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers/>} /> 
      <Route path="/admin/admins" element={<AdminRoute><AdminAdmins /></AdminRoute>} />
      <Route path="/admin/subjects" element={<AdminSubjects />} />
      <Route path="/admin/interviews" element={<Navigate to="/admin/interview/sessions" />} />
      <Route path="/admin/interview/config" element={<AdminInterviewConfig />} />
      <Route path="/admin/interview/sessions" element={<AdminInterviewSessions />} />
      <Route path="/admin/interview/sessions/:id" element={<AdminInterviewSessionDetails />} />
      <Route path="/admin/interview/analytics" element={<AdminInterviewAnalytics />} />
      <Route path="/admin/mock-interview" element={<AdminMockInterview />} />
      <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
      <Route path="/admin/premium" element={<PlanManagement />} />
      
      {/* Admin Test Management Routes */}
      <Route path="/admin/tests/:testId/take" element={<AdminTakeTest />} />
      <Route path="/admin/tests/:testId/details" element={<AdminTestDetails />} />
      <Route path="/admin/tests/:testId/analytics" element={<TestAnalytics />} />

      </Routes>
    </AdminProvider>
  )
}

export default App;