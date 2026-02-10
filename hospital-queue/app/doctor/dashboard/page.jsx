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
          (token) => token.tokenNo === queueData.currentToken
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

  const handleLogout = () => {
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorName");
    localStorage.removeItem("doctorUserId");
    router.push("/doctor/login");
  };

  // Call Next Patient
  const callNext = async () => {
    if (isCallingNext || isMarkingDone) return;

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
        setStatusMessage(`Calling token ${data.currentToken}`);
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

      setStatusMessage("Marked done");
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
    <div style={{ padding: "32px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "4px", color: "#1f2937" }}>Doctor Dashboard</h1>
          {doctorName && <p style={{ fontSize: "14px", color: "#6b7280" }}>Welcome, {doctorName}</p>}
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "600",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#dc2626";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#ef4444";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Logout
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          style={{
            padding: "16px 20px",
            marginBottom: "24px",
            borderRadius: "8px",
            backgroundColor:
              statusType === "success" ? "#ecfdf5" : "#fef2f2",
            color: statusType === "success" ? "#166534" : "#7f1d1d",
            border: `2px solid ${
              statusType === "success" ? "#86efac" : "#fca5a5"
            }`,
            fontSize: "15px",
            fontWeight: "500",
            boxShadow: statusType === "success" ? "0 1px 3px rgba(34, 197, 94, 0.1)" : "0 1px 3px rgba(239, 68, 68, 0.1)"
          }}
        >
          {statusMessage}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: "16px", color: "#e5e7eb" }}>
          Loading queue...
        </div>
      )}

      {!loading && !doctorId && (
        <div style={{ marginBottom: "16px", color: "#fca5a5" }}>
          Doctor ID not found. Please log in again.
        </div>
      )}

      {!loading && doctorId && !queue && (
        <div style={{ marginBottom: "16px", color: "#fca5a5" }}>
          No active queue for this doctor.
        </div>
      )}

      {/* Current Patient Panel */}
      <div
        style={{
          border: "2px solid #e5e7eb",
          borderRadius: "12px",
          padding: "28px",
          marginBottom: "24px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          transition: "all 0.2s ease"
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>Current Patient</h2>
        {currentPatient ? (
          <div style={{ display: "grid", gap: "14px" }}>
            <div style={{ backgroundColor: "#f3f4f6", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Token Number</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>{currentPatient.tokenNo}</p>
            </div>
            <div style={{ backgroundColor: "#f3f4f6", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Patient Name</p>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>{currentPatient.patientName}</p>
            </div>
            <div style={{ backgroundColor: "#f3f4f6", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Phone</p>
              <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: "500" }}>
                {currentPatient.phone || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ color: "#9ca3af", fontSize: "16px", padding: "20px", textAlign: "center", backgroundColor: "#f9fafb", borderRadius: "8px" }}>No patient currently being served</p>
        )}
      </div>

      {/* Queue Preview Panel */}
      <div
        style={{
          border: "2px solid #e5e7eb",
          borderRadius: "12px",
          padding: "28px",
          marginBottom: "24px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>Queue Preview (Next 5)</h2>
        {tokens.filter((token) => token.status === "WAITING").length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "16px", padding: "20px", textAlign: "center", backgroundColor: "#f9fafb", borderRadius: "8px" }}>Queue is empty</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "0px",
              fontSize: "15px"
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #d1d5db", backgroundColor: "#f9fafb" }}>
                <th style={{ textAlign: "left", padding: "14px 12px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>Position</th>
                <th style={{ textAlign: "left", padding: "14px 12px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>Token</th>
                <th style={{ textAlign: "left", padding: "14px 12px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>Name</th>
                <th style={{ textAlign: "left", padding: "14px 12px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {tokens
                .filter((token) => token.status === "WAITING")
                .map((patient, index) => (
                <tr
                  key={patient.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    transition: "background-color 0.15s ease"
                  }}
                >
                  <td style={{ padding: "14px 12px", color: "#1f2937", fontWeight: "500" }}>{index + 1}</td>
                  <td style={{ padding: "14px 12px", color: "#1f2937", fontWeight: "600" }}>#{patient.tokenNo}</td>
                  <td style={{ padding: "14px 12px", color: "#1f2937", fontWeight: "500" }}>{patient.patientName}</td>
                  <td style={{ padding: "14px 12px", color: "#6b7280" }}>{patient.phone || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Doctor Actions Panel */}
      <div
        style={{
          border: "2px solid #e5e7eb",
          borderRadius: "12px",
          padding: "28px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "24px", color: "#1f2937" }}>Doctor Actions</h2>
        <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
          <button
            onClick={callNext}
            disabled={isCallingNext || isMarkingDone || !queue?.id}
            style={{
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor:
                isCallingNext || isMarkingDone || !queue?.id
                  ? "#d1d5db"
                  : "#16a34a",
              color: isCallingNext || isMarkingDone || !queue?.id ? "#6b7280" : "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                isCallingNext || isMarkingDone || !queue?.id
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.2s ease",
              boxShadow: isCallingNext || isMarkingDone || !queue?.id ? "none" : "0 2px 6px rgba(22, 163, 74, 0.2)",
              opacity: isCallingNext || isMarkingDone || !queue?.id ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!(isCallingNext || isMarkingDone || !queue?.id)) {
                e.target.style.backgroundColor = "#15803d";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!(isCallingNext || isMarkingDone || !queue?.id)) {
                e.target.style.backgroundColor = "#16a34a";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 6px rgba(22, 163, 74, 0.2)";
              }
            }}
          >
            {isCallingNext ? "Calling..." : "Call Next"}
          </button>

          <button
            onClick={markDone}
            disabled={isMarkingDone || isCallingNext || !currentPatient}
            style={{
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor:
                isMarkingDone || isCallingNext || !currentPatient
                  ? "#d1d5db"
                  : "#dc2626",
              color: isMarkingDone || isCallingNext || !currentPatient ? "#6b7280" : "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                isMarkingDone || isCallingNext || !currentPatient
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.2s ease",
              boxShadow: isMarkingDone || isCallingNext || !currentPatient ? "none" : "0 2px 6px rgba(220, 38, 38, 0.2)",
              opacity: isMarkingDone || isCallingNext || !currentPatient ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!(isMarkingDone || isCallingNext || !currentPatient)) {
                e.target.style.backgroundColor = "#b91c1c";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!(isMarkingDone || isCallingNext || !currentPatient)) {
                e.target.style.backgroundColor = "#dc2626";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 6px rgba(220, 38, 38, 0.2)";
              }
            }}
          >
            {isMarkingDone ? "Processing..." : "Mark Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
