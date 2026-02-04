import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

/**
 * PATCH /api/queues/status
 * Update queue status: ACTIVE | PAUSED | CLOSED
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { queueId, status } = body;

    if (!queueId || !status) {
      return NextResponse.json(
        { error: "queueId and status are required" },
        { status: 400 }
      );
    }

    if (!["ACTIVE", "PAUSED", "CLOSED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update DB
    const queue = await prisma.queue.update({
      where: { id: queueId },
      data: {
        isActive: status === "ACTIVE",
      },
    });

    // Get current token from DB
    const currentToken = queue.currentToken || 0;

    // Update Redis
    await redis.set(
      `queue:${queueId}`,
      JSON.stringify({
        currentToken,
        status,
      })
    );

    return NextResponse.json({
      message: `Queue ${status}`,
      queue,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update queue status" },
      { status: 500 }
    );
  }
}
