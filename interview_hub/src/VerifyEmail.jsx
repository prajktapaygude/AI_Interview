import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail, storeUserData } from './services/authApi';   // ← changed from '../services/authApi'
import { useTheme } from './ThemeContext';                         // ← changed from '../ThemeContext'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        // Response contains { success: true, token, user }
        if (response.token && response.user) {
          storeUserData(response.user, response.token);
        }
        setStatus('success');
        setMessage(response.message || 'Email verified successfully! Redirecting to dashboard...');
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-md w-full rounded-2xl p-8 text-center"
           style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${'var(--color-primary)'}20` }}>
              <i className="fas fa-spinner fa-spin text-3xl" style={{ color: 'var(--color-primary)' }}></i>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Verifying your email...
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Please wait while we activate your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${'var(--color-success)'}20`, color: 'var(--color-success)' }}>
              <i className="fas fa-check-circle text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Email Verified!
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
            <p className="mt-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${'var(--color-error)'}20`, color: 'var(--color-error)' }}>
              <i className="fas fa-exclamation-triangle text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 rounded-full text-white font-semibold"
                style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full px-4 py-2 rounded-full border-2 font-semibold"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-text-primary)' }}
              >
                Back to Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;