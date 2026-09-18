"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/ui/Dialog";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Textarea } from "@/ui/Select";
import { CategoryIcon } from "@/ui/CategoryIcon";
import { useToast } from "@/ui/Toast";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import { CategoryItem } from "@/types";
import { format } from "date-fns";

const transactionFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  amount: z.coerce.number().positive("Amount must be greater than $0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Please choose a category"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "OTHER"]),
  notes: z.string().max(500).optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

export function TransactionModal() {
  const { isOpen, editingTransaction, closeModal, triggerRefresh } = useTransactionModal();
  const { success, error } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema) as any,
    defaultValues: {
      title: "",
      amount: "" as any,
      type: "EXPENSE",
      categoryId: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      paymentMethod: "CARD",
      notes: "",
    },
  });

  const selectedType = watch("type");

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) {
            setCategories(data.categories);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // Populate form if editing
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        let dateVal = "";
        try {
          dateVal = format(new Date(editingTransaction.date), "yyyy-MM-dd'T'HH:mm");
        } catch {
          dateVal = format(new Date(), "yyyy-MM-dd'T'HH:mm");
        }

        reset({
          title: editingTransaction.title,
          amount: editingTransaction.amount,
          type: editingTransaction.type,
          categoryId: editingTransaction.categoryId,
          date: dateVal,
          paymentMethod: editingTransaction.paymentMethod,
          notes: editingTransaction.notes || "",
        });
      } else {
        reset({
          title: "",
          amount: "" as any,
          type: "EXPENSE",
          categoryId: "",
          date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          paymentMethod: "CARD",
          notes: "",
        });
      }
    }
  }, [isOpen, editingTransaction, reset]);

  // Filter categories by selected type
  const availableCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = (data: TransactionFormData) => {
    startTransition(async () => {
      try {
        const url = editingTransaction
          ? `/api/transactions/${editingTransaction.id}`
          : "/api/transactions";
        const method = editingTransaction ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to save transaction");
        }

        success(
          editingTransaction ? "Transaction Updated" : "Transaction Created",
          `Successfully saved "${data.title}" for $${Number(data.amount).toFixed(2)}.`
        );

        triggerRefresh();
        closeModal();
      } catch (err: any) {
        error("Action Failed", err.message || "Something went wrong.");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={closeModal}
      title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
      description={
        editingTransaction
          ? "Update details for this financial record."
          : "Record an income or expense transaction to update your budget in real time."
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-slate-200">
        {/* Type Toggle: Expense vs Income */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setValue("type", "EXPENSE");
                setValue("categoryId", "");
              }}
              className={`py-2 text-sm font-medium rounded-lg transition-all ${
                selectedType === "EXPENSE"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("type", "INCOME");
                setValue("categoryId", "");
              }}
              className={`py-2 text-sm font-medium rounded-lg transition-all ${
                selectedType === "INCOME"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Title / Description
          </label>
          <Input
            placeholder="e.g. Whole Foods Groceries, Tech Salary..."
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        {/* Amount & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amount ($ USD)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
              error={errors.amount?.message}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Payment Method
            </label>
            <Select {...register("paymentMethod")} error={errors.paymentMethod?.message}>
              <option value="CARD">Credit / Debit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category
            </label>
            <Select {...register("categoryId")} error={errors.categoryId?.message}>
              <option value="">Select a category</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Date & Time
            </label>
            <Input
              type="datetime-local"
              {...register("date")}
              error={errors.date?.message}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Notes (Optional)
          </label>
          <Textarea
            placeholder="Additional details, memo or tax deduction tags..."
            {...register("notes")}
            error={errors.notes?.message}
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={closeModal}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            {editingTransaction ? "Save Changes" : "Create Transaction"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
