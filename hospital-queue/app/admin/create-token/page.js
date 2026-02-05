"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function CreateToken() {
  const [queue, setQueue] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [generatedToken, setGeneratedToken] = useState(null);

  useEffect(() => {
    apiRequest("/api/queue/status")
      .then((data) => setQueue(data.queue))
      .catch(() => alert("Queue not started"));
  }, []);

  const handleCreateToken = async () => {
    if (!patientName) return alert("Enter patient name");

    const res = await apiRequest("/api/tokens", "POST", {
      patientName,
      phone,
    });

    setGeneratedToken(res.tokenNumber);
  };

  if (!queue || !queue.isActive) {
    return <p className="p-6">Start the queue first.</p>;
  }

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">
        Create Token (Reception)
      </h2>

      <input
        placeholder="Patient Name"
        className="border w-full p-2 mb-3"
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
      />

      <input
        placeholder="Phone Number"
        className="border w-full p-2 mb-4"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button
        onClick={handleCreateToken}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Generate Token
      </button>

      {generatedToken && (
        <div className="mt-4 p-3 border bg-green-50">
          <strong>Token Number:</strong> {generatedToken}
        </div>
      )}
    </div>
  );
}
