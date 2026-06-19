import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import BASE_URL from '../config';


const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Sidebar - fixed on desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-30">
        <AdminSidebar />
      </div>

      {/* Main content area */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;