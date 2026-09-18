import { describe, it, expect } from "vitest";
import {
  calculateKPISummary,
  calculateBudgetStatus,
  calculateBudgetProgressList,
  aggregateCategoryBreakdown,
  aggregateCashFlow,
} from "@/lib/financial-engine";

describe("Financial Engine - KPI Calculations", () => {
  it("correctly calculates Total Income, Total Expense, Net Savings, and Savings Rate", () => {
    const transactions = [
      { amount: 5000, type: "INCOME", date: new Date() },
      { amount: 1500, type: "EXPENSE", date: new Date() },
      { amount: 500, type: "EXPENSE", date: new Date() },
    ];

    const result = calculateKPISummary(transactions, 30);

    expect(result.totalIncome).toBe(5000);
    expect(result.totalExpenses).toBe(2000);
    expect(result.netSavings).toBe(3000);
    // (3000 / 5000) * 100 = 60%
    expect(result.savingsRate).toBe(60);
    expect(result.dailyAverageSpend).toBeCloseTo(66.67, 1);
    expect(result.transactionCount).toBe(3);
  });

  it("handles zero income gracefully without dividing by zero", () => {
    const transactions = [
      { amount: 450, type: "EXPENSE", date: new Date() },
    ];

    const result = calculateKPISummary(transactions, 30);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(450);
    expect(result.netSavings).toBe(-450);
    expect(result.savingsRate).toBe(0);
    expect(result.dailyAverageSpend).toBe(15);
  });

  it("handles empty transactions list", () => {
    const result = calculateKPISummary([]);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.netSavings).toBe(0);
    expect(result.savingsRate).toBe(0);
    expect(result.dailyAverageSpend).toBe(0);
    expect(result.transactionCount).toBe(0);
  });
});

describe("Financial Engine - Budget Status & Warning Badges", () => {
  it("assigns NORMAL status when spend is below 80%", () => {
    // $300 of $500 = 60%
    const status = calculateBudgetStatus(300, 500);

    expect(status.percentage).toBe(60);
    expect(status.remaining).toBe(200);
    expect(status.status).toBe("NORMAL");
  });

  it("assigns WARNING status when spend is between 80% and 99.9%", () => {
    // $425 of $500 = 85%
    const status = calculateBudgetStatus(425, 500);

    expect(status.percentage).toBe(85);
    expect(status.remaining).toBe(75);
    expect(status.status).toBe("WARNING");
  });

  it("assigns OVER_BUDGET status when spend reaches or exceeds 100%", () => {
    // $550 of $500 = 110%
    const status = calculateBudgetStatus(550, 500);

    expect(status.percentage).toBe(110);
    expect(status.remaining).toBe(-50);
    expect(status.status).toBe("OVER_BUDGET");
  });

  it("handles zero allocation without dividing by zero", () => {
    const status = calculateBudgetStatus(50, 0);

    expect(status.status).toBe("OVER_BUDGET");
    expect(status.remaining).toBe(-50);
  });
});

describe("Financial Engine - Category Aggregation & Cash Flow", () => {
  it("aggregates expenses by category with accurate percentages", () => {
    const transactions = [
      {
        amount: 300,
        type: "EXPENSE",
        date: new Date(),
        categoryId: "c1",
        category: { id: "c1", name: "Groceries", color: "#f59e0b", icon: "ShoppingCart" },
      },
      {
        amount: 100,
        type: "EXPENSE",
        date: new Date(),
        categoryId: "c2",
        category: { id: "c2", name: "Dining", color: "#f97316", icon: "Utensils" },
      },
      {
        amount: 2000,
        type: "INCOME",
        date: new Date(),
        categoryId: "c3",
        category: { id: "c3", name: "Salary", color: "#10b981", icon: "Briefcase" },
      },
    ];

    const breakdown = aggregateCategoryBreakdown(transactions);

    // Total expense is 400. Groceries = 300 (75%), Dining = 100 (25%)
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].name).toBe("Groceries");
    expect(breakdown[0].amount).toBe(300);
    expect(breakdown[0].percentage).toBe(75);

    expect(breakdown[1].name).toBe("Dining");
    expect(breakdown[1].amount).toBe(100);
    expect(breakdown[1].percentage).toBe(25);
  });

  it("calculates budget progress across multiple categories", () => {
    const budgets = [
      {
        id: "b1",
        categoryId: "c1",
        amount: 500,
        month: 9,
        year: 2026,
        category: { id: "c1", name: "Groceries", color: "#f59e0b", icon: "ShoppingCart" },
      },
      {
        id: "b2",
        categoryId: "c2",
        amount: 200,
        month: 9,
        year: 2026,
        category: { id: "c2", name: "Dining", color: "#f97316", icon: "Utensils" },
      },
    ];

    const transactions = [
      { amount: 450, type: "EXPENSE", categoryId: "c1", date: new Date() }, // 90% -> WARNING
      { amount: 220, type: "EXPENSE", categoryId: "c2", date: new Date() }, // 110% -> OVER_BUDGET
    ];

    const progress = calculateBudgetProgressList(budgets, transactions);

    expect(progress[0].percentage).toBe(90);
    expect(progress[0].status).toBe("WARNING");
    expect(progress[0].remaining).toBe(50);

    expect(progress[1].percentage).toBe(110);
    expect(progress[1].status).toBe("OVER_BUDGET");
    expect(progress[1].remaining).toBe(-20);
  });
});
