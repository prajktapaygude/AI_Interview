import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BASE_URL from '../config';

const USE_MOCK = false;

const MOCK_SESSION = {
  _id: 's1',
  userName: 'John Doe',
  userEmail: 'john@example.com',
  role: 'Frontend Developer',
  techStack: 'React',
  level: 'mid',
  difficulty: 'medium',
  duration: 15,
  overallScore: 82,
  startTime: '2025-03-15T10:30:00Z',
  answers: [
    {
      question: 'What is the virtual DOM in React?',
      answer: 'It is a lightweight copy of the actual DOM that React uses to improve performance.',
      evaluation: {
        score: 8,
        strengths: ['Good understanding of concept', 'Clear explanation'],
        weaknesses: ['Could mention diffing algorithm'],
        suggestions: ['Explain how reconciliation works']
      }
    },
    {
      question: 'Explain the useEffect hook.',
      answer: 'useEffect lets you perform side effects in functional components.',
      evaluation: {
        score: 7,
        strengths: ['Correct definition'],
        weaknesses: ['Lacks examples', 'No mention of dependency array'],
        suggestions: ['Provide a simple example', 'Explain cleanup function']
      }
    }
  ]
};

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `${BASE_URL}/api`;
};
const API_BASE_URL = getApiBaseUrl();

const AdminInterviewSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdmin();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSessions = async () => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/interview/sessions?page=1&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    console.log("API:", data);

    setSessions(data.sessions); // ✅ FIX
  } catch (err) {
    console.error(err);
  }
};

  const handleSaveNotes = async () => {
    if (USE_MOCK) {
      alert('Notes saved (mock)');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/interview/sessions/${id}/notes`, {
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
  if (!session) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={() => navigate('/admin/mock-interview')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <i className="fas fa-arrow-left"></i>
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          </h1>
        </div>

        {/* Session summary card */}
        <div className="p-4 sm:p-6 rounded-xl border hover:shadow-lg transition-shadow"
             style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>User</p>
              <p className="font-medium text-sm sm:text-base truncate" style={{ color: 'var(--color-text-primary)' }}>{session.userName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{session.userEmail}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Role / Tech</p>
              <p className="font-medium text-sm sm:text-base truncate" style={{ color: 'var(--color-text-primary)' }}>{session.role}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{session.techStack}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Level / Difficulty</p>
              <p className="font-medium text-sm sm:text-base capitalize" style={{ color: 'var(--color-text-primary)' }}>{session.level}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>{session.difficulty}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Score</p>
              <p className={`text-xl sm:text-2xl font-bold ${
                session.overallScore >= 80 ? 'text-success' :
                session.overallScore >= 60 ? 'text-accent' : 'text-error'
              }`}>
                {session.overallScore}%
              </p>
            </div>
          </div>
        </div>

        {/* Q&A List */}
        <h2 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Questions & Answers</h2>
        <div className="space-y-4">
          {session.answers.map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 rounded-xl border hover:shadow-lg transition-shadow"
                 style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>
                  Q{idx+1}: {item.question}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                  item.evaluation.score >= 8 ? 'bg-green-100 text-green-700' :
                  item.evaluation.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  Score: {item.evaluation.score}/10
                </span>
              </div>
              <div className="mb-3">
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>User's answer:</p>
                <p className="text-sm pl-3 border-l-2" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>{item.answer}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {item.evaluation.strengths && (
                  <div>
                    <p className="font-medium text-success mb-1">Strengths</p>
                    <ul className="list-disc list-inside space-y-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {item.evaluation.weaknesses && (
                  <div>
                    <p className="font-medium text-error mb-1">Weaknesses</p>
                    <ul className="list-disc list-inside space-y-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
                {item.evaluation.suggestions && (
                  <div>
                    <p className="font-medium text-accent mb-1">Suggestions</p>
                    <ul className="list-disc list-inside space-y-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.evaluation.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

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
            placeholder="Add your notes about this interview..."
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

export default AdminInterviewSessionDetails;
