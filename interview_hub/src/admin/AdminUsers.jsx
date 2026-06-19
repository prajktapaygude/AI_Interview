import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BackButton from '../components/BackButton';
import BASE_URL from '../config';

// ==================== MOCK MODE ====================
const USE_MOCK = false;

// Mock data
const MOCK_USERS = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/40?u=1',
    authType: 'local',
    membership: 'Premium',
    createdAt: '2024-01-15T10:00:00.000Z',
    lastLogin: '2025-03-12T14:30:00.000Z'
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://i.pravatar.cc/40?u=2',
    authType: 'google',
    membership: 'Free',
    createdAt: '2024-02-20T12:00:00.000Z',
    lastLogin: '2025-03-10T09:15:00.000Z'
  },
  {
    _id: '3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/40?u=3',
    authType: 'local',
    membership: 'Free',
    createdAt: '2024-03-05T08:30:00.000Z',
    lastLogin: '2025-03-11T16:45:00.000Z'
  },
  {
    _id: '4',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    avatar: 'https://i.pravatar.cc/40?u=4',
    authType: 'google',
    membership: 'Premium',
    createdAt: '2024-01-28T14:20:00.000Z',
    lastLogin: '2025-03-12T11:10:00.000Z'
  },
  {
    _id: '5',
    name: 'Emily Davis',
    email: 'emily@example.com',
    avatar: 'https://i.pravatar.cc/40?u=5',
    authType: 'local',
    membership: 'Free',
    createdAt: '2024-04-12T09:45:00.000Z',
    lastLogin: '2025-03-09T13:20:00.000Z'
  }
];

const mockDeleteUser = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

// Mock toggle verify - removed as not needed
// const mockToggleVerify = (userId, newStatus) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({ isVerified: newStatus });
//     }, 500);
//   });
// };

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return `${BASE_URL}/api`;
};

const API_BASE_URL = getApiBaseUrl();
// ==================================================

const AdminUsers = () => {
  const { token } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  // Removed togglingUserId state
  // const [togglingUserId, setTogglingUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters and pagination
  const [search, setSearch] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all');
  // Removed verifiedFilter
  // const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [authTypeFilter, setAuthTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const itemsPerPage = 10;

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Helper function to get avatar URL
  const getAvatarUrl = (user) => {
    if (user.avatar && user.avatar !== 'https://via.placeholder.com/40') {
      return user.avatar;
    }
    // Generate a nice avatar using UI Avatars service
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=40&bold=true`;
  };

  // Mock fetch function
  const mockFetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        let filtered = MOCK_USERS.filter(user =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );

        if (membershipFilter !== 'all') {
          filtered = filtered.filter(u => u.membership === membershipFilter);
        }

        // Removed verified filter
        // if (verifiedFilter !== 'all') {
        //   const isVerified = verifiedFilter === 'true';
        //   filtered = filtered.filter(u => u.isVerified === isVerified);
        // }

        if (authTypeFilter !== 'all') {
          filtered = filtered.filter(u => u.authType === authTypeFilter);
        }

        const total = filtered.length;
        const totalPagesCalc = Math.ceil(total / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const paginated = filtered.slice(start, start + itemsPerPage);

        setUsers(paginated);
        setTotalPages(totalPagesCalc);
        setTotalUsers(total);
        setLoading(false);
      } catch (err) {
        setError('Mock fetch failed');
        setLoading(false);
      }
    }, 800);
  }, [search, membershipFilter, authTypeFilter, currentPage]); // Removed verifiedFilter dependency

  // Real fetch function
  const realFetchUsers = useCallback(async () => {
    if (!token) {
      console.log('No token available');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search,
        membership: membershipFilter,
        // verified: verifiedFilter, // Removed
        authType: authTypeFilter
      });
      
      console.log('Fetching users with URL:', `${API_BASE_URL}/admin/users?${params}`);
      
      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.total || 0);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, membershipFilter, authTypeFilter, token]); // Removed verifiedFilter dependency

  const fetchUsers = USE_MOCK ? mockFetchUsers : realFetchUsers;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!USE_MOCK && !token) return;
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, membershipFilter, authTypeFilter, currentPage, fetchUsers, token]); // Removed verifiedFilter

  // Delete handler
  const handleDelete = async (userId) => {
    if (!window.confirm('⚠️ WARNING: This will PERMANENTLY delete the user from the database. This action cannot be undone. Are you sure?')) return;

    if (USE_MOCK) {
      try {
        await mockDeleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
        setTotalUsers(prev => prev - 1);
        setSuccessMessage('User deleted successfully (Mock)');
      } catch (err) {
        setError('Mock delete failed');
      }
    } else {
      setDeletingUserId(userId);
      setError(null);
      
      try {
        console.log('Permanently deleting user:', userId);
        
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Delete failed');
        }
        
        console.log('Delete response:', data);
        
        // Remove user from local state immediately
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
        setTotalUsers(prev => prev - 1);
        setSuccessMessage('✅ User permanently deleted from database');
        
      } catch (err) {
        console.error('Delete error:', err);
        setError(`Delete failed: ${err.message}`);
        // Refresh to ensure consistency
        fetchUsers();
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  // Removed toggle verified handler
  // const handleToggleVerified = async (userId, currentVerified) => {
  //   ...
  // };

  // Stats - removed verifiedCount
  // const verifiedCount = users.filter(u => u.isVerified).length;
  const premiumCount = users.filter(u => u.membership === 'Premium').length;

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div className="min-h-screen transition-colors duration-300 p-4"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="sm:justify-self-start">
            <BackButton fallbackPath="/admin-dashboard" />
          </div>

          <div className="sm:col-span-1 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span style={{ color: 'var(--color-text-primary)' }}>Manage </span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Users
              </span>
            </h1>
            <p className="text-base sm:text-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              View and manage all platform users
            </p>
          </div>

          <div className="hidden sm:block"></div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 rounded-lg"
               style={{ backgroundColor: `${'var(--color-success)'}15`, color: 'var(--color-success)', border: `1px solid ${'var(--color-success)'}30` }}>
            <i className="fas fa-check-circle mr-2"></i> {successMessage}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="p-4 rounded-lg"
               style={{ backgroundColor: `${'var(--color-error)'}10`, color: 'var(--color-error)', border: `1px solid ${'var(--color-error)'}30` }}>
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        {/* Stats cards - Removed verified card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl"
                   style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                👥
              </div>
              <div>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Users</p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl"
                   style={{ backgroundColor: `${'var(--color-accent)'}15`, color: 'var(--color-accent)' }}>
                💎
              </div>
              <div>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Premium</p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{premiumCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Removed verified filter dropdown */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }}></i>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="flex-1 min-w-[120px] px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Memberships</option>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
            </select>
            {/* Removed verified filter dropdown */}
            <select
              value={authTypeFilter}
              onChange={(e) => setAuthTypeFilter(e.target.value)}
              className="flex-1 min-w-[100px] px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Auth Types</option>
              <option value="local">Local</option>
              <option value="google">Google</option>
            </select>
          </div>
        </div>

        {/* Users Table - Removed Verified column */}
        <div className="rounded-xl border overflow-hidden shadow-sm"
             style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="px-4 py-3 text-left font-medium">Avatar</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Auth</th>
                  {/* Removed Verified column header */}
                  <th className="px-4 py-3 text-left font-medium">Membership</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-left font-medium">Last Login</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-primary/5 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-4 py-3">
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=40&bold=true`;
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>{user.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                        {user.authType}
                      </span>
                    </td>
                    {/* Removed Verified column data */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.membership === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.membership}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* Removed verify/unverify button */}
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deletingUserId === user._id}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        style={{ color: 'var(--color-error)' }}
                        title="Permanently Delete"
                      >
                        {deletingUserId === user._id ? (
                          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <i className="fas fa-trash-alt"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p-1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-primary/10 transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Previous
            </button>
            <span className="px-4 py-2" style={{ color: 'var(--color-text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-primary/10 transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;