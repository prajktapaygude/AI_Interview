import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../admin/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user/tests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tests');
      
      const data = await response.json();
      setTests(data.tests || []);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId) => {
    navigate(`/test/${testId}`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-error p-8">{error}</div>;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Available <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Tests</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Test your knowledge and track your progress
          </p>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-flask text-5xl mb-4 opacity-30" style={{ color: 'var(--color-text-secondary)' }}></i>
            <p style={{ color: 'var(--color-text-secondary)' }}>No tests available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test._id}
                className="rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer group"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                onClick={() => handleStartTest(test._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {test.title}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {test.subjectName} • {test.difficulty}
                    </p>
                  </div>
                  {test.attempted ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-600">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                      New
                    </span>
                  )}
                </div>

                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {test.description}
                </p>

                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <span><i className="far fa-clock mr-1"></i>{test.duration} min</span>
                  <span><i className="fas fa-question-circle mr-1"></i>{test.totalQuestions} questions</span>
                  <span><i className="fas fa-chart-line mr-1"></i>Pass: {test.passingScore}%</span>
                </div>

                {test.attempted && test.attemptScore && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Your Score:</span>
                      <span className={`font-bold ${test.attemptScore >= test.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                        {test.attemptScore}%
                      </span>
                    </div>
                  </div>
                )}

                <button
                  className="w-full mt-4 py-2 rounded-lg text-white font-medium text-sm transition-all hover:shadow-lg group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                >
                  {test.attempted ? 'Review Test' : 'Start Test'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTests;