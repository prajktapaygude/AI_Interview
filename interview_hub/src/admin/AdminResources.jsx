import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BackButton from '../components/BackButton';
import AccessDenied from './AccessDenied';
import io from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminResources = () => {
  const navigate = useNavigate();
  const { token, isSuperAdmin, admin } = useAdmin();

  if (!isSuperAdmin) return <AccessDenied />;

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, categories: {}, types: {} });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResources, setTotalResources] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    url: '',
    category: 'technology',
    type: 'article',
    description: '',
    difficulty: 'Beginner',
    tags: [],
    duration: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const searchRef = useRef('');
  const socketRef = useRef(null);

  const itemsPerPage = 12;
  const categories = ['technology', 'business', 'science', 'humanities', 'professional', 'other', 'frontend', 'backend', 'system-design', 'behavioral', 'dsa'];
  const types = ['article', 'video', 'book', 'course', 'practice'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const fetchResources = useCallback(async (pageNum = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: itemsPerPage,
        search,
        category: categoryFilter,
        type: typeFilter,
        difficulty: difficultyFilter,
        date: dateFilter                
      });

      const response = await fetch(`${API_BASE_URL}/admin/resources?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("SERVER ERROR:", text);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      const data = await response.json();
      setResources(data.resources || []);
      setTotalPages(data.totalPages || 1);
      setTotalResources(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, categoryFilter, typeFilter, difficultyFilter, dateFilter, token]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const allResources = data.resources || [];
      setStats({
        total: data.total || 0,
        categories: allResources.reduce((acc, r) => {
          acc[r.category] = (acc[r.category] || 0) + 1;
          return acc;
        }, {}),
        types: allResources.reduce((acc, r) => {
          acc[r.type] = (acc[r.type] || 0) + 1;
          return acc;
        }, {})
      });
    } catch (err) {
      console.error('Stats fetch failed:', err);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchRef.current !== search) {
        searchRef.current = search;
        setCurrentPage(1);
        fetchResources(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, categoryFilter, typeFilter, difficultyFilter, dateFilter, fetchResources]);

  useEffect(() => {
    fetchStats();
    fetchResources();
  }, [currentPage, categoryFilter, typeFilter, difficultyFilter, dateFilter, fetchResources, fetchStats]);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    });

    socketRef.current.on('resourceUpdated', () => {
      fetchResources(currentPage);
      fetchStats();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, currentPage, fetchResources, fetchStats]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.author.trim()) errors.author = 'Author is required';
    if (!formData.url.trim()) errors.url = 'URL is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.type) errors.type = 'Type is required';
    
    // Validate URL format
    if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
      errors.url = 'Please enter a valid URL (starting with http:// or https://)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEdit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setModalLoading(true);
    setError(null);

    const method = editingResource ? 'PUT' : 'POST';
    const url = editingResource
      ? `${API_BASE_URL}/admin/resources/${editingResource._id}`
      : `${API_BASE_URL}/admin/resources`;

    // Prepare tags array
    let tagsArray = [];
    if (typeof formData.tags === 'string') {
      tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(formData.tags)) {
      tagsArray = formData.tags;
    }

    // Prepare the data for submission
    const submitData = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      url: formData.url.trim(),
      category: formData.category,
      type: formData.type,
      description: formData.description?.trim() || '',
      difficulty: formData.difficulty || 'Beginner',
      duration: formData.duration?.trim() || '',
      tags: tagsArray
    };

    // Add createdBy field for new resources
    if (!editingResource) {
      if (admin && (admin._id || admin.id)) {
        submitData.createdBy = admin._id || admin.id;
      } else {
        console.error('Admin ID not found in context:', admin);
        setError('Admin ID not found. Please log out and log in again.');
        setModalLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Server response error:', errText);
        
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorJson = JSON.parse(errText);
          errorMessage = errorJson.error || errorJson.message || errText;
        } catch {
          errorMessage = errText;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      setShowModal(false);
      setEditingResource(null);
      setFormData({
        title: '',
        author: '',
        url: '',
        category: 'technology',
        type: 'article',
        description: '',
        difficulty: 'Beginner',
        tags: [],
        duration: ''
      });
      setFormErrors({});
      
      await fetchResources(1);
      await fetchStats();
      
    } catch (err) {
      console.error('Error saving resource:', err);
      setError(`Failed to save resource: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const openCreate = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      author: '',
      url: '',
      category: 'technology',
      type: 'article',
      description: '',
      difficulty: 'Beginner',
      tags: [],
      duration: ''
    });
    setFormErrors({});
    setShowModal(true);
    setError(null);
  };

  const openEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title || '',
      author: resource.author || '',
      url: resource.url || '',
      category: resource.category || 'technology',
      type: resource.type || 'article',
      description: resource.description || '',
      difficulty: resource.difficulty || 'Beginner',
      tags: resource.tags ? (Array.isArray(resource.tags) ? resource.tags.join(', ') : resource.tags) : '',
      duration: resource.duration || ''
    });
    setFormErrors({});
    setShowModal(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Delete failed: ${response.status} - ${errText}`);
      }

      await fetchResources(currentPage);
      await fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && resources.length === 0) return <LoadingSpinner />;

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
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Resources</span>
            </h1>
            <p className="text-lg mt-2 opacity-80">Manage learning materials ({totalResources})</p>
          </div>
          <button 
            onClick={openCreate}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all ml-auto whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i>Add Resource
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#dc2626' }}>
            <i className="fas fa-exclamation-triangle mr-2"></i>{error}
          </div>
        )}

        {/* Search & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources by title, author, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}></i>
            </div>
          </div>
          <div className="flex gap-3">
            <select 
              value={categoryFilter} 
              onChange={(e) => {setCategoryFilter(e.target.value); setCurrentPage(1);}} 
              className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <select 
              value={typeFilter} 
              onChange={(e) => {setTypeFilter(e.target.value); setCurrentPage(1);}} 
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Types</option>
              {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <select 
              value={dateFilter} 
              onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}} 
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-sm font-medium mb-2 opacity-80">Total Resources</h3>
            <p className="text-3xl font-bold">{totalResources.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-sm font-medium mb-2 opacity-80">Articles</h3>
            <p className="text-3xl font-bold">{stats.types?.article || 0}</p>
          </div>
          <div className="p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all" 
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎥</span>
            </div>
            <h3 className="text-sm font-medium mb-2 opacity-80">Videos</h3>
            <p className="text-3xl font-bold">{stats.types?.video || 0}</p>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource._id} className="group p-6 rounded-2xl border hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer" 
                 style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm" 
                       style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
                    {resource.type?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                      {resource.title}
                    </h3>
                    <p className="text-sm opacity-75">by {resource.author}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                  <button 
                    onClick={() => openEdit(resource)}
                    className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                    title="Edit"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <i className="fas fa-edit text-sm"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(resource._id)}
                    className="p-2 rounded-lg hover:bg-error/10 transition-colors"
                    title="Delete"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <i className="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>
              <p className="text-sm mb-4 line-clamp-3 opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
                {resource.description}
              </p>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {resource.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent">
                  {resource.type}
                </span>
                {resource.difficulty && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    {resource.difficulty}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                <a href={resource.url} target="_blank" rel="noopener noreferrer" 
                   className="text-sm font-medium hover:underline flex items-center gap-1 text-primary"
                   style={{ color: 'var(--color-primary)' }}
                >
                  <i className="fas fa-external-link-alt"></i>Open
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/5 transition-all"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Previous
            </button>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/5 transition-all"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Next
            </button>
          </div>
        )}

        {resources.length === 0 && !loading && (
          <div className="text-center py-20">
            <i className="fas fa-inbox text-6xl text-muted mb-6" style={{ color: 'var(--color-text-muted)' }}></i>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>No resources yet</h3>
            <p className="mb-6 opacity-75" style={{ color: 'var(--color-text-secondary)' }}>
              {search || categoryFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting filters' : 'Create your first resource'}
            </p>
            <button 
              onClick={openCreate}
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              <i className="fas fa-plus mr-2"></i>Add First Resource
            </button>
          </div>
        )}

        {/* Unified Create/Edit Modal - Single Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
                 style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
                 onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b sticky top-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {editingResource ? 'Edit Resource' : 'Create New Resource'}
                </h2>
                <p className="text-sm opacity-75" style={{ color: 'var(--color-text-secondary)' }}>
                  {editingResource ? 'Update resource details' : 'Add new learning material'}
                </p>
              </div>

              <form onSubmit={handleCreateEdit} className="p-6 space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                    <i className="fas fa-info-circle text-primary"></i>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all ${formErrors.title ? 'border-red-500' : ''}`}
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: formErrors.title ? '#ef4444' : 'var(--color-border)', color: 'var(--color-text-primary)' }} 
                        placeholder="Enter resource title"
                      />
                      {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Author <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.author} 
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all ${formErrors.author ? 'border-red-500' : ''}`}
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: formErrors.author ? '#ef4444' : 'var(--color-border)', color: 'var(--color-text-primary)' }} 
                        placeholder="Author name"
                      />
                      {formErrors.author && <p className="text-xs text-red-500 mt-1">{formErrors.author}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        URL <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="url" 
                        required
                        value={formData.url} 
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all ${formErrors.url ? 'border-red-500' : ''}`}
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: formErrors.url ? '#ef4444' : 'var(--color-border)', color: 'var(--color-text-primary)' }} 
                        placeholder="https://example.com/resource"
                      />
                      {formErrors.url && <p className="text-xs text-red-500 mt-1">{formErrors.url}</p>}
                    </div>
                  </div>
                </div>

                {/* Classification Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                    <i className="fas fa-tags text-secondary"></i>
                    Classification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        value={formData.category} 
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        value={formData.type} 
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      >
                        {types.map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Difficulty Level
                      </label>
                      <select 
                        value={formData.difficulty} 
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      >
                        {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Duration
                      </label>
                      <input 
                        type="text" 
                        value={formData.duration} 
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="e.g., 2 hours, 30 pages"
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description & Tags Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                    <i className="fas fa-align-left text-accent"></i>
                    Description & Metadata
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Description
                      </label>
                      <textarea 
                        rows="4"
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all resize-vertical"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        placeholder="Provide a detailed description of the resource..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Tags (comma separated)
                      </label>
                      <input 
                        type="text" 
                        value={typeof formData.tags === 'string' ? formData.tags : formData.tags.join(', ')} 
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="javascript, react, beginner, web-development"
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/30 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      />
                      <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
                        Separate tags with commas for better organization
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    disabled={modalLoading}
                    className="flex-1 py-3 px-4 rounded-xl border font-medium transition-all hover:bg-bg-hover"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={modalLoading}
                    className="flex-1 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                  >
                    {modalLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        {editingResource ? 'Update Resource' : 'Create Resource'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminResources;