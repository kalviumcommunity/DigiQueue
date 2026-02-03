'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  queueActive: boolean;
}

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading doctors...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Available Doctors</h1>
      {doctors.length === 0 ? (
        <p>No doctors available</p>
      ) : (
        <div>
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '5px',
              }}
            >
              <h2>{doctor.name}</h2>
              <p>
                <strong>Specialization:</strong> {doctor.specialization}
              </p>
              <p>
                <strong>Queue Status:</strong>{' '}
                {doctor.queueActive ? 'Active' : 'Inactive'}
              </p>
              <Link
                href={`/patient/get-token?doctorId=${doctor.id}`}
                style={{
                  display: 'inline-block',
                  padding: '10px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  marginTop: '10px',
                }}
              >
                Get Token
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
