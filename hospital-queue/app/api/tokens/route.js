import { NextResponse } from "next/server";
import { store } from "@/lib/store";

/**
 * POST /api/tokens
 * Create a new token
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

  const { patientName, phone } = body;

  if (!patientName) {
    return NextResponse.json(
      { error: "patientName required" },
      { status: 400 }
    );
  }

  const tokenNumber = store.tokens.length + 1;

  const token = {
    tokenNumber,
    patientName,
    phone: phone || "",
    status: "waiting",
    createdAt: new Date(),
  };

  store.tokens.push(token);
  return NextResponse.json(token, { status: 201 });
}

/**
 * GET /api/tokens
 * Get all tokens
 */
export async function GET() {
  return NextResponse.json(store.tokens);
}
