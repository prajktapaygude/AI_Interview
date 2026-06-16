// src/admin/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"
             style={{ borderTopColor: 'var(--color-primary)' }} />
        <p className="text-text-secondary">Loading dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;