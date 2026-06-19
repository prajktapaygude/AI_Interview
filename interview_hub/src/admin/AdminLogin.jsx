import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useAdmin } from "./AdminContext";
import BASE_URL from "../config";

function AdminLogin() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { login } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save to context
        login(data.admin, data.token);
        alert("Admin Login Successful");
        navigate("/admin-dashboard");
      } else {
        setError(data.message || "Login failed");
        setShowErrorPopup(true);
      }

    } catch (error) {
      console.error(error);
      setError("Server error");
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>

      {/* Navbar */}
      <nav className="w-full h-20 fixed top-0 left-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b transition-colors duration-300"
           style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <i className="fas fa-robot text-4xl" style={{ color: 'var(--color-primary)' }}></i>
            <span className="text-2xl font-black text-white">
              AI Mentor
            </span>
          </div>

          {/* Navigation Menu */}
          <ul className="hidden lg:flex items-center gap-8">
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
              <a href="/feedback" className="text-sm font-semibold py-2 text-white hover:text-primary transition-all duration-300">
                Feedback
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Admin Login Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-colors duration-300"
               style={{ 
                 backgroundColor: 'var(--color-bg-secondary)',
                 border: `1px solid ${'var(--color-primary)'}20`,
                 boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
               }}>
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black mb-2"
                  style={{ color: 'var(--color-text-primary)' }}>
                Admin <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Login</span>
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Sign in to access the admin dashboard
              </p>
            </div>

            {/* Admin Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Admin Email
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
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
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="*********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all pr-12"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-full text-white font-semibold text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Not an admin?{' '}
                <a 
                  href="/login" 
                  className="font-semibold transition-colors"
                  style={{ color: 'var(--color-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                >
                  Regular Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Error Popup Modal */}
      {showErrorPopup && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeErrorPopup}
        >
          <div 
            className="relative max-w-md w-full rounded-2xl shadow-2xl p-6 transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              border: `1px solid ${'var(--color-error)'}20`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl animate-pulse"
                   style={{ 
                     backgroundColor: `${'var(--color-error)'}10`,
                     color: 'var(--color-error)'
                   }}>
                <i className="fas fa-exclamation-circle"></i>
              </div>
            </div>

            {/* Error Title */}
            <h3 className="text-xl font-bold text-center mb-2"
                style={{ color: 'var(--color-text-primary)' }}>
              Login Error
            </h3>

            {/* Error Message */}
            <p className="text-center mb-6"
               style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>

            {/* Close Button */}
            <button
              onClick={closeErrorPopup}
              className="w-full px-4 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:-translate-y-0.5"
              style={{ 
                background: `linear-gradient(to right, var(--color-error), var(--color-error))`
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLogin;