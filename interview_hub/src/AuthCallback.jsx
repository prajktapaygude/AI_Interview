import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BASE_URL from '../config';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userParam = params.get('user');

        console.log('🔐 Auth callback received at:', location.pathname);
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('User:', userParam ? 'Present' : 'Missing');

        if (token && userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Store user data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          console.log('✅ Auth successful, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.error('Missing token or user data');
          setError('Authentication failed. Missing data.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fab fa-google text-2xl text-indigo-500"></i>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing Login...</h2>
        <p className="text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;