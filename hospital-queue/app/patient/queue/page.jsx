'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PatientQueuePage() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');

  const [currentToken, setCurrentToken] = useState(null);
  const [queueActive, setQueueActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueId, setQueueId] = useState(null);
  const [resolvedDoctorId, setResolvedDoctorId] = useState(null);
  const [savedToken, setSavedToken] = useState(null);

  useEffect(() => {
    const parsed = Number(doctorId);
    if (Number.isFinite(parsed) && parsed > 0) {
      setResolvedDoctorId(parsed);
      return;
    }

    if (typeof window !== 'undefined') {
      const storedDoctor = Number(localStorage.getItem('patientDoctorId'));
      setResolvedDoctorId(Number.isFinite(storedDoctor) ? storedDoctor : null);
      const tokenNo = Number(localStorage.getItem('patientTokenNo'));
      setSavedToken(Number.isFinite(tokenNo) && tokenNo > 0 ? tokenNo : null);
    }
  }, [doctorId]);

  useEffect(() => {
    let isMounted = true;

    const fetchQueue = async () => {
      try {
        if (!resolvedDoctorId) return;
        const res = await fetch(`/api/queues?doctorId=${resolvedDoctorId}`);
        if (!res.ok) {
          throw new Error('Queue not found');
        }
        const data = await res.json();
        if (isMounted) {
          setQueueId(data?.id || null);
        }
      } catch (err) {
        if (isMounted) {
          setQueueId(null);
        }
      }
    };

    if (resolvedDoctorId) {
      fetchQueue();
    }

    return () => {
      isMounted = false;
    };
  }, [resolvedDoctorId]);

  useEffect(() => {
    if (!queueId) {
      setLoading(false);
      setCurrentToken(null);
      setQueueActive(false);
      return;
    }

    const fetchQueueStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/queue-live?queueId=${queueId}`);
        if (!response.ok) {
          throw new Error('Queue not found');
        }
        const data = await response.json();
        setCurrentToken(data.currentToken ?? null);
        setQueueActive(data.status === 'ACTIVE');
        setError(null);
      } catch (err) {
        setError('Failed to fetch queue status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchQueueStatus();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchQueueStatus, 5000);

    return () => clearInterval(interval);
  }, [queueId]);

  if (!resolvedDoctorId) {
    return (
      <section className="card">
        <h2>No doctor selected</h2>
        <p>Select a doctor on the dashboard to view live queue status.</p>
        <Link className="btn btn-primary" href="/patient/dashboard">
          Go to Dashboard
        </Link>
      </section>
    );
  }

  if (loading) return <div className="alert alert-info">Loading queue status...</div>;
  if (error) return <div className="alert alert-warn">{error}</div>;
  if (currentToken === null) return <div className="alert alert-warn">No queue data available</div>;

  return (
    <div>
      <section className="page-hero">
        <h1>Live Queue</h1>
        <p>Keep an eye on the queue in real time.</p>
        <div>
          <Link className="btn btn-ghost" href="/patient/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </section>

      <section className="card">
        <h2>Queue Status</h2>
        <div className="queue-meta">
          <span>
            <strong>Now Serving:</strong> {currentToken}
          </span>
          <span>
            <strong>Queue Active:</strong> {queueActive ? 'Yes' : 'No'}
          </span>
          {savedToken ? (
            <span>
              <strong>Your Token:</strong> {savedToken}
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
