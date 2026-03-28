'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientLogin() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('patientProfileName') || '';
    const storedPhone = localStorage.getItem('patientProfilePhone') || '';
    setName(storedName);
    setPhone(storedPhone);
    setHasProfile(Boolean(storedName.trim()) && Boolean(storedPhone.trim()));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (typeof window === 'undefined') return;
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required');
      return;
    }

    try {
      const response = await fetch('/api/auth/patient-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to login');
        return;
      }
    } catch {
      setError('Failed to login');
      return;
    }

    localStorage.setItem('patientProfileName', name.trim());
    localStorage.setItem('patientProfilePhone', phone.trim());
    setSaved(true);
    setHasProfile(Boolean(name.trim()) && Boolean(phone.trim()));
  };

  const handleLogout = async () => {
    if (typeof window === 'undefined') return;
    try {
      await fetch('/api/auth/patient-logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('patientProfileName');
    localStorage.removeItem('patientProfilePhone');
    localStorage.removeItem('patientTokenNo');
    localStorage.removeItem('patientQueueId');
    localStorage.removeItem('patientDoctorId');
    localStorage.removeItem('patientTokens');
    setName('');
    setPhone('');
    setSaved(false);
    setHasProfile(false);
  };

  return (
    <div>
      <section className="page-hero">
        <h1>Patient Login</h1>
        <p>Save your details once and reuse them for every token request.</p>
        <div>
          <Link className="btn btn-ghost" href="/patient/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </section>

      {saved && (
        <div className="alert alert-success">Profile saved successfully.</div>
      )}
      {error ? <div className="alert alert-warn">{error}</div> : null}

      {hasProfile ? (
        <div className="card" style={{ maxWidth: '520px', marginBottom: '20px' }}>
          <h2>Logged in as</h2>
          <div className="queue-meta">
            <span>
              <strong>Name:</strong> {name}
            </span>
            <span>
              <strong>Phone:</strong> {phone}
            </span>
          </div>
          <button className="btn btn-ghost logout-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : null}

      <section className="card" style={{ maxWidth: '520px' }}>
        <form onSubmit={handleSubmit} className="form">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
              required
            />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setSaved(false);
              }}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Save Profile
          </button>
        </form>
      </section>
    </div>
  );
}
