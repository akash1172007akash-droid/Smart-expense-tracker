import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const updateTransactionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().min(1).optional(),
  date: z.string().or(z.date()).optional(),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "OTHER"]).optional(),
  notes: z.string().max(500).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Get transaction error:", error);
    return NextResponse.json({ error: "Failed to get transaction" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Check existing transaction
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.amount !== undefined) updateData.amount = parsed.data.amount;
    if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
    if (parsed.data.categoryId !== undefined) {
      // Validate category belongs to user
      const cat = await prisma.category.findFirst({
        where: { id: parsed.data.categoryId, userId: session.user.id },
      });
      if (!cat) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      updateData.categoryId = parsed.data.categoryId;
    }
    if (parsed.data.date !== undefined) updateData.date = new Date(parsed.data.date);
    if (parsed.data.paymentMethod !== undefined) updateData.paymentMethod = parsed.data.paymentMethod;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error("Update transaction error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
