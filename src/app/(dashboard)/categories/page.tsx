"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Dialog } from "@/ui/Dialog";
import { CategoryIcon, ICON_MAP } from "@/ui/CategoryIcon";
import { Badge } from "@/ui/Badge";
import { CategoryItem } from "@/types";
import { useToast } from "@/ui/Toast";
import { Plus, Tag, Layers, Check } from "lucide-react";

const PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#f97316", // Orange
  "#ef4444", // Red
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#14b8a6", // Teal
  "#84cc16", // Lime
  "#64748b", // Slate
];

const AVAILABLE_ICONS = [
  "Tag", "Home", "ShoppingCart", "Utensils", "Car", "Zap", "Film", "Activity",
  "ShoppingBag", "Briefcase", "Laptop", "TrendingUp", "Coffee", "Plane",
  "BookOpen", "Heart", "Gift", "DollarSign", "Wallet", "CreditCard", "Building"
];

export default function CategoriesPage() {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [color, setColor] = useState(PALETTE[0]);
  const [icon, setIcon] = useState("Tag");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Name Required", "Please enter a category title.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, color, icon }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      success("Category Created", `Created "${name}" with customized theme.`);
      setName("");
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      error("Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (activeTab === "ALL") return true;
    return c.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Categories</h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize transactions with default and user-defined custom categories, colors, and icons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Custom Category</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 w-fit text-xs">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "ALL"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("EXPENSE")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "EXPENSE"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Expenses ({categories.filter((c) => c.type === "EXPENSE").length})
        </button>
        <button
          onClick={() => setActiveTab("INCOME")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "INCOME"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Income ({categories.filter((c) => c.type === "INCOME").length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <p className="text-slate-500 text-sm py-8 col-span-full">
            Loading categories...
          </p>
        ) : filteredCategories.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 col-span-full">
            No categories found in this section.
          </p>
        ) : (
          filteredCategories.map((c) => (
            <Card
              key={c.id}
              className="p-4 hover:border-slate-700/80 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                  style={{ backgroundColor: c.color }}
                >
                  <CategoryIcon name={c.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{c.name}</h4>
                  <span className="text-[11px] text-slate-400">
                    {c.type === "INCOME" ? "Income Category" : "Expense Category"}
                  </span>
                </div>
              </div>

              <div>
                {c.isDefault ? (
                  <Badge variant="outline" className="text-[10px] text-slate-400">
                    Default
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-[10px]">
                    Custom
                  </Badge>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Custom Category Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Category"
        description="Add a personalized income or expense bucket with custom icon and color theme."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  type === "EXPENSE"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  type === "INCOME"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category Name
            </label>
            <Input
              placeholder="e.g. Pet Care, SaaS Subscriptions, Side Hustle"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Choose Color Theme
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PALETTE.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setColor(p)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: p }}
                  title={p}
                >
                  {color === p && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Choose Icon
            </label>
            <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    icon === ic
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title={ic}
                >
                  <CategoryIcon name={ic} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <CategoryIcon name={icon} className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {name || "Category Preview"}
              </p>
              <p className="text-[11px] text-slate-400">
                {type === "EXPENSE" ? "Expense category" : "Income category"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Category
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
