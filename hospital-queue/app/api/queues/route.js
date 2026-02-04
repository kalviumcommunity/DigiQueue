import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

/**
 * POST /api/queues
 * Start a new queue for a doctor
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { doctorId } = body;

    if (!doctorId) {
      return NextResponse.json(
        { error: "doctorId is required" },
        { status: 400 }
      );
    }

    // Close any existing active queue for this doctor
    await prisma.queue.updateMany({
      where: { doctorId, isActive: true },
      data: { isActive: false },
    });

    // Create new queue
    const queue = await prisma.queue.create({
      data: {
        doctorId,
        isActive: true,
        currentToken: 0,
      },
    });

    // Store live queue data in Redis
    await redis.set(
      `queue:${queue.id}`,
      JSON.stringify({
        currentToken: 0,
        status: "ACTIVE",
      })
    );

    return NextResponse.json(queue, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start queue" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/queues?doctorId=1
 * Get active queue for a doctor
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = Number(searchParams.get("doctorId"));

    if (!doctorId) {
      return NextResponse.json(
        { error: "doctorId query param required" },
        { status: 400 }
      );
    }

    const queue = await prisma.queue.findFirst({
      where: {
        doctorId,
        isActive: true,
      },
    });

    return NextResponse.json(queue);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 }
    );
  }
}
