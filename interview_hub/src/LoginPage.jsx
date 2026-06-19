

// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { loginUser, storeUserData, getGoogleAuthURL, resendVerification } from './services/authApi';
// import { useTheme } from "./ThemeContext";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const { isDarkMode } = useTheme();

//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showErrorPopup, setShowErrorPopup] = useState(false);
//   const [showResendOption, setShowResendOption] = useState(false);
//   const [resendEmail, setResendEmail] = useState('');
//   const [resendMessage, setResendMessage] = useState('');

//   useEffect(() => {
//     // Check for Google callback
//     const urlParams = new URLSearchParams(window.location.search);
//     const errorParam = urlParams.get('error');
//     if (errorParam) {
//       setError(errorParam === 'google_auth_failed' ? 'Google login failed. Please try again.' : 'Authentication failed');
//       setShowErrorPopup(true);
//     }
//   }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     setError('');
//     setShowErrorPopup(false);
//     setShowResendOption(false);
//     setResendMessage('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setShowResendOption(false);
//     setResendMessage('');

//     try {
//       const response = await loginUser({
//         email: formData.email,
//         password: formData.password
//       });

//       storeUserData(response.user, response.token);
//       navigate('/dashboard');

//     } catch (err) {
//       const errorMsg = err.message || 'Invalid email or password';
//       setError(errorMsg);
//       setShowErrorPopup(true);
      
//       // If error indicates unverified email, show resend option
//       if (errorMsg.toLowerCase().includes('verify your email')) {
//         setShowResendOption(true);
//         setResendEmail(formData.email);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const closeErrorPopup = () => {
//     setShowErrorPopup(false);
//     setError('');
//     setShowResendOption(false);
//     setResendMessage('');
//   };

//   const handleResendVerification = async () => {
//     if (!resendEmail) return;
//     try {
//       const response = await resendVerification(resendEmail);
//       setResendMessage(response.message || 'Verification email resent. Check your inbox.');
//       // Auto hide resend option after success
//       setTimeout(() => {
//         setShowResendOption(false);
//         setResendMessage('');
//       }, 3000);
//     } catch (err) {
//       setResendMessage(err.message || 'Failed to resend verification email');
//     }
//   };

//   const handleGoogleLogin = () => {
//     window.location.href = getGoogleAuthURL();
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div className="min-h-screen bg-bg-primary transition-colors duration-300"
//          style={{ backgroundColor: 'var(--color-bg-primary)' }}>

//       {/* Navbar */}
//       <nav className="w-full h-16 fixed top-0 left-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b transition-colors duration-300"
//            style={{ borderColor: 'var(--color-border)' }}>
//         <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
//           <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
//             <i className="fas fa-robot text-3xl text-primary"></i>
//             <span className="text-xl font-bold text-white">AI Mentor</span>
//           </div>

//           <ul className="hidden lg:flex items-center gap-8">
//             <li><a href="/" className="text-sm font-semibold py-2 text-white hover:text-primary transition">Home</a></li>
//             <li><a href="/contact" className="text-sm font-semibold py-2 text-white hover:text-primary transition">Contact</a></li>
//             <li><a href="/feedback" className="text-sm font-semibold py-2 text-white hover:text-primary transition">Feedback</a></li>
//           </ul>
//         </div>
//       </nav>
      
//       {/* Login Section */}
//       <section className="pt-32 pb-20 px-6 lg:px-8 min-h-screen flex items-center">
//         <div className="max-w-md mx-auto w-full">
//           <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300"
//               style={{ 
//                 backgroundColor: 'var(--color-bg-secondary)',
//                 border: `1px solid ${'var(--color-primary)'}20`,
//                 boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
//               }}>
            
//             {/* Header */}
//             <div className="text-center mb-8">
//               <h1 className="text-3xl md:text-4xl font-black mb-2"
//                   style={{ color: 'var(--color-text-primary)' }}>
//                 Welcome to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Mentor</span>
//               </h1>
//               <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//                 Sign in to continue your interview preparation
//               </p>
//             </div>

//             {/* Google Login Button Only */}
//             <button 
//               onClick={handleGoogleLogin}
//               className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5 group"
//               style={{ 
//                 borderColor: 'var(--color-primary)',
//                 color: 'var(--color-text-primary)',
//                 backgroundColor: 'var(--color-bg-secondary)'
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.backgroundColor = 'var(--color-primary)';
//                 e.currentTarget.style.color = 'white';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
//                 e.currentTarget.style.color = 'var(--color-text-primary)';
//               }}
//             >
//               <i className="fab fa-google text-lg"></i>
//               <span className="font-medium">Continue with Google</span>
//             </button>

//             {/* Divider */}
//             <div className="relative flex items-center justify-center my-6">
//               <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
//               <span className="px-4 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>OR</span>
//               <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
//             </div>

//             {/* Login Form */}
//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Email Field */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Email</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="example@gmail.com"
//                   required
//                   className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
//                   style={{ 
//                     borderColor: `${'var(--color-primary)'}20`,
//                     backgroundColor: 'var(--color-bg-secondary)',
//                     color: 'var(--color-text-primary)'
//                   }}
//                   onFocus={(e) => {
//                     e.currentTarget.style.borderColor = 'var(--color-primary)';
//                     e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
//                   }}
//                   onBlur={(e) => {
//                     e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
//                     e.currentTarget.style.boxShadow = 'none';
//                   }}
//                 />
//               </div>

//               {/* Password Field */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Password</label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="*********"
//                     required
//                     className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all pr-12"
//                     style={{ 
//                       borderColor: `${'var(--color-primary)'}20`,
//                       backgroundColor: 'var(--color-bg-secondary)',
//                       color: 'var(--color-text-primary)'
//                     }}
//                     onFocus={(e) => {
//                       e.currentTarget.style.borderColor = 'var(--color-primary)';
//                       e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
//                     }}
//                     onBlur={(e) => {
//                       e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
//                       e.currentTarget.style.boxShadow = 'none';
//                     }}
//                   />
//                   <button
//                     type="button"
//                     onClick={togglePasswordVisibility}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-colors"
//                     style={{ color: 'var(--color-text-secondary)' }}
//                   >
//                     <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
//                   </button>
//                 </div>
//               </div>

//               {/* Forgot Password Link */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
//                   <label htmlFor="remember" className="ml-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Remember me</label>
//                 </div>
//                 <Link to="/forgot-password" className="text-sm font-medium transition-colors hover:underline" style={{ color: 'var(--color-primary)' }}>
//                   Forgot Password?
//                 </Link>
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full px-6 py-3 rounded-full text-white font-semibold text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50"
//                 style={{ 
//                   background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
//                   boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
//                 }}
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <i className="fas fa-spinner fa-spin"></i>
//                     Logging in...
//                   </span>
//                 ) : 'Login'}
//               </button>
//             </form>

//             {/* Sign Up Link */}
//             <div className="mt-6 text-center">
//               <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//                 Don't have an account?{' '}
//                 <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
//                   Sign up
//                 </Link>
//               </p>
//               <p className="text-sm mt-2">
//                 <Link to="/admin/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
//                   Admin Login
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Error Popup Modal with Resend Option */}
//       {showErrorPopup && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={closeErrorPopup}>
//           <div className="relative max-w-md w-full rounded-2xl shadow-2xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${'var(--color-error)'}20` }} onClick={(e) => e.stopPropagation()}>
//             <div className="flex justify-center mb-4">
//               <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl animate-pulse" style={{ backgroundColor: `${'var(--color-error)'}10`, color: 'var(--color-error)' }}>
//                 <i className="fas fa-exclamation-circle"></i>
//               </div>
//             </div>
//             <h3 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--color-text-primary)' }}>Login Error</h3>
//             <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
            
//             {/* Resend Verification Section */}
//             {showResendOption && (
//               <div className="mb-4 p-3 rounded-lg text-center" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
//                 <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
//                   Didn't receive the verification email?
//                 </p>
//                 <button
//                   onClick={handleResendVerification}
//                   className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
//                   style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`, color: 'white' }}
//                 >
//                   Resend Verification Email
//                 </button>
//                 {resendMessage && (
//                   <p className="text-xs mt-2" style={{ color: 'var(--color-success)' }}>{resendMessage}</p>
//                 )}
//               </div>
//             )}
            
//             <button onClick={closeErrorPopup} className="w-full px-4 py-3 rounded-full text-white font-semibold transition-all" style={{ background: `linear-gradient(to right, var(--color-error), var(--color-error))` }}>OK</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginPage;





import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, storeUserData, getGoogleAuthURL, resendVerification } from './services/authApi';
import { useTheme } from "./ThemeContext";
import BASE_URL from './config';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check for Google callback
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError(errorParam === 'google_auth_failed' ? 'Google login failed. Please try again.' : 'Authentication failed');
      setShowErrorPopup(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setShowErrorPopup(false);
    setShowResendOption(false);
    setResendMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResendOption(false);
    setResendMessage('');

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password
      });

      storeUserData(response.user, response.token);
      navigate('/dashboard');

    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password';
      setError(errorMsg);
      setShowErrorPopup(true);
      
      // If error indicates unverified email, show resend option
      if (errorMsg.toLowerCase().includes('verify your email')) {
        setShowResendOption(true);
        setResendEmail(formData.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setError('');
    setShowResendOption(false);
    setResendMessage('');
  };

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    try {
      const response = await resendVerification(resendEmail);
      setResendMessage(response.message || 'Verification email resent. Check your inbox.');
      // Auto hide resend option after success
      setTimeout(() => {
        setShowResendOption(false);
        setResendMessage('');
      }, 3000);
    } catch (err) {
      setResendMessage(err.message || 'Failed to resend verification email');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthURL();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 overflow-x-hidden"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>

      {/* Navbar - Responsive with mobile menu */}
      <nav className="w-full h-16 fixed top-0 left-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b transition-colors duration-300"
           style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <i className="fas fa-robot text-2xl sm:text-3xl text-primary"></i>
            <span className="text-lg sm:text-xl font-bold text-white">AI Mentor</span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
            <li><a href="/" className="text-sm font-semibold py-2 text-white hover:text-primary transition">Home</a></li>
            <li><a href="/contact" className="text-sm font-semibold py-2 text-white hover:text-primary transition">Contact</a></li>
            <li><a href="/feedback" className="text-sm font-semibold py-2 text-white hover:text-primary transition">Feedback</a></li>
          </ul>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden text-white text-2xl focus:outline-none z-50"
            aria-label="Toggle menu"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobileMenu}></div>
              <div className="fixed top-16 right-0 w-64 bg-white dark:bg-gray-900 shadow-2xl rounded-bl-2xl z-50 lg:hidden animate-fadeInUp">
                <ul className="flex flex-col p-4 gap-3">
                  <li><a href="/" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition">Home</a></li>
                  <li><a href="/contact" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition">Contact</a></li>
                  <li><a href="/feedback" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition">Feedback</a></li>
                </ul>
              </div>
            </>
          )}
        </div>
      </nav>
      
      {/* Login Section - Responsive padding */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                border: `1px solid ${'var(--color-primary)'}20`,
                boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
              }}>
            
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2"
                  style={{ color: 'var(--color-text-primary)' }}>
                Welcome to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Mentor</span>
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Sign in to continue your interview preparation
              </p>
            </div>

            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 sm:py-3 rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5 group text-sm sm:text-base"
              style={{ 
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
            >
              <i className="fab fa-google text-base sm:text-lg"></i>
              <span className="font-medium">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5 sm:my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
              <span className="px-3 sm:px-4 text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>OR</span>
              <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email Field */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base"
                  style={{ 
                    borderColor: `${'var(--color-primary)'}20`,
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="*********"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all pr-10 sm:pr-12 text-sm sm:text-base"
                    style={{ 
                      borderColor: `${'var(--color-primary)'}20`,
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base sm:text-lg transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Forgot Password and Remember Me */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center">
                  <input type="checkbox" id="remember" className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="remember" className="ml-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Remember me</label>
                </div>
                <Link to="/forgot-password" className="text-xs sm:text-sm font-medium transition-colors hover:underline" style={{ color: 'var(--color-primary)' }}>
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50"
                style={{ 
                  background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                  boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    Logging in...
                  </span>
                ) : 'Login'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                  Sign up
                </Link>
              </p>
              <p className="text-xs sm:text-sm mt-2">
                <Link to="/admin/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                  Admin Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Error Popup Modal - Responsive */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={closeErrorPopup}>
          <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl p-5 sm:p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${'var(--color-error)'}20` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl animate-pulse" style={{ backgroundColor: `${'var(--color-error)'}10`, color: 'var(--color-error)' }}>
                <i className="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-center mb-2" style={{ color: 'var(--color-text-primary)' }}>Login Error</h3>
            <p className="text-center mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
            
            {/* Resend Verification Section */}
            {showResendOption && (
              <div className="mb-4 p-2 sm:p-3 rounded-lg text-center" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
                <p className="text-xs sm:text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Didn't receive the verification email?
                </p>
                <button
                  onClick={handleResendVerification}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all"
                  style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`, color: 'white' }}
                >
                  Resend Verification Email
                </button>
                {resendMessage && (
                  <p className="text-[10px] sm:text-xs mt-2" style={{ color: 'var(--color-success)' }}>{resendMessage}</p>
                )}
              </div>
            )}
            
            <button onClick={closeErrorPopup} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-white font-semibold text-sm sm:text-base transition-all" style={{ background: `linear-gradient(to right, var(--color-error), var(--color-error))` }}>OK</button>
          </div>
        </div>
      )}

      {/* Add keyframe animation for mobile menu */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease forwards;
        }
      `}</style>
    </div>
  );
};


export default LoginPage;