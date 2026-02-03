'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

interface TokenResponse {
  tokenNumber: string | number;
}

function GetTokenForm() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');

  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | number | null>(null);

  if (!doctorId) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: Doctor ID not found. Please select a doctor first.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          patientName,
          phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create token');
      }

      const data: TokenResponse = await response.json();
      setToken(data.tokenNumber);
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
          <label htmlFor="patientName" style={{ display: 'block', marginBottom: '5px' }}>
            Patient Name
          </label>
          <input
            type="text"
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="phoneNumber" style={{ display: 'block', marginBottom: '5px' }}>
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
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
            fontSize: '16px',
          }}
        >
          {loading ? 'Creating Token...' : 'Create Token'}
        </button>
      </form>
    </div>
  );
}

export default function GetTokenPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
      <GetTokenForm />
    </Suspense>
  );
}
