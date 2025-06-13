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

    // Clean the query - remove spaces and special characters for card number search
    const cleanQuery = query.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");

    // Search by card number, phone number, or Aadhaar number
    const cards = await prisma.card.findMany({
      where: {
        AND: [
          {
            status: status as any,
          },
          {
            OR: [
              // Search by card number (exact match or partial match)
              {
                cardNumber: {
                  contains: cleanQuery,
                  mode: "insensitive",
                },
              },
              // Search by phone number
              {
                household: {
                  phone: query,
                },
              },
              // Search by Aadhaar number
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
          },
        ],
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
