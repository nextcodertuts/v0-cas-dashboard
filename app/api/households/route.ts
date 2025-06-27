/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all households (with filtering and pagination)
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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { headName: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Add createdById filter for office agents
  if (session.user.role === "OFFICE_AGENT") {
    where.createdById = session.user.id;
  }

  try {
    // Get total count for pagination
    const totalCount = await prisma.household.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated households
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      households,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
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

    // Create the household with createdById
    const household = await prisma.household.create({
      data: {
        headName,
        address,
        phone,
        createdById: session.user.id,
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
