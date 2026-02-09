'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorLoginPage() {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!doctorId || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Simple validation (no real auth yet)
    if (doctorId.trim() && password.trim()) {
      localStorage.setItem('activeDoctorId', doctorId.trim());
      router.push('/doctor/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <h1>Doctor Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Doctor ID:</label>
          <input
            type="text"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            placeholder="Enter your doctor ID"
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
