"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function AddDoctor() {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const router = useRouter();

  const handleAddDoctor = async () => {
    if (!name || !specialization) return alert("Fill all fields");

    await apiRequest("/api/doctors", "POST", {
      name,
      specialization,
    });

    router.push("/admin/doctors");
  };

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">Add Doctor</h2>

      <input
        placeholder="Doctor Name"
        className="border w-full p-2 mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Specialization"
        className="border w-full p-2 mb-4"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
      />

      <button
        onClick={handleAddDoctor}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Doctor
      </button>
    </div>
  );
}
