'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function GetTokenForm() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');

  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [queue, setQueue] = useState(null);
  const [queueLoading, setQueueLoading] = useState(true);
  const [profileHint, setProfileHint] = useState('');
  const [profileReady, setProfileReady] = useState(null);
  const [patientTokens, setPatientTokens] = useState([]);

  if (!doctorId) {
    return (
      <section className="card">
        <h2>Doctor not selected</h2>
        <p>Please choose a doctor from the dashboard before getting a token.</p>
        <Link className="btn btn-primary" href="/patient/dashboard">
          Go to Dashboard
        </Link>
      </section>
    );
  }

  useEffect(() => {
    let isMounted = true;

    const fetchQueue = async () => {
      try {
        setQueueLoading(true);
        const res = await fetch(`/api/queues?doctorId=${doctorId}`);
        if (!res.ok) {
          throw new Error('Queue not found');
        }
        const data = await res.json();
        if (isMounted) {
          setQueue(data);
        }
      } catch (err) {
        if (isMounted) {
          setQueue(null);
        }
      } finally {
        if (isMounted) {
          setQueueLoading(false);
        }
      }
    };

    if (doctorId) {
      fetchQueue();
    }

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('patientProfileName') || '';
    const storedPhone = localStorage.getItem('patientProfilePhone') || '';
    const storedTokens = localStorage.getItem('patientTokens');
    let parsedTokens = [];

    if (storedTokens) {
      try {
        parsedTokens = JSON.parse(storedTokens) || [];
      } catch (err) {
        parsedTokens = [];
      }
    }

    if (!Array.isArray(parsedTokens) || parsedTokens.length === 0) {
      const legacyTokenNo = Number(localStorage.getItem('patientTokenNo'));
      const legacyQueueId = Number(localStorage.getItem('patientQueueId'));
      const legacyDoctorId = Number(localStorage.getItem('patientDoctorId'));

      if (
        Number.isFinite(legacyTokenNo) &&
        legacyTokenNo > 0 &&
        Number.isFinite(legacyQueueId) &&
        legacyQueueId > 0 &&
        Number.isFinite(legacyDoctorId) &&
        legacyDoctorId > 0
      ) {
        parsedTokens = [
          {
            doctorId: legacyDoctorId,
            queueId: legacyQueueId,
            tokenNo: legacyTokenNo,
          },
        ];
        localStorage.setItem('patientTokens', JSON.stringify(parsedTokens));
        localStorage.removeItem('patientTokenNo');
        localStorage.removeItem('patientQueueId');
        localStorage.removeItem('patientDoctorId');
      }
    }

    setProfileReady(Boolean(storedName.trim()) && Boolean(storedPhone.trim()));
    setPatientTokens(Array.isArray(parsedTokens) ? parsedTokens : []);

    if (storedName && !patientName) {
      setPatientName(storedName);
    }

    if (storedPhone && !phoneNumber) {
      setPhoneNumber(storedPhone);
    }

    if (storedName || storedPhone) {
      setProfileHint('Using your saved profile. You can edit it before submitting.');
    }
  }, []);

  if (profileReady === false) {
    return (
      <section className="card" style={{ maxWidth: '520px' }}>
        <h2>Complete your profile first</h2>
        <p>Save your name and phone number before requesting a token.</p>
        <Link className="btn btn-primary" href="/patient/login">
          Go to Patient Login
        </Link>
      </section>
    );
  }

  const numericDoctorId = Number(doctorId);
  const existingToken = patientTokens.find(
    (token) => Number(token.doctorId) === Number(numericDoctorId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      if (existingToken) {
        throw new Error('You already have a token for this doctor');
      }

      if (!queue?.id || !queue.isActive) {
        throw new Error('Queue is not active for this doctor');
      }

      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queueId: queue.id,
          patientName,
          phone: phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create token');
      }

      const data = await response.json();
      setToken(data.tokenNo);
      if (typeof window !== 'undefined') {
        const nextTokens = [
          ...patientTokens,
          {
            doctorId: Number(doctorId),
            queueId: Number(queue.id),
            tokenNo: Number(data.tokenNo),
          },
        ];
        localStorage.setItem('patientTokens', JSON.stringify(nextTokens));
        setPatientTokens(nextTokens);
      }
      setPatientName('');
      setPhoneNumber('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="page-hero">
        <h1>Get Your Token</h1>
        <p>Enter your details and we will reserve your place in the queue.</p>
        <div>
          <Link className="btn btn-ghost" href="/patient/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </section>

      {queueLoading && <div className="alert alert-info">Checking queue...</div>}
      {!queueLoading && !queue?.isActive ? (
        <div className="alert alert-warn">Queue is not active for this doctor.</div>
      ) : null}

      {existingToken ? (
        <div className="alert alert-warn">
          You already have token {existingToken.tokenNo} for this doctor.
        </div>
      ) : null}

      {profileHint ? <div className="alert alert-info">{profileHint}</div> : null}

      {token && (
        <section className="card" style={{ marginBottom: '20px' }}>
          <h2>Token Created Successfully</h2>
          <div className="queue-meta">
            <span>Your Token Number</span>
            <span className="token-tile">{token}</span>
          </div>
          <p className="queue-meta" style={{ marginTop: '10px' }}>
            You will get a notification when you are one patient away.
          </p>
          <Link className="btn btn-primary" href="/patient/dashboard" style={{ marginTop: '12px' }}>
            View Live Status
          </Link>
        </section>
      )}

      {error && <div className="alert alert-warn">Error: {error}</div>}

      <section className="card" style={{ maxWidth: '520px' }}>
        <form onSubmit={handleSubmit} className="form">
          <div>
            <label className="label">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
              className="input"
              disabled={Boolean(existingToken)}
            />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="input"
              disabled={Boolean(existingToken)}
            />
          </div>

          <button type="submit" disabled={loading || Boolean(existingToken)} className="btn btn-primary">
            {existingToken ? 'Token Already Issued' : loading ? 'Getting Token...' : 'Get Token'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function GetToken() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GetTokenForm />
    </Suspense>
  );
}
