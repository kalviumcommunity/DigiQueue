'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PatientQueuePage() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');

  const [currentToken, setCurrentToken] = useState(null);
  const [queueActive, setQueueActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueId, setQueueId] = useState(null);

  if (!doctorId) {
    return <p>Doctor ID not found. Please select a doctor first.</p>;
  }

  useEffect(() => {
    let isMounted = true;

    const fetchQueue = async () => {
      try {
        const res = await fetch(`/api/queues?doctorId=${doctorId}`);
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

    fetchQueue();

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

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

  if (loading) return <p>Loading queue status...</p>;
  if (error) return <p>{error}</p>;
  if (currentToken === null) return <p>No queue data available</p>;

  return (
    <div>
      <h1>Patient Queue Status</h1>
      <p>Now Serving Token: {currentToken}</p>
      <p>Queue Active: {queueActive ? 'Yes' : 'No'}</p>
    </div>
  );
}
