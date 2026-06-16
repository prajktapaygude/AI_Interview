import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BackButton from '../components/BackButton';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminSubjects = () => {
  const navigate = useNavigate();
  const { token, isSuperAdmin } = useAdmin();
  const [subjects, setSubjects] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [testModalLoading, setTestModalLoading] = useState(false);
  const [generateWithAI, setGenerateWithAI] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'fa-code',
    color: '#3B82F6',
    category: 'technology',
    level: 'Beginner',
    description: '',
    generationConfig: {
      prompt: 'Generate {count} {difficulty} questions about {topic} for {subject}',
      defaultDifficulty: 'medium',
      defaultQuestionCount: 5,
      topics: ''
    }
  });

  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    duration: 30,
    totalQuestions: 10,
    passingScore: 70,
    isActive: true,
    difficulty: 'medium',
    topic: '',
    generateWithAI: true
  });

  // Fetch subjects from API
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch subjects`);
      }
      
      const data = await response.json();
      const subjectsData = Array.isArray(data) ? data : data.subjects || [];
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch tests from API
  const fetchTests = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tests`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch tests`);
      }
      
      const data = await response.json();
      const testsData = Array.isArray(data) ? data : data.tests || [];
      setTests(testsData);
    } catch (err) {
      console.error('Error fetching tests:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSubjects();
      fetchTests();
    }
  }, [token, fetchSubjects, fetchTests]);

  const handleAddSubject = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      icon: 'fa-code',
      color: '#3B82F6',
      category: 'technology',
      level: 'Beginner',
      description: '',
      generationConfig: {
        prompt: 'Generate {count} {difficulty} questions about {topic} for {subject}',
        defaultDifficulty: 'medium',
        defaultQuestionCount: 5,
        topics: ''
      }
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      icon: subject.icon || 'fa-code',
      color: subject.color || '#3B82F6',
      category: subject.category || 'technology',
      level: subject.level || 'Beginner',
      description: subject.description || '',
      generationConfig: subject.generationConfig || {
        prompt: 'Generate {count} {difficulty} questions about {topic} for {subject}',
        defaultDifficulty: 'medium',
        defaultQuestionCount: 5,
        topics: ''
      }
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject? This will also delete all associated tests.')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      
      fetchSubjects();
      fetchTests();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTest = (subject) => {
    setSelectedSubject(subject);
    setTestForm({
      title: `${subject.name} Test`,
      description: `Test your knowledge in ${subject.name}`,
      duration: 30,
      totalQuestions: 10,
      passingScore: 70,
      isActive: true,
      difficulty: 'medium',
      topic: subject.generationConfig?.topics?.split(',')[0] || subject.name,
      generateWithAI: true
    });
    setGenerateWithAI(true);
    setShowTestModal(true);
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    setTestModalLoading(true);
    
    try {
      const testData = {
        ...testForm,
        subjectId: selectedSubject._id,
        subjectName: selectedSubject.name,
        generateWithAI: testForm.generateWithAI,
        count: testForm.totalQuestions
      };
      
      const response = await fetch(`${API_BASE_URL}/admin/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test');
      }
      
      await fetchTests();
      setShowTestModal(false);
      alert('Test created successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setTestModalLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Delete this test? This will also delete all attempts.')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tests/${testId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      
      fetchTests();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitSubject = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    
    const method = editingSubject ? 'PUT' : 'POST';
    const url = editingSubject
      ? `${API_BASE_URL}/admin/subjects/${editingSubject._id}`
      : `${API_BASE_URL}/admin/subjects`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Save failed');
      }
      
      fetchSubjects();
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="sm:justify-self-start">
            <BackButton fallbackPath="/admin-dashboard" />
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
                Subject & Test Management
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span style={{ color: 'var(--color-text-primary)' }}>Manage </span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Subjects & Tests
              </span>
            </h1>
            <p className="text-base sm:text-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Create subjects and manage interactive quizzes for students
            </p>
          </div>
          <div className="hidden sm:block"></div>
        </div>

        {error && (
          <div className="p-4 rounded-lg animate-shake"
               style={{ backgroundColor: `${'var(--color-error)'}10`, color: 'var(--color-error)' }}>
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Total Subjects</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{subjects.length}</p>
              </div>
              <i className="fas fa-book text-3xl opacity-30" style={{ color: 'var(--color-primary)' }}></i>
            </div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Active Tests</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{tests.filter(t => t.isActive).length}</p>
              </div>
              <i className="fas fa-tasks text-3xl opacity-30" style={{ color: 'var(--color-secondary)' }}></i>
            </div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Total Tests</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{tests.length}</p>
              </div>
              <i className="fas fa-chart-line text-3xl opacity-30" style={{ color: 'var(--color-accent)' }}></i>
            </div>
          </div>
        </div>

        {/* Search & Add */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }}></i>
          </div>
          <button
            onClick={handleAddSubject}
            className="w-full sm:w-auto px-6 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
          >
            <i className="fas fa-plus"></i> Add Subject
          </button>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => {
            const subjectTests = tests.filter(t => {
  const id = t.subjectId?._id || t.subjectId;
  return id?.toString() === subject._id?.toString();
});
            return (
              <div
                key={subject._id}
                className="p-6 rounded-xl border hover:shadow-xl transition-all group"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                         style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                      <i className={subject.icon}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{subject.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{subject.category} • {subject.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubject(subject)}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject._id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      style={{ color: 'var(--color-error)' }}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{subject.description}</p>
                
                {/* Tests Section */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                      <i className="fas fa-tasks text-xs"></i>
                      Tests ({subjectTests.length})
                    </h4>
                    <button
                      onClick={() => handleCreateTest(subject)}
                      className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <i className="fas fa-plus mr-1"></i> Create Test
                    </button>
                  </div>
                  
                  {subjectTests.length > 0 ? (
                    <div className="space-y-2">
                      {subjectTests.map(test => (
                        <div key={test._id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{test.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${test.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}`}>
                                  {test.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex gap-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <span><i className="far fa-clock mr-1"></i>{test.duration} min</span>
                                <span><i className="fas fa-question-circle mr-1"></i>{test.totalQuestions} questions</span>
                                <span><i className="fas fa-chart-line mr-1"></i>Pass: {test.passingScore}%</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {/* Take Test Button - Admin Preview */}
                              <button
                                onClick={() => navigate(`/admin/tests/${test._id}/take`)}
                                className="p-1.5 rounded hover:bg-blue-500/10"
                                title="Take Test (Admin Preview)"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                <i className="fas fa-play text-xs"></i>
                              </button>
                              {/* View Details Button */}
                              <button
                                onClick={() => navigate(`/admin/tests/${test._id}/details`)}
                                className="p-1.5 rounded hover:bg-green-500/10"
                                title="View Test Details"
                                style={{ color: 'var(--color-secondary)' }}
                              >
                                <i className="fas fa-eye text-xs"></i>
                              </button>
                              {/* Analytics Button */}
                              <button
                                onClick={() => navigate(`/admin/tests/${test._id}/analytics`)}
                                className="p-1.5 rounded hover:bg-purple-500/10"
                                title="View Analytics"
                                style={{ color: 'var(--color-accent)' }}
                              >
                                <i className="fas fa-chart-bar text-xs"></i>
                              </button>
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteTest(test._id)}
                                className="p-1.5 rounded hover:bg-red-50"
                                style={{ color: 'var(--color-error)' }}
                                title="Delete Test"
                              >
                                <i className="fas fa-trash text-xs"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 rounded-lg border border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                      <i className="fas fa-flask text-2xl opacity-30 mb-2 block"></i>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>No tests created yet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add/Edit Subject Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
            <div className="max-w-2xl w-full rounded-2xl shadow-2xl border p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
                 style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                 onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {editingSubject ? 'Edit Subject' : 'Add Subject'}
              </h3>
              
              <div className="flex border-b mb-4" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-3 sm:px-4 py-2 font-medium text-sm ${activeTab === 'basic' ? 'border-b-2' : ''}`}
                  style={{ 
                    color: activeTab === 'basic' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    borderColor: 'var(--color-primary)'
                  }}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-3 sm:px-4 py-2 font-medium text-sm ${activeTab === 'config' ? 'border-b-2' : ''}`}
                  style={{ 
                    color: activeTab === 'config' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    borderColor: 'var(--color-primary)'
                  }}
                >
                  AI Generation Config
                </button>
              </div>

              <form onSubmit={handleSubmitSubject} className="space-y-4">
                {activeTab === 'basic' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Icon (Font Awesome)</label>
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({...formData, icon: e.target.value})}
                          placeholder="fab fa-js"
                          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                          style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Color</label>
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({...formData, color: e.target.value})}
                          className="w-full h-10 rounded-lg border"
                          style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                          style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        >
                          <option value="technology">Technology / IT</option>
                          <option value="business">Business & Management</option>
                          <option value="science">Science & Research</option>
                          <option value="humanities">Social Sciences & Humanities</option>
                          <option value="professional">Professional Skills</option>
                          <option value="other">Other Domains</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Level</label>
                        <select
                          value={formData.level}
                          onChange={(e) => setFormData({...formData, level: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                          style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows="2"
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        required
                      />
                    </div>
                  </>
                )}

                {activeTab === 'config' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        Prompt Template
                      </label>
                      <textarea
                        value={formData.generationConfig.prompt}
                        onChange={(e) => setFormData({
                          ...formData,
                          generationConfig: { ...formData.generationConfig, prompt: e.target.value }
                        })}
                        rows="3"
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Default Difficulty</label>
                        <select
                          value={formData.generationConfig.defaultDifficulty}
                          onChange={(e) => setFormData({
                            ...formData,
                            generationConfig: { ...formData.generationConfig, defaultDifficulty: e.target.value }
                          })}
                          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                          style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Default Question Count</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.generationConfig.defaultQuestionCount}
                          onChange={(e) => setFormData({
                            ...formData,
                            generationConfig: { ...formData.generationConfig, defaultQuestionCount: parseInt(e.target.value) }
                          })}
                          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                          style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        Topics (comma‑separated)
                      </label>
                      <input
                        type="text"
                        value={formData.generationConfig.topics}
                        onChange={(e) => setFormData({
                          ...formData,
                          generationConfig: { ...formData.generationConfig, topics: e.target.value }
                        })}
                        placeholder="closures, promises, scope"
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 rounded-lg border hover:bg-primary/5 transition-colors"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                    disabled={modalLoading}
                  >
                    {modalLoading ? <i className="fas fa-spinner fa-spin"></i> : (editingSubject ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Test Modal */}
        {showTestModal && selectedSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTestModal(false)}>
            <div className="max-w-lg w-full rounded-2xl shadow-2xl border p-6"
                 style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                 onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Create Test for {selectedSubject.name}
              </h3>
              
              <form onSubmit={handleSubmitTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Test Title</label>
                  <input
                    type="text"
                    value={testForm.title}
                    onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Description</label>
                  <textarea
                    value={testForm.description}
                    onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Topic</label>
                  <input
                    type="text"
                    value={testForm.topic}
                    onChange={(e) => setTestForm({...testForm, topic: e.target.value})}
                    placeholder="e.g., React Hooks, JavaScript Promises"
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Duration (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={testForm.duration}
                      onChange={(e) => setTestForm({...testForm, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Total Questions</label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={testForm.totalQuestions}
                      onChange={(e) => setTestForm({...testForm, totalQuestions: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Passing Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={testForm.passingScore}
                      onChange={(e) => setTestForm({...testForm, passingScore: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Difficulty</label>
                    <select
                      value={testForm.difficulty}
                      onChange={(e) => setTestForm({...testForm, difficulty: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={testForm.generateWithAI}
                    onChange={(e) => setTestForm({...testForm, generateWithAI: e.target.checked})}
                    className="w-4 h-4"
                    id="generateWithAI"
                  />
                  <label htmlFor="generateWithAI" className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Generate questions with AI
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={testForm.isActive}
                    onChange={(e) => setTestForm({...testForm, isActive: e.target.checked})}
                    className="w-4 h-4"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Active (visible to students)
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTestModal(false)}
                    className="flex-1 py-2 rounded-lg border hover:bg-primary/5 transition-colors"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                    disabled={testModalLoading}
                  >
                    {testModalLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Create Test'}
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

export default AdminSubjects;