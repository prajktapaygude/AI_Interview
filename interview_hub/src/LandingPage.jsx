import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Typewriter } from 'react-simple-typewriter';
import ChatWidget from "./ChatWidget";

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    { name: "Priya Sharma", role: "Software Engineer at Unacademy", text: "AI Mentor helped me crack my dream job at Unacademy! The mock interviews were incredibly realistic and helped me build confidence.", rating: 5, image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Rahul Verma", role: "Frontend Developer at Razorpay", text: "The feedback system is brilliant. It pointed out mistakes I didn't even know I was making. Landed my dream job at Razorpay within weeks!", rating: 5, image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Anjali Patel", role: "Product Manager at CRED", text: "From nervous to confident in just 2 weeks. Best investment in my career! Now working at CRED thanks to AI Mentor.", rating: 5, image: "https://randomuser.me/api/portraits/women/63.jpg" },
    { name: "Vikram Singh", role: "Backend Developer at Ola", text: "The AI interviews simulated real Ola interviews perfectly. Got multiple offers but chose Ola!", rating: 5, image: "https://randomuser.me/api/portraits/men/45.jpg" },
  ];

  const partners = [
    { name: "Google", icon: "fab fa-google" },
    { name: "Microsoft", icon: "fab fa-microsoft" },
    { name: "Amazon", icon: "fab fa-amazon" },
    { name: "Meta", icon: "fab fa-meta" },
    { name: "Apple", icon: "fab fa-apple" },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="landing-page relative overflow-x-hidden min-h-screen transition-colors duration-300"
         style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[800px] h-[800px] rounded-full -top-[400px] -right-[400px] animate-[float_25s_ease-in-out_infinite] blur-3xl"
             style={{ backgroundColor: 'var(--color-primary)', opacity: '0.05' }}></div>
        <div className="absolute w-[600px] h-[600px] rounded-full -bottom-[300px] -left-[300px] animate-[float_20s_ease-in-out_infinite_alternate] blur-3xl"
             style={{ backgroundColor: 'var(--color-secondary)', opacity: '0.05' }}></div>
        <div className="absolute w-[400px] h-[400px] rounded-full top-[20%] left-[10%] animate-[pulse_4s_ease-in-out_infinite] blur-2xl"
             style={{ backgroundColor: 'var(--color-primary)', opacity: '0.05' }}></div>
        <div className="absolute w-[300px] h-[300px] rounded-full bottom-[30%] right-[15%] animate-[pulse_6s_ease-in-out_infinite] blur-2xl"
             style={{ backgroundColor: 'var(--color-accent)', opacity: '0.05' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`w-full h-20 fixed top-0 left-0 z-40 transition-all duration-500 ${
        scrolled ? 'backdrop-blur-xl shadow-2xl border-b' : 'bg-transparent'
      }`}
      style={{ 
        backgroundColor: scrolled ? 'var(--color-bg-secondary)' : 'transparent',
        borderColor: 'var(--color-border)',
        boxShadow: scrolled ? `0 4px 20px ${'var(--color-primary)'}20` : 'none'
      }}>
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <i className="fas fa-robot text-4xl bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent animate-[gentleSpin_8s_linear_infinite] group-hover:scale-110 transition-transform duration-300"></i>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-text-primary to-text-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-500">
              AI Mentor
            </span>
          </div>

          {/* Desktop Navigation Menu */}
          <ul className="hidden lg:flex items-center gap-8">
            {[
              { name: 'Home', path: '/', icon: 'fa-home' },
              { name: 'Features', path: '#features', icon: 'fa-star' },
              { name: 'Success Stories', path: '#testimonials', icon: 'fa-trophy' },
              { name: 'Contact', path: '/contact', icon: 'fa-envelope' },
            ].map((item) => (
              <li key={item.name}>
                {item.path.startsWith('#') ? (
                  <a 
                    href={item.path}
                    className="group flex items-center gap-2 text-base font-semibold relative py-2 transition-all duration-300"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  >
                    <i className={`fas ${item.icon} opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0`}
                       style={{ color: 'var(--color-primary)' }}></i>
                    <span className="relative">
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </a>
                ) : (
                  <Link 
                    to={item.path}
                    className="group flex items-center gap-2 text-base font-semibold relative py-2 transition-all duration-300"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  >
                    <i className={`fas ${item.icon} opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4 group-hover:ml-0`}
                       style={{ color: 'var(--color-primary)' }}></i>
                    <span className="relative">
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Right Section - Theme Toggle, Mobile Menu, Auth Buttons */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                color: 'var(--color-text-primary)'
              }}
            >
              {isDarkMode ? <i className="fas fa-sun text-xl"></i> : <i className="fas fa-moon text-xl"></i>}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                color: 'var(--color-text-primary)'
              }}
            >
              {mobileMenuOpen ? (
                <i className="fas fa-times text-xl"></i>
              ) : (
                <i className="fas fa-bars text-xl"></i>
              )}
            </button>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link 
                to="/login" 
                className="group relative px-6 py-2 rounded-full overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300"></span>
                <span className="relative text-sm font-semibold transition-colors duration-300"
                      style={{ color: 'var(--color-text-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}>
                  Login
                </span>
              </Link>
              
              <Link 
                to="/signup" 
                className="relative px-7 py-2 rounded-full text-white font-semibold text-sm transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 group overflow-hidden"
                style={{ 
                  background: `linear-gradient(to right, var(--color-accent), var(--color-accent))`,
                  boxShadow: `0 4px 15px ${'var(--color-accent)'}40`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, var(--color-primary), var(--color-secondary))';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${'var(--color-secondary)'}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, var(--color-accent), var(--color-accent))';
                  e.currentTarget.style.boxShadow = `0 4px 15px ${'var(--color-accent)'}40`;
                }}
              >
                <span className="relative flex items-center gap-2">
                  Get Started
                  <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform duration-300"></i>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ 
          backgroundColor: 'var(--color-bg-secondary)', 
          borderColor: 'var(--color-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div className="px-6 py-4 space-y-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {[
              { name: 'Home', path: '/', icon: 'fa-home' },
              { name: 'Features', path: '#features', icon: 'fa-star' },
              { name: 'Success Stories', path: '#testimonials', icon: 'fa-trophy' },
              { name: 'Contact', path: '/contact', icon: 'fa-envelope' },
            ].map((item) => (
              <div key={item.name}>
                {item.path.startsWith('#') ? (
                  <a 
                    href={item.path}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:translate-x-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <i className={`fas ${item.icon} w-5`} style={{ color: 'var(--color-primary)' }}></i>
                    <span className="font-medium text-sm">{item.name}</span>
                  </a>
                ) : (
                  <Link 
                    to={item.path}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:translate-x-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <i className={`fas ${item.icon} w-5`} style={{ color: 'var(--color-primary)' }}></i>
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-3 mt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Link 
                to="/login" 
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg mb-2 transition-all duration-200"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span className="font-medium text-sm">Login</span>
              </Link>
              <Link 
                to="/signup" 
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white font-medium text-sm transition-all duration-200 hover:scale-105"
                style={{ background: `linear-gradient(to right, var(--color-accent), var(--color-accent))` }}
              >
                <span>Get Started</span>
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border mb-8 group hover:text-white transition-all duration-500 cursor-pointer"
                   style={{ 
                     borderColor: 'var(--color-accent)',
                     backgroundColor: 'var(--color-bg-secondary)'
                   }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: 'var(--color-accent)' }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2"
                        style={{ backgroundColor: 'var(--color-accent)' }}></span>
                </span>
                <span className="text-sm font-semibold group-hover:text-white transition-colors"
                      style={{ color: 'var(--color-accent)' }}>
                  🚀 AI-Powered Interview Practice
                </span>
                <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"
                   style={{ color: 'var(--color-accent)' }}></i>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                <span className="bg-gradient-to-r from-text-primary to-text-primary/80 bg-clip-text text-transparent">
                  Practice Like Never
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  <Typewriter
                    words={["Before Your Interview", "With AI Technology", "For Dream Jobs"]}
                    loop={true}
                    cursor
                    cursorStyle="✨"
                    typeSpeed={100}
                    deleteSpeed={50}
                    delaySpeed={2000}
                  />
                </span>
              </h1>

              <div className="relative mb-8">
                <p className="text-lg leading-relaxed max-w-lg"
                   style={{ color: 'var(--color-text-secondary)' }}>
                  Practice with our advanced AI, get real-time feedback, and land your dream job at top tech companies.
                </p>
                <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
              </div>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link 
                  to="/signup" 
                  className="group relative px-8 py-4 rounded-full text-white font-semibold text-lg overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  style={{ 
                    background: `linear-gradient(to right, var(--color-accent), var(--color-accent))`,
                    boxShadow: `0 8px 25px ${'var(--color-accent)'}60`
                  }}
                >
                  <span className="relative flex items-center gap-3">
                    Start Free Trial
                    <i className="fas fa-rocket group-hover:rotate-12 group-hover:translate-x-1 transition-all duration-300"></i>
                  </span>
                </Link>
                
                <a 
                  href="#features" 
                  className="group flex items-center gap-3 px-8 py-4 rounded-full border-2 font-semibold text-lg transition-all duration-500"
                  style={{ 
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-secondary)'
                  }}
                >
                  <i className="fas fa-play-circle group-hover:scale-110 transition-transform"
                     style={{ color: 'var(--color-primary)' }}></i>
                  See How It Works
                </a>
              </div>

              <div className="flex flex-wrap gap-8 md:gap-12">
                {[
                  { value: '10K+', label: 'Active Users', icon: 'fa-users' },
                  { value: '95%', label: 'Success Rate', icon: 'fa-chart-line' },
                  { value: '24/7', label: 'AI Support', icon: 'fa-headset' }
                ].map((stat, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <i className={`fas ${stat.icon} text-xl group-hover:scale-110 transition-transform`}
                         style={{ color: 'var(--color-accent)' }}></i>
                      <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-sm font-medium tracking-wide transition-colors"
                         style={{ color: 'var(--color-text-secondary)' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t"
                   style={{ borderColor: 'var(--color-primary)' }}>
                <p className="text-xs uppercase tracking-wider font-semibold mb-3"
                   style={{ color: 'var(--color-text-secondary)' }}>
                  Trusted by students from
                </p>
                <div className="flex flex-wrap gap-5 items-center">
                  {partners.map((partner, i) => (
                    <div key={i} className="group flex items-center gap-2 opacity-70 hover:opacity-100 transition-all duration-300">
                      <i className={`${partner.icon} text-xl transition-colors`}
                         style={{ color: 'var(--color-primary)' }}></i>
                      <span className="text-xs font-medium transition-colors"
                            style={{ color: 'var(--color-text-secondary)' }}>
                        {partner.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Interview Card */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-6 max-w-md mx-auto transition-colors duration-300"
                     style={{ 
                       backgroundColor: 'var(--color-bg-secondary)',
                       border: `1px solid ${'var(--color-primary)'}20`,
                       boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
                     }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.3 }}></div>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.3 }}></div>
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>AI Interview Session</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                         style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Live</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl"
                       style={{ 
                         background: `linear-gradient(to right, ${'var(--color-primary)'}10, ${'var(--color-secondary)'}10)`
                       }}>
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                           style={{ 
                             background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))`
                           }}>
                        <i className="fas fa-robot text-2xl text-white"></i>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>AI Interviewer</h3>
                      <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        Online · Ready to help
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 mb-4 border"
                       style={{ 
                         background: `linear-gradient(to right, ${'var(--color-primary)'}05, ${'var(--color-secondary)'}05)`,
                         borderColor: `${'var(--color-primary)'}20`
                       }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      "Tell us about your experience with JavaScript and React..."
                    </p>
                  </div>

                  <div className="relative mb-4">
                    <textarea 
                      className="w-full p-3 rounded-xl border-2 outline-none transition-all resize-none text-sm"
                      rows="2"
                      placeholder="Type your answer here..."
                      style={{ 
                        borderColor: `${'var(--color-primary)'}20`,
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)'
                      }}
                    ></textarea>
                    <button className="absolute bottom-3 right-3 w-7 h-7 rounded-lg text-white hover:scale-110 transition-transform shadow-lg"
                            style={{ 
                              background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`
                            }}>
                      <i className="fas fa-arrow-right text-xs"></i>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-xl p-2 text-center border"
                         style={{ 
                           backgroundColor: `${'var(--color-primary)'}10`,
                           borderColor: `${'var(--color-primary)'}20`
                         }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>Confidence</div>
                      <div className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>85%</div>
                      <div className="w-full h-1 rounded-full mt-1"
                           style={{ backgroundColor: `${'var(--color-primary)'}20` }}>
                        <div className="h-full w-[85%] rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                      </div>
                    </div>
                    <div className="rounded-xl p-2 text-center border"
                         style={{ 
                           backgroundColor: `${'var(--color-secondary)'}10`,
                           borderColor: `${'var(--color-secondary)'}20`
                         }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--color-secondary)' }}>Clarity</div>
                      <div className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>92%</div>
                      <div className="w-full h-1 rounded-full mt-1"
                           style={{ backgroundColor: `${'var(--color-secondary)'}20` }}>
                        <div className="h-full w-[92%] rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
                      </div>
                    </div>
                    <div className="rounded-xl p-2 text-center border"
                         style={{ 
                           backgroundColor: `${'var(--color-accent)'}10`,
                           borderColor: `${'var(--color-accent)'}20`
                         }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--color-accent)' }}>Relevance</div>
                      <div className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>78%</div>
                      <div className="w-full h-1 rounded-full mt-1"
                           style={{ backgroundColor: `${'var(--color-accent)'}20` }}>
                        <div className="h-full w-[78%] rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl p-3"
                       style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Session Progress</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>65%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden"
                         style={{ backgroundColor: `${'var(--color-primary)'}20` }}>
                      <div className="h-full w-[65%] rounded-full"
                           style={{ 
                             background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`
                           }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs"
                         style={{ color: 'var(--color-text-secondary)' }}>
                      <span>5/8 questions</span>
                      <span>≈ 12 min left</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-3 pt-3 border-t"
                       style={{ borderColor: `${'var(--color-primary)'}20` }}>
                    <div className="flex items-center gap-1">
                      <i className="fas fa-trophy text-xs" style={{ color: 'var(--color-accent)' }}></i>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Success Rate: <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>95%</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="fas fa-users text-xs" style={{ color: 'var(--color-secondary)' }}></i>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Active: <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>10K+</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full blur-2xl -z-10"
                     style={{ 
                       background: `linear-gradient(to bottom right, ${'var(--color-primary)'}20, ${'var(--color-secondary)'}20)`
                     }}></div>
                <div className="absolute -bottom-4 -left-4 w-28 h-28 rounded-full blur-2xl -z-10"
                     style={{ 
                       background: `linear-gradient(to top right, ${'var(--color-accent)'}20, ${'var(--color-primary)'}20)`
                     }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-8 transition-colors duration-300"
               style={{ 
                 background: `linear-gradient(to bottom, var(--color-bg-secondary), var(--color-bg-primary))`
               }} 
               id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
                  style={{ 
                    background: `linear-gradient(to right, ${'var(--color-primary)'}10, ${'var(--color-secondary)'}10)`,
                    color: 'var(--color-secondary)'
                  }}>
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4"
                style={{ color: 'var(--color-text-primary)' }}>
              Everything You Need to
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block mt-2">
                Ace Your Interview
              </span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Our AI-powered platform provides comprehensive tools and real-time feedback to help you succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'fa-microphone-alt',
                title: 'Mock Interviews',
                desc: 'Practice with AI that simulates real interviewers from top tech companies.',
                color: 'primary',
                features: ['40+ Interview types', 'Real-time feedback', 'Company-specific']
              },
              {
                icon: 'fa-chart-network',
                title: 'Performance Analytics',
                desc: 'Track your progress with detailed scores and personalized improvement tips.',
                color: 'secondary',
                features: ['Score breakdown', 'Progress tracking', 'Weakness analysis']
              },
              {
                icon: 'fa-clock',
                title: '24/7 Availability',
                desc: 'Practice anytime, anywhere with our always-available AI interviewers.',
                color: 'primary',
                features: ['No scheduling', 'Instant feedback', 'Unlimited practice']
              },
              {
                icon: 'fa-brain',
                title: 'Smart Recommendations',
                desc: 'Get personalized questions based on your target role and experience level.',
                color: 'secondary',
                features: ['Role-specific', 'Difficulty adaptive', 'Industry trends']
              },
              {
                icon: 'fa-video',
                title: 'Video Analysis',
                desc: 'Record your sessions and get feedback on body language and presentation.',
                color: 'primary',
                features: ['Body language', 'Eye contact', 'Confidence score']
              },
              {
                icon: 'fa-file-alt',
                title: 'Resume Review',
                desc: 'Get AI-powered feedback on your resume and interview preparation.',
                color: 'secondary',
                features: ['ATS optimization', 'Keyword analysis', 'Format checking']
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: `${'var(--color-primary)'}20`,
                  boxShadow: `0 10px 30px ${'var(--color-primary)'}10`
                }}
              >
                <div className="relative mb-5 inline-block">
                  <div className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all"
                       style={{ 
                         backgroundColor: feature.color === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)', 
                         opacity: '0.3' 
                       }}></div>
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-500"
                       style={{ 
                         background: `linear-gradient(to bottom right, ${feature.color === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)'}, ${feature.color === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)'})`,
                         boxShadow: `0 4px 15px ${feature.color === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)'}60`
                       }}>
                    <i className={`fas ${feature.icon}`}></i>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {feature.desc}
                </p>

                <ul className="space-y-1.5">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs"
                        style={{ color: 'var(--color-text-secondary)' }}>
                      <i className={`fas fa-check-circle text-xs`}
                         style={{ color: feature.color === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)' }}></i>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                  <i className={`fas fa-arrow-right text-sm`}
                     style={{ color: feature.color === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)' }}></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 lg:px-8 transition-colors duration-300"
               style={{ 
                 background: `linear-gradient(to bottom, var(--color-bg-secondary), var(--color-bg-primary))`
               }} 
               id="testimonials">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
                  style={{ 
                    background: `linear-gradient(to right, ${'var(--color-primary)'}10, ${'var(--color-secondary)'}10)`,
                    color: 'var(--color-secondary)'
                  }}>
              Success Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4"
                style={{ color: 'var(--color-text-primary)' }}>
              Trusted by 
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> 10,000+</span>
              <br />Job Seekers
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="backdrop-blur-sm rounded-2xl p-6 shadow-2xl border transition-colors duration-300"
                         style={{ 
                           backgroundColor: 'var(--color-bg-secondary)',
                           borderColor: `${'var(--color-primary)'}20`
                         }}>
                      <div className="flex gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <i key={i} className="fas fa-star text-sm" style={{ color: 'var(--color-accent)' }}></i>
                        ))}
                      </div>

                      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        "{testimonial.text}"
                      </p>

                      <div className="flex items-center gap-3">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover border-2"
                          style={{ borderColor: 'var(--color-primary)' }}
                        />
                        <div>
                          <h4 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{testimonial.name}</h4>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setActiveTestimonial(prev => Math.max(0, prev - 1))}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full shadow-xl border transition-all duration-300 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: `${'var(--color-primary)'}20`,
                color: 'var(--color-primary)'
              }}
              disabled={activeTestimonial === 0}
            >
              <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <button 
              onClick={() => setActiveTestimonial(prev => Math.min(testimonials.length - 1, prev + 1))}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full shadow-xl border transition-all duration-300 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: `${'var(--color-primary)'}20`,
                color: 'var(--color-primary)'
              }}
              disabled={activeTestimonial === testimonials.length - 1}
            >
              <i className="fas fa-chevron-right text-sm"></i>
            </button>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? 'w-5' : ''
                  }`}
                  style={{ 
                    backgroundColor: index === activeTestimonial ? 'var(--color-primary)' : `${'var(--color-primary)'}20`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-90"
               style={{ 
                 background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))`
               }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base md:text-lg mb-8 text-white/90">
            Join thousands of successful candidates who landed their dream jobs with AI Mentor
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/signup" 
              className="group relative px-8 py-3 rounded-full bg-white font-bold text-base overflow-hidden shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-500"
              style={{ color: 'var(--color-primary)' }}
            >
              <span className="relative flex items-center gap-2">
                Start Free Trial
                <i className="fas fa-rocket group-hover:rotate-12 group-hover:translate-x-1 transition-all"></i>
              </span>
            </Link>
            
            <Link 
              to="/contact" 
              className="px-8 py-3 rounded-full border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 hover:border-white transition-all duration-500"
            >
              Contact
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/80 text-xs">
            <div className="flex items-center gap-2">
              <i className="fas fa-shield-alt text-sm" style={{ color: 'var(--color-accent)' }}></i>
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-clock text-sm" style={{ color: 'var(--color-accent)' }}></i>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-headset text-sm" style={{ color: 'var(--color-accent)' }}></i>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-black dark:bg-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <i className="fas fa-robot text-2xl text-white dark:text-gray-900"></i>
                <span className="text-xl font-bold text-white dark:text-gray-900">
                  AI Mentor
                </span>
              </div>
              <p className="text-white dark:text-gray-900 text-sm leading-relaxed">
                Empowering job seekers with AI-powered interview practice and real-time feedback.
              </p>
              <div className="flex gap-2">
                {['facebook-f', 'twitter', 'linkedin-in', 'instagram', 'youtube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-8 h-8 rounded-full bg-white/20 dark:bg-gray-300 flex items-center justify-center hover:bg-accent transition-colors duration-300 text-white dark:text-gray-900"
                  >
                    <i className={`fab fa-${social} text-sm`}></i>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-3 text-white dark:text-gray-900">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-white dark:text-gray-900 hover:text-accent transition-colors text-sm">Home</Link></li>
                <li><a href="#features" className="text-white dark:text-gray-900 hover:text-accent transition-colors text-sm">Features</a></li>
                <li><a href="#testimonials" className="text-white dark:text-gray-900 hover:text-accent transition-colors text-sm">Success Stories</a></li>
                <li><Link to="/contact" className="text-white dark:text-gray-900 hover:text-accent transition-colors text-sm">Contact</Link></li>
                <li><Link to="/feedback" className="text-white dark:text-gray-900 hover:text-accent transition-colors text-sm">Feedback</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-bold text-lg mb-3 text-white dark:text-gray-900">
                Stay Updated
              </h4>
              <p className="text-white dark:text-gray-900 text-sm mb-3">
                Get interview tips and success stories in your inbox
              </p>
              <div className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-l-full bg-white/20 dark:bg-gray-200 border-2 border-white/30 dark:border-gray-400 focus:outline-none text-sm text-white dark:text-gray-900 placeholder-white/70 dark:placeholder-gray-600"
                />
                <button
                  className="px-4 py-2 rounded-r-full text-white dark:text-gray-900 font-semibold text-sm transition-all duration-300 bg-accent hover:bg-gradient-to-r hover:from-[var(--color-primary)] hover:to-[var(--color-secondary)]"
                >
                  <i className="fas fa-paper-plane mr-1"></i>
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-white/30 dark:border-gray-400 flex flex-wrap justify-between items-center gap-3">
            <p className="text-white dark:text-gray-900 text-sm">
              © 2026 AI Interview Mentor. All rights reserved.
            </p>
            <div className="flex gap-5">
              <Link to="/" className="text-white dark:text-gray-900 hover:text-accent transition-colors text-sm">Privacy Policy</Link>
              <Link to="/" className="text-white dark:text-gray-900 hover:text-accent transition-colors text-sm">Terms of Service</Link>
              <Link to="/" className="text-white dark:text-gray-900 hover:text-accent transition-colors text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
      
      <ChatWidget />
    </div>
  );
}

export default LandingPage;