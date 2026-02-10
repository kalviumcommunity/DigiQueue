"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    userId: "",
    password: "",
  });
  const [editingId, setEditingId] = useState(null);
  const router = useRouter();

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/doctors");
      setDoctors(data);
    } catch (error) {
      alert(`Error fetching doctors: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Handle form submission (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.specialization || !formData.userId || !formData.password) {
      return alert("All fields required");
    }

    try {
      if (editingId) {
        // Update doctor
        await apiRequest(`/api/doctors/${editingId}`, "PUT", formData);
        alert("Doctor updated successfully");
      } else {
        // Add new doctor
        await apiRequest("/api/doctors", "POST", formData);
        alert("Doctor added successfully");
      }
      setFormData({ name: "", specialization: "", userId: "", password: "" });
      setShowForm(false);
      setEditingId(null);
      fetchDoctors();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Handle edit
  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      userId: doctor.userId,
      password: doctor.password || "",
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiRequest(`/api/doctors/${id}`, "DELETE");
      alert("Doctor deleted");
      fetchDoctors();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Doctor Management</h1>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Doctor" : "Add New Doctor"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Doctor Name"
              className="border p-2 rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Specialization"
              className="border p-2 rounded"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            />
            <input
              type="text"
              placeholder="User ID (for login)"
              className="border p-2 rounded"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="border p-2 rounded"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 col-span-full"
            >
              {editingId ? "Update Doctor" : "Add Doctor"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: "", specialization: "", userId: "", password: "" });
              }}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 col-span-full"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Add Doctor Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-6"
        >
          + Add Doctor
        </button>
      )}

      {/* Doctors Table */}
      {loading ? (
        <p>Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p className="text-gray-600">No doctors added yet.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-3 text-left">Name</th>
              <th className="border p-3 text-left">Specialization</th>
              <th className="border p-3 text-left">User ID</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-gray-50">
                <td className="border p-3">{doctor.name}</td>
                <td className="border p-3">{doctor.specialization}</td>
                <td className="border p-3 font-mono text-sm">{doctor.userId}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded text-sm ${doctor.queueActive ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}`}>
                    {doctor.queueActive ? "Queue Active" : "Idle"}
                  </span>
                </td>
                <td className="border p-3 text-center">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
