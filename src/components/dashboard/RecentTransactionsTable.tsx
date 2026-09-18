"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { CategoryIcon } from "@/ui/CategoryIcon";
import { TransactionItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight, Edit2, Trash2 } from "lucide-react";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import { useToast } from "@/ui/Toast";

interface RecentTransactionsTableProps {
  transactions: TransactionItem[];
  onDeleteSuccess?: () => void;
}

export function RecentTransactionsTable({
  transactions,
  onDeleteSuccess,
}: RecentTransactionsTableProps) {
  const { openEditModal } = useTransactionModal();
  const { success, error } = useToast();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete transaction "${title}"?`)) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
      success("Transaction Deleted", `Removed "${title}".`);
      onDeleteSuccess?.();
    } catch (err: any) {
      error("Deletion Failed", err.message);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest logged financial transactions</CardDescription>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">
            No transactions found. Click "+ Add Transaction" above to get started!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-2.5 font-medium">Description</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium">Method</th>
                  <th className="pb-2.5 font-medium text-right">Amount</th>
                  <th className="pb-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.slice(0, 6).map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-900/50 transition-colors">
                    <td className="py-3">
                      <p className="font-semibold text-white">{tx.title}</p>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{tx.notes}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: tx.category?.color || "#6366f1" }}
                        >
                          <CategoryIcon
                            name={tx.category?.icon || "Tag"}
                            className="w-3 h-3"
                          />
                        </div>
                        <span className="text-slate-300">{tx.category?.name || "Uncategorized"}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">{formatDate(tx.date, "MMM d, yyyy")}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] uppercase font-semibold">
                        {tx.paymentMethod.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-bold ${
                          tx.type === "INCOME" ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.title)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
