import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const DEFAULT_CATEGORIES = [
  // Income
  { name: "Salary", type: "INCOME", color: "#10b981", icon: "Briefcase" },
  { name: "Freelance & Consulting", type: "INCOME", color: "#06b6d4", icon: "Laptop" },
  { name: "Investments & Dividends", type: "INCOME", color: "#8b5cf6", icon: "TrendingUp" },
  // Expense
  { name: "Housing & Rent", type: "EXPENSE", color: "#6366f1", icon: "Home" },
  { name: "Groceries", type: "EXPENSE", color: "#f59e0b", icon: "ShoppingCart" },
  { name: "Dining & Food", type: "EXPENSE", color: "#f97316", icon: "Utensils" },
  { name: "Transportation", type: "EXPENSE", color: "#3b82f6", icon: "Car" },
  { name: "Utilities & Bills", type: "EXPENSE", color: "#eab308", icon: "Zap" },
  { name: "Entertainment & Leisure", type: "EXPENSE", color: "#ec4899", icon: "Film" },
  { name: "Healthcare & Fitness", type: "EXPENSE", color: "#ef4444", icon: "Activity" },
  { name: "Shopping & Personal", type: "EXPENSE", color: "#14b8a6", icon: "ShoppingBag" },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
      },
    });

    // Auto-seed default categories for the new user
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.create({
        data: {
          userId: newUser.id,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon,
          isDefault: true,
        },
      });
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
