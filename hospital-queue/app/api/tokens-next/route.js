import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tokens-next
 * Doctor calls next patient
 */
export async function POST(request) {
  const body = await request.json();
  const { queueId } = body;

  if (!queueId) {
    return NextResponse.json(
      { error: "queueId required" },
      { status: 400 }
    );
  }

  // Find next waiting token
  const nextToken = await prisma.token.findFirst({
    where: {
      queueId,
      status: "WAITING",
    },
    orderBy: { tokenNo: "asc" },
  });

  if (!nextToken) {
    return NextResponse.json(
      { message: "No waiting patients" },
      { status: 200 }
    );
  }

  // Mark token as DONE
  await prisma.token.update({
    where: { id: nextToken.id },
    data: { status: "DONE" },
  });

  // Update queue current token
  await prisma.queue.update({
    where: { id: queueId },
    data: { currentToken: nextToken.tokenNo },
  });

  return NextResponse.json({
    message: "Next patient called",
    currentToken: nextToken.tokenNo,
  });
}
