'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientTokens, setPatientTokens] = useState([]);
  const [tokenStatuses, setTokenStatuses] = useState({});
  const [tokenErrors, setTokenErrors] = useState({});
  const [queueLoading, setQueueLoading] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileReady, setProfileReady] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

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

    setPatientTokens(parsedTokens);
    setProfileName(storedName);
    setProfilePhone(storedPhone);
    setProfileReady(Boolean(storedName.trim()) && Boolean(storedPhone.trim()));
  }, []);

  useEffect(() => {
    if (!patientTokens.length) {
      setTokenStatuses({});
      setTokenErrors({});
      setQueueLoading(false);
      return;
    }

    let isMounted = true;

    const fetchAllQueues = async () => {
      try {
        setQueueLoading(true);
        const results = await Promise.all(
          patientTokens.map(async (token) => {
            const response = await fetch(`/api/queue-live?queueId=${token.queueId}`);
            if (!response.ok) {
              throw new Error('Queue not found');
            }
            const data = await response.json();
            return { queueId: token.queueId, data };
          })
        );

        if (!isMounted) return;

        const nextStatuses = {};
        results.forEach((item) => {
          nextStatuses[item.queueId] = item.data;
        });
        setTokenStatuses(nextStatuses);
        setTokenErrors({});
      } catch (err) {
        if (!isMounted) return;
        setTokenErrors((prev) => ({ ...prev, general: 'Failed to load queue status' }));
      } finally {
        if (isMounted) {
          setQueueLoading(false);
        }
      }
    };

    fetchAllQueues();
    const interval = setInterval(fetchAllQueues, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [patientTokens]);

  useEffect(() => {
    if (!patientTokens.length) return;

    patientTokens.forEach((token) => {
      const queueLive = tokenStatuses[token.queueId];
      if (!queueLive) return;

      const current = Number(queueLive.currentToken);
      if (!Number.isFinite(current)) return;

      const oneBefore = token.tokenNo - 1;
      const notifyKey = `patientPreTurnNotified:${token.queueId}:${token.tokenNo}`;

      if (current === oneBefore) {
        if (typeof window !== 'undefined' && !localStorage.getItem(notifyKey)) {
          const sendNotification = () => {
            if (!('Notification' in window)) return;
            if (Notification.permission === 'granted') {
              new Notification('You are almost up', {
                body: `Your token is ${token.tokenNo}. Please be ready.`,
              });
            }
          };

          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                sendNotification();
              }
            });
          } else {
            sendNotification();
          }

          localStorage.setItem(notifyKey, '1');
        }

        if (typeof window !== 'undefined') {
          const toastKey = `patientPreTurnToast:${token.queueId}:${token.tokenNo}`;
          if (!localStorage.getItem(toastKey)) {
            setToastType('info');
            setToastMessage('Heads up! You are one patient away. Please get ready.');
            localStorage.setItem(toastKey, '1');
          }
        }
      }

      if (current >= token.tokenNo) {
        if (typeof window !== 'undefined') {
          const toastKey = `patientTurnToast:${token.queueId}:${token.tokenNo}`;
          if (!localStorage.getItem(toastKey)) {
            setToastType('warn');
            setToastMessage('It is your turn now. Please proceed to the desk.');
            localStorage.setItem(toastKey, '1');
          }
        }
      }
    });
  }, [patientTokens, tokenStatuses]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => {
      setToastMessage('');
      setToastType('');
    }, 6000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const handleClearToken = (queueId) => {
    if (typeof window === 'undefined') return;
    const nextTokens = patientTokens.filter((token) => token.queueId !== queueId);
    setPatientTokens(nextTokens);
    localStorage.setItem('patientTokens', JSON.stringify(nextTokens));
  };

  const hasTokenForDoctor = (doctorId) =>
    patientTokens.some((token) => token.doctorId === doctorId);

  if (profileReady === false) {
    return (
      <section className="card" style={{ maxWidth: '520px' }}>
        <h2>Complete your profile first</h2>
        <p>We need your name and phone number before you can enter the dashboard.</p>
        <Link className="btn btn-primary" href="/patient/login">
          Go to Patient Login
        </Link>
      </section>
    );
  }

  return (
    <div>
      {toastMessage ? (
        <div className={`toast ${toastType === 'warn' ? 'toast-warn' : 'toast-info'}`}>
          {toastMessage}
        </div>
      ) : null}
      <section className="page-hero">
        <h1>Patient Dashboard</h1>
        <p>Track your token, see the live queue, and get a heads-up before your turn.</p>
      </section>

      {loading && <div className="alert alert-info">Loading doctors...</div>}
      {error && <div className="alert alert-warn">Error: {error}</div>}

      {patientTokens.length ? (
        <section className="card" aria-live="polite">
          <h2>Your Tokens</h2>
          {queueLoading ? <p>Loading live status...</p> : null}
          {tokenErrors.general ? (
            <p className="alert alert-warn">{tokenErrors.general}</p>
          ) : null}
          <div className="card-grid" style={{ marginTop: '16px' }}>
            {patientTokens.map((token) => {
              const queueLive = tokenStatuses[token.queueId];
              const current = queueLive?.currentToken;
              const isYourTurn =
                current != null ? Number(current) >= Number(token.tokenNo) : false;
              const tokensAhead =
                current != null
                  ? Math.max(Number(token.tokenNo) - Number(current) - 1, 0)
                  : null;
              const doctor = doctors.find((doc) => doc.id === token.doctorId);

              return (
                <article key={token.queueId} className="card" style={{ padding: '16px' }}>
                  <h3>{doctor ? doctor.name : `Doctor #${token.doctorId}`}</h3>
                  <div className="queue-meta">
                    <span>
                      <strong>Your Token:</strong> <span className="token-tile">{token.tokenNo}</span>
                    </span>
                    <span>
                      <strong>Now Serving:</strong>{' '}
                      {queueLive?.currentToken != null ? queueLive.currentToken : 'N/A'}
                    </span>
                    <span>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`status-pill ${
                          queueLive?.status === 'ACTIVE' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {queueLive?.status || 'Unknown'}
                      </span>
                    </span>
                    <span>
                      <strong>Tokens Ahead:</strong> {tokensAhead != null ? tokensAhead : 'N/A'}
                    </span>
                    <span>
                      <strong>Your Turn:</strong> {isYourTurn ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleClearToken(token.queueId)}
                    className="btn btn-ghost"
                    style={{ marginTop: '12px' }}
                  >
                    Remove Token
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="alert alert-info">
          No saved tokens yet. Choose a doctor below to get started.
        </section>
      )}

      <section className="card" style={{ marginTop: '20px' }}>
        <h2>Available Doctors</h2>
        {doctors.length === 0 ? (
          <p>No doctors available</p>
        ) : (
          <div className="card-grid" style={{ marginTop: '16px' }}>
            {doctors.map((doctor) => (
              <article key={doctor.id} className="card" style={{ padding: '16px' }}>
                <h3>{doctor.name}</h3>
                <p className="queue-meta">
                  <span>
                    <strong>Specialization:</strong> {doctor.specialization}
                  </span>
                </p>
                <span
                  className={`status-pill ${
                    doctor.queueActive ? 'status-active' : 'status-inactive'
                  }`}
                >
                  {doctor.queueActive ? 'Active' : 'Inactive'}
                </span>
                <div style={{ marginTop: '12px' }}>
                  {hasTokenForDoctor(doctor.id) ? (
                    <button type="button" className="btn btn-ghost btn-disabled" disabled>
                      Token Active
                    </button>
                  ) : (
                    <Link className="btn btn-primary" href={`/patient/get-token?doctorId=${doctor.id}`}>
                      Get Token
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
