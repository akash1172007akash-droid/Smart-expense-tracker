"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { CategoryIcon } from "@/ui/CategoryIcon";
import { TransactionItem, CategoryItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from "lucide-react";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import { useToast } from "@/ui/Toast";

export function TransactionTable() {
  const { openAddModal, openEditModal, refreshKey } = useTransactionModal();
  const { success, error } = useToast();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch Categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        sortBy,
        sortOrder,
      });

      if (search) params.set("search", search);
      if (selectedType !== "ALL") params.set("type", selectedType);
      if (selectedCategory !== "ALL") params.set("categoryId", selectedCategory);
      if (selectedMethod !== "ALL") params.set("paymentMethod", selectedMethod);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, sortOrder, search, selectedType, selectedCategory, selectedMethod, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshKey]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedType("ALL");
    setSelectedCategory("ALL");
    setSelectedMethod("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedType !== "ALL") params.set("type", selectedType);
    if (selectedCategory !== "ALL") params.set("categoryId", selectedCategory);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    window.open(`/api/export/csv?${params.toString()}`, "_blank");
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
      success("Transaction Deleted", `Removed "${title}".`);
      fetchTransactions();
    } catch (err: any) {
      error("Deletion Failed", err.message);
    }
  };

  const toggleSort = (field: "date" | "amount" | "title") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Transactions</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review, filter, search, and manage your full financial transaction history ({totalCount} records).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-slate-800 hover:bg-slate-900"
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </Button>
          <Button size="sm" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 h-10 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="EXPENSE">Expenses Only (-)</option>
                <option value="INCOME">Income Only (+)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Methods</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="w-full h-10 text-xs text-slate-400 hover:text-white border border-slate-800"
              >
                <FilterX className="w-3.5 h-3.5 mr-1.5" />
                <span>Reset Filters</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th
                    onClick={() => toggleSort("title")}
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Description</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Category</th>
                  <th
                    onClick={() => toggleSort("date")}
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th
                    onClick={() => toggleSort("amount")}
                    className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No matching transactions found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="group hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{tx.title}</p>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-500 truncate max-w-sm">
                            {tx.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: tx.category?.color || "#6366f1" }}
                          >
                            <CategoryIcon
                              name={tx.category?.icon || "Tag"}
                              className="w-3.5 h-3.5"
                            />
                          </div>
                          <span className="font-medium text-slate-300">
                            {tx.category?.name || "Uncategorized"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {formatDate(tx.date, "MMM d, yyyy")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold uppercase">
                          {tx.paymentMethod.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sm">
                        <span
                          className={
                            tx.type === "INCOME" ? "text-emerald-400" : "text-white"
                          }
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id, tx.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
