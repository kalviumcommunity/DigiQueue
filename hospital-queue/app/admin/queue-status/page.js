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
          setTokens([]);
          return;
        }

        const activeQueue = await apiRequest(
          `/api/queues?doctorId=${doctorId}`
        );

        if (!activeQueue) {
          setQueue(null);
          setTokens([]);
          return;
        }

        setQueue(activeQueue);

        const allTokens = await apiRequest(
          `/api/tokens?queueId=${activeQueue.id}`
        );
        const waitingTokens = (allTokens || []).filter(
          (token) => token.status === "WAITING"
        );
        setTokens(waitingTokens);
      } catch (err) {
        setQueue(null);
        setTokens([]);
      }
    }

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
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
