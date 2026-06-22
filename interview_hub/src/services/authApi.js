// services/authApi.js
import BASE_URL from '../config';   // <-- import the base URL

// Local registration
export const registerUser = async (userData) => {
  try {
    // Use BASE_URL + the correct backend route (assuming '/signup')
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Local login
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 403 specifically for unverified email
      if (response.status === 403) {
        throw new Error(data.message || 'Please verify your email before logging in.');
      }
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Verify email with token
export const verifyEmail = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify-email?token=${token}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Resend verification email
export const resendVerification = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend verification email');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Google OAuth URL – now uses BASE_URL
export const getGoogleAuthURL = () => {
  // Use BASE_URL instead of hardcoded localhost
  const baseURL = `${BASE_URL}/api/auth/google`;
  return `${baseURL}?prompt=select_account`;
};

// Handle Google OAuth callback
export const handleGoogleCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userData = urlParams.get('user');
  
  if (token && userData) {
    const user = JSON.parse(decodeURIComponent(userData));
    storeUserData(user, token);
    return { success: true, user, token };
  }
  return { success: false };
};

// Local storage functions
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const logoutUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const storeUserData = (userData, token) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
};