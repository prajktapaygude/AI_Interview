import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../ThemeToggle';
import { useAdmin } from '../context/AdminContext';
import AdminSidebar from './AdminSidebar';   // make sure this path is correct

const AdminHeader = () => {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b sticky top-0 z-20 flex items-center px-4 sm:px-6 lg:px-8"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex-1 flex items-center justify-between">
        {/* Mobile menu button (hamburger) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-primary/10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Placeholder for page title – can be filled dynamically */}
        <div className="flex-1 lg:ml-0"></div>

        {/* Right side: theme toggle + mobile profile */}
        <div className="flex items-center gap-4 ml-auto">
          <ThemeToggle />

          {/* Admin avatar – only visible on mobile (lg:hidden) */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {admin?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl">
            <AdminSidebar />
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;