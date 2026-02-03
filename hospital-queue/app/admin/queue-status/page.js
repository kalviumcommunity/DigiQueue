"use client";

import { useEffect, useState } from "react";

export default function QueueStatus() {
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const storedQueue = JSON.parse(localStorage.getItem("activeQueue"));
    const storedTokens = JSON.parse(localStorage.getItem("tokens")) || [];

    setQueue(storedQueue);
    setTokens(storedTokens);
  }, []);

  if (!queue || !queue.isActive) {
    return <p className="p-6">No active queue.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Live Queue Status
      </h2>

      <p>
        <strong>Current Token:</strong> {queue.currentToken}
      </p>

      <p>
        <strong>Waiting Patients:</strong> {tokens.length}
      </p>
    </div>
  );
}
