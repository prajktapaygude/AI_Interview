import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';

const USE_MOCK = true;

const MOCK_RESUME = {
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
};

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:5000/api';
};
const API_BASE_URL = getApiBaseUrl();

const AdminResumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdmin();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    setLoading(true);
    setError(null);
    if (USE_MOCK) {
      setTimeout(() => {
        setResume(MOCK_RESUME);
        setLoading(false);
      }, 500);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load resume');
      const data = await res.json();
      setResume(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (USE_MOCK) {
      alert('Notes saved (mock)');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/resumes/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes: adminNotes })
      });
      if (!res.ok) throw new Error('Failed to save notes');
      alert('Notes saved');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-error p-8">{error}</div>;
  if (!resume) return null;

  const a = resume.analysis;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {/* Header with back button and centered title */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="sm:justify-self-start">
            <button
              onClick={() => navigate('/admin/resumes')}
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
                Resume Analysis
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Resume Details
            </h1>
          </div>
          <div className="hidden sm:block"></div>
        </div>

        {/* User & File Info Card */}
        <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow"
             style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>User</p>
              <p className="font-medium text-sm sm:text-base truncate" style={{ color: 'var(--color-text-primary)' }}>{resume.userName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{resume.userEmail}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>File</p>
              <p className="font-medium text-sm sm:text-base truncate" style={{ color: 'var(--color-text-primary)' }}>{resume.fileName}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Uploaded {new Date(resume.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        {(a.name || a.email || a.phone || a.location) && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: `${'var(--color-primary)'}5`, borderColor: 'var(--color-border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-user-circle" style={{ color: 'var(--color-primary)' }}></i>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {a.name && (
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Name</p>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{a.name}</p>
                </div>
              )}
              {a.email && (
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Email</p>
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{a.email}</p>
                </div>
              )}
              {a.phone && (
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Phone</p>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{a.phone}</p>
                </div>
              )}
              {a.location && (
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Location</p>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{a.location}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {a.summary && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: `${'var(--color-primary)'}5`, borderColor: 'var(--color-border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-align-left" style={{ color: 'var(--color-primary)' }}></i>
              Professional Summary
            </h3>
            <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>{a.summary}</p>
          </div>
        )}

        {/* Skills */}
        {a.skills?.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: `${'var(--color-primary)'}5`, borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <i className="fas fa-code" style={{ color: 'var(--color-primary)' }}></i>
                Skills
              </h3>
              <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>{a.skills.length} skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium"
                      style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {a.experience?.positions?.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: `${'var(--color-secondary)'}5`, borderColor: 'var(--color-border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-briefcase" style={{ color: 'var(--color-secondary)' }}></i>
              Work Experience
            </h3>
            <p className="text-xs sm:text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Total: <span className="font-semibold" style={{ color: 'var(--color-secondary)' }}>{a.totalExperience}</span>
            </p>
            {a.experience.positions.map((pos, idx) => (
              <div key={idx} className="mb-3 last:mb-0 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{pos.title}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{pos.company} • {pos.duration}</p>
                {pos.description && <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{pos.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {a.education?.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: `${'var(--color-accent)'}5`, borderColor: 'var(--color-border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-graduation-cap" style={{ color: 'var(--color-accent)' }}></i>
              Education
            </h3>
            {a.education.map((edu, idx) => (
              <div key={idx} className="mb-2 last:mb-0">
                <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{edu.degree}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{edu.institution} • {edu.year}</p>
              </div>
            ))}
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {a.strengths?.length > 0 && (
            <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
                 style={{ backgroundColor: `${'var(--color-success)'}10`, borderColor: 'var(--color-border)' }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                <i className="fas fa-star"></i> Key Strengths
              </h3>
              <ul className="space-y-2">
                {a.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <i className="fas fa-check-circle text-xs mt-0.5" style={{ color: 'var(--color-success)' }}></i> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {a.weakAreas?.length > 0 && (
            <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
                 style={{ backgroundColor: `${'var(--color-error)'}10`, borderColor: 'var(--color-border)' }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-error)' }}>
                <i className="fas fa-exclamation-triangle"></i> Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {a.weakAreas.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <i className="fas fa-arrow-up text-xs mt-0.5" style={{ color: 'var(--color-error)' }}></i> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {a.recommendations?.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ background: `linear-gradient(to bottom right, ${'var(--color-primary)'}10, ${'var(--color-secondary)'}10)`, borderColor: 'var(--color-border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-lightbulb" style={{ color: 'var(--color-primary)' }}></i> Recommendations
            </h3>
            <ul className="space-y-2">
              {a.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <i className="fas fa-arrow-right text-xs mt-0.5" style={{ color: 'var(--color-primary)' }}></i> {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Projects */}
        {a.projects?.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: `${'var(--color-primary)'}5`, borderColor: 'var(--color-border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-project-diagram" style={{ color: 'var(--color-primary)' }}></i> Projects
            </h3>
            {a.projects.map((proj, idx) => (
              <div key={idx} className="mb-3 last:mb-0 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{proj.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{proj.technologies}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {a.certifications?.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: `${'var(--color-secondary)'}5`, borderColor: 'var(--color-border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-certificate" style={{ color: 'var(--color-secondary)' }}></i> Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {a.certifications.map((cert, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg text-xs sm:text-sm"
                      style={{ backgroundColor: `${'var(--color-secondary)'}15`, color: 'var(--color-secondary)' }}>
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {a.languages?.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
               style={{ backgroundColor: `${'var(--color-accent)'}5`, borderColor: 'var(--color-border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-language" style={{ color: 'var(--color-accent)' }}></i> Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {a.languages.map((lang, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg text-xs sm:text-sm"
                      style={{ backgroundColor: `${'var(--color-accent)'}15`, color: 'var(--color-accent)' }}>
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
             style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Admin Notes</h3>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows="4"
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all"
            style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            placeholder="Add your notes about this resume..."
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSaveNotes}
              className="w-full sm:w-auto px-6 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
            >
              <i className="fas fa-save"></i> Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResumeDetails;