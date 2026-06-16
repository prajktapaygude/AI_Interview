import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';

const AccessDenied = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdmin();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
          <i className="fas fa-ban text-4xl text-red-500"></i>
        </div>
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
          Access Denied
        </h1>
        <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">
          Insufficient permissions
        </p>
        <p className="text-sm mb-8 text-gray-500 dark:text-gray-400">
          {admin?.role === 'superadmin' 
            ? 'Contact support for assistance.' 
            : `Your role (${admin?.role || 'admin'}) does not have access to this page. Super Admin privileges required.`
          }
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Go to Dashboard
          </button>
          <button
            onClick={logout}
            className="w-full border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;

