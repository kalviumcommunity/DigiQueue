"use client";

import { useEffect, useState } from "react";

export default function CreateToken() {
  const [queue, setQueue] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [generatedToken, setGeneratedToken] = useState(null);

  useEffect(() => {
    const storedQueue = JSON.parse(localStorage.getItem("activeQueue"));
    setQueue(storedQueue);
  }, []);

  const handleCreateToken = () => {
    if (!queue || !queue.isActive) {
      return alert("Queue not started");
    }

    const tokens = JSON.parse(localStorage.getItem("tokens")) || [];

    const newTokenNumber = tokens.length + 1;

    const newToken = {
      tokenNumber: newTokenNumber,
      patientName,
      phone,
      status: "waiting",
    };

    localStorage.setItem(
      "tokens",
      JSON.stringify([...tokens, newToken])
    );

    setGeneratedToken(newTokenNumber);
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
