import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h2>Register</h2>
      {error ? <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div> : null}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            await register({ name, email, password });
            nav('/');
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit">Create</button>
      </form>
      <div style={{ marginTop: 12 }}>
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
