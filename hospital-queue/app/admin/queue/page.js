"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function AdminQueuePage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeQueue, setActiveQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/doctors");
      setDoctors(data);
    } catch (err) {
      alert(`Failed to load doctors: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveQueue = async (doctorId) => {
    if (!doctorId) {
      setActiveQueue(null);
      return;
    }
    try {
      const q = await apiRequest(`/api/queues?doctorId=${doctorId}`);
      setActiveQueue(q || null);
    } catch (err) {
      setActiveQueue(null);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSelectDoctor = async (doctorId) => {
    setSelectedDoctor(doctorId);
    await loadActiveQueue(doctorId);
  };

  const startQueue = async () => {
    if (!selectedDoctor) return alert("Select a doctor first");
    try {
      const res = await apiRequest("/api/queues", "POST", { doctorId: Number(selectedDoctor) });
      setActiveQueue(res);
      await fetchDoctors();
      alert("Queue started");
    } catch (err) {
      alert(`Failed to start queue: ${err.message}`);
    }
  };

  const endQueue = async () => {
    if (!activeQueue?.id) return;
    try {
      await apiRequest("/api/queues/status", "PATCH", { queueId: activeQueue.id, status: "CLOSED" });
      setActiveQueue(null);
      await fetchDoctors();
      alert("Queue ended");
    } catch (err) {
      alert(`Failed to end queue: ${err.message}`);
    }
  };

  return (
    <div>
      <section className="page-hero">
        <h1>Queue Management</h1>
        <p>Start or end queues and monitor active statuses.</p>
      </section>

      <section className="card" style={{ marginBottom: '20px' }}>
        <div className="form" style={{ maxWidth: '520px' }}>
          <div>
            <label className="label">Select Doctor</label>
            <select
              className="input"
              value={selectedDoctor || ""}
              onChange={(e) => handleSelectDoctor(e.target.value)}
            >
              <option value="">-- Select --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={startQueue} className="btn btn-primary">Start Queue</button>
            <button onClick={endQueue} className="btn btn-danger" disabled={!activeQueue}>End Queue</button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Active Queues</h2>
        {doctors.length === 0 ? (
          <div className="alert alert-info">No doctors available</div>
        ) : (
          <div className="card-grid" style={{ marginTop: '12px' }}>
            {doctors.map((d) => (
              <div key={d.id} className="queue-card">
                <div className="queue-meta">
                  <strong>{d.name}</strong>
                  <span>{d.specialization}</span>
                  <span>User ID: {d.userId || '—'}</span>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <ActiveQueueStatus doctor={d} onRefresh={fetchDoctors} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ActiveQueueStatus({ doctor, onRefresh }) {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const q = await fetch(`/api/queues?doctorId=${doctor.id}`).then((r) => r.ok ? r.json() : null);
      setQueue(q);
    } catch (e) {
      setQueue(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      await loadQueue();
    };
    load();
    const interval = setInterval(load, 7000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [doctor.id]);

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (!queue) return <div className="alert alert-info">No active queue</div>;

  return (
    <div className="queue-meta">
      <span>
        <strong>Queue #{queue.id}</strong>
      </span>
      <span>Status: {queue.isActive ? 'Active' : 'Closed'}</span>
      <span>Current Token: {queue.currentToken}</span>
      <button
        onClick={async () => {
          await fetch('/api/queues/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queueId: queue.id, status: 'CLOSED' }),
          });
          await loadQueue();
          onRefresh();
        }}
        className="btn btn-danger"
        style={{ marginTop: '6px' }}
      >
        End Queue
      </button>
    </div>
  );
}
