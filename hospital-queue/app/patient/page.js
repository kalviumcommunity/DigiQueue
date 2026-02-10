"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientPage() {
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('patientProfileName') || '';
    const storedPhone = localStorage.getItem('patientProfilePhone') || '';
    setProfileName(storedName);
    setProfilePhone(storedPhone);
  }, []);

  return (
    <div>
      <section className="page-hero">
        <h1>Feel in control of your visit.</h1>
        <p>
          Choose a doctor, grab a token, and watch the queue in real time. We will
          notify you when you are one patient away.
        </p>
        <div>
          <Link className="btn btn-primary" href="/patient/dashboard">
            Start as Patient
          </Link>
        </div>
      </section>

      <section className="card" style={{ maxWidth: '520px' }}>
        <h2>Your Profile</h2>
        {profileName || profilePhone ? (
          <div className="queue-meta">
            <span>
              <strong>Name:</strong> {profileName || 'Not set'}
            </span>
            <span>
              <strong>Phone:</strong> {profilePhone || 'Not set'}
            </span>
          </div>
        ) : (
          <div className="alert alert-info">
            Save your details once to speed up token requests.
          </div>
        )}
        <Link className="btn btn-ghost" href="/patient/login" style={{ marginTop: '12px' }}>
          Edit Profile
        </Link>
      </section>
    </div>
  );
}