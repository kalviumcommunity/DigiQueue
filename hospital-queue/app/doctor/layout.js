"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import '../portal.css';

export default function DoctorLayout({ children }) {
  const [doctorName, setDoctorName] = useState('');
  const [doctorReady, setDoctorReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('doctorName') || '';
    const storedId = localStorage.getItem('doctorId') || '';
    setDoctorName(storedName.trim());
    setDoctorReady(Boolean(storedId));
  }, [pathname]);

  const initials = useMemo(() => {
    if (!doctorName) return 'D';
    const parts = doctorName.split(' ').filter(Boolean);
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return `${first}${second}`.toUpperCase();
  }, [doctorName]);

  const handleLogout = async () => {
    if (typeof window === 'undefined') return;
    try {
      await fetch('/api/auth/doctor-logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('doctorId');
    localStorage.removeItem('doctorName');
    localStorage.removeItem('doctorUserId');
    setDoctorName('');
    setDoctorReady(false);
    router.push('/doctor/login');
  };

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-brand">
          <span className="portal-mark">DigiQueue</span>
          <span className="portal-sub">Doctor Portal</span>
        </div>
        <div className="portal-right">
          <nav className="portal-nav">
            {!doctorReady ? (
              <Link className="nav-btn" href="/doctor/login">
                Login
              </Link>
            ) : null}
            <Link className="nav-btn" href="/doctor/dashboard">
              Dashboard
            </Link>
            {doctorReady ? (
              <button type="button" className="nav-btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            ) : null}
          </nav>
          <span className="profile-chip">
            <span className="profile-avatar" aria-hidden="true">
              {initials}
            </span>
            <span>{doctorName || 'Doctor'}</span>
          </span>
        </div>
      </header>
      <main className="portal-main">
        <div className="portal-page">{children}</div>
      </main>
    </div>
  );
}
