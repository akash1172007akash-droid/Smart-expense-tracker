import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateTransactionsCSV } from "@/lib/csv-exporter";
import { format } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (type === "INCOME" || type === "EXPENSE") {
      whereClause.type = type;
    }

    if (categoryId && categoryId !== "ALL") {
      whereClause.categoryId = categoryId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        (whereClause.date as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (whereClause.date as Record<string, unknown>).lte = end;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const csvData = transactions.map((t) => ({
      date: t.date,
      title: t.title,
      type: t.type,
      categoryName: t.category.name,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      notes: t.notes,
    }));

    const csvContent = generateTransactionsCSV(csvData);
    const fileName = `transactions-export-${format(new Date(), "yyyyMMdd-HHmm")}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Failed to generate CSV export" }, { status: 500 });
  }
}
