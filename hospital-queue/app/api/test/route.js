import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const doctors = await prisma.doctor.findMany();

  return NextResponse.json({
    message: "Backend working!",
    doctors,
  });
}
