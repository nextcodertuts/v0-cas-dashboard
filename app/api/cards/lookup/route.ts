/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const status = searchParams.get("status") || "ACTIVE";

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search by phone number or Aadhaar number
    const cards = await prisma.card.findMany({
      where: {
        OR: [
          {
            household: {
              phone: query,
            },
          },
          {
            household: {
              members: {
                some: {
                  aadhaarNo: query,
                },
              },
            },
          },
        ],
        status: status as any,
      },
      include: {
        household: {
          include: {
            members: true,
          },
        },
        plan: true,
      },
    });

    if (cards.length === 0) {
      return NextResponse.json({ error: "No cards found" }, { status: 404 });
    }

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error looking up cards:", error);
    return NextResponse.json(
      { error: "Failed to lookup cards" },
      { status: 500 }
    );
  }
}
