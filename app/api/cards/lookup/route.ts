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

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search by phone number or Aadhaar number
    const card = await prisma.card.findFirst({
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

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error looking up card:", error);
    return NextResponse.json(
      { error: "Failed to lookup card" },
      { status: 500 }
    );
  }
}
