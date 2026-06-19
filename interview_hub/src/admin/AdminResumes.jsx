import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BASE_URL from '../config';

// ==================== MOCK MODE ====================
const USE_MOCK = true;

const MOCK_RESUMES = [
  {
    _id: 'r1',
    userId: 'u1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    fileName: 'john_doe_resume.pdf',
    uploadDate: '2025-03-15T10:30:00Z',
    analysis: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      location: 'New York, NY',
      summary: 'Experienced software engineer with 5+ years in full-stack development.',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      totalExperience: '5 years',
      experience: {
        positions: [
          {
            title: 'Senior Frontend Developer',
            company: 'Tech Corp',
            duration: '2021 - Present',
            description: 'Led the development of the company\'s main dashboard.'
          },
          {
            title: 'Frontend Developer',
            company: 'Startup Inc',
            duration: '2018 - 2021',
            description: 'Built responsive web applications.'
          }
        ]
      },
      education: [
        { degree: 'B.Sc. in Computer Science', institution: 'University of Example', year: '2018' }
      ],
      certifications: ['AWS Certified Developer', 'Scrum Master'],
      projects: [
        {
          name: 'E‑commerce Platform',
          technologies: 'React, Node.js, MongoDB',
          description: 'Built a full‑stack e‑commerce site with payment integration.'
        }
      ],
      languages: ['English (Native)', 'Spanish (Intermediate)'],
      strengths: ['Strong problem solver', 'Excellent communication', 'Team player'],
      weakAreas: ['Limited experience with cloud infrastructure', 'Need to improve testing skills'],
      recommendations: [
        'Gain experience with cloud platforms (AWS/Azure)',
        'Improve unit testing coverage',
        'Contribute to open source projects'
      ]
    }
  },
  {
    _id: 'r2',
    userId: 'u2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    fileName: 'jane_smith_resume.docx',
    uploadDate: '2025-03-14T09:15:00Z',
    analysis: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 987 654 321',
      location: 'San Francisco, CA',
      summary: 'Data scientist with 3 years of experience in machine learning.',
      skills: ['Python', 'TensorFlow', 'SQL', 'Data Visualization'],
      totalExperience: '3 years',
      experience: {
        positions: [
          {
            title: 'Data Scientist',
            company: 'AI Labs',
            duration: '2022 - Present',
            description: 'Developed predictive models for customer churn.'
          }
        ]
      },
      education: [
        { degree: 'M.Sc. in Data Science', institution: 'Stanford University', year: '2022' }
      ],
      certifications: [],
      projects: [],
      languages: ['English (Native)'],
      strengths: ['Strong analytical skills', 'Good communicator'],
      weakAreas: ['Limited experience with deep learning'],
      recommendations: ['Take advanced deep learning courses', 'Work on more end‑to‑end projects']
    }
  }
];

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `${BASE_URL}/api;`
};
const API_BASE_URL = getApiBaseUrl();
// ====================================================

const AdminResumes = () => {
  const navigate = useNavigate();
  const { token } = useAdmin();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResumes, setTotalResumes] = useState(0);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (USE_MOCK) {
      setTimeout(() => {
        setResumes(MOCK_RESUMES);
        setTotalPages(1);
        setTotalResumes(MOCK_RESUMES.length);
        setLoading(false);
      }, 500);
      return;
    }
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search
      });
      const res = await fetch(`${API_BASE_URL}/admin/resumes?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch resumes');
      const data = await res.json();
      setResumes(data.resumes);
      setTotalPages(data.totalPages);
      setTotalResumes(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, token]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume upload?')) return;
    if (USE_MOCK) {
      setResumes(resumes.filter(r => r._id !== id));
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/resumes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchResumes();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredResumes = resumes.filter(r =>
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header with back button and centered title */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="sm:justify-self-start">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <i className="fas fa-arrow-left"></i>
              <span className="text-sm sm:text-base">Back</span>
            </button>
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
                Resume Uploads
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span style={{ color: 'var(--color-text-primary)' }}>Resume </span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              View and manage uploaded resumes
            </p>
          </div>
          <div className="hidden sm:block"></div>
        </div>

        {error && (
          <div className="p-4 rounded-lg animate-shake" style={{ backgroundColor: `${'var(--color-error)'}10`, color: 'var(--color-error)' }}>
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }}></i>
          </div>
        </div>

        {/* Resumes Table */}
        <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>User</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>File</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Upload Date</th>
                  <th className="px-2 sm:px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResumes.map((r) => (
                  <tr key={r._id} className="border-b hover:bg-primary/5 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div>
                        <div className="font-medium truncate max-w-[120px] sm:max-w-none" style={{ color: 'var(--color-text-primary)' }}>{r.userName}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{r.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 truncate max-w-[150px] sm:max-w-none" style={{ color: 'var(--color-text-primary)' }}>{r.fileName}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(r.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/resumes/${r._id}`)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 transition-colors mr-1"
                        style={{ color: 'var(--color-text-secondary)' }}
                        title="View Details"
                      >
                        <i className="fas fa-eye text-xs sm:text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors"
                        style={{ color: 'var(--color-error)' }}
                        title="Delete"
                      >
                        <i className="fas fa-trash text-xs sm:text-sm"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredResumes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                      No resumes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p-1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border disabled:opacity-50 hover:bg-primary/10 transition-colors text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Previous
            </button>
            <span className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border disabled:opacity-50 hover:bg-primary/10 transition-colors text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResumes;