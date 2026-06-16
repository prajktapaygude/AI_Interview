import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../ThemeContext";

const API_BASE_URL = 'http://localhost:5000/api';

// ==================== RESUME SUGGESTIONS COMPONENT (themed) ====================
const ResumeSuggestions = ({ suggestions, score, missingSkills }) => {
  const [activeTab, setActiveTab] = useState('quickWins');
  const { isDarkMode } = useTheme();
  
  if (!suggestions) return null;
  
  const tabs = [
    { id: 'quickWins', label: 'Quick Wins', icon: '⚡', color: 'blue' },
    { id: 'formatting', label: 'Formatting', icon: '🎨', color: 'purple' },
    { id: 'content', label: 'Content', icon: '📝', color: 'green' },
    { id: 'atsOptimization', label: 'ATS Optimization', icon: '🤖', color: 'orange' }
  ];
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
      default: return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
    }
  };
  
  const getEffortIcon = (effort) => {
    switch(effort) {
      case 'easy': return '😊 Easy';
      case 'medium': return '📈 Medium';
      case 'hard': return '🔥 Hard';
      default: return '⭐';
    }
  };

  const getScoreBasedSummary = (score) => {
    if (score >= 80) return "Excellent resume! Minor tweaks will make it perfect for ATS systems.";
    if (score >= 60) return "Good foundation! Focus on adding missing keywords and quantifiable achievements.";
    if (score >= 40) return "Needs improvement. Restructure and add relevant keywords to boost your score.";
    return "Major improvements needed. Start with a professional template and add relevant experience.";
  };

  const generateSuggestionsText = () => {
    let text = `RESUME OPTIMIZATION REPORT\n================================\n\n`;
    text += `Your ATS Score: ${score}/100\n`;
    text += `Recommendation: ${getScoreBasedSummary(score)}\n\n`;
    text += `QUICK WINS:\n`;
    suggestions.suggestions?.quickWins?.forEach((item, i) => {
      text += `${i+1}. ${item.title}\n   ${item.description}\n   Priority: ${item.priority} | Effort: ${item.effort}\n\n`;
    });
    text += `\nFORMATTING TIPS:\n`;
    suggestions.suggestions?.formatting?.forEach((item, i) => {
      text += `${i+1}. ${item.title}\n   ${item.description}\n`;
      if (item.example) text += `   Example: ${item.example}\n\n`;
    });
    if (missingSkills && missingSkills.length > 0) {
      text += `\nMISSING SKILLS TO ADD:\n`;
      missingSkills.forEach((skill, i) => text += `${i+1}. ${skill}\n`);
    }
    text += `\n\nNEXT STEPS:\n`;
    suggestions.nextSteps?.forEach((step, i) => text += `${i+1}. ${step}\n`);
    return text;
  };
  
  const bannerBg = score >= 80 ? 'rgba(16, 185, 129, 0.1)' : score >= 60 ? 'rgba(59, 130, 246, 0.1)' : score >= 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  const bannerBorder = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="mt-8" style={{ color: 'var(--color-text-primary)' }}>
      {/* Score-Based Recommendation Banner */}
      <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: bannerBg, border: `1px solid ${bannerBorder}` }}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">{score >= 80 ? '🏆' : score >= 60 ? '📈' : score >= 40 ? '⚠️' : '🚀'}</div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {suggestions.summary || getScoreBasedSummary(score)}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestions.nextSteps?.slice(0, 3).map((step, idx) => (
                <span key={idx} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)' }}>
                  {idx + 1}. {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b mb-4" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => {
            const tabData = suggestions.suggestions?.[tab.id];
            const count = tabData?.length || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'border-b-2 font-medium'
                    : ''
                }`}
                style={{
                  borderBottomColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(156, 163, 175, 0.2)' }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'quickWins' && suggestions.suggestions?.quickWins?.map((item, idx) => {
          const priorityStyle = getPriorityColor(item.priority);
          return (
            <div key={idx} className="p-4 rounded-lg border transition-all" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}>
                      {item.priority?.toUpperCase() || 'MEDIUM'} Priority
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{getEffortIcon(item.effort)}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.description}</p>
                  {item.example && (
                    <div className="mt-2 p-2 rounded text-xs font-mono" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                      💡 Example: {item.example}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {activeTab === 'formatting' && suggestions.suggestions?.formatting?.map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h4>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{item.description}</p>
            {item.example && (
              <div className="p-2 rounded text-sm" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                <span className="font-medium">Example:</span> {item.example}
              </div>
            )}
          </div>
        ))}
        
        {activeTab === 'content' && (
          <>
            {missingSkills && missingSkills.length > 0 && (
              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', border: '1px solid #f97316' }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#f97316' }}>
                  <span>⚠️</span> Missing Key Skills
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {missingSkills.slice(0, 8).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'white', color: '#f97316' }}>
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-sm" style={{ color: '#f97316' }}>Add these skills to your resume to improve your match score!</p>
              </div>
            )}
            
            {suggestions.suggestions?.content?.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.description}</p>
                {item.skillToAdd && (
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      + Add: {item.skillToAdd}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        
        {activeTab === 'atsOptimization' && suggestions.suggestions?.atsOptimization?.map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h4>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.description}</p>
            {item.keywordToAdd && (
              <div className="mt-2">
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  Keyword: {item.keywordToAdd}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Download Button */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => {
            const blob = new Blob([generateSuggestionsText()], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume_suggestions.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 rounded-lg transition flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
        >
          <i className="fas fa-download"></i>
          Download All Suggestions
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN RESUME ANALYZER COMPONENT (fully themed, mandatory JD) ====================
const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Subscription states
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [userMembership, setUserMembership] = useState('Free');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(3);
  
  // Job Description fields (now mandatory)
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  // Score related state
  const [atsScore, setAtsScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isHighMatch, setIsHighMatch] = useState(false);
  const [isMediumMatch, setIsMediumMatch] = useState(false);
  const [isLowMatch, setIsLowMatch] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [suggestionsData, setSuggestionsData] = useState(null);

  useEffect(() => {
    checkSubscriptionAndUsage();
  }, []);

  const checkSubscriptionAndUsage = async () => {
    try {
      setIsCheckingSubscription(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: '/resume-analyzer', message: 'Please login to use Resume Analyzer' } });
        return;
      }
      const profileRes = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const membership = profileRes.data.user.membership || 'Free';
      setUserMembership(membership);
      const subscriptionRes = await axios.get(`${API_BASE_URL}/payment/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const hasActiveSubscription = subscriptionRes.data.hasActiveSubscription;
      setHasSubscription(hasActiveSubscription || membership !== 'Free');
      if (!hasActiveSubscription && membership === 'Free') {
        const usageRes = await axios.get(`${API_BASE_URL}/resume-usage`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsageCount(usageRes.data.count || 0);
      }
    } catch (error) {
      console.error('Subscription check error:', error);
      const token = localStorage.getItem('token');
      if (!token) navigate('/login');
      else {
        setHasSubscription(false);
        setUserMembership('Free');
      }
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const canUseResumeAnalyzer = () => {
    if (hasSubscription) return true;
    if (userMembership !== 'Free') return true;
    return usageCount < usageLimit;
  };

  const getRemainingUses = () => {
    if (hasSubscription) return 'Unlimited';
    if (userMembership !== 'Free') return 'Unlimited';
    return usageLimit - usageCount;
  };

  const handleUpgradeClick = () => {
    setShowSubscriptionModal(false);
    navigate('/subscription');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

  const validateAndSetFile = (file) => {
    setError("");
    setShowAnalysis(false);
    if (!file) return;
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload only PDF or DOC files");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }
    setFile(file);
  };

  const handleUpload = async () => {
    // Validate file
    if (!file) {
      setError("Please select a file first");
      return;
    }
    // Validate job title and description (now mandatory)
    if (!jobTitle.trim()) {
      setError("Please enter a job title");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }
    if (!canUseResumeAnalyzer()) {
      setShowSubscriptionModal(true);
      setError(`You've reached your free limit (${usageLimit} analyses). Please upgrade to continue.`);
      return;
    }
    
    setUploading(true);
    setError("");
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);
    
    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => prev >= 90 ? 90 : prev + 10);
      }, 500);
      
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/upload-resume", {
        method: "POST",
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        body: formData,
      });
      
      clearInterval(interval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }
      
      const data = await response.json();
      setUploadProgress(100);
      setAtsScore(data.atsScore || 0);
      setMatchedSkills(data.matchedSkills || []);
      setMissingSkills(data.missingSkills || []);
      setAnalysis(data.analysis || "");
      setRecommendations(data.recommendations || []);
      setIsHighMatch(data.isHighMatch || false);
      setIsMediumMatch(data.isMediumMatch || false);
      setIsLowMatch(data.isLowMatch || false);
      setTotalQuestions(data.totalQuestions || 0);
      setSuggestionsData(data.suggestions || null);
      setShowAnalysis(true);
      
      localStorage.setItem("resumeQuestions", JSON.stringify(data.questions || []));
      localStorage.setItem("resumeId", data.resumeId);
      localStorage.setItem("jobTitle", jobTitle);
      localStorage.setItem("jobDescription", jobDescription);
      localStorage.setItem("isHighMatch", data.isHighMatch);
      localStorage.setItem("atsScore", data.atsScore);
      
      if (!hasSubscription && userMembership === 'Free') {
        setUsageCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload resume. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleStartInterview = () => {
    navigate("/resume-interview", { 
      state: { 
        resumeId: localStorage.getItem("resumeId"),
        jobTitle: jobTitle,
        jobDescription: jobDescription,
        isHighMatch: isHighMatch,
        atsScore: atsScore
      } 
    });
  };

  const handleUploadAnother = () => {
    setShowAnalysis(false);
    setFile(null);
    setUploadProgress(0);
    setAtsScore(null);
    setMatchedSkills([]);
    setMissingSkills([]);
    setAnalysis("");
    setRecommendations([]);
    setIsHighMatch(false);
    setIsMediumMatch(false);
    setIsLowMatch(false);
    setSuggestionsData(null);
    setJobTitle("");
    setJobDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent Match!';
    if (score >= 70) return 'Very Good Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Partial Match';
    return 'Low Match';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Your skills align very well with this role! You're strongly qualified.";
    if (score >= 60) return "Good match! You have many of the required skills. Focus on the missing areas.";
    if (score >= 40) return "Partial match. You meet some requirements but there are gaps to address.";
    return "Low match. Consider developing the missing skills or applying for different roles.";
  };

  const AtsScoreCircle = ({ score }) => {
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const scoreColor = getScoreColor(score);
    return (
      <div className="relative flex flex-col items-center">
        <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
          <circle cx="120" cy="120" r={radius} fill="none" stroke={`${scoreColor}20`} strokeWidth="12" />
          <circle cx="120" cy="120" r={radius} fill="none" stroke={scoreColor} strokeWidth="12" 
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold" style={{ color: scoreColor }}>{score}</span>
          <span className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Match Score</span>
        </div>
      </div>
    );
  };

  const renderSkills = (skills, type) => {
    if (!skills || skills.length === 0) return <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>No skills found</p>;
    const color = type === 'matched' ? '#10b981' : '#ef4444';
    return skills.slice(0, 15).map((skill, idx) => (
      <span key={idx} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: `${color}15`, color: color }}>
        {skill}
      </span>
    ));
  };

  const SubscriptionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl max-w-md w-full p-6 shadow-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <i className="fas fa-crown text-2xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Upgrade Required</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            You've reached your free limit of {usageLimit} resume analyses.
          </p>
        </div>
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Free Plan</span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{usageCount}/{usageLimit} used</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
            <div className="h-full rounded-full" style={{ width: `${(usageCount / usageLimit) * 100}%`, backgroundColor: '#6366f1' }}></div>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Upgrade to Pro or Premium for unlimited resume analyses, advanced features, and more!
          </p>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <i className="fas fa-check-circle text-green-500"></i><span>Unlimited resume analysis</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <i className="fas fa-check-circle text-green-500"></i><span>Advanced ATS score calculation</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <i className="fas fa-check-circle text-green-500"></i><span>Personalized interview questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <i className="fas fa-check-circle text-green-500"></i><span>Priority support</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSubscriptionModal(false)} className="flex-1 py-2 rounded-lg border transition" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            Maybe Later
          </button>
          <button onClick={handleUpgradeClick} className="flex-1 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );

  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1' }}></div>
            <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-robot text-2xl" style={{ color: '#6366f1' }}></i></div>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Checking your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Subscription Banner for Free Users */}
      {!hasSubscription && userMembership === 'Free' && (
        <div className="max-w-5xl mx-auto mb-4">
          <div className="rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div className="flex items-center gap-3">
              <i className="fas fa-info-circle text-indigo-500 text-xl"></i>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  <span className="font-semibold">Free Plan:</span> {getRemainingUses()} resume {getRemainingUses() === 1 ? 'analysis' : 'analyses'} remaining this month
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/subscription')} className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition">
              Upgrade to Pro →
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm mb-6" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#6366f1' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#6366f1' }}></span>
            </span>
            <span className="text-sm font-medium" style={{ color: '#6366f1' }}>AI-Powered Resume Analysis</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span style={{ color: 'var(--color-text-primary)' }}>Resume & Job </span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Matcher</span>
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Upload your resume and paste the job description to get an accurate match score and personalized questions
          </p>
          
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: hasSubscription ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}>
            <i className={`fas fa-${hasSubscription ? 'crown' : 'user'} text-xs`} style={{ color: hasSubscription ? '#10b981' : '#f59e0b' }}></i>
            <span className="text-xs font-medium" style={{ color: hasSubscription ? '#10b981' : '#f59e0b' }}>
              {hasSubscription ? `${userMembership} Member` : `Free Plan (${getRemainingUses()} left)`}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl shadow-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          
          {/* Upload Section */}
          {!showAnalysis && (
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  <i className="fas fa-file-alt mr-2" style={{ color: '#6366f1' }}></i>
                  Upload Resume *
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive ? 'border-indigo-500' : ''
                  }`}
                  style={{ backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent', borderColor: dragActive ? '#6366f1' : 'var(--color-border)' }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input ref={fileInputRef} type="file" id="resume-upload" className="hidden" 
                         accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                  
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                        <i className="fas fa-cloud-upload-alt text-3xl" style={{ color: '#6366f1' }}></i>
                      </div>
                    </div>
                    <div>
                      <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {file ? file.name : "Drag & drop your resume here"}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {file ? formatFileSize(file.size) : "Supports PDF, DOC, DOCX (Max 5MB)"}
                      </p>
                    </div>
                    {!file && (
                      <label htmlFor="resume-upload"
                        className="inline-block px-4 py-2 text-white font-medium rounded-lg cursor-pointer transition-all text-sm"
                        style={{ backgroundColor: '#6366f1' }}>
                        Browse Files
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Title and Description – always shown, mandatory */}
              <div className="space-y-4 mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Job Title *
                  </label>
                  <input 
                    type="text" 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)} 
                    placeholder="e.g., Senior Frontend Developer" 
                    className="w-full px-4 py-2 rounded-lg border transition-all" 
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Job Description *
                  </label>
                  <textarea 
                    value={jobDescription} 
                    onChange={(e) => setJobDescription(e.target.value)} 
                    placeholder="Paste the full job description here..." 
                    rows="6" 
                    className="w-full px-4 py-2 rounded-lg border transition-all resize-none" 
                    style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} 
                    required
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {jobDescription.length} characters
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <span>Analyzing...</span>
                    <span className="font-semibold" style={{ color: '#6366f1' }}>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
                    <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%`, backgroundColor: '#6366f1' }} />
                  </div>
                </div>
              )}

              {file && !uploading && !showAnalysis && (
                <button onClick={handleUpload} className="w-full mt-6 py-3 px-6 text-white font-semibold rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#6366f1' }}>
                  <i className="fas fa-upload"></i> Analyze & Calculate Match
                </button>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-lg text-center text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <i className="fas fa-exclamation-circle mr-2"></i>{error}
                </div>
              )}
            </div>
          )}

          {/* Analysis Results (themed) */}
          {showAnalysis && (
            <div className="p-8">
              {/* Always show the job title being analyzed */}
              <div className="mb-6 p-3 rounded-lg text-center" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                <i className="fas fa-briefcase mr-2" style={{ color: '#6366f1' }}></i>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Analyzing for: <strong style={{ color: 'var(--color-text-primary)' }}>{jobTitle}</strong>
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                <AtsScoreCircle score={atsScore || 0} />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold mb-2" style={{ color: getScoreColor(atsScore) }}>
                    {getScoreText(atsScore)}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{getScoreMessage(atsScore)}</p>
                  {totalQuestions > 0 && (
                    <p className="text-sm mt-3" style={{ color: '#6366f1' }}>
                      <i className="fas fa-question-circle mr-1"></i>
                      {totalQuestions} personalized questions ready for your interview
                    </p>
                  )}
                </div>
              </div>

              {analysis && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{analysis}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#10b981' }}>
                    <i className="fas fa-check-circle"></i> Skills You Have ({matchedSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">{renderSkills(matchedSkills, 'matched')}</div>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#ef4444' }}>
                    <i className="fas fa-exclamation-triangle"></i> Skills to Develop ({missingSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">{renderSkills(missingSkills, 'missing')}</div>
                </div>
              </div>

              {recommendations.length > 0 && (
                <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                    <i className="fas fa-lightbulb"></i> Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.slice(0, 4).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <i className="fas fa-arrow-right text-xs mt-1" style={{ color: '#f59e0b' }}></i>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ResumeSuggestions suggestions={suggestionsData} score={atsScore} missingSkills={missingSkills} />

              <div className="flex gap-3 mt-6">
                <button onClick={handleUploadAnother} className="flex-1 py-2 border rounded-xl transition-all text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <i className="fas fa-upload mr-2"></i>Upload Another
                </button>
                <button onClick={handleStartInterview} className="flex-1 py-2 text-white rounded-xl transition-all transform hover:-translate-y-1 text-sm" style={{ backgroundColor: '#6366f1' }}>
                  <i className="fas fa-play mr-2"></i>Start Interview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSubscriptionModal && <SubscriptionModal />}
    </div>
  );
};

export default ResumeAnalyzer;