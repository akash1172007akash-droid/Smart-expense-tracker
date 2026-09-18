import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateBudgetProgressList } from "@/lib/financial-engine";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Budget amount must be positive"),
  period: z.enum(["MONTHLY", "WEEKLY"]).default("MONTHLY"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch user budgets for this month & year
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        month,
        year,
      },
      include: {
        category: true,
      },
    });

    // Fetch expenses for this month to compute progress
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    const progressList = calculateBudgetProgressList(budgets, transactions);

    return NextResponse.json({
      budgets,
      progress: progressList,
      month,
      year,
    });
  } catch (error) {
    console.error("Fetch budgets error:", error);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = budgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { categoryId, amount, period, month, year } = parsed.data;

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: session.user.id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId,
          month,
          year,
        },
      },
      update: {
        amount,
        period,
      },
      create: {
        userId: session.user.id,
        categoryId,
        amount,
        period,
        month,
        year,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ budget }, { status: 200 });
  } catch (error) {
    console.error("Save budget error:", error);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}
