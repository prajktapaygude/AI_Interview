import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import BackButton from '../components/BackButton';
import BASE_URL from '../config';

const API_BASE_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

const TestAnalytics = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [testId]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/tests/${testId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton fallbackPath="/admin/subjects" />
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Test Analytics: {analytics?.test?.title}
        </h1>
        <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Performance metrics and insights
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm opacity-70 mb-2">Total Attempts</p>
            <p className="text-3xl font-bold">{analytics?.totalAttempts || 0}</p>
          </div>
          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm opacity-70 mb-2">Average Score</p>
            <p className="text-3xl font-bold">{Math.round(analytics?.averageScore || 0)}%</p>
          </div>
          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm opacity-70 mb-2">Pass Rate</p>
            <p className="text-3xl font-bold">{Math.round(analytics?.passRate || 0)}%</p>
          </div>
          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm opacity-70 mb-2">Highest Score</p>
            <p className="text-3xl font-bold">{Math.round(analytics?.highestScore || 0)}%</p>
          </div>
        </div>

        {/* Question Performance */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold mb-4">Question Performance</h2>
          <div className="space-y-4">
            {analytics?.questionStats?.map((q, idx) => (
              <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium mb-1">Question {idx + 1}: {q.questionText}</p>
                    <p className="text-sm opacity-70">Correct: {q.correctCount} / {q.totalAttempts}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{(q.correctRate * 100).toFixed(1)}% Correct</p>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${q.correctRate * 100}%`, backgroundColor: q.correctRate > 0.7 ? '#10b981' : q.correctRate > 0.4 ? '#f59e0b' : '#ef4444' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAnalytics;