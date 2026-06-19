import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../ThemeContext';
import BASE_URL from '../config';

// ✅ API URL
const getApiBaseUrl = () => {
  if (import.meta?.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.DEV ? `${BASE_URL}/api` : '/api';
};

const API_BASE_URL = getApiBaseUrl();

const AdminInterviewSessions = () => {
  const navigate = useNavigate();
  const { token } = useAdmin();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [roleFilter, setRoleFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {isDarkMode} = useTheme();
  
  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter]);

  // ✅ Fetch Sessions
  const fetchSessions = useCallback(async (showRefreshing = false) => {
    if (!token) return;

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter !== 'all' && { role: roleFilter })
      });

      const res = await fetch(`${API_BASE_URL}/admin/interview/sessions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch sessions');
      }

      const data = await res.json();
      console.log("SESSIONS API RESPONSE:", data); 
      setSessions(data.sessions || []);
      setTotalPages(data.totalPages || 1);

    } catch (err) {
      setError(err.message);
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, debouncedSearch, roleFilter, token]);

  // ✅ Initial fetch only (no polling)
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Helper function to get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
    if (score >= 40) return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
  };

  // Helper function to get role badge color
  const getRoleBadgeColor = (role) => {
    if (role === 'Frontend Developer') return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    if (role === 'Backend Developer') return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
    return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchSessions(true);
  };

  if (loading && sessions.length === 0) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="sm:justify-self-start">
            {/* Optional back button space */}
          </div>
          <div className="sm:col-span-1 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm mb-3"
                 style={{ backgroundColor: `${'var(--color-primary)'}10`, borderColor: `${'var(--color-primary)'}20` }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: 'var(--color-primary)' }}></span>
              </span>
              <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                Interview Sessions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span style={{ color: 'var(--color-text-primary)' }}>Interview </span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sessions
              </span>
            </h1>
            <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Monitor and manage all interview sessions
            </p>
          </div>
          <div className="hidden sm:block"></div>
        </div>

        {/* Refresh Button and Stats Row */}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                borderColor: 'var(--color-border)', 
                color: 'var(--color-text-primary)', 
                backgroundColor: 'var(--color-bg-secondary)'
              }}
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm border" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Live Data</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-600 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-shadow" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Sessions</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>{sessions.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: `${'var(--color-primary)'}15` }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-shadow" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Avg. Score</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                  {sessions.length > 0 
                    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length)
                    : 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: `${'var(--color-primary)'}15` }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-shadow" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Completion Rate</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                  {sessions.length > 0 
                    ? Math.round((sessions.filter(s => s.score && s.score > 0).length / sessions.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: `${'var(--color-primary)'}15` }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-shadow" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pages</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>{totalPages}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: `${'var(--color-primary)'}15` }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-xl border p-4 hover:shadow-lg transition-shadow" 
             style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ 
                  backgroundColor: 'var(--color-bg-primary)', 
                  borderColor: 'var(--color-border)', 
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                borderColor: 'var(--color-border)', 
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="all">All Roles</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
            </select>

            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('all');
              }}
              className="px-4 py-2 transition-colors hover:text-primary"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-xl border hover:shadow-lg transition-shadow overflow-hidden" 
             style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b" style={{ backgroundColor: `${'var(--color-primary)'}05`, borderColor: 'var(--color-border)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Tech Stack</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Level</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p style={{ color: 'var(--color-text-secondary)' }}>No sessions found</p>
                        <button
                          onClick={() => {
                            setSearch('');
                            setRoleFilter('all');
                          }}
                          className="text-sm hover:underline"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id || s._id} className="hover:bg-primary/5 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                               style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
                            {s.user?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{s.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(s.role)}`}>
                          {s.role === 'Frontend Developer' ? 'Frontend' : s.role === 'Backend Developer' ? 'Backend' : s.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span style={{ color: 'var(--color-text-primary)' }}>{s.tech}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span style={{ color: 'var(--color-text-primary)' }}>{s.level}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(s.score)}`}>
                            {s.score || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(s.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {/* <button
                          onClick={() => navigate(`/admin/interview/sessions/${s.id || s._id}`)}
                          className="text-sm font-medium transition-colors hover:opacity-80"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          View Details →
                        </button> */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: `${'var(--color-primary)'}05` }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, sessions.length)}</span> of{' '}
                  <span className="font-medium">{sessions.length}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg transition-all ${
                            currentPage === pageNum
                              ? 'text-white shadow-md'
                              : 'border hover:shadow-md'
                          }`}
                          style={
                            currentPage === pageNum
                              ? { background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }
                              : { borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }
                          }
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInterviewSessions;