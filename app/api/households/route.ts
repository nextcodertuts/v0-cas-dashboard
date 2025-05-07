/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all households (with filtering)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "OFFICE_AGENT")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const where: any = {};

  if (search) {
    where.OR = [
      { headName: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const households = await prisma.household.findMany({
      where,
      include: {
        members: true,
        card: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(households);
  } catch (error) {
    console.error("Error fetching households:", error);
    return NextResponse.json(
      { error: "Failed to fetch households" },
      { status: 500 }
    );
  }
}

// CREATE a new household
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
    const { headName, address, phone, members } = body;

    // Create the household
    const household = await prisma.household.create({
      data: {
        headName,
        address,
        phone,
      },
    });

    // Create members if provided
    if (members && Array.isArray(members) && members.length > 0) {
      await prisma.member.createMany({
        data: members.map((member: any) => ({
          ...member,
          householdId: household.id,
        })),
      });
    }

    return NextResponse.json(household, { status: 201 });
  } catch (error) {
    console.error("Error creating household:", error);
    return NextResponse.json(
      { error: "Failed to create household" },
      { status: 500 }
    );
  }
}
