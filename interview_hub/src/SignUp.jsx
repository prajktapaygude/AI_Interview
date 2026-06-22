
// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { registerUser, getGoogleAuthURL } from './services/authApi';
// // import { useTheme } from "./ThemeContext";

// // const SignUp = () => {
// //   const navigate = useNavigate();
// //   const { isDarkMode } = useTheme();

// //   const [formData, setFormData] = useState({
// //     fullName: '',
// //     email: '',
// //     password: ''
// //   });

// //   const [showPassword, setShowPassword] = useState(false);
// //   const [agreedToTerms, setAgreedToTerms] = useState(false);
// //   const [error, setError] = useState('');
// //   const [success, setSuccess] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [showErrorPopup, setShowErrorPopup] = useState(false);
// //   const [showSuccessPopup, setShowSuccessPopup] = useState(false);

// //   // Check for Google OAuth callback on component mount
// //   useEffect(() => {
// //     const checkGoogleCallback = async () => {
// //       const urlParams = new URLSearchParams(window.location.search);
// //       const token = urlParams.get('token');
// //       const errorParam = urlParams.get('error');
// //       const message = urlParams.get('message');
      
// //       if (token) {
// //         console.log('Google signup successful, token received');
// //         localStorage.setItem('token', token);
        
// //         // Fetch user profile
// //         try {
// //           const response = await fetch('http://localhost:5000/api/auth/profile', {
// //             headers: { 'Authorization': `Bearer ${token}` }
// //           });
// //           const data = await response.json();
          
// //           if (data.user) {
// //             localStorage.setItem('user', JSON.stringify(data.user));
// //             setSuccess(message || `Welcome ${data.user.name}! Account created successfully.`);
// //             setShowSuccessPopup(true);
// //             setTimeout(() => {
// //               navigate('/dashboard');
// //             }, 2000);
// //           }
// //         } catch (err) {
// //           console.error('Failed to fetch user profile:', err);
// //           setError('Signup successful but failed to load profile');
// //           setShowErrorPopup(true);
// //         }
        
// //         // Clean URL
// //         window.history.replaceState({}, document.title, window.location.pathname);
// //       } else if (errorParam) {
// //         setError(errorParam === 'google_auth_failed' ? 'Google signup failed. Please try again.' : 'Authentication failed');
// //         setShowErrorPopup(true);
// //         window.history.replaceState({}, document.title, window.location.pathname);
// //       }
// //     };
    
// //     checkGoogleCallback();
// //   }, [navigate]);

// //   const handleChange = (e) => {
// //     setFormData({
// //       ...formData,
// //       [e.target.name]: e.target.value
// //     });
// //     setError('');
// //     setShowErrorPopup(false);
// //   };

// //   const closeErrorPopup = () => {
// //     setShowErrorPopup(false);
// //     setError('');
// //   };

// //   const closeSuccessPopup = () => {
// //     setShowSuccessPopup(false);
// //     setSuccess('');
// //     // After closing the success popup, stay on signup page or clear form
// //     // Optionally redirect to login? We'll keep on signup.
// //   };

// //   const handleTermsChange = (e) => {
// //     setAgreedToTerms(e.target.checked);
// //   };

// //   const handleGoogleSignUp = () => {
// //     window.location.href = getGoogleAuthURL();
// //   };

// //   const togglePasswordVisibility = () => {
// //     setShowPassword(!showPassword);
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!agreedToTerms) {
// //       const errorMsg = 'Please agree to the terms and conditions';
// //       setError(errorMsg);
// //       setShowErrorPopup(true);
// //       return;
// //     }

// //     setLoading(true);
// //     setError('');
// //     setSuccess('');

// //     try {
// //       const response = await registerUser({
// //         name: formData.fullName,
// //         email: formData.email,
// //         password: formData.password
// //       });

// //       console.log("Server Response:", response);
      
// //       // BACKEND NOW RETURNS ONLY { success: true, message: 'Verification email sent...' }
// //       // No token or user object anymore for email signup
      
// //       setSuccess(response.message || "Verification email sent! Please check your inbox.");
// //       setShowSuccessPopup(true);
      
// //       // Clear form fields (optional)
// //       setFormData({ fullName: '', email: '', password: '' });
// //       setAgreedToTerms(false);
      
// //       // DO NOT redirect to dashboard – user must verify email first

// //     } catch (err) {
// //       console.error(err);
// //       let errorMessage = err.message || "Registration failed";
      
// //       if (errorMessage.includes('email already exists') || errorMessage.includes('duplicate')) {
// //         errorMessage = 'An account with this email already exists. Please login instead.';
// //       } else if (errorMessage.includes('password')) {
// //         errorMessage = 'Password must be at least 6 characters long.';
// //       }
      
// //       setError(errorMessage);
// //       setShowErrorPopup(true);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen transition-colors duration-300"
// //          style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
// //       {/* Navbar */}
// //       <nav className="w-full h-16 fixed top-0 left-0 z-40 backdrop-blur-xl border-b transition-colors duration-300"
// //            style={{ 
// //              backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
// //              borderColor: 'var(--color-border)' 
// //            }}>
// //         <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          
// //           {/* Logo */}
// //           <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
// //             <div className="w-8 h-8 rounded-lg flex items-center justify-center"
// //                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
// //               <i className="fas fa-robot text-white text-sm"></i>
// //             </div>
// //             <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
// //               AI Mentor
// //             </span>
// //           </div>

// //           {/* Navigation Menu */}
// //           <ul className="hidden lg:flex items-center gap-8">
// //             <li>
// //               <a href="/" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>
// //                 Home
// //               </a>
// //             </li>
// //             <li>
// //               <a href="/contact" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>
// //                 Contact
// //               </a>
// //             </li>
// //             <li>
// //               <a href="/feedback" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>
// //                 Feedback
// //               </a>
// //             </li>
// //           </ul>
// //         </div>
// //       </nav>

// //       {/* Sign Up Section */}
// //       <section className="pt-32 pb-20 px-6 lg:px-8 min-h-screen flex items-center">
// //         <div className="max-w-md mx-auto w-full">
// //           <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300"
// //                style={{ 
// //                  backgroundColor: 'var(--color-bg-secondary)',
// //                  border: `1px solid ${'var(--color-primary)'}20`,
// //                  boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
// //                }}>
            
// //             {/* Header */}
// //             <div className="text-center mb-8">
// //               <h1 className="text-3xl md:text-4xl font-black mb-2"
// //                   style={{ color: 'var(--color-text-primary)' }}>
// //                 Join <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Mentor</span>
// //               </h1>
// //               <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
// //                 Create your account to start interview preparation
// //               </p>
// //             </div>

// //             {/* Info Banner for Google Signup */}
// //             <div className="mb-4 p-3 rounded-lg text-center text-xs"
// //                  style={{ backgroundColor: `${'var(--color-primary)'}10`, color: 'var(--color-text-secondary)' }}>
// //               <i className="fas fa-info-circle mr-1 text-primary"></i>
// //               Click Google button below and select your account to sign up
// //             </div>

// //             {/* Social Sign Up Buttons */}
// //             <div className="space-y-3 mb-6">
// //               <button 
// //                 onClick={handleGoogleSignUp}
// //                 className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5 group"
// //                 style={{ 
// //                   borderColor: 'var(--color-primary)',
// //                   color: 'var(--color-text-primary)',
// //                   backgroundColor: 'var(--color-bg-secondary)'
// //                 }}
// //                 onMouseEnter={(e) => {
// //                   e.currentTarget.style.backgroundColor = 'var(--color-primary)';
// //                   e.currentTarget.style.color = 'white';
// //                 }}
// //                 onMouseLeave={(e) => {
// //                   e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
// //                   e.currentTarget.style.color = 'var(--color-text-primary)';
// //                 }}
// //               >
// //                 <i className="fab fa-google text-lg"></i>
// //                 <span className="font-medium">Sign up with Google</span>
// //               </button>
// //             </div>

// //             {/* Divider */}
// //             <div className="relative flex items-center justify-center mb-6">
// //               <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
// //               <span className="px-4 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>OR sign up with email</span>
// //               <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
// //             </div>

// //             {/* Sign Up Form */}
// //             <form onSubmit={handleSubmit} className="space-y-4">
// //               {/* Full Name Field */}
// //               <div className="space-y-2">
// //                 <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
// //                   Full Name
// //                 </label>
// //                 <input
// //                   type="text"
// //                   name="fullName"
// //                   value={formData.fullName}
// //                   onChange={handleChange}
// //                   placeholder="John Doe"
// //                   required
// //                   className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
// //                   style={{ 
// //                     borderColor: `${'var(--color-primary)'}20`,
// //                     backgroundColor: 'var(--color-bg-secondary)',
// //                     color: 'var(--color-text-primary)'
// //                   }}
// //                   onFocus={(e) => {
// //                     e.currentTarget.style.borderColor = 'var(--color-primary)';
// //                     e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
// //                   }}
// //                   onBlur={(e) => {
// //                     e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
// //                     e.currentTarget.style.boxShadow = 'none';
// //                   }}
// //                 />
// //               </div>

// //               {/* Email Field */}
// //               <div className="space-y-2">
// //                 <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
// //                   Email
// //                 </label>
// //                 <input
// //                   type="email"
// //                   name="email"
// //                   value={formData.email}
// //                   onChange={handleChange}
// //                   placeholder="example@gmail.com"
// //                   required
// //                   className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
// //                   style={{ 
// //                     borderColor: `${'var(--color-primary)'}20`,
// //                     backgroundColor: 'var(--color-bg-secondary)',
// //                     color: 'var(--color-text-primary)'
// //                   }}
// //                   onFocus={(e) => {
// //                     e.currentTarget.style.borderColor = 'var(--color-primary)';
// //                     e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
// //                   }}
// //                   onBlur={(e) => {
// //                     e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
// //                     e.currentTarget.style.boxShadow = 'none';
// //                   }}
// //                 />
// //               </div>

// //               {/* Password Field */}
// //               <div className="space-y-2">
// //                 <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
// //                   Password
// //                 </label>
// //                 <div className="relative">
// //                   <input
// //                     type={showPassword ? "text" : "password"}
// //                     name="password"
// //                     value={formData.password}
// //                     onChange={handleChange}
// //                     placeholder="*********"
// //                     required
// //                     className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all pr-12"
// //                     style={{ 
// //                       borderColor: `${'var(--color-primary)'}20`,
// //                       backgroundColor: 'var(--color-bg-secondary)',
// //                       color: 'var(--color-text-primary)'
// //                     }}
// //                     onFocus={(e) => {
// //                       e.currentTarget.style.borderColor = 'var(--color-primary)';
// //                       e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
// //                     }}
// //                     onBlur={(e) => {
// //                       e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
// //                       e.currentTarget.style.boxShadow = 'none';
// //                     }}
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={togglePasswordVisibility}
// //                     className="absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-colors"
// //                     style={{ color: 'var(--color-text-secondary)' }}
// //                     onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
// //                     onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
// //                   >
// //                     <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
// //                   </button>
// //                 </div>
// //                 <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
// //                   Password must be at least 6 characters
// //                 </p>
// //               </div>

// //               {/* Terms Checkbox */}
// //               <div className="flex items-center gap-2">
// //                 <input
// //                   type="checkbox"
// //                   id="terms"
// //                   checked={agreedToTerms}
// //                   onChange={handleTermsChange}
// //                   className="w-4 h-4 rounded border-2 cursor-pointer transition-colors"
// //                   style={{ 
// //                     borderColor: 'var(--color-primary)',
// //                     accentColor: 'var(--color-primary)'
// //                   }}
// //                 />
// //                 <label htmlFor="terms" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
// //                   I agree to the{' '}
// //                   <a href="/terms" className="font-medium transition-colors"
// //                      style={{ color: 'var(--color-primary)' }}
// //                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
// //                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}>
// //                     Terms of Service
// //                   </a>{' '}
// //                   and{' '}
// //                   <a href="/privacy" className="font-medium transition-colors"
// //                      style={{ color: 'var(--color-primary)' }}
// //                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
// //                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}>
// //                     Privacy Policy
// //                   </a>
// //                 </label>
// //               </div>

// //               {/* Submit Button */}
// //               <button
// //                 type="submit"
// //                 disabled={loading}
// //                 className="w-full px-6 py-3 rounded-full text-white font-semibold text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
// //                 style={{ 
// //                   background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
// //                   boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
// //                 }}
// //               >
// //                 {loading ? (
// //                   <span className="flex items-center justify-center gap-2">
// //                     <i className="fas fa-spinner fa-spin"></i>
// //                     Creating Account...
// //                   </span>
// //                 ) : (
// //                   'Create Account'
// //                 )}
// //               </button>
// //             </form>

// //             {/* Login Link */}
// //             <div className="mt-6 text-center">
// //               <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
// //                 Already have an account?{' '}
// //                 <a 
// //                   href="/login" 
// //                   className="font-semibold transition-colors"
// //                   style={{ color: 'var(--color-primary)' }}
// //                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
// //                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
// //                 >
// //                   Login
// //                 </a>
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Success Popup Modal */}
// //       {showSuccessPopup && (
// //         <div 
// //           className="fixed inset-0 z-[100] flex items-center justify-center p-4"
// //           style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
// //           onClick={closeSuccessPopup}
// //         >
// //           <div 
// //             className="relative max-w-md w-full rounded-2xl shadow-2xl p-6 animate-slideUp"
// //             style={{ 
// //               backgroundColor: 'var(--color-bg-secondary)',
// //               border: `1px solid ${'var(--color-success)'}20`
// //             }}
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             {/* Success Icon */}
// //             <div className="flex justify-center mb-4">
// //               <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl animate-bounce"
// //                    style={{ 
// //                      backgroundColor: `${'var(--color-success)'}10`,
// //                      color: 'var(--color-success)'
// //                    }}>
// //                 <i className="fas fa-check-circle"></i>
// //               </div>
// //             </div>

// //             {/* Success Title */}
// //             <h3 className="text-xl font-bold text-center mb-2"
// //                 style={{ color: 'var(--color-text-primary)' }}>
// //               Success!
// //             </h3>

// //             {/* Success Message */}
// //             <p className="text-center mb-6"
// //                style={{ color: 'var(--color-text-secondary)' }}>
// //               {success}
// //             </p>

// //             {/* Progress Bar removed because we don't auto-redirect anymore */}
// //             <button
// //               onClick={closeSuccessPopup}
// //               className="w-full px-4 py-3 rounded-full text-white font-semibold transition-all duration-300"
// //               style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
// //             >
// //               OK
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* Error Popup Modal */}
// //       {showErrorPopup && (
// //         <div 
// //           className="fixed inset-0 z-[100] flex items-center justify-center p-4"
// //           style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
// //           onClick={closeErrorPopup}
// //         >
// //           <div 
// //             className="relative max-w-md w-full rounded-2xl shadow-2xl p-6 animate-slideUp"
// //             style={{ 
// //               backgroundColor: 'var(--color-bg-secondary)',
// //               border: `1px solid ${'var(--color-error)'}20`
// //             }}
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             {/* Error Icon */}
// //             <div className="flex justify-center mb-4">
// //               <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl animate-pulse"
// //                    style={{ 
// //                      backgroundColor: `${'var(--color-error)'}10`,
// //                      color: 'var(--color-error)'
// //                    }}>
// //                 <i className="fas fa-exclamation-circle"></i>
// //               </div>
// //             </div>

// //             {/* Error Title */}
// //             <h3 className="text-xl font-bold text-center mb-2"
// //                 style={{ color: 'var(--color-text-primary)' }}>
// //               Registration Error
// //             </h3>

// //             {/* Error Message */}
// //             <p className="text-center mb-6"
// //                style={{ color: 'var(--color-text-secondary)' }}>
// //               {error}
// //             </p>

// //             {/* Action Buttons */}
// //             {error.includes('already exists') && (
// //               <button
// //                 onClick={() => {
// //                   closeErrorPopup();
// //                   navigate('/login');
// //                 }}
// //                 className="w-full px-4 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 mb-3"
// //                 style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
// //               >
// //                 Go to Login
// //               </button>
// //             )}

// //             <button
// //               onClick={closeErrorPopup}
// //               className="w-full px-4 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:-translate-y-0.5"
// //               style={{ background: `linear-gradient(to right, var(--color-error), var(--color-error))` }}
// //             >
// //               OK
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <style>{`
// //         @keyframes slideUp {
// //           from {
// //             opacity: 0;
// //             transform: translateY(20px);
// //           }
// //           to {
// //             opacity: 1;
// //             transform: translateY(0);
// //           }
// //         }
// //         @keyframes bounce {
// //           0%, 100% { transform: translateY(0); }
// //           50% { transform: translateY(-10px); }
// //         }
// //         .animate-slideUp {
// //           animation: slideUp 0.3s ease-out;
// //         }
// //         .animate-bounce {
// //           animation: bounce 0.5s ease-in-out;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default SignUp;



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { registerUser, getGoogleAuthURL } from './services/authApi';
// import { useTheme } from "./ThemeContext";
// import BASE_URL from './config';

// const SignUp = () => {
//   const navigate = useNavigate();
//   const { isDarkMode } = useTheme();

//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: ''
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showErrorPopup, setShowErrorPopup] = useState(false);
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // for responsive navigation

//   // Check for Google OAuth callback on component mount
//   useEffect(() => {
//     const checkGoogleCallback = async () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const token = urlParams.get('token');
//       const errorParam = urlParams.get('error');
//       const message = urlParams.get('message');
      
//       if (token) {
//         console.log('Google signup successful, token received');
//         localStorage.setItem('token', token);
        
//         // Fetch user profile
//         try {
//           const response = await fetch(`${BASE_URL}/api/auth/profile`, {
//             headers: { 'Authorization': `Bearer ${token}` }
//           });
//           const data = await response.json();
          
//           if (data.user) {
//             localStorage.setItem('user', JSON.stringify(data.user));
//             setSuccess(message || `Welcome ${data.user.name}! Account created successfully.`);
//             setShowSuccessPopup(true);
//             setTimeout(() => {
//               navigate('/dashboard');
//             }, 2000);
//           }
//         } catch (err) {
//           console.error('Failed to fetch user profile:', err);
//           setError('Signup successful but failed to load profile');
//           setShowErrorPopup(true);
//         }
        
//         // Clean URL
//         window.history.replaceState({}, document.title, window.location.pathname);
//       } else if (errorParam) {
//         setError(errorParam === 'google_auth_failed' ? 'Google signup failed. Please try again.' : 'Authentication failed');
//         setShowErrorPopup(true);
//         window.history.replaceState({}, document.title, window.location.pathname);
//       }
//     };
    
//     checkGoogleCallback();
//   }, [navigate]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     setError('');
//     setShowErrorPopup(false);
//   };

//   const closeErrorPopup = () => {
//     setShowErrorPopup(false);
//     setError('');
//   };

//   const closeSuccessPopup = () => {
//     setShowSuccessPopup(false);
//     setSuccess('');
//     // After closing the success popup, stay on signup page or clear form
//     // Optionally redirect to login? We'll keep on signup.
//   };

//   const handleTermsChange = (e) => {
//     setAgreedToTerms(e.target.checked);
//   };

//   const handleGoogleSignUp = () => {
//     window.location.href = getGoogleAuthURL();
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const closeMobileMenu = () => {
//     setIsMobileMenuOpen(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!agreedToTerms) {
//       const errorMsg = 'Please agree to the terms and conditions';
//       setError(errorMsg);
//       setShowErrorPopup(true);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const response = await registerUser({
//         name: formData.fullName,
//         email: formData.email,
//         password: formData.password
//       });

//       console.log("Server Response:", response);
      
//       // BACKEND NOW RETURNS ONLY { success: true, message: 'Verification email sent...' }
//       // No token or user object anymore for email signup
      
//       setSuccess(response.message || "Verification email sent! Please check your inbox.");
//       setShowSuccessPopup(true);
      
//       // Clear form fields (optional)
//       setFormData({ fullName: '', email: '', password: '' });
//       setAgreedToTerms(false);
      
//       // DO NOT redirect to dashboard – user must verify email first

//     } catch (err) {
//       console.error(err);
//       let errorMessage = err.message || "Registration failed";
      
//       if (errorMessage.includes('email already exists') || errorMessage.includes('duplicate')) {
//         errorMessage = 'An account with this email already exists. Please login instead.';
//       } else if (errorMessage.includes('password')) {
//         errorMessage = 'Password must be at least 6 characters long.';
//       }
      
//       setError(errorMessage);
//       setShowErrorPopup(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen transition-colors duration-300 overflow-x-hidden"
//          style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
//       {/* Navbar - Responsive with mobile menu */}
//       <nav className="w-full h-16 fixed top-0 left-0 z-40 backdrop-blur-xl border-b transition-colors duration-300"
//            style={{ 
//              backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
//              borderColor: 'var(--color-border)' 
//            }}>
//         <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
//           {/* Logo */}
//           <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => navigate('/')}>
//             <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
//                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
//               <i className="fas fa-robot text-white text-xs sm:text-sm"></i>
//             </div>
//             <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
//               AI Mentor
//             </span>
//           </div>

//           {/* Desktop Navigation Menu */}
//           <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
//             <li>
//               <a href="/" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>
//                 Home
//               </a>
//             </li>
//             <li>
//               <a href="/contact" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>
//                 Contact
//               </a>
//             </li>
//             <li>
//               <a href="/feedback" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>
//                 Feedback
//               </a>
//             </li>
//           </ul>

//           {/* Mobile Menu Button */}
//           <button 
//             onClick={toggleMobileMenu}
//             className="lg:hidden text-2xl focus:outline-none z-50"
//             style={{ color: 'var(--color-text-primary)' }}
//             aria-label="Toggle menu"
//           >
//             <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
//           </button>

//           {/* Mobile Dropdown Menu */}
//           {isMobileMenuOpen && (
//             <>
//               <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobileMenu}></div>
//               <div className="fixed top-16 right-0 w-64 bg-white dark:bg-gray-900 shadow-2xl rounded-bl-2xl z-50 lg:hidden animate-fadeInUp">
//                 <ul className="flex flex-col p-4 gap-3">
//                   <li><a href="/" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition">Home</a></li>
//                   <li><a href="/contact" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition">Contact</a></li>
//                   <li><a href="/feedback" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition">Feedback</a></li>
//                 </ul>
//               </div>
//             </>
//           )}
//         </div>
//       </nav>

//       {/* Sign Up Section - Responsive padding */}
//       <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
//         <div className="max-w-md mx-auto w-full">
//           <div className="backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300"
//                style={{ 
//                  backgroundColor: 'var(--color-bg-secondary)',
//                  border: `1px solid ${'var(--color-primary)'}20`,
//                  boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
//                }}>
            
//             {/* Header */}
//             <div className="text-center mb-6 sm:mb-8">
//               <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2"
//                   style={{ color: 'var(--color-text-primary)' }}>
//                 Join <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Mentor</span>
//               </h1>
//               <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//                 Create your account to start interview preparation
//               </p>
//             </div>

//             {/* Info Banner for Google Signup */}
//             <div className="mb-4 p-2 sm:p-3 rounded-lg text-center text-[11px] sm:text-xs"
//                  style={{ backgroundColor: `${'var(--color-primary)'}10`, color: 'var(--color-text-secondary)' }}>
//               <i className="fas fa-info-circle mr-1 text-primary"></i>
//               Click Google button below and select your account to sign up
//             </div>

//             {/* Social Sign Up Buttons */}
//             <div className="space-y-3 mb-5 sm:mb-6">
//               <button 
//                 onClick={handleGoogleSignUp}
//                 className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5 group text-sm sm:text-base"
//                 style={{ 
//                   borderColor: 'var(--color-primary)',
//                   color: 'var(--color-text-primary)',
//                   backgroundColor: 'var(--color-bg-secondary)'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.backgroundColor = 'var(--color-primary)';
//                   e.currentTarget.style.color = 'white';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
//                   e.currentTarget.style.color = 'var(--color-text-primary)';
//                 }}
//               >
//                 <i className="fab fa-google text-base sm:text-lg"></i>
//                 <span className="font-medium">Sign up with Google</span>
//               </button>
//             </div>

//             {/* Divider */}
//             <div className="relative flex items-center justify-center mb-5 sm:mb-6">
//               <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
//               <span className="px-3 sm:px-4 text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>OR sign up with email</span>
//               <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
//             </div>

//             {/* Sign Up Form */}
//             <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
//               {/* Full Name Field */}
//               <div className="space-y-1 sm:space-y-2">
//                 <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   placeholder="John Doe"
//                   required
//                   className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base"
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

//               {/* Email Field */}
//               <div className="space-y-1 sm:space-y-2">
//                 <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="example@gmail.com"
//                   required
//                   className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base"
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
//               <div className="space-y-1 sm:space-y-2">
//                 <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="*********"
//                     required
//                     className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all pr-10 sm:pr-12 text-sm sm:text-base"
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
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-base sm:text-lg transition-colors"
//                     style={{ color: 'var(--color-text-secondary)' }}
//                     onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
//                     onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
//                   >
//                     <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
//                   </button>
//                 </div>
//                 <p className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
//                   Password must be at least 6 characters
//                 </p>
//               </div>

//               {/* Terms Checkbox */}
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="terms"
//                   checked={agreedToTerms}
//                   onChange={handleTermsChange}
//                   className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 cursor-pointer transition-colors"
//                   style={{ 
//                     borderColor: 'var(--color-primary)',
//                     accentColor: 'var(--color-primary)'
//                   }}
//                 />
//                 <label htmlFor="terms" className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//                   I agree to the{' '}
//                   <a href="/terms" className="font-medium transition-colors"
//                      style={{ color: 'var(--color-primary)' }}
//                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
//                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}>
//                     Terms of Service
//                   </a>{' '}
//                   and{' '}
//                   <a href="/privacy" className="font-medium transition-colors"
//                      style={{ color: 'var(--color-primary)' }}
//                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
//                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}>
//                     Privacy Policy
//                   </a>
//                 </label>
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6"
//                 style={{ 
//                   background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
//                   boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
//                 }}
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <i className="fas fa-spinner fa-spin"></i>
//                     Creating Account...
//                   </span>
//                 ) : (
//                   'Create Account'
//                 )}
//               </button>
//             </form>

//             {/* Login Link */}
//             <div className="mt-5 sm:mt-6 text-center">
//               <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//                 Already have an account?{' '}
//                 <a 
//                   href="/login" 
//                   className="font-semibold transition-colors"
//                   style={{ color: 'var(--color-primary)' }}
//                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
//                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
//                 >
//                   Login
//                 </a>
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Success Popup Modal - Responsive */}
//       {showSuccessPopup && (
//         <div 
//           className="fixed inset-0 z-[100] flex items-center justify-center p-4"
//           style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
//           onClick={closeSuccessPopup}
//         >
//           <div 
//             className="relative w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 animate-slideUp"
//             style={{ 
//               backgroundColor: 'var(--color-bg-secondary)',
//               border: `1px solid ${'var(--color-success)'}20`
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Success Icon */}
//             <div className="flex justify-center mb-3 sm:mb-4">
//               <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl animate-bounce"
//                    style={{ 
//                      backgroundColor: `${'var(--color-success)'}10`,
//                      color: 'var(--color-success)'
//                    }}>
//                 <i className="fas fa-check-circle"></i>
//               </div>
//             </div>

//             {/* Success Title */}
//             <h3 className="text-lg sm:text-xl font-bold text-center mb-2"
//                 style={{ color: 'var(--color-text-primary)' }}>
//               Success!
//             </h3>

//             {/* Success Message */}
//             <p className="text-center mb-5 sm:mb-6 text-sm sm:text-base"
//                style={{ color: 'var(--color-text-secondary)' }}>
//               {success}
//             </p>

//             {/* Progress Bar removed because we don't auto-redirect anymore */}
//             <button
//               onClick={closeSuccessPopup}
//               className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 text-sm sm:text-base"
//               style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Error Popup Modal - Responsive */}
//       {showErrorPopup && (
//         <div 
//           className="fixed inset-0 z-[100] flex items-center justify-center p-4"
//           style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
//           onClick={closeErrorPopup}
//         >
//           <div 
//             className="relative w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 animate-slideUp"
//             style={{ 
//               backgroundColor: 'var(--color-bg-secondary)',
//               border: `1px solid ${'var(--color-error)'}20`
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Error Icon */}
//             <div className="flex justify-center mb-3 sm:mb-4">
//               <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl animate-pulse"
//                    style={{ 
//                      backgroundColor: `${'var(--color-error)'}10`,
//                      color: 'var(--color-error)'
//                    }}>
//                 <i className="fas fa-exclamation-circle"></i>
//               </div>
//             </div>

//             {/* Error Title */}
//             <h3 className="text-lg sm:text-xl font-bold text-center mb-2"
//                 style={{ color: 'var(--color-text-primary)' }}>
//               Registration Error
//             </h3>

//             {/* Error Message */}
//             <p className="text-center mb-5 sm:mb-6 text-sm sm:text-base"
//                style={{ color: 'var(--color-text-secondary)' }}>
//               {error}
//             </p>

//             {/* Action Buttons */}
//             {error.includes('already exists') && (
//               <button
//                 onClick={() => {
//                   closeErrorPopup();
//                   navigate('/login');
//                 }}
//                 className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 mb-3 text-sm sm:text-base"
//                 style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
//               >
//                 Go to Login
//               </button>
//             )}

//             <button
//               onClick={closeErrorPopup}
//               className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base"
//               style={{ background: `linear-gradient(to right, var(--color-error), var(--color-error))` }}
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-10px); }
//         }
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-slideUp {
//           animation: slideUp 0.3s ease-out;
//         }
//         .animate-bounce {
//           animation: bounce 0.5s ease-in-out;
//         }
//         .animate-fadeInUp {
//           animation: fadeInUp 0.2s ease forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SignUp;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getGoogleAuthURL } from './services/authApi';
import { useTheme } from "./ThemeContext";
import BASE_URL from './config';

const SignUp = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check for Google OAuth callback
  useEffect(() => {
    const checkGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const errorParam = urlParams.get('error');
      const message = urlParams.get('message');
      
      if (token) {
        console.log('Google signup successful, token received');
        localStorage.setItem('token', token);
        
        try {
          const response = await fetch(`${BASE_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setSuccess(message || `Welcome ${data.user.name}! Account created successfully.`);
            setShowSuccessPopup(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          setError('Signup successful but failed to load profile');
          setShowErrorPopup(true);
        }
        
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (errorParam) {
        setError(errorParam === 'google_auth_failed' ? 'Google signup failed. Please try again.' : 'Authentication failed');
        setShowErrorPopup(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    checkGoogleCallback();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setShowErrorPopup(false);
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setError('');
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSuccess('');
  };

  const handleTermsChange = (e) => {
    setAgreedToTerms(e.target.checked);
  };

  const handleGoogleSignUp = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      const errorMsg = 'Please agree to the terms and conditions';
      setError(errorMsg);
      setShowErrorPopup(true);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await registerUser({
        name: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      console.log("Server Response:", response);
      
      setSuccess(response.message || "Verification email sent! Please check your inbox.");
      setShowSuccessPopup(true);
      
      setFormData({ fullName: '', email: '', password: '' });
      setAgreedToTerms(false);

    } catch (err) {
      console.error(err);
      let errorMessage = err.message || "Registration failed";
      
      if (errorMessage.includes('email already exists') || errorMessage.includes('duplicate')) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (errorMessage.includes('password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      }
      
      setError(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 overflow-x-hidden"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Navbar */}
      <nav className="w-full h-16 fixed top-0 left-0 z-40 backdrop-blur-xl border-b transition-colors duration-300"
           style={{ 
             backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
             borderColor: 'var(--color-border)' 
           }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                 style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
              <i className="fas fa-robot text-white text-xs sm:text-sm"></i>
            </div>
            <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              AI Mentor
            </span>
          </div>

          <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
            <li><a href="/" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>Home</a></li>
            <li><a href="/contact" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>Contact</a></li>
            <li><a href="/feedback" className="text-sm font-semibold py-2 transition" style={{ color: 'var(--color-text-secondary)' }}>Feedback</a></li>
          </ul>

          <button onClick={toggleMobileMenu} className="lg:hidden text-2xl focus:outline-none z-50"
                  style={{ color: 'var(--color-text-primary)' }} aria-label="Toggle menu">
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

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

      {/* Sign Up Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300"
               style={{ 
                 backgroundColor: 'var(--color-bg-secondary)',
                 border: `1px solid ${'var(--color-primary)'}20`,
                 boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
               }}>
            
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2"
                  style={{ color: 'var(--color-text-primary)' }}>
                Join <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Mentor</span>
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Create your account to start interview preparation
              </p>
            </div>

            <div className="mb-4 p-2 sm:p-3 rounded-lg text-center text-[11px] sm:text-xs"
                 style={{ backgroundColor: `${'var(--color-primary)'}10`, color: 'var(--color-text-secondary)' }}>
              <i className="fas fa-info-circle mr-1 text-primary"></i>
              Click Google button below and select your account to sign up
            </div>

            <div className="space-y-3 mb-5 sm:mb-6">
              <button 
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5 group text-sm sm:text-base"
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
                <span className="font-medium">Sign up with Google</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-5 sm:mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
              <span className="px-3 sm:px-4 text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>OR sign up with email</span>
              <div className="flex-1 h-px" style={{ backgroundColor: `${'var(--color-primary)'}20` }}></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
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
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={handleTermsChange}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 cursor-pointer transition-colors"
                  style={{ 
                    borderColor: 'var(--color-primary)',
                    accentColor: 'var(--color-primary)'
                  }}
                />
                <label htmlFor="terms" className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  I agree to the{' '}
                  <a href="/terms" className="font-medium transition-colors"
                     style={{ color: 'var(--color-primary)' }}
                     onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                     onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="font-medium transition-colors"
                     style={{ color: 'var(--color-primary)' }}
                     onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                     onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}>
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6"
                style={{ 
                  background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                  boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Already have an account?{' '}
                <a href="/login" className="font-semibold transition-colors"
                   style={{ color: 'var(--color-primary)' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}>
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
             onClick={closeSuccessPopup}>
          <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 animate-slideUp"
               style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${'var(--color-success)'}20` }}
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl animate-bounce"
                   style={{ backgroundColor: `${'var(--color-success)'}10`, color: 'var(--color-success)' }}>
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-center mb-2" style={{ color: 'var(--color-text-primary)' }}>Success!</h3>
            <p className="text-center mb-5 sm:mb-6 text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>{success}</p>
            <button onClick={closeSuccessPopup}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 text-sm sm:text-base"
                    style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
             onClick={closeErrorPopup}>
          <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 animate-slideUp"
               style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${'var(--color-error)'}20` }}
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl animate-pulse"
                   style={{ backgroundColor: `${'var(--color-error)'}10`, color: 'var(--color-error)' }}>
                <i className="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-center mb-2" style={{ color: 'var(--color-text-primary)' }}>Registration Error</h3>
            <p className="text-center mb-5 sm:mb-6 text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
            {error.includes('already exists') && (
              <button onClick={() => { closeErrorPopup(); navigate('/login'); }}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 mb-3 text-sm sm:text-base"
                      style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}>
                Go to Login
              </button>
            )}
            <button onClick={closeErrorPopup}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base"
                    style={{ background: `linear-gradient(to right, var(--color-error), var(--color-error))` }}>
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-bounce { animation: bounce 0.5s ease-in-out; }
        .animate-fadeInUp { animation: fadeInUp 0.2s ease forwards; }
      `}</style>
    </div>
  );
};

export default SignUp;