import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const DEFAULT_CATEGORIES = [
  // Income
  { name: "Salary", type: "INCOME", color: "#10b981", icon: "Briefcase", isDefault: true },
  { name: "Freelance & Consulting", type: "INCOME", color: "#06b6d4", icon: "Laptop", isDefault: true },
  { name: "Investments & Dividends", type: "INCOME", color: "#8b5cf6", icon: "TrendingUp", isDefault: true },
  // Expense
  { name: "Housing & Rent", type: "EXPENSE", color: "#6366f1", icon: "Home", isDefault: true },
  { name: "Groceries", type: "EXPENSE", color: "#f59e0b", icon: "ShoppingCart", isDefault: true },
  { name: "Dining & Food", type: "EXPENSE", color: "#f97316", icon: "Utensils", isDefault: true },
  { name: "Transportation", type: "EXPENSE", color: "#3b82f6", icon: "Car", isDefault: true },
  { name: "Utilities & Bills", type: "EXPENSE", color: "#eab308", icon: "Zap", isDefault: true },
  { name: "Entertainment & Leisure", type: "EXPENSE", color: "#ec4899", icon: "Film", isDefault: true },
  { name: "Healthcare & Fitness", type: "EXPENSE", color: "#ef4444", icon: "Activity", isDefault: true },
  { name: "Shopping & Personal", type: "EXPENSE", color: "#14b8a6", icon: "ShoppingBag", isDefault: true },
];

async function main() {
  console.log("🌱 Starting database seed...");

  const demoEmail = "demo@example.com";
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Upsert Demo User
  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash, name: "Alex Morgan" },
    create: {
      email: demoEmail,
      name: "Alex Morgan",
      passwordHash,
    },
  });

  console.log(`👤 Seeded demo user: ${user.email} (ID: ${user.id})`);

  // Clear existing transactions, budgets, categories for demo user to ensure clean seed
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });

  // Seed Categories
  const categoryMap = new Map<string, string>();
  for (const cat of DEFAULT_CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        userId: user.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        isDefault: cat.isDefault,
      },
    });
    categoryMap.set(cat.name, created.id);
  }
  console.log(`📁 Seeded ${categoryMap.size} categories`);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Seed Budgets for current and previous month
  const budgetConfigs = [
    { catName: "Housing & Rent", amount: 1800 },
    { catName: "Groceries", amount: 500 },
    { catName: "Dining & Food", amount: 300 },
    { catName: "Transportation", amount: 200 },
    { catName: "Utilities & Bills", amount: 220 },
    { catName: "Entertainment & Leisure", amount: 180 },
    { catName: "Shopping & Personal", amount: 250 },
  ];

  for (let mOffset = 0; mOffset < 3; mOffset++) {
    let m = currentMonth - mOffset;
    let y = currentYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }

    for (const b of budgetConfigs) {
      const catId = categoryMap.get(b.catName);
      if (catId) {
        await prisma.budget.create({
          data: {
            userId: user.id,
            categoryId: catId,
            amount: b.amount,
            period: "MONTHLY",
            month: m,
            year: y,
          },
        });
      }
    }
  }
  console.log("🎯 Seeded monthly budget targets");

  // Seed Transactions spanning the past 90 days
  const transactionsData: Array<{
    title: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    catName: string;
    dayOffset: number;
    paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";
    notes?: string;
  }> = [
    // Month 1 (current)
    { title: "Primary Tech Salary", amount: 5600, type: "INCOME", catName: "Salary", dayOffset: 2, paymentMethod: "BANK_TRANSFER", notes: "Direct deposit monthly payroll" },
    { title: "Apartment Monthly Rent", amount: 1750, type: "EXPENSE", catName: "Housing & Rent", dayOffset: 3, paymentMethod: "BANK_TRANSFER", notes: "Lease rent payment via portal" },
    { title: "Whole Foods Market", amount: 124.50, type: "EXPENSE", catName: "Groceries", dayOffset: 4, paymentMethod: "CARD", notes: "Weekly organic groceries & produce" },
    { title: "Electricity & Gas Bill", amount: 135.20, type: "EXPENSE", catName: "Utilities & Bills", dayOffset: 5, paymentMethod: "CARD", notes: "Monthly utility invoice" },
    { title: "Fiber Internet Service", amount: 79.99, type: "EXPENSE", catName: "Utilities & Bills", dayOffset: 6, paymentMethod: "CARD", notes: "1 Gbps symmetrical connection" },
    { title: "Freelance Mobile App UI", amount: 950, type: "INCOME", catName: "Freelance & Consulting", dayOffset: 7, paymentMethod: "BANK_TRANSFER", notes: "Milestone 2 payment from client" },
    { title: "Sushi Dinner with Colleagues", amount: 82.40, type: "EXPENSE", catName: "Dining & Food", dayOffset: 8, paymentMethod: "CARD", notes: "Omakase tasting set" },
    { title: "Trader Joe's", amount: 78.30, type: "EXPENSE", catName: "Groceries", dayOffset: 10, paymentMethod: "CARD", notes: "Snacks, frozen meals, coffee beans" },
    { title: "Gas Station Fuel", amount: 48.00, type: "EXPENSE", catName: "Transportation", dayOffset: 11, paymentMethod: "CARD", notes: "Full tank premium fuel" },
    { title: "Cinema IMAX Tickets", amount: 36.50, type: "EXPENSE", catName: "Entertainment & Leisure", dayOffset: 12, paymentMethod: "CARD", notes: "2 tickets for weekend premiere" },
    { title: "Coffee & Pastries", amount: 14.75, type: "EXPENSE", catName: "Dining & Food", dayOffset: 13, paymentMethod: "CARD", notes: "Local artisanal espresso" },
    { title: "Gym Membership & Yoga", amount: 65.00, type: "EXPENSE", catName: "Healthcare & Fitness", dayOffset: 14, paymentMethod: "CARD", notes: "Monthly recurring fitness club" },
    { title: "Index ETF Dividend", amount: 145.20, type: "INCOME", catName: "Investments & Dividends", dayOffset: 15, paymentMethod: "BANK_TRANSFER", notes: "Quarterly dividend reinvestment" },
    { title: "Online Book & Tech Gear", amount: 89.90, type: "EXPENSE", catName: "Shopping & Personal", dayOffset: 16, paymentMethod: "CARD", notes: "Ergonomic wrist rest & architecture books" },
    { title: "Farmers Market Produce", amount: 42.00, type: "EXPENSE", catName: "Groceries", dayOffset: 18, paymentMethod: "CASH", notes: "Fresh veggies and bakery bread" },
    { title: "Uber Airport Ride", amount: 38.20, type: "EXPENSE", catName: "Transportation", dayOffset: 19, paymentMethod: "CARD", notes: "Business trip airport transfer" },
    { title: "Italian Bistro", amount: 64.00, type: "EXPENSE", catName: "Dining & Food", dayOffset: 20, paymentMethod: "CARD", notes: "Pasta and wine with friends" },

    // Month 2 (-30 days)
    { title: "Primary Tech Salary", amount: 5600, type: "INCOME", catName: "Salary", dayOffset: 32, paymentMethod: "BANK_TRANSFER", notes: "Direct deposit monthly payroll" },
    { title: "Apartment Monthly Rent", amount: 1750, type: "EXPENSE", catName: "Housing & Rent", dayOffset: 33, paymentMethod: "BANK_TRANSFER" },
    { title: "Costco Bulk Groceries", amount: 215.40, type: "EXPENSE", catName: "Groceries", dayOffset: 35, paymentMethod: "CARD", notes: "Household supplies & pantry bulk" },
    { title: "Freelance Code Review", amount: 600, type: "INCOME", catName: "Freelance & Consulting", dayOffset: 37, paymentMethod: "BANK_TRANSFER" },
    { title: "Electricity & Gas Bill", amount: 142.10, type: "EXPENSE", catName: "Utilities & Bills", dayOffset: 38, paymentMethod: "CARD" },
    { title: "Fiber Internet Service", amount: 79.99, type: "EXPENSE", catName: "Utilities & Bills", dayOffset: 39, paymentMethod: "CARD" },
    { title: "Concert Live Tickets", amount: 120.00, type: "EXPENSE", catName: "Entertainment & Leisure", dayOffset: 41, paymentMethod: "CARD", notes: "Indie rock concert" },
    { title: "Casual Lunch Tacos", amount: 22.50, type: "EXPENSE", catName: "Dining & Food", dayOffset: 43, paymentMethod: "CASH" },
    { title: "Car Maintenance & Oil", amount: 89.00, type: "EXPENSE", catName: "Transportation", dayOffset: 45, paymentMethod: "CARD", notes: "Routine 10k mile maintenance" },
    { title: "Trader Joe's", amount: 92.15, type: "EXPENSE", catName: "Groceries", dayOffset: 48, paymentMethod: "CARD" },
    { title: "Sneakers & Athletic Wear", amount: 135.00, type: "EXPENSE", catName: "Shopping & Personal", dayOffset: 50, paymentMethod: "CARD" },
    { title: "High-Yield Savings Interest", amount: 85.40, type: "INCOME", catName: "Investments & Dividends", dayOffset: 52, paymentMethod: "BANK_TRANSFER" },
    { title: "Thai Takeout", amount: 34.20, type: "EXPENSE", catName: "Dining & Food", dayOffset: 55, paymentMethod: "CARD" },
    { title: "Gym Membership", amount: 65.00, type: "EXPENSE", catName: "Healthcare & Fitness", dayOffset: 56, paymentMethod: "CARD" },

    // Month 3 (-60 days)
    { title: "Primary Tech Salary", amount: 5600, type: "INCOME", catName: "Salary", dayOffset: 62, paymentMethod: "BANK_TRANSFER" },
    { title: "Apartment Monthly Rent", amount: 1750, type: "EXPENSE", catName: "Housing & Rent", dayOffset: 63, paymentMethod: "BANK_TRANSFER" },
    { title: "Freelance Web Design", amount: 1200, type: "INCOME", catName: "Freelance & Consulting", dayOffset: 65, paymentMethod: "BANK_TRANSFER" },
    { title: "Whole Foods Market", amount: 145.80, type: "EXPENSE", catName: "Groceries", dayOffset: 67, paymentMethod: "CARD" },
    { title: "Electricity & Gas Bill", amount: 128.50, type: "EXPENSE", catName: "Utilities & Bills", dayOffset: 69, paymentMethod: "CARD" },
    { title: "Streaming Services Bundle", amount: 32.97, type: "EXPENSE", catName: "Entertainment & Leisure", dayOffset: 70, paymentMethod: "CARD" },
    { title: "Special Birthday Dinner", amount: 145.00, type: "EXPENSE", catName: "Dining & Food", dayOffset: 73, paymentMethod: "CARD" },
    { title: "Pharmacy & Vitamins", amount: 48.30, type: "EXPENSE", catName: "Healthcare & Fitness", dayOffset: 75, paymentMethod: "CARD" },
    { title: "Groceries Supermarket", amount: 112.40, type: "EXPENSE", catName: "Groceries", dayOffset: 78, paymentMethod: "CARD" },
    { title: "Public Transit Pass", amount: 75.00, type: "EXPENSE", catName: "Transportation", dayOffset: 80, paymentMethod: "CARD" },
    { title: "Dividend Payout", amount: 130.00, type: "INCOME", catName: "Investments & Dividends", dayOffset: 82, paymentMethod: "BANK_TRANSFER" },
  ];

  for (const t of transactionsData) {
    const catId = categoryMap.get(t.catName);
    if (!catId) continue;

    const txDate = new Date();
    txDate.setDate(txDate.getDate() - t.dayOffset);

    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: catId,
        title: t.title,
        amount: t.amount,
        type: t.type,
        date: txDate,
        paymentMethod: t.paymentMethod,
        notes: t.notes || null,
      },
    });
  }

  console.log(`💳 Seeded ${transactionsData.length} transactions across 90 days`);
  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
