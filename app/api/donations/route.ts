/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const donations = await prisma.donation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Generate a unique receipt number
    const receiptNumber = `DON-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`.toUpperCase();

    const donation = await prisma.donation.create({
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
        receiptNumber,
        isAnonymous,
        notes,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
