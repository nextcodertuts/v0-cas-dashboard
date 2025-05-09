/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { BenefitStatus, BenefitType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const householdId = searchParams.get("householdId");
  const status = searchParams.get("status") as BenefitStatus | null;

  const where: any = {};

  if (householdId) {
    where.householdId = householdId;
  }

  if (status) {
    where.status = status;
  }

  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      where,
      include: {
        household: {
          select: {
            headName: true,
            phone: true,
          },
        },
        card: {
          select: {
            id: true,
            status: true,
            plan: {
              select: {
                name: true,
              },
            },
          },
        },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            relation: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(beneficiaries);
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch beneficiaries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      householdId,
      cardId,
      benefitType,
      amount,
      description,
      startDate,
      endDate,
      memberIds,
    } = body;

    // Validate required fields
    if (!householdId || !cardId || !memberIds?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate the card belongs to the household
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        householdId: householdId,
        status: "ACTIVE",
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Invalid card or household combination" },
        { status: 400 }
      );
    }

    // Create the beneficiary
    const beneficiary = await prisma.beneficiary.create({
      data: {
        householdId,
        cardId,
        benefitType: benefitType as BenefitType,
        amount: parseFloat(amount),
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        createdById: session.user.id,
        members: {
          connect: memberIds.map((id: string) => ({ id })),
        },
      },
      include: {
        household: true,
        card: true,
        members: true,
      },
    });

    return NextResponse.json(beneficiary, { status: 201 });
  } catch (error) {
    console.error("Error creating beneficiary:", error);
    return NextResponse.json(
      { error: "Failed to create beneficiary" },
      { status: 500 }
    );
  }
}
