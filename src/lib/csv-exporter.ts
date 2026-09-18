import { format, parseISO } from "date-fns";

export interface CSVTransactionRecord {
  date: Date | string;
  title: string;
  type: string;
  categoryName?: string;
  amount: number;
  paymentMethod: string;
  notes?: string | null;
}

/**
 * Escapes a field for CSV according to RFC 4180:
 * - Wraps in double quotes if it contains commas, double quotes, or newlines
 * - Replaces any inner quotes with paired double quotes ("")
 */
export function escapeCSVField(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);

  // Check if quoting is needed
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a clean, standard CSV string from a collection of transaction records.
 */
export function generateTransactionsCSV(transactions: CSVTransactionRecord[]): string {
  const headers = [
    "Date",
    "Title",
    "Type",
    "Category",
    "Amount",
    "Payment Method",
    "Notes",
  ];

  const rows: string[] = [headers.join(",")];

  for (const t of transactions) {
    let formattedDate = "";
    try {
      const d = typeof t.date === "string" ? parseISO(t.date) : t.date;
      formattedDate = format(d, "yyyy-MM-dd HH:mm");
    } catch {
      formattedDate = String(t.date);
    }

    const row = [
      escapeCSVField(formattedDate),
      escapeCSVField(t.title),
      escapeCSVField(t.type),
      escapeCSVField(t.categoryName || "Uncategorized"),
      escapeCSVField(Number(t.amount || 0).toFixed(2)),
      escapeCSVField(t.paymentMethod),
      escapeCSVField(t.notes || ""),
    ];

    rows.push(row.join(","));
  }

  return rows.join("\r\n");
}

/**
 * Browser helper to trigger a file download from a CSV string.
 */
export function triggerCSVDownload(csvContent: string, fileName = "transactions-export.csv") {
  if (typeof window === "undefined") return;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
