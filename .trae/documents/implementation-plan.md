# Taxwise Development Roadmap: Path to MVP

## 1. Executive Summary
**Current Status**: Alpha Prototype.
- **Completed**: Core backend schema, Auth, CSV parsing, basic Uploads UI.
- **Missing/Mocked**: Main Dashboard (currently fake data), End-to-End Analysis Pipeline (sync timeout risks), Rules Management UI, Report Generation (PDF/CSV), and real-time data wiring.
- **Goal**: Transition from "Static Prototype" to "Functional MVP" suitable for Beta users in Nigeria.

---

## 2. Module Breakdown & Requirements

### Module A: Core Dashboard (The "Hub")
**Status**: ❌ Scaffolded (Mock Data Only)
- **Scope**: Connect the main dashboard view to real user data (`transactions`, `upload_summaries`).
- **Key Screens**: `/dashboard`
- **Requirements**:
  - Replace hardcoded "₦2,450,000" with `SUM(transactions.amount)` where `type='income'`.
  - Show real "Total Expenses" and "Deductible Expenses".
  - **Onboarding Element**: Implement the "Zero Data State" logic (see Section 4).
- **Acceptance Criteria**:
  - Dashboard shows `0` or `Empty State` for new users.
  - Dashboard updates immediately after a file is uploaded and analyzed.
  - Charts reflect actual category distribution.

### Module B: Analysis & Processing Engine
**Status**: ⚠️ Partial / Risky (Synchronous)
- **Scope**: Robustify the analysis pipeline to handle real-world CSVs without timing out.
- **Backend Needs**:
  - Move `AnalysisEngine.runAnalysis` logic to a background job or optimize chunks.
  - Populate `upload_summaries` table after processing.
- **Acceptance Criteria**:
  - Uploading a 500-row CSV does not error out (504 Gateway Timeout).
  - "Uncategorized" transactions are clearly flagged.
  - `upload_summaries` table is populated with correct pre-computed stats.

### Module C: Rules Engine UI
**Status**: ❌ Missing
- **Scope**: Interface for users to manage auto-categorization rules to save AI costs.
- **Key Screens**: `/dashboard/settings` (or new `/dashboard/rules`)
- **Requirements**:
  - List existing rules (Keyword -> Category).
  - "Create Rule" modal: "If description contains 'Uber', set category to 'Transport' and Deductible = 'Yes'".
  - "Apply Rules" button to re-run rules on existing pending transactions.
- **Acceptance Criteria**:
  - User can create a rule.
  - Next upload respects this rule (skips AI for matches).
  - User can delete/edit rules.

### Module D: Reports & Exports
**Status**: ⚠️ Partial (Client-side calculation)
- **Scope**: Generate professional artifacts for download.
- **Key Screens**: `/dashboard/reports`
- **Requirements**:
  - **PDF Generator**: Server-side generation (using `react-pdf` or similar) creating a branded summary.
  - **CSV Export**: Route to download filtered transactions as `.csv`.
  - **Logic**: Move tax estimation logic (Nigeria rules) to a shared utility/backend function.
- **Acceptance Criteria**:
  - "Download PDF" produces a file with correct totals and disclaimer.
  - "Export CSV" produces a clean file with columns: Date, Description, Amount, Category, Deductible Status.

### Module E: Settings & Billing Foundation
**Status**: ❌ Missing
- **Scope**: User profile management and "Billing-Ready" architecture.
- **Key Screens**: `/dashboard/settings`
- **Requirements**:
  - **Profile**: Update Name, Tax Year preference.
  - **Plan Structure**: Add `plan_tier` (free/pro) column to `profiles` table (default 'free').
  - **Gating Logic**: Create a `checkFeatureAccess(feature)` hook/utility (even if all return true for now).
- **Acceptance Criteria**:
  - User can update their profile.
  - DB schema supports `plan_tier` for future billing activation.

---

## 3. Execution Batches

### Batch 1: The "Real Data" Fix (High Priority)
*Focus: Connect existing UI to the database. No more fake numbers.*
1.  **Dashboard Wiring**: Fetch real sums from `transactions` table.
2.  **Upload Summaries**: Update `AnalysisEngine` to compute and save stats to `upload_summaries` table upon completion.
3.  **Empty States**: Implement the "Upload First" dashboard state.

### Batch 2: The "Processing Power" Upgrade
*Focus: Reliability and Rules.*
1.  **Async/Optimized Analysis**: Ensure `/api/analysis/run` handles batches robustly (e.g., reduce chunk size, simple client-side polling, or background job).
2.  **Rules UI**: Build the "Manage Rules" interface.
3.  **Rule Application**: Ensure `AnalysisEngine` applies user-defined rules before calling AI.

### Batch 3: The "Deliverable" (Exports)
*Focus: Value realization for the user.*
1.  **PDF Generation**: Implement tax summary PDF download.
2.  **CSV Export**: Implement clean transaction export.
3.  **Refinement**: Polish UI, tooltips, and "Beta" labels.

---

## 4. Dashboard Improvement: The "Empty State" Experience

**Recommendation: The "Active Empty State"**

Instead of a generic banner, the Dashboard should transform entirely when there is no data. It shouldn't look like a dashboard with "0" everywhere; it should look like an onboarding step.

**Proposed UX Pattern**:
If `total_transactions === 0`:
- **Hero Section**: "Welcome to Taxwise. Let's get your finances sorted."
- **Central Action Card**: Large, friendly dropzone/button: "Upload your first Bank Statement".
- **Value Props Below**: 3 simple icons: "We analyze your spending" -> "We find tax deductibles" -> "You get a ready-to-file report".
- **Demo Mode**: A small "Load Sample Data" link to let them see what a populated dashboard looks like (optional but high conversion).

**Why this is best**: It removes the "Cold Start" problem where a dashboard feels broken. It focuses 100% of the user's attention on the *one* action that matters: Uploading.

---

## 5. Compliance, Privacy & Legal (Nigeria-First)

### A. Required Legal Pages
*To be linked in Footer and Sign-up flows.*

1.  **Terms of Service (ToS)**
    - **Key Clause**: "Taxwise is a software tool, not a tax advisor."
    - **Liability**: Limitation of liability for tax penalties (user is responsible for final filing).
    - **Usage**: Acceptable use policy (no illegal transaction tracking).

2.  **Privacy Policy (NDPR Compliant)**
    - **Data Collection**: Explicitly state we collect financial transaction data.
    - **Purpose**: "To provide categorization and tax estimation services."
    - **Third Parties**: Disclosure of AI processing (OpenAI) – "Data is processed by AI partners but not used to train their public models" (Enterprise/Zero-retention APIs preferred).
    - **User Rights**: Right to request data deletion (GDPR/NDPR).

### B. Security & Architecture Commitments
1.  **Row Level Security (RLS)**: Already implemented. Ensures users can strictly access ONLY their own data.
2.  **Encryption**:
    - **At Rest**: PostgreSQL (Supabase) encryption.
    - **In Transit**: TLS 1.2+ for all API calls.
3.  **Data Minimization**:
    - We only store what is uploaded.
    - Allow users to "Delete Upload" which cascades and hard-deletes all associated transactions.
4.  **Audit Logs**:
    - `ai_audit_logs` table (already exists) tracks AI modifications.
    - Add `access_logs` for sensitive actions (exports, profile changes).

### C. User Consent Flow
1.  **Sign-Up Checkbox**: "I agree to the Terms & Privacy Policy."
2.  **Upload Consent**: Small text near Upload button: "By uploading, you allow Taxwise to process this data using automated analysis tools."

### D. Incident Response (Basic)
- **Plan**: If a data leak is suspected:
    1.  Rotate Supabase Service Role keys immediately.
    2.  Notify affected users within 72 hours (NDPR requirement).
    3.  Shut down the dashboard access temporarily.

---

## 6. Approval & Next Steps

This document serves as the master plan for the Beta release.

**Decision Required**:
- Do you approve this roadmap and the "Active Empty State" UX approach?
- Shall we begin with **Batch 1 (Real Data Wiring)**?
