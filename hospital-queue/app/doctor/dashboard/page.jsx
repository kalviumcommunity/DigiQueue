"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorDashboard() {
  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState(null);
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" or "error"
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshData = useCallback(async () => {
    if (!doctorId) return;

    try {
      setLoading(true);
      const queueRes = await fetch(`/api/queues?doctorId=${doctorId}`);
      if (!queueRes.ok) {
        setQueue(null);
        setTokens([]);
        setCurrentPatient(null);
        return;
      }

      const queueData = await queueRes.json();
      setQueue(queueData);

      if (!queueData?.id) {
        setTokens([]);
        setCurrentPatient(null);
        return;
      }

      const tokensRes = await fetch(`/api/tokens?queueId=${queueData.id}`);
      const tokensData = tokensRes.ok ? await tokensRes.json() : [];
      setTokens(tokensData || []);

      if (queueData.currentToken) {
        const currentToken = (tokensData || []).find(
          (token) => token.tokenNo === queueData.currentToken && token.status !== "DONE"
        );
        setCurrentPatient(currentToken || null);
      } else {
        setCurrentPatient(null);
      }
    } catch (err) {
      setQueue(null);
      setTokens([]);
      setCurrentPatient(null);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    // Get doctor info from localStorage (set by login page)
    const storedDoctorId = localStorage.getItem("doctorId");
    const storedDoctorName = localStorage.getItem("doctorName");
    
    if (!storedDoctorId) {
      setLoading(false);
      router.push("/doctor/login");
      return;
    }
    
    setDoctorId(parseInt(storedDoctorId));
    setDoctorName(storedDoctorName || "Doctor");
  }, [router]);

  useEffect(() => {
    if (!doctorId) return;
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [doctorId, refreshData]);

  // Call Next Patient
  const callNext = async () => {
    if (isCallingNext || isMarkingDone) return;

    if (currentPatient) {
      setStatusMessage("Mark current patient done before calling next.");
      setStatusType("error");
      return;
    }

    const waitingTokens = tokens.filter((token) => token.status === "WAITING");

    if (!queue?.id || waitingTokens.length === 0) {
      setStatusMessage("Queue is empty");
      setStatusType("error");
      return;
    }

    try {
      setIsCallingNext(true);
      setStatusMessage("");

      const res = await fetch("/api/tokens-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId: queue.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to call next patient");
      }

      if (data?.message === "No waiting patients") {
        setStatusMessage("Queue is empty");
        setStatusType("error");
      } else {
        setStatusMessage(`Now serving token ${data.currentToken}`);
        setStatusType("success");
      }

      await refreshData();
    } catch (err) {
      setStatusMessage("Failed to call next patient");
      setStatusType("error");
    } finally {
      setIsCallingNext(false);
    }
  };

  // Mark Done with Current Patient
  const markDone = async () => {
    if (isMarkingDone || isCallingNext) return;

    if (!currentPatient) {
      setStatusMessage("No active patient");
      setStatusType("error");
      return;
    }

    try {
      setIsMarkingDone(true);
      setStatusMessage("");

      const res = await fetch("/api/tokens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueId: queue?.id,
          tokenNo: currentPatient.tokenNo,
          status: "DONE",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to mark done");
      }

      setQueue((prev) => (prev ? { ...prev, currentToken: null } : prev));
      setCurrentPatient(null);
      setStatusMessage("Marked done. Ready for next patient.");
      setStatusType("success");
      await refreshData();
    } catch (err) {
      setStatusMessage("Failed to mark patient as done");
      setStatusType("error");
    } finally {
      setIsMarkingDone(false);
    }
  };

  return (
    <div>
      <div className="portal-head">
        <div>
          <h1>Doctor Dashboard</h1>
          {doctorName && <p style={{ color: 'var(--muted)' }}>Welcome, {doctorName}</p>}
        </div>
        <span className="care-tag">Patient-first care</span>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`alert ${statusType === "success" ? "alert-success" : "alert-warn"}`}>
          {statusMessage}
        </div>
      )}

      {loading && <div className="alert alert-info">Loading queue...</div>}

      {!loading && !doctorId && (
        <div className="alert alert-warn">Doctor ID not found. Please log in again.</div>
      )}

      {!loading && doctorId && !queue && (
        <div className="alert alert-warn">No active queue for this doctor.</div>
      )}

      {/* Current Patient Panel */}
      <section className="card">
        <h2>Current Patient</h2>
        {currentPatient ? (
          <div className="patient-grid">
            <div className="patient-metric">
              <p className="metric-label">Token Number</p>
              <p className="metric-value">{currentPatient.tokenNo}</p>
            </div>
            <div className="patient-metric">
              <p className="metric-label">Patient Name</p>
              <p className="metric-value">{currentPatient.patientName}</p>
            </div>
            <div className="patient-metric">
              <p className="metric-label">Phone</p>
              <p className="metric-value">{currentPatient.phone || "N/A"}</p>
            </div>
          </div>
        ) : (
          <p className="empty-state">No patient currently being served</p>
        )}
      </section>

      {/* Queue Preview Panel */}
      <section className="card">
        <h2>Queue Preview (Next 5)</h2>
        {tokens.filter((token) => token.status === "WAITING").length === 0 ? (
          <p className="empty-state">Queue is empty</p>
        ) : (
          <table className="portal-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Token</th>
                <th>Name</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {tokens
                .filter((token) => token.status === "WAITING")
                .map((patient, index) => (
                <tr key={patient.id}>
                  <td>{index + 1}</td>
                  <td>#{patient.tokenNo}</td>
                  <td>{patient.patientName}</td>
                  <td>{patient.phone || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Doctor Actions Panel */}
      <section className="card">
        <h2>Doctor Actions</h2>
        <div className="action-row">
          <button
            onClick={callNext}
            disabled={isCallingNext || isMarkingDone || !queue?.id || Boolean(currentPatient)}
            className="btn btn-primary"
          >
            {isCallingNext ? "Calling..." : "Call Next"}
          </button>

          <button
            onClick={markDone}
            disabled={isMarkingDone || isCallingNext || !currentPatient}
            className="btn btn-danger"
          >
            {isMarkingDone ? "Processing..." : "Mark Done"}
          </button>
        </div>
      </section>
    </div>
  );
}
