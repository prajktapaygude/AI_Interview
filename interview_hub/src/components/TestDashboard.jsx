// src/components/TestDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../admin/AdminContext';
import { fetchAvailableTests } from '../services/quizApi';
import LoadingSpinner from './LoadingSpinner';

const TestDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAdmin();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invalidTests, setInvalidTests] = useState([]);

  // Helper function to validate MongoDB ObjectId
  const isValidObjectId = (id) => {
    return /^[a-fA-F0-9]{24}$/.test(id);
  };

  useEffect(() => {
    if (token) {
      loadTests();
    }
  }, [token]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await fetchAvailableTests(token);
      
      console.log('🔍 Raw tests received:', data.length);
      
      // Separate valid and invalid tests
      const valid = [];
      const invalid = [];
      
      data.forEach(test => {
        const isValid = isValidObjectId(test._id);
        if (isValid) {
          valid.push(test);
        } else {
          console.warn('⚠️ Invalid test ID found:', {
            id: test._id,
            length: test._id?.length,
            title: test.title,
            expected: '24 characters hex string'
          });
          invalid.push({
            id: test._id,
            title: test.title,
            reason: `Invalid ID format (${test._id?.length} chars, expected 24)`
          });
        }
      });
      
      console.log(`✅ Found ${valid.length} valid tests out of ${data.length}`);
      
      if (invalid.length > 0) {
        setInvalidTests(invalid);
        console.warn('⚠️ Invalid tests detected:', invalid);
      }
      
      setTests(valid);
      
      if (valid.length === 0 && data.length > 0) {
        setError('No valid tests available. Please contact administrator.');
      }
      
    } catch (err) {
      console.error('Error loading tests:', err);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId, isRetake = false) => {
    if (!isValidObjectId(testId)) {
      console.error('❌ Attempted to navigate to invalid test ID:', testId);
      setError(`Cannot start test: Invalid test ID format. Please contact support.`);
      return;
    }
    
    console.log('✅ Navigating to test ID:', testId, 'Retake:', isRetake);
    navigate(`/quiz/${testId}`);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="p-6 rounded-lg border border-red-500 bg-red-50 inline-block">
          <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={loadTests}
            className="mt-4 px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-6 rounded-lg border border-yellow-500 bg-yellow-50 inline-block">
          <i className="fas fa-info-circle text-yellow-500 text-3xl mb-3"></i>
          <p className="text-yellow-600 font-medium">No tests available at the moment.</p>
          {invalidTests.length > 0 && (
            <div className="mt-4 text-left text-sm">
              <p className="font-medium text-gray-700">⚠️ Found {invalidTests.length} test(s) with invalid IDs:</p>
              <ul className="mt-2 list-disc list-inside text-gray-600">
                {invalidTests.map((test, idx) => (
                  <li key={idx}>{test.title} - {test.reason}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-500">Please contact an administrator to fix these tests.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Invalid Tests Warning (if any) */}
      {invalidTests.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-yellow-500 bg-yellow-50">
          <div className="flex items-start">
            <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
            <div>
              <p className="font-medium text-yellow-700">
                ⚠️ {invalidTests.length} test(s) have invalid IDs and cannot be taken
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                These tests will not appear in the list below. Please contact an administrator to fix them.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => {
          const hasAttempts = test.attemptsCount > 0;
          const lastAttemptScore = test.attemptScore;
          const lastAttemptPassed = test.attemptPassed;
          const attemptsCount = test.attemptsCount || 0;
          
          return (
            <div
              key={test._id}
              className="p-6 rounded-xl border hover:shadow-xl transition-all duration-300 group"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)', 
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {test.title}
                </h3>
                {hasAttempts && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lastAttemptPassed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {lastAttemptPassed ? '✓ Passed' : '✗ Failed'}
                  </span>
                )}
              </div>
              
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {test.description || 'No description available'}
              </p>
              
              <div className="flex flex-wrap gap-3 text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                <span><i className="far fa-clock mr-1"></i>{test.duration} min</span>
                <span><i className="fas fa-question-circle mr-1"></i>{test.totalQuestions} questions</span>
                <span><i className="fas fa-chart-line mr-1"></i>Pass: {test.passingScore}%</span>
                <span><i className="fas fa-tag mr-1"></i>{test.difficulty || 'medium'}</span>
              </div>
              
              {/* Last Attempt Info */}
              {hasAttempts && (
                <div className="mt-3 p-3 rounded-lg mb-4" style={{ 
                  backgroundColor: lastAttemptPassed ? '#10b98120' : '#ef444420',
                  borderLeft: `3px solid ${lastAttemptPassed ? '#10b981' : '#ef4444'}`
                }}>
                  <p className="text-xs font-medium" style={{ color: lastAttemptPassed ? '#10b981' : '#ef4444' }}>
                    <i className="fas fa-history mr-1"></i>
                    Last Attempt: {Math.round(lastAttemptScore)}% ({lastAttemptPassed ? 'Passed' : 'Failed'})
                  </p>
                  {test.attemptDate && (
                    <p className="text-xs mt-1 opacity-75" style={{ color: lastAttemptPassed ? '#10b981' : '#ef4444' }}>
                      {new Date(test.attemptDate).toLocaleDateString()} at {new Date(test.attemptDate).toLocaleTimeString()}
                    </p>
                  )}
                  <p className="text-xs mt-1 opacity-75" style={{ color: lastAttemptPassed ? '#10b981' : '#ef4444' }}>
                    Total Attempts: {attemptsCount}
                  </p>
                </div>
              )}
              
              {/* Attempts Statistics */}
              {attemptsCount > 1 && (
                <div className="mt-2 mb-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <i className="fas fa-chart-line mr-1"></i>
                  You've taken this test {attemptsCount} times
                </div>
              )}
              
              {/* Start/Restart Button */}
              <button
                onClick={() => handleStartTest(test._id, hasAttempts)}
                className={`w-full mt-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  hasAttempts 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {hasAttempts ? (
                  <>
                    <i className="fas fa-redo-alt"></i>
                    Retake Test (New Questions)
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    Start Test
                  </>
                )}
              </button>
              
              {hasAttempts && (
                <p className="text-xs mt-2 text-center opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
                  <i className="fas fa-magic mr-1"></i>
                  Each retake gives you brand new questions!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestDashboard;