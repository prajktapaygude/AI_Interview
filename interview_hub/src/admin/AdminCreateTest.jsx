import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BackButton from '../components/BackButton';
import BASE_URL from '../config';
import BASE_URL from "../config"

const API_BASE_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

const AdminCreateTest = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { token, admin } = useAdmin();
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [subject, setSubject] = useState(null);
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    subjectId: subjectId || '',
    subjectName: '',
    topic: '',
    duration: 30,
    totalQuestions: 10,
    passingScore: 70,
    difficulty: 'medium',
    isActive: true,
    generateWithAI: true
  });
  
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  const fetchSubject = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects/${subjectId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch subject`);
      }
      
      const data = await response.json();
      setSubject(data);
      setTestForm(prev => ({
        ...prev,
        subjectName: data.name,
        topic: data.generationConfig?.topics?.split(',')[0] || ''
      }));
    } catch (err) {
      console.error('Error fetching subject:', err);
      setError(err.message);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!testForm.topic) {
      setError('Please enter a topic to generate questions');
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/generate-questions-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: testForm.subjectName,
          topic: testForm.topic,
          difficulty: testForm.difficulty,
          count: testForm.totalQuestions
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedQuestions(data.questions);
        setShowPreview(true);
      } else {
        setError(data.error || 'Failed to generate questions');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!testForm.title.trim()) {
      setError('Please enter a test title');
      return;
    }
    
    if (!testForm.subjectName && !testForm.subjectId) {
      setError('Subject is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const requestBody = {
        ...testForm,
        generateWithAI: testForm.generateWithAI
      };
      
      if (testForm.generateWithAI) {
        requestBody.questions = generatedQuestions;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create test');
      }
      
      const data = await response.json();
      alert('Test created successfully!');
      navigate(`/admin/subjects/${subjectId || testForm.subjectId}`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !testForm.title) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <BackButton fallbackPath={`/admin/subjects${subjectId ? `/${subjectId}` : ''}`} />
        </div>
        
        <div className="rounded-2xl border p-8" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Create New Test
          </h1>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {subject ? `Creating test for: ${subject.name}` : 'Configure your test parameters'}
          </p>
          
          {error && (
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
          
          // Add the missing form fields between the existing form sections
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Basic Information */}
  <div>
    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Test Title *</label>
        <input
          type="text"
          value={testForm.title}
          onChange={(e) => setTestForm({...testForm, title: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={testForm.description}
          onChange={(e) => setTestForm({...testForm, description: e.target.value})}
          rows="3"
          className="w-full px-4 py-3 rounded-xl border"
        />
      </div>
    </div>
  </div>
  
  {/* AI Generation Settings */}
  <div>
    <h3 className="text-lg font-semibold mb-4">AI Question Generation</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Topic/Skill</label>
        <input
          type="text"
          value={testForm.topic}
          onChange={(e) => setTestForm({...testForm, topic: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border"
          placeholder="e.g., Closures, Promises, Async/Await"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Difficulty Level</label>
        <select
          value={testForm.difficulty}
          onChange={(e) => setTestForm({...testForm, difficulty: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Number of Questions</label>
        <input
          type="number"
          min="5"
          max="50"
          value={testForm.totalQuestions}
          onChange={(e) => setTestForm({...testForm, totalQuestions: parseInt(e.target.value)})}
          className="w-full px-4 py-3 rounded-xl border"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
        <input
          type="number"
          min="5"
          max="180"
          value={testForm.duration}
          onChange={(e) => setTestForm({...testForm, duration: parseInt(e.target.value)})}
          className="w-full px-4 py-3 rounded-xl border"
        />
      </div>
    </div>
    
    <div className="mt-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={testForm.generateWithAI}
          onChange={(e) => setTestForm({...testForm, generateWithAI: e.target.checked})}
          className="w-4 h-4"
        />
        <span className="text-sm">Generate questions using AI</span>
      </label>
    </div>
    
    {testForm.generateWithAI && (
      <button
        type="button"
        onClick={handleGenerateQuestions}
        disabled={generating}
        className="mt-4 px-6 py-2 rounded-lg text-white font-medium"
        style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
      >
        {generating ? 'Generating...' : 'Generate Questions Preview'}
      </button>
    )}
  </div>
  
  {/* Test Settings */}
  <div>
    <h3 className="text-lg font-semibold mb-4">Test Settings</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={testForm.passingScore}
          onChange={(e) => setTestForm({...testForm, passingScore: parseInt(e.target.value)})}
          className="w-full px-4 py-3 rounded-xl border"
        />
      </div>
      <div className="flex items-center mt-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={testForm.isActive}
            onChange={(e) => setTestForm({...testForm, isActive: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm">Make test active (visible to students)</span>
        </label>
      </div>
    </div>
  </div>
  
  {/* Form Actions */}
  <div className="flex gap-3 pt-6 border-t">
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="flex-1 py-3 rounded-xl border font-medium"
      disabled={loading}
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading}
      className="flex-1 py-3 rounded-xl text-white font-semibold"
      style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
    >
      {loading ? 'Creating...' : 'Create Test'}
    </button>
  </div>
</form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateTest;