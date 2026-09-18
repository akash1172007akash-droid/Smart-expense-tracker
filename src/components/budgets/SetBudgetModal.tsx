"use client";

import React, { useState } from "react";
import { Dialog } from "@/ui/Dialog";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { useToast } from "@/ui/Toast";
import { CategoryItem } from "@/types";

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  currentMonth: number;
  currentYear: number;
  onSuccess: () => void;
  initialCategoryId?: string;
  initialAmount?: number;
}

export function SetBudgetModal({
  isOpen,
  onClose,
  categories,
  currentMonth,
  currentYear,
  onSuccess,
  initialCategoryId = "",
  initialAmount,
}: SetBudgetModalProps) {
  const { success, error } = useToast();
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only expense categories
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      error("Selection Required", "Please select a category.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      error("Invalid Amount", "Please enter a valid budget amount greater than $0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          amount: numAmount,
          period: "MONTHLY",
          month: currentMonth,
          year: currentYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set budget");

      success("Budget Updated", `Target set to $${numAmount.toFixed(2)}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error("Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Set Category Budget Target"
      description="Define a monthly spending ceiling for a specific category to receive warning badges."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Category
          </label>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Choose expense category</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Monthly Allowance ($ USD)
          </label>
          <Input
            type="number"
            step="10"
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Budget
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
