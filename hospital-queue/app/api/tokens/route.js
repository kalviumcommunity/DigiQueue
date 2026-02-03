import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tokens
 * Create a new token for a queue
 */
export async function POST(request) {
  const body = await request.json();
  const { queueId, patientName, phone } = body;

  if (!queueId || !patientName) {
    return NextResponse.json(
      { error: "queueId and patientName required" },
      { status: 400 }
    );
  }

  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
  });

  if (!queue || !queue.isActive) {
    return NextResponse.json(
      { error: "Queue is not active" },
      { status: 400 }
    );
  }

  // Find last token number
  const lastToken = await prisma.token.findFirst({
    where: { queueId },
    orderBy: { tokenNo: "desc" },
  });

  const nextTokenNo = lastToken ? lastToken.tokenNo + 1 : 1;

  const token = await prisma.token.create({
    data: {
      queueId,
      tokenNo: nextTokenNo,
      patientName,
      phone,
    },
  });

  return NextResponse.json(token, { status: 201 });
}

/**
 * GET /api/tokens?queueId=1
 * Get all tokens for a queue
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queueId = Number(searchParams.get("queueId"));

  if (!queueId) {
    return NextResponse.json(
      { error: "queueId query param required" },
      { status: 400 }
    );
  }

  const tokens = await prisma.token.findMany({
    where: { queueId },
    orderBy: { tokenNo: "asc" },
  });

  return NextResponse.json(tokens);
}
