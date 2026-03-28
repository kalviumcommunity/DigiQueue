"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <section className="page-hero">
        <h1>Admin / Reception Dashboard</h1>
        <p>Coordinate patient flow, doctor availability, and reception tokens.</p>
      </section>

      <div className="care-strip">
        Patient-first operations: keep queues calm and visits moving.
      </div>

      <section className="card">
        <div className="card-grid">
          <Link className="portal-tile" href="/admin/doctors">
            <h3>Doctor Management</h3>
            <p>Manage doctor profiles and login credentials.</p>
          </Link>
          <Link className="portal-tile" href="/admin/queue">
            <h3>Queue Management</h3>
            <p>Keep patient lines balanced and queues visible.</p>
          </Link>
          <Link className="portal-tile" href="/admin/create-token">
            <h3>Create Token</h3>
            <p>Issue patient tokens quickly at reception.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
