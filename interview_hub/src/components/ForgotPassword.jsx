// frontend/src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BASE_URL from "../config"
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      
      if (response.data.success) {
        setSubmitted(true);
        setMessage(response.data.message);
      } else {
        setError(response.data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <i className="fas fa-key text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
            Forgot Password?
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="Enter your email address"
              />
            </div>

            {error && (
              <div className="text-sm text-center p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>
                <i className="fas fa-arrow-left mr-1"></i>
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="rounded-lg p-6" style={{ backgroundColor: '#d1fae5' }}>
              <i className="fas fa-envelope text-4xl mb-3" style={{ color: '#059669' }}></i>
              <p className="text-sm" style={{ color: '#065f46' }}>{message}</p>
              <Link
                to="/login"
                className="mt-4 inline-block px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;