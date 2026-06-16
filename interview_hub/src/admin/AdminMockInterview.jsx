import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminInterviewSessions from './AdminInterviewSessions';
import AdminInterviewConfig from './AdminInterviewConfig';
import AdminInterviewAnalytics from './AdminInterviewAnalytics';

const AdminMockInterview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sessions');

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="sm:justify-self-start">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span style={{ color: 'var(--color-text-primary)' }}>Interview </span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              View sessions, configure settings, and analyze performance
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex gap-2">
            {['sessions', 'configuration', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 capitalize ${
                  activeTab === tab ? 'text-primary border-b-2' : ''
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

        {/* Content */}
        <div>
          {activeTab === 'sessions' && <AdminInterviewSessions />}
          {activeTab === 'configuration' && <AdminInterviewConfig />}
          {activeTab === 'analytics' && <AdminInterviewAnalytics />}
        </div>
      </div>
    </div>
  );
};

export default AdminMockInterview;