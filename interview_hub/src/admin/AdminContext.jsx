import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  // Try to get token from multiple keys for compatibility
  const getStoredToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Try to get admin data from both possible keys
      const storedAdmin = localStorage.getItem('admin') || localStorage.getItem('user');
      if (storedAdmin) {
        try {
          const parsed = JSON.parse(storedAdmin);
          // Check if it has admin role
          if (parsed.role === 'admin' || parsed.role === 'superadmin') {
            setAdmin(parsed);
          } else {
            // Not admin, clear token
            logout();
          }
        } catch (e) {
          console.error('Failed to parse admin data', e);
          logout();
        }
      } else {
        // No admin data, token might be invalid
        // Optionally validate token with backend, but to avoid extra calls, we'll keep token
        // but admin stays null. User will see unauthorized.
      }
    }
    setLoading(false);
  }, [token]);

  const login = (adminData, authToken) => {
    setAdmin(adminData);
    setToken(authToken);
    localStorage.setItem('adminToken', authToken);
    localStorage.setItem('admin', JSON.stringify(adminData));
    // Also clear any user token to avoid confusion
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    // Also clear user tokens if any
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!admin,
    isSuperAdmin: admin?.role === 'superadmin',
    isAdmin: admin?.role === 'admin' || admin?.role === 'superadmin'
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};