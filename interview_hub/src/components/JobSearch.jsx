import React, { useState, useEffect } from "react";

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [suggestions, setSuggestions] = useState({ skills: [], locations: [] });
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchSummary, setSearchSummary] = useState(null);
  const [userMembership, setUserMembership] = useState(null);

  // Get auth token - try multiple possible storage keys
  const getAuthToken = () => {
    // Try different possible token storage keys
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('token');
    console.log('Token exists:', !!token);
    return token;
  };

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Filter skills whenever skills input changes
  useEffect(() => {
    if (suggestions && suggestions.skills && Array.isArray(suggestions.skills)) {
      const filtered = suggestions.skills.filter(skill =>
        skill.toLowerCase().includes(skills.toLowerCase())
      );
      setFilteredSkills(filtered.slice(0, 10));
    }
  }, [skills, suggestions]);

  // Filter locations whenever location input changes
  useEffect(() => {
    if (suggestions && suggestions.locations && Array.isArray(suggestions.locations)) {
      const filtered = suggestions.locations.filter(loc =>
        loc.toLowerCase().includes(location.toLowerCase())
      );
      setFilteredLocations(filtered.slice(0, 10));
    }
  }, [location, suggestions]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs/suggestions');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      } else {
        setSuggestions({
          skills: ['React', 'Python', 'Java', 'JavaScript', 'Node.js', 'Angular', 'Vue', 'Django', 'Spring Boot', 'AWS', 'DevOps', 'Data Science', 'Machine Learning', 'SQL', 'MongoDB', 'TypeScript'],
          locations: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Noida', 'Gurgaon', 'Jaipur', 'Lucknow', 'Chandigarh', 'Bhopal', 'Remote', 'Work From Home', 'Hybrid']
        });
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchJobs = async () => {
    if (!skills.trim() || !location.trim()) {
      setError("Please enter both skills and location");
      return;
    }

    const token = getAuthToken();
    console.log('Fetching jobs with token:', token ? 'Token present' : 'No token');
    
    if (!token) {
      setError("Please login to search for jobs. Token not found.");
      return;
    }

    setLoading(true);
    setError("");
    setSearchPerformed(true);
    setShowSkillSuggestions(false);
    setShowLocationSuggestions(false);
    setSearchSummary(null);

    try {
      const url = `http://localhost:5000/api/jobs?skills=${encodeURIComponent(skills.trim())}&location=${encodeURIComponent(location.trim())}`;
      console.log('Fetching URL:', url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', res.status);
      
      if (res.status === 401) {
        setError("Session expired. Please login again.");
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        setLoading(false);
        return;
      }
      
      if (res.status === 403) {
        const data = await res.json();
        setError(data.message || "Pro subscription required for job search");
        setJobs([]);
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Jobs received:', data.jobs?.length || 0);
      setJobs(data.jobs || []);
      setUserMembership(data.userMembership);
      setSearchSummary({
        skills: skills.trim(),
        location: location.trim(),
        total: data.total || data.jobs?.length || 0
      });
      
      if (data.jobs && data.jobs.length === 0) {
        setError(`No jobs found for "${skills.trim()}" in "${location.trim()}". Try different skills or location.`);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Error fetching jobs. Please try again later. " + error.message);
      setJobs([]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchJobs();
    }
  };

  const handleExampleClick = (skill, loc) => {
    setSkills(skill);
    setLocation(loc);
    setTimeout(() => fetchJobs(), 100);
  };

  const handleSkillSelect = (skill) => {
    setSkills(skill);
    setShowSkillSuggestions(false);
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setShowLocationSuggestions(false);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 py-12 px-4"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 rounded-full blur-3xl opacity-70"
             style={{ backgroundColor: 'var(--color-primary)', opacity: '0.05' }}></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 rounded-full blur-3xl opacity-70"
             style={{ backgroundColor: 'var(--color-secondary)', opacity: '0.05' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm mb-6"
               style={{ backgroundColor: `${'var(--color-primary)'}10`, borderColor: `${'var(--color-primary)'}20` }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full" 
                    style={{ backgroundColor: 'var(--color-primary)', opacity: '0.75' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" 
                    style={{ backgroundColor: 'var(--color-primary)' }}></span>
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              Find Your Dream Job
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span style={{ color: 'var(--color-text-primary)' }}>Job & Internship </span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Search
            </span>
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Search for jobs and internships based on your skills and preferred location
          </p>
          
          {userMembership && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
                 style={{ backgroundColor: userMembership === 'Pro' ? `${'var(--color-success)'}15` : `${'var(--color-primary)'}15`, 
                          color: userMembership === 'Pro' ? 'var(--color-success)' : 'var(--color-primary)' }}>
              <i className={`fas ${userMembership === 'Pro' ? 'fa-crown' : 'fa-user'}`}></i>
              {userMembership} Plan Active
            </div>
          )}
        </div>

        {/* Search Card */}
        <div className="rounded-2xl shadow-2xl border overflow-hidden mb-8"
             style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Skills Input */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  <i className="fas fa-code mr-2" style={{ color: 'var(--color-primary)' }}></i>
                  Skills / Technologies
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSkillSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                    placeholder="e.g., React, Python, Java..."
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)', 
                      borderColor: 'var(--color-border)', 
                      color: 'var(--color-text-primary)' 
                    }}
                  />
                  {showSkillSuggestions && filteredSkills.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-xl border shadow-2xl overflow-hidden animate-fadeIn"
                         style={{ 
                           backgroundColor: 'var(--color-bg-secondary)', 
                           borderColor: 'var(--color-border)',
                           maxHeight: '300px',
                           overflowY: 'auto'
                         }}>
                      <div className="py-1">
                        {filteredSkills.map((skill, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSkillSelect(skill)}
                            className="px-4 py-2.5 cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-3"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            <i className="fas fa-code text-sm" style={{ color: 'var(--color-primary)' }}></i>
                            <span className="flex-1">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Input */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  <i className="fas fa-map-marker-alt mr-2" style={{ color: 'var(--color-secondary)' }}></i>
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    placeholder="e.g., Mumbai, Bangalore, Remote..."
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)', 
                      borderColor: 'var(--color-border)', 
                      color: 'var(--color-text-primary)' 
                    }}
                  />
                  {showLocationSuggestions && filteredLocations.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-xl border shadow-2xl overflow-hidden animate-fadeIn"
                         style={{ 
                           backgroundColor: 'var(--color-bg-secondary)', 
                           borderColor: 'var(--color-border)',
                           maxHeight: '300px',
                           overflowY: 'auto'
                         }}>
                      <div className="py-1">
                        {filteredLocations.map((loc, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleLocationSelect(loc)}
                            className="px-4 py-2.5 cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-3"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            <i className="fas fa-map-marker-alt text-sm" style={{ color: 'var(--color-secondary)' }}></i>
                            <span className="flex-1">{loc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={fetchJobs}
              disabled={loading}
              className="w-full py-3 px-6 text-white font-semibold rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Searching for jobs...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i>
                  Search Jobs
                </>
              )}
            </button>

            {/* Error Message */}
            {error && !loading && (
              <div className="mt-4 p-3 rounded-lg text-center text-sm" 
                   style={{ backgroundColor: `${'var(--color-error)'}10`, color: 'var(--color-error)' }}>
                <i className="fas fa-exclamation-circle mr-2"></i>{error}
              </div>
            )}
          </div>
        </div>

        {/* Example Queries */}
        {!loading && !searchPerformed && (
          <div className="rounded-2xl border p-6 text-center"
               style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              <i className="fas fa-lightbulb mr-2" style={{ color: 'var(--color-primary)' }}></i>
              Try these examples:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { skill: "React", location: "Mumbai" },
                { skill: "Python", location: "Bangalore" },
                { skill: "Java", location: "Pune" },
                { skill: "JavaScript", location: "Hyderabad" },
                { skill: "AWS", location: "Remote" },
                { skill: "Data Science", location: "Bangalore" }
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example.skill, example.location)}
                  className="px-4 py-2 rounded-lg text-sm transition-all hover:-translate-y-0.5"
                  style={{ 
                    backgroundColor: `${'var(--color-primary)'}10`,
                    color: 'var(--color-primary)',
                    border: `1px solid ${'var(--color-primary)'}20`
                  }}
                >
                  {example.skill} in {example.location}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 animate-spin"
                   style={{ borderColor: `${'var(--color-primary)'}20`, borderTopColor: 'var(--color-primary)' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-search text-2xl" style={{ color: 'var(--color-primary)' }}></i>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Searching for opportunities...</p>
          </div>
        )}

        {/* Results Header */}
        {!loading && searchPerformed && jobs.length > 0 && searchSummary && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-chart-line mr-2" style={{ color: 'var(--color-primary)' }}></i>
              Found {jobs.length} Job{jobs.length !== 1 ? 's' : ''} for "{searchSummary.skills}" in "{searchSummary.location}"
            </h2>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && searchPerformed && jobs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job, index) => (
              <div
                key={job.id || index}
                className="group rounded-2xl border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  borderColor: 'var(--color-border)' 
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold line-clamp-2 flex-1" style={{ color: 'var(--color-text-primary)' }}>
                      {job.title}
                    </h3>
                    {job.salary && job.salary !== "Salary not specified" && (
                      <span className="ml-3 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                            style={{ backgroundColor: `${'var(--color-success)'}15`, color: 'var(--color-success)' }}>
                        <i className="fas fa-rupee-sign mr-1"></i>{job.salary}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <i className="fas fa-building w-4" style={{ color: 'var(--color-primary)' }}></i>
                      {job.company}
                    </p>
                    <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <i className="fas fa-map-marker-alt w-4" style={{ color: 'var(--color-secondary)' }}></i>
                      {job.location}
                    </p>
                  </div>
                  
                  <a
                    href={job.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:gap-3"
                    style={{ 
                      background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                      color: 'white'
                    }}
                  >
                    Apply Now
                    <i className="fas fa-arrow-right text-xs"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && searchPerformed && jobs.length === 0 && !error && (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed"
               style={{ 
                 borderColor: 'var(--color-border)', 
                 backgroundColor: 'var(--color-bg-secondary)' 
               }}>
            <i className="fas fa-frown text-5xl mb-4" style={{ color: 'var(--color-text-secondary)' }}></i>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No jobs found
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Try different skills or location to find more opportunities.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default JobSearch;