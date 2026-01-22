import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE = 'http://localhost:5000';

export default function AdminPage() {
  const { accessToken } = useAuth();
  const [out, setOut] = useState('');

  async function loadTopics() {
    const res = await fetch(`${API_BASE}/api/admin/topics`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setOut(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h2>Admin</h2>
      <button onClick={loadTopics}>Load topics</button>
      <pre style={{ marginTop: 12, background: '#111', color: '#0f0', padding: 12, overflow: 'auto' }}>
        {out}
      </pre>
    </div>
  );
}
