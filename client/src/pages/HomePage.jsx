import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/Button.jsx';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-blue-600">English Learning</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Xin chào, {user?.name || user?.email}</span>
            <Button variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Chào mừng trở lại!</h2>
        <p className="text-xl text-gray-600 mb-8">
          Tiếp tục hành trình học tiếng Anh của bạn ngay hôm nay.
        </p>
        <div className="space-x-4">
          <Link to="/topics">
            <Button size="lg">Xem chủ đề học</Button>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin">
              <Button variant="secondary" size="lg">Quản lý hệ thống</Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
