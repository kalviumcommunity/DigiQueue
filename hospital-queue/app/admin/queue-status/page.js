"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function QueueStatus() {
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const doctorId = localStorage.getItem("activeDoctorId");

        if (!doctorId) {
          setQueue(null);
          return;
        }

        const res = await fetch(`/api/queue/status?doctorId=${doctorId}`);

        if (!res.ok) {
          setQueue(null);
          return;
        }

        const data = await res.json();
        setQueue(data.queue);
        setTokens(data.tokens || []);
      } catch (err) {
        setQueue(null);
      }
    }

    fetchQueue();
  }, []);

  if (!queue) {
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
