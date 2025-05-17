import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardNumber: string }> }
) {
  try {
    const { cardNumber } = await params;
    const card = await prisma.card.findUnique({
      where: { cardNumber: cardNumber },
      select: {
        id: true,
        cardNumber: true,
        status: true,
        issueDate: true,
        expiryDate: true,
        household: {
          select: {
            headName: true,
            address: true,
            phone: true,
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                relation: true,
                dob: true,
                // Exclude sensitive information like aadhaarNo
              },
            },
          },
        },
        plan: {
          select: {
            name: true,
            description: true,
          },
        },
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
