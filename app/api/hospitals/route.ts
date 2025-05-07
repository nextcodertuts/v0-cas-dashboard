/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

// GET all hospitals
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { licenseNo: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          {
            user: {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      }
    : {};

  try {
    const hospitals = await prisma.hospital.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(hospitals);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}

// CREATE a new hospital
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, address, phone, licenseNo, email, password, userName } = body;

    // Hash the password
    const passwordHash = await hash(password, 10);

    // Create user and hospital in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user first
      const user = await tx.user.create({
        data: {
          email,
          name: userName,
          passwordHash,
          role: "HOSPITAL_USER",
        },
      });

      // Create the hospital
      const hospital = await tx.hospital.create({
        data: {
          name,
          address,
          phone,
          licenseNo,
          userId: user.id,
        },
      });

      return { user, hospital };
    });

    return NextResponse.json(result.hospital, { status: 201 });
  } catch (error: any) {
    console.error("Error creating hospital:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A hospital with this license number or email already exists",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create hospital" },
      { status: 500 }
    );
  }
}
