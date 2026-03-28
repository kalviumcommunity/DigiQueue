"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './patient.css';

export default function PatientLayout({ children }) {
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileReady, setProfileReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('patientProfileName') || '';
    const storedPhone = localStorage.getItem('patientProfilePhone') || '';
    setProfileName(storedName.trim());
    setProfilePhone(storedPhone.trim());
    setProfileReady(Boolean(storedName.trim()) && Boolean(storedPhone.trim()));
  }, [pathname]);

  const initials = useMemo(() => {
    if (!profileName) return 'G';
    const parts = profileName.split(' ').filter(Boolean);
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return `${first}${second}`.toUpperCase();
  }, [profileName]);

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
    setProfileName('');
    setProfileReady(false);
    router.push('/patient/login');
  };

  return (
    <div className="patient-shell">
      <header className="patient-header">
        <div className="brand">
          <span className="brand-mark">DigiQueue</span>
          <span className="brand-sub">Patient Portal</span>
        </div>
        <div className="nav-right">
          <nav className="patient-nav">
            {!profileReady ? (
              <Link className="nav-btn" href="/patient/login">
                Login
              </Link>
            ) : null}
            <Link className="nav-btn" href="/patient/dashboard">
              Dashboard
            </Link>
          </nav>
          <div className="profile-menu">
            <Link className="profile-chip" href="/patient/login">
              <span className="profile-avatar" aria-hidden="true">
                {initials}
              </span>
              <span>{profileName || 'Guest'}</span>
            </Link>
            <div className="profile-popover">
              <div className="profile-popover-title">Profile</div>
              <div className="profile-popover-row">
                <span>Name</span>
                <strong>{profileName || 'Guest'}</strong>
              </div>
              <div className="profile-popover-row">
                <span>Phone</span>
                <strong>{profilePhone || 'Not set'}</strong>
              </div>
              <button type="button" className="btn btn-ghost logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="patient-main">{children}</main>
    </div>
  );
}
