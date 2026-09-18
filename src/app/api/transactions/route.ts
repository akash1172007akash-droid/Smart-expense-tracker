import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const transactionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().or(z.date()),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "OTHER"]).default("CARD"),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const paymentMethod = searchParams.get("paymentMethod");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (type === "INCOME" || type === "EXPENSE") {
      whereClause.type = type;
    }

    if (categoryId && categoryId !== "ALL") {
      whereClause.categoryId = categoryId;
    }

    if (paymentMethod && paymentMethod !== "ALL") {
      whereClause.paymentMethod = paymentMethod;
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

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where: whereClause }),
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, amount, type, categoryId, date, paymentMethod, notes } = parsed.data;

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Selected category was not found." }, { status: 404 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        categoryId,
        title,
        amount,
        type,
        date: new Date(date),
        paymentMethod,
        notes: notes || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
