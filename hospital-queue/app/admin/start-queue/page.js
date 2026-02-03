"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StartQueue() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("doctors")) || [];
    setDoctors(stored);
  }, []);

  const handleStartQueue = () => {
    if (!selectedDoctor) return alert("Select a doctor");

    const queue = {
      doctorId: selectedDoctor,
      currentToken: 1,
      isActive: true,
    };

    localStorage.setItem("activeQueue", JSON.stringify(queue));
    router.push("/admin/queue-status");
  };

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">Start Queue</h2>

      <select
        className="border w-full p-2 mb-4"
        onChange={(e) => setSelectedDoctor(e.target.value)}
      >
        <option value="">Select Doctor</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name} ({doc.specialization})
          </option>
        ))}
      </select>

      <button
        onClick={handleStartQueue}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Queue
      </button>
    </div>
  );
}
