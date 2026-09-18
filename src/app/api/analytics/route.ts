import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  calculateKPISummary,
  aggregateCashFlow,
  aggregateCategoryBreakdown,
  calculateSpendingTrajectory,
  calculateBudgetProgressList,
} from "@/lib/financial-engine";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  differenceInDays,
} from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "this_month";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let cashFlowMode: "monthly" | "daily" = "monthly";

    if (timeframe === "this_month") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      cashFlowMode = "daily";
    } else if (timeframe === "last_month") {
      const prev = subMonths(now, 1);
      startDate = startOfMonth(prev);
      endDate = endOfMonth(prev);
      cashFlowMode = "daily";
    } else if (timeframe === "last_3_months") {
      startDate = startOfMonth(subMonths(now, 2));
      endDate = endOfMonth(now);
      cashFlowMode = "monthly";
    } else if (timeframe === "year") {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      cashFlowMode = "monthly";
    } else if (timeframe === "custom" && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
      const dayDiff = differenceInDays(endDate, startDate);
      cashFlowMode = dayDiff <= 45 ? "daily" : "monthly";
    } else {
      // Default to 30 days
      startDate = subMonths(now, 1);
      endDate = now;
      cashFlowMode = "daily";
    }

    const daysCount = Math.max(1, differenceInDays(endDate, startDate) + 1);

    // Fetch transactions in timeframe
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Fetch budgets for the active month/year to compute trajectory & health
    const activeMonth = (timeframe === "last_month" ? subMonths(now, 1) : now).getMonth() + 1;
    const activeYear = (timeframe === "last_month" ? subMonths(now, 1) : now).getFullYear();

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        month: activeMonth,
        year: activeYear,
      },
      include: {
        category: true,
      },
    });

    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);

    // Compute KPI metrics
    const summary = calculateKPISummary(transactions, daysCount);

    // Compute Cash Flow Chart series
    const cashFlow = aggregateCashFlow(transactions, cashFlowMode);

    // Compute Expense Category Breakdown
    const categoryBreakdown = aggregateCategoryBreakdown(transactions);

    // Compute Trajectory for the active month
    const trajectory = calculateSpendingTrajectory(
      transactions,
      activeYear,
      activeMonth,
      totalBudget
    );

    // Compute Budget Health List
    const budgetHealth = calculateBudgetProgressList(budgets, transactions);

    return NextResponse.json({
      summary,
      cashFlow,
      categoryBreakdown,
      trajectory,
      budgetHealth,
      meta: {
        timeframe,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysCount,
      },
    });
  } catch (error) {
    console.error("Analytics computation error:", error);
    return NextResponse.json({ error: "Failed to compute analytics" }, { status: 500 });
  }
}
