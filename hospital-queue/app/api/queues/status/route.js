import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/queues/status
 * Update queue status: PAUSED, ACTIVE, CLOSED
 */
export async function PATCH(request) {
  const body = await request.json();
  const { queueId, status } = body;

  if (!queueId || !status) {
    return NextResponse.json(
      { error: "queueId and status required" },
      { status: 400 }
    );
  }

  if (!["ACTIVE", "PAUSED", "CLOSED"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const queue = await prisma.queue.update({
    where: { id: queueId },
    data: {
      isActive: status === "ACTIVE",
    },
  });

  return NextResponse.json({
    message: `Queue ${status}`,
    queue,
  });
}
