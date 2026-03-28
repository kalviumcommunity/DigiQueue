'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorLoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!userId || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/doctor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      const data = await res.json();
      
      // Store doctor info in localStorage
      localStorage.setItem('doctorId', data.id);
      localStorage.setItem('doctorName', data.name);
      localStorage.setItem('doctorUserId', data.userId);
      
      router.push('/doctor/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="portal-center">
      <div className="card" style={{ maxWidth: '460px', width: '100%' }}>
        <section className="page-hero" style={{ marginBottom: '16px' }}>
          <h1>Doctor Login</h1>
          <p>Access your queue dashboard and manage patient flow.</p>
        </section>

        {error && <div className="alert alert-warn">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div>
            <label className="label">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
              className="input"
              disabled={loading}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '16px', color: 'var(--muted)', fontSize: '14px' }}>
          Contact admin if you forgot your credentials.
        </p>
      </div>
    </div>
  );
}
