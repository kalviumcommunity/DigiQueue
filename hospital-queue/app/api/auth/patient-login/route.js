import { NextResponse } from "next/server";

const PATIENT_SESSION_COOKIE = "patient_session";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, phone } = body;

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json(
      { error: "Name and phone are required" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(PATIENT_SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
