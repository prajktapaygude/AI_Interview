import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BackButton from '../components/BackButton';
import AccessDenied from './AccessDenied';
import io from 'socket.io-client';
import BASE_URL from "../config"

const API_BASE_URL = `${BASE_URL}/api`;

const AdminAdmins = () => {
  const navigate = useNavigate();
  const { token, isSuperAdmin } = useAdmin();

  if (!isSuperAdmin) return <AccessDenied />;

  // Data states
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  // Filter/Pagination states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showModal, setShowModal] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [modalLoading, setModalLoading] = useState(false);

  const socketRef = useRef(null);

  // Fetch admins with filters/pagination
  const fetchAdmins = useCallback(async (pageNum = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: itemsPerPage,
        search,
        role: roleFilter === 'all' ? '' : roleFilter,
        active: activeFilter === 'all' ? '' : activeFilter
      });

      const response = await fetch(`${API_BASE_URL}/admin/admins?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch admins');

      const data = await response.json();
      setAdmins(data.admins || []);
      
      // Calculate stats
      const total = data.total || 0;
      const activeCount = data.admins?.filter(a => a.is_active !== false).length || 0;
      setStats({ total, active: activeCount });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, roleFilter, activeFilter, token]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/admins?page=1&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const total = data.total || 0;
      setStats(prev => ({ ...prev, total }));
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, [token]);

  // Effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchAdmins(1);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search, roleFilter, activeFilter, fetchAdmins]);

  useEffect(() => {
    fetchStats();
    fetchAdmins();
  }, [fetchStats, fetchAdmins]);

  // Socket for real-time updates
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(API_BASE_URL.replace('/api', ''), {
      auth: { token }
    });

    socketRef.current.on('adminToggled', ({ adminId, is_active }) => {
      setAdmins(prev =>
        prev.map(a =>
          a._id === adminId ? { ...a, is_active } : a
        )
      );
    });

    socketRef.current.on('adminUpdated', () => {
      fetchAdmins();
    });

    return () => socketRef.current?.disconnect();
  }, [token, fetchAdmins]);

  // Toggle active (existing functionality)
  const handleToggleActive = async (adminId, currentActive) => {
    const confirmMsg = currentActive ? 'Deactivate this admin?' : 'Reactivate this admin?';
    if (!window.confirm(confirmMsg)) return;

    const newStatus = !currentActive;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (!response.ok) throw new Error('Update failed');
      
      // Optimistic UI update
      setAdmins(prev =>
        prev.map(a =>
          a._id === adminId ? { ...a, is_active: newStatus } : a
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Modal handlers
  const openCreate = () => {
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', role: 'admin' });
    setShowModal(true);
  };

  const openEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      role: admin.role || 'admin'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    const method = editingAdmin ? 'PUT' : 'POST';
    const url = editingAdmin
      ? `${API_BASE_URL}/admin/admins/${editingAdmin._id}`
      : `${API_BASE_URL}/admin/admins`;

    const submitData = {
      ...formData,
      email: formData.email.trim().toLowerCase()
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Operation failed');
      }

      setShowModal(false);
      setEditingAdmin(null);
      setFormData({ name: '', email: '', password: '', role: 'admin' });
      fetchAdmins(1);
    } catch (err) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Delete failed');
      
      fetchAdmins(currentPage);
    } catch (err) {
      alert(err.message);
    }
  };

  // Client-side filtering for current page (backend handles server-side)
  const filteredAdmins = admins;
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && admins.length === 0) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <BackButton fallbackPath="/admin-dashboard" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span style={{ color: 'var(--color-text-primary)' }}>Admin </span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-lg mt-2 opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
              Manage platform administrators ({stats.total})
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all ml-auto whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            <i className="fas fa-plus mr-2"></i>Add Admin
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-error-bg)', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
            <i className="fas fa-exclamation-triangle mr-2"></i>{error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">👑</span>
            </div>
            <h3 className="text-sm font-medium mb-2 opacity-80" style={{ color: 'var(--color-text-secondary)' }}>Total Admins</h3>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.total.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-sm font-medium mb-2 opacity-80" style={{ color: 'var(--color-text-secondary)' }}>Active Admins</h3>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.active}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-secondary)' }}></i>
                <input
                  type="text"
                  placeholder="Search admins by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <button className="p-3 rounded-xl border flex items-center gap-2 hover:bg-[var(--color-bg-primary)]/70 transition-all flex-shrink-0" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <i className="fas fa-filter text-sm"></i>
                Filters
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <select 
              value={roleFilter} 
              onChange={(e) => {setRoleFilter(e.target.value); setCurrentPage(1);}} 
              className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
            <select 
              value={activeFilter} 
              onChange={(e) => {setActiveFilter(e.target.value); setCurrentPage(1);}} 
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Modern Grid Table */}
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
          <div className="overflow-x-auto">
            {/* Sticky Header */}
            {/* Sticky Header */}
<div
  className="grid grid-cols-[40px_200px_250px_150px_120px_140px_120px] text-xs font-semibold uppercase tracking-wider sticky top-0 z-10 px-6 py-4 border-b"
  style={{
    backgroundColor: 'var(--color-bg-secondary)',
    borderColor: 'var(--color-border)'
  }}
>
  <div></div>
  <div style={{ color: 'var(--color-text-secondary)' }}>
    Name <i className="fas fa-sort ml-1 opacity-50"></i>
  </div>
  <div style={{ color: 'var(--color-text-secondary)' }}>Email</div>
  <div style={{ color: 'var(--color-text-secondary)' }}>
    Role <i className="fas fa-sort ml-1 opacity-50"></i>
  </div>
  <div style={{ color: 'var(--color-text-secondary)' }}>Status</div>
  <div style={{ color: 'var(--color-text-secondary)' }}>
    Created <i className="fas fa-sort ml-1 opacity-50"></i>
  </div>
  <div style={{ color: 'var(--color-text-secondary)' }}>Actions</div>
</div>
            
            {/* Grid Rows */}
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {paginatedAdmins.map((admin) => (
                  <div 
                  key={admin._id}
                  className="grid grid-cols-[40px_200px_250px_150px_120px_140px_120px_120px] p-4 items-center hover:bg-[var(--color-bg-primary)]/70 rounded-xl transition-all gap-3 overflow-hidden"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br from-primary to-secondary text-white shadow-md flex-shrink-0">
                    {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  {/* Name */}
                  <div className="flex items-center gap-3 font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--color-text-primary)' }}>
                    {admin.name}
                  </div>
                  {/* Email */}
                  <div className="font-mono text-sm truncate pr-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-full" style={{ color: 'var(--color-text-primary)' }}>
                    {admin.email}
                  </div>
                  {/* Role badge */}
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.role === 'superadmin' 
                        ? 'bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20'
                    }`}>
                      {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                  {/* Status badge */}
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.is_active !== false
                        ? 'bg-green-500/10 text-green-600 ring-1 ring-green-500/20'
                        : 'bg-red-500/10 text-red-600 ring-1 ring-red-500/20'
                    }`}>
                      {admin.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {/* Created date */}
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'short', day: 'numeric' 
                    }) : '—'}
                  </div>
  {/* Actions - Inline buttons */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(admin._id, admin.is_active !== false);
                      }}
                      className="p-2.5 rounded-lg hover:bg-primary/20 hover:shadow-sm hover:ring-1 hover:ring-primary/30 transition-all flex items-center justify-center border border-transparent hover:border-primary/30"
                      style={{ color: '#10b981 !important' }}
                      title={admin.is_active !== false ? 'Deactivate' : 'Reactivate'}
                    >
                      <i className="fas fa-power-off text-base"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(admin);
                      }}
                      className="p-2.5 rounded-lg hover:bg-blue/20 hover:shadow-sm hover:ring-1 hover:ring-blue/30 transition-all flex items-center justify-center border border-transparent hover:border-blue/30"
                      style={{ color: '#3b82f6 !important' }}
                      title="Edit"
                    >
                      <i className="fas fa-edit text-base"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(admin._id);
                      }}
                      className="p-2.5 rounded-lg hover:bg-red/20 hover:shadow-sm hover:ring-1 hover:ring-red/30 transition-all flex items-center justify-center border border-transparent hover:border-red/30"
                      style={{ color: '#ef4444 !important' }}
                      title="Delete"
                    >
                      <i className="fas fa-trash text-base"></i>
                    </button>
                  </div>
                </div>
              ))}
              {paginatedAdmins.length === 0 && !loading && (
                <div className="col-span-full p-12 text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
                  <i className="fas fa-users text-4xl mb-4 opacity-50" style={{ color: 'var(--color-text-secondary)' }}></i>
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No admins found</h3>
                    <p className="text-sm opacity-75">{search || roleFilter !== 'all' || activeFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by adding your first admin.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between flex-wrap gap-2 bg-[var(--color-bg-primary)]/50" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length} admins
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  style={{ color: currentPage === 1 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all hover:shadow-md hover:scale-[1.02] ring-1 ${
                          page === currentPage 
                            ? 'bg-primary text-white shadow-lg ring-2 ring-primary/30' 
                            : 'hover:bg-primary/10'
                        }`}
                        style={{ 
                          backgroundColor: page === currentPage ? 'var(--color-primary)' : 'transparent',
                          color: page === currentPage ? 'white' : 'var(--color-text-primary)',
                          borderColor: 'var(--color-border)'
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  style={{ color: currentPage === totalPages ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-2xl border p-6" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
               onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
              {!editingAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border font-medium transition-colors hover:bg-primary/5"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                  disabled={modalLoading}
                >
                  {modalLoading ? <i className="fas fa-spinner fa-spin"></i> : ''}
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default AdminAdmins;
