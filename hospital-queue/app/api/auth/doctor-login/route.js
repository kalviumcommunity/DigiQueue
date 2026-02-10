import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/doctor-login
 * Authenticate doctor with userId and password
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

  const { userId, password } = body;

  if (!userId || !password) {
    return NextResponse.json(
      { error: "User ID and password required" },
      { status: 400 }
    );
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Simple password comparison (in production, use hashed passwords)
    if (doctor.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return doctor info (don't return password)
    return NextResponse.json({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      userId: doctor.userId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
