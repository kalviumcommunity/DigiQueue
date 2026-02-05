import { NextResponse } from "next/server";
import { store } from "@/lib/store";

/**
 * POST /api/queue/start
 * Start a queue for a doctor
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { doctorId } = body;

  if (!doctorId) {
    return NextResponse.json(
      { error: "doctorId required" },
      { status: 400 }
    );
  }

  store.activeQueue = {
    doctorId,
    currentToken: 1,
    isActive: true,
    startedAt: new Date(),
  };

  return NextResponse.json(store.activeQueue, { status: 201 });
}
