import { NextResponse } from "next/server";
import { store } from "@/lib/store";

/**
 * GET /api/doctors
 * List all doctors
 */
export async function GET() {
  return NextResponse.json(store.doctors);
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

  const doctor = {
    id: Date.now(),
    name,
    specialization,
  };

  store.doctors.push(doctor);
  return NextResponse.json(doctor, { status: 201 });
}
