# Taxwise — Product & Development Document (v3 - CSV-First Tax Chat + Analysis MVP)

## 1. Product Overview
Taxwise is a **CSV-first tax chat assistant** for freelancers, small business owners, and individuals (primarily in Nigeria). It simplifies tax compliance by turning messy bank statements into clean, categorized tax reports via an intelligent chat interface and interactive analysis dashboards.

**Core Promise:** "Upload your statement, chat with Taxwise, and get your tax report done."

**Target Users:**
- Freelancers/Creators with multiple income sources.
- Small Business Owners (SMBs) needing basic bookkeeping.
- Employees with side hustles.

## 2. Core User Experience (The Chat + Analysis Flow)
1.  **Sign Up/Login**: User enters the app.
2.  **Land on Chat**: The primary interface is a chat window.
3.  **Upload CSV**: User uploads bank statements, POS exports, or wallet exports.
4.  **System Parsing**:
    - Auto-detects columns.
    - Asks clarification questions if ambiguous.
5.  **Categorization & Analysis**:
    - Applies user rules.
    - Uses AI to categorize unknown transactions.
    - Flags probable tax deductions.
    - **NEW**: Generates an "Analysis Session" for the upload.
6.  **Interactive Session View**:
    - User clicks into the upload session to see insights, review deductibles, and check tax estimates.
7.  **Review Loop**: User reviews low-confidence items and confirms deductions via chat or the Deductibles view.
8.  **Report Generation**: System generates a **Tax Summary** (PDF) and **Accountant Pack** (Clean CSV).

## 3. Key Features (MVP)

### A. Chat Interface (Primary UI)
- **Message Types**: Text, CSV Uploads, System Cards ("Found 1,284 rows"), Action Buttons ("View Analysis", "Generate Report").
- **Conversation Stages**: Upload -> Parse -> Categorize -> Clarify -> Report.

### B. Upload Session & Analysis (New Pages)
Each CSV upload becomes a "Report Session" with specific views:
1.  **Overview**: Total Income/Expense, Net Cashflow, Probable Deductibles, "Needs Review" count.
2.  **Analysis**:
    - **Category Breakdown**: Pie/bar chart of expenses by category.
    - **Monthly Trend**: Income vs Expense per month.
    - **Top Merchants**: Frequency and total spend by merchant.
    - **Biggest Transactions**: Largest income and expense entries.
    - **Data Quality**: Flags for duplicates, uncategorized items, mapping confidence.
3.  **Deductibles View**:
    - Tabs: Likely Deductible, Possibly Deductible (Needs Review), Personal.
    - Toggles: "Business / Mixed / Personal".
    - Summary Cards: Potential savings estimate.
4.  **Tax Report Section** (Nigeria-first):
    - **Tax Summary**: Taxable income estimate, Estimated tax range (or exact if NG pack enabled).
    - **Action Plan**: "What to do now" checklist (e.g., "Separate business account").
5.  **Exports Hub**:
    - Download Final Tax Report (PDF).
    - Download Accountant Ledger (CSV).
    - Download Category Summary (CSV).

### C. Intelligent CSV Parsing (The Engine)
- **Multi-Format Support**: Handles various Nigerian bank formats (GTB, Access, Zenith, etc.) and generic CSVs.
- **Normalization**: Converts all inputs into a standard ledger: `Date | Description | Type | Amount | Currency`.
- **Heuristics**: Auto-detects headers. Falls back to asking the user if confidence is low.

### D. Categorization Engine (Hybrid)
1.  **Rules**: "If merchant contains 'Uber', category is 'Transport'".
2.  **AI Classification**: Suggests categories for unmapped rows with confidence scores and reasoning.
3.  **User Review**: Bulk approval flow for high-confidence matches.

### E. Tax & Deduction Logic (Safe & Localized)
- **Deduction Flags**: Flags common business expenses (Internet, Rent, Tools).
- **Qualification**: Asks safe questions ("Is this strictly for business?").
- **Tax Estimation**:
    - **MVP**: Estimated Range + Scenarios (e.g., "Likely between ₦X and ₦Y").
    - **Disclaimer**: "General information, not legal advice."
    - **Country Packs**: Nigeria-first logic for currency (NGN) and tax year.

## 4. Technical Specifications

### Data Model (Supabase / Postgres)
- **`profiles`**: User settings, country (default NG), currency.
- **`uploads`**: File metadata, status, parsing profile (mapping used).
- **`transactions`**: Normalized ledger linked to `upload_id`.
- **`categories`**: Default (Country-specific) + Custom.
- **`rules`**: Matching logic for auto-categorization.
- **`reports`**: Generated PDF/CSV links.
- **`ai_audit_logs`**: Log of all AI decisions/inputs for safety.
- **`parsing_issues`**: Log of rows that failed parsing.
- **`upload_summaries`** (NEW): Pre-computed stats for the dashboard (income_total, by_category, by_month, etc.).
- **`deduction_reviews`** (NEW): User decisions on deductibility (business|mixed|personal).

### Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Shadcn/UI, Recharts (for analysis charts).
- **Backend**: Supabase (Auth, Postgres, Storage).
- **AI**: Server-side wrapper (OpenAI), Schema-validated (Zod).
- **Processing**: Next.js Route Handlers (MVP) or Supabase Edge Functions.

### Architecture Patterns
- **CSV Adapters**: Interface for `GenericAdapter` vs `BankSpecificAdapter`.
- **Country Packs**: Modular config for generic logic (Currency, Defaults, Disclaimers).
- **Session Analysis**: Compute heavy stats once after parsing/categorization and store in `upload_summaries`.

## 5. Security & Privacy
- **RLS (Row Level Security)**: Strict `user_id` isolation on all tables.
- **AI Guardrails**: AI never calculates tax rates directly; it only categorizes and summarizes DB data.
- **Disclaimer**: Always displayed on tax estimates.

## 6. Pricing Model
- **Free**: 1 Upload + Summary (No download).
- **Pay-per-report**: One-time fee for finalized report (Yearly users).
- **Pro Monthly**: Unlimited uploads + reports (Continuous users).
