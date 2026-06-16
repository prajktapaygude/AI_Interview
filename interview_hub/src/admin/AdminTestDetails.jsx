import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BackButton from '../components/BackButton';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminTestDetails = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { token } = useAdmin();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tests/${testId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTest(data.test);
      }
    } catch (err) {
      console.error('Error fetching test:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!test) return <div>Test not found</div>;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <BackButton fallbackPath="/admin/subjects" />
        
        <div className="mt-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {test.title}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{test.description}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm ${test.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}`}>
                {test.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Subject</p>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{test.subjectName}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Duration</p>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{test.duration} minutes</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Questions</p>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{test.totalQuestions}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Passing Score</p>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{test.passingScore}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              All Questions ({test.questions.length})
            </h2>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}
            >
              <i className={`fas fa-${showAnswers ? 'eye-slash' : 'eye'} mr-2`}></i>
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
          </div>
          
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {test.questions.map((question, idx) => (
              <div key={idx} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                       style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {question.text}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {question.options?.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 text-sm">
                          <span className="w-6">{String.fromCharCode(65 + optIdx)}.</span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{option}</span>
                          {showAnswers && question.correctAnswer === option && (
                            <i className="fas fa-check-circle text-green-500 text-xs ml-2"></i>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {showAnswers && (
                      <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: `${'var(--color-success)'}10` }}>
                        <p className="text-sm">
                          <span className="font-medium">Correct Answer:</span>{' '}
                          <span className="text-green-600">{question.correctAnswer}</span>
                        </p>
                        {question.explanation && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Explanation:</span>{' '}
                            <span style={{ color: 'var(--color-text-secondary)' }}>{question.explanation}</span>
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="px-2 py-1 rounded" style={{ backgroundColor: `${'var(--color-accent)'}15`, color: 'var(--color-accent)' }}>
                        {question.difficulty || test.difficulty}
                      </span>
                      {question.topic && (
                        <span className="px-2 py-1 rounded" style={{ backgroundColor: `${'var(--color-secondary)'}15`, color: 'var(--color-secondary)' }}>
                          {question.topic}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => navigate(`/admin/tests/${testId}/take`)}
            className="px-6 py-2 rounded-lg text-white transition-all hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
          >
            <i className="fas fa-play mr-2"></i>
            Take This Test
          </button>
          <button
            onClick={() => navigate(`/admin/tests/${testId}/analytics`)}
            className="px-6 py-2 rounded-lg border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <i className="fas fa-chart-bar mr-2"></i>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTestDetails;