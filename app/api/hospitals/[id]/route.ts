/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

// GET a single hospital
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(hospital);
  } catch (error) {
    console.error("Error fetching hospital:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospital" },
      { status: 500 }
    );
  }
}

// UPDATE a hospital
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, address, phone, licenseNo, email, password, userName } = body;

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update hospital
      const hospital = await tx.hospital.update({
        where: { id: id },
        data: {
          name,
          address,
          phone,
          licenseNo,
        },
        include: {
          user: true,
        },
      });

      // Update user if email or password changed
      if (email || password || userName) {
        const updateData: any = {};
        if (email) updateData.email = email;
        if (userName) updateData.name = userName;
        if (password) {
          updateData.passwordHash = await hash(password, 10);
        }

        await tx.user.update({
          where: { id: hospital.userId },
          data: updateData,
        });
      }

      return hospital;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating hospital:", error);
    return NextResponse.json(
      { error: "Failed to update hospital" },
      { status: 500 }
    );
  }
}

// DELETE a hospital
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.hospital.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hospital:", error);
    return NextResponse.json(
      { error: "Failed to delete hospital" },
      { status: 500 }
    );
  }
}
