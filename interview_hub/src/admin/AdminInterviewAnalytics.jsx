import React, { useState, useEffect } from 'react';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BASE_URL from '../config';

const USE_MOCK = false; // Set to false to use real database data

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `${BASE_URL}/api`;
};
const API_BASE_URL = getApiBaseUrl();

const AdminInterviewAnalytics = () => {
  const { token } = useAdmin();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    if (USE_MOCK) {
      // Fallback mock data (only used if backend fails)
      setTimeout(() => {
        setAnalytics({
          totalSessions: 145,
          averageScore: 74,
          averageByRole: {
            'Frontend Developer': 78,
            'Backend Developer': 72,
            'Data Scientist': 81
          },
          scoreDistribution: {
            '0-20': 5,
            '21-40': 12,
            '41-60': 28,
            '61-80': 45,
            '81-100': 55
          },
          weakTopics: ['closures', 'asynchronous programming', 'database indexing']
        });
        setLoading(false);
      }, 500);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
      // Fallback to mock data on error
      setAnalytics({
        totalSessions: 0,
        averageScore: 0,
        averageByRole: {},
        scoreDistribution: {
          '0-20': 0,
          '21-40': 0,
          '41-60': 0,
          '61-80': 0,
          '81-100': 0
        },
        weakTopics: ['No data available yet']
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="text-center p-8" style={{ color: 'var(--color-error)' }}>
      <i className="fas fa-exclamation-circle text-4xl mb-4"></i>
      <p>{error}</p>
      <button 
        onClick={fetchAnalytics}
        className="mt-4 px-4 py-2 rounded-lg text-white"
        style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
      >
        Retry
      </button>
    </div>
  );
  if (!analytics) return null;

  // Calculate total from score distribution
  const totalFromDistribution = Object.values(analytics.scoreDistribution || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Interview <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Real-time performance metrics from {analytics.totalSessions || 0} interview sessions
          </p>
        </div>

        {/* Key metrics cards – responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl" style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                📊
              </div>
              <div>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Sessions</p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{analytics.totalSessions || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl" style={{ backgroundColor: `${'var(--color-secondary)'}15`, color: 'var(--color-secondary)' }}>
                📈
              </div>
              <div>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Average Score</p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{analytics.averageScore || 0}%</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl" style={{ backgroundColor: `${'var(--color-accent)'}15`, color: 'var(--color-accent)' }}>
                🎯
              </div>
              <div>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Top Weak Topic</p>
                <p className="text-base sm:text-lg font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {analytics.weakTopics && analytics.weakTopics.length > 0 ? analytics.weakTopics[0] : 'No data'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Score Distribution
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.scoreDistribution || {}).map(([range, count]) => {
              const percentage = totalFromDistribution > 0 ? (count / totalFromDistribution) * 100 : 0;
              return (
                <div key={range}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span style={{ color: 'var(--color-text-secondary)' }}>{range}%</span>
                    <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{count} sessions</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Average by role */}
        <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Average Score by Role
          </h2>
          {Object.keys(analytics.averageByRole || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.averageByRole).map(([role, avg]) => (
                <div key={role}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span style={{ color: 'var(--color-text-primary)' }}>{role}</span>
                    <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{avg}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${avg}%`,
                        background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
              No interview data available yet. Conduct some interviews to see analytics.
            </p>
          )}
        </div>

        {/* Weak topics */}
        <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-base sm:text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Common Weak Areas
          </h2>
          <div className="flex flex-wrap gap-2">
            {(analytics.weakTopics || []).map((topic, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-full text-xs sm:text-sm" style={{ backgroundColor: `${'var(--color-error)'}15`, color: 'var(--color-error)' }}>
                {topic}
              </span>
            ))}
            {(!analytics.weakTopics || analytics.weakTopics.length === 0 || (analytics.weakTopics.length === 1 && analytics.weakTopics[0] === 'No data available yet')) && (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No weak topics identified yet. More interview data needed.
              </p>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
          >
            <i className="fas fa-sync-alt"></i>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInterviewAnalytics;