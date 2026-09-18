import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Invalid color format").default("#6366f1"),
  icon: z.string().default("Tag"),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, type, color, icon } = parsed.data;

    // Check if category name already exists for this user and type
    const existing = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: name },
        type,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category "${name}" already exists for ${type.toLowerCase()}s.` },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name,
        type,
        color,
        icon,
        isDefault: false,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
