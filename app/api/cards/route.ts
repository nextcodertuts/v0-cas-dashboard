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

// GET all cards (with filtering)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as CardStatus | null;
  const householdId = searchParams.get("householdId");

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (householdId) {
    where.householdId = householdId;
  }

  try {
    const cards = await prisma.card.findMany({
      where,
      include: {
        household: true,
        plan: true,
      },
    });

    return NextResponse.json(cards);
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

    // Calculate expiry date
    const issueDateObj = new Date(issueDate);
    const expiryDate = new Date(issueDateObj);
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

    // Create the card
    const card = await prisma.card.create({
      data: {
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

// UPDATE a card
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "OFFICE_AGENT")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, planId, status, issueDate } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    // Get existing card
    const existingCard = await prisma.card.findUnique({
      where: { id },
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const updateData: any = {
      status,
      updatedById: session.user.id,
    };

    // If plan is changing, recalculate expiry date
    if (planId && planId !== existingCard.planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      updateData.planId = planId;

      // Use new issue date or existing one
      const issueDateObj = issueDate
        ? new Date(issueDate)
        : existingCard.issueDate;
      updateData.issueDate = issueDateObj;

      // Calculate new expiry date
      const expiryDate = new Date(issueDateObj);
      expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
      updateData.expiryDate = expiryDate;
    } else if (issueDate) {
      // If only issue date is changing but plan remains the same
      const plan = await prisma.plan.findUnique({
        where: { id: existingCard.planId },
      });

      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      const issueDateObj = new Date(issueDate);
      updateData.issueDate = issueDateObj;

      // Calculate new expiry date
      const expiryDate = new Date(issueDateObj);
      expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
      updateData.expiryDate = expiryDate;
    }

    // Update the card
    const updatedCard = await prisma.card.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await createAuditLog(session.user.id, updatedCard.id, "CARD_UPDATED", {
      previousStatus: existingCard.status,
      newStatus: status,
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

// DELETE a card
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
  }

  try {
    // Get card before deletion for audit log
    const card = await prisma.card.findUnique({
      where: { id },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Delete the card
    await prisma.card.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog(session.user.id, id, "CARD_DELETED", {
      householdId: card.householdId,
      status: card.status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
