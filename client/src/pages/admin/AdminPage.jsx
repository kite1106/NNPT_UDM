import React, { useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { Dashboard } from '../components/admin/Dashboard';
import { UsersManagement } from '../components/admin/UsersManagement';
import { LessonsManagement } from '../components/admin/LessonsManagement';
import { QuizzesManagement } from '../components/admin/QuizzesManagement';

export function AdminPage({ user, accessToken, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogout = () => {
    setSidebarOpen(false);
    onLogout();
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard accessToken={accessToken} />;
      case 'users':
        return <UsersManagement accessToken={accessToken} />;
      case 'lessons':
        return <LessonsManagement accessToken={accessToken} />;
      case 'quizzes':
        return <QuizzesManagement accessToken={accessToken} />;
      default:
        return <Dashboard accessToken={accessToken} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
