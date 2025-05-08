/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "OFFICE_AGENT" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get counts based on agent's created records
    const [totalHouseholds, activeCards, expiringCards] = await Promise.all([
      // Total households created by agent
      prisma.household.count({
        where: {
          createdById: session.user.id,
        },
      }),
      // Active cards for households created by agent
      prisma.card.count({
        where: {
          status: "ACTIVE",
          household: {
            createdById: session.user.id,
          },
        },
      }),
      // Cards expiring in next 30 days for households created by agent
      prisma.card.count({
        where: {
          household: {
            createdById: session.user.id,
          },
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gt: new Date(),
          },
          status: "ACTIVE",
        },
      }),
    ]);

    // Get recent activity
    const recentActivity = await prisma.card.findMany({
      where: {
        household: {
          createdById: session.user.id,
        },
      },
      include: {
        household: {
          select: {
            headName: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Get expiring cards details
    const expiringCardsDetails = await prisma.card.findMany({
      where: {
        household: {
          createdById: session.user.id,
        },
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gt: new Date(),
        },
        status: "ACTIVE",
      },
      include: {
        household: {
          select: {
            headName: true,
            phone: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalHouseholds,
        activeCards,
        expiringCards,
      },
      recentActivity,
      expiringCardsDetails,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
