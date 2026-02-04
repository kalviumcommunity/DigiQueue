import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/doctors
 * List all doctors
 */
export async function GET() {
  const doctors = await prisma.doctor.findMany();
  return NextResponse.json(doctors);
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
  
  const { name, specialization } = body;

  if (!name || !specialization) {
    return NextResponse.json(
      { error: "Name and specialization required" },
      { status: 400 }
    );
  }

  const doctor = await prisma.doctor.create({
    data: { name, specialization },
  });

  return NextResponse.json(doctor, { status: 201 });
}
