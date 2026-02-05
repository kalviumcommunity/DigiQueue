"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    apiRequest("/api/doctors")
      .then(setDoctors)
      .catch(() => alert("Failed to load doctors"));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Doctors</h2>

      {doctors.length === 0 ? (
        <p>No doctors added yet.</p>
      ) : (
        <table className="border w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Specialization</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc.id}>
                <td className="border p-2">{doc.name}</td>
                <td className="border p-2">{doc.specialization}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
