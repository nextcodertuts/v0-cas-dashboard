import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { BenefitStatus, BenefitType } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: id },
      include: {
        household: {
          include: {
            members: true,
          },
        },
        card: {
          include: {
            plan: true,
          },
        },
        members: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!beneficiary) {
      return NextResponse.json(
        { error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(beneficiary);
  } catch (error) {
    console.error("Error fetching beneficiary:", error);
    return NextResponse.json(
      { error: "Failed to fetch beneficiary" },
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

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "OFFICE_AGENT")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      benefitType,
      status,
      amount,
      description,
      startDate,
      endDate,
      memberIds,
    } = body;

    const beneficiary = await prisma.beneficiary.update({
      where: { id: id },
      data: {
        benefitType: benefitType as BenefitType,
        status: status as BenefitStatus,
        amount: parseFloat(amount),
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        members: {
          set: memberIds.map((id: string) => ({ id })),
        },
      },
      include: {
        household: true,
        card: true,
        members: true,
      },
    });

    return NextResponse.json(beneficiary);
  } catch (error) {
    console.error("Error updating beneficiary:", error);
    return NextResponse.json(
      { error: "Failed to update beneficiary" },
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
    await prisma.beneficiary.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting beneficiary:", error);
    return NextResponse.json(
      { error: "Failed to delete beneficiary" },
      { status: 500 }
    );
  }
}
