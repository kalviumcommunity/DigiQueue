"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function StartQueue() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const router = useRouter();

  useEffect(() => {
    apiRequest("/api/doctors")
      .then(setDoctors)
      .catch(() => alert("Failed to load doctors"));
  }, []);

  const handleStartQueue = async () => {
    if (!selectedDoctor) return alert("Select doctor");

    await apiRequest("/api/queues", "POST", {
      doctorId: selectedDoctor,
    });

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
