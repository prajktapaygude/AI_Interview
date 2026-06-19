


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTheme } from "./ThemeContext";

// const Contact = () => {
//   const navigate = useNavigate();
//   const { isDarkMode } = useTheme();

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     subject: '',
//     message: ''
//   });

//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     // Clear error when user starts typing
//     if (errorMsg) setErrorMsg('');
//   };

//   // Client-side validation
//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       setErrorMsg('Name is required');
//       return false;
//     }
//     if (!formData.email.trim()) {
//       setErrorMsg('Email is required');
//       return false;
//     }
//     const emailRegex = /^\S+@\S+\.\S+$/;
//     if (!emailRegex.test(formData.email)) {
//       setErrorMsg('Please enter a valid email address');
//       return false;
//     }
//     if (!formData.subject.trim()) {
//       setErrorMsg('Subject is required');
//       return false;
//     }
//     if (!formData.message.trim()) {
//       setErrorMsg('Message is required');
//       return false;
//     }
//     if (formData.message.trim().length < 10) {
//       setErrorMsg('Message must be at least 10 characters long');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Run client-side validation first
//     if (!validateForm()) return;

//     setLoading(true);
//     setErrorMsg('');

//     try {
//       const response = await fetch('http://localhost:5000/api/contact', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setIsSubmitted(true);
//         setFormData({
//           name: '',
//           email: '',
//           subject: '',
//           message: ''
//         });
        
//         // Auto-hide success message after 3 seconds
//         setTimeout(() => {
//           setIsSubmitted(false);
//         }, 3000);
//       } else {
//         // Display server error message (e.g., validation errors from backend)
//         setErrorMsg(data.error || 'Submission failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       setErrorMsg('Network error. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Animation on scroll (unchanged)
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
//               <a href="/contact" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary">
//                 Contact
//               </a>
//             </li>
//             <li>
//               <a href="/feedback" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
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

//       {/* Contact Section */}
//       <section className="pt-32 pb-20 px-6 lg:px-8 min-h-screen flex items-center">
//         <div className="max-w-7xl mx-auto w-full">
          
//           {/* Header */}
//           <div className="text-center mb-16 animate-on-scroll">
//             <h1 className="text-5xl md:text-6xl font-black mb-4"
//                 style={{ color: 'var(--color-text-primary)' }}>
//               Contact <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Us</span>
//             </h1>
//             <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
//               We're here to help and answer any questions you might have
//             </p>
//             <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-4"></div>
//           </div>
          
//           {/* Contact Grid */}
//           <div className="grid lg:grid-cols-2 gap-8 items-start">
            
//             {/* Contact Info Cards */}
//             <div className="space-y-6 animate-on-scroll">
//               <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
//                    style={{ 
//                      backgroundColor: 'var(--color-bg-secondary)',
//                      border: `1px solid ${'var(--color-primary)'}20`,
//                      boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
//                    }}>
                
//                 <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                   Get in Touch
//                 </h3>
                
//                 {/* Email Card */}
//                 <div className="flex items-start gap-4 p-4 rounded-xl mb-4 group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
//                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
//                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
//                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300"
//                        style={{ color: 'var(--color-primary)' }}>
//                     <i className="fas fa-envelope text-xl"></i>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Email</h4>
//                     <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>support@aimentor.com</p>
//                     <p className="text-sm text-primary">We reply within 24 hours</p>
//                   </div>
//                 </div>
                
//                 {/* Phone Card */}
//                 <div className="flex items-start gap-4 p-4 rounded-xl mb-4 group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
//                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
//                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
//                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300"
//                        style={{ color: 'var(--color-primary)' }}>
//                     <i className="fas fa-phone text-xl"></i>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Phone</h4>
//                     <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>+1 (555) 123-4567</p>
//                     <p className="text-sm text-primary">Mon-Fri 9am to 6pm</p>
//                   </div>
//                 </div>
                
//                 {/* Response Time Card */}
//                 <div className="flex items-start gap-4 p-4 rounded-xl group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
//                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
//                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
//                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300"
//                        style={{ color: 'var(--color-primary)' }}>
//                     <i className="fas fa-clock text-xl"></i>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Response Time</h4>
//                     <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>Within 24 hours</p>
//                     <p className="text-sm text-primary">Emergency? Call us</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Social Links Card */}
//               <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
//                    style={{ 
//                      backgroundColor: 'var(--color-bg-secondary)',
//                      border: `1px solid ${'var(--color-primary)'}20`,
//                      boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
//                    }}>
//                 <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                   Connect With Us
//                 </h3>
//                 <div className="flex gap-4">
//                   {/* Facebook */}
//                   <a 
//                     href="https://facebook.com" 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
//                     style={{ color: 'var(--color-primary)' }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)';
//                       e.currentTarget.style.color = 'white';
//                       e.currentTarget.style.transform = 'scale(1.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
//                       e.currentTarget.style.color = 'var(--color-primary)';
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }}>
//                     <i className="fab fa-facebook-f text-xl group-hover:text-white"></i>
//                   </a>

//                   {/* Twitter */}
//                   <a 
//                     href="https://twitter.com" 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
//                     style={{ color: 'var(--color-primary)' }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)';
//                       e.currentTarget.style.color = 'white';
//                       e.currentTarget.style.transform = 'scale(1.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
//                       e.currentTarget.style.color = 'var(--color-primary)';
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }}>
//                     <i className="fab fa-twitter text-xl group-hover:text-white"></i>
//                   </a>

//                   {/* LinkedIn */}
//                   <a 
//                     href="https://linkedin.com" 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
//                     style={{ color: 'var(--color-primary)' }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)';
//                       e.currentTarget.style.color = 'white';
//                       e.currentTarget.style.transform = 'scale(1.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
//                       e.currentTarget.style.color = 'var(--color-primary)';
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }}>
//                     <i className="fab fa-linkedin-in text-xl group-hover:text-white"></i>
//                   </a>

//                   {/* Instagram */}
//                   <a 
//                     href="https://instagram.com" 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
//                     style={{ color: 'var(--color-primary)' }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)';
//                       e.currentTarget.style.color = 'white';
//                       e.currentTarget.style.transform = 'scale(1.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
//                       e.currentTarget.style.color = 'var(--color-primary)';
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }}>
//                     <i className="fab fa-instagram text-xl group-hover:text-white"></i>
//                   </a>

//                   {/* YouTube */}
//                   <a 
//                     href="https://youtube.com" 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
//                     style={{ color: 'var(--color-primary)' }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)';
//                       e.currentTarget.style.color = 'white';
//                       e.currentTarget.style.transform = 'scale(1.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
//                       e.currentTarget.style.color = 'var(--color-primary)';
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }}>
//                     <i className="fab fa-youtube text-xl group-hover:text-white"></i>
//                   </a>
//                 </div>
//               </div>
//             </div>
            
//             {/* Contact Form */}
//             <div className="animate-on-scroll">
//               <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
//                    style={{ 
//                      backgroundColor: 'var(--color-bg-secondary)',
//                      border: `1px solid ${'var(--color-primary)'}20`,
//                      boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
//                    }}>
                
//                 <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                   Send Message
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
//                     <p className="font-medium">Message sent successfully! We'll get back to you soon.</p>
//                   </div>
//                 )}

//                 {/* Error Message */}
//                 {errorMsg && (
//                   <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
//                        style={{ 
//                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
//                          border: '1px solid rgba(239, 68, 68, 0.2)',
//                          color: '#ef4444'
//                        }}>
//                     <i className="fas fa-exclamation-circle text-2xl"></i>
//                     <p className="font-medium">{errorMsg}</p>
//                   </div>
//                 )}
                
//                 <form onSubmit={handleSubmit} className="space-y-5">
//                   {/* Name Field */}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                       Your Name
//                     </label>
//                     <input 
//                       type="text" 
//                       name="name"
//                       placeholder="John Doe" 
//                       value={formData.name}
//                       onChange={handleChange}
//                       required 
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
                  
//                   {/* Email Field */}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                       Your Email
//                     </label>
//                     <input 
//                       type="email" 
//                       name="email"
//                       placeholder="john@example.com" 
//                       value={formData.email}
//                       onChange={handleChange}
//                       required 
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
                  
//                   {/* Subject Field */}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                       Subject
//                     </label>
//                     <input 
//                       type="text" 
//                       name="subject"
//                       placeholder="What's this about?" 
//                       value={formData.subject}
//                       onChange={handleChange}
//                       required 
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
                  
//                   {/* Message Field */}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
//                       Your Message
//                     </label>
//                     <textarea 
//                       name="message"
//                       placeholder="Tell us how we can help... (min. 10 characters)" 
//                       value={formData.message}
//                       onChange={handleChange}
//                       required
//                       minLength="10"
//                       rows="5"
//                       className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all resize-none"
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
                  
//                   {/* Submit Button */}
//                   <button 
//                     type="submit" 
//                     disabled={loading}
//                     className="w-full px-6 py-4 rounded-full text-white font-semibold text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
//                     style={{ 
//                       background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
//                       boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
//                     }}
//                   >
//                     {loading ? (
//                       <>
//                         <i className="fas fa-spinner fa-spin"></i>
//                         Sending...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fas fa-paper-plane"></i>
//                         Send Message
//                       </>
//                     )}
//                   </button>
//                 </form>
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
//       `}</style>
//     </div>
//   );
// };

// export default Contact;/




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "./ThemeContext";
import BASE_URL from './config';

const Contact = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMsg('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Email is required');
      return false;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg('Please enter a valid email address');
      return false;
    }
    if (!formData.subject.trim()) {
      setErrorMsg('Subject is required');
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMsg('Message is required');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setErrorMsg('Message must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg('');

    try {
const response = await fetch(`${BASE_URL}/api/contact`, {
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      } else {
        setErrorMsg(data.error || 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

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

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Navigation - Fully responsive with mobile menu */}
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
              <a href="/contact" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary">
                Contact
              </a>
            </li>
            <li>
              <a href="/feedback" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
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
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div 
          className={`lg:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b transition-all duration-300 overflow-hidden z-50 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ul className="flex flex-col py-4 px-6 space-y-3">
            <li>
              <a href="/" className="block py-2 text-base font-semibold text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="/contact" className="block py-2 text-base font-semibold text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </a>
            </li>
            <li>
              <a href="/feedback" className="block py-2 text-base font-semibold text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Feedback
              </a>
            </li>
            <li>
              <a href="/login" className="block py-2 text-base font-semibold text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </a>
            </li>
            <li>
              <a href="/signup" className="inline-block py-2 px-4 rounded-full bg-primary text-white font-semibold hover:bg-secondary transition-colors text-center" onClick={() => setIsMobileMenuOpen(false)}>
                Sign Up
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Contact Section - Responsive padding and layout */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Header - Responsive text sizes */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-on-scroll">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4"
                style={{ color: 'var(--color-text-primary)' }}>
              Contact <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-base sm:text-lg px-4" style={{ color: 'var(--color-text-secondary)' }}>
              We're here to help and answer any questions you might have
            </p>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-3 sm:mt-4"></div>
          </div>
          
          {/* Contact Grid - Stacks on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            
            {/* Contact Info Cards */}
            <div className="space-y-5 sm:space-y-6 animate-on-scroll">
              <div className="backdrop-blur-xl rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
                   style={{ 
                     backgroundColor: 'var(--color-bg-secondary)',
                     border: `1px solid ${'var(--color-primary)'}20`,
                     boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
                   }}>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Get in Touch
                </h3>
                
                {/* Email Card - Responsive padding and gap */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0"
                       style={{ color: 'var(--color-primary)' }}>
                    <i className="fas fa-envelope text-base sm:text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg" style={{ color: 'var(--color-text-primary)' }}>Email</h4>
                    <p className="text-sm sm:text-base break-all" style={{ color: 'var(--color-text-secondary)' }}>support@aimentor.com</p>
                    <p className="text-xs sm:text-sm text-primary">We reply within 24 hours</p>
                  </div>
                </div>
                
                {/* Phone Card */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0"
                       style={{ color: 'var(--color-primary)' }}>
                    <i className="fas fa-phone text-base sm:text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg" style={{ color: 'var(--color-text-primary)' }}>Phone</h4>
                    <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>+1 (555) 123-4567</p>
                    <p className="text-xs sm:text-sm text-primary">Mon-Fri 9am to 6pm</p>
                  </div>
                </div>
                
                {/* Response Time Card */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0"
                       style={{ color: 'var(--color-primary)' }}>
                    <i className="fas fa-clock text-base sm:text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg" style={{ color: 'var(--color-text-primary)' }}>Response Time</h4>
                    <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>Within 24 hours</p>
                    <p className="text-xs sm:text-sm text-primary">Emergency? Call us</p>
                  </div>
                </div>
              </div>

              {/* Social Links Card - Responsive icon sizes */}
              <div className="backdrop-blur-xl rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
                   style={{ 
                     backgroundColor: 'var(--color-bg-secondary)',
                     border: `1px solid ${'var(--color-primary)'}20`,
                     boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
                   }}>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {/* Facebook */}
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                    <i className="fab fa-facebook-f text-lg sm:text-xl group-hover:text-white"></i>
                  </a>

                  {/* Twitter */}
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                    <i className="fab fa-twitter text-lg sm:text-xl group-hover:text-white"></i>
                  </a>

                  {/* LinkedIn */}
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                    <i className="fab fa-linkedin-in text-lg sm:text-xl group-hover:text-white"></i>
                  </a>

                  {/* Instagram */}
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                    <i className="fab fa-instagram text-lg sm:text-xl group-hover:text-white"></i>
                  </a>

                  {/* YouTube */}
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)/10';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                    <i className="fab fa-youtube text-lg sm:text-xl group-hover:text-white"></i>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form - Responsive padding and spacing */}
            <div className="animate-on-scroll">
              <div className="backdrop-blur-xl rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-2xl p-5 sm:p-6 md:p-8 transition-colors duration-300 hover:-translate-y-2 transition-transform duration-500"
                   style={{ 
                     backgroundColor: 'var(--color-bg-secondary)',
                     border: `1px solid ${'var(--color-primary)'}20`,
                     boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
                   }}>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Send Message
                </h3>
                
                {/* Success Message - Responsive */}
                {isSubmitted && (
                  <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl animate-pulse flex items-center gap-2 sm:gap-3"
                       style={{ 
                         backgroundColor: `${'var(--color-success)'}10`,
                         border: `1px solid ${'var(--color-success)'}20`,
                         color: 'var(--color-success)'
                       }}>
                    <i className="fas fa-check-circle text-xl sm:text-2xl flex-shrink-0"></i>
                    <p className="font-medium text-sm sm:text-base">Message sent successfully! We'll get back to you soon.</p>
                  </div>
                )}

                {/* Error Message - Responsive */}
                {errorMsg && (
                  <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3"
                       style={{ 
                         backgroundColor: 'rgba(239, 68, 68, 0.1)',
                         border: '1px solid rgba(239, 68, 68, 0.2)',
                         color: '#ef4444'
                       }}>
                    <i className="fas fa-exclamation-circle text-xl sm:text-2xl flex-shrink-0"></i>
                    <p className="font-medium text-sm sm:text-base">{errorMsg}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Name Field */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Your Name
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={handleChange}
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
                  
                  {/* Email Field */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Your Email
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={handleChange}
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
                  
                  {/* Subject Field */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Subject
                    </label>
                    <input 
                      type="text" 
                      name="subject"
                      placeholder="What's this about?" 
                      value={formData.subject}
                      onChange={handleChange}
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
                  
                  {/* Message Field */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Your Message
                    </label>
                    <textarea 
                      name="message"
                      placeholder="Tell us how we can help... (min. 10 characters)" 
                      value={formData.message}
                      onChange={handleChange}
                      required
                      minLength="10"
                      rows="5"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition-all resize-none text-sm sm:text-base"
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
                  
                  {/* Submit Button - Responsive padding and text */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
                    style={{ 
                      background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                      boxShadow: `0 4px 15px ${'var(--color-primary)'}40`
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animation styles */}
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

        /* Prevent horizontal overflow on mobile */
        @media (max-width: 640px) {
          body {
            overflow-x: hidden;
          }
          .break-all {
            word-break: break-all;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;