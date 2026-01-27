import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/Button.jsx';

const API_BASE = 'http://localhost:5000';

export default function AdminPage() {
  const { accessToken } = useAuth();
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadTopics() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/topics`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setOut('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý Topics</h2>
          <Button onClick={loadTopics} disabled={loading}>
            {loading ? 'Đang tải...' : 'Load topics'}
          </Button>
          <pre className="mt-4 bg-gray-900 text-green-400 p-4 rounded overflow-auto whitespace-pre-wrap">
            {out || 'Chưa có dữ liệu'}
          </pre>
        </div>
      </main>
    </div>
  );
}
