"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { TransactionItem } from "@/types";

interface TransactionModalContextType {
  isOpen: boolean;
  editingTransaction: TransactionItem | null;
  openAddModal: () => void;
  openEditModal: (transaction: TransactionItem) => void;
  closeModal: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const TransactionModalContext = createContext<TransactionModalContextType | undefined>(
  undefined
);

export function TransactionModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openAddModal = useCallback(() => {
    setEditingTransaction(null);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((tx: TransactionItem) => {
    setEditingTransaction(tx);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEditingTransaction(null);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <TransactionModalContext.Provider
      value={{
        isOpen,
        editingTransaction,
        openAddModal,
        openEditModal,
        closeModal,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </TransactionModalContext.Provider>
  );
}

export function useTransactionModal() {
  const context = useContext(TransactionModalContext);
  if (!context) {
    throw new Error(
      "useTransactionModal must be used within a TransactionModalProvider"
    );
  }
  return context;
}
