import { NextResponse } from "next/server";
import { store } from "@/lib/store";

/**
 * GET /api/queue/status
 * Get current queue status
 */
export async function GET() {
  if (!store.activeQueue || !store.activeQueue.isActive) {
    return NextResponse.json(
      { error: "No active queue" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    queue: store.activeQueue,
    tokens: store.tokens,
  });
}

/**
 * POST /api/queue/status
 * Update queue status (for ending queue)
 */
export async function POST(request) {
  const body = await request.json();
  const { isActive } = body;

  if (store.activeQueue) {
    store.activeQueue.isActive = isActive ?? false;
  }

  return NextResponse.json({ success: true });
}
