/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current date and last month's date
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const startOfLastMonth = startOfMonth(lastMonth);
    const endOfLastMonth = endOfMonth(lastMonth);

    // Get current counts
    const [
      totalHouseholds,
      activeCards,
      totalMembers,
      auditLogs,
      lastMonthHouseholds,
      lastMonthCards,
      lastMonthMembers,
      lastMonthAuditLogs,
    ] = await Promise.all([
      prisma.household.count(),
      prisma.card.count({ where: { status: "ACTIVE" } }),
      prisma.member.count(),
      prisma.auditLog.count(),
      prisma.household.count({
        where: {
          createdAt: {
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.card.count({
        where: {
          status: "ACTIVE",
          createdAt: {
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.member.count({
        where: {
          createdAt: {
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.auditLog.count({
        where: {
          timestamp: {
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return 100;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Get household growth data for chart
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(now, 5 - i);
      const startOfMonthDate = startOfMonth(date);
      const endOfMonthDate = endOfMonth(date);
      return {
        start: startOfMonthDate,
        end: endOfMonthDate,
        label: format(date, "MMM yyyy"),
      };
    });

    const householdChartData = await Promise.all(
      last6Months.map(async (month) => {
        const count = await prisma.household.count({
          where: {
            createdAt: {
              lte: month.end,
            },
          },
        });
        return {
          date: month.label,
          count,
        };
      })
    );

    // Get card status data for chart
    const cardChartData = await Promise.all(
      last6Months.map(async (month) => {
        const [active, expired] = await Promise.all([
          prisma.card.count({
            where: {
              status: "ACTIVE",
              createdAt: {
                lte: month.end,
              },
            },
          }),
          prisma.card.count({
            where: {
              status: "EXPIRED",
              createdAt: {
                lte: month.end,
              },
            },
          }),
        ]);
        return {
          date: month.label,
          active,
          expired,
        };
      })
    );

    // Get recent activity
    const recentActivity = await prisma.card.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
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
    });

    return NextResponse.json({
      stats: {
        totalHouseholds,
        activeCards,
        totalMembers,
        auditLogs,
        householdGrowth: calculateGrowth(totalHouseholds, lastMonthHouseholds),
        cardGrowth: calculateGrowth(activeCards, lastMonthCards),
        memberGrowth: calculateGrowth(totalMembers, lastMonthMembers),
        auditGrowth: calculateGrowth(auditLogs, lastMonthAuditLogs),
      },
      recentActivity,
      chartData: {
        households: householdChartData,
        cards: cardChartData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
