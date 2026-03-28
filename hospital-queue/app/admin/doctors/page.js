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
    <div>
      <section className="page-hero">
        <h1>Doctor Management</h1>
        <p>Add, edit, and maintain doctor profiles and credentials.</p>
      </section>

      {showForm ? (
        <section className="card" style={{ marginBottom: '20px' }}>
          <h2>{editingId ? "Edit Doctor" : "Add New Doctor"}</h2>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              placeholder="Doctor Name"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Specialization"
              className="input"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            />
            <input
              type="text"
              placeholder="User ID (for login)"
              className="input"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Doctor" : "Add Doctor"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", specialization: "", userId: "", password: "" });
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          style={{ marginBottom: '20px' }}
        >
          + Add Doctor
        </button>
      )}

      {loading ? (
        <div className="alert alert-info">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="alert alert-info">No doctors added yet.</div>
      ) : (
        <div className="card">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.userId}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        doctor.queueActive ? "status-active" : "status-inactive"
                      }`}
                    >
                      {doctor.queueActive ? "Queue Active" : "Idle"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleEdit(doctor)} className="btn btn-ghost">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(doctor.id)} className="btn btn-danger">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
