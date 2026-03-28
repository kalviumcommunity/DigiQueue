import { NextResponse } from "next/server";

const DOCTOR_SESSION_COOKIE = "doctor_session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(DOCTOR_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
