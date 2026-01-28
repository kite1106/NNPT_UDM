import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { Dashboard } from '../components/admin/Dashboard';
import { UsersManagement } from '../components/admin/UsersManagement';
import { LessonsManagement } from '../components/admin/LessonsManagement';
import { QuizzesManagement } from '../components/admin/QuizzesManagement';

export default function AdminPage() {
  const { user, accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin, if not redirect
  useEffect(() => {
    // If no token at all, redirect to login
    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }

    // If user data loaded, check role
    if (user) {
      if (user.role !== 'admin') {
        navigate('/', { replace: true });
      } else {
        // User is admin, stop loading
        setIsLoading(false);
      }
    }
    // If user still loading (null), keep waiting (loading state = true)
  }, [user, accessToken, navigate]);

  // Show loading while waiting for user data
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
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

  // Handle sidebar navigation
  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar with navigation support */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-lg z-40 transform transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Admin Panel
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="mt-8 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'lessons', label: 'Lessons', icon: '📚' },
            { id: 'quizzes', label: 'Quizzes', icon: '❓' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors text-left"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-slate-800 text-white p-2 rounded"
      >
        ☰
      </button>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
