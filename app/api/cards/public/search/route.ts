import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardNumber = searchParams.get("cardNumber");

    if (!cardNumber) {
      return NextResponse.json(
        { error: "Card number is required" },
        { status: 400 }
      );
    }

    // Only check if the card exists, don't return sensitive data
    const card = await prisma.card.findUnique({
      where: { cardNumber },
      select: { id: true },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Return success if card exists
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error searching for card:", error);
    return NextResponse.json(
      { error: "Failed to search for card" },
      { status: 500 }
    );
  }
}
