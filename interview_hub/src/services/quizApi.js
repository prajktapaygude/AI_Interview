import axios from 'axios';
import { mockQuestions } from './mockQuestions';

// QuizAPI configuration
const API_TOKEN = 'DUDOGxElPezSjh1pr1AgsW4zWrX8Hm5RowRntx1H';
const BASE_URL = 'https://quizapi.io/api/v1';

// Backend API URL
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const quizApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Api-Key': API_TOKEN
  }
});

// Map of language names to QuizAPI category names
export const languageCategories = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  javascript: 'JavaScript',
  csharp: 'C#',
  react: 'React',
  angular: 'Angular',
  vue: 'Vue',
  sql: 'SQL',
  php: 'PHP'
};

// Alternative category names
const categoryAlternatives = {
  vue: ['Vue.js', 'VueJS', 'vue'],
  react: ['React', 'ReactJS', 'react.js'],
  angular: ['Angular', 'AngularJS', 'angular.js'],
  javascript: ['JavaScript', 'JS', 'javascript'],
  python: ['Python', 'python'],
  java: ['Java', 'java'],
  cpp: ['C++', 'cpp', 'Cplusplus'],
  csharp: ['C#', 'CSharp', 'csharp'],
  sql: ['SQL', 'sql', 'MySQL', 'Database'],
  php: ['PHP', 'php']
};

// Helper to check if API is available
export const checkApiHealth = async () => {
  try {
    const response = await quizApi.get('/questions', {
      params: { limit: 1 }
    });
    return { available: true, data: response.data };
  } catch (error) {
    return { 
      available: false, 
      error: error.response?.status === 404 
        ? 'API endpoint not found. The API may have moved or changed.'
        : error.message 
    };
  }
};

// Try to fetch questions with a specific category tag
const tryFetchWithCategory = async (category, limit) => {
  const response = await quizApi.get('/questions', {
    params: {
      tags: category,
      limit: limit
    }
  });
  return response.data;
};

// NEW: Fetch admin-created test
export const fetchAdminTest = async (testId, token) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/user/tests/${testId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to load test');
    }
    
    const data = await response.json();
    return {
      isAdminTest: true,
      test: data,
      questions: data.questions.map(q => ({
        id: q._id,
        question: q.text,
        answers: q.options.reduce((acc, opt, idx) => {
          acc[`answer_${String.fromCharCode(97 + idx)}`] = opt;
          return acc;
        }, {}),
        correct_answers: {
          [`answer_${String.fromCharCode(97 + q.options.findIndex(opt => opt === q.correctAnswer))}_correct`]: "true"
        },
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic: q.topic
      })),
      testInfo: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        totalQuestions: data.totalQuestions,
        passingScore: data.passingScore,
        difficulty: data.difficulty
      }
    };
  } catch (error) {
    console.error('Error fetching admin test:', error);
    throw error;
  }
};

// NEW: Submit admin test
export const submitAdminTest = async (testId, answers, timeSpent, token) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/user/tests/${testId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ answers, timeSpent })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit test');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting test:', error);
    throw error;
  }
};

// NEW: Fetch all available tests for user
export const fetchAvailableTests = async (token) => {
  try {
    const response = await fetch( {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tests');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching available tests:', error);
    return [];
  }
};

// Fetch questions by language/category with fallback to alternatives
export const fetchQuestionsByLanguage = async (language, limit = 20) => {
  const categoryName = languageCategories[language] || language;
  const alternatives = categoryAlternatives[language] || [categoryName];
  
  console.log(`Fetching ${categoryName} questions with limit ${limit}...`);
  console.log(`Trying alternatives:`, alternatives);
  
  // Try the primary category first, then fall back to alternatives
  for (const category of alternatives) {
    try {
      console.log(`Trying category: ${category}...`);
      const response = await tryFetchWithCategory(category, limit);
      
      if (response && response.length > 0) {
        console.log(`Success! Found ${response.length} questions with category: ${category}`);
        return response;
      }
    } catch (error) {
      console.log(`Category "${category}" failed:`, error.message);
      
      if (error.response?.status === 404) {
        continue;
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('API authentication failed. Please check the API key.');
      }
      if (error.code === 'ECONNABORTED' || !error.response) {
        throw new Error('Network error. Please check your internet connection.');
      }
    }
  }
  
  // If all specific categories fail, try fetching general questions
  console.log('All category-specific requests failed. Trying general questions...');
  try {
    const generalResponse = await quizApi.get('/questions', {
      params: { limit: limit }
    });
    
    if (generalResponse.data && generalResponse.data.length > 0) {
      console.log(`Found ${generalResponse.data.length} general questions as fallback`);
      return generalResponse.data;
    }
  } catch (fallbackError) {
    console.error('Fallback also failed:', fallbackError);
  }
  
  // Use local mock questions as final fallback
  console.log('Using local mock questions as fallback');
  const localQuestions = mockQuestions[language] || mockQuestions.javascript;
  if (localQuestions && localQuestions.length > 0) {
    console.log(`Found ${localQuestions.length} local mock questions for ${language}`);
    return localQuestions.slice(0, limit);
  }
  
  throw new Error(`No questions found for "${categoryName}". Please try another language.`);
};

// Alternative: Get questions without category (general)
export const fetchGeneralQuestions = async (limit = 20) => {
  try {
    const response = await quizApi.get('/questions', {
      params: {
        limit: limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export default quizApi;