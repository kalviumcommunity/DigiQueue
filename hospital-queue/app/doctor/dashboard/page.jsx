"use client";

import { useEffect, useState } from "react";

// Mock patient data for queue preview
const mockQueue = [
  { id: 1, tokenNumber: 1, patientName: "Ahmed Hassan", reason: "General Checkup" },
  { id: 2, tokenNumber: 2, patientName: "Fatima Ahmed", reason: "Follow-up" },
  { id: 3, tokenNumber: 3, patientName: "Mohammad Ali", reason: "Consultation" },
  { id: 4, tokenNumber: 4, patientName: "Sara Johnson", reason: "Lab Results" },
  { id: 5, tokenNumber: 5, patientName: "Omar Ibrahim", reason: "Prescription" },
];

export default function DoctorDashboard() {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [queue, setQueue] = useState(mockQueue);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" or "error"
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  // Simulate async operation
  const simulateAsync = async () => {
    await new Promise((r) => setTimeout(r, 600));
  };

  // Call Next Patient
  const callNext = async () => {
    if (isCallingNext || isMarkingDone) return;

    if (queue.length === 0) {
      setStatusMessage("Queue is empty");
      setStatusType("error");
      return;
    }

    try {
      setIsCallingNext(true);
      setStatusMessage("");

      // Simulate API call
      await simulateAsync();

      // Move first patient from queue to current
      const nextPatient = queue[0];
      setCurrentPatient(nextPatient);
      setQueue((prev) => prev.slice(1));
      setStatusMessage(`Calling token ${nextPatient.tokenNumber}`);
      setStatusType("success");

      // Day 6: Replace with actual API call
      // const res = await fetch('/api/doctor/call-next', { method: 'POST' });
      // const data = await res.json();
      // setCurrentPatient(data.currentPatient);
      // setQueue(data.queue);
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

      // Simulate API call
      await simulateAsync();

      setCurrentPatient(null);
      setStatusMessage("Marked done");
      setStatusType("success");

      // Day 6: Replace with actual API call
      // const res = await fetch('/api/doctor/mark-done', { method: 'POST' });
      // const data = await res.json();
      // setCurrentPatient(null);
    } catch (err) {
      setStatusMessage("Failed to mark patient as done");
      setStatusType("error");
    } finally {
      setIsMarkingDone(false);
    }
  };

  return (
    <div style={{ padding: "32px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "12px", color: "#ffffff" }}>Doctor Dashboard</h1>

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
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>{currentPatient.tokenNumber}</p>
            </div>
            <div style={{ backgroundColor: "#f3f4f6", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Patient Name</p>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>{currentPatient.patientName}</p>
            </div>
            <div style={{ backgroundColor: "#f3f4f6", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Reason for Visit</p>
              <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: "500" }}>{currentPatient.reason}</p>
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
        {queue.length === 0 ? (
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
                <th style={{ textAlign: "left", padding: "14px 12px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((patient, index) => (
                <tr
                  key={patient.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    transition: "background-color 0.15s ease"
                  }}
                >
                  <td style={{ padding: "14px 12px", color: "#1f2937", fontWeight: "500" }}>{index + 1}</td>
                  <td style={{ padding: "14px 12px", color: "#1f2937", fontWeight: "600" }}>#{patient.tokenNumber}</td>
                  <td style={{ padding: "14px 12px", color: "#1f2937", fontWeight: "500" }}>{patient.patientName}</td>
                  <td style={{ padding: "14px 12px", color: "#6b7280" }}>{patient.reason}</td>
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
            disabled={isCallingNext || isMarkingDone || queue.length === 0}
            style={{
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor:
                isCallingNext || isMarkingDone || queue.length === 0
                  ? "#d1d5db"
                  : "#16a34a",
              color: isCallingNext || isMarkingDone || queue.length === 0 ? "#6b7280" : "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                isCallingNext || isMarkingDone || queue.length === 0
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.2s ease",
              boxShadow: isCallingNext || isMarkingDone || queue.length === 0 ? "none" : "0 2px 6px rgba(22, 163, 74, 0.2)",
              opacity: isCallingNext || isMarkingDone || queue.length === 0 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!(isCallingNext || isMarkingDone || queue.length === 0)) {
                e.target.style.backgroundColor = "#15803d";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!(isCallingNext || isMarkingDone || queue.length === 0)) {
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
