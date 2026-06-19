import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BASE_URL from '../config';

// ==================== MOCK MODE ====================
const USE_MOCK = false;

// Mock data – exactly matches your list
const MOCK_CATEGORIES = [
  {
    id: "business",
    name: "Business & Management",
    roles: [
      { id: "accounting", name: "Accounting", techStacks: ["Financial Accounting", "Managerial Accounting", "Auditing", "Taxation"] },
      { id: "finance", name: "Finance", techStacks: ["Corporate Finance", "Investment Banking", "Financial Modeling", "Risk Management"] },
      { id: "hr", name: "Human Resources", techStacks: ["Recruitment", "Employee Relations", "HRIS", "Compensation & Benefits"] },
      { id: "marketing", name: "Marketing", techStacks: ["Digital Marketing", "SEO", "Content Marketing", "Social Media"] },
      { id: "project-management", name: "Project Management", techStacks: ["Agile", "Scrum", "PMP", "Jira"] },
      { id: "operations", name: "Operations Management", techStacks: ["Supply Chain", "Logistics", "Process Optimization"] }
    ]
  },
  {
    id: "science",
    name: "Science & Research",
    roles: [
      { id: "physics", name: "Physics", techStacks: ["Classical Mechanics", "Quantum Mechanics", "Thermodynamics", "Electromagnetism"] },
      { id: "chemistry", name: "Chemistry", techStacks: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry"] },
      { id: "biology", name: "Biology", techStacks: ["Cell Biology", "Genetics", "Ecology", "Molecular Biology"] },
      { id: "environmental-science", name: "Environmental Science", techStacks: ["Ecology", "Climate Science", "Sustainability"] }
    ]
  },
  {
    id: "humanities",
    name: "Social Sciences & Humanities",
    roles: [
      { id: "psychology", name: "Psychology", techStacks: ["Clinical Psychology", "Cognitive Psychology", "Developmental Psychology"] },
      { id: "sociology", name: "Sociology", techStacks: ["Social Theory", "Research Methods", "Demography"] },
      { id: "history", name: "History", techStacks: ["Ancient History", "Modern History", "Historiography"] },
      { id: "political-science", name: "Political Science", techStacks: ["Comparative Politics", "International Relations", "Political Theory"] }
    ]
  },
  {
    id: "professional",
    name: "Professional Skills",
    roles: [
      { id: "communication", name: "Communication Skills", techStacks: ["Public Speaking", "Business Writing", "Interpersonal Communication"] },
      { id: "leadership", name: "Leadership", techStacks: ["Team Management", "Strategic Planning", "Conflict Resolution"] },
      { id: "critical-thinking", name: "Critical Thinking", techStacks: ["Problem Solving", "Decision Making", "Analytical Thinking"] },
      { id: "data-analysis", name: "Data Analysis", techStacks: ["Excel", "SQL", "Python", "Tableau", "Power BI"] },
      { id: "entrepreneurship", name: "Entrepreneurship", techStacks: ["Business Planning", "Venture Capital", "Startup Operations"] }
    ]
  },
  {
    id: "other",
    name: "Other Domains",
    roles: [
      { id: "law", name: "Law & Ethics", techStacks: ["Contract Law", "Legal Research", "Ethics"] },
      { id: "education", name: "Education / Teaching", techStacks: ["Curriculum Design", "Classroom Management", "Educational Technology"] },
      { id: "healthcare", name: "Healthcare / Nursing", techStacks: ["Patient Care", "Medical Terminology", "Nursing Procedures"] },
      { id: "retail", name: "Retail / Customer Service", techStacks: ["Customer Experience", "Inventory Management", "Sales Techniques"] }
    ]
  },
  {
    id: "technology",
    name: "Technology / IT",
    roles: [
      {
        id: "programming-languages",
        name: "Programming Languages",
        techStacks: ["Java", "Python", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "TypeScript"]
      },
      {
        id: "web-dev",
        name: "Web Development / Frameworks",
        techStacks: ["HTML/CSS", "JavaScript", "React", "Angular", "Spring Boot"]
      },
      {
        id: "databases",
        name: "Databases",
        techStacks: ["MySQL", "PostgreSQL", "MongoDB", "Redis"]
      },
      {
        id: "devops",
        name: "DevOps / Cloud",
        techStacks: ["Docker", "Kubernetes", "AWS", "Azure", "GCP"]
      },
      {
        id: "ai-ml",
        name: "AI / Data Science",
        techStacks: ["Machine Learning", "Deep Learning", "Data Science", "NLP", "Computer Vision"]
      },
      {
        id: "cybersecurity",
        name: "Cybersecurity",
        techStacks: ["Network Security", "Ethical Hacking", "Information Security"]
      },
      {
        id: "blockchain",
        name: "Blockchain & Emerging Tech",
        techStacks: ["Blockchain Basics", "Smart Contracts"]
      }
    ]
  }
];

const MOCK_LEVELS = [
  { id: "fresher", label: "Fresher", icon: "🌱", description: "0-1 years" },
  { id: "junior", label: "Junior", icon: "🌿", description: "1-3 years" },
  { id: "mid", label: "Mid-Level", icon: "🌳", description: "3-5 years" },
  { id: "senior", label: "Senior", icon: "👑", description: "5+ years" }
];

const MOCK_DIFFICULTIES = [
  { id: "easy", label: "Easy", icon: "😊" },
  { id: "medium", label: "Medium", icon: "😐" },
  { id: "hard", label: "Hard", icon: "😰" }
];

const MOCK_DURATIONS = [
  { value: "5", label: "5 min", icon: "⚡" },
  { value: "10", label: "10 min", icon: "⏱️" },
  { value: "15", label: "15 min", icon: "⏲️" },
  { value: "20", label: "20 min", icon: "⌛" },
  { value: "30", label: "30 min", icon: "⏳" }
];

const MOCK_PROMPTS = {
  default: "Generate {count} {difficulty} interview questions for a {level} {role} position with expertise in {techStack}. Include the question, four options, the correct answer index, and a brief explanation.",
  evaluationCriteria: {
    weights: { technical: 50, clarity: 30, confidence: 20 }
  }
};

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `${BASE_URL}/api`;
};
const API_BASE_URL = getApiBaseUrl();
// ====================================================

const AdminInterviewConfig = () => {
  const { token } = useAdmin();
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [durations, setDurations] = useState([]);
  const [prompts, setPrompts] = useState({ default: '', evaluationCriteria: { weights: { technical: 0, clarity: 0, confidence: 0 } } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', techStacks: [] });
  const [techStackInput, setTechStackInput] = useState('');

  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [levelForm, setLevelForm] = useState({ label: '', icon: '', description: '' });

  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [editingDifficulty, setEditingDifficulty] = useState(null);
  const [difficultyForm, setDifficultyForm] = useState({ label: '', icon: '' });

  const [showDurationModal, setShowDurationModal] = useState(false);
  const [editingDuration, setEditingDuration] = useState(null);
  const [durationForm, setDurationForm] = useState({ value: '', label: '', icon: '' });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (USE_MOCK) {
      setTimeout(() => {
        setCategories(MOCK_CATEGORIES);
        setLevels(MOCK_LEVELS);
        setDifficulties(MOCK_DIFFICULTIES);
        setDurations(MOCK_DURATIONS);
        setPrompts(MOCK_PROMPTS);
        setLoading(false);
      }, 500);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/interview/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load configuration');
      const data = await res.json();
      setCategories(data.categories);
      setLevels(data.levels);
      setDifficulties(data.difficulties);
      setDurations(data.durations);
      setPrompts(data.prompts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSaveAll = async () => {
    setSaving(true);
    const config = { categories, levels, difficulties, durations, prompts };
    if (USE_MOCK) {
      setTimeout(() => {
        alert('Configuration saved (mock)');
        setSaving(false);
      }, 500);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/interview/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Configuration saved');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Category CRUD ----------
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (catId) => {
    if (!window.confirm('Delete this category and all its roles?')) return;
    setCategories(categories.filter(c => c.id !== catId));
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    if (editingCategory) {
      setCategories(categories.map(c =>
        c.id === editingCategory.id ? { ...c, name: categoryForm.name } : c
      ));
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        name: categoryForm.name,
        roles: []
      };
      setCategories([...categories, newCat]);
    }
    setShowCategoryModal(false);
  };

  // ---------- Role CRUD ----------
  const handleAddRole = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setEditingRole(null);
    setRoleForm({ name: '', techStacks: [] });
    setTechStackInput('');
    setShowRoleModal(true);
  };

  const handleEditRole = (catId, role) => {
    setSelectedCategoryId(catId);
    setEditingRole(role);
    setRoleForm({ name: role.name, techStacks: [...role.techStacks] });
    setTechStackInput('');
    setShowRoleModal(true);
  };

  const handleDeleteRole = (catId, roleId) => {
    if (!window.confirm('Delete this role and its tech stacks?')) return;
    setCategories(categories.map(c =>
      c.id === catId ? { ...c, roles: c.roles.filter(r => r.id !== roleId) } : c
    ));
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;
    const catIndex = categories.findIndex(c => c.id === selectedCategoryId);
    if (catIndex === -1) return;
    const updatedCategories = [...categories];
    const cat = updatedCategories[catIndex];
    if (editingRole) {
      cat.roles = cat.roles.map(r =>
        r.id === editingRole.id ? { ...r, name: roleForm.name, techStacks: roleForm.techStacks } : r
      );
    } else {
      const newRole = {
        id: `role-${Date.now()}`,
        name: roleForm.name,
        techStacks: roleForm.techStacks
      };
      cat.roles = [...cat.roles, newRole];
    }
    setCategories(updatedCategories);
    setShowRoleModal(false);
  };

  const handleAddTechStack = () => {
    if (!techStackInput.trim()) return;
    setRoleForm({
      ...roleForm,
      techStacks: [...roleForm.techStacks, techStackInput.trim()]
    });
    setTechStackInput('');
  };

  const handleRemoveTechStack = (index) => {
    const newStacks = [...roleForm.techStacks];
    newStacks.splice(index, 1);
    setRoleForm({ ...roleForm, techStacks: newStacks });
  };

  // ---------- Levels CRUD ----------
  const handleAddLevel = () => {
    setEditingLevel(null);
    setLevelForm({ label: '', icon: '', description: '' });
    setShowLevelModal(true);
  };

  const handleEditLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({ label: level.label, icon: level.icon, description: level.description });
    setShowLevelModal(true);
  };

  const handleDeleteLevel = (levelId) => {
    if (!window.confirm('Delete this level?')) return;
    setLevels(levels.filter(l => l.id !== levelId));
  };

  const handleLevelSubmit = (e) => {
    e.preventDefault();
    if (!levelForm.label.trim()) return;
    if (editingLevel) {
      setLevels(levels.map(l =>
        l.id === editingLevel.id ? { ...l, ...levelForm } : l
      ));
    } else {
      const newLevel = {
        id: `level-${Date.now()}`,
        ...levelForm
      };
      setLevels([...levels, newLevel]);
    }
    setShowLevelModal(false);
  };

  // ---------- Difficulties CRUD ----------
  const handleAddDifficulty = () => {
    setEditingDifficulty(null);
    setDifficultyForm({ label: '', icon: '' });
    setShowDifficultyModal(true);
  };

  const handleEditDifficulty = (diff) => {
    setEditingDifficulty(diff);
    setDifficultyForm({ label: diff.label, icon: diff.icon });
    setShowDifficultyModal(true);
  };

  const handleDeleteDifficulty = (diffId) => {
    if (!window.confirm('Delete this difficulty?')) return;
    setDifficulties(difficulties.filter(d => d.id !== diffId));
  };

  const handleDifficultySubmit = (e) => {
    e.preventDefault();
    if (!difficultyForm.label.trim()) return;
    if (editingDifficulty) {
      setDifficulties(difficulties.map(d =>
        d.id === editingDifficulty.id ? { ...d, ...difficultyForm } : d
      ));
    } else {
      const newDiff = {
        id: `diff-${Date.now()}`,
        ...difficultyForm
      };
      setDifficulties([...difficulties, newDiff]);
    }
    setShowDifficultyModal(false);
  };

  // ---------- Durations CRUD ----------
  const handleAddDuration = () => {
    setEditingDuration(null);
    setDurationForm({ value: '', label: '', icon: '' });
    setShowDurationModal(true);
  };

  const handleEditDuration = (dur) => {
    setEditingDuration(dur);
    setDurationForm({ value: dur.value, label: dur.label, icon: dur.icon });
    setShowDurationModal(true);
  };

  const handleDeleteDuration = (durValue) => {
    if (!window.confirm('Delete this duration?')) return;
    setDurations(durations.filter(d => d.value !== durValue));
  };

  const handleDurationSubmit = (e) => {
    e.preventDefault();
    if (!durationForm.value || !durationForm.label) return;
    if (editingDuration) {
      setDurations(durations.map(d =>
        d.value === editingDuration.value ? { ...durationForm } : d
      ));
    } else {
      setDurations([...durations, durationForm]);
    }
    setShowDurationModal(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-error p-8">{error}</div>;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header with optional back button */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="sm:justify-self-start">
            {/* Optional back button – you can add if needed */}
            {/* <BackButton fallbackPath="/admin-dashboard" /> */}
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
                Interview Configuration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span style={{ color: 'var(--color-text-primary)' }}>Mock Interview </span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Configuration
              </span>
            </h1>
            <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Manage categories, roles, tech stacks, levels, difficulties, durations, and AI prompts
            </p>
          </div>
          <div className="hidden sm:block"></div>
        </div>

        {/* Tabs – scrollable on mobile, left-aligned on desktop */}
        <div className="border-b overflow-x-auto overflow-y-hidden scrollbar-hide" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex min-w-max sm:min-w-0 sm:justify-start gap-1 sm:gap-2">
            {['categories', 'levels', 'difficulties', 'durations', 'prompts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm capitalize whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-primary'
                }`}
                style={{
                  borderBottomColor: activeTab === tab ? 'var(--color-primary)' : 'transparent'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleAddCategory}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
              >
                <i className="fas fa-plus"></i> Add Category
              </button>
            </div>

            {categories.map((cat) => (
              <div key={cat.id} className="rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cat.name}</h2>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditCategory(cat)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                      <i className="fas fa-edit" style={{ color: 'var(--color-text-secondary)' }}></i>
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <i className="fas fa-trash" style={{ color: 'var(--color-error)' }}></i>
                    </button>
                  </div>
                </div>

                <div className="ml-2 sm:ml-4 space-y-4">
                  {cat.roles.map((role) => (
                    <div key={role.id} className="border-l-2 pl-3 sm:pl-4" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>{role.name}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditRole(cat.id, role)} className="p-1 rounded-lg hover:bg-primary/10">
                            <i className="fas fa-edit text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}></i>
                          </button>
                          <button onClick={() => handleDeleteRole(cat.id, role.id)} className="p-1 rounded-lg hover:bg-red-50">
                            <i className="fas fa-trash text-xs sm:text-sm" style={{ color: 'var(--color-error)' }}></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {role.techStacks.map((stack, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                            {stack}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddRole(cat.id)}
                    className="text-xs sm:text-sm flex items-center gap-1 mt-2"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <i className="fas fa-plus-circle"></i> Add Role
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Levels Tab */}
        {activeTab === 'levels' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleAddLevel}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
              >
                <i className="fas fa-plus"></i> Add Level
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {levels.map((level) => (
                <div key={level.id} className="p-4 rounded-xl border hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>{level.label}</h3>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{level.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditLevel(level)} className="p-2 rounded-lg hover:bg-primary/10">
                        <i className="fas fa-edit" style={{ color: 'var(--color-text-secondary)' }}></i>
                      </button>
                      <button onClick={() => handleDeleteLevel(level.id)} className="p-2 rounded-lg hover:bg-red-50">
                        <i className="fas fa-trash" style={{ color: 'var(--color-error)' }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulties Tab */}
        {activeTab === 'difficulties' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleAddDifficulty}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
              >
                <i className="fas fa-plus"></i> Add Difficulty
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {difficulties.map((diff) => (
                <div key={diff.id} className="p-4 rounded-xl border hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{diff.icon}</span>
                      <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>{diff.label}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditDifficulty(diff)} className="p-2 rounded-lg hover:bg-primary/10">
                        <i className="fas fa-edit" style={{ color: 'var(--color-text-secondary)' }}></i>
                      </button>
                      <button onClick={() => handleDeleteDifficulty(diff.id)} className="p-2 rounded-lg hover:bg-red-50">
                        <i className="fas fa-trash" style={{ color: 'var(--color-error)' }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Durations Tab */}
        {activeTab === 'durations' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleAddDuration}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
              >
                <i className="fas fa-plus"></i> Add Duration
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {durations.map((dur) => (
                <div key={dur.value} className="p-3 sm:p-4 rounded-xl border hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex w-full justify-between items-center">
                      <span className="text-xl">{dur.icon}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditDuration(dur)} className="p-1 rounded-lg hover:bg-primary/10">
                          <i className="fas fa-edit text-xs" style={{ color: 'var(--color-text-secondary)' }}></i>
                        </button>
                        <button onClick={() => handleDeleteDuration(dur.value)} className="p-1 rounded-lg hover:bg-red-50">
                          <i className="fas fa-trash text-xs" style={{ color: 'var(--color-error)' }}></i>
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{dur.label}</h3>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{dur.value} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <div className="rounded-xl border p-4 sm:p-6 space-y-4 sm:space-y-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Default Prompt Template
              </label>
              <textarea
                value={prompts.default}
                onChange={(e) => setPrompts({ ...prompts, default: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                placeholder="Enter prompt template with placeholders {count}, {difficulty}, {level}, {role}, {techStack}"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Evaluation Weights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Technical</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={prompts.evaluationCriteria?.weights?.technical}
                    onChange={(e) => setPrompts({
                      ...prompts,
                      evaluationCriteria: {
                        ...prompts.evaluationCriteria,
                        weights: { ...prompts.evaluationCriteria?.weights, technical: parseInt(e.target.value) || 0 }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Clarity</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={prompts.evaluationCriteria?.weights?.clarity}
                    onChange={(e) => setPrompts({
                      ...prompts,
                      evaluationCriteria: {
                        ...prompts.evaluationCriteria,
                        weights: { ...prompts.evaluationCriteria?.weights, clarity: parseInt(e.target.value) || 0 }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Confidence</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={prompts.evaluationCriteria?.weights?.confidence}
                    onChange={(e) => setPrompts({
                      ...prompts,
                      evaluationCriteria: {
                        ...prompts.evaluationCriteria,
                        weights: { ...prompts.evaluationCriteria?.weights, confidence: parseInt(e.target.value) || 0 }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>Weights should sum to 100.</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
          >
            {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            Save All Changes
          </button>
        </div>
      </div>

      {/* All modals – full width on mobile */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCategoryModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-2xl border p-4 sm:p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleCategorySubmit}>
              <input
                type="text"
                placeholder="Category name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 py-2 rounded-lg border hover:bg-primary/5 transition-colors" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRoleModal(false)}>
          <div className="max-w-lg w-full rounded-2xl shadow-2xl border p-4 sm:p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {editingRole ? 'Edit Role' : 'Add Role'}
            </h3>
            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Role name"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Tech Stacks</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a tech stack"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    className="flex-1 px-3 py-1 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTechStack}
                    className="px-3 py-1 rounded-lg text-white transition-all hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {roleForm.techStacks.map((stack, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-full text-xs flex items-center gap-1" style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                      {stack}
                      <button type="button" onClick={() => handleRemoveTechStack(idx)} className="ml-1 text-error hover:text-error/80">
                        <i className="fas fa-times-circle text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRoleModal(false)} className="flex-1 py-2 rounded-lg border hover:bg-primary/5 transition-colors" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowLevelModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-2xl border p-4 sm:p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {editingLevel ? 'Edit Level' : 'Add Level'}
            </h3>
            <form onSubmit={handleLevelSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Label (e.g. Fresher)"
                value={levelForm.label}
                onChange={(e) => setLevelForm({ ...levelForm, label: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji, e.g. 🌱)"
                value={levelForm.icon}
                onChange={(e) => setLevelForm({ ...levelForm, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <input
                type="text"
                placeholder="Description (e.g. 0-1 years)"
                value={levelForm.description}
                onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowLevelModal(false)} className="flex-1 py-2 rounded-lg border hover:bg-primary/5 transition-colors" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDifficultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDifficultyModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-2xl border p-4 sm:p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {editingDifficulty ? 'Edit Difficulty' : 'Add Difficulty'}
            </h3>
            <form onSubmit={handleDifficultySubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Label (e.g. Easy)"
                value={difficultyForm.label}
                onChange={(e) => setDifficultyForm({ ...difficultyForm, label: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji, e.g. 😊)"
                value={difficultyForm.icon}
                onChange={(e) => setDifficultyForm({ ...difficultyForm, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowDifficultyModal(false)} className="flex-1 py-2 rounded-lg border hover:bg-primary/5 transition-colors" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDurationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDurationModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-2xl border p-4 sm:p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {editingDuration ? 'Edit Duration' : 'Add Duration'}
            </h3>
            <form onSubmit={handleDurationSubmit} className="space-y-4">
              <input
                type="number"
                placeholder="Value in minutes (e.g. 5)"
                value={durationForm.value}
                onChange={(e) => setDurationForm({ ...durationForm, value: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <input
                type="text"
                placeholder="Label (e.g. 5 min)"
                value={durationForm.label}
                onChange={(e) => setDurationForm({ ...durationForm, label: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji, e.g. ⚡)"
                value={durationForm.icon}
                onChange={(e) => setDurationForm({ ...durationForm, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowDurationModal(false)} className="flex-1 py-2 rounded-lg border hover:bg-primary/5 transition-colors" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviewConfig;