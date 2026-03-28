import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/doctors/[id]
 * Update a doctor
 */
export async function PUT(request, { params }) {
  const { id } = await params;
  const doctorId = parseInt(id);

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

  if (!name || !specialization || !userId) {
    return NextResponse.json(
      { error: "Name, specialization, and userId required" },
      { status: 400 }
    );
  }

  try {
    // Check if userId is taken by another doctor
    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (existingDoctor && existingDoctor.id !== doctorId) {
      return NextResponse.json(
        { error: "User ID already taken by another doctor" },
        { status: 400 }
      );
    }

    const updateData = { name, specialization, userId };
    if (password) {
      updateData.password = password;
    }

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: updateData,
    });

    return NextResponse.json({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      userId: doctor.userId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update doctor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/doctors/[id]
 * Delete a doctor
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
  const doctorId = parseInt(id);

  if (!Number.isFinite(doctorId)) {
    return NextResponse.json({ error: "Invalid doctor id" }, { status: 400 });
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.token.deleteMany({
        where: {
          queue: {
            doctorId,
          },
        },
      });

      await tx.queue.deleteMany({
        where: { doctorId },
      });

      await tx.doctor.delete({
        where: { id: doctorId },
      });
    });

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
