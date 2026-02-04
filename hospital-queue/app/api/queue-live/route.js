import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queueId = searchParams.get("queueId");

  const data = await redis.get(`queue:${queueId}`);

  if (!data) {
    return NextResponse.json(
      { error: "Queue not found in cache" },
      { status: 404 }
    );
  }

  return NextResponse.json(JSON.parse(data));
}
