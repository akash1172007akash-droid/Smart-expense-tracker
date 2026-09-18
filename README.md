# 💎 SmartSpend — Smart Expense Tracker & Financial Analytics Dashboard

A production-ready, portfolio-grade personal finance management and analytics platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **NextAuth.js**, and **Recharts**.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

---

## ✨ Features

### 🔐 1. Multi-Tenant Authentication & Session Management
- **Credentials Provider**: Secure email/password login and registration with `bcryptjs` password hashing and JWT sessions.
- **Strict Multi-Tenancy**: All transactions, categories, and budgets are strictly isolated and queried by `session.user.id`.
- **1-Click Demo Login**: Pre-seeded demo account (`demo@example.com` / `Password123!`) with 90 days of realistic transactions for immediate testing.
- **Default Category Provisioning**: New accounts automatically receive 11 standard income and expense categories upon registration.

### 📊 2. Financial Analytics & Interactive Visualizations
- **Executive KPI Cards**: Real-time calculation of Total Income, Total Expenses, Net Cash Savings, and Savings Rate (%).
- **Timeframe Selector**: Dynamically filter data across *This Month*, *Last Month*, *Last 3 Months*, *Year to Date*, or custom date ranges.
- **Cash Flow Trend**: Dual-series responsive Bar chart comparing inflows vs outflows with custom tooltips and net savings.
- **Expense Breakdown**: Interactive Donut chart displaying category percentages, custom icons, and centered total spend.
- **Spending Trajectory vs Budget Target**: Daily cumulative spending curve plotted against linear monthly budget pacing and budget ceiling.

### 💳 3. Transaction Management (Full CRUD)
- **Global Quick-Add**: Add transactions from any page using the global modal.
- **Attributes**: Title, Amount, Type (`INCOME` / `EXPENSE`), Category, Date/Time, Payment Method (`CARD`, `BANK_TRANSFER`, `CASH`, `OTHER`), and Notes.
- **Search & Filtering**: Real-time search across titles and notes, category filtering, type filtering, column sorting, and pagination.

### 🎯 4. Category Budget Engine & Smart Alerts
- Set monthly or weekly spending allowances per category.
- Dynamic progress bars with real-time percentage spent and remaining allowances.
- **3-Tier Alert Badges**:
  - 🟢 **Normal** (`< 80%`): On track.
  - 🟡 **Warning** (`80% - 99.9%`): Approaching allowance limit.
  - 🔴 **Over-Budget** (`≥ 100%`): Exceeded allowance with exact deficit badge.

### 📁 5. Custom Categories
- Create personalized income and expense categories.
- Choose from 20+ financial Lucide icons and a curated 12-color financial palette.

### 📄 6. Reporting & Exports
- **RFC 4180 CSV Export**: Download filtered transactions for spreadsheet analysis.
- **Printable Monthly Statement**: High-contrast, paper/PDF-ready financial statement with executive summaries, category performance tables, and full monthly ledger.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode, 100% type safe)
- **Styling**: Tailwind CSS v4, Lucide Icons, Glassmorphism dark theme
- **Database & ORM**: Prisma ORM with SQLite (PostgreSQL compatible)
- **Authentication**: NextAuth.js v4 with Credentials Provider & bcryptjs
- **Form Management**: React Hook Form + Zod runtime schema validation
- **Charts**: Recharts
- **Testing**: Vitest unit test suite

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (Tested on v24.x)
- **npm**: v9+

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd smart-expense-tracker
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="smart-expense-tracker-production-secret-key-2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
Push the Prisma schema to create the SQLite database and seed 90 days of demo data:
```bash
npx prisma db push
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo User** | `demo@example.com` | `Password123!` |

*(Or click the "Quick Fill" button on the login screen for instant 1-click access)*

---

## 🧪 Running Automated Tests

Run the Vitest test suite covering financial calculations, budget threshold warnings, and CSV character escaping:

```bash
npm test
```

Run TypeScript strict typecheck:
```bash
npx tsc --noEmit
```

Run production build:
```bash
npm run build
```

---

## 📄 License
MIT License. Created for portfolio demonstration.
