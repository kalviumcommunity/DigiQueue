import { NextResponse } from "next/server";

const PATIENT_SESSION_COOKIE = "patient_session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PATIENT_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
