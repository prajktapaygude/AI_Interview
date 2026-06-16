
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTheme } from "./ThemeContext";

// const Feedback = () => {
//   const navigate = useNavigate();
//   const { isDarkMode } = useTheme();

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     rating: 0,
//     feedback: ''
//   });

//   const [hoverRating, setHoverRating] = useState(0);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [charCount, setCharCount] = useState(0);
//   const [serverError, setServerError] = useState('');   // new state for server errors

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     if (e.target.name === 'feedback') {
//       setCharCount(e.target.value.length);
//     }
//     // Clear field-specific error when user types
//     if (errors[e.target.name]) {
//       setErrors({
//         ...errors,
//         [e.target.name]: null
//       });
//     }
//     if (serverError) setServerError('');
//   };

//   const handleRatingClick = (rating) => {
//     setFormData({
//       ...formData,
//       rating: rating
//     });
//   };

//   const handleRatingHover = (rating) => {
//     setHoverRating(rating);
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.feedback.trim()) {
//       newErrors.feedback = 'Feedback is required';
//     } else if (formData.feedback.length < 10) {
//       newErrors.feedback = 'Feedback must be at least 10 characters';
//     }
//     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = validateForm();
    
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setLoading(true);
//     setServerError('');

//     try {
//       const response = await fetch('http://localhost:5000/api/feedback', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setIsSubmitted(true);
//         // Reset form after successful submission
//         setFormData({
//           name: '',
//           email: '',
//           rating: 0,
//           feedback: ''
//         });
//         setHoverRating(0);
//         setCharCount(0);
        
//         // Auto-hide success message after 3 seconds
//         setTimeout(() => {
//           setIsSubmitted(false);
//         }, 3000);
//       } else {
//         // Display server-side error (e.g., validation failure)
//         setServerError(data.error || 'Submission failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error submitting feedback:', error);
//       setServerError('Network error. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Animation on scroll
//   useEffect(() => {
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('animate-fadeInUp');
//         }
//       });
//     }, { threshold: 0.1 });

//     document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
//     return () => observer.disconnect();
//   }, []);

//   const renderStars = () => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       const isActive = i <= (hoverRating || formData.rating);
//       stars.push(
//         <button
//           key={i}
//           type="button"
//           className="focus:outline-none transform transition-transform hover:scale-110"
//           onClick={() => handleRatingClick(i)}
//           onMouseEnter={() => handleRatingHover(i)}
//           onMouseLeave={() => setHoverRating(0)}
//         >
//           <i
//             className={`${
//               isActive ? 'fas fa-star' : 'far fa-star'
//             } text-3xl transition-all duration-200`}
//             style={{ 
//               color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
//               filter: isActive ? 'drop-shadow(0 0 8px var(--color-accent))' : 'none'
//             }}
//           ></i>
//         </button>
//       );
//     }
//     return stars;
//   };

//   const getRatingLabel = (rating) => {
//     switch(rating) {
//       case 1: return { text: 'Poor', emoji: '😞', color: '#EF4444' };
//       case 2: return { text: 'Fair', emoji: '😐', color: '#F59E0B' };
//       case 3: return { text: 'Good', emoji: '🙂', color: '#10B981' };
//       case 4: return { text: 'Very Good', emoji: '😊', color: '#3B82F6' };
//       case 5: return { text: 'Excellent', emoji: '🤩', color: '#8B5CF6' };
//       default: return { text: '', emoji: '', color: '' };
//     }
//   };

//   const ratingInfo = getRatingLabel(formData.rating);

//   return (
//     <div className="min-h-screen bg-bg-primary transition-colors duration-300"
//          style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
//       {/* Navigation - Pure white text in both modes */}
//       <nav className="w-full h-16 fixed top-0 left-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b transition-colors duration-300"
//            style={{ borderColor: 'var(--color-border)' }}>
//         <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          
//           {/* Logo */}
//           <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
//             <i className="fas fa-robot text-3xl" style={{ color: 'var(--color-primary)' }}></i>
//             <span className="text-xl font-bold text-white">
//               AI Mentor
//             </span>
//           </div>

//           {/* Navigation Menu */}
//           <ul className="hidden lg:flex items-center gap-8">
//             <li>
//               <a href="/" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
//                 Home
//               </a>
//             </li>
//             <li>
//               <a href="/contact" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
//                 Contact
//               </a>
//             </li>
//             <li>
//               <a href="/feedback" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary">
//                 Feedback
//               </a>
//             </li>
//             <li>
//               <a href="/login" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
//                 Login
//               </a>
//             </li>
//             <li>
//               <a href="/signup" className="text-sm font-semibold py-2 px-4 rounded-full bg-primary text-white hover:bg-secondary transition-all duration-300">
//                 Sign Up
//               </a>
//             </li>
//           </ul>
//         </div>
//       </nav>

//       {/* Feedback Section */}
//       <section className="pt-32 pb-20 px-6 lg:px-8 min-h-screen flex items-center">
//         <div className="max-w-7xl mx-auto w-full">
          
//           {/* Header */}
//           <div className="text-center mb-16 animate-on-scroll">
//             <h1 className="text-5xl md:text-6xl font-black mb-4"
//                 style={{ color: 'var(--color-text-primary)' }}>
//               Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Feedback</span>
//             </h1>
//             <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
//               Help us shape the future of AI-powered interview preparation
//             </p>
//             <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-4"></div>
//           </div>
          
//           {/* Feedback Grid */}
//           <div className="grid lg:grid-cols-2 gap-8 items-start">
            
//             {/* Left Side - Info Cards */}
//             <div className="space-y-6 animate-on-scroll">
//               {/* Main Info Card */}
//               <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
//                    style={{ 
//                      backgroundColor: 'var(--color-bg-secondary)',
//                      border: `1px solid ${'var(--color-primary)'}20`,
//                      boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
//                    }}>
                
//                 <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                   Why Share Feedback?
//                 </h3>
                
//                 <p className="mb-6 text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
//                   Your feedback helps us make AI Mentor better for everyone. Every suggestion, 
//                   complaint, or praise is read by our team and helps shape our roadmap.
//                 </p>
                
//                 {/* Quick Response Card */}
//                 <div className="flex items-start gap-4 p-4 rounded-xl mb-4 group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
//                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
//                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
//                   <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all duration-300"
//                        style={{ color: '#10b981' }}>
//                     <i className="fas fa-check-circle text-xl"></i>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Quick Response</h4>
//                     <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>We read every feedback within 24 hours</p>
//                   </div>
//                 </div>
                
//                 {/* Continuous Improvement Card */}
//                 <div className="flex items-start gap-4 p-4 rounded-xl mb-4 group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
//                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
//                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
//                   <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300"
//                        style={{ color: '#F59E0B' }}>
//                     <i className="fas fa-star text-xl"></i>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Continuous Improvement</h4>
//                     <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Your ideas shape our features</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats Card */}
//               <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
//                    style={{ 
//                      backgroundColor: 'var(--color-bg-secondary)',
//                      border: `1px solid ${'var(--color-primary)'}20`,
//                      boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
//                    }}>
                
//                 <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                   Community Trust
//                 </h3>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="text-center p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all duration-300">
//                     <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
//                          style={{ color: 'var(--color-primary)' }}>
//                       <i className="fas fa-smile text-3xl"></i>
//                     </div>
//                     <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>95%</div>
//                     <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Satisfaction Rate</div>
//                   </div>
                  
//                   <div className="text-center p-4 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-all duration-300">
//                     <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3"
//                          style={{ color: 'var(--color-secondary)' }}>
//                       <i className="fas fa-users text-3xl"></i>
//                     </div>
//                     <div className="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>10k+</div>
//                     <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Reviews</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Right Side - Feedback Form */}
//             <div className="animate-on-scroll">
//               <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
//                    style={{ 
//                      backgroundColor: 'var(--color-bg-secondary)',
//                      border: `1px solid ${'var(--color-primary)'}20`,
//                      boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
//                    }}>
                
//                 <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                   Share Your Thoughts
//                 </h3>
                
//                 {/* Success Message */}
//                 {isSubmitted && (
//                   <div className="mb-6 p-4 rounded-xl animate-pulse flex items-center gap-3"
//                        style={{ 
//                          backgroundColor: `${'var(--color-success)'}10`,
//                          border: `1px solid ${'var(--color-success)'}20`,
//                          color: 'var(--color-success)'
//                        }}>
//                     <i className="fas fa-check-circle text-2xl"></i>
//                     <p className="font-medium">Thank you for your valuable feedback! 🙏</p>
//                   </div>
//                 )}

//                 {/* Server Error Message */}
//                 {serverError && (
//                   <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
//                        style={{ 
//                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
//                          border: '1px solid rgba(239, 68, 68, 0.2)',
//                          color: '#ef4444'
//                        }}>
//                     <i className="fas fa-exclamation-circle text-2xl"></i>
//                     <p className="font-medium">{serverError}</p>
//                   </div>
//                 )}
                
//                 <form onSubmit={handleSubmit} className="space-y-5">
//                   {/* Name Field - Optional */}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                       Your Name <span className="text-xs opacity-60">(optional)</span>
//                     </label>
//                     <input 
//                       type="text" 
//                       name="name"
//                       placeholder="John Doe" 
//                       value={formData.name}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
//                       style={{ 
//                         borderColor: `${'var(--color-primary)'}20`,
//                         backgroundColor: 'var(--color-bg-secondary)',
//                         color: 'var(--color-text-primary)'
//                       }}
//                       onFocus={(e) => {
//                         e.currentTarget.style.borderColor = 'var(--color-primary)';
//                         e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
//                       }}
//                       onBlur={(e) => {
//                         e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
//                         e.currentTarget.style.boxShadow = 'none';
//                       }}
//                     />
//                   </div>
                  
//                   {/* Email Field - Optional with validation */}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                       Your Email <span className="text-xs opacity-60">(optional)</span>
//                     </label>
//                     <input 
//                       type="email" 
//                       name="email"
//                       placeholder="john@example.com" 
//                       value={formData.email}
//                       onChange={handleChange}
//                       className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
//                         errors.email ? 'border-red-500' : ''
//                       }`}
//                       style={{ 
//                         borderColor: errors.email ? '#EF4444' : `${'var(--color-primary)'}20`,
//                         backgroundColor: 'var(--color-bg-secondary)',
//                         color: 'var(--color-text-primary)'
//                       }}
//                       onFocus={(e) => {
//                         if (!errors.email) {
//                           e.currentTarget.style.borderColor = 'var(--color-primary)';
//                           e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
//                         }
//                       }}
//                       onBlur={(e) => {
//                         if (!errors.email) {
//                           e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
//                           e.currentTarget.style.boxShadow = 'none';
//                         }
//                       }}
//                     />
//                     {errors.email && (
//                       <p className="text-sm text-red-500 mt-1">{errors.email}</p>
//                     )}
//                   </div>
                  
//                   {/* Rating Stars */}
//                   <div className="space-y-3">
//                     <label className="text-sm font-medium block" style={{ color: 'var(--color-text-primary)' }}>
//                       Rate your experience
//                     </label>
//                     <div className="flex items-center gap-2">
//                       <div className="flex gap-2">
//                         {renderStars()}
//                       </div>
//                       {formData.rating > 0 && (
//                         <div 
//                           className="ml-3 px-4 py-2 rounded-full text-sm font-medium animate-pulse"
//                           style={{ 
//                             backgroundColor: `${ratingInfo.color}20`,
//                             color: ratingInfo.color,
//                             border: `1px solid ${ratingInfo.color}40`
//                           }}
//                         >
//                           <span className="mr-1">{ratingInfo.emoji}</span>
//                           {ratingInfo.text}
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   {/* Feedback Textarea with Character Count */}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                       Your Feedback <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <textarea 
//                         name="feedback"
//                         placeholder="Tell us what you think... (minimum 10 characters)" 
//                         value={formData.feedback}
//                         onChange={handleChange}
//                         required
//                         rows="5"
//                         className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all resize-none ${
//                           errors.feedback ? 'border-red-500' : ''
//                         }`}
//                         style={{ 
//                           borderColor: errors.feedback ? '#EF4444' : `${'var(--color-primary)'}20`,
//                           backgroundColor: 'var(--color-bg-secondary)',
//                           color: 'var(--color-text-primary)'
//                         }}
//                         onFocus={(e) => {
//                           if (!errors.feedback) {
//                             e.currentTarget.style.borderColor = 'var(--color-primary)';
//                             e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
//                           }
//                         }}
//                         onBlur={(e) => {
//                           if (!errors.feedback) {
//                             e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
//                             e.currentTarget.style.boxShadow = 'none';
//                           }
//                         }}
//                       />
//                       <div className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full"
//                            style={{ 
//                              backgroundColor: charCount >= 10 ? `${'var(--color-success)'}20` : `${'var(--color-error)'}20`,
//                              color: charCount >= 10 ? 'var(--color-success)' : 'var(--color-error)'
//                            }}>
//                         {charCount}/10 min
//                       </div>
//                     </div>
//                     {errors.feedback && (
//                       <p className="text-sm text-red-500 mt-1">{errors.feedback}</p>
//                     )}
//                   </div>
                  
//                   {/* Submit Button */}
//                   <button 
//                     type="submit" 
//                     disabled={loading}
//                     className="w-full px-6 py-4 rounded-full text-white font-semibold text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6"
//                     style={{ 
//                       background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
//                       boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
//                     }}
//                   >
//                     {loading ? (
//                       <>
//                         <i className="fas fa-spinner fa-spin"></i>
//                         Submitting...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fas fa-paper-plane"></i>
//                         Submit Feedback
//                       </>
//                     )}
//                   </button>
//                 </form>

//                 {/* Anonymous Note */}
//                 <p className="text-xs text-center mt-4 opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
//                   <i className="fas fa-lock mr-1"></i>
//                   Your feedback is anonymous if you don't provide contact details
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Add animation styles */}
//       <style>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         .animate-fadeInUp {
//           animation: fadeInUp 0.8s ease forwards;
//         }
        
//         .animate-on-scroll {
//           opacity: 0;
//         }
        
//         @keyframes pulse {
//           0%, 100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.7;
//           }
//         }
        
//         .animate-pulse {
//           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Feedback;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "./ThemeContext";

const Feedback = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    feedback: ''
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [serverError, setServerError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // for responsive navigation

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'feedback') {
      setCharCount(e.target.value.length);
    }
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
    if (serverError) setServerError('');
  };

  const handleRatingClick = (rating) => {
    setFormData({
      ...formData,
      rating: rating
    });
  };

  const handleRatingHover = (rating) => {
    setHoverRating(rating);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    } else if (formData.feedback.length < 10) {
      newErrors.feedback = 'Feedback must be at least 10 characters';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          rating: 0,
          feedback: ''
        });
        setHoverRating(0);
        setCharCount(0);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      } else {
        // Display server-side error (e.g., validation failure)
        setServerError(data.error || 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= (hoverRating || formData.rating);
      stars.push(
        <button
          key={i}
          type="button"
          className="focus:outline-none transform transition-transform hover:scale-110"
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => handleRatingHover(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <i
            className={`${
              isActive ? 'fas fa-star' : 'far fa-star'
            } text-2xl sm:text-3xl transition-all duration-200`}
            style={{ 
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              filter: isActive ? 'drop-shadow(0 0 8px var(--color-accent))' : 'none'
            }}
          ></i>
        </button>
      );
    }
    return stars;
  };

  const getRatingLabel = (rating) => {
    switch(rating) {
      case 1: return { text: 'Poor', emoji: '😞', color: '#EF4444' };
      case 2: return { text: 'Fair', emoji: '😐', color: '#F59E0B' };
      case 3: return { text: 'Good', emoji: '🙂', color: '#10B981' };
      case 4: return { text: 'Very Good', emoji: '😊', color: '#3B82F6' };
      case 5: return { text: 'Excellent', emoji: '🤩', color: '#8B5CF6' };
      default: return { text: '', emoji: '', color: '' };
    }
  };

  const ratingInfo = getRatingLabel(formData.rating);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu on link click
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 overflow-x-hidden"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Navigation - Responsive with mobile menu */}
      <nav className="w-full h-16 fixed top-0 left-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b transition-colors duration-300"
           style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <i className="fas fa-robot text-2xl sm:text-3xl" style={{ color: 'var(--color-primary)' }}></i>
            <span className="text-lg sm:text-xl font-bold text-white">
              AI Mentor
            </span>
          </div>

          {/* Desktop Navigation Menu */}
          <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
            <li>
              <a href="/" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
                Home
              </a>
            </li>
            <li>
              <a href="/contact" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
                Contact
              </a>
            </li>
            <li>
              <a href="/feedback" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary">
                Feedback
              </a>
            </li>
            <li>
              <a href="/login" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
                Login
              </a>
            </li>
            <li>
              <a href="/signup" className="text-sm font-semibold py-2 px-4 rounded-full bg-primary text-white hover:bg-secondary transition-all duration-300">
                Sign Up
              </a>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden text-white text-2xl focus:outline-none z-50"
            aria-label="Toggle menu"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={closeMobileMenu}
              ></div>
              {/* Menu Panel */}
              <div className="fixed top-16 right-0 w-64 bg-white dark:bg-gray-900 shadow-2xl rounded-bl-2xl z-50 lg:hidden animate-fadeInUp">
                <ul className="flex flex-col p-4 gap-3">
                  <li>
                    <a href="/" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition-all duration-300">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/contact" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition-all duration-300">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="/feedback" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition-all duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-4 after:w-8 after:h-0.5 after:bg-primary">
                      Feedback
                    </a>
                  </li>
                  <li>
                    <a href="/login" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white hover:text-primary transition-all duration-300">
                      Login
                    </a>
                  </li>
                  <li>
                    <a href="/signup" onClick={closeMobileMenu} className="block py-2 px-4 text-sm font-semibold rounded-full bg-primary text-white hover:bg-secondary transition-all duration-300 text-center">
                      Sign Up
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Feedback Section - Responsive padding and spacing */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Header - Responsive typography */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-on-scroll">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4"
                style={{ color: 'var(--color-text-primary)' }}>
              Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Feedback</span>
            </h1>
            <p className="text-base sm:text-lg px-2" style={{ color: 'var(--color-text-secondary)' }}>
              Help us shape the future of AI-powered interview preparation
            </p>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-3 sm:mt-4"></div>
          </div>
          
          {/* Feedback Grid - Fully responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            
            {/* Left Side - Info Cards (Responsive) */}
            <div className="space-y-5 sm:space-y-6 animate-on-scroll">
              {/* Main Info Card */}
              <div className="backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
                   style={{ 
                     backgroundColor: 'var(--color-bg-secondary)',
                     border: `1px solid ${'var(--color-primary)'}20`,
                     boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
                   }}>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Why Share Feedback?
                </h3>
                
                <p className="mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Your feedback helps us make AI Mentor better for everyone. Every suggestion, 
                  complaint, or praise is read by our team and helps shape our roadmap.
                </p>
                
                {/* Quick Response Card */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all duration-300 flex-shrink-0"
                       style={{ color: '#10b981' }}>
                    <i className="fas fa-check-circle text-lg sm:text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg" style={{ color: 'var(--color-text-primary)' }}>Quick Response</h4>
                    <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>We read every feedback within 24 hours</p>
                  </div>
                </div>
                
                {/* Continuous Improvement Card */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300 flex-shrink-0"
                       style={{ color: '#F59E0B' }}>
                    <i className="fas fa-star text-lg sm:text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg" style={{ color: 'var(--color-text-primary)' }}>Continuous Improvement</h4>
                    <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Your ideas shape our features</p>
                  </div>
                </div>
              </div>

              {/* Stats Card - Responsive */}
              <div className="backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
                   style={{ 
                     backgroundColor: 'var(--color-bg-secondary)',
                     border: `1px solid ${'var(--color-primary)'}20`,
                     boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
                   }}>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Community Trust
                </h3>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all duration-300">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3"
                         style={{ color: 'var(--color-primary)' }}>
                      <i className="fas fa-smile text-2xl sm:text-3xl"></i>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>95%</div>
                    <div className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Satisfaction Rate</div>
                  </div>
                  
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-all duration-300">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3"
                         style={{ color: 'var(--color-secondary)' }}>
                      <i className="fas fa-users text-2xl sm:text-3xl"></i>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>10k+</div>
                    <div className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Reviews</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Feedback Form (Responsive) */}
            <div className="animate-on-scroll">
              <div className="backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
                   style={{ 
                     backgroundColor: 'var(--color-bg-secondary)',
                     border: `1px solid ${'var(--color-primary)'}20`,
                     boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
                   }}>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Share Your Thoughts
                </h3>
                
                {/* Success Message */}
                {isSubmitted && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl animate-pulse flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                       style={{ 
                         backgroundColor: `${'var(--color-success)'}10`,
                         border: `1px solid ${'var(--color-success)'}20`,
                         color: 'var(--color-success)'
                       }}>
                    <i className="fas fa-check-circle text-xl sm:text-2xl"></i>
                    <p className="font-medium">Thank you for your valuable feedback! 🙏</p>
                  </div>
                )}

                {/* Server Error Message */}
                {serverError && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                       style={{ 
                         backgroundColor: 'rgba(239, 68, 68, 0.1)',
                         border: '1px solid rgba(239, 68, 68, 0.2)',
                         color: '#ef4444'
                       }}>
                    <i className="fas fa-exclamation-circle text-xl sm:text-2xl"></i>
                    <p className="font-medium">{serverError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Name Field */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Your Name <span className="text-xs opacity-60">(optional)</span>
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base"
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
                  
                  {/* Email Field */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Your Email <span className="text-xs opacity-60">(optional)</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 outline-none transition-all text-sm sm:text-base ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      style={{ 
                        borderColor: errors.email ? '#EF4444' : `${'var(--color-primary)'}20`,
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)'
                      }}
                      onFocus={(e) => {
                        if (!errors.email) {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.email) {
                          e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    />
                    {errors.email && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Rating Stars - Responsive wrapping */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-xs sm:text-sm font-medium block" style={{ color: 'var(--color-text-primary)' }}>
                      Rate your experience
                    </label>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex gap-1 sm:gap-2">
                        {renderStars()}
                      </div>
                      {formData.rating > 0 && (
                        <div 
                          className="ml-0 sm:ml-3 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium animate-pulse"
                          style={{ 
                            backgroundColor: `${ratingInfo.color}20`,
                            color: ratingInfo.color,
                            border: `1px solid ${ratingInfo.color}40`
                          }}
                        >
                          <span className="mr-1">{ratingInfo.emoji}</span>
                          {ratingInfo.text}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Feedback Textarea with Character Count */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Your Feedback <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea 
                        name="feedback"
                        placeholder="Tell us what you think... (minimum 10 characters)" 
                        value={formData.feedback}
                        onChange={handleChange}
                        required
                        rows="5"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 outline-none transition-all resize-none text-sm sm:text-base ${
                          errors.feedback ? 'border-red-500' : ''
                        }`}
                        style={{ 
                          borderColor: errors.feedback ? '#EF4444' : `${'var(--color-primary)'}20`,
                          backgroundColor: 'var(--color-bg-secondary)',
                          color: 'var(--color-text-primary)'
                        }}
                        onFocus={(e) => {
                          if (!errors.feedback) {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.boxShadow = `0 0 0 4px ${'var(--color-primary)'}20`;
                          }
                        }}
                        onBlur={(e) => {
                          if (!errors.feedback) {
                            e.currentTarget.style.borderColor = `${'var(--color-primary)'}20`;
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      />
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                           style={{ 
                             backgroundColor: charCount >= 10 ? `${'var(--color-success)'}20` : `${'var(--color-error)'}20`,
                             color: charCount >= 10 ? 'var(--color-success)' : 'var(--color-error)'
                           }}>
                        {charCount}/10 min
                      </div>
                    </div>
                    {errors.feedback && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.feedback}</p>
                    )}
                  </div>
                  
                  {/* Submit Button - Responsive */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6"
                    style={{ 
                      background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                      boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>

                {/* Anonymous Note - Responsive */}
                <p className="text-[10px] sm:text-xs text-center mt-3 sm:mt-4 opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
                  <i className="fas fa-lock mr-1"></i>
                  Your feedback is anonymous if you don't provide contact details
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add animation styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease forwards;
        }
        
        .animate-on-scroll {
          opacity: 0;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Feedback;