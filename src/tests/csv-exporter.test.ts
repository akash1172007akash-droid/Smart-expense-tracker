import { describe, it, expect } from "vitest";
import { escapeCSVField, generateTransactionsCSV } from "@/lib/csv-exporter";

describe("CSV Exporter - RFC 4180 Escaping", () => {
  it("leaves standard text unchanged", () => {
    expect(escapeCSVField("Standard Title")).toBe("Standard Title");
    expect(escapeCSVField(120.5)).toBe("120.5");
  });

  it("quotes text containing commas", () => {
    expect(escapeCSVField("Groceries, fruit and veg")).toBe('"Groceries, fruit and veg"');
  });

  it("quotes and doubles inner quotation marks", () => {
    expect(escapeCSVField('Coffee at "The Roasted Bean"')).toBe(
      '"Coffee at ""The Roasted Bean"""'
    );
  });

  it("quotes text containing newlines", () => {
    expect(escapeCSVField("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
  });

  it("handles null and undefined gracefully", () => {
    expect(escapeCSVField(null)).toBe("");
    expect(escapeCSVField(undefined)).toBe("");
  });
});

describe("CSV Exporter - Full Dataset Generation", () => {
  it("generates formatted CSV with valid headers and escaped row content", () => {
    const records = [
      {
        date: "2026-09-18T10:00:00Z",
        title: "Whole Foods, Organic",
        type: "EXPENSE",
        categoryName: "Groceries",
        amount: 85.5,
        paymentMethod: "CARD",
        notes: 'Includes "organic" apples, milk\nand bread',
      },
    ];

    const csv = generateTransactionsCSV(records);
    const lines = csv.split("\r\n");

    expect(lines[0]).toBe("Date,Title,Type,Category,Amount,Payment Method,Notes");
    expect(lines[1]).toContain('"Whole Foods, Organic"');
    expect(lines[1]).toContain("85.50");
    expect(lines[1]).toContain('Includes ""organic"" apples');
  });
});
