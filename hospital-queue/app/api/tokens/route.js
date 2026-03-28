import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tokens
 * Create a new token for a queue
 */
export async function POST(request) {
  const body = await request.json();
  const { queueId, patientName, phone } = body;
  const normalizedPhone = String(phone || "").trim();

  if (!queueId || !patientName || !normalizedPhone) {
    return NextResponse.json(
      { error: "queueId, patientName and phone are required" },
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

  // Prevent issuing multiple active tokens for the same doctor and phone number.
  const existingActiveToken = await prisma.token.findFirst({
    where: {
      phone: normalizedPhone,
      status: { in: ["WAITING", "IN_PROGRESS"] },
      queue: {
        doctorId: queue.doctorId,
        isActive: true,
      },
    },
  });

  if (existingActiveToken) {
    return NextResponse.json(
      { error: "This mobile number already has an active token for this doctor" },
      { status: 409 }
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
      phone: normalizedPhone,
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

/**
 * PATCH /api/tokens
 * Update a token status
 */
export async function PATCH(request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { queueId, tokenNo, status } = body;

  if (!queueId || !tokenNo || !status) {
    return NextResponse.json(
      { error: "queueId, tokenNo and status are required" },
      { status: 400 }
    );
  }

  if (!["WAITING", "IN_PROGRESS", "DONE"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 }
    );
  }

  const token = await prisma.token.findFirst({
    where: { queueId, tokenNo },
  });

  if (!token) {
    return NextResponse.json(
      { error: "Token not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.token.update({
    where: { id: token.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
