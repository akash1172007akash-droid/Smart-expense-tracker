import {
  FinancialKPISummary,
  BudgetStatus,
  BudgetProgress,
  CashFlowPoint,
  CategoryBreakdownPoint,
  SpendingTrajectoryPoint,
} from "@/types";
import { format, getDaysInMonth, parseISO } from "date-fns";

export interface TransactionComputationInput {
  id?: string;
  amount: number;
  type: string;
  date: Date | string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
}

export interface BudgetComputationInput {
  id: string;
  categoryId: string;
  amount: number;
  period?: string;
  month: number;
  year: number;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

/**
 * Computes core financial KPIs: Total Income, Total Expenses, Net Savings, and Savings Rate.
 */
export function calculateKPISummary(
  transactions: TransactionComputationInput[],
  daysInPeriod = 30
): FinancialKPISummary {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (t.type === "INCOME") {
      totalIncome += amt;
    } else if (t.type === "EXPENSE") {
      totalExpenses += amt;
    }
  }

  // Round to 2 decimal places to avoid IEEE-754 precision issues
  totalIncome = Math.round(totalIncome * 100) / 100;
  totalExpenses = Math.round(totalExpenses * 100) / 100;

  const netSavings = Math.round((totalIncome - totalExpenses) * 100) / 100;

  let savingsRate = 0;
  if (totalIncome > 0) {
    savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10;
  }

  const effectiveDays = Math.max(1, daysInPeriod);
  const dailyAverageSpend = Math.round((totalExpenses / effectiveDays) * 100) / 100;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    dailyAverageSpend,
    transactionCount: transactions.length,
  };
}

/**
 * Calculates budget health, percentage spent, remaining funds, and alert status.
 */
export function calculateBudgetStatus(
  spent: number,
  allocated: number
): { percentage: number; remaining: number; status: BudgetStatus } {
  const safeSpent = Math.max(0, spent);
  const safeAllocated = Math.max(0, allocated);

  if (safeAllocated === 0) {
    return {
      percentage: safeSpent > 0 ? 100 : 0,
      remaining: -safeSpent,
      status: safeSpent > 0 ? "OVER_BUDGET" : "NORMAL",
    };
  }

  const rawPercentage = (safeSpent / safeAllocated) * 100;
  const percentage = Math.round(rawPercentage * 10) / 10;
  const remaining = Math.round((safeAllocated - safeSpent) * 100) / 100;

  let status: BudgetStatus = "NORMAL";
  if (percentage >= 100) {
    status = "OVER_BUDGET";
  } else if (percentage >= 80) {
    status = "WARNING";
  }

  return { percentage, remaining, status };
}

/**
 * Computes category budget progress for a list of defined budgets against actual transactions.
 */
export function calculateBudgetProgressList(
  budgets: BudgetComputationInput[],
  transactions: TransactionComputationInput[]
): BudgetProgress[] {
  // Aggregate expenses per category
  const expenseByCategory = new Map<string, number>();

  for (const t of transactions) {
    if (t.type === "EXPENSE" && t.categoryId) {
      const current = expenseByCategory.get(t.categoryId) || 0;
      expenseByCategory.set(t.categoryId, current + (Number(t.amount) || 0));
    }
  }

  return budgets.map((b) => {
    const spent = Math.round((expenseByCategory.get(b.categoryId) || 0) * 100) / 100;
    const { percentage, remaining, status } = calculateBudgetStatus(spent, b.amount);

    return {
      budgetId: b.id,
      categoryId: b.categoryId,
      categoryName: b.category.name,
      categoryColor: b.category.color,
      categoryIcon: b.category.icon,
      allocated: b.amount,
      spent,
      remaining,
      percentage,
      status,
      period: (b.period as "MONTHLY" | "WEEKLY") || "MONTHLY",
      month: b.month,
      year: b.year,
    };
  });
}

/**
 * Groups transactions into time buckets (by day or month) for Cash Flow charts.
 */
export function aggregateCashFlow(
  transactions: TransactionComputationInput[],
  mode: "monthly" | "daily" = "monthly"
): CashFlowPoint[] {
  const map = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const dateObj = typeof t.date === "string" ? parseISO(t.date) : t.date;
    const key =
      mode === "daily" ? format(dateObj, "yyyy-MM-dd") : format(dateObj, "yyyy-MM");

    if (!map.has(key)) {
      map.set(key, { income: 0, expense: 0 });
    }

    const bucket = map.get(key)!;
    const amt = Number(t.amount) || 0;
    if (t.type === "INCOME") {
      bucket.income += amt;
    } else {
      bucket.expense += amt;
    }
  }

  // Sort chronologically
  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map((key) => {
    const bucket = map.get(key)!;
    const income = Math.round(bucket.income * 100) / 100;
    const expense = Math.round(bucket.expense * 100) / 100;
    const net = Math.round((income - expense) * 100) / 100;

    let displayLabel = key;
    try {
      if (mode === "monthly") {
        const [y, m] = key.split("-");
        const d = new Date(parseInt(y), parseInt(m) - 1, 1);
        displayLabel = format(d, "MMM yyyy");
      } else {
        const [y, m, day] = key.split("-");
        const d = new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
        displayLabel = format(d, "MMM d");
      }
    } catch {
      displayLabel = key;
    }

    return {
      date: displayLabel,
      income,
      expense,
      net,
    };
  });
}

/**
 * Aggregates expenses by category for Donut/Pie charts.
 */
export function aggregateCategoryBreakdown(
  transactions: TransactionComputationInput[]
): CategoryBreakdownPoint[] {
  const map = new Map<
    string,
    { name: string; color: string; icon: string; amount: number }
  >();

  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;

    const catId = t.categoryId || "uncategorized";
    const catName = t.category?.name || "Uncategorized";
    const catColor = t.category?.color || "#94a3b8";
    const catIcon = t.category?.icon || "Tag";
    const amt = Number(t.amount) || 0;

    totalExpenses += amt;

    if (!map.has(catId)) {
      map.set(catId, { name: catName, color: catColor, icon: catIcon, amount: 0 });
    }

    map.get(catId)!.amount += amt;
  }

  const results: CategoryBreakdownPoint[] = [];

  map.forEach((item, catId) => {
    const roundedAmount = Math.round(item.amount * 100) / 100;
    const percentage =
      totalExpenses > 0
        ? Math.round((roundedAmount / totalExpenses) * 1000) / 10
        : 0;

    results.push({
      categoryId: catId,
      name: item.name,
      color: item.color,
      icon: item.icon,
      amount: roundedAmount,
      percentage,
    });
  });

  // Sort descending by amount
  return results.sort((a, b) => b.amount - a.amount);
}

/**
 * Computes day-by-day cumulative spending trajectory for a given month vs the budget ceiling.
 */
export function calculateSpendingTrajectory(
  transactions: TransactionComputationInput[],
  year: number,
  month: number, // 1-12
  totalBudget: number
): SpendingTrajectoryPoint[] {
  const daysCount = getDaysInMonth(new Date(year, month - 1, 1));
  const dailySpends = new Array<number>(daysCount + 1).fill(0);

  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    const d = typeof t.date === "string" ? parseISO(t.date) : t.date;
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      const day = d.getDate();
      if (day >= 1 && day <= daysCount) {
        dailySpends[day] += Number(t.amount) || 0;
      }
    }
  }

  let cumulative = 0;
  const points: SpendingTrajectoryPoint[] = [];
  const dailyTargetPace = totalBudget > 0 ? totalBudget / daysCount : 0;

  const today = new Date();
  const isCurrentMonthAndYear =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const maxDayToChart = isCurrentMonthAndYear ? today.getDate() : daysCount;

  for (let day = 1; day <= daysCount; day++) {
    if (day <= maxDayToChart) {
      cumulative += dailySpends[day];
    }

    const d = new Date(year, month - 1, day);
    points.push({
      day,
      dateStr: format(d, "MMM d"),
      actualCumulativeSpend:
        day <= maxDayToChart ? Math.round(cumulative * 100) / 100 : Math.round(cumulative * 100) / 100,
      budgetCap: Math.round(totalBudget * 100) / 100,
      linearPaceTarget: Math.round(dailyTargetPace * day * 100) / 100,
    });
  }

  return points;
}
