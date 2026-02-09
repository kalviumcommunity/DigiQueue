'use client';

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

  if (!doctorId) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: Doctor ID not found. Please select a doctor first.
      </div>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToken(null);

    try {
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
      setPatientName('');
      setPhoneNumber('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '500px' }}>
      <h1>Get Your Token</h1>

      {queueLoading ? (
        <div style={{ marginBottom: '20px' }}>Checking queue...</div>
      ) : !queue?.isActive ? (
        <div
          style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeeba',
            color: '#856404',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          Queue is not active for this doctor.
        </div>
      ) : null}

      {token && (
        <div
          style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          <h2>Token Created Successfully!</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Your Token Number: <span style={{ color: '#0c5460' }}>{token}</span>
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Patient Name
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Getting Token...' : 'Get Token'}
        </button>
      </form>
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
