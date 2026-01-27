import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password });
      nav('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Đăng ký</h2>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input
            label="Họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Đăng nhập ngay
          </Link>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
