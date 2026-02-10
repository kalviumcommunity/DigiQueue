import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/doctors
 * List all doctors
 */
export async function GET() {
  const doctors = await prisma.doctor.findMany({
    include: {
      queues: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });

  const formatted = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    specialization: doctor.specialization,
    userId: doctor.userId,
    password: "****", // Don't expose actual password
    queueActive: doctor.queues.length > 0,
  }));

  return NextResponse.json(formatted);
}

/**
 * POST /api/doctors
 * Add a doctor
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
  
  const { name, specialization, userId, password } = body;

  if (!name || !specialization || !userId || !password) {
    return NextResponse.json(
      { error: "Name, specialization, userId, and password required" },
      { status: 400 }
    );
  }

  // Check if userId already exists
  const existingDoctor = await prisma.doctor.findUnique({
    where: { userId },
  });

  if (existingDoctor) {
    return NextResponse.json(
      { error: "User ID already exists" },
      { status: 400 }
    );
  }

  try {
    const doctor = await prisma.doctor.create({
      data: { name, specialization, userId, password },
    });

    return NextResponse.json({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      userId: doctor.userId,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    );
  }
}
