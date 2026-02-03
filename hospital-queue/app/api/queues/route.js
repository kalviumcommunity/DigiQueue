import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/queues
 * Start a queue for a doctor
 */
export async function POST(request) {
  const body = await request.json();
  const { doctorId } = body;

  if (!doctorId) {
    return NextResponse.json(
      { error: "doctorId is required" },
      { status: 400 }
    );
  }

  // Close existing active queue (if any)
  await prisma.queue.updateMany({
    where: { doctorId, isActive: true },
    data: { isActive: false },
  });

  const queue = await prisma.queue.create({
    data: {
      doctorId,
      isActive: true,
      currentToken: 0,
    },
  });

  return NextResponse.json(queue, { status: 201 });
}

/**
 * GET /api/queues?doctorId=1
 * Get active queue for doctor
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doctorId = Number(searchParams.get("doctorId"));

  if (!doctorId) {
    return NextResponse.json(
      { error: "doctorId query param required" },
      { status: 400 }
    );
  }

  const queue = await prisma.queue.findFirst({
    where: { doctorId, isActive: true },
    include: { tokens: true },
  });

  return NextResponse.json(queue);
}
