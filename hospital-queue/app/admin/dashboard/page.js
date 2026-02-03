"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Admin / Reception Dashboard
      </h1>

      <ul className="space-y-3">
        <li>
          <Link href="/admin/add-doctor" className="text-blue-600">
            ➤ Add Doctor
          </Link>
        </li>
        <li>
          <Link href="/admin/doctors" className="text-blue-600">
            ➤ View Doctors
          </Link>
        </li>
        <li>
          <Link href="/admin/start-queue" className="text-blue-600">
            ➤ Start Queue
          </Link>
        </li>
        <li>
          <Link href="/admin/queue-status" className="text-blue-600">
            ➤ View Queue Status
          </Link>
        </li>
        <li>
          <Link href="/admin/create-token" className="text-blue-600">
            ➤ Create Token (Reception)
          </Link>
        </li>
      </ul>
    </div>
  );
}
