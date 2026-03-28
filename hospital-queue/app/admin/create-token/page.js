"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function CreateToken() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [queue, setQueue] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [generatedToken, setGeneratedToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest("/api/doctors")
      .then(setDoctors)
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    setGeneratedToken(null);
    if (!selectedDoctor) {
      setQueue(null);
      return;
    }

    apiRequest(`/api/queues?doctorId=${selectedDoctor}`)
      .then((data) => setQueue(data || null))
      .catch(() => setQueue(null));
  }, [selectedDoctor]);

  const handleStartQueue = async () => {
    if (!selectedDoctor) return alert("Select a doctor first");
    try {
      const q = await apiRequest("/api/queues", "POST", { doctorId: Number(selectedDoctor) });
      setQueue(q);
      alert("Queue started");
    } catch (err) {
      alert(`Failed to start queue: ${err.message}`);
    }
  };

  const handleCreateToken = async () => {
    if (!selectedDoctor) return alert("Select a doctor first");
    if (!patientName) return alert("Enter patient name");
    if (!queue || !queue.isActive) return alert("Queue is not active for selected doctor");

    try {
      setLoading(true);
      const res = await apiRequest("/api/tokens", "POST", {
        queueId: queue.id,
        patientName,
        phone,
      });

      setGeneratedToken(res.tokenNo);
      setPatientName("");
      setPhone("");
    } catch (err) {
      alert(`Failed to create token: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="page-hero">
        <h1>Create Token (Reception)</h1>
        <p>Issue a token for walk-in patients and keep the line moving.</p>
      </section>

      <section className="card" style={{ maxWidth: '520px' }}>
        <div className="form">
          <div>
            <label className="label">Select Doctor</label>
            <select
              className="input"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </div>

          {!selectedDoctor ? (
            <div className="alert alert-info">Please select a doctor to continue.</div>
          ) : !queue ? (
            <div>
              <div className="alert alert-warn">No active queue for this doctor.</div>
              <button onClick={handleStartQueue} className="btn btn-primary" style={{ marginTop: '12px' }}>
                Start Queue
              </button>
            </div>
          ) : (
            <>
              <div className="alert alert-info">
                Queue #{queue.id} — Current Token: {queue.currentToken}
              </div>

              <input
                placeholder="Patient Name"
                className="input"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />

              <input
                placeholder="Phone Number"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <button
                onClick={handleCreateToken}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Token'}
              </button>

              {generatedToken && (
                <div className="alert alert-success">
                  <strong>Token Number:</strong> {generatedToken}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
