import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '../ThemeContext';

const Practice = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Simple language data with enhanced details
  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: 'fab fa-js', color: '#f7df1e', category: 'frontend', level: 'Beginner', questions: 20, description: 'Web development' },
    { id: 'python', name: 'Python', icon: 'fab fa-python', color: '#3776ab', category: 'backend', level: 'Beginner', questions: 20, description: 'Data science' },
    { id: 'java', name: 'Java', icon: 'fab fa-java', color: '#007396', category: 'backend', level: 'Intermediate', questions: 20, description: 'Enterprise' },
    { id: 'react', name: 'React', icon: 'fab fa-react', color: '#61dafb', category: 'frontend', level: 'Intermediate', questions: 20, description: 'UI library' },
    { id: 'sql', name: 'SQL', icon: 'fas fa-database', color: '#4479a1', category: 'database', level: 'Beginner', questions: 20, description: 'Database queries' },
    { id: 'cpp', name: 'C++', icon: 'fas fa-code', color: '#00599c', category: 'backend', level: 'Advanced', questions: 20, description: 'System programming' },
    { id: 'angular', name: 'Angular', icon: 'fab fa-angular', color: '#dd0031', category: 'frontend', level: 'Advanced', questions: 20, description: 'Enterprise framework' },
    { id: 'vue', name: 'Vue.js', icon: 'fab fa-vuejs', color: '#4fc08d', category: 'frontend', level: 'Beginner', questions: 20, description: 'Progressive framework' },
    { id: 'php', name: 'PHP', icon: 'fab fa-php', color: '#777bb4', category: 'backend', level: 'Beginner', questions: 20, description: 'Web backend' },
    { id: 'typescript', name: 'TypeScript', icon: 'fas fa-code', color: '#3178c6', category: 'frontend', level: 'Intermediate', questions: 20, description: 'Typed JavaScript' },
    { id: 'swift', name: 'Swift', icon: 'fab fa-swift', color: '#fa7343', category: 'mobile', level: 'Intermediate', questions: 20, description: 'iOS development' },
    { id: 'kotlin', name: 'Kotlin', icon: 'fab fa-android', color: '#7f52ff', category: 'mobile', level: 'Intermediate', questions: 20, description: 'Android development' },
  ];

  // Simple categories with icons
  const categories = [
    { id: 'all', name: 'All Languages', icon: 'fa-globe' },
    { id: 'frontend', name: 'Frontend', icon: 'fa-desktop' },
    { id: 'backend', name: 'Backend', icon: 'fa-server' },
    { id: 'database', name: 'Database', icon: 'fa-database' },
    { id: 'mobile', name: 'Mobile', icon: 'fa-mobile-alt' },
  ];

  // Filter languages
  const filteredLanguages = languages.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lang.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getLevelColor = (level) => {
    switch(level) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : 'fa-code';
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 p-6 lg:p-8"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Button removed */}

      <div className="max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3"
              style={{ color: 'var(--color-text-primary)' }}>
            Practice <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MCQ Questions</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Master your skills with 20 questions per language
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-4"></div>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="relative max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 rounded-full border-2 outline-none transition-all"
            style={{ 
              borderColor: searchTerm ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
          />
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2"
             style={{ color: searchTerm ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}></i>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center hover:bg-gray-500"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Category Buttons - Enhanced with active states */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === cat.id 
                  ? 'text-white shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
              style={{ 
                backgroundColor: selectedCategory === cat.id ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: selectedCategory === cat.id ? 'white' : 'var(--color-text-secondary)',
                border: '1px solid',
                borderColor: selectedCategory === cat.id ? 'transparent' : 'var(--color-border)',
                boxShadow: selectedCategory === cat.id ? '0 10px 20px -5px var(--color-primary)' : 'none'
              }}
            >
              <i className={`fas ${cat.icon}`}></i>
              <span className="font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Results count with animation */}
        <div className="text-center mb-6">
          <p className="text-sm inline-block px-4 py-1 rounded-full"
             style={{ backgroundColor: `${'var(--color-primary)'}10`, color: 'var(--color-primary)' }}>
            <i className="fas fa-code mr-2"></i>
            {filteredLanguages.length} {filteredLanguages.length === 1 ? 'language' : 'languages'} available
          </p>
        </div>

        {/* Language Grid */}
        {filteredLanguages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredLanguages.map((lang, index) => (
              <div
                key={lang.id}
                onClick={() => navigate('/quiz', { state: { language: lang.id } })}
                className="group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid',
                  borderColor: 'var(--color-border)',
                  animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                }}
              >
                {/* Category badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${'var(--color-primary)'}10`, color: 'var(--color-primary)' }}>
                    <i className={`fas ${getCategoryIcon(lang.category)} mr-1`}></i>
                    {lang.category}
                  </span>
                </div>

                {/* Icon and name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300"
                       style={{ backgroundColor: `${lang.color}20`, color: lang.color }}>
                    <i className={lang.icon}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                      {lang.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {lang.description}
                    </p>
                  </div>
                </div>

                {/* Level badge and questions */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${getLevelColor(lang.level)}20`, color: getLevelColor(lang.level) }}>
                    <i className="fas fa-signal mr-1"></i>
                    {lang.level}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <i className="fas fa-question-circle mr-1" style={{ color: 'var(--color-primary)' }}></i>
                    {lang.questions} questions
                  </span>
                </div>

                {/* Start button */}
                <button
                  className="w-full py-2.5 rounded-xl text-white font-medium transition-all duration-300 group-hover:shadow-lg flex items-center justify-center gap-2"
                  style={{ 
                    background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  }}
                >
                  Start Practice
                  <i className="fas fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-3xl" style={{ color: 'var(--color-primary)' }}></i>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No languages found
            </h3>
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Try adjusting your search
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-2 rounded-full text-white font-medium transition-all hover:-translate-y-1"
              style={{ 
                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Practice;