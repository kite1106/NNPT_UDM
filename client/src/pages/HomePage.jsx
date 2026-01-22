import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h2>Home</h2>
      <div style={{ marginBottom: 12 }}>Logged in as: {user?.email} ({user?.role})</div>
      {user?.role === 'admin' ? (
        <div style={{ marginBottom: 12 }}>
          <Link to="/admin">Go to Admin</Link>
        </div>
      ) : null}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
