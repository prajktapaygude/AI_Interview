// frontend/src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setError('No reset token provided');
      setVerifying(false);
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
      
      if (response.data.success) {
        setValidToken(true);
      } else {
        setError('Invalid or expired reset link');
      }
    } catch (err) {
      console.error('Token verification error:', err);
      setError(err.response?.data?.error || 'Invalid or expired reset link');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        newPassword: password
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-md w-full text-center">
          <div className="rounded-lg p-6" style={{ backgroundColor: '#fee2e2' }}>
            <i className="fas fa-exclamation-triangle text-4xl mb-3" style={{ color: '#dc2626' }}></i>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#991b1b' }}>Invalid Reset Link</h2>
            <p className="text-sm mb-4" style={{ color: '#7f1d1d' }}>{error}</p>
            <Link
              to="/forgot-password"
              className="inline-block px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <i className="fas fa-lock text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
            Create New Password
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Please enter your new password below.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-center p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {message && (
            <div className="text-sm text-center p-3 rounded-lg" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
              {message}
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
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
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
      </div>
    </div>
  );
};

export default ResetPassword;