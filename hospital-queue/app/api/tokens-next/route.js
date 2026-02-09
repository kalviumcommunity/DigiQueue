import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

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

  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
  });

  if (!queue) {
    return NextResponse.json(
      { error: "Queue not found" },
      { status: 404 }
    );
  }

  if (queue.currentToken) {
    const currentToken = await prisma.token.findFirst({
      where: { queueId, tokenNo: queue.currentToken },
    });

    if (currentToken && currentToken.status !== "DONE") {
      await prisma.token.update({
        where: { id: currentToken.id },
        data: { status: "DONE" },
      });
    }
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

  // Mark token as IN_PROGRESS
  await prisma.token.update({
    where: { id: nextToken.id },
    data: { status: "IN_PROGRESS" },
  });

  // Update queue current token
  await prisma.queue.update({
    where: { id: queueId },
    data: { currentToken: nextToken.tokenNo },
  });

  await redis.set(
    `queue:${queueId}`,
    JSON.stringify({
      currentToken: nextToken.tokenNo,
      status: "ACTIVE",
    })
  );

  return NextResponse.json({
    message: "Next patient called",
    currentToken: nextToken.tokenNo,
  });
}
