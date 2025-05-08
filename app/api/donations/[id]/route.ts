// app/(admin)/admin/donations/new/page.tsx
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const donation = await prisma.donation.findUnique({
      where: { id: id },
    });

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error fetching donation:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation" },
      { status: 500 }
    );
  }
}

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
    const {
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      donorType,
      donorPAN,
      organizationName,
      type,
      amount,
      description,
      paymentMethod,
      paymentReference,
      paymentDate,
      isAnonymous,
      notes,
    } = body;

    const donation = await prisma.donation.update({
      where: { id: id },
      data: {
        donorName,
        donorEmail,
        donorPhone,
        donorAddress,
        donorType,
        donorPAN,
        organizationName,
        type,
        amount: parseFloat(amount),
        description,
        paymentMethod,
        paymentReference,
        paymentDate: new Date(paymentDate),
        isAnonymous,
        notes,
      },
    });

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error updating donation:", error);
    return NextResponse.json(
      { error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

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
    await prisma.donation.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting donation:", error);
    return NextResponse.json(
      { error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
