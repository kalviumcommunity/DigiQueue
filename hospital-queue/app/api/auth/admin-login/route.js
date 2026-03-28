import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, password } = body;

  if (!userId || !password) {
    return NextResponse.json(
      { error: "User ID and password required" },
      { status: 400 }
    );
  }

  const adminUserId = process.env.ADMIN_USER_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUserId || !adminPassword) {
    return NextResponse.json(
      { error: "Admin credentials are not configured" },
      { status: 500 }
    );
  }

  if (userId !== adminUserId || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
