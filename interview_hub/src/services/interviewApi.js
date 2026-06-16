// src/services/interviewApi.js

const API_BASE_URL = '/api';

// Get user stats including all interviews
export const getUserStats = async (userId) => {
  try {
    const token = getStoredToken();
    
    const response = await fetch(`${API_BASE_URL}/interview/stats`, {  // Changed from /get-user-stats to /interview/stats
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalInterviews: 0,
      avgScore: 0,
      improvement: 0,
      hoursPracticed: 0,
      recentInterviews: []
    };
  }
};

// Save interview results
export const saveInterviewResult = async (interviewData) => {
  try {
    const token = getStoredToken();
    
    const response = await fetch(`${API_BASE_URL}/interview/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(interviewData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving interview result:', error);
    throw error;
  }
};

// Helper function to get stored token
const getStoredToken = () => {
  return localStorage.getItem('token');
};