export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Admin / Reception Dashboard
      </h1>

      <ul className="space-y-2">
        <li>➤ Add Doctor</li>
        <li>➤ Start Queue</li>
        <li>➤ Create Token (Reception)</li>
        <li>➤ View Live Queue</li>
      </ul>
    </div>
  );
}
