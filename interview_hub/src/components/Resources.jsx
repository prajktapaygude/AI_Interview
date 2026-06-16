import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import debounce from 'lodash/debounce';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    type: "all",
    sortBy: "newest",
    difficulty: "all"
  });
  
  const abortControllerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Categories matching backend enum
  const categories = useMemo(() => [
    { id: "all", name: "All Topics", icon: "fa-globe" },
    { id: "technology", name: "Technology / IT", icon: "fa-laptop-code" },
    { id: "business", name: "Business & Management", icon: "fa-briefcase" },
    { id: "science", name: "Science & Research", icon: "fa-flask" },
    { id: "humanities", name: "Social Sciences & Humanities", icon: "fa-users" },
    { id: "professional", name: "Professional Skills", icon: "fa-chart-line" },
    { id: "other", name: "Other Domains", icon: "fa-gavel" },
    { id: "frontend", name: "Frontend", icon: "fa-code" },
    { id: "backend", name: "Backend", icon: "fa-server" },
    { id: "system-design", name: "System Design", icon: "fa-sitemap" },
    { id: "behavioral", name: "Behavioral", icon: "fa-users" },
    { id: "dsa", name: "DSA", icon: "fa-brain" },
  ], []);

  const types = useMemo(() => [
    { id: "all", name: "All Types", icon: "fa-layer-group" },
    { id: "article", name: "Articles", icon: "fa-newspaper" },
    { id: "video", name: "Videos", icon: "fa-video" },
    { id: "book", name: "Books", icon: "fa-book" },
    { id: "course", name: "Courses", icon: "fa-graduation-cap" },
    { id: "practice", name: "Practice", icon: "fa-laptop-code" },
  ], []);

  const sortOptions = useMemo(() => [
    { id: "newest", name: "Newest First", icon: "fa-calendar-alt" },
    { id: "popular", name: "Most Popular", icon: "fa-fire" },
    { id: "alphabetical", name: "Title A-Z", icon: "fa-sort-alpha-down" },
  ], []);

  // Fetch resources from database
  const fetchResources = useCallback(async (pageNum = currentPage, isInitial = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', 20);
      
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      
      if (filters.difficulty && filters.difficulty !== 'all') {
        params.append('difficulty', filters.difficulty);
      }
      
      params.append('sort', filters.sortBy);

      console.log('Fetching resources from DB:', `${API_BASE_URL}/resources?${params.toString()}`);

      const response = await fetch(`${API_BASE_URL}/resources?${params.toString()}`, {
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch resources`);
      }

      const data = await response.json();
      
      setResources(data.resources || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      
      if (!isInitial) {
        setCurrentPage(data.currentPage || 1);
      }
      
      console.log('Resources fetched successfully:', {
        total: data.total,
        returned: data.resources?.length,
        page: data.currentPage,
        totalPages: data.totalPages
      });

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      console.error('Resources fetch error:', err);
      setError(err.message);
      setResources([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [filters, currentPage]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setFilters(prev => ({ ...prev, search: searchValue }));
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({ ...prev, category: categoryId }));
    setCurrentPage(1);
  };

  const handleTypeChange = (typeId) => {
    setFilters(prev => ({ ...prev, type: typeId }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortId) => {
    setFilters(prev => ({ ...prev, sortBy: sortId }));
    setCurrentPage(1);
  };

  const handleDifficultyChange = (difficulty) => {
    setFilters(prev => ({ ...prev, difficulty }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      category: "all",
      type: "all",
      sortBy: "newest",
      difficulty: "all"
    });
    setCurrentPage(1);
  };

  // Fetch resources when filters or page changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchResources(1, true);
    } else {
      fetchResources(currentPage);
    }
  }, [filters, currentPage, fetchResources]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.difficulty !== 'all') count++;
    if (filters.search) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  const getTypeIcon = (type) => {
    const icons = {
      article: "fa-newspaper",
      video: "fa-video",
      book: "fa-book",
      course: "fa-graduation-cap",
      practice: "fa-laptop-code"
    };
    return icons[type] || "fa-file";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: "var(--color-success)",
      Intermediate: "var(--color-accent)",
      Advanced: "var(--color-error)"
    };
    return colors[difficulty] || "var(--color-text-secondary)";
  };

  const getPlatformName = (url) => {
    if (!url) return "Website";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    if (url.includes("coursera.org")) return "Coursera";
    if (url.includes("udemy.com")) return "Udemy";
    if (url.includes("amazon.com")) return "Amazon";
    if (url.includes("medium.com")) return "Medium";
    if (url.includes("github.com")) return "GitHub";
    return "Website";
  };

  const getSubCategory = (resource) => {
    const categoryMap = {
      technology: "Technology",
      business: "Business",
      science: "Science",
      humanities: "Humanities",
      professional: "Professional",
      other: "Other",
      frontend: "Frontend",
      backend: "Backend",
      "system-design": "System Design",
      behavioral: "Behavioral",
      dsa: "DSA"
    };
    return categoryMap[resource.category] || resource.subCategory || "General";
  };

  if (loading && resources.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center p-4">
          <i className="fas fa-spinner fa-spin text-3xl sm:text-4xl mb-4" style={{ color: 'var(--color-primary)' }}></i>
          <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>Loading resources from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border shadow-sm mb-4 sm:mb-6" 
               style={{ backgroundColor: 'var(--color-primary)10', borderColor: 'var(--color-primary)20' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full" 
                    style={{ backgroundColor: 'var(--color-primary)', opacity: '0.75' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" 
                    style={{ backgroundColor: 'var(--color-primary)' }}></span>
            </span>
            <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              Knowledge Hub • {total.toLocaleString()} resources from database
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 px-2">
            <span style={{ color: 'var(--color-text-primary)' }}>Interview </span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Resources</span>
          </h1>
          
          <p className="text-base sm:text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--color-text-secondary)' }}>
            Curated learning materials from our database
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl border text-sm sm:text-base" 
               style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444' }}>
            <i className="fas fa-exclamation-triangle mr-2 sm:mr-3"></i>
            <span className="break-words">{error}</span>
            <button onClick={() => fetchResources(currentPage)} className="ml-2 sm:ml-4 underline hover:no-underline font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
          <input
            type="text"
            placeholder="Search resources..."
            defaultValue={filters.search}
            onChange={handleSearchChange}
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 pl-10 sm:pl-12 rounded-full border-2 outline-none transition-all text-sm sm:text-base"
            style={{ 
              borderColor: filters.search ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
          />
          <i className="fas fa-search absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-sm sm:text-base" 
             style={{ color: filters.search ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}></i>
          {filters.search && (
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, search: "" }));
                setCurrentPage(1);
              }}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center hover:opacity-80"
              style={{ backgroundColor: 'var(--color-text-secondary)', color: 'white' }}
            >
              <i className="fas fa-times text-[10px] sm:text-xs"></i>
            </button>
          )}
        </div>

        {/* Active Filters Bar - Responsive wrapping */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 px-2">
            <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <i className="fas fa-filter mr-1"></i>
              Active ({getActiveFilterCount()}):
            </span>
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                    style={{ backgroundColor: 'var(--color-primary)15', color: 'var(--color-primary)' }}>
                <i className={`fas ${categories.find(c => c.id === filters.category)?.icon} text-xs`}></i>
                <span className="hidden sm:inline">{categories.find(c => c.id === filters.category)?.name}</span>
                <span className="sm:hidden">{categories.find(c => c.id === filters.category)?.name.split(' ')[0]}</span>
                <button onClick={() => handleCategoryChange('all')} className="ml-1 hover:opacity-70">
                  <i className="fas fa-times-circle text-xs"></i>
                </button>
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                    style={{ backgroundColor: 'var(--color-secondary)15', color: 'var(--color-secondary)' }}>
                <i className={`fas ${types.find(t => t.id === filters.type)?.icon} text-xs`}></i>
                {types.find(t => t.id === filters.type)?.name}
                <button onClick={() => handleTypeChange('all')} className="ml-1 hover:opacity-70">
                  <i className="fas fa-times-circle text-xs"></i>
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                    style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}>
                <i className="fas fa-search text-xs"></i>
                <span className="max-w-[100px] sm:max-w-none truncate">"{filters.search}"</span>
                <button onClick={() => setFilters(prev => ({ ...prev, search: "" }))} className="ml-1 hover:opacity-70">
                  <i className="fas fa-times-circle text-xs"></i>
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-error)' }}
            >
              <i className="fas fa-trash-alt mr-1"></i>
              Clear all
            </button>
          </div>
        )}

        {/* Filters Section - Mobile optimized */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {/* Category Filters - Horizontal scroll on mobile */}
          <div>
            <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 px-1" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-globe mr-1 sm:mr-2" style={{ color: 'var(--color-primary)' }}></i>
              Filter by Domain
            </p>
            <div className="overflow-x-auto pb-2 sm:pb-0">
              <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
                      filters.category === cat.id ? 'text-white shadow-md scale-105' : ''
                    }`}
                    style={{ 
                      backgroundColor: filters.category === cat.id ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                      color: filters.category === cat.id ? 'white' : 'var(--color-text-secondary)',
                      border: '1px solid',
                      borderColor: filters.category === cat.id ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    <i className={`fas ${cat.icon} text-xs`}></i>
                    <span className="hidden xs:inline">{cat.name}</span>
                    <span className="xs:hidden">{cat.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type Filters - Horizontal scroll on mobile */}
          <div>
            <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 px-1" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-layer-group mr-1 sm:mr-2" style={{ color: 'var(--color-secondary)' }}></i>
              Filter by Format
            </p>
            <div className="overflow-x-auto pb-2 sm:pb-0">
              <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
                {types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeChange(type.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
                      filters.type === type.id ? 'text-white shadow-md scale-105' : ''
                    }`}
                    style={{ 
                      backgroundColor: filters.type === type.id ? 'var(--color-secondary)' : 'var(--color-bg-secondary)',
                      color: filters.type === type.id ? 'white' : 'var(--color-text-secondary)',
                      border: '1px solid',
                      borderColor: filters.type === type.id ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    <i className={`fas ${type.icon} text-xs`}></i>
                    <span>{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sort and Additional Filters - Stack on mobile */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2 px-1">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <i className="fas fa-sort mr-1"></i>Sort:
              </span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-2 sm:px-3 py-1.5 sm:py-1.5 rounded-lg border text-xs sm:text-sm outline-none flex-1 sm:flex-initial"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
              <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <i className="fas fa-chart-line mr-1"></i>Difficulty:
              </span>
              <div className="flex flex-wrap gap-1">
                {['all', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <button
                    key={level}
                    onClick={() => handleDifficultyChange(level)}
                    className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                      filters.difficulty === level ? 'text-white' : ''
                    }`}
                    style={{ 
                      backgroundColor: filters.difficulty === level ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                      color: filters.difficulty === level ? 'white' : 'var(--color-text-secondary)',
                      border: '1px solid',
                      borderColor: filters.difficulty === level ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    {level === 'all' ? 'All' : level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 px-2">
          <p className="text-xs sm:text-sm px-3 py-1 rounded-full inline-flex items-center gap-1" 
             style={{ backgroundColor: 'var(--color-primary)10', color: 'var(--color-primary)' }}>
            <i className="fas fa-database mr-1"></i>
            <span>{total.toLocaleString()} resource{total !== 1 ? 's' : ''}</span>
            {loading && <i className="fas fa-spinner fa-spin ml-1"></i>}
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1 || loading}
                className="px-2 sm:px-3 py-1.5 rounded-lg border hover:bg-primary/10 disabled:opacity-50 transition-all flex items-center gap-1"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <i className="fas fa-chevron-left text-xs"></i>
                <span className="hidden xs:inline">Prev</span>
              </button>
              <div className="flex items-center gap-1">
                <span style={{ color: 'var(--color-text-primary)' }}>{currentPage}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>of</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{totalPages}</span>
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || loading}
                className="px-2 sm:px-3 py-1.5 rounded-lg border hover:bg-primary/10 disabled:opacity-50 transition-all flex items-center gap-1"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <span className="hidden xs:inline">Next</span>
                <i className="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          )}
        </div>

        {/* Resources Grid - Already responsive, adjusting gap and card padding for mobile */}
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {resources.map((resource, index) => (
              <a
                key={resource._id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl block"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  animation: `fadeIn 0.3s ease ${index * 0.05}s both`
                }}
              >
                {/* Platform Badge - Adjusted for mobile */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)' }}>
                    <i className="fas fa-globe text-[8px] sm:text-xs"></i>
                    <span>{getPlatformName(resource.url)}</span>
                  </span>
                </div>

                {/* Recommended Badge */}
                {resource.recommended && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                    <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                          style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`, color: 'white' }}>
                      <i className="fas fa-star text-[8px] sm:text-xs"></i>
                      <span className="hidden xs:inline">Recommended</span>
                    </span>
                  </div>
                )}

                {/* Type Badge - Bottom right */}
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-10">
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: 'var(--color-primary)90', color: 'white', backdropFilter: 'blur(4px)' }}>
                    <i className={`fas ${getTypeIcon(resource.type)} text-[8px] sm:text-xs`}></i>
                    <span className="capitalize hidden xs:inline">{resource.type}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5">
                  <div className="mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full" 
                          style={{ backgroundColor: 'var(--color-primary)15', color: 'var(--color-primary)' }}>
                      <i className={`fas ${categories.find(c => c.id === resource.category)?.icon || 'fa-tag'} mr-0.5 sm:mr-1 text-[8px] sm:text-xs`}></i>
                      <span className="text-[10px] sm:text-xs">{getSubCategory(resource)}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                    {resource.title}
                  </h3>

                  <p className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {resource.description}
                  </p>

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full" 
                              style={{ backgroundColor: 'var(--color-text-secondary)15', color: 'var(--color-text-secondary)' }}>
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full" 
                              style={{ backgroundColor: 'var(--color-text-secondary)15', color: 'var(--color-text-secondary)' }}>
                          +{resource.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="space-y-1.5 sm:space-y-2 pt-2 sm:pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    {resource.author && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <i className="fas fa-user text-[9px] sm:text-xs" style={{ color: 'var(--color-primary)' }}></i>
                        <span className="truncate">{resource.author}</span>
                      </div>
                    )}
                    {(resource.duration || resource.readTime) && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <i className="fas fa-clock text-[9px] sm:text-xs" style={{ color: 'var(--color-secondary)' }}></i>
                        <span>{resource.duration || resource.readTime}</span>
                      </div>
                    )}
                    {resource.difficulty && resource.difficulty !== 'All Levels' && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                        <i className="fas fa-signal text-[9px] sm:text-xs" style={{ color: getDifficultyColor(resource.difficulty) }}></i>
                        <span style={{ color: getDifficultyColor(resource.difficulty) }}>{resource.difficulty}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[9px] sm:text-xs mt-1.5 sm:mt-2" style={{ color: 'var(--color-primary)' }}>
                      <span className="hidden xs:inline">Click to visit</span>
                      <span className="xs:hidden">Visit</span>
                      <i className="fas fa-external-link-alt text-[8px] sm:text-xs"></i>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" 
                       style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`, transformOrigin: 'left' }}></div>
                </div>
              </a>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: 'var(--color-primary)10' }}>
              <i className="fas fa-database text-2xl sm:text-4xl" style={{ color: 'var(--color-primary)' }}></i>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-text-primary)' }}>No resources found</h3>
            <p className="text-sm sm:text-base mb-4 sm:mb-6 max-w-xs mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              {filters.search || filters.category !== 'all' || filters.type !== 'all' 
                ? "Try adjusting your filters or search terms"
                : "Please add resources to the database from admin panel"}
            </p>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 sm:px-6 py-2 rounded-full text-white font-medium transition-all hover:opacity-90 text-sm sm:text-base"
                style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
              >
                <i className="fas fa-undo mr-2"></i>
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Custom breakpoint for extra small devices */
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:hidden {
            display: none;
          }
        }
        @media (max-width: 479px) {
          .xs\\:inline {
            display: none;
          }
          .xs\\:hidden {
            display: inline;
          }
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: var(--color-bg-secondary);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--color-secondary);
        }
        /* Improve touch targets on mobile */
        @media (max-width: 640px) {
          button, 
          [role="button"],
          .cursor-pointer {
            min-height: 36px;
          }
          input, select {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
};

export default Resources;