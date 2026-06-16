import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { useAdmin } from './AdminContext';
import ThemeToggle from '../ThemeToggle';
import LoadingSpinner from './LoadingSpinner';

// Socket.io client
import io from 'socket.io-client';

// Safe environment variable handling
const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, isSuperAdmin, logout, token } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ users: 0, subjects: 0, interviews: 0 });
  const [users, setUsers] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Admin management state
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [modalLoading, setModalLoading] = useState(false);
  // SaaS Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const adminsPerPage = 10;
  const socketRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.action-menu')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Fetch dashboard stats
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch general stats
      const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      
      // Fetch real total users count
      const usersResponse = await fetch(`${API_BASE_URL}/admin/users?page=1&limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();
      
      setStats({
        ...statsData,
        totalUsers: usersData.total || 0
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all admins
  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setAdminsError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/admins?active=all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      setAdmins(Array.isArray(data?.admins) ? data.admins : []);
    } catch (err) {
      console.error('Admin fetch error:', err);
      setAdminsError(err.message);
      throw err;
    } finally {
      setAdminsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
      fetchUsers();
    }
  }, [token]);

  // Real-time polling for admins
  useEffect(() => {
    if (!isSuperAdmin || !token) return;

    let retryCount = 0;
    const maxRetries = 3;
    
    const pollAdmins = async () => {
      try {
        await fetchAdmins();
        retryCount = 0;
      } catch (err) {
        retryCount++;
        setAdminsError(`Fetch failed (attempt ${retryCount}/${maxRetries}): ${err.message}`);
        if (retryCount >= maxRetries) {
          console.error('Max retries reached for admin fetch');
        }
      }
    };

    pollAdmins();
    const interval = setInterval(pollAdmins, 10000);

    return () => clearInterval(interval);
  }, [isSuperAdmin, token, fetchAdmins]);

  // Socket.io real-time stats updates
  useEffect(() => {
    if (!token) return;

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");

      socketRef.current.on("statsUpdated", () => {
        loadDashboardData();
      });
    }
    socketRef.current.on("usersUpdated", () => {
      fetchUsers();
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  // Add new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...adminForm,
          email: adminForm.email.trim().toLowerCase()
        })      
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add admin');
      }
      await response.json();
      fetchAdmins();
      setShowAddAdminModal(false);
      setAdminForm({ name: '', email: '', password: '', role: 'admin' });
    } catch (err) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Update existing admin
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/admins/${editingAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...adminForm,
          email: adminForm.email.trim().toLowerCase()
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update admin');
      }
      await response.json();
      fetchAdmins();
      setShowAddAdminModal(false);
      setEditingAdmin(null);
      setAdminForm({ name: '', email: '', password: '', role: 'admin' });
    } catch (err) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/admins/${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete admin');
      }
      await response.json();
      fetchAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  // Client-side filtering and pagination
  const filteredAdmins = admins.filter(adm => {
    const matchesSearch = adm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adm.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || adm.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditAdmin = (adm) => {
    setEditingAdmin(adm);
    setAdminForm({
      name: adm.name,
      email: adm.email,
      password: '',
      role: adm.role
    });
    setShowAddAdminModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Users fetch error:", err);
    }
  };

  // Navigation sections
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [{ path: '/admin-dashboard', icon: '📊', label: 'Dashboard' }]
    },
    {
      title: 'USER MANAGEMENT',
      items: [{ path: '/admin/users', icon: '👥', label: 'All Users' }]
    },
    {
      title: 'CONTENT',
      items: [
        { path: '/admin/subjects', icon: '📚', label: 'MCQ Test' },
        { path: '/admin/mock-interview', icon: '🎯', label: 'Mock Interviews' },
        { path: '/admin/resources', icon: '📖', label: 'Resources' }
      ]
    },
    {
      title: 'PLATFORM',
      items: [{ path: '/admin/premium', icon: '💎', label: 'Premium Services' }]
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b z-30 flex items-center px-4 sm:px-6 shadow-sm"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/admin')}
            >
              <i className="fas fa-robot text-2xl transition-colors group-hover:text-primary"
                 style={{ color: 'var(--color-primary)' }}></i>
              <span className="text-xl font-bold truncate max-w-[150px] sm:max-w-none transition-colors group-hover:text-primary"
                    style={{ color: 'var(--color-text-primary)' }}>
                AI Mentor Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base sm:text-lg hover:bg-primary/20 transition-colors"
              >
                {admin?.name?.charAt(0) || 'A'}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border overflow-hidden z-40 animate-fadeIn"
                     style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{admin?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{admin?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Toggle sidebar"
              style={{ 
                backgroundColor: 'rgba(128, 128, 128, 0.1)',
                color: 'var(--color-text-primary)',
                border: '1px solid rgba(128, 128, 128, 0.2)'
              }}
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 border-r transform transition-transform duration-300 ease-in-out z-20 lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
      >
        <nav className="p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider px-4 mb-2"
                  style={{ color: 'var(--color-text-secondary)' }}>
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : 'hover:bg-primary/10 hover:text-primary text-text-secondary'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 pt-16 min-h-screen px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Welcome section */}
          <div className="p-4 sm:p-6 rounded-2xl border mb-6 shadow-lg"
               style={{
                 background: `linear-gradient(145deg, ${'var(--color-primary)'}08, ${'var(--color-secondary)'}08)`,
                 borderColor: `${'var(--color-primary)'}20`
               }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl sm:text-3xl font-bold shadow-md"
                     style={{ color: 'var(--color-primary)' }}>
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-2 flex-wrap"
                      style={{ color: 'var(--color-text-primary)' }}>
                    Welcome back, {admin?.name || 'Admin'}!
                    <span className="text-3xl sm:text-4xl animate-wave">👋</span>
                  </h1>
                  <p className="text-sm sm:text-base mt-1 sm:mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Here's what's happening with your platform today
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-semibold shadow-md"
                    style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg animate-shake"
                 style={{ backgroundColor: `${'var(--color-error)'}10`, color: 'var(--color-error)' }}>
              <i className="fas fa-exclamation-circle mr-2"></i> {error}
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers || stats.users, icon: '👥', color: 'primary' },
              { label: 'Total MCQ Tests', value: stats.subjects, icon: '📚', color: 'secondary' },
              { label: 'Total Mock Interviews', value: stats.interviews, icon: '🎯', color: 'accent' }
            ].map((card, idx) => {
              const bgColor = `var(--color-${card.color})`;
              return (
                <div
                  key={idx}
                  className="p-4 sm:p-6 rounded-xl border text-left transition-all hover:scale-105 hover:shadow-xl w-full group cursor-default"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{card.icon}</span>
                    <span className="text-xs sm:text-sm font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${bgColor}15`, color: bgColor }}>
                      +12%
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {card.label}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {card.value.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Super Admin Tools – Admin Management */}
          {isSuperAdmin && (
            <div className="rounded-2xl p-4 sm:p-6 border shadow-lg"
                 style={{
                   background: `linear-gradient(145deg, ${'var(--color-primary)'}08, ${'var(--color-secondary)'}08)`,
                   borderColor: `${'var(--color-primary)'}20`
                 }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <span className="text-xl sm:text-2xl">👑</span> Admin Management
                </h2>
                <button
                  onClick={() => {
                    setEditingAdmin(null);
                    setAdminForm({ name: '', email: '', password: '', role: 'admin' });
                    setShowAddAdminModal(true);
                  }}
                  className="px-4 py-2 rounded-lg text-white font-medium text-sm flex items-center gap-2 transition-all hover:scale-105 hover:shadow-lg"
                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                >
                  <i className="fas fa-plus text-xs"></i> Add Admin
                </button>
              </div>
              
              {/* Table Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-secondary)' }}></i>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
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
                  className="w-full sm:w-48 px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {/* Loading / Error / Table */}
              {adminsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-12 h-12 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Loading admins...</p>
                </div>
              ) : adminsError ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-[var(--color-error)]">
                  <i className="fas fa-exclamation-circle text-2xl mb-4"></i>
                  <p className="text-sm font-medium text-center">{adminsError}</p>
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <i className="fas fa-users text-5xl text-gray-400 mb-4" style={{ color: 'var(--color-text-secondary)' }}></i>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>No admins found</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Click "Add Admin" to create your first admin.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="bg-[var(--color-bg-secondary)] rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                              Admin
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                              Role
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                              Created
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAdmins.map((adm) => (
                            <tr key={adm._id} className="border-b hover:bg-[var(--color-bg-primary)]/50 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0">
                                    {adm.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                    {adm.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
                                  {adm.email}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  adm.role === 'superadmin' 
                                    ? 'bg-purple-500/10 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 ring-1 ring-purple-500/20' 
                                    : 'bg-blue-500/10 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 ring-1 ring-blue-500/20'
                                }`}>
                                  {adm.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  (adm.is_active !== false) 
                                    ? 'bg-green-500/10 text-green-600 dark:bg-green-900/20 dark:text-green-400 ring-1 ring-green-500/20' 
                                    : 'bg-red-500/10 text-red-600 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-500/20'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: (adm.is_active !== false) ? '#10b981' : '#ef4444' }}></span>
                                  {adm.is_active !== false ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                  {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="relative action-menu">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(openMenuId === adm._id ? null : adm._id);
                                    }}
                                    className="p-2 rounded-lg hover:bg-[var(--color-bg-primary)] transition-colors group"
                                  >
                                    <i className="fas fa-ellipsis-v text-sm" style={{ color: 'var(--color-text-secondary)' }}></i>
                                  </button>
                                  {openMenuId === adm._id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-secondary)] rounded-xl shadow-xl border py-1 z-[9999]" style={{ borderColor: 'var(--color-border)' }}>
                                      <button
                                        onClick={() => handleEditAdmin(adm)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-primary)]/5 flex items-center gap-3 transition-all"
                                        style={{ color: 'var(--color-text-primary)' }}
                                      >
                                        <i className="fas fa-edit text-xs" style={{ color: 'var(--color-primary)' }}></i>
                                        Edit Admin
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAdmin(adm._id)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-500/5 flex items-center gap-3 transition-all"
                                        style={{ color: '#ef4444' }}
                                      >
                                        <i className="fas fa-trash-alt text-xs"></i>
                                        Delete Admin
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t flex items-center justify-between flex-wrap gap-2" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Showing {indexOfFirstAdmin + 1} to {Math.min(indexOfLastAdmin, filteredAdmins.length)} of {filteredAdmins.length} admins
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all hover:bg-[var(--color-primary)]/10"
                            style={{ color: currentPage === 1 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
                          >
                            <i className="fas fa-chevron-left text-xs"></i> Previous
                          </button>
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let page;
                              if (totalPages <= 5) {
                                page = i + 1;
                              } else if (currentPage <= 3) {
                                page = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                              } else {
                                page = currentPage - 2 + i;
                              }
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                                    page === currentPage 
                                      ? 'bg-[var(--color-primary)] text-white shadow-md' 
                                      : 'hover:bg-[var(--color-primary)]/10 text-[var(--color-text-primary)]'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all hover:bg-[var(--color-primary)]/10"
                            style={{ color: currentPage === totalPages ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
                          >
                            Next <i className="fas fa-chevron-right text-xs"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* System Logs & Settings */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="p-3 sm:p-4 rounded-xl border flex items-center justify-center gap-2 sm:gap-3 transition-all hover:shadow-md text-sm sm:text-base group"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <i className="fas fa-history" style={{ color: 'var(--color-secondary)' }}></i>
                  <span style={{ color: 'var(--color-text-primary)' }}>System Logs</span>
                </button>
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="p-3 sm:p-4 rounded-xl border flex items-center justify-center gap-2 sm:gap-3 transition-all hover:shadow-md text-sm sm:text-base group"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <i className="fas fa-cog" style={{ color: 'var(--color-accent)' }}></i>
                  <span style={{ color: 'var(--color-text-primary)' }}>Settings</span>
                </button>
              </div> */}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddAdminModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-2xl border p-4 sm:p-6"
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
               onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
            </h3>
            <form onSubmit={editingAdmin ? handleUpdateAdmin : handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Name</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({...adminForm, name: e.target.value.trim()})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  required
                />
              </div>
              {!editingAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Password</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Role</label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({...adminForm, role: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 py-2 rounded-lg border text-sm transition-all hover:bg-[var(--color-bg-primary)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                  disabled={modalLoading}
                >
                  {modalLoading && <i className="fas fa-spinner fa-spin"></i>}
                  {editingAdmin ? 'Update Admin' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-wave {
          animation: wave 1.5s infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;