import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-blue-600">English Learning</h1>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline">Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button>Đăng ký</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
          Học Tiếng Anh Hiệu Quả
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Nâng cao kỹ năng tiếng Anh của bạn với các bài học tương tác và luyện tập chuyên sâu.
        </p>
        <div className="space-x-4">
          <Link to="/register">
            <Button size="lg">Bắt đầu học ngay</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">Đã có tài khoản?</Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Học Từ Vựng & Ngữ Pháp</h3>
            <p className="text-gray-600">
              Khám phá từ vựng theo chủ đề và nắm vững cấu trúc ngữ pháp qua ví dụ thực tế.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-green-600 text-4xl mb-4">🎧</div>
            <h3 className="text-xl font-semibold mb-2">Luyện Nghe & Nói</h3>
            <p className="text-gray-600">
              Cải thiện kỹ năng nghe hiểu và luyện phát âm với các bài tập tương tác.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-purple-600 text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">Đánh Giá Trình Độ</h3>
            <p className="text-gray-600">
              Kiểm tra kiến thức và theo dõi tiến độ học tập của bạn một cách chi tiết.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
          &copy; 2025 English Learning. All rights reserved.
        </div>
      </footer>
    </div>
  );
}