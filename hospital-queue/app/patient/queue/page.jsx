'use client';

import { useEffect, useState } from 'react';

export default function PatientQueuePage() {
  const [currentToken, setCurrentToken] = useState(null);
  const [queueActive, setQueueActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/queue/status');
        const data = await response.json();
        setCurrentToken(data.currentToken);
        setQueueActive(data.queueActive);
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
  }, []);

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
