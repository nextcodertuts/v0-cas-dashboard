/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET a single household
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
    const household = await prisma.household.findUnique({
      where: { id: id },
      include: {
        members: true,
        card: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    // Check if agent has access to this household
    if (
      session.user.role === "OFFICE_AGENT" &&
      household.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(household);
  } catch (error) {
    console.error("Error fetching household:", error);
    return NextResponse.json(
      { error: "Failed to fetch household" },
      { status: 500 }
    );
  }
}

// UPDATE a household
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
    // Check if household exists and get its card status
    const existingHousehold = await prisma.household.findUnique({
      where: { id },
      include: {
        card: true,
      },
    });

    if (!existingHousehold) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    // Check if agent has access to this household
    if (
      session.user.role === "OFFICE_AGENT" &&
      existingHousehold.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if card is active for office agents
    if (
      session.user.role === "OFFICE_AGENT" &&
      existingHousehold.card?.status === "ACTIVE"
    ) {
      return NextResponse.json(
        { error: "Cannot edit household with active card" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { headName, address, phone, members } = body;

    // Update household
    const household = await prisma.household.update({
      where: { id: id },
      data: {
        headName,
        address,
        phone,
      },
    });

    // Update members if provided
    if (members && Array.isArray(members)) {
      // Delete existing members
      await prisma.member.deleteMany({
        where: { householdId: id },
      });

      // Create new members
      await prisma.member.createMany({
        data: members.map((member: any) => ({
          ...member,
          householdId: id,
        })),
      });
    }

    return NextResponse.json(household);
  } catch (error) {
    console.error("Error updating household:", error);
    return NextResponse.json(
      { error: "Failed to update household" },
      { status: 500 }
    );
  }
}

// DELETE a household
export async function DELETE(
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
    // Check if household exists and get its card status
    const household = await prisma.household.findUnique({
      where: { id },
      include: {
        card: true,
      },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    // Check if agent has access to this household
    if (
      session.user.role === "OFFICE_AGENT" &&
      household.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if card is active for office agents
    if (
      session.user.role === "OFFICE_AGENT" &&
      household.card?.status === "ACTIVE"
    ) {
      return NextResponse.json(
        { error: "Cannot delete household with active card" },
        { status: 403 }
      );
    }

    await prisma.household.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting household:", error);
    return NextResponse.json(
      { error: "Failed to delete household" },
      { status: 500 }
    );
  }
}
