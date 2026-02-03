"use client";

import { useEffect, useState } from "react";

export default function DoctorDashboard() {
  const [currentToken, setCurrentToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchStatus() {
    try {
      setError("");
      const res = await fetch("/api/queue/status", { cache: "no-store" });
      const data = await res.json();
      setCurrentToken(data.currentToken);
    } catch (e) {
      setError("Failed to load queue status");
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  async function callNext() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/doctor/next", { method: "POST" });
      const data = await res.json();
      setCurrentToken(data.currentToken);
    } catch (e) {
      setError("Failed to call next");
    } finally {
      setLoading(false);
    }
  }

  async function markDone() {
    // For now, same as call next in mock mode
    await callNext();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Doctor Dashboard</h1>
        <p style={{color:"yellow"}}>✅ DASHBOARD LOADED</p>


      <p>
        <b>Current Token:</b>{" "}
        {currentToken === null ? "Loading..." : currentToken}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={callNext} disabled={loading}>
          {loading ? "Please wait..." : "Call Next"}
        </button>

        <button onClick={markDone} disabled={loading}>
          Mark Done
        </button>

        <button onClick={fetchStatus} disabled={loading}>
          Refresh
        </button>
      </div>
    </div>
  );
}
