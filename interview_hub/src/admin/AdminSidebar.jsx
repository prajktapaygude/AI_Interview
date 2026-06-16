import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, isSuperAdmin, logout } = useAdmin();

  const baseMenuItems = [
    { path: '/admin-dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/subjects', icon: '📚', label: 'Subjects' },
    { path: '/admin/mock-interview', icon: '🎯', label: 'Interviews' }, 
   { path: '/admin/resumes', icon: '📄', label: 'Resumes' },
    { path: '/admin/resources', icon: '📚', label: 'Resources' },
  ];

  const menuItems = isSuperAdmin 
    ? [...baseMenuItems, { path: '/admin/admins', icon: '👨‍💼', label: 'Admins' }]
    : baseMenuItems;


  const superAdminItems = [
    { path: '/admin/add-admin', icon: '➕', label: 'Add Admin' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
    { path: '/admin/logs', icon: '📊', label: 'System Logs' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="h-full w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r flex flex-col"
           style={{ borderColor: 'var(--color-border)' }}>
      
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b"
           style={{ borderColor: 'var(--color-border)' }}>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI Mentor Admin
        </h1>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-sm text-text-secondary">Logged in as</p>
        <p className="font-semibold text-text-primary truncate">{admin?.name || 'Admin'}</p>
        <p className="text-xs text-text-secondary mt-1">
          {isSuperAdmin ? 'Super Admin' : 'Admin'}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <div className="my-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Super Admin Tools
              </p>
            </div>
            
            {superAdminItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;