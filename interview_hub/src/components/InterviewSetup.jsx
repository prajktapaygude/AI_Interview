import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";

// ==================== MOCK MODE ====================
const USE_MOCK = false; // Set to false when backend is ready

const MOCK_CONFIG = {
  categories: [
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
        { id: "programming-languages", name: "Programming Languages", techStacks: ["Java", "Python", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "TypeScript"] },
        { id: "web-dev", name: "Web Development / Frameworks", techStacks: ["HTML/CSS", "JavaScript", "React", "Angular", "Spring Boot"] },
        { id: "databases", name: "Databases", techStacks: ["MySQL", "PostgreSQL", "MongoDB", "Redis"] },
        { id: "devops", name: "DevOps / Cloud", techStacks: ["Docker", "Kubernetes", "AWS", "Azure", "GCP"] },
        { id: "ai-ml", name: "AI / Data Science", techStacks: ["Machine Learning", "Deep Learning", "Data Science", "NLP", "Computer Vision"] },
        { id: "cybersecurity", name: "Cybersecurity", techStacks: ["Network Security", "Ethical Hacking", "Information Security"] },
        { id: "blockchain", name: "Blockchain & Emerging Tech", techStacks: ["Blockchain Basics", "Smart Contracts"] }
      ]
    }
  ],
  levels: [
    { id: "fresher", label: "Fresher", icon: "🌱", description: "0-1 years" },
    { id: "junior", label: "Junior", icon: "🌿", description: "1-3 years" },
    { id: "mid", label: "Mid-Level", icon: "🌳", description: "3-5 years" },
    { id: "senior", label: "Senior", icon: "👑", description: "5+ years" }
  ],
  difficulties: [
    { id: "easy", label: "Easy", icon: "😊" },
    { id: "medium", label: "Medium", icon: "😐" },
    { id: "hard", label: "Hard", icon: "😰" }
  ],
  durations: [
    { value: "5", label: "5 min", icon: "⚡" },
    { value: "10", label: "10 min", icon: "⏱️" },
    { value: "15", label: "15 min", icon: "⏲️" },
    { value: "20", label: "20 min", icon: "⌛" },
    { value: "30", label: "30 min", icon: "⏳" }
  ]
};

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:5000/api';
};
const API_BASE_URL = getApiBaseUrl();
// ====================================================

const InterviewSetup = ({ onComplete }) => {
  const { isDarkMode } = useTheme();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    role: "",
    techStack: "",
    level: "fresher",
    difficulty: "easy",
    duration: "5"
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    if (USE_MOCK) {
      setTimeout(() => {
        setConfig(MOCK_CONFIG);
        setLoading(false);
      }, 500);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/public/interview-config`);
      if (!res.ok) throw new Error('Failed to load configuration');
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRolesForCategory = () => {
    if (!formData.category || !config) return [];
    const cat = config.categories.find(c => c.id === formData.category);
    return cat ? cat.roles : [];
  };

  const getTechStacksForRole = () => {
    if (!formData.role || !config) return [];
    for (const cat of config.categories) {
      const role = cat.roles.find(r => r.id === formData.role);
      if (role) return role.techStacks;
    }
    return [];
  };

  const clearField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: "",
      ...(field === 'category' ? { role: '', techStack: '' } : {}),
      ...(field === 'role' ? { techStack: '' } : {})
    }));
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFormData({
      ...formData,
      category: newCategory,
      role: "",
      techStack: ""
    });
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData({
      ...formData,
      role: newRole,
      techStack: ""
    });
  };

  // In InterviewSetup.jsx, handleSubmit function
const handleSubmit = (e) => {
  e.preventDefault();
  if (formData.role && formData.techStack) {
    // Send complete interview data
    onComplete({
      category: formData.category,
      role: formData.role,
      techStack: formData.techStack,
      level: formData.level,
      difficulty: formData.difficulty,
      duration: formData.duration
    });
  }
};
  if (loading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading interview options...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 text-error">
        <i className="fas fa-exclamation-circle text-3xl sm:text-4xl mb-3 sm:mb-4"></i>
        <p className="text-sm sm:text-base">{error}</p>
        <button
          onClick={fetchConfig}
          className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg text-sm sm:text-base hover:opacity-90 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg"
             style={{ background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))` }}>
          <i className="fas fa-sliders-h text-white text-base sm:text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Interview Configuration
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>Set up your interview preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Category, Role, Tech Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Category */}
          <div className="space-y-1.5 sm:space-y-2 relative">
            <label className="block text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-folder mr-1 sm:mr-2" style={{ color: 'var(--color-primary)' }}></i>
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm sm:text-base pr-8"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                required
              >
                <option value="" disabled>Select a category</option>
                {config.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {formData.category && (
                <button
                  type="button"
                  onClick={() => clearField('category')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-all"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5 sm:space-y-2 relative">
            <label className="block text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-briefcase mr-1 sm:mr-2" style={{ color: 'var(--color-primary)' }}></i>
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={handleRoleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm sm:text-base pr-8"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                required
                disabled={!formData.category}
              >
                <option value="" disabled>Select a role</option>
                {getRolesForCategory().map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {formData.role && (
                <button
                  type="button"
                  onClick={() => clearField('role')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-all disabled:invisible"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-1.5 sm:space-y-2 relative">
            <label className="block text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-code mr-1 sm:mr-2" style={{ color: 'var(--color-secondary)' }}></i>
              Tech Stack <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-sm sm:text-base pr-8"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                required
                disabled={!formData.role}
              >
                <option value="" disabled>Select a tech stack</option>
                {getTechStacksForRole().map(stack => (
                  <option key={stack} value={stack}>{stack}</option>
                ))}
              </select>
              {formData.techStack && (
                <button
                  type="button"
                  onClick={() => clearField('techStack')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-all disabled:invisible"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Level */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="block text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            <i className="fas fa-user-graduate mr-1 sm:mr-2" style={{ color: 'var(--color-accent)' }}></i>
            Experience Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {config.levels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setFormData({ ...formData, level: level.id })}
                className={`group relative p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1`}
                style={{ 
                  borderColor: formData.level === level.id ? 'var(--color-primary)' : 'var(--color-border)',
                  background: formData.level === level.id 
                    ? `linear-gradient(to bottom right, var(--color-primary)15, var(--color-secondary)15)`
                    : 'var(--color-bg-secondary)',
                  boxShadow: formData.level === level.id ? `0 10px 20px -10px var(--color-primary)` : 'none'
                }}
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{level.icon}</div>
                <div className={`font-semibold text-xs sm:text-sm`} 
                     style={{ color: formData.level === level.id ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                  {level.label}
                </div>
                <div className="text-xs mt-1 hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>{level.description}</div>
                {formData.level === level.id && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg"
                       style={{ background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))` }}>
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty and Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-signal mr-1 sm:mr-2" style={{ color: 'var(--color-primary)' }}></i>
              Difficulty Level
            </label>
            <div className="flex gap-2 sm:gap-3">
              {config.difficulties.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: diff.id })}
                  className={`flex-1 p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1`}
                  style={{ 
                    borderColor: formData.difficulty === diff.id ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: formData.difficulty === diff.id ? `var(--color-primary)15` : 'var(--color-bg-secondary)',
                    boxShadow: formData.difficulty === diff.id ? `0 5px 15px -5px var(--color-primary)` : 'none'
                  }}
                >
                  <div className="text-lg sm:text-xl mb-0.5 sm:mb-1">{diff.icon}</div>
                  <div className={`text-xs sm:text-sm font-medium`} 
                       style={{ color: formData.difficulty === diff.id ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {diff.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-hourglass-half mr-1 sm:mr-2" style={{ color: 'var(--color-secondary)' }}></i>
              Duration
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {config.durations.map((dur) => (
                <button
                  key={dur.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration: dur.value })}
                  className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1`}
                  style={{ 
                    borderColor: formData.duration === dur.value ? 'var(--color-secondary)' : 'var(--color-border)',
                    background: formData.duration === dur.value 
                      ? `linear-gradient(to bottom right, var(--color-secondary)15, var(--color-primary)15)`
                      : 'var(--color-bg-secondary)',
                    boxShadow: formData.duration === dur.value ? `0 5px 15px -5px var(--color-secondary)` : 'none'
                  }}
                >
                  <div className="text-base sm:text-lg mb-0.5 sm:mb-1">{dur.icon}</div>
                  <div className={`text-xs font-medium`} 
                       style={{ color: formData.duration === dur.value ? 'var(--color-secondary)' : 'var(--color-text-secondary)' }}>
                    {dur.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          disabled={!formData.role || !formData.techStack}
          className="w-full py-3 sm:py-4 px-4 sm:px-6 text-white font-semibold rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none text-sm sm:text-base"
          style={{ 
            background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
          }}
        >
          Continue to Instructions
        </button>
      </form>
    </div>
  );
};

export default InterviewSetup;

