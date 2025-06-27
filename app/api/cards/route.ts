/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { CardStatus } from "@prisma/client";

// Helper function to create audit log
async function createAuditLog(
  userId: string,
  cardId: string,
  action: string,
  metadata?: any
) {
  return prisma.auditLog.create({
    data: {
      userId,
      cardId,
      action,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  });
}

async function generateUniqueCardNumber(): Promise<string> {
  while (true) {
    // Generate a 16-digit number as a string
    const cardNumber = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    // Check if it exists
    const existingCard = await prisma.card.findUnique({
      where: { cardNumber },
    });

    if (!existingCard) {
      return cardNumber;
    }
  }
}

// GET all cards (with filtering and pagination)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as CardStatus | null;
  const householdId = searchParams.get("householdId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (householdId) {
    where.householdId = householdId;
  }

  if (search) {
    where.OR = [
      { cardNumber: { contains: search, mode: "insensitive" } },
      { household: { headName: { contains: search, mode: "insensitive" } } },
      { household: { phone: { contains: search, mode: "insensitive" } } },
      { plan: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Add filter for office agents to only see their created households
  if (session.user.role === "OFFICE_AGENT") {
    where.household = {
      ...where.household,
      createdById: session.user.id,
    };
  }

  try {
    const [cards, totalCount] = await Promise.all([
      prisma.card.findMany({
        where,
        include: {
          household: {
            select: {
              id: true,
              headName: true,
              phone: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.card.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      cards,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

// GET a single card by ID
export async function HEAD(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
  }

  try {
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        household: {
          include: {
            members: true,
          },
        },
        plan: true,
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

// CREATE a new card
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "OFFICE_AGENT")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { householdId, planId, status, issueDate } = body;

    // Check if household already has a card
    const existingCard = await prisma.card.findUnique({
      where: { householdId },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "Household already has a card assigned" },
        { status: 400 }
      );
    }

    // Get plan to calculate expiry date
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Generate unique card number
    const cardNumber = await generateUniqueCardNumber();

    // Calculate expiry date
    const issueDateObj = new Date(issueDate);
    const expiryDate = new Date(issueDateObj);
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

    // Create the card
    const card = await prisma.card.create({
      data: {
        cardNumber,
        householdId,
        planId,
        status: status || "ACTIVE",
        issueDate: issueDateObj,
        expiryDate,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });

    // Create audit log
    await createAuditLog(session.user.id, card.id, "CARD_CREATED", {
      householdId,
      planId,
      status,
      cardNumber,
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
